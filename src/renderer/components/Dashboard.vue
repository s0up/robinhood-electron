<template>
<div class="dashboard container-fluid">
  <div class="row">
    <div class="col-md-3">
      <div class="panel panel-default ">
        <div class="panel-heading">Portfolio</div>
        <div class="panel-body">
          <h3 v-money="portfolio.equity"></h3>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="panel panel-default ">
        <div class="panel-heading">Today's Gains/Losses</div>
        <div class="panel-body">
          <h3 v-money="portfolio.equity - portfolio.adjusted_equity_previous_close"></h3>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="panel panel-default ">
        <div class="panel-heading">Buying Power</div>
        <div class="panel-body">
          <h3 v-money="account.computed_buying_power"></h3>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="panel panel-default ">
        <div class="panel-heading">Uncleared Deposits</div>
        <div class="panel-body">
          <h3 v-money="account.uncleared_deposits"></h3>
        </div>
      </div>
    </div>
  </div>
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
    <img style="width: 50px; margin: 40px auto;" src="~@/assets/loading.gif"/>
  </div>
  <div class="small" v-if="graphData && !graphLoading">
    <line-chart :chart-data="graphData" :options="chartOptions"></line-chart>
  </div>
  <hr>
  <div v-if="currentWatchlist" class='watchlist'>
    <h3>Watchlist</h3>
    <watchlist :watchlist="currentWatchlist"></watchlist>
  </div>
  <hr>
  <h3>Notifications</h3>
  <div v-if="cards">
    <div class='row' v-for="card in cards">
      <div class='col-xs-12'>
        <div class="panel panel-default ">
          <div class="panel-heading">
            {{card.title}}
            <button @click="dismissCard(card)" type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
          </div>
          <div class="panel-body">
            <span>{{card.message}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script>
import state from '@/state';
import util from '@/util/util';
import LineChart from '@/components/Graphs/LineChart';
import Watchlist from '@/components/Watchlist';
import moment from 'moment';

export default {
  async created() { // Requests historical data from Robinhood for the following attributes
    this.accountNumber = this.account.account_number;
    this.updateData();

    try {
      await state.dispatch('robinhood/getWatchlists');
      await state.dispatch('robinhood/getCards');
    } catch (e) {
      console.log('Error retrieving dashboard data...', e);
    }
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
      gains: {}
    };
  },
  computed: {
    account() {
      return state.getters['robinhood/currentAccount'];
    },
    robinhoodUser() {
      return state.getters['robinhood/robinhoodUser'];
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
    },
    watchlists() {
      return state.getters['robinhood/watchlists'];
    },
    cards() {
      return state.getters['robinhood/cards'];
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
    async dismissCard(card) {
      try {
        const urlPieces = card.url.split('/');
        const cardId = urlPieces[urlPieces.length - 2];
        const cards = state.getters['robinhood/cards'];

        cards.splice(cards.findIndex(item => item.url === card.url), 1);

        state.commit('setCards', cards);

        await state.dispatch('robinhood/dismissCard', cardId);
      } catch (e) {
        console.log('Card removal failed', e);
      }
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
          Number(this.portfolio.extended_hours_equity).toFixed(2)
          : Number(this.portfolio.equity).toFixed(2);

        first = data.equity_historicals[0].adjusted_open_equity
          || data.equity_historicals[0].close_price;
      }

      console.log('EQUITY:', last - first, 'AFTER HOURS:', ((afterHours) ? ((afterHours.last - afterHours.first) - (last - first)) : 'N/A'));

      this.$set(this.gains, 'last', last);
      this.$set(this.gains, 'first', first);
      this.$set(this.gains, 'after_hours', afterHours);

      const change = (last - first).toFixed(2);

      let title = `${util.formatMoney(change, true)} [${util.formatPercent(first, last)}]`;

      if (afterHours) {
        const ahChange = (afterHours.last - afterHours.first).toFixed(2);

        title += ` (${util.formatMoney(ahChange - change, true)} A.H)`;
      }

      this.chartOptions = {
        title: {
          display: true,
          text: title,
          fontSize: 18,
          fontColor: (change < 0) ? '#fc4d2d' : '#21ce99',
          position: 'top',
          padding: 20
        },
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          display: true,
          labels: {
            fontColor: '#FFFFFF'
          }
        },
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'nearest',
          intersect: true
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
    watchlists(watchlists) {
      if (!this.currentWatchlist) {
        this.currentWatchlist = watchlists[0];
      }
    },
    graphView() {
      this.updateData();
    }
  },
  components: {
    'line-chart': LineChart,
    watchlist: Watchlist
  },
  beforeDestroy() {
    clearTimeout(this.updateTimer);
  }
};
</script>

<style>
.nav-tabs li a {
  border-color: #fff;
}

.nav-tabs li.active a {
  border-color: #fff !important;
  border-bottom-color: transparent !important;
}

.panel-default {
  background-color: #222428;
  border-color: #fff;
}

.small {
  margin: 0px auto;
  background-color: #333333;
}
</style>
