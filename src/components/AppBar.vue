<template>
  <v-toolbar dark color="primary" app fixed>
    <v-toolbar-title>Opus Magnum Display</v-toolbar-title>
    <v-spacer></v-spacer>
    <div class="hidden-md-and-up">
      <v-menu left>
        <v-btn icon slot="activator">
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile @click="visitSubreddit()">
            <v-list-tile-title>Subreddit</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="visitOfficialWebsite()">
            <v-list-tile-title>Website</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="visitSteamStore()">
            <v-list-tile-title>Steam Store</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </div>
    <div class="hidden-sm-and-down">
      <v-btn @click="visitSubreddit()">
        Subreddit
        <v-icon right>question_answer</v-icon>
      </v-btn>
      <v-btn @click="visitOfficialWebsite()">
        Game Website
        <v-icon right>videogame_asset</v-icon>
      </v-btn>
      <v-btn @click="visitSteamStore()">
        Steam Store
        <v-icon right>shopping_cart</v-icon>
      </v-btn>
    </div>
  </v-toolbar>
</template>

<script>
function openUrl(url) {
  const tab = window.open(url, "_blank");
  tab.focus();
}

export default {
  name: "app-bar",
  methods: {
    visitSubreddit: function() {
      openUrl("https://reddit.com/r/opus_magnum");
    },
    visitOfficialWebsite: function() {
      openUrl("https://www.zachtronics.com/opus-magnum/");
    },
    visitSteamStore: function() {
      openUrl("https://store.steampowered.com/app/558990/Opus_Magnum/");
    }
  }
};
</script>

<style>

</style>
