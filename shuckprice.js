const { clientID,clientSecret, redirectURL, refreshToken, user, pass, targetUser } = require('./userInfo.json')
const express = require("express")
const pup = require("puppeteer")
const nodemailer = require("nodemailer")
const { google } = require('googleapis');

const app = express()
const port = 3000


var date = new Date()
const authClient = new google.auth.OAuth2(clientID, clientSecret, redirectURL);
authClient.setCredentials({ refresh_token: refreshToken});

var currPrice = "N/A"
const url = 'https://www.bestbuy.com/site/wd-easystore-14tb-external-usb-3-0-hard-drive-black/6425303.p?skuId=6425303&ref=212&loc=1&extStoreId=146&ref=212&loc=1&gclid=Cj0KCQjwspKUBhCvARIsAB2IYut7vr0Z8a2uj10NLlCJ6x61GrEZe7rwQOBTzRVg2_VeVt3KPTh9SnMaAg8hEALw_wcB&gclsrc=aw.ds'


async function scrape(url) {
    const browser = await pup.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
    await page.goto(url);

    await page.waitForXPath('/html/body/div[3]/main/div[2]/div[3]/div[2]/div/div/div[1]/div/div/div/div/div[1]/div[1]/div[1]/div/span[1]');
    let elHandle = await page.$x('/html/body/div[3]/main/div[2]/div[3]/div[2]/div/div/div[1]/div/div/div/div/div[1]/div[1]/div[1]/div/span[1]');

    let price = await page.evaluate(el => el.textContent, elHandle[0]);
    console.log('Price: ', price);

    await browser.close();
    currPrice = price
    date = new Date()

    if(currPrice !== "N/A")
        sendMail()

}

const sendMail = async () => {
    let accessToken = await authClient.getAccessToken()
    console.log(accessToken);
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: user, // generated ethereal user
            pass: pass, // generated ethereal password
            clientId: clientID,
            clientSecret: clientSecret,
            refreshToken: refreshToken,
            accessToken: accessToken
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: user, // sender address
        to: targetUser, // list of receivers
        subject: "SHUCK Price DateTime: "+ new Date(), // Subject line
        text: "Hello world?", // plain text body
        html: "<b>New Price: " + currPrice + ' </b><br><a href="'+ url + '">WD Easystore 14TB - BestBuy</a>', // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

scrape(url)

setInterval( () => (scrape(url).catch(console.log('error cuaght'))), 300 * 1000) 

app.get('/', async (req, res) => {
    res.send({price: currPrice, date: date })
})

app.listen(port, () => {
    console.log('Listening on port ', port)
})

app.post('/', (req, res) => {
    sendMail().catch(console.error)
    res.send('Email sent!')
})
