// import * as fs from "fs"
const fs = require("fs");
let ctx = null;

//CRUD. Create, Read, Update, Delete
function readProperties(context, fileName) {
    ctx = context ?? console;
    try {
        const data = fs.readFileSync(`savedData/${fileName}.json`);
        return JSON.parse(data);
    } catch (err) {
        ctx.log(err)
        return []
    }
}

function updateProperties(context, fileName, properties) {
    ctx = context ?? console;
    try {
        const path = `savedData/${fileName}.json`;
        fs.writeFile(path, JSON.stringify(properties, null, 2), writeFileCallback(path))
        
    } catch (err) {
        ctx.log(err)
    }
}

function createChangeLog(context, fileName, propertiesDiff) {
    ctx = context ?? console;
    try {
        const date = new Date();
        const [year, month, day, hour, minutes, seconds] = [date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];

        const path = `savedData/${year}-${month}-${day}--${hour}-${minutes}-${seconds}_ChangeLog_${fileName}.json`;
        fs.writeFile(path, 
            JSON.stringify(propertiesDiff, null, 2), 
            writeFileCallback(path));
    } catch (err) {
        ctx.log(err)
    }
}

module.exports = { readProperties, updateProperties, createChangeLog };

function writeFileCallback(path) {
    return (err) => {
        if (err) {
            ctx.log(err);
            return;
        }
        ctx.log(`Successfully written file to ${path}`);
    };
}
