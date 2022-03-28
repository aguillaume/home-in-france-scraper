
import * as propertiesRepo from "../PropertiesRepo.js"
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

// URL for data
const baseUrl = "https://www.bienici.com";
const url = baseUrl+"/recherche/achat/dessin-623b32310dbe7e00b77e96ab/maisonvilla?prix-max=500000&surface-min=80&camera=11_5.1052764_43.4244043_0.9_0";
const dataFileName = "bienIciProperties";

async function scrapeData() {
    const browser = await puppeteer.launch() // await puppeteer.connect({ browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}` });

    const page = await browser.newPage();
    await page.goto(url, {waitUntil: "load"});
    let rawPages = [];
    rawPages.push(await page.content());
    
    while(true) {
        let currentPage = await page.$(".pagination .currentPage");
        let nextPage = await page.evaluateHandle(el => el.nextElementSibling, currentPage);
        if(nextPage._page) {
            
        }

    }

    let nextPage2 = await page.evaluateHandle(el => el.nextElementSibling, nextPage);
    let nextPage3 = await page.evaluateHandle(el => el.nextElementSibling, nextPage2);



    browser.close();
    // parsing the data
    let properties = [];

    rawPages.forEach(rawData => {
        const $ = cheerio.load(rawData);
        let propertiesHtml = $(".resultsListContainer article");

        propertiesHtml.each((i, el) => {
            let property = {};
            property.link = baseUrl + $(el).find(".detailsContent a").attr("href");
            property.title = $(el).find(".detailsContent .descriptionTitle").text().trim();
            property.price = $(el).find(".detailsContent .descriptionPrice .thePrice").text().trim();
            properties.push(property);
        });
    });

    return properties;
}

function readProperties() {
    return propertiesRepo.readProperties(dataFileName);
}

function saveProperties(liveProperties, diff) {
    propertiesRepo.createChangeLog(dataFileName, diff);
    propertiesRepo.updateProperties(dataFileName, liveProperties);
}


export { scrapeData, readProperties, saveProperties };