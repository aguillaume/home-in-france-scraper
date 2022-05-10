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
const container = "home-in-france-scraper";


module.exports = async function (ctx, agencies) {

    await createContainerIfNotExists(container);
    
    let allNewProperties = [];

    for (const agency of agencies) {
        ctx.log(`Scraped ${agency.agencyName} a bunch... fround ${agency.liveProperties.length} properties.`)
        let agencyNewProperties = [];
        let saveRequired= false;
        const blob = agency.agencyName.replace(" ", "") + "Data.json";

        let [text, blockBlob, response] = await readProperties(container, blob);

        // Text is a string representation of a Map. 
        // Key = ${property.link}
        // Value = property obj
        let savedProperties = text ? new Map(Object.entries(JSON.parse(text))) : new Map();
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
            await updateProperties(savedProperties, blob, ctx);
        }
        
        ctx.log(`Agency: ${agency.agencyName}. ${agencyNewProperties.length} new properties were found.`);

        if(agencyNewProperties.length > 0) {
            allNewProperties.push({
                agencyName: agency.agencyName,
                newProperties: agencyNewProperties
            });
        }
    }

    ctx.done(null, allNewProperties);
};

async function updateProperties(savedProperties, blob) {
    return new Promise( (resolve, reject) => {
        const textToSave = JSON.stringify(Object.fromEntries(savedProperties));
        blobService.createBlockBlobFromText(container, blob, textToSave, (error, result, response) => {
            if (error) reject(error);
            resolve([result, response]);
        });
    });
    
}

async function readProperties(container, blob) {
    return new Promise((resolve, reject) =>  {
        blobService.doesBlobExist(container, blob, (error, blobResult, response) => {
            if (error) reject(error);
            if(!blobResult.exists) resolve([null, null, response]);
            else {
                // Downloads a blob into a text string. https://docs.microsoft.com/en-us/javascript/api/azure-storage/azurestorage.services.blob.blobservice.blobservice?view=azure-node-legacy#azure-storage-azurestorage-services-blob-blobservice-blobservice-getblobtotext
                blobService.getBlobToText(container, blob, (error, text, blockBlob, response) => {
                    if (error) reject(error);
        
                    resolve([text, blockBlob, response]);
                });
            }
        })
    });
};

async function createContainerIfNotExists(container) {
    return new Promise((resolve, reject) =>  {
        blobService.createContainerIfNotExists(container, (error, result, response) => {
            if (error) reject(error);

            resolve([result, response]);
        });
    });
}

