const express = require("express");
const app = express();
const server = require("http").createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Server listening at port %d", port);
});
app.use("/static", express.static("./static/"));
app.get("/", function (request, response) {
    let phrase = request.query.search;
    let json = searchPhrase(phrase)
    response.send(json);
});
const SerpApi = require('google-search-results-nodejs');
const search = new SerpApi.GoogleSearch("e0ab17dbaec72a0f814b95e80de85035bf5f9aaec3a53ff683c7bd6aa6f2a0df");

const googleParams = {
    engine: "google",
    q: "Coffee",
    hl: "en",
    gl: "us",
    num: 5
};

const yahooParams = {
    engine: "yahoo",
    p: "Coffee",
    hl: "en",
    gl: "us",
    num: 2
};
let queryGoogle = new Promise((resolve) => {
    search.json(googleParams, resolve);
});

let queryYahoo = new Promise((resolve) => {
    search.json(yahooParams, resolve);
});

let googleResults = [];
let yahooResults = [];

function transformQueriesToArray(data) {
    // console.log(data["organic_results"])
    let result = [];
    data["organic_results"].forEach((item) => {
        googleResults.push({
            "title": item.title,
            "rank": item.position,
            "link": item.link,
            "description": item.snippet
        });
    });
    return googleResults;
}
function searchPhrase(){
    queryGoogle.then((data) => {
        googleResults = transformQueriesToArray(data);
        console.log(googleResults);
    });
}
