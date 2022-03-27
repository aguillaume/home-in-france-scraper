import * as webScraper from "../WebScraper.js"

const baseUrl = "https://home-in-france-scraper.azurewebsites.net/";
const url = baseUrl+"";
const userUrl = baseUrl + `/users?from=ScraperKeepAlive&time=${new Date().toJSON()}`

async function scrapeData() {
    const rawData = await webScraper.getRawData(url);

    const rawUserData = await webScraper.getRawData(userUrl);
}
