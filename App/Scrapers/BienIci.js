
const propertiesRepo = require("../PropertiesRepo");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

// URL for data
const baseUrl = "https://www.bienici.com";
const url = baseUrl + "/recherche/achat/dessin-623b32310dbe7e00b77e96ab/maisonvilla?prix-max=500000&surface-min=80&camera=11_5.1052764_43.4244043_0.9_0";
const dataFileName = "bienIciProperties";
let ctx = null;

async function scrapeData(context) {
    ctx = context ?? console;
    
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    let rawPages = [];
    try {
        rawPages = await getAllProperties(page);
    } catch (error) {
        ctx.log(error)
    }

    browser.close();
    // parsing the data
    let properties = [];

    rawPages.forEach(rawData => {
        const $ = cheerio.load(rawData);
        let propertiesHtml = $(".resultsListContainer article");

        propertiesHtml.each((i, el) => {
            let property = {};
            const rawLink = baseUrl + $(el).find(".detailsContent a").attr("href");
            const linkQueryIndex = rawLink.indexOf("?q=");
            const strippedLink = rawLink.substring(0, linkQueryIndex);
            property.link = strippedLink;
            property.title = $(el).find(".detailsContent .descriptionTitle").text().trim();
            property.price = $(el).find(".detailsContent .descriptionPrice .thePrice").text().trim();
            properties.push(property);
        });
    });

    return properties;
}

async function getAllProperties(page) {
    let rawPages = [];
    // multi page search. Loop through every page
    while (true) {
        rawPages.push(await page.content());
        // Wait for suggest overlay to appear and click "show all results".
        const currentPageSelector = '.pagination .currentPage';
        try {
            await page.waitForSelector(currentPageSelector);
        } catch (error) {
            //only one page
            break;
        }

        const link = await page.evaluate((currentPageSelector) => {
            const nextSibling = document.querySelector(currentPageSelector).nextElementSibling;
            if (nextSibling) {
                return nextSibling.href;
            }
        }, currentPageSelector);

        if(link) {
            await page.goto(link, { waitUntil: "networkidle2" });
        }else {
            break;
        }
    }

    return rawPages;
}

function readProperties() {
    return propertiesRepo.readProperties(ctx, dataFileName);
}

function saveProperties(liveProperties, diff) {
    propertiesRepo.createChangeLog(ctx, dataFileName, diff);
    propertiesRepo.updateProperties(ctx, dataFileName, liveProperties);
}


module.exports = { scrapeData, readProperties, saveProperties };