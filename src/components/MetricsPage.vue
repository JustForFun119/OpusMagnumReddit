<template>
  <v-container fluid grid-list-md>
    <div v-show="showLoader && threads.length < numThreadsToLoad" class="loader">
      <v-card class="loader-card">
        <div>Loading Reddit Threads...</div>
        <v-progress-circular :size="100" :width="10" :rotate="-90" :value="loadProgress" color="primary" class="mt-2">
          {{ loadProgress }}%
        </v-progress-circular>
        <div>{{ numThreadsLoaded }}/{{ numThreadsToLoad }} threads loaded...</div>
      </v-card>
    </div>
    <v-layout v-bind="$vuetify.breakpoint.smAndUp ? { row: true, wrap: true } : { column: true }">
      <v-flex xs12 sm12 md12 lg12 v-for="(solutions, puzzle) in puzzles" :key="puzzle">
        <metrics-card :puzzle="puzzle" :solutions="solutions" :showSolution="showSolution"></metrics-card>
      </v-flex>
    </v-layout>
    <modal name="solution-modal" v-show="modalSolutionThread" v-model="modalSolutionThread"
      width="95%" height="auto">
      <div v-if="modalSolutionThread" :class="$vuetify.breakpoint.smAndUp ? 'pa-4' : 'pa-2'">
        <div style="text-align: center;">
          <solution-video :src="modalSolutionThread.url" width="100%" videoStyle="max-height: 60vh"></solution-video>
        </div>
        <div class="mt-2">
          <span class="title mb-2 mx-1">{{ modalSolutionThread.title }}</span>
          <span class="subheading mx-1" :style="$vuetify.breakpoint.smAndUp ? {display: 'inline'} : {display: 'block'}">
            by {{ modalSolutionThread.author }}</span>
          <span class="body-1 mx-1">{{ threadRelativeTime }}</span>
        </div>
        <div>
          <v-btn flat @click="visitThread(modalSolutionThread.permalink)" color="primary">View on Reddit</v-btn>
        </div>
      </div>
      <div v-else>
        No thread to show...
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
      numThreadsToLoad: 100,
      numThreadsLoaded: 0,
      showLoader: false,
      loadProgress: 0,
      threads: [],
      modalSolutionThread: null,
      modalSolutionIsLoading: false
    };
  },
  mounted() {
    // fetch reddit threads data
    this.showLoader = true;
    utils
      .threadsFetcher()
      .fetch(this.numThreadsToLoad)
      .progress((threads, newThreads) => {
        // this.threads.push(...newThreads);
        // loading progress percentage
        // this.loadProgress = this.threads.length / this.numThreadsToLoad * 100;
        this.numThreadsLoaded += newThreads.length;
        this.loadProgress = Math.round(
          this.numThreadsLoaded / this.numThreadsToLoad * 100
        );
      })
      .then(threads => {
        console.log(
          "%s/%s threads loaded",
          this.numThreadsLoaded,
          this.numThreadsToLoad
        );
        // show threads after some delay, so loading progress shows 100%
        setTimeout(() => {
          this.showLoader = false;
          this.threads = threads;
        }, 1000);
      });
  },
  computed: {
    puzzles() {
      // group solutions by puzzles
      const puzzles = {};
      this.threads.forEach(thread => {
        // extract solution details: puzzle name, metrics, is/not production puzzle
        const solution = utils.lookForMetrics(thread.title);
        // ignore solution w/o metrics (in thread title)
        if (!solution || !solution.metrics) return;
        if (!puzzles[solution.puzzle]) {
          puzzles[solution.puzzle] = [];
        }
        puzzles[solution.puzzle].push({
          thread: thread,
          metrics: solution.metrics
        });
      });
      return puzzles;
    },
    threadRelativeTime() {
      return moment.unix(this.modalSolutionThread.created_utc).fromNow();
    }
  },
  methods: {
    showSolution(solution) {
      // set modal to show selected solution's thread
      this.modalSolutionThread = solution.thread;
      this.$modal.show("solution-modal"); // open modal
    },
    visitThread(url) {
      const tab = window.open("https://reddit.com" + url, "_blank");
      tab.focus();
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

