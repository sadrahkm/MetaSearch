const express = require("express");
const app = express();
const server = require("http").createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Server listening at port %d", port);
});
app.use("/static", express.static("./static/"));
let phrase;
let googleParams;
let yahooParams;
app.get("/", async function (request, response) {
    phrase = request.query.search;
    if (phrase !== undefined) {
        let json = await searchPhrase();
        response.send(json);
    } else
        response.sendFile(__dirname + "/index.html");
});
const SerpApi = require('google-search-results-nodejs');
const search = new SerpApi.GoogleSearch("e0ab17dbaec72a0f814b95e80de85035bf5f9aaec3a53ff683c7bd6aa6f2a0df");

const YAHOO_PRIORITY = 0;
const GOOGLE_PRIORITY = 1;



let googleResults;
let yahooResults;

function transformQueriesToArray(data, engine) {
    let filteredSearch = [];
    data["organic_results"].forEach((item) => {
        filteredSearch.push({
            "engine": engine,
            "title": item.title,
            "rank": item.position,
            "link": item.link,
            "description": item.snippet
        });
    });
    return filteredSearch;
}

Array.prototype.remove = function (index) {
    if (index > -1) {
        // this.splice(index, 1);
        this[index] = undefined;
    }
}

function mergeTheResults() {
    let middleArray = [];
    // console.log(yahooResults)
    googleResults.forEach((googleItem, googleKey) => {
        yahooResults.forEach((yahooItem, yahooKey) => {
            if (googleItem && yahooItem && googleItem.link === yahooItem.link)
                if (googleItem.rank > yahooItem.rank)
                    yahooResults.remove(yahooKey);
                else if (googleItem.rank < yahooItem.rank)
                    googleResults.remove(googleKey);
                else if (GOOGLE_PRIORITY > YAHOO_PRIORITY)
                    yahooResults.remove(yahooKey);
                else
                    googleResults.remove(googleKey);
        });
    });
    // console.log(yahooResults)
    googleResults.forEach((googleItem, googleKey) => {
        middleArray[googleKey] = googleItem;
    });
    yahooResults.forEach((yahooItem, yahooKey) => {
        if (middleArray[yahooKey] === undefined)
            middleArray[yahooKey] = yahooItem
        else if (yahooItem !== undefined)
            middleArray[yahooKey] = [middleArray[yahooKey], yahooItem];
    });
    console.log("------")
    console.log(middleArray)
    console.log("------")
    let finalResult = [];
    middleArray.forEach((item, key) => {
        if (Array.isArray(item))
            if (GOOGLE_PRIORITY > YAHOO_PRIORITY) {
                finalResult.push(item[0]);
                finalResult.push(item[1]);
            } else {
                finalResult.push(item[1]);
                finalResult.push(item[0]);
            }
        else
            finalResult.push(item);
    });
    console.log(finalResult)
    return finalResult;
}


async function searchPhrase() {
    googleParams = {
        engine: "google",
        q: phrase,
        hl: "en",
        gl: "us",
        num: 6
    };

    yahooParams = {
        engine: "yahoo",
        p: phrase,
        pz: 5
    };
    let queryGoogle = new Promise((resolve) => {
        search.json(googleParams, resolve);
    });

    let queryYahoo = new Promise((resolve) => {
        search.json(yahooParams, resolve);
    });
    googleResults = await queryGoogle.then(data => transformQueriesToArray(data, "google"));
    yahooResults = await queryYahoo.then(data => transformQueriesToArray(data, "yahoo"));

    console.log("---- Google ----")
    console.log(googleResults);
    console.log("---- Yahoo ----")
    console.log(yahooResults)
    console.log("---- Final ----")
    return mergeTheResults();
}

