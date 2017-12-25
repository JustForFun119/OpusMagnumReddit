function getGifThreads(dataJson) {
    const gifThreads = [];
    if (dataJson.kind === "Listing") {
        const threads = dataJson.data.children;
        for (let thread of threads) {
            if (isThreadGif(thread.data)) {
                gifThreads.push({
                    kind: getKindName(thread.kind),
                    id: thread.data.id,
                    author: thread.data.author,
                    created_utc: thread.data.created_utc,
                    title: thread.data.title,
                    permalink: thread.data.permalink,
                    url: decodeURI(thread.data.preview.images[0].variants.mp4.source.url),
                    ups: thread.data.ups,
                    downs: thread.data.downs
                });
            }
            if (gifThreads.length >= 20) break;
        }
        return gifThreads;
    }
    return null;

    function isThreadGif(threadData) {
        // parse thread URL to find GIF animation/video links...
        if (threadData.url.match(/https\:\/\/i\.redd\.it\/([\w]+)\.gif/)) {
            // Reddit GIF link
            // console.log("%s is Reddit link", threadData.url);
            return true;
        } else {
            const imgurMatch = threadData.url.match(/https\:\/\/i\.imgur\.com\/([\w]+)\.gifv?/);
            if (imgurMatch) {
                // Imgur GIF link
                // note: ignore GIFV link since it's video instead of image (need to be embedded)
                if (threadData.url.endsWith(".gifv")) return false;
                // console.log("%s is Imgur link", threadData.url);
                return true;
            }
        }
        // test for Gfycat link TODO: find a way to embed Gfycat iframe video
        // else if (threadUrl.match(/https\:\/\/gfycat\.com\/\//)) {
        //     // Gfycat link
        //     console.log("%s is Gfycat link", threadUrl);
        //     return true;
        // }
        return false;
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

const redditApiEndpoint = "https://www.reddit.com/r/opus_magnum.json";
function fetchRedditJson(paramAfter) {
    let apiRequestUrl = redditApiEndpoint;
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

function fetchThreads(numThreads, threadsList = [], listingAfter) {
    return new Promise((resolve, reject) => {
        fetchRedditJson(listingAfter).then(dataJson => {
            // use response listing 'after' value for subsequent fetch
            listingAfter = dataJson.data.after;
            let threads = getGifThreads(dataJson);
            // only need up to number of threads (numThreads)
            threads = threads.slice(0, numThreads - threadsList.length);
            threadsList.push(...threads); // push threads to list (spread threads array to push items)
            // resolve promise of threads list if no. of threads is reached
            if (threadsList.length === numThreads) resolve(threadsList);
            // recursively fetch more threads and add to list if not enough
            // also pass in 'listingAfter' value for Reddit Listing fetch
            else if (threadsList.length < numThreads)
                fetchThreads(numThreads, threadsList, listingAfter).then(resolve, reject);
        });
    });
}

exports.fetchThreads = fetchThreads;
