const Scraper = require('./Scraper');
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

class AtHomeImmobilier extends Scraper {

    
    baseUrl = "https://www.at-homeimmobilier.com";
    url = this.baseUrl+"/catalog/advanced_search_result.php?action=update_search&search_id=1730661317443631&C_28_search=EGAL&C_28_type=UNIQUE&C_28=Vente&C_28_tmp=Vente&C_27_search=EGAL&C_27_type=TEXT&C_27=2&C_27_tmp=2&C_65_search=CONTIENT&C_65_type=TEXT&C_65=13080%20AIX-EN-PROVENCE%2C13320%20BOUC-BEL-AIR%2C13480%20CABRIES%2C13480%20CALAS%2C13120%20GARDANNE%2C13180%20GIGNAC-LA-NERTHE%2C13180%20GIGNAC-LA-NERTHE%2C13290%20LES-MILLES%2C13170%20LES-PENNES-MIRABEAU%2C13170%20LES-PENNES-MIRABEAU%2C13080%20LUYNES%2C13700%20MARIGNANE%2C13340%20ROGNAC%2C13240%20SEPTEMES-LES-VALLONS%2C13880%20VELAUX%2C13127%20VITROLLES&C_65_tmp=13127%20VITROLLES&C_30_MAX=500000&C_34_MIN=&C_34_search=COMPRIS&C_34_type=NUMBER&C_30_MIN=&C_30_search=COMPRIS&C_30_type=NUMBER&C_34_MAX=&C_33_MAX=&C_38_MAX=&C_36_MIN=&C_36_search=COMPRIS&C_36_type=NUMBER&C_36_MAX=&page=1&search_id=1730661317443631&sort=PRODUCT_LIST_PRICEd";

    constructor(context) {
        super(context, AtHomeImmobilier.name)
      }

    async scrapeData() {
        const browser = await puppeteer.launch();
    
        const page = await browser.newPage();
        await page.goto(this.url, { waitUntil: "networkidle2" });
        
        const closeCookieBannerSelector = "#cookie-banner > a";

        try {
            await page.waitForSelector(closeCookieBannerSelector, {timeout: 10000});
            await page.click(closeCookieBannerSelector)
        } catch {
            this.ctx.log("cookie close fail or not found")
        }

        const showMoreSelector = '#next_page_listing';
        const loadingSelector = "#loading_img_listing";

        let isShowMoreVisible = await this.#isVisible(page, showMoreSelector);
        let isLoadingMoreVisible = await this.#isVisible(page, loadingSelector);

        while(isShowMoreVisible || isLoadingMoreVisible) {
            try {
                await page.waitForSelector(showMoreSelector, {visible: true, timeout: 10000});
                await page.click(showMoreSelector)
            } catch (error) {
                // waitForSelector throws an error when not found
                break;
            }

            isShowMoreVisible = await this.#isVisible(page, showMoreSelector);
            isLoadingMoreVisible = await this.#isVisible(page, loadingSelector);
        }
        const rawData = await page.content();
    
        browser.close();

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

    async #isVisible(page, selector) {
        return await page.evaluate((el) => {
            const e = document.querySelector(el);
            return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
        }, selector);
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