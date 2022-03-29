// import fetch from "node-fetch"
const fetch = require("node-fetch");

async function getRawData (url) {
    const res = await fetch(url);
    const data = await res.text();
    return data;
}

module.exports = { getRawData };