
const Scraper = require("./Scraper");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

class BienIci extends Scraper {
    baseUrl = "https://www.bienici.com";
    url = this.baseUrl + "/recherche/achat/dessin-623b32310dbe7e00b77e96ab/maisonvilla?prix-max=500000&surface-min=80&camera=11_5.1052764_43.4244043_0.9_0";

    constructor(context) {
        super(context, BienIci.name);
    }

    async scrapeData() {
        const browser = await puppeteer.launch();
    
        const page = await browser.newPage();
        await page.goto(this.url, { waitUntil: "networkidle2" });
    
        let rawPages = [];
        try {
            rawPages = await this.#getAllProperties(page);
        } catch (error) {
            ctx.log(error)
        }
    
        browser.close();
        let properties = [];
    
        rawPages.forEach(rawData => {
            const $ = cheerio.load(rawData);
            let propertiesHtml = $(".resultsListContainer article");
    
            propertiesHtml.each((i, el) => {
                let property = {};
                
                property.link = this.baseUrl + this.#cleanLink($(el).find(".detailsContent a").attr("href"));
                property.title = this.#cleanTitle($(el).find(".detailsContent .descriptionTitle").text());
                property.price = this.#cleanPrice($(el).find(".detailsContent .descriptionPrice .thePrice").text());
                properties.push(property);
            });
        });
    
        return properties;
    }

    async #getAllProperties(page) {
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

    #cleanPrice(price) {
        let cleanPrice = price.trim();
        cleanPrice = cleanPrice.replaceAll("\u00a0", " ");

        return cleanPrice;
    }

    #cleanLink(link) {
        let cleanLink = link.substring(0, link.indexOf("?q="));

        return cleanLink;
    }

    #cleanTitle(title) {
        let cleanTitle = title.trim();
        cleanTitle = cleanTitle.replaceAll('\u00a0', ' ')

        return cleanTitle;
    }
}

module.exports = BienIci;