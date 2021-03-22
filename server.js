const puppeteer = require("puppeteer");
const url = "https://web.whatsapp.com";
const urlApi = "http://localhost/WappSender/";
const fetch = require("node-fetch");
var browser;
var page;
init();

async function init() {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector("div._2_1wd.copyable-text.selectable-text");

    //CONECTAR
    var response = await fetch(urlApi, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: "data=" + JSON.stringify({ reason: "connect" })
    });
    let data = await response.text();
    console.log(data + " " + (new Date()));

    //CHECKEAR
    while (true) {
        response = await fetch(urlApi, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: "data=" + JSON.stringify({ reason: "check" })
        });
        let data = await response.text();
        console.log("Checked: " + (new Date()));

        if (data.lenght != 0) {
            var notification = JSON.parse(data);
            if(notification != null)
            {
                for (let i = 0; notification[i] != undefined; i++) {
                    await scrape(notification[i].number, notification[i].message);
                }
            }
        }
        else {
            console.log('Error! pending_notifications.json is empty. Write "[]" to the file and restart the server.');
            stop();
        }
        await delay(3000);//Recomiendo 10s para arriba
    }

}

async function delay(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

async function scrape(numero, mensaje) {
    console.log('Sending notification: ' + numero + " | " + mensaje);
    //BUSCAR NUMERO
    const inpSearch = await page.$("div._2_1wd.copyable-text.selectable-text");
    await inpSearch.type(numero);

    try {
        //SELECCIONAR CONTACTO
        await page.waitForSelector("span [title='" + numero + "']");
        const target = await page.$("span [title='" + numero + "']");
        await target.click();
        //BUSCAR BARRA PARA ESCRIBIR
        const inp = await page.$(
            //PUEDE VARIAR ALGUNAS VECES. REVISAR EN CASO DE FALLO
            "#main > footer > div.vR1LG._3wXwX.copyable-area > div._2A8P4 > div._1JAUF._2x4bz > div._2_1wd.copyable-text.selectable-text"
        );

        //ESCRIBIR Y ENVIAR
        if (inp == undefined) {
            console.log("Error! no se encontro la barra para escribir.");
        }
        else {
            await inp.type(mensaje);
            await page.keyboard.press("Enter");
        }
    } catch (error) {
        console.log(error);
        await page.waitForSelector("#side > div.SgIJV > div._3LX7r._1brJQ > span > button._1QWS8");
        const deleteBtn = await page.$("#side > div.SgIJV > div._3LX7r._1brJQ > span > button._1QWS8");
        deleteBtn.click();
        
    }
    //ELIMINAR NOTIFICACION UNA VEZ ENVIADA O EN CASO DE FALLO
    await fetch(urlApi, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: "data=" + JSON.stringify({ reason: "remove", notification: { number: numero } })
    });


}
