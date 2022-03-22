import * as webScraper from "../WebScraper.js"
import * as propertiesRepo from "../PropertiesRepo.js"
import * as cheerio from 'cheerio';

const baseUrl = "https://www.laforet.com";
const url = baseUrl+"/acheter/achat-maison?filter%5Bcities%5D=13117%2C3000874%2C13015&filter%5Barea%5D=43.4509%2C5.2654%2C10%2CVitrolles&filter%5Bmax%5D=500000&filter%5Bbedrooms%5D=3&filter%5Bsurface%5D=90&filter%5Bsurface_ground%5D=400";
const dataFileName = "laForetProperties";

async function scrapeData() {
    const rawData = await webScraper.getRawData(url);
    // parsing the data
    const $ = cheerio.load(rawData);
    let propertiesHtml = $(".property-card");
    
    let properties = [];
    propertiesHtml.each((i, el) => {
        let property = { title:"", price:""};
        property.link = baseUrl + $(el).children("a").attr("href");
        property.title = $(el).find(".property-card__title").text().trim();
        property.price = $(el).find(".property-card__price").text().replace("\n", "").trim();
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