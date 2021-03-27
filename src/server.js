const puppeteer = require('puppeteer-core');
const findChrome = require('./util/find_chrome')

const Server = function (port, maxRequestNumber) {
    const defaultArgs = [
        '-no-sandbox',
        '-no-zygote',
        '-disable-extensions',
        '--disable-gpu',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process'
    ];

    const defaultPort = 9222;
    const defaultMaxRequestNumber = 1024;

    this.port = port || defaultPort;
    this.maxRequestNumber = maxRequestNumber || defaultMaxRequestNumber;

    this.historyCreatedPageNumber = 0;
    this.openingPageNumber = 0;
    this.isStarting = false;
    
    this.browser = undefined;
    this.args = undefined;

    this.setArgs = function (args) {
        this.args = args;
    }

    this.start = async function () {
        args = this.args || defaultArgs;
        args.push('--remote-debugging-port=' + this.port)

        const findChromePath = await findChrome({})
        const executablePath = findChromePath.executablePath;
        this.browser = await puppeteer.launch({
            executablePath,
            args: args || defaultArgs,
        });

        this.isStarting = false;

        //当目标被创建时被触发，例如当通过 window.open 或 browser.newPage 打开一个新的页面。
        //每次goto会调用两次
        this.browser.on('targetcreated', (target) => {
            this.historyCreatedPageNumber++
            this.openingPageNumber++
        })
        //当目标被销毁时被触发，例如当一个页面被关闭时。
        this.browser.on('targetdestroyed', (target) => {
            this.openingPageNumber --
            this.whetherRestart()
        })
        //当 Puppeteer 从 Chromium 实例断开连接时被触发。
        //原因可能如下：
        // Chromium 关闭或崩溃
        // 调用browser.disconnect 方法
        this.browser.on('disconnected', (target) => {
            this.restart()
        })
        //url改变
        this.browser.on('targetchanged', (target) => {
            console.log('targetchanged')
        })
    }

    this.whetherRestart = function () {
        if (this.historyCreatedPageNumber >= this.maxRequestNumber) {
            this.restart()
        }
    }

    this.restart = function () {
        /**
         * 有可能出现，一直都有请求导致没办法重启的情况发生
         * 可以采用的方案是强制重启，部分链接失败
         */
        if(this.isStarting || this.openingPageNumber > 0){
           return
        }
        this.browser.close()
        this.isStarting = true;
        this.historyCreatedPageNumber = 0
        this.start()
    }

    this.exit = function(){
        if(!this.browser){
            return 
        }
        this.browser.close()
        this.browser = undefined;
    }
}

const server = new Server()

// // 退出时结束浏览器，防止内存泄漏
// process.on('exit', () => {
//     server.exit()
// })
  

server.start()