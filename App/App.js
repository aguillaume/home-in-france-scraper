const propertyComparer = require("./PropertyComparer")
const notification = require("./Notification")
const LaForet = require("./Scrapers/LaForet")
const ImmoDuParticulier = require("./Scrapers/ImmoDuParticulier")
const BienIci = require("./Scrapers/BienIci")
const Orpi = require("./Scrapers/Orpi")
const AtHomeImmobilier = require("./Scrapers/AtHomeImmobilier")

let ctx = null;

async function run(context) {
    ctx = context ?? console;
    ctx.log(`Let the scraping commence...`);
    const laForet = new LaForet(ctx);
    const immoDuParticulier = new ImmoDuParticulier(ctx);
    const bienIci = new BienIci(ctx);
    const orpi = new Orpi(ctx);
    const atHomeImmobilier = new AtHomeImmobilier(ctx);

    const laForetProperties = 
        laForet.scrapeData()
            .then(handleScrapedData(laForet))
            .catch(handleError(laForet));
    
    const orpiProperties = 
        orpi.scrapeData()
            .then(handleScrapedData(orpi))
            .catch(handleError(orpi));
    
    const immoDuParticulierProperties = 
        immoDuParticulier.scrapeData()
            .then(handleScrapedData(immoDuParticulier))
            .catch(handleError(immoDuParticulier));

    const bienIciProperties = 
        bienIci.scrapeData()
            .then(handleScrapedData(bienIci))
            .catch(handleError(bienIci));

    const atHomeImmobilierProperties = 
        atHomeImmobilier.scrapeData()
            .then(handleScrapedData(atHomeImmobilier))
            .catch(handleError(atHomeImmobilier));
    
    const scrapers = [laForetProperties, orpiProperties, immoDuParticulierProperties, bienIciProperties, atHomeImmobilierProperties
    ];
        
    const potentialHouses = await Promise.allSettled(scrapers)
        .then((results) => {
            let allNewProperties = [];
    
            results.forEach((result) => {
                if (result.status == "fulfilled" && result.value && result.value.newProperties && 
                    result.value.newProperties.length > 0 ) 
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

        if (diff.propertiesAdded.length > 0 || diff.propertiesRemoved.length > 0) {
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

function handleError(scraper) {
    return (err) => {
        ctx.log(`Scraper ${scraper.agency} ran into an error...`)
        ctx.log(err)
    }
}
