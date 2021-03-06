const Koa = require('koa')
const koaBody = require('koa-body')()
const router = require('koa-router')()
const cors = require('koa2-cors')({
    origin: function (ctx) { //设置允许来自指定域名请求
        return '*'; // 允许来自所有域名请求
    },
    maxAge: 5, //指定本次预检请求的有效期，单位为秒。
    credentials: true, //是否允许发送Cookie
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization']
})

const puppeteer = require('puppeteer-core');
let request = require('request-promise-native');

router.get('/pdf/create/download', async (ctx, next) => {
    const { url, name } = ctx.request.query
    const pdfBuffer = await createPdfBuffer(decodeURIComponent(url))
    let filename = decodeURIComponent(name)

    ctx.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename="${filename}.pdf"`,
        'Content-Length': `${pdfBuffer.length}`
    })
    ctx.body = pdfBuffer
})

const app = new Koa()
app.use(koaBody)
app.use(cors)
app.use(router.routes())

app.listen(80, () => {
    console.log(`server is started at 80`)
})

async function createPdfBuffer(url) {
    let version = await request({
        uri: "http://127.0.0.1:9222/json/version",
        json: true
    });

    let browser = await puppeteer.connect({
        browserWSEndpoint: version.webSocketDebuggerUrl
    });

    const page = await browser.newPage();
    await page.emulateMediaType('screen')
    await page.setCacheEnabled(false)
    await page.goto(url, {
        waitUntil: 'networkidle2',
    })

    const title = await page.title()

    const pdf = await page.pdf({
        displayHeaderFooter: true,
        format: 'A4',
        headerTemplate: '<div style="width:80%;font-size:8px;display: flex; justify-content: center;"><span>' + title + '</span></div>',
        footerTemplate: `<div style="width:80%; margin:0 auto;font-size:8px;display:flex; justify-content: space-between; "><span>生成日期:<span class="date"></span></span><div><span class="pageNumber"></span> / <span class="totalPages"></span></div></div>`,
        scale: 1,
        margin: {
            top: '1.27cm',
            right: '1.27cm',
            bottom: '1.17cm',
            left: '1.27cm',
        }
    });
    await page.close();

    await browser.disconnect();

    return pdf;
}