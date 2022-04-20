const propertyComparer = require("./PropertyComparer")
const notification = require("./Notification")
const LaForet = require("./Scrapers/LaForet")
const ImmoDuParticulier = require("./Scrapers/ImmoDuParticulier")
const BienIci = require("./Scrapers/BienIci")
const Orpi = require("./Scrapers/Orpi")

let ctx = null;

async function run(context) {
    ctx = context ?? console;
    ctx.log(`Let the scraping commence...`);
    const laForet = new LaForet(ctx);
    const immoDuParticulier = new ImmoDuParticulier(ctx);
    const bienIci = new BienIci(ctx);
    const orpi = new Orpi(ctx);

    const laForetProperties = 
        laForet.scrapeData()
            .then(handleScrapedData(laForet))
            .catch(err => ctx.log(err));
    
    const orpiProperties = 
        orpi.scrapeData()
            .then(handleScrapedData(orpi))
            .catch(err => ctx.log(err));
    
    const immoDuParticulierProperties = 
        immoDuParticulier.scrapeData()
            .then(handleScrapedData(immoDuParticulier))
            .catch(err => ctx.log(err));

    const bienIciProperties = 
        bienIci.scrapeData()
            .then(handleScrapedData(bienIci))
            .catch(err => ctx.error(err));
    
    const scrapers = [laForetProperties, orpiProperties, immoDuParticulierProperties, bienIciProperties];
        
    const potentialHouses = await Promise.allSettled(scrapers)
        .then((results) => {
            let allNewProperties = [];
    
            results.forEach((result) => {
                if (result.status == "fulfilled" && result.value && result.value.newProperties && 
                    (result.value.newProperties.new.length > 0 || result.value.newProperties.reAdded.length)) 
                    allNewProperties.push(result.value);
            });
    
            return allNewProperties;
        });
    
    if(potentialHouses.length > 0) {
        ctx.log(`There are new properties`);
        ctx.log(JSON.stringify(potentialHouses, null, 2));
        
        // email the new properties
        await notification.sendEmail(ctx, potentialHouses, `There are new properties`)
    } 
    
    ctx.log(`Scraping done!`);
}

module.exports = { run };

function handleScrapedData(scraper) {
    return (liveProperties) => {
        const savedProperties = scraper.readProperties();
        const propertyHistory = scraper.getPropertyHistory();
        ctx.log(`Scraped ${scraper.agency} a bunch... fround ${liveProperties.length} properties. Had ${savedProperties.length} saved.`)

        const diff = propertyComparer.symmetricDifference(ctx, savedProperties, liveProperties, propertyHistory)

        if (diff.propertiesAdded.new.length > 0 || diff.propertiesAdded.reAdded.length > 0 || diff.propertiesRemoved.length > 0) {
            scraper.saveProperties(liveProperties, diff);
        } else {
            ctx.log(`Nothing new from ${scraper.agency}.`)
        }

        return {
            agency: scraper.agency,
            newProperties: diff.propertiesAdded
        }
    }
}
