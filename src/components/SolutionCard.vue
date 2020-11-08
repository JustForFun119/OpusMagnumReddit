<template>
  <v-card hover>
    <v-card-media class="pt-2 pb-2">
      <solution-video :src="post.url" width="auto" height="100%"></solution-video>
    </v-card-media>
    <v-card-title>
      <span :class="['title', 'mb-2', 'mx-1', {'trunc-text': !show} ]">{{ post.title }}</span>
      <span class="subheading mx-1">by {{ post.author }}</span>
      <span class="body-1 mx-1">{{ postCreatedTime }}</span>
    </v-card-title>
    <v-card-actions>
      <v-btn flat @click="visitPost(post.permalink)" color="primary">View on Reddit</v-btn>
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
  name: "solution-card",
  props: ["post"],
  components: { SolutionVideo },
  data() {
    return { show: false };
  },
  computed: {
    postCreatedTime() {
      return moment.unix(this.post.created_utc).fromNow();
    }
  },
  methods: {
    visitPost(url) {
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

