// Import durable functions
const df = require("durable-functions");

module.exports = async function (context, timer) {
    // Create client instance
    const client = df.getClient(context);

    var timeStamp = new Date().toISOString();
    
    if (timer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }

    // start orchestration with hardcoded site name
    const instanceId = await client.startNew('HouseScraperOrchestrator', undefined, 'test3');
    
    // Log the started instance
    context.log(`Started orchestration with ID = '${instanceId}'.`);
    context.log('JavaScript timer trigger function ran!', timeStamp);   
};