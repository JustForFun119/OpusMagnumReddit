<template>
  <v-bottom-nav :value="true" :active.sync="selectedTab" color="white" class="pos-fixed">
    <v-btn flat color="teal" @click="goToPage('/featured')">
      <span>Featured</span>
      <v-icon>star</v-icon>
    </v-btn>
    <v-btn flat color="teal" @click="goToPage('/metrics')">
      <span>Metrics</span>
      <v-icon>assessment</v-icon>
    </v-btn>
  </v-bottom-nav>
</template>

<script>
export default {
  name: "bottom-nav",
  data() {
    return { selectedTab: null };
  },
  mounted() {
    // set 'Featured' tab as home page/tab
    this.goToPage("/featured");
    this.selectedTab = 0;
  },
  methods: {
    goToPage: function(route) {
      this.$router.push(route);
    }
  }
};
</script>

<style>
.pos-fixed {
  position: fixed;
}
</style>
