const Scraper = require('./Scraper')
const webScraper = require("../WebScraper");
const cheerio = require("cheerio");

class AtHomeImmobilier extends Scraper {

    
    baseUrl = "https://www.at-homeimmobilier.com";
    url = this.baseUrl+"/catalog/advanced_search_result.php?action=update_search&search_id=&C_28_search=EGAL&C_28_type=UNIQUE&C_28=Vente&C_27_search=EGAL&C_27_type=TEXT&C_27=2&C_27_tmp=2&C_65_search=CONTIENT&C_65_type=TEXT&C_65=13127+VITROLLES&C_65_tmp=13127+VITROLLES&C_30_MIN=&C_30_search=COMPRIS&C_30_type=NUMBER&C_30_MAX=&C_34_MIN=&C_34_search=COMPRIS&C_34_type=NUMBER&C_34_MAX=&C_33_MAX=&C_38_MAX=&C_36_MIN=&C_36_search=COMPRIS&C_36_type=NUMBER&C_36_MAX=&keywords=";

    constructor(context) {
        super(context, AtHomeImmobilier.name)
      }

    async scrapeData() {
        const rawData = await webScraper.getRawData(this.url);
        const $ = cheerio.load(rawData);
    
        let propertiesHtml = $(".cell-product");
        
        let properties = [];
        propertiesHtml.each((i, el) => {
            let rawLink = $(el).find("a.link-product").attr('href');
            let rawTitle = $(el).find('.product-name').text();
            let rawPrice = $(el).find('.product-price').text();

            let property = { 
                link: this.baseUrl + this.#cleanLink(rawLink),
                title: this.#cleanTitle(rawTitle),
                price: this.#cleanPrice(rawPrice)
            };
             
            properties.push(property);
        });
    
        return properties;
    }

    #cleanPrice(price) {
        let cleanPrice = price.trim();
        cleanPrice = cleanPrice.split("\u00a0").join(" ");

        return cleanPrice;
    }

    #cleanLink(link) {
        let cleanLink = link.replace("..", "");
        cleanLink = cleanLink.substring(0, cleanLink.indexOf("?search_id="));

        return cleanLink;
    }

    #cleanTitle(title) {
        let cleanTitle = title.trim();
        cleanTitle = cleanTitle.split('\u00a0').join(' ');

        return cleanTitle;
    }
}

module.exports = AtHomeImmobilier;