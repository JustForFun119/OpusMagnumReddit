<template>
  <div class="metrics-chart">
    <div class="metrics-chart-title">{{ name }}</div>
    <svg :width="width" :height="height">
      <g></g>
    </svg>
  </div>
</template>

<script>
function roundUpTo(number, numDigits) {
  return (
    Math.ceil(number / Math.pow(10, numDigits - 1)) *
    Math.pow(10, numDigits - 1)
  );
}
function getNumSigFigs(number) {
  return number ? number.toString().length : 1;
}

export default {
  name: "metric-chart",
  // name of chart; array/list of metric values; metric suffix e.g. 'G'(Gold) for cost
  props: ["name", "metrics", "suffix"],
  data() {
    return {
      width: 300, // element width
      height: 200, // element height
      chartWidth: null,
      chartHeight: null,
      margin: { top: 10, right: 30, bottom: 30, left: 30 },
      numTicks: 16 // number of histogram bins/ticks
    };
  },
  mounted() {
    // fit SVG chart inside parent element
    this.chartWidth = this.width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom;
    this.buildChart(); // build SVG histogram chart on mount
  },
  computed: {
    svg() {
      return d3
        .select(this.$el)
        .select("g")
        .attr(
          "transform",
          "translate(" + this.margin.left + "," + this.margin.top + ")"
        );
    },
    x() {
      // x-scale: metric scale over chart width
      return d3
        .scaleLinear()
        .domain([0, this.xMax])
        .rangeRound([0, this.chartWidth]);
    },
    y() {
      // y-scale: no. of solutions in metric score over chart height
      return d3.scaleLinear().range([this.chartHeight, 10]);
    },
    metricsMax() {
      const max = Math.max(...this.metrics);
      // add a padding (relative to max metric's s.f.) for histogram bins
      return max + Math.pow(10, getNumSigFigs(max) - 1);
    },
    xMax() {
      // find max x-axis value from metrics:
      // round up max metric value to significant figures
      // e.g. 42 -> 50, 345 -> 400 etc.
      return roundUpTo(this.metricsMax, getNumSigFigs(this.metricsMax));
    },
    histogram() {
      return d3
        .histogram() // histogram object
        .domain(this.x.domain()) // use cost-scale domain
        .thresholds(this.x.ticks(this.numTicks)); // threshold relative to no. of cost-scale ticks
    },
    bins() {
      const bins = this.histogram(this.metrics);
      return bins.slice(0, bins.length - 1);
    }
  },
  watch: {
    metrics(newMetrics, oldMetrics) {
      // only update chart if new metrics are added
      if (oldMetrics.length < newMetrics.length) this.buildChart();
    }
  },
  methods: {
    buildChart() {
      // note: bins should've been updated as computed prop
      // sets y-scale to match histogram bins
      this.y.domain([0, d3.max(this.bins, d => d.length)]);
      // x-axis
      const xAxis = this.svg
        .append("g")
        .attr("transform", "translate(0," + this.chartHeight + ")")
        .call(
          d3
            .axisBottom(this.x)
            .ticks(this.numTicks)
            .tickPadding(6)
            .tickFormat(
              d => (d % (this.xMax / 4) === 0 ? d + (this.suffix || "") : "")
            )
        );
      // bar/column dotted lines
      xAxis
        .selectAll("g.tick")
        .append("line")
        .attr("stroke", "#0004") // black & 25% transparent
        .attr("y2", -this.chartHeight) // from x-axis to top of chart
        .style("stroke-dasharray", "3,3"); // dashed line
      // rectangle bars -- columns of data points
      this.svg
        .selectAll("rect")
        .data(this.bins)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 1)
        .attr(
          "transform",
          d => "translate(" + this.x(d.x0) + "," + this.y(d.length) + ")"
        )
        .attr("width", d => Math.max(this.x(d.x1) - this.x(d.x0) - 1, 0))
        .attr("height", d => Math.max(this.chartHeight - this.y(d.length), 0))
        .style("fill", this.$vuetify.theme.primary);
    }
  }
};
</script>

<style>
.metrics-chart {
  text-align: center;
}
.metrics-chart-title {
  text-align: center;
  padding: 4px;
  border-bottom: 1px solid #000;
  font-weight: bold;
  font-size: 1.2em;
}
/* x-axis labels font size */
.metrics-chart g.tick > text {
  font-size: 1.2em;
}
</style>


