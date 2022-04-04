// import * as webScraper from "../WebScraper.js"
const webScraper = require("../WebScraper.js");
// import * as propertiesRepo from "../PropertiesRepo.js"
const propertiesRepo = require("../PropertiesRepo");
// import * as cheerio from 'cheerio';
const cheerio = require("cheerio");

const baseUrl = "https://www.immoduparticulier.com";
const url = baseUrl+"/catalog/advanced_search_result.php?action=update_search&search_id=1727994553829177&map_polygone=&C_28_search=EGAL&C_28_type=UNIQUE&C_28=Vente&C_28_tmp=Vente&C_27_search=EGAL&C_27_type=TEXT&C_27=2&C_27_tmp=2&C_34_MIN=80&C_34_search=COMPRIS&C_34_type=NUMBER&C_30_search=COMPRIS&C_30_type=NUMBER&C_30_MAX=500000&C_65_search=CONTIENT&C_65_type=TEXT&C_65=13170+LES-PENNES-MIRABEAU%2C13700+MARIGNANE%2C13880+VELAUX%2C13127+VITROLLES&C_65_tmp=13170+LES-PENNES-MIRABEAU&C_65_tmp=13700+MARIGNANE&C_65_tmp=13880+VELAUX&C_65_tmp=13127+VITROLLES&keywords=&C_30_MIN=&C_33_search=COMPRIS&C_33_type=NUMBER&C_33_MIN=&C_33_MAX=&C_34_MAX=&C_36_MIN=&C_36_search=COMPRIS&C_36_type=NUMBER&C_36_MAX=&C_38_MAX=&C_38_MIN=&C_38_search=COMPRIS&C_38_type=NUMBER&C_47_type=NUMBER&C_47_search=COMPRIS&C_47_MIN=&C_94_type=FLAG&C_94_search=EGAL&C_94=";
const dataFileName = "ImmoDuParticulier";
let ctx = null;

async function scrapeData(context) {
    ctx = context ?? console;

    const rawData = await webScraper.getRawData(url);
    // parsing the data
    const $ = cheerio.load(rawData);
    let propertiesHtml = $(".item-product");
    
    let properties = [];
    propertiesHtml.each((i, el) => {
        let property = { title:"", price:""};
        property.link = baseUrl + $(el).find(".products-link").children("a").attr("href").replace("..", "");
        property.title = $(el).find(".products-name").text().trim();
        property.price = $(el).find(".products-price").text().trim();
        properties.push(property);
    });

    return properties;
}

function readProperties() {
    return propertiesRepo.readProperties(ctx, dataFileName);
}

function saveProperties(liveProperties, diff) {
    propertiesRepo.createChangeLog(ctx, dataFileName, diff);
    propertiesRepo.updateProperties(ctx, dataFileName, liveProperties);
}

module.exports = { scrapeData, readProperties, saveProperties };