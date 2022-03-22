import * as fs from "fs"
//CRUD. Create, Read, Update, Delete
function readProperties(fileName) {
    try {
        const data = fs.readFileSync(`savedData/${fileName}.json`);
        return JSON.parse(data);
    } catch (err) {
        console.error(err)
        return []
    }
}

function updateProperties(fileName, properties) {
    try {
        const path = `savedData/${fileName}.json`;
        fs.writeFile(path, JSON.stringify(properties, null, 2), writeFileCallback(path))
        
    } catch (err) {
        
    }
}

function createChangeLog(fileName, propertiesDiff) {
    try {
        const date = new Date();
        const [year, month, day, hour, minutes, seconds] = [date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];

        const path = `savedData/${year}-${month}-${day}--${hour}-${minutes}-${seconds}_ChangeLog_${fileName}.json`;
        fs.writeFile(path, 
            JSON.stringify(propertiesDiff, null, 2), 
            writeFileCallback(path));
    } catch (err) {
        console.error(err)
    }
}

export { readProperties, updateProperties, createChangeLog };

function writeFileCallback(path) {
    return (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`Successfully written file to ${path}`);
    };
}
