<template>
  <v-card>
    <!-- metric card title -->
    <v-card-title class="title">{{ puzzle }}</v-card-title>
    <!-- metric charts layout: -->
    <!-- >=MD screen size: row of metric charts -->
    <v-layout v-if="$vuetify.breakpoint.mdAndUp" row justify-space-around>
      <v-flex sm4>
        <metric-chart name="Cost" :metrics="getMetricOf(solutions, m => m.cost)" suffix="G"></metric-chart>
      </v-flex>
      <v-flex sm4>
        <metric-chart name="Cycles" :metrics="getMetricOf(solutions, m => m.cycles)"></metric-chart>
      </v-flex>
      <v-flex sm4 v-if="solutions[0].metrics.area">
        <metric-chart name="Area" :metrics="getMetricOf(solutions, m => m.area)"></metric-chart>
      </v-flex>
      <v-flex sm4 v-if="solutions[0].metrics.instructions">
        <metric-chart name="Instructions" :metrics="getMetricOf(solutions, m => m.instructions)"></metric-chart>
      </v-flex>
    </v-layout>
    <!-- <MD screen size: carousel of metric charts -->
    <v-carousel v-else v-model="carousel" :cycle="false" class="metrics-carousel" hide-controls>
      <v-carousel-item src="">
        <v-card>
          <metric-chart name="Cost" :metrics="getMetricOf(solutions, m => m.cost)" suffix="G"></metric-chart>
        </v-card>
      </v-carousel-item>
      <v-carousel-item src="">
        <metric-chart name="Cycles" :metrics="getMetricOf(solutions, m => m.cycles)"></metric-chart>
      </v-carousel-item>
      <v-carousel-item src="">
        <metric-chart v-if="solutions[0].metrics.area" name="Area" :metrics="getMetricOf(solutions, m => m.area)"></metric-chart>
        <metric-chart v-if="solutions[0].metrics.instructions" name="Instructions" :metrics="getMetricOf(solutions, m => m.instructions)"></metric-chart>
      </v-carousel-item>
    </v-carousel>
    <v-card-actions>
      <v-spacer></v-spacer>
      <!-- button for toggling metrics leaderboard -->
      <v-btn flat @click="cardShowMore = !cardShowMore">
        Show Leaderboard <v-icon>{{ cardShowMore ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
      </v-btn>
    </v-card-actions>
    <v-slide-y-transition>
      <v-card-text v-show="cardShowMore">
        <!-- list of solutions metrics from reddit posts -->
        <v-list>
          <v-list-tile v-for="(solution, index) in sortSolutionsByMetric(solutions)" :key="index">
              <v-list-tile-content>
                <span class="title">{{ getMetricForList(solution) }}</span> by {{ solution.post.author }}
              </v-list-tile-content>
              <v-list-tile-action>
                <!-- action to view solution in popup modal -->
                <v-btn flat @click="showSolution(solution)"><v-icon>open_in_new</v-icon></v-btn>
              </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card-text>
    </v-slide-y-transition>
  </v-card>
</template>

<script>
import MetricChart from "./MetricChart.vue";

export default {
  name: "metrics-page",
  props: ["puzzle", "solutions", "showSolution"],
  components: { MetricChart },
  data() {
    return {
      carousel: null, // metric charts carousel v-model
      cardShowMore: false // card 'show more' toggle state
    };
  },
  mounted() {},
  methods: {
    /** get metric value of a metric type, given a solution */
    getMetricOf(solution, ofType) {
      return solution.map(s => s.metrics).map(ofType);
    },
    /** sort solutions by metric selected by carousel;
     * or no sort if viewing in row of charts (no carousel) */
    sortSolutionsByMetric(solutions) {
      let metric;
      switch (this.carousel) {
        case 0:
          metric = "cost";
          break;
        case 1:
          metric = "cycles";
          break;
        case 2:
          metric =
            "instructions" in solutions[0].metrics ? "instructions" : "area";
          break;
        default:
          // no carousel value: showing charts as row -> no sorting
          return solutions;
      }
      return solutions.sort((a, b) => a.metrics[metric] > b.metrics[metric]);
    },
    /** get metric object key by carousel model */
    getMetricForList(solution) {
      switch (this.carousel) {
        case 0:
          return solution.metrics["cost"];
        case 1:
          return solution.metrics["cycles"];
        case 2:
          return "instructions" in solution.metrics
            ? solution.metrics["instructions"]
            : solution.metrics["area"];
        default:
          return Object.values(solution.metrics).join("/");
      }
    }
  }
};
</script>

<style scoped>
.metrics-carousel {
  height: 300px;
}
.metrics-carousel .carousel__item {
  height: auto;
}
</style>

