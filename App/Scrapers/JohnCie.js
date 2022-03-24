import * as propertiesRepo from "../PropertiesRepo.js"
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

// URL for data
const baseUrl = "https://www.johncie.com";
const url = baseUrl+"/fr/acheter/provence";
const dataFileName = "johnCieProperties";

async function scrapeData() {
    const browser = await puppeteer.launch({headless: false, slowMo: 500});
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: "load"});
    console.log("page loaded")
    await page.click("#sd-cmp > div.sd-cmp-2E0Ye > div > div > div > div > div > div > div.sd-cmp-WgGhS.sd-cmp-3YRFa > div.sd-cmp-25TOo > button:nth-child(3)"); // close the cookie box
    console.log("cookies closed")
    await page.click("#\\36 239dd6941210-1 > form > div.fields-wrapper > div.line-wrapper.form-center > div.field.type.choice > span > span.selection > span > span.select2-selection__rendered") // open type choice
    console.log("options clicked")

    await page.click("#select2-search-form-30040_search_type-result-y8f2-Maison\\|2");
    console.log("selected home")
    const rawData = await page.content();
    browser.close();
    // parsing the data
    // const $ = cheerio.load(rawData);
    // let propertiesHtml = $("article div.c-box__inner.c-box__inner--sm.c-overlay");

    let properties = [];
    // propertiesHtml.each((i, el) => {
    //     let property = {};
    //     property.link = baseUrl + $(el).find("a.u-link-unstyled.c-overlay__link").attr("href");
    //     property.title = $(el).find("a.u-link-unstyled.c-overlay__link").text().trim();
    //     property.price = $(el).find("strong.u-text-md.u-color-primary").text().trim();
    //     properties.push(property);
    // });

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