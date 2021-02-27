const puppeteer = require('puppeteer');
let request = require('request-promise-native');

//使用 puppeteer.connect 连接一个已经存在的 Chrome 实例
// 目前测试时间3～5秒
(async () => {
    //通过 9222 端口的 http 接口获取对应的 websocketUrl
    let version = await request({
        uri:  "http://127.0.0.1:9222/json/version",
        json: true
    });
    //直接连接已经存在的 Chrome
    let browser = await puppeteer.connect({
        browserWSEndpoint: version.webSocketDebuggerUrl
    });
    const page = await browser.newPage();
    await page.goto('https://www.baidu.com', {
        waitUntil: 'networkidle2',
    });
    let path = new Date().getTime() + ".pdf"
    await page.pdf({ path: path, format: 'a4' });
    await page.close();

    await browser.disconnect();
})();
