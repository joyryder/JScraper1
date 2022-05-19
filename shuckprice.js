const pup = require("puppeteer")

async function scrape(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
    await page.goto(url);

    await page.waitForXPath('/html/body/div[3]/main/div[2]/div[3]/div[2]/div/div/div[1]/div/div/div/div/div/div[1]/div[1]/div[1]/div/span[1]');
    let elHandle = await page.$x('/html/body/div[3]/main/div[2]/div[3]/div[2]/div/div/div[1]/div/div/div/div/div/div[1]/div[1]/div[1]/div/span[1]');

    let price = await page.evaluate(el => el.textContent, elHandle[0]);
    console.log('Price: ', price);

    await browser.close();
}

const puppeteer = require('puppeteer');

scrape('https://www.bestbuy.com/site/wd-easystore-14tb-external-usb-3-0-hard-drive-black/6425303.p?skuId=6425303&ref=212&loc=1&extStoreId=146&ref=212&loc=1&gclid=Cj0KCQjwspKUBhCvARIsAB2IYut7vr0Z8a2uj10NLlCJ6x61GrEZe7rwQOBTzRVg2_VeVt3KPTh9SnMaAg8hEALw_wcB&gclsrc=aw.ds');
