<template>
  <v-container fluid grid-list-md>
    <div v-show="isLoading" class="loader">
      <v-card class="loader-card">
        <div>Loading Reddit Posts...</div>
        <v-progress-circular :size="100" :width="10" :rotate="-90" :value="loadProgress" color="primary" class="mt-2">
          {{ loadProgress }}%
        </v-progress-circular>
        <div>{{ numPostsPerLoad - (numPostsLoadedTotal - numPostsLoaded) }}/{{ numPostsPerLoad }} posts loaded...</div>
      </v-card>
    </div>
    <div>
      <span>Metrics from {{ numPostsLoaded }} Reddit posts</span>
        <v-btn :loading="isLoading" @click="loadPosts(numPostsPerLoad)" color="secondary">
          Load {{ numPostsPerLoad }} more posts</v-btn>
    </div>
    <v-divider></v-divider>
    <v-layout v-bind="$vuetify.breakpoint.smAndUp ? { row: true, wrap: true } : { column: true }">
      <v-flex xs12 sm12 md12 lg12 v-for="(solutions, puzzle) in puzzles" :key="puzzle">
        <metrics-card :puzzle="puzzle" :solutions="solutions" :showSolution="showSolution"></metrics-card>
      </v-flex>
    </v-layout>
    <modal name="solution-modal" v-show="modalSolutionPost" v-model="modalSolutionPost"
      width="95%" height="auto">
      <div v-if="modalSolutionPost" :class="$vuetify.breakpoint.smAndUp ? 'pa-4' : 'pa-2'">
        <div style="text-align: center;">
          <solution-video :src="modalSolutionPost.url" width="100%" videoStyle="max-height: 60vh"></solution-video>
        </div>
        <div class="mt-2">
          <span class="title mb-2 mx-1">{{ modalSolutionPost.title }}</span>
          <span class="subheading mx-1" :style="$vuetify.breakpoint.smAndUp ? {display: 'inline'} : {display: 'block'}">
            by {{ modalSolutionPost.author }}</span>
          <span class="body-1 mx-1">{{ postRelativeTime }}</span>
        </div>
        <div>
          <v-btn flat @click="visitPost(modalSolutionPost.permalink)" color="primary">View on Reddit</v-btn>
        </div>
      </div>
      <div v-else>
        No post to show...
      </div>
    </modal>
  </v-container>
</template>

<script>
import MetricsCard from "./MetricsCard.vue";
import SolutionVideo from "./SolutionVideo.vue";

import utils from "../utils";
import moment from "moment";

export default {
  name: "metrics-page",
  components: { MetricsCard, SolutionVideo },
  data() {
    return {
      numPostsPerLoad: 100,
      numPostsLoaded: 0,
      numPostsLoadedTotal: 0,
      isLoading: false,
      loadProgress: 0,
      posts: [],
      fetchlistingAfter: null,
      modalSolutionPost: null,
      modalSolutionIsLoading: false
    };
  },
  mounted() {
    // fetch reddit posts data
    this.loadPosts(this.numPostsPerLoad);
  },
  computed: {
    puzzles() {
      // group solutions by puzzles
      const puzzles = {};
      this.posts.forEach(post => {
        // extract solution details: puzzle name, metrics, is/not production puzzle
        const solution = utils.lookForMetrics(post.title);
        // ignore solution w/o metrics (in post title)
        if (!solution || !solution.metrics) return;
        if (!puzzles[solution.puzzle]) {
          puzzles[solution.puzzle] = [];
        }
        // ignore duplicate posts
        if (puzzles[solution.puzzle].find(p => p.post.id === post.id) != null) return;
        puzzles[solution.puzzle].push({
          post: post,
          metrics: solution.metrics
        });
      });
      return puzzles;
    },
    postRelativeTime() {
      return moment.unix(this.modalSolutionPost.created_utc).fromNow();
    }
  },
  methods: {
    showSolution(solution) {
      // set modal to show selected solution's post
      this.modalSolutionPost = solution.post;
      this.$modal.show("solution-modal"); // open modal
    },
    visitPost(url) {
      const tab = window.open("https://reddit.com" + url, "_blank");
      tab.focus();
    },
    loadPosts(numPostsToLoad) {
      this.numPostsLoadedTotal += numPostsToLoad;
      this.loadProgress = 0;
      this.isLoading = true;

      let numPostsBeforeLoad = this.numPostsLoaded;
      utils
        .postsFetcher(this.fetchlistingAfter)
        .fetch(numPostsToLoad)
        .progress((posts, newPosts) => {
          // this.posts.push(...newPosts);
          // loading progress percentage
          // this.loadProgress = this.posts.length / numPostsToLoad * 100;
          this.numPostsLoaded += newPosts.length;
          this.loadProgress = Math.round(this.numPostsLoaded / this.numPostsLoadedTotal * 100);
          console.log("%s/%s posts loaded", this.numPostsLoaded, this.numPostsLoadedTotal);
        })
        .then((posts, fetchlistingAfter) => {
          this.fetchlistingAfter = fetchlistingAfter;
          console.log("%s/%s posts loaded", this.numPostsLoaded, this.numPostsLoadedTotal);
          // show posts after some delay, so loading progress shows 100%
          setTimeout(() => {
            this.isLoading = false;
            this.posts.push(...posts);
          }, 1000);
        });
    }
  }
};
</script>

<style scoped>
.loader {
  position: absolute;
  top: 0;
  bottom: 0%;
  left: 0;
  right: 0%;
  padding-top: 20vh;
  background-color: #0004;
  text-align: center;
  z-index: 42;
}
.loader-card {
  width: 25vh;
  padding: 16px;
  margin: auto;
  text-align: center;
}
</style>

