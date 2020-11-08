function getGifThreads(dataJson) {
    const gifThreads = [];
    if (dataJson.kind === "Listing") {
        const threads = dataJson.data.children;
        for (let thread of threads) {
            const animationMediaURL = getThreadAnimMediaURL(thread.data);
            if (animationMediaURL != null) {
                gifThreads.push({
                    kind: getKindName(thread.kind),
                    id: thread.data.id,
                    author: thread.data.author,
                    created_utc: thread.data.created_utc,
                    title: thread.data.title,
                    permalink: thread.data.permalink,
                    url: animationMediaURL
                });
            }
            if (gifThreads.length >= 20) break;
        }
        return gifThreads;
    }
    return null;

    function getThreadAnimMediaURL(threadData) {
        // Parse thread URL to find GIF animation/video links...
        // GIF from i.redd.it
        if (threadData.url.match(/https\:\/\/i\.redd\.it\/([\w]+)\.gif/)) {
            // Reddit GIF link
            // console.log("%s is Reddit link", threadData.url);
            return threadData.preview.images[0].variants.mp4.source.url;
        } else if (threadData.domain === "v.redd.it") { // video from v.redd.it
            // console.log("v.redd.it video", threadData.secure_media.reddit_video.fallback_url);
            return threadData.secure_media.reddit_video.fallback_url;
        } else {
            // GIF/GIFV from Imgur
            const imgurMatch = threadData.url.match(/https\:\/\/i\.imgur\.com\/([\w]+)\.gifv?/);
            if (imgurMatch) {
                // Imgur GIF link
                if (threadData.url.endsWith(".gifv")) return threadData.url;
                // console.log("%s is Imgur link", threadData.url);
                return threadData.preview.images[0].variants.mp4.source.url;
            }
        }
        // test for Gfycat link TODO: find a way to embed Gfycat iframe video
        // else if (threadUrl.match(/https\:\/\/gfycat\.com\/\//)) {
        //     // Gfycat link
        //     console.log("%s is Gfycat link", threadUrl);
        //     return null;
        // }
        return null;
    }

    function getKindName(kind) {
        switch (kind) {
            case "t1": return "comment";
            case "t2": return "account"; // probably n/a
            case "t3": return "link";
            case "t4": return "message";
            case "t5": return "subreddit"; // probably n/a
            case "t6": return "award"; // probably n/a
        }
    }
}
exports.getGifThreads = getGifThreads;

const corsProxyURL = "https://cors-anywhere.herokuapp.com/"; // added for FireFox-Reddit CORS
const redditApiEndpoint = "https://www.reddit.com/r/opus_magnum.json";
function fetchRedditJson(paramAfter) {
    let apiRequestUrl = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
        ? `${corsProxyURL}${redditApiEndpoint}`
        : redditApiEndpoint;
    apiRequestUrl += '?raw_json=1'; // ask for unescaped response string i.e. '&' instead of '&amp;'
    // add 'after' parameter to API request URL if any
    if (paramAfter) apiRequestUrl += `&after=${paramAfter}`;
    // fetch subreddit JSON
    return new Promise((resolve, reject) => {
        fetch(apiRequestUrl).then(response => {
            if (response.status === 200) resolve(response.json());
        }).catch(error => {
            console.log("Error fetching subreddit listing JSON", err);
            reject(error);
        });
    });
}

function threadsFetcher() {
    const threadsList = []; let listingAfter;
    let progCallback, fetchResolve, fetchReject;
    return {
        fetch: function (numThreads) {
            fetchRedditJson(listingAfter).then(dataJson => {
                // use response listing 'after' value for subsequent fetch
                listingAfter = dataJson.data.after;
                let threads = getGifThreads(dataJson);
                // only need up to number of threads (numThreads)
                threads = threads.slice(0, numThreads - threadsList.length);
                threadsList.push(...threads); // push threads to list (spread threads array to push items)
                if (progCallback) progCallback(threadsList, threads); // deliver fetch progress
                // resolve promise of threads list if:
                // no. of threads is reached OR reddit API returned end of listing i.e. no 'after'
                if (fetchResolve && (threadsList.length === numThreads || !listingAfter)) fetchResolve(threadsList);
                // recursively fetch more threads and add to list if not enough
                // also pass in 'listingAfter' value for Reddit Listing fetch
                else if (threadsList.length < numThreads) this.fetch(numThreads);
            });
            return this;
        },
        progress: function (cb) { progCallback = cb; return this; },
        then: function (resolve, reject) { fetchResolve = resolve; fetchReject = reject; return this; },
    };
}
exports.threadsFetcher = threadsFetcher;

// all puzzle titles of Opus Magnum
const puzzleTitles = {
    normal: [
        // Prologue
        'Stabilized Water',
        // Chapter 1
        'Refined Gold',
        'Face Powder',
        'Waterproof Sealant',
        'Hangover Cure',
        'Airship Fuel',
        'Precision Machine Oil',
        'Health Tonic',
        'Stamina Potion',
        // Chapter 2
        'Hair Product',
        'Rocket Propellant',
        'Mist of Incapacitation',
        'Explosive Phial',
        'Armor Filament',
        'Courage Potion',
        'Surrender Flare',
        // Chapter 3
        'Alcohol Separation',
        'Water Purifier',
        'Seal Solvent',
        'Climbing Rope Fiber',
        'Warming Tonic',
        'Life-Sensing Potion',
        'Very Dark Thread',
        // Chapter 4
        'Litharge Separation',
        'Stain Remover',
        'Sword Alloy',
        'Invisible Ink',
        'Purified Gold',
        'Alchemical Jewel',
        'Golden Thread',
        // Chapter 5
        'Mist of Hallucination',
        'Timing Crystal',
        'Voltaic Coil',
        'Unstable Compound',
        'Curious Lipstick',
        'Universal Solvent'
    ],
    production: [
        // Appendix (Production Alchemy)
        'Silver Paint',
        'Viscous Sludge',
        'Fragrant Powders',
        'Rat Poison',
        // TODO: ... haven't finished other production puzzles yet ...
    ]
};
function identifySolution(threadTitle) {
    let isProduction = false;
    // puzzle title/name
    // find puzzle name in normal puzzle names
    let puzzle = puzzleTitles.normal.find(
        (puzzleTitle) => threadTitle.match(new RegExp(puzzleTitle, 'i')));
    if (!puzzle) {
        // find puzzle name in production puzzle names
        puzzle = puzzleTitles.production.find(
            (puzzleTitle) => threadTitle.match(new RegExp(puzzleTitle, 'i')));
        isProduction = true; // this is a production puzzle
        if (!puzzle) return undefined; // cannot identify solution-puzzle
    }
    // solution metrics
    let metrics;
    if (match = threadTitle.match(/(\d+)g? ?\/ ?(\d+)c? ?\/ ?(\d+)a?/i)) {
        // metrics format for normal puzzle i.e. gold/cost/area
        metrics = { cost: parseInt(match[1]), cycles: parseInt(match[2]), area: parseInt(match[3]) };
    } else if (match = threadTitle.match(/(\d+)g? ?\/ ?(\d+)c? ?\/ ?(\d+)i?/i)) {
        // metrics format for production puzzle i.e. gold/cost/instructions
        metrics = { cost: parseInt(match[1]), cycles: parseInt(match[2]), instructions: parseInt(match[3]) };
    }
    return { puzzle: puzzle, metrics: metrics || null, isProduction: isProduction };
}
exports.lookForMetrics = identifySolution;
