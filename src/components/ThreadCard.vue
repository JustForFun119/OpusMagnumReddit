<template>
  <v-card hover>
    <v-card-media height="280px" class="pa-2">
      <solution-video :src="thread.url" width="auto" height="100%"></solution-video>
    </v-card-media>
    <v-card-title>
      <span :class="['title', 'mb-2', 'mx-1', {'trunc-text': !show} ]">{{ thread.title }}</span>
      <span class="subheading mx-1">by {{ thread.author }}</span>
      <span class="body-1 mx-1">{{ threadCreatedTime }}</span>
    </v-card-title>
    <v-card-actions>
      <v-btn flat @click="visitThread(thread.permalink)" color="primary">View on Reddit</v-btn>
      <v-spacer></v-spacer>
      <v-btn icon @click="show = !show">
        <v-icon>{{ show ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import SolutionVideo from "./SolutionVideo.vue";
import utils from "../utils";
import moment from "moment";

export default {
  name: "thread-card",
  props: ["thread"],
  components: { SolutionVideo },
  data() {
    return { show: false };
  },
  computed: {
    threadCreatedTime() {
      return moment.unix(this.thread.created_utc).fromNow();
    }
  },
  methods: {
    visitThread(url) {
      const tab = window.open("https://reddit.com" + url, "_blank");
      tab.focus();
    }
  }
};
</script>

<style>
.title.trunc-text {
  height: 1.2em;
}
span.trunc-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>

