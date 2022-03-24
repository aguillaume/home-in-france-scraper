import * as app from "./App/App.js"
import chalk from "chalk"

const log = console.log;

while(true)
{
    log(chalk.yellow.bold(`Start Time of Scrape: ${getLogDate()}`));

    await app.run();

    log(chalk.yellow.bold(`End Time of Scrape: ${getLogDate()}`));

    // 900,000 seconds is 15 minutes
    const sleepTime = 900000;
    log(chalk.blue.bold(`Waiting for ${sleepTime/60000} minutes before next scrape.`));

    await sleep(sleepTime);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getLogDate() {
    const date = new Date();
    const [year, month, day, hour, minutes, seconds] = [date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];

    return `${year}/${month}/${day} ${hour}:${minutes}:${seconds}`;
    
}