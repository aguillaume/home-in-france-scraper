import fetch from "node-fetch"

async function getRawData (url) {
    const res = await fetch(url);
    const data = await res.text();
    return data;
}

export { getRawData };