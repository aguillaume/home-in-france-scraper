const PropertiesRepo = require("../PropertiesRepo");

class Scraper {
    agency;
    dataFileName;
    ctx;
    propertiesRepo;

    constructor(context, agency) {
        this.ctx = context ?? console;
        this.agency = agency;
        this.dataFileName = agency + 'Properties';
        this.propertiesRepo = new PropertiesRepo(this.ctx);
    }

    readProperties() {
        return this.propertiesRepo.readProperties(this.dataFileName);
    }
    
    saveProperties(liveProperties, diff) {
        this.propertiesRepo.createChangeLog(this.dataFileName, diff);
        this.propertiesRepo.updateProperties(this.dataFileName, liveProperties);
    }

    getPropertyHistory() {
        return this.propertiesRepo.readPropertyHistory(this.dataFileName)
    }

}

module.exports = Scraper;