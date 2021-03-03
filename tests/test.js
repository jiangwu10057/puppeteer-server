const puppeteer = require('puppeteer-core');
let request = require('request-promise-native');

//使用 puppeteer.connect 连接一个已经存在的 Chrome 实例
// 目前测试时间3～5秒
(async () => {
    //通过 9222 端口的 http 接口获取对应的 websocketUrl
    let version = await request({
        uri: "http://127.0.0.1:9222/json/version",
        json: true
    });
    //直接连接已经存在的 Chrome
    let browser = await puppeteer.connect({
        browserWSEndpoint: version.webSocketDebuggerUrl
    });
    const page = await browser.newPage();
    await page.emulateMediaType('screen')
    await page.setCacheEnabled(false)
    // await page.setViewport({
    //     width: 800,
    //     height: 1000,
    //     deviceScaleFactor: 1,
    // });
    await page.goto('http://10.0.0.3:8080/', {
        waitUntil: 'networkidle2',
    })

    let title = await page.title()

    let path = new Date().getTime() + ".pdf"
    await page.pdf({
        path: path, 
        displayHeaderFooter: true,
        format: 'A4',
        headerTemplate: '<div style="width:80%;font-size:8px;display: flex; justify-content: center;"><span>'+title+'</span></div>',
        footerTemplate: `<div style="width:80%; margin:0 auto;font-size:8px;display:flex; justify-content: space-between; "><span>生成日期:<span class="date"></span></span><div><span class="pageNumber"></span> / <span class="totalPages"></span></div></div>`,
        scale:1,
        margin: {
            top: '1.27cm',
            right: '1.27cm',
            bottom: '1.17cm',
            left: '1.27cm',
        }
    });
    await page.close();

    await browser.disconnect();
})();
