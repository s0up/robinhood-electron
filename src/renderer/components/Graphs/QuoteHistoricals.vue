<template>
<div class='quote-historicals'>
  <ul class="nav nav-tabs nav-justified">
    <li role="presentation" v-bind:class="{'active': historicalSpan === 'day'}" @click="historicalSpan = 'day'; historicalInterval = '5minute'"><a>Day</a></li>
    <li role="presentation" v-bind:class="{'active': historicalSpan === 'week'}" @click="historicalSpan = 'week'; historicalInterval = '10minute'"><a>Week</a></li>
    <li role="presentation" v-bind:class="{'active': historicalSpan === 'month'}" @click="historicalSpan = 'month'; historicalInterval = 'day'"><a>Month</a></li>
    <li role="presentation" v-bind:class="{'active': historicalSpan === '3month'}" @click="historicalSpan = '3month'; historicalInterval = 'day'"><a>3 Month</a></li>
    <li role="presentation" v-bind:class="{'active': historicalSpan === 'year'}" @click="historicalSpan = 'year'; historicalInterval = 'day'"><a>Year</a></li>
    <li role="presentation" v-bind:class="{'active': historicalSpan === '5year'}" @click="historicalSpan = '5year'; historicalInterval = 'week'"><a>5 Year</a></li>
  </ul>
  <div class="graph-loading text-center" v-if="graphLoading">
    <img style="width: 50px; margin: 40px auto;" src="~@/assets/loading.gif" />
  </div>
  <div class="line-graph small" v-if="lineGraphData && !graphLoading">
    <div class='line-graph-title'>
      <span>
        <span v-bind:class="{'text-danger': (change < 0), 'text-success': (change > 0)}">{{changePretty}} [{{changePercent}}]</span>
        <small>
          <small
            v-if="ahChange && ahChange != 0"
            v-bind:class="{'text-danger': (ahChange < 0), 'text-success': (ahChange > 0)}">
            ({{ahChangePretty}} [{{ahChangePercent}}] After Hours)
          </small>
       </small>
      </span>
    </div>
    <line-chart :chart-data="lineGraphData" :options="chartOptions"></line-chart>
  </div>
</div>
</template>
<script>
import moment from 'moment';
import state from '@/state';
import util from '@/util/util';
import LineChart from '@/components/Graphs/LineChart';

export default {
  created() {
    this.updateData();
  },
  data() {
    return {
      chartOptions: null,
      updateTimer: setTimeout(() => {}, 0),
      historicalInterval: '5minute',
      historicalSpan: 'day',
      graphLoading: false,
      change: null,
      changePercent: null,
      ahChange: null,
      ahChangePercent: null
    };
  },
  beforeDestroy() {
    clearTimeout(this.updateTimer);
  },
  computed: {
    changePretty() {
      return util.formatMoney(this.change, true);
    },
    ahChangePretty() {
      return util.formatMoney(this.ahChange, true);
    },
    symbol() {
      return this.$route.params.symbol;
    },
    quote() {
      return state.getters['robinhood/quote'](this.symbol);
    },
    currentHistoricalView() {
      return {
        symbol: this.symbol,
        interval: this.historicalInterval,
        span: this.historicalSpan
      };
    },
    historical() {
      return state.getters['robinhood/tickerHistorical'](this.currentHistoricalView);
    },
    lineGraphData() {
      if (!this.historical) {
        return null;
      }

      return this.getLineGraphData(this.historical);
    }
  },
  watch: {
    quote() {
      this.loaded = true;
    },
    currentHistoricalView() {
      this.updateData();
    }
  },
  methods: {
    formatMoney(money) {
      return util.formatMoney(money);
    },
    async updateData(skipLoading) {
      clearTimeout(this.updateTimer);

      try {
        if (!this.historical || !skipLoading) {
          this.graphLoading = true;
        }

        await state.dispatch('robinhood/getTickerHistoricals', this.currentHistoricalView);
        await state.dispatch('robinhood/getQuote', this.symbol);

        this.graphLoading = false;
      } catch (e) {
        console.log('Unable to get stock view information...', e);
      }

      this.updateTimer = setTimeout(() => {
        this.updateData(true);
      }, 10000);
    },
    getLineGraphData(data) {
      const lineGraphData = [];
      const priceData = [];
      const priceLabelData = [];

      let momentFormat = 'LT';

      switch (data.span) {
        case 'week':
          momentFormat = 'MMM Do';
          break;
        case 'month':
          momentFormat = 'MMM Do';
          break;
        case '3month':
          momentFormat = 'MMM Do';
          break;
        case 'year':
          momentFormat = 'MMM Do';
          break;
        case '5year':
          momentFormat = 'MMM YYYY';
          break;
        default:
          momentFormat = 'LT';
          break;
      }

      if (data.span === 'month') {
        data.historicals = data.historicals.filter(item => !!(moment(new Date(item.begins_at)).isAfter(moment().subtract(1, 'month'))));
      }

      if (data.span === '3month') {
        data.historicals = data.historicals.filter(item => !!(moment(new Date(item.begins_at)).isAfter(moment().subtract(3, 'month'))));
      }

      data.historicals.forEach((item) => {
        priceData.push(parseFloat(item.close_price).toFixed(2));
        priceLabelData.push(moment(new Date(item.begins_at)).format(momentFormat));
      });

      priceData.push(parseFloat(this.quote.last_trade_price).toFixed(2));
      priceLabelData.push(moment().format(momentFormat));

      let last = 0;
      let first = 0;
      let afterHours = null;

      if (data.span === 'day') {
        last = Number(this.quote.last_trade_price).toFixed(2);
        first = parseFloat(this.quote.previous_close);

        if (this.quote.last_extended_hours_trade_price) {
          afterHours = {
            last: Number(this.quote.last_extended_hours_trade_price).toFixed(2),
            first: parseFloat(this.quote.previous_close)
          };
        }
      } else {
        last = data.historicals[data.historicals.length - 1].close_price;
        first = data.historicals[0].close_price;
      }

      this.change = (last - first).toFixed(2);
      this.changePercent = util.formatPercent(first, last);

      if (afterHours) {
        this.ahChange = ((afterHours.last - afterHours.first) - this.change).toFixed(2);
        this.ahChangePercent = util.formatPercent(last, afterHours.last);
      } else {
        this.ahChange = null;
      }

      this.chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          display: false,
          labels: {
            fontColor: '#FFFFFF'
          }
        },
        tooltips: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label(value) {
              return `Price: ${util.formatMoney(value.yLabel)}`;
            }
          }
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 60,
            bottom: 0
          }
        },
        scales: {
          yAxes: [{
            id: 'first-y-axis',
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Price ($)',
              fontColor: '#FFFFFF',
            },
            gridLines: {
              color: '#FFFFFF',
              lineWidth: 2,
            },
            ticks: {
              beginAtZero: false,
              fontColor: '#FFFFFF',
              callback(value) {
                return util.formatMoney(value);
              }
            }
          }],
          xAxes: [{
            display: true,
            autoSkip: true,
            gridLines: {
              color: '#FFFFFF',
              lineWidth: 2,
            },
            ticks: {
              fontColor: '#FFFFFF'
            }
          }]
        }
      };

      lineGraphData.push({
        label: 'Price',
        yAxisID: 'first-y-axis',
        fill: false,
        pointRadius: 0,
        borderColor: '#00CC99',
        lineTension: 0.05,
        data: priceData
      });

      return {
        labels: priceLabelData,
        datasets: lineGraphData
      };
    }
  },
  components: {
    'line-chart': LineChart
  }
};
</script>
