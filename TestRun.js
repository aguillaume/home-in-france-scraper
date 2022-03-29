// import * as app from "./App/App.js"
const app = require("./App/App");
// import chalk from "chalk"
// const chalk = require("chalk");
import("chalk")
  .then(chalkModule => runOnce(chalkModule.default))
  .catch(err => console.error(err));

const log = console.log;

async function runOnce(chalk) {
  try {
      log(chalk.yellow.bold(`Start Time of Scrape: ${getLogDate()}`));

      await app.run();

      log(chalk.yellow.bold(`End Time of Scrape: ${getLogDate()}`));
      
  } catch (error) {
      log(chalk.red.bold(error));
  }
}

function getLogDate() {
    const date = new Date();
    const [year, month, day, hour, minutes, seconds] = [date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];

    return `${year}/${month}/${day} ${hour}:${minutes}:${seconds}`;
    
}

