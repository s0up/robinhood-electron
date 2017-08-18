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
          <h3 v-money="buyingPower"></h3>
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
    <li role="presentation" v-bind:class="{'active': graphSpan == 'year'}" @click="graphSpan = 'year'; graphInterval = 'day'"><a>Year</a></li>
    <li role="presentation" v-bind:class="{'active': graphSpan == '5year'}" @click="graphSpan = '5year'; graphInterval = 'week'"><a>5 Year</a></li>
  </ul>
  <div class="small" v-if="graphData">
    <line-chart :chart-data="graphData" :options="chartOptions"></line-chart>
  </div>
  <hr>
  <div v-if="currentWatchlist" class='watchlist'>
    <h3>Watchlist</h3>
    <div class="form-group">
      <select v-model="selectedWatchlist" class="form-control">
        <option v-bind:value="watchlist.url" v-for="watchlist in watchlists">
          {{watchlist.name}}
        </option>
      </select>
    </div>
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
import LineChart from '@/components/Graphs/LineChart';
import Watchlist from '@/components/Watchlist';
import moment from 'moment';

/*
# get_history :AAPL, "5minute", {span: "day"}
# get_history :AAPL, "10minute", {span: "week"}
# get_history :AAPL, "day", {span: "year"}
# get_history :AAPL, "week", {span: "5year"}
5minute / span day
10minute / span week
day / span year
week / span 5year
*/

export default {
  created() { //Requests historical data from Robinhood for the following attributes
    this.accountNumber = this.account.account_number;
    this.updateData();
    state.dispatch('robinhood/getWatchlists');
    state.dispatch('robinhood/getCards');
  },
  data() { //Initializes ChartOptions as null
    return {
      chartOptions: null,
      updateTimer: setTimeout(function() {}, 0),
      graphInterval: '5minute',
      graphSpan: 'day',
      accountNumber: null,
      currentWatchlist: null,
      selectedWatchlist: ""
    }
  },
  computed: {
    account() { // Gets accountID of current user
      return state.getters['robinhood/currentAccount'];
    },
    buyingPower() {
      let {
        type,
        cash_balances,
        margin_balances
      } = this.account;

      if (type === "cash") {
        return cash_balances.buying_power;
      } else {
        let temp = Number(margin_balances.overnight_buying_power) / Number(margin_balances.overnight_ratio);
        if (Number(margin_balances.margin_limit) === 0) {
          return temp;
        } else {
          return Math.min(temp, Number(margin_balances.unallocated_margin_cash));
        }
      }
    },
    robinhoodUser() { // Gets current user's Username
      return state.getters['robinhood/robinhoodUser'];
    },
    portfolio() { //Gets current user's portfolio
      return state.getters['robinhood/resource'](this.account.portfolio);
    },
    graphView() {
      return {
        account_number: this.accountNumber,
        interval: this.graphInterval,
        span: this.graphSpan
      }
    },
    historicals() {
      return state.getters['robinhood/historical'](this.graphView);
    },
    graphData() {
      if (!this.historicals) {
        return;
      }

      return this.getLineGraphData(this.historicals);
    },
    watchlists() {
      return state.getters['robinhood/watchlists'];
    },
    watchlistData() {
      if (!this.currentWatchlist) {
        return;
      }

      state.getters['robinhood/resource'](this.currentWatchlist.url);
      //return state.getters['robinhood/resource'](this.currentWatchlist.url);
    },
    cards() {
      return state.getters['robinhood/cards'];
    }
  },
  methods: {
    updateData() {
      clearTimeout(this.updateTimer);

      state.dispatch('robinhood/getHistoricals', this.graphView);
      state.dispatch('robinhood/getResource', this.account.portfolio);
      state.dispatch('robinhood/getAccounts');

      this.updateTimer = setTimeout(() => this.updateData(), 10000);
    },
    async dismissCard(card) {
      try {
        let urlPieces = card.url.split('/');

        let cardId = urlPieces[urlPieces.length - 2];

        let cards = state.getters['robinhood/cards'];

        cards.splice(cards.findIndex(item => item.url == card.url), 1);

        state.commit('setCards', cards);

        await state.dispatch('robinhood/dismissCard', cardId);
      } catch (e) {
        console.log("Card removal failed", e);
      }
    },
    getLineGraphData(data) {
      let lineGraphData = [];
      let priceData = [];
      let priceLabelData = [];

      let momentFormat = "LT";

      switch (data.span) {
        case 'week':
          momentFormat = "MMM Do";
          break;
        case 'month':
          momentFormat = "MMM Do";
          break;
        case 'year':
          momentFormat = "MMM Do";
          break;
        case '5year':
          momentFormat = "MMM YYYY";
          break;
        default:
          momentFormat = "LT";
          break;
      }

      data.equity_historicals.forEach(function(item) {
        priceData.push(parseFloat(item.adjusted_close_equity).toFixed(2));
        priceLabelData.push(moment(new Date(item.begins_at)).format(momentFormat));
      });

      //priceData.push(parseFloat(this.quote.last_trade_price).toFixed(2));
      //priceLabelData.push(moment().format(momentFormat));

      this.chartOptions = {
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
              fontColor: "#FFFFFF",
            },
            gridLines: {
              color: "#FFFFFF",
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
              color: "#FFFFFF",
              lineWidth: 2,
            },
            ticks: {
              fontColor: '#FFFFFF'
            }
          }]
        }
      }

      lineGraphData.push({
        label: 'Portfolio Value',
        yAxisID: 'first-y-axis',
        fill: false,
        pointRadius: 0,
        borderColor: '#00CC99',
        lineTension: .05,
        data: priceData
      });


      return {
        labels: priceLabelData,
        datasets: lineGraphData
      }
    }
  },
  watch: {
    watchlists(watchlists) {
      if (!this.currentWatchlist) {
        this.currentWatchlist = watchlists[0];
        this.selectedWatchlist = this.currentWatchlist['url'];
      }
    },
    graphView() {
      this.updateData();
    },
    selectedWatchlist(url) {
      this.currentWatchlist = this.watchlists.find(item => item.url == url);
    }
  },
  components: {
    'line-chart': LineChart,
    'watchlist': Watchlist
  },
  beforeDestroy() {
    clearTimeout(this.updateTimer);
  }
}
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



/*.panel-default > .panel-heading {
  color: #00CC99;
  background-color: #333;
  border-color: #fff;
}*/

.small {
  margin: 0px auto;
  background-color: #333333;
}
</style>
