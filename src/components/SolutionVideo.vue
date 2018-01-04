<template>
  <div class="solution-video-container">
    <div v-show="!loaded" class="pa-4">
      Loading Solution...
      <v-progress-circular indeterminate :size="50" :width="3" color="primary" 
        class="mt-2" style="display: block; margin: auto;"></v-progress-circular>
    </div>
    <video :src="src" autoplay loop playsinline muted
      :width="width" :height="height" :style="videoStyle || null"
      v-show="loaded" @loadstart="loaded = false" @canplay="loaded = true">
    </video>
  </div>
</template>
<script>
export default {
  name: "solution-video",
  props: ["src", "width", "height", "videoStyle"],
  data() {
    return { loaded: false };
  }
};
</script>
<style>
.solution-video-container {
  width: 100%;
  text-align: center;
  display: flex;
  align-items: center;
}
.solution-video-container > div {
  margin: auto;
}
</style>

