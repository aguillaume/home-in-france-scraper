/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an starter function (Http, time trigger ... ).
 * 
 * Before running this sample, please:
 * - create a Durable activity function (default name is "Hello")
 * - create a Durable starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your 
 *    function app in Kudu
 */

const df = require("durable-functions");
const scrapers = ["LaForetScraper"];

function log(ctx, msg) {
    if (!ctx.df.isReplaying) ctx.log(msg);
}

module.exports = df.orchestrator(function* (ctx) {

    // Get input from the client that started
    const theInput = ctx.df.getInput();

    let tasks = [];
    for (const scraper of scrapers) {
        tasks.push(ctx.df.callActivity(scraper));
    }

    let allLiveProperties = [];
    try {
        // wait for all the scrapers Activities to complete
        allLiveProperties = yield ctx.df.Task.all(tasks);
        log(ctx, `${allLiveProperties.length} agencies scraped`)
    }
    catch (error) {
        // Call Activity to notify of new properties
        log(ctx, `Error from waiting all tasks`)
        log(ctx, error.message)
        yield ctx.df.callActivity("EmailNotification", {type: "Error", error: error});
        for(const task of tasks) {
            if(!task.isFaulted) {
                allLiveProperties.push(task.result)
            }
        }
    }

    // Call Activity that compares live properties with stored ones, and wait for it to finish
    const newProperties = yield ctx.df.callActivity("PropertyComparer", allLiveProperties);

    if(newProperties.length > 0) {

        // Call Activity to notify of new properties
        log(ctx, `There are new properties send an email!`)
        yield ctx.df.callActivity("EmailNotification", newProperties);
    }
    
    return ctx.df.instanceId;
});