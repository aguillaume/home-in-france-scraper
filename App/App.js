import * as propertyComparer from "./PropertyComparer.js"
import * as notification from "./Notification.js"
import * as laForet from "./Scrapers/LaForet.js"
import * as orpi from "./Scrapers/Orpi.js"

console.log(`Let the scraping commence...`);

const laForetProperties = laForet.scrapeData()
    .then((liveProperties) => {
        const savedProperties = laForet.readProperties();
        console.log(`Scraped La Foret a bunch... fround ${liveProperties.length} properties. Had ${savedProperties.length} saved.`);

        const diff = propertyComparer.symmetricDifference(savedProperties, liveProperties);

        if(diff.propertiesAdded.length > 0 || diff.propertiesRemoved.length > 0) {
            laForet.saveProperties(liveProperties, diff);
        } else {
            console.log("Nothing new from La Foret.")
        }

        return { 
            agency: "La Foret", 
            newProperties: diff.propertiesAdded
        };
    }).catch(err => console.error(err));

const orpiProperties = orpi.scrapeData()
    .then((liveProperties) => {
        const savedProperties = orpi.readProperties();
        console.log(`Scraped Orpi a bunch... fround ${liveProperties.length} properties. Had ${savedProperties.length} saved.`);

        const diff = propertyComparer.symmetricDifference(savedProperties, liveProperties);

        if(diff.propertiesAdded.length > 0 || diff.propertiesRemoved.length > 0) {
            orpi.saveProperties(liveProperties, diff);
        } else {
            console.log("Nothing new from Orpi.")
        }

        return { 
            agency: "Orpi", 
            newProperties: diff.propertiesAdded
        };
    }).catch(err => console.error(err));

const scrapers = [laForetProperties, orpiProperties];
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