import { Line, mixins } from 'vue-chartjs';

const { reactiveProp } = mixins;

export default {
  mixins: [reactiveProp, Line],
  props: ['options'],
  mounted() {
    // this.chartData is created in the mixin
    this.renderChart(this.chartData, this.options);
  }
};
