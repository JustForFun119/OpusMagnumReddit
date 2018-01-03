<template>
  <v-container fluid grid-list-md>
    <v-layout v-bind="layoutAsRow ? { row: true, wrap: true } : { column: true }">
      <v-flex xs12 sm6 md4 lg3 v-for="thread in gifThreads" :key="thread.id">
        <thread-card :thread="thread"></thread-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import ThreadCard from "./ThreadCard.vue";
import utils from "../utils.js";

export default {
  name: "featured-page",
  components: { ThreadCard },
  data() {
    return {
      gifThreads: []
    };
  },
  created() {
    utils
      .threadsFetcher()
      .fetch(10)
      .then(threads => {
        this.gifThreads = threads;
      });
  },
  computed: {
    layoutAsRow() {
      return this.$vuetify.breakpoint.smAndUp;
    }
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

