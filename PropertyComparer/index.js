/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 * 
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */

const storage = require("azure-storage");

const blobService = storage.createBlobService(process.env['AzureWebJobsStorage']);
const container = "HomeInFranceScraper"


module.exports = async function (ctx, agencies) {
    blobService.createContainerIfNotExists(container, (error) => {
        if (error) {
            ctx.log(error);
            throw error;
        }

        let allNewProperties = [];

        for (const agency of agencies) {
            ctx.log(`Scraped ${agency.agencyName} a bunch... fround ${agency.liveProperties.length} properties.`)
            let agencyNewProperties = [];
            let saveRequired= false;
            const blob = agency.agencyName.replace(" ", "");

            // Downloads a blob into a text string. https://docs.microsoft.com/en-us/javascript/api/azure-storage/azurestorage.services.blob.blobservice.blobservice?view=azure-node-legacy#azure-storage-azurestorage-services-blob-blobservice-blobservice-getblobtotext

            blobService.getBlobToText(container, blob, (error, text, blockBlob, response) => {
                if (error) {
                    ctx.log(error);
                    throw error;
                }

                // Text is a string representation of a Map. 
                // Key = ${property.link}
                // Value = property obj
                let savedProperties = new Map(Object.entries(JSON.parse(text)));
                ctx.log(`${agency.agencyName} has ${savedProperties.size} properties saved.`)

                for (const newProp of agency.liveProperties) {
                    const key = `${newProp.link}`;

                    if(savedProperties.has(key)) {
                        let savedProp = savedProperties.get(key);
                        if(savedProp.price == newProp.price) {
                            // we've seen this prop before at the same price
                        }else{
                            //property price has changed
                            ctx.log(`Agency: ${agency.agencyName} Prop link:${newProp.link} has a new price, old:${savedProp.previousPrice}  new:${newProp.price}.`);

                            savedProp.previousPrice = savedProp.price;
                            savedProp.price = newProp.price;
                            agencyNewProperties.push(savedProp);
                            saveRequired = true;
                        }
                    } else {
                        // new property
                        ctx.log(`Agency: ${agency.agencyName} New Property:${JSON.stringify(newProp)}`);

                        savedProperties.set(key, newProp);
                        agencyNewProperties.push(newProp);
                        saveRequired = true;
                    }

                }

                if(saveRequired) {
                    const textToSave = JSON.stringify(Object.fromEntries(savedProperties));
                    blobService.createBlockBlobFromText(container, blob, textToSave, (error, result, response) => {
                        if (error) {
                            ctx.log(error);
                            throw error;
                        }
                    });
                }
            });
            
            ctx.log(`Agency: ${agency.agencyName}. ${agencyNewProperties.length} new properties were found.`);

            allNewProperties.push({
                agencyName: agency.agencyName,
                newProperties: agencyNewProperties
            });

        }

        context.done(null, allNewProperties);
    });
};
