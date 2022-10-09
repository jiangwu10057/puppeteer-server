# puppeteer-server
puppeteer-server

# 目的
在Docker中启动一个Chrome Headless浏览器实例，用于提供网页截图、生成PDF或前端自动化测试用！


# 问题
在遇到页面中有请求失败的情况会导致页面打印pdf失败
# 使用方法

## 安装

```bash
docker-compose up
```

## 启动
```bash
npm run start
```

# 替代方案
## golang
- https://github.com/chromedp/chromedp
- https://github.com/go-rod/rod

# 无头浏览器
docker run -d -p 9222:9222 --rm --name headless-shell --shm-size 2G chromedp/headless-shell