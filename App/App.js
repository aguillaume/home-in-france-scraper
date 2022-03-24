import * as propertyComparer from "./PropertyComparer.js"
import * as notification from "./Notification.js"
import * as laForet from "./Scrapers/LaForet.js"
import * as orpi from "./Scrapers/Orpi.js"
import * as immoDuParticulier from "./Scrapers/ImmoDuParticulier.js"

async function run() {
    console.log(`Let the scraping commence...`);

    const laForetProperties = 
        laForet.scrapeData()
            .then(handleScrapedData(laForet, "La Foret"))
            .catch(err => console.error(err));
    
    const orpiProperties = 
        orpi.scrapeData()
            .then(handleScrapedData(orpi, "Orpi"))
            .catch(err => console.error(err));
    
    const immoDuParticulierProperties = 
        immoDuParticulier.scrapeData()
            .then(handleScrapedData(immoDuParticulier, "Immo Du Particulier"))
            .catch(err => console.error(err));
    
    const scrapers = [laForetProperties, orpiProperties, immoDuParticulierProperties];
    const potentialHouses = await Promise.allSettled(scrapers)
        .then((results) => {
            let allNewProperties = [];
    
            results.forEach((result) => {
                if (result.status == "fulfilled" && result.value.newProperties.length > 0) allNewProperties.push(result.value);
            })
    
            return allNewProperties;
        });
    
    if(potentialHouses.length > 0) {
        console.log(`There are new properties`);
        console.log(JSON.stringify(potentialHouses, null, 2));
        
        // email the new properties
        notification.sendEmail(potentialHouses, `There are new properties`)
    } 
    
    console.log(`Scraping done!`);
}

export { run };

function handleScrapedData(scraper, agencyName) {
    return (liveProperties) => {
        const savedProperties = scraper.readProperties()
        console.log(`Scraped ${agencyName} a bunch... fround ${liveProperties.length} properties. Had ${savedProperties.length} saved.`)

        const diff = propertyComparer.symmetricDifference(savedProperties, liveProperties)

        if (diff.propertiesAdded.length > 0 || diff.propertiesRemoved.length > 0) {
            scraper.saveProperties(liveProperties, diff);
        } else {
            console.log(`Nothing new from ${agencyName}.`)
        }

        return {
            agency: agencyName,
            newProperties: diff.propertiesAdded
        }
    }
}
