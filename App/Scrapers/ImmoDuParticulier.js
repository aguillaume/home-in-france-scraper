const Scraper = require("./Scraper.js");
const webScraper = require("../WebScraper.js");
const cheerio = require("cheerio");

class ImmoDuParticulier extends Scraper {
    baseUrl = "https://www.immoduparticulier.com";
    url = this.baseUrl+"/catalog/advanced_search_result.php?action=update_search&search_id=1727994553829177&map_polygone=&C_28_search=EGAL&C_28_type=UNIQUE&C_28=Vente&C_28_tmp=Vente&C_27_search=EGAL&C_27_type=TEXT&C_27=2&C_27_tmp=2&C_34_MIN=80&C_34_search=COMPRIS&C_34_type=NUMBER&C_30_search=COMPRIS&C_30_type=NUMBER&C_30_MAX=500000&C_65_search=CONTIENT&C_65_type=TEXT&C_65=13170+LES-PENNES-MIRABEAU%2C13700+MARIGNANE%2C13880+VELAUX%2C13127+VITROLLES&C_65_tmp=13170+LES-PENNES-MIRABEAU&C_65_tmp=13700+MARIGNANE&C_65_tmp=13880+VELAUX&C_65_tmp=13127+VITROLLES&keywords=&C_30_MIN=&C_33_search=COMPRIS&C_33_type=NUMBER&C_33_MIN=&C_33_MAX=&C_34_MAX=&C_36_MIN=&C_36_search=COMPRIS&C_36_type=NUMBER&C_36_MAX=&C_38_MAX=&C_38_MIN=&C_38_search=COMPRIS&C_38_type=NUMBER&C_47_type=NUMBER&C_47_search=COMPRIS&C_47_MIN=&C_94_type=FLAG&C_94_search=EGAL&C_94=";

    constructor(context) {
        super(context, ImmoDuParticulier.name);
    }

    async scrapeData() {
        const rawData = await webScraper.getRawData(this.url);
        const $ = cheerio.load(rawData);

        let propertiesHtml = $(".item-product");
        
        let properties = [];
        propertiesHtml.each((i, el) => {
            let property = { title:"", price:""};
            property.link = this.baseUrl + this.#cleanLink($(el).find(".products-link").children("a").attr("href"));
            property.title = $(el).find(".products-name").text().trim();
            property.price = this.#cleanPrice($(el).find(".products-price").text());
            properties.push(property);
        });
    
        return properties;
    }

    #cleanPrice(price) {
        let cleanPrice = price.trim();
        cleanPrice = cleanPrice.replaceAll("\u00a0", " ");

        return cleanPrice;
    }

    #cleanLink(link) {
        let cleanLink = link.replace("..", "");
        cleanLink = cleanLink.substring(0, cleanLink.indexOf("?search_id"));

        return cleanLink;
    }
}

module.exports = ImmoDuParticulier;