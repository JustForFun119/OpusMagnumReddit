<template>
  <v-container fluid grid-list-md>
    <v-layout v-bind="$vuetify.breakpoint.smAndUp ? { row: true, wrap: true } : { column: true }">
      <v-flex xs12 sm6 md4 lg3 v-for="post in gifPosts" :key="post.id">
        <solution-card :post="post"></solution-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import SolutionCard from "./SolutionCard.vue";
import utils from "../utils.js";

export default {
  name: "featured-page",
  components: { SolutionCard },
  data() {
    return {
      gifPosts: []
    };
  },
  created() {
    utils
      .postsFetcher()
      .fetch(10)
      .then(posts => {
        this.gifPosts = posts;
      });
  }
};
</script>

<style>
.card-media {
  height: 100%;
}

span.trunc-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>

