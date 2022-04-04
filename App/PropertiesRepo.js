// import * as fs from "fs"
// const fs = require("fs");
let ctx = null;


//CRUD. Create, Read, Update, Delete
function readProperties(context, fileName) {
    ctx = context ?? console;
    try {
        // const data = fs.readFileSync(`savedData/${fileName}.json`);
        if(ctx.bindings.InputBlobTestSaveData) {
            let agencyBlob = ctx.bindings.InputBlobTestSaveData[fileName];
            if(agencyBlob) {
                return agencyBlob.properties;
            }
        } 
        // ctx.log(`InputBlobTestSaveData is not empty ${ctx.bindings.InputBlobTestSaveData}`)
        // ctx.bindings.OutputBlobTestSaveData = JSON.parse(data)
        // return JSON.parse(data);
    } catch (err) {
        ctx.log(err)
        return []
    }
    return [];
}

function updateProperties(context, fileName, properties) {
    ctx = context ?? console;
    try {
        // const path = `savedData/${fileName}.json`;
        // fs.writeFile(path, JSON.stringify(properties, null, 2), writeFileCallback(path))
        if(!ctx.bindings.OutputBlobTestSaveData) ctx.bindings.OutputBlobTestSaveData = ctx.bindings.InputBlobTestSaveData ?? {};
        let output = ctx.bindings.OutputBlobTestSaveData;
        if(!output[fileName]) output[fileName] = {};
        let agency = output[fileName];

        agency.properties = properties ;
        ctx.bindings.OutputBlobTestSaveData = output;
        
    } catch (err) {
        ctx.log(err)
    }
}

function createChangeLog(context, fileName, propertiesDiff) {
    ctx = context ?? console;
    try {
        const date = new Date();
        const [year, month, day, hour, minutes, seconds] = [date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];

        // const path = `savedData/${year}-${month}-${day}--${hour}-${minutes}-${seconds}_ChangeLog_${fileName}.json`;
        // fs.writeFile(path, 
        //     JSON.stringify(propertiesDiff, null, 2), 
        //     writeFileCallback(path));

        
        if(!ctx.bindings.OutputBlobTestSaveData) ctx.bindings.OutputBlobTestSaveData = ctx.bindings.InputBlobTestSaveData ?? {};
        let output = ctx.bindings.OutputBlobTestSaveData;
        if(!output[fileName]) output[fileName] = {};
        let agency = output[fileName];
        if(!agency.changeLog) agency.changeLog = [];
        let changeLog = agency.changeLog;

        changeLog.push({
                "timeOfChange": new Date(),
                "timeOfChange2": `${year}-${month}-${day}--${hour}-${minutes}-${seconds}`,
                "diff": propertiesDiff
        });

        ctx.bindings.OutputBlobTestSaveData = output;
    } catch (err) {
        ctx.log(err)
    }
}

module.exports = { readProperties, updateProperties, createChangeLog };

// function writeFileCallback(path) {
//     return (err) => {
//         if (err) {
//             ctx.log(err);
//             return;
//         }
//         ctx.log(`Successfully written file to ${path}`);
//     };
// }
