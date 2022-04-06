const Scraper = require('./Scraper')
const webScraper = require("../WebScraper");
const cheerio = require("cheerio");

class LaForet extends Scraper {

    baseUrl = "https://www.laforet.com";
    url = this.baseUrl+"/acheter/achat-maison?filter%5Bcities%5D=13117%2C3000874%2C13015&filter%5Barea%5D=43.4509%2C5.2654%2C10%2CVitrolles&filter%5Bmax%5D=500000&filter%5Bbedrooms%5D=3&filter%5Bsurface%5D=90&filter%5Bsurface_ground%5D=400";

    constructor(context) {
        super(context, LaForet.name)
      }

    async scrapeData() {
        const rawData = await webScraper.getRawData(this.url);
        const $ = cheerio.load(rawData);
    
        let propertiesHtml = $(".property-card");
        
        let properties = [];
        propertiesHtml.each((i, el) => {
            let property = { title:"", price:""};
            property.link = this.baseUrl + $(el).children("a").attr("href");
            property.title = $(el).find(".property-card__title").text().trim();
            property.price = this.#cleanPrice($(el).find(".property-card__price").text());
            properties.push(property);
        });
    
        return properties;
    }

    #cleanPrice(price) {
        let cleanPrice = price.replaceAll("\n", "").trim();
        cleanPrice = cleanPrice.replaceAll("\u202f", " ");
        cleanPrice = cleanPrice.replaceAll("\u00a0", " ");

        return cleanPrice;
    }
}

module.exports = LaForet;