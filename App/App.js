// import * as PropertyComparerJs from "./PropertyComparer.js"
const propertyComparer = require("./PropertyComparer")
// import * as notification from "./Notification.js"
const notification = require("./Notification")
// import * as laForet from "./Scrapers/LaForet.js"
const laForet = require("./Scrapers/LaForet")
// import * as orpi from "./Scrapers/Orpi.js"
const orpi = require("./Scrapers/Orpi")
// import * as immoDuParticulier from "./Scrapers/ImmoDuParticulier.js"
const immoDuParticulier = require("./Scrapers/ImmoDuParticulier")
// import * as scraperKeepAlive from "./Scrapers/ScraperKeepAlive.js"
// import * as bienIci from "./Scrapers/BienIci.js
const bienIci = require("./Scrapers/BienIci.js")
let ctx = null;

async function run(context) {
    ctx = context ?? console;
    ctx.log(`Let the scraping commence...`);

    const laForetProperties = 
        laForet.scrapeData(ctx)
            .then(handleScrapedData(laForet, "La Foret"))
            .catch(err => ctx.log(err));
    
    const orpiProperties = 
        orpi.scrapeData(ctx)
            .then(handleScrapedData(orpi, "Orpi"))
            .catch(err => ctx.log(err));
    
    const immoDuParticulierProperties = 
        immoDuParticulier.scrapeData(ctx)
            .then(handleScrapedData(immoDuParticulier, "Immo Du Particulier"))
            .catch(err => ctx.log(err));

    // const bienIciProperties = 
    //     bienIci.scrapeData()
    //         .then(handleScrapedData(bienIci, "Bien Ici"))
    //         .catch(err => console.error(err));
    
    const scrapers = [laForetProperties, orpiProperties, immoDuParticulierProperties];
    const potentialHouses = await Promise.allSettled(scrapers)
        .then((results) => {
            let allNewProperties = [];
    
            results.forEach((result) => {
                if (result.status == "fulfilled" && result.value && result.value.newProperties && result.value.newProperties.length > 0) 
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

function handleScrapedData(scraper, agencyName) {
    return (liveProperties) => {
        const savedProperties = scraper.readProperties()
        ctx.log(`Scraped ${agencyName} a bunch... fround ${liveProperties.length} properties. Had ${savedProperties.length} saved.`)

        const diff = propertyComparer.symmetricDifference(ctx, savedProperties, liveProperties)

        if (diff.propertiesAdded.length > 0 || diff.propertiesRemoved.length > 0) {
            scraper.saveProperties(liveProperties, diff);
        } else {
            ctx.log(`Nothing new from ${agencyName}.`)
        }

        return {
            agency: agencyName,
            newProperties: diff.propertiesAdded
        }
    }
}
