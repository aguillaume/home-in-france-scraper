const app = require("../App/App")

module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timeStamp);

    context.log(`Start Time of Scrape: ${new Date()}`);
    
    await app.run(context);

    context.log(`End Time of Scrape: ${new Date()}`);
};
