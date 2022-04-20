
//CRUD. Create, Read, Update, Delete
class PropertiesRepo {
    ctx;

    constructor(context) {
        this.ctx = context ?? console;
    }

    readProperties(fileName) {
        try {
            if(this.ctx.bindings.InputBlobTestSaveData) {
                let agencyBlob = this.ctx.bindings.InputBlobTestSaveData[fileName];
                if(agencyBlob) {
                    return agencyBlob.properties;
                }
            } 
        } catch (err) {
            this.ctx.log(err)
            return []
        }
        return [];
    }

    readPropertyHistory(fileName) {
        let propertyHistory = new Map();
        try {
            if (!this.ctx.bindings.InputBlobTestSaveData) return propertyHistory;
            
            let changeLog = this.ctx.bindings.InputBlobTestSaveData[fileName]?.changeLog ?? [];

            for (const change of changeLog) {
                const propertiesAdded = change?.diff?.propertiesAdded?.new;
                if(!propertiesAdded) continue;

                for (const property of propertiesAdded) {
                    const key = `${property.link}||${property.price}`;
                    if(propertyHistory.has(key)) continue;
                    propertyHistory.set(key, property);
                }
            }
        } catch (err) {
            this.ctx.log(err)
        }
        return propertyHistory;
    }

    updateProperties(fileName, properties) {
        try {
            if(!this.ctx.bindings.OutputBlobTestSaveData) this.ctx.bindings.OutputBlobTestSaveData = this.ctx.bindings.InputBlobTestSaveData ?? {};
            let output = this.ctx.bindings.OutputBlobTestSaveData;
            if(!output[fileName]) output[fileName] = {};
            let agency = output[fileName];
    
            agency.properties = properties ;
            this.ctx.bindings.OutputBlobTestSaveData = output;
            
        } catch (err) {
            this.ctx.log(err)
        }
    }
    
    createChangeLog(fileName, propertiesDiff) {
        try {
            const date = new Date();
            const [year, month, day, hour, minutes, seconds] = [date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
    
            if(!this.ctx.bindings.OutputBlobTestSaveData) this.ctx.bindings.OutputBlobTestSaveData = this.ctx.bindings.InputBlobTestSaveData ?? {};
            let output = this.ctx.bindings.OutputBlobTestSaveData;
            if(!output[fileName]) output[fileName] = {};
            let agency = output[fileName];
            if(!agency.changeLog) agency.changeLog = [];
            let changeLog = agency.changeLog;
    
            changeLog.push({
                    "timeOfChange": new Date(),
                    "timeOfChange2": `${year}-${month}-${day}--${hour}-${minutes}-${seconds}`,
                    "diff": propertiesDiff
            });
    
            this.ctx.bindings.OutputBlobTestSaveData = output;
        } catch (err) {
            this.ctx.log(err)
        }
    }
}

module.exports = PropertiesRepo;