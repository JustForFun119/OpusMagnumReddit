function getGifPosts(dataJson) {
    const gifPosts = [];
    if (dataJson.kind === "Listing") {
        const posts = dataJson.data.children;
        for (let post of posts) {
            const animationMediaURL = getPostAnimMediaURL(post.data);
            if (animationMediaURL != null) {
                gifPosts.push({
                    kind: getKindName(post.kind),
                    id: post.data.id,
                    author: post.data.author,
                    created_utc: post.data.created_utc,
                    title: post.data.title,
                    permalink: post.data.permalink,
                    url: animationMediaURL
                });
            }
            if (gifPosts.length >= 20) break;
        }
        return gifPosts;
    }
    return null;

    function getPostAnimMediaURL(postData) {
        // Parse post URL to find GIF animation/video links...
        // GIF from i.redd.it
        if (postData.url.match(/https\:\/\/i\.redd\.it\/([\w]+)\.gif/)) {
            // Reddit GIF link
            // console.log("%s is Reddit link", postData.url);
            return postData.preview.images[0].variants.mp4.source.url;
        } else if (postData.domain === "v.redd.it") { // video from v.redd.it
            // console.log("v.redd.it video", postData.secure_media.reddit_video.fallback_url);
            return postData.secure_media.reddit_video.fallback_url;
        } else {
            // GIF/GIFV from Imgur
            const imgurMatch = postData.url.match(/https\:\/\/i\.imgur\.com\/([\w]+)\.gifv?/);
            if (imgurMatch) {
                // Imgur GIF link
                if (postData.url.endsWith(".gifv")) return postData.url;
                // console.log("%s is Imgur link", postData.url);
                return postData.preview.images[0].variants.mp4.source.url;
            }
        }
        // test for Gfycat link TODO: find a way to embed Gfycat iframe video
        // else if (postUrl.match(/https\:\/\/gfycat\.com\/\//)) {
        //     // Gfycat link
        //     console.log("%s is Gfycat link", postUrl);
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
exports.getGifPosts = getGifPosts;

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

function postsFetcher(fetchlistingAfter) {
    const postsList = []; let listingAfter = fetchlistingAfter;
    let progCallback, fetchResolve, fetchReject;
    return {
        fetch: function (numPosts) {
            fetchRedditJson(listingAfter).then(dataJson => {
                // use response listing 'after' value for subsequent fetch
                listingAfter = dataJson.data.after;
                let posts = getGifPosts(dataJson);
                // only need up to number of posts (numPosts)
                posts = posts.slice(0, numPosts - postsList.length);
                postsList.push(...posts); // push posts to list (spread posts array to push items)
                if (progCallback) progCallback(postsList, posts); // deliver fetch progress
                // resolve promise of posts list if:
                // no. of posts is reached OR reddit API returned end of listing i.e. no 'after'
                if (fetchResolve && (postsList.length === numPosts || !listingAfter)) {
                    fetchResolve(postsList, listingAfter);
                }
                // recursively fetch more posts and add to list if not enough
                // also pass in 'listingAfter' value for Reddit Listing fetch
                else if (postsList.length < numPosts) this.fetch(numPosts);
            });
            return this;
        },
        progress: function (cb) { progCallback = cb; return this; },
        then: function (resolve, reject) { fetchResolve = resolve; fetchReject = reject; return this; },
    };
}
exports.postsFetcher = postsFetcher;

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
        'Very Dark Post',
        // Chapter 4
        'Litharge Separation',
        'Stain Remover',
        'Sword Alloy',
        'Invisible Ink',
        'Purified Gold',
        'Alchemical Jewel',
        'Golden Post',
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
function identifySolution(postTitle) {
    let isProduction = false;
    // puzzle title/name
    // find puzzle name in normal puzzle names
    let puzzle = puzzleTitles.normal.find(
        (puzzleTitle) => postTitle.match(new RegExp(puzzleTitle, 'i')));
    if (!puzzle) {
        // find puzzle name in production puzzle names
        puzzle = puzzleTitles.production.find(
            (puzzleTitle) => postTitle.match(new RegExp(puzzleTitle, 'i')));
        isProduction = true; // this is a production puzzle
        if (!puzzle) return undefined; // cannot identify solution-puzzle
    }
    // solution metrics
    let metrics;
    if (match = postTitle.match(/(\d+)g? ?\/ ?(\d+)c? ?\/ ?(\d+)a?/i)) {
        // metrics format for normal puzzle i.e. gold/cost/area
        metrics = { cost: parseInt(match[1]), cycles: parseInt(match[2]), area: parseInt(match[3]) };
    } else if (match = postTitle.match(/(\d+)g? ?\/ ?(\d+)c? ?\/ ?(\d+)i?/i)) {
        // metrics format for production puzzle i.e. gold/cost/instructions
        metrics = { cost: parseInt(match[1]), cycles: parseInt(match[2]), instructions: parseInt(match[3]) };
    }
    return { puzzle: puzzle, metrics: metrics || null, isProduction: isProduction };
}
exports.lookForMetrics = identifySolution;
