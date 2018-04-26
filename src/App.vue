<template>
  <div id="app">
    <v-app>
      <app-bar></app-bar>
      <v-content class="fit-height">
        <router-view>
          <v-container></v-container>
        </router-view>
      </v-content>
      <bottom-nav></bottom-nav>
    </v-app>
  </div>
</template>

<script>
import AppBar from "./components/AppBar.vue";
import BottomNav from "./components/BottomNav.vue";

export default {
  name: "app",
  components: { AppBar, BottomNav },
  data() {
    return {};
  }
};
</script>

<style>
.fit-height {
  max-height: 100vh;
}
</style>
