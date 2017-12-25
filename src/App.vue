<template>
  <div id="app">
    <h1>Opus Magnum Display</h1>
    <h2>Powered by <a href="https://reddit.com/r/opus_magnum">r/Opus_Magnum subreddit</a></h2>
    <h3>
      <a href="http://www.zachtronics.com/opus-magnum/">Official Game Page</a> | 
      <a href="https://store.steampowered.com/app/558990/Opus_Magnum/">Steam Store Page</a>
    </h3>
    <div class="item-grid">
        <div v-for="thread in gifThreads" :key="thread.id">
                <div class="item-header">
                  <div class="valign-wrapper">
                    <p class="link-title">
                        <a :href="'https://reddit.com' + thread.permalink">{{ thread.title }}</a>
                    </p>
                    <p class="link-author">by 
                      <span class="author">
                        <a :href="'https://reddit.com/user/' + thread.author">{{ thread.author }}</a>
                      </span>
                    </p>
                  </div>
                </div>
                <div class="item-media">
                  <a :href="thread.url">
                    <video :src="thread.url" :alt="thread.title" autoplay="true" loop="true"/>
                  </a>
                </div>
            </div>
        </div>
  </div>
</template>

<script>
var data = require("./data.js");

export default {
  name: "app",
  data() {
    return {
      gifThreads: []
    };
  },
  created() {
    data.fetchThreads(20).then(threads => {
      this.gifThreads = threads;
    });
  },
  methods: {}
};
</script>

<style>
body {
  background-color: rgb(64, 100, 100);
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a,
.link-title,
.link-author {
  color: white;
}

/* text styles */
h1,
h2,
h3 {
  text-align: center;
  color: white;
}

h1 {
  font-family: "Cinzel", serif;
  font-size: 1.8em;
}

h2 {
  font-family: "Cormorant", serif;
  font-size: 1.4em;
}

h3 {
  font-family: "Crimson Text", serif;
  font-size: 1em;
}

div.item-header {
  min-height: 90px;
  position: relative;
}

div.item-header > div.valign-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
}

.link-title,
.link-author {
  font-family: "Crimson Text", serif;
  text-align: start;
  margin: 0;
}

.link-title {
  font-size: 1.1em;
}

.link-author span.author {
  font-style: italic;
}

.item-media {
  margin: 8px 0;
}

/* items grid */

.item-grid {
  display: grid;
  /* grid-template-rows: 30vw; */
  grid-gap: 16px;
  text-align: center;
}
/* Laptop/Desktop */
@media (min-width: 1025px) {
  .item-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .item-grid img,
  .item-grid video {
    max-width: 30vw;
  }
}
/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) {
  .item-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .item-grid img,
  .item-grid video {
    max-width: 45vw;
  }
}
/* Phone (landscape) */
@media (min-width: 481px) and (max-width: 767px) {
  .item-grid {
    grid-template-columns: repeat(1, 1fr);
  }
  .item-grid img,
  .item-grid video {
    max-width: 70vw;
  }
}
/* Phone (portrait) */
@media (min-width: 320px) and (max-width: 480px) {
  .item-grid {
    grid-template-columns: repeat(1, 1fr);
  }
  .item-grid img,
  .item-grid video {
    max-width: 90vw;
  }
}
</style>
