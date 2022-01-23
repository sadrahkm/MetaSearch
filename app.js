const express = require("express");
const app = express();
const server = require("http").createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Server listening at port %d", port);
});
app.use("/static", express.static("./static/"));
let phrase;
app.get("/", function (request, response) {
    phrase = request.query.search;
    let json = searchPhrase();
    response.send(json);
});
const SerpApi = require('google-search-results-nodejs');
const search = new SerpApi.GoogleSearch("e0ab17dbaec72a0f814b95e80de85035bf5f9aaec3a53ff683c7bd6aa6f2a0df");

const YAHOO_PRIORITY = 0;
const GOOGLE_PRIORITY = 1;

const googleParams = {
    engine: "google",
    q: "Coffee",
    hl: "en",
    gl: "us",
    num: 6
};

const yahooParams = {
    engine: "yahoo",
    p: "Coffee",
    pz: 5
};
let queryGoogle = new Promise((resolve) => {
    search.json(googleParams, resolve);
});

let queryYahoo = new Promise((resolve) => {
    search.json(yahooParams, resolve);
});

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

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

Array.prototype.remove = function (index) {
    if (index > -1) {
        // this.splice(index, 1);
        this[index] = undefined;
    }
}

function mergeTheResults() {
    let finalResult = [];
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
        finalResult[googleKey] = googleItem;
    });
    yahooResults.forEach((yahooItem, yahooKey) => {
        if (finalResult[yahooKey] === undefined)
            finalResult[yahooKey] = yahooItem
        else
            if (yahooItem !== undefined)
                finalResult[yahooKey] = [finalResult[yahooKey], yahooItem];
    });
    // console.log("------")
    // console.log(finalResult)
    // console.log("------")
    finalResult.forEach((item, key) => {
        if (Array.isArray(item))
            if (GOOGLE_PRIORITY > YAHOO_PRIORITY) {
                finalResult[key] = item[0];
                finalResult.insert(key + 1, item[1]);
            } else {
                finalResult[key] = item[1];
                finalResult.insert(key + 1, item[0]);
            }
    });
    console.log(finalResult)
    return finalResult;
}


async function searchPhrase() {
    googleResults = await queryGoogle.then(data => transformQueriesToArray(data, "google"));
    yahooResults = await queryYahoo.then(data => transformQueriesToArray(data, "yahoo"));
    console.log("---- Google ----")
    console.log(googleResults);
    console.log("---- Yahoo ----")
    console.log(yahooResults)
    console.log("---- Final ----")
    return mergeTheResults();
}

searchPhrase();



//
// [
//     {
//         engine: 'google',
//         title: 'Coffee - Wikipedia',
//         rank: 1,
//         link: 'https://en.wikipedia.org/wiki/Coffee',
//         description: 'Coffee is a brewed drink prepared from roasted coffee be
//         ans, the seeds of berries from certain flowering plants in the Coffea genu
//         s. From the coffee fruit, ...'
//     },
//     {
//         engine: 'google',
//         title: '9 Health Benefits of Coffee, Based on Science - Healthline',
//         rank: 2,
//         link: 'https://www.healthline.com/nutrition/top-13-evidence-based-heal
//         th-benefits-of-coffee',
//         description: 'Coffee is a major source of antioxidants in the diet. It
//         has many health benefits, such as improved brain function and a lower ris
//         k of several diseases.'
//     },
//     {
//         engine: 'google',
//         title: "Peet's Coffee: The Original Craft Coffee",
//         rank: 3,
//         link: 'https://www.peets.com/',
//         description: "Since 1966, Peet's Coffee has offered superior coffees a
//         nd teas by sourcing the best quality coffee beans and tea leaves in the wo
//         rld and adhering to strict ..."
//     },
//     {
//         engine: 'google',
//         title: 'Home | The Coffee Bean & Tea Leaf',
//         rank: 4,
//         link: 'https://www.coffeebean.com/',
//         description: 'Icon of a bag of coffee being shipped to you. Subscripti
//         ons. Never run out of your favorite coffees, teas and powders again with o
//         ur auto-delivery subscription.'
//     }
// ]
//
//     [
//     {
//         engine: 'yahoo',
//         title: 'Coffee - Wikipedia',
//         rank: 1,
//         link: 'https://en.wikipedia.org/wiki/Coffee',
//         description: 'Coffee is a brewed drink prepared from roasted coffee be
//         ans, the seeds of berries from certain flowering plants in the Coffea genu
//         s. From the coffee fruit, the seeds are separated to produce a stable, raw
//         product: unroasted green coffee.'
//     },
//         {
//             engine: 'yahoo',
//             title: 'Amazon.com: coffee',
//             rank: 2,
//             link: 'https://www.amazon.com/coffee/s?k=coffee',
//             description: 'Coffee is loved around the world for its delicious taste
//             and its ability to boost energy. A few people can start their day without
//             a delicious cup, but no matter the time of day, the quality of your coffe
//             e is incredibly important. There are thousands of options on the market; s
//             ome are rich and strong, while others are delicate and smooth.'
//         },
//         {
//             engine: 'yahoo',
//             title: 'COFFEE: Overview, Uses, Side Effects, Precautions ...',
//             rank: 3,
//             link: 'https://www.webmd.com/vitamins/ai/ingredientmono-980/coffee',
//             description: undefined
//         },
//         {
//             engine: 'yahoo',
//             title: 'coffee | Origin, Types, Uses, History, & Facts | Britannica',
//             rank: 4,
//             link: 'https://www.britannica.com/topic/coffee',
//             description: 'coffee, beverage brewed from the roasted and ground seed
//             s of the tropical evergreen coffee plants of African origin. Coffee is one
//             of the three most popular beverages in the world (alongside water and tea
// ) and one of the most profitable international commodities. Though coffee
// is the basis for an endless array of beverages, its popularity is ...'
// },
// {
//     engine: 'yahoo',
//         title: 'Coffee, Tea, Nuts, Sweets, Retail, Wholesale, Coffee Roasting
// ...',
//     rank: 5,
//         link: 'https://tmwardcoffee.com/',
//     description: 'Coffee roasting, importing, blending - coffees from arou
//     nd the world. Wholesale coffee, tea, nuts - retail coffee, tea, nuts. Spec
//     ializing in unique coffee blends, coffee flavors, and green coffee. Huge s
//     election of coffee, tea, nuts. dried fruits, sweets, and gift baskets all
//     under one roof.'
// }
// ]

