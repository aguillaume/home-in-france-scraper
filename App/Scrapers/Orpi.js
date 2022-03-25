import * as propertiesRepo from "../PropertiesRepo.js"
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

// URL for data
const baseUrl = "https://www.orpi.com";
const url = baseUrl+"/recherche/buy?realEstateTypes%5B%5D=maison&locations%5B0%5D%5Bvalue%5D=vitrolles&locations%5B0%5D%5Blabel%5D=Vitrolles+(13127)&locations%5B1%5D%5Bvalue%5D=bouc-bel-air&locations%5B1%5D%5Blabel%5D=Bouc-Bel-Air+(13320)&locations%5B2%5D%5Bvalue%5D=aix-en-provence-les-milles&locations%5B2%5D%5Blabel%5D=Les+Milles+(13290)&locations%5B3%5D%5Bvalue%5D=marignane&locations%5B3%5D%5Blabel%5D=Marignane+(13700)&locations%5B4%5D%5Bvalue%5D=velaux&locations%5B4%5D%5Blabel%5D=Velaux+(13880)&locations%5B5%5D%5Bvalue%5D=gardanne&locations%5B5%5D%5Blabel%5D=Gardanne+(13120)&locations%5B6%5D%5Bvalue%5D=les-pennes-mirabeau&locations%5B6%5D%5Blabel%5D=Les+Pennes-Mirabeau+(13170)&locations%5B7%5D%5Bvalue%5D=aix-en-provence-la-duranne&locations%5B7%5D%5Blabel%5D=La+Duranne+(13290)&locations%5B8%5D%5Bvalue%5D=cabries&locations%5B8%5D%5Blabel%5D=Cabri%C3%A8s+(13170)&locations%5B9%5D%5Bvalue%5D=gignac-la-nerthe&locations%5B9%5D%5Blabel%5D=Gignac-la-Nerthe+(13180)&locations%5B10%5D%5Bvalue%5D=aix-en-provence-luynes&locations%5B10%5D%5Blabel%5D=Luynes+(13080)&locations%5B11%5D%5Bvalue%5D=simiane-collongue&locations%5B11%5D%5Blabel%5D=Simiane-Collongue+(13109)&locations%5B12%5D%5Bvalue%5D=rognac&locations%5B12%5D%5Blabel%5D=Rognac+(13340)&locations%5B13%5D%5Bvalue%5D=ventabren&locations%5B13%5D%5Blabel%5D=Ventabren+(13122)&locations%5B14%5D%5Bvalue%5D=coudoux&locations%5B14%5D%5Blabel%5D=Coudoux+(13111)&locations%5B15%5D%5Bvalue%5D=aix-en-provence&locations%5B15%5D%5Blabel%5D=Aix-en-Provence+(13100)&minLotSurface=400&maxPrice=500000&outdoor%5B%5D=garden&sort=date-down&layoutType=mixte&page=1";
const dataFileName = "orpiProperties";

async function scrapeData() {
    const browser = await puppeteer.connect({ browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}` }) //await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: "load"});
    const rawData = await page.content();
    browser.close();
    // parsing the data
    const $ = cheerio.load(rawData);
    let propertiesHtml = $("article div.c-box__inner.c-box__inner--sm.c-overlay");

    let properties = [];
    propertiesHtml.each((i, el) => {
        let property = {};
        property.link = baseUrl + $(el).find("a.u-link-unstyled.c-overlay__link").attr("href");
        property.title = $(el).find("a.u-link-unstyled.c-overlay__link").text().trim();
        property.price = $(el).find("strong.u-text-md.u-color-primary").text().trim();
        properties.push(property);
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