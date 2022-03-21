import fetch from "node-fetch"
import * as cheerio from 'cheerio';
import * as fs from "fs"
import * as nodemailer from "nodemailer"

// function to get the raw data
const getRawData = (URL) => {
   return fetch(URL)
      .then((response) => response.text())
      .then((data) => {
         return data;
      });
};

// URL for data
const baseUrl = "https://www.laforet.com";
const URL = baseUrl+"/acheter/achat-maison?filter%5Bcities%5D=13117%2C3000874%2C13015&filter%5Barea%5D=43.4509%2C5.2654%2C10%2CVitrolles&filter%5Bmax%5D=500000&filter%5Bbedrooms%5D=3&filter%5Bsurface%5D=90&filter%5Bsurface_ground%5D=400";

let properties = [];
// start of the program
async function  scrapeData() {
    const rawData = await getRawData(URL);
    // parsing the data
    const $ = cheerio.load(rawData);
    let propertiesHtml = $(".property-card");

    propertiesHtml.each((i, el) => {
        let property = { title:"", price:""};
        property.link = baseUrl + $(el).children("a").attr("href");
        property.title = $(el).find(".property-card__title").text().trim();
        property.price = $(el).find(".property-card__price").text().replace("\n", "").trim();
        properties.push(property);
        
    });
    
}

const jsonFileNameLaForet = "laForetProperties.json";

function loadLaForetPropertiesJson() {
    try {
        let data = fs.readFileSync(`savedData/${jsonFileNameLaForet}`);
        return JSON.parse(data);
    } catch (err) {
        console.error(err)
        return []
    }
}

function compareLaForetProperties(oldProperties, newProperties) {
    let removed = [];
    let added = [];

    oldProperties.forEach(oldProp => {
        if(!newProperties.find(np => np.link == oldProp.link)) {
            console.log(`Property ${oldProp.title} has been removed.`)
            console.log(JSON.stringify(oldProp, null, 2));
            removed.push(oldProp);
        }
    })

    newProperties.forEach(newProp => {
        if(!oldProperties.find(np => np.link == newProp.link)) {
            console.log(`Property ${newProp.title} is new!!!.`)
            console.log(JSON.stringify(newProp, null, 2));
            added.push(newProp);
        }
    })

    return {
        propertiesAdded: added,
        propertiesRemoved: removed
    }
}

function onFileWrite(err) {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Successfully written file");
}

function sendEmail(properties) {
    try {
        console.log("Trying to send email...");

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'gllm.lp.17@gmail.com',
                pass: 'vykwzhmpvzshrdxh'
            }
        });
    
        var mailOptions = {
            from: 'gllm.lp.17@gmail.com',
            to: 'guillaumealpe@hotmail.com, roksana.bln@gmail.com',
            subject: 'New Properties from La Foret',
            text: JSON.stringify(properties, null, 2)
        };
    
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (error) {
        console.log("Failed to send email.");

        console.error(error);
    }
    
}

// invoking the main function
console.log(`Scrape Home Starting...`);
scrapeData()
    .then(() => {

        let oldLaForetProperties = loadLaForetPropertiesJson();
        console.log(`Scraped a bunch... fround ${properties.length} properties. Had ${oldLaForetProperties.length} in saved.`);

        let res = compareLaForetProperties(oldLaForetProperties, properties);
        if(res.propertiesAdded.length > 0) {
            // New properties send email
            sendEmail(res.propertiesAdded)
        }

        if(res.propertiesAdded.length > 0 || res.propertiesRemoved.length > 0) {
            const date = new Date();
            const [year, month, day, hour, minutes] = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()];
            fs.writeFile(`savedData/${year}${month}${day}_${hour}${minutes}ChangeLog_`+jsonFileNameLaForet, 
                JSON.stringify(res, null, 2), 
                onFileWrite);

            fs.writeFile(`savedData/${jsonFileNameLaForet}`, JSON.stringify(properties, null, 2), onFileWrite)
        } else {
            console.log("Nothing new.")
        }
        // console.log(`There are ${properties.length} properties`);
        // properties.forEach(property => {
        //     console.log(JSON.stringify(property, null, 2));
        // });
    });
