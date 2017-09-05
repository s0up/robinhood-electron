<template>
<div class='portfolio-historicals'>
  <ul class="nav nav-tabs nav-justified">
    <li role="presentation" v-bind:class="{'active': graphSpan == 'day'}" @click="graphSpan = 'day'; graphInterval = '5minute'"><a>Day</a></li>
    <li role="presentation" v-bind:class="{'active': graphSpan == 'week'}" @click="graphSpan = 'week'; graphInterval = '10minute'"><a>Week</a></li>
    <li role="presentation" v-bind:class="{'active': graphSpan == 'month'}" @click="graphSpan = 'month'; graphInterval = 'day'"><a>Month</a></li>
    <li role="presentation" v-bind:class="{'active': graphSpan == '3month'}" @click="graphSpan = '3month'; graphInterval = 'day'"><a>3 Month</a></li>
    <li role="presentation" v-bind:class="{'active': graphSpan == 'year'}" @click="graphSpan = 'year'; graphInterval = 'day'"><a>Year</a></li>
    <li role="presentation" v-bind:class="{'active': graphSpan == '5year'}" @click="graphSpan = '5year'; graphInterval = 'week'"><a>5 Year</a></li>
    <li role="presentation" v-bind:class="{'active': graphSpan == 'all'}" @click="graphSpan = 'all'; graphInterval = ''"><a>All</a></li>
  </ul>
  <div class="graph-loading text-center" v-if="graphLoading">
    <img style="width: 50px; margin: 40px auto;" src="~@/assets/loading.gif" />
  </div>
  <div class="line-graph small" v-if="graphData && !graphLoading">
    <div class='line-graph-title'>
      <span>
        <span v-bind:class="{'text-danger': (change < 0), 'text-success': (change > 0)}">{{changePretty}} [{{changePercent}}]</span>
        <small v-if="ahChange && ahChange != 0" v-bind:class="{'text-danger': (ahChange < 0), 'text-success': (ahChange > 0)}">({{ahChangePretty}} After Hours)</small>
      </span>
    </div>
    <line-chart :chart-data="graphData" :options="chartOptions"></line-chart>
  </div>
</div>
</template>
<script>
import moment from 'moment';
import state from '@/state';
import util from '@/util/util';
import LineChart from '@/components/Graphs/LineChart';

export default {
  name: 'portfolio-historicals',
  async created() { // Requests historical data from Robinhood for the following attributes
    this.accountNumber = this.account.account_number;
    this.updateData();
  },
  data() { // Initializes ChartOptions as null
    return {
      chartOptions: null,
      updateTimer: setTimeout(() => {}, 0),
      graphInterval: '5minute',
      graphSpan: 'day',
      accountNumber: null,
      currentWatchlist: null,
      graphLoading: false,
      gains: {},
      change: null,
      changePercent: null,
      ahChange: null
    };
  },
  computed: {
    changePretty() {
      return util.formatMoney(this.change, true);
    },
    ahChangePretty() {
      return util.formatMoney(this.ahChange, true);
    },
    account() {
      return state.getters['robinhood/currentAccount'];
    },
    portfolio() {
      return state.getters['robinhood/resource'](this.account.portfolio);
    },
    graphView() {
      return {
        account_number: this.accountNumber,
        interval: this.graphInterval,
        span: this.graphSpan
      };
    },
    historicals() {
      return state.getters['robinhood/historical'](this.graphView);
    },
    graphData() {
      if (!this.historicals) {
        return null;
      }

      return this.getLineGraphData(this.historicals);
    }
  },
  methods: {
    async updateData(skipLoading) {
      clearTimeout(this.updateTimer);

      try {
        if (!this.historicals || !skipLoading) {
          this.graphLoading = true;
        }

        await state.dispatch('robinhood/getHistoricals', this.graphView);
        await state.dispatch('robinhood/getResource', this.account.portfolio);
        await state.dispatch('robinhood/getAccounts');
        this.graphLoading = false;
      } catch (e) {
        console.log('Unable to load dashboard data...', e);
      }

      this.updateTimer = setTimeout(() => this.updateData(true), 20000);
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
        case 'all':
          momentFormat = 'MMM YYYY';
          break;
        default:
          momentFormat = 'LT';
          break;
      }

      if (data.span === 'month') {
        data.equity_historicals = data.equity_historicals.filter(item => !!(moment(new Date(item.begins_at)).isAfter(moment().subtract(1, 'month'))));
      }

      if (data.span === '3month') {
        data.equity_historicals = data.equity_historicals.filter(item => !!(moment(new Date(item.begins_at)).isAfter(moment().subtract(3, 'month'))));
      }

      data.equity_historicals.forEach((item) => {
        priceData.push(parseFloat(item.adjusted_close_equity).toFixed(2));
        priceLabelData.push(moment(new Date(item.begins_at)).format(momentFormat));
      });

      let last = 0;
      let first = 0;
      let afterHours = null;

      if (data.span === 'day') {
        last = Number(this.portfolio.equity).toFixed(2);
        first = parseFloat(this.portfolio.adjusted_equity_previous_close);

        if (this.portfolio.extended_hours_equity) {
          afterHours = {
            last: Number(this.portfolio.extended_hours_equity).toFixed(2),
            first: parseFloat(this.portfolio.adjusted_equity_previous_close)
          };
        }
      } else {
        last = (this.portfolio.extended_hours_equity) ?
          Number(this.portfolio.extended_hours_equity).toFixed(2) :
          Number(this.portfolio.equity).toFixed(2);

        first = data.equity_historicals[0].adjusted_open_equity ||
          data.equity_historicals[0].close_price;
      }

      console.log('EQUITY:', last - first, 'AFTER HOURS:', ((afterHours) ? ((afterHours.last - afterHours.first) - (last - first)) : 'N/A'));

      this.$set(this.gains, 'last', last);
      this.$set(this.gains, 'first', first);
      this.$set(this.gains, 'after_hours', afterHours);

      this.change = (last - first).toFixed(2);
      this.changePercent = util.formatPercent(first, last);

      if (afterHours) {
        this.ahChange = ((afterHours.last - afterHours.first) - this.change).toFixed(2);
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
              return `Equity: ${util.formatMoney(value.yLabel)}`;
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
              labelString: 'Value ($)',
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
        label: 'Portfolio Value',
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
  watch: {
    graphView() {
      this.updateData();
    }
  },
  components: {
    'line-chart': LineChart,
  },
  beforeDestroy() {
    clearTimeout(this.updateTimer);
  }
};
</script>
