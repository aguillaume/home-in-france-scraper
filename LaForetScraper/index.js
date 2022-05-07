/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 * 
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */

// const Scraper = require('./Scraper')
const cheerio = require("cheerio");
const webScraper = require("../App/WebScraper");

const baseUrl = "https://www.laforet.com";
const url = baseUrl+"/acheter/achat-maison?filter%5Bcities%5D=13117%2C3000874%2C13015&filter%5Barea%5D=43.4509%2C5.2654%2C10%2CVitrolles&filter%5Bmax%5D=500000&filter%5Bbedrooms%5D=3&filter%5Bsurface%5D=90&filter%5Bsurface_ground%5D=400";

async function scrapeProperties(ctx) {
    const rawData = await webScraper.getRawData(url);
    const $ = cheerio.load(rawData);

    let propertiesHtml = $(".property-card");
    
    let properties = [];
    propertiesHtml.each((i, el) => {
        let property = { title:"", price:""};
        property.link = baseUrl + $(el).children("a").attr("href");
        property.title = $(el).find(".property-card__title").text().trim();
        property.price = cleanPrice($(el).find(".property-card__price").text());
        properties.push(property);
    });

    return {
        agencyName: "La Foret",
        liveProperties: properties
    };
}

function cleanPrice(price) {
    let cleanPrice = price.split("\n").join("").trim();
    cleanPrice = cleanPrice.split("\u202f").join(" ");
    cleanPrice = cleanPrice.split("\u00a0").join(" ");

    return cleanPrice;
}

module.exports = scrapeProperties;