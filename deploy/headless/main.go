package main

import (
	"fmt"

	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/launcher"
)

func main() {
	wsURL, _ := launcher.ResolveURL("127.0.0.1:9222")
	fmt.Println(wsURL)
	browser := rod.New().ControlURL(wsURL).MustConnect()

	page := browser.MustPage("https://www.baidu.com/")
	fmt.Println("wait")
	page.WaitLoad()
	fmt.Println("loaded")
	page.MustPDF("my.pdf") //样式可能会丢失
	// page.MustScreenshot("a.png") //时好时坏
	fmt.Println("shot")
	if page.MustHas("#s_sync_data") {
		fmt.Println("has")
	} else {
		fmt.Println("no exist")
	}
}
