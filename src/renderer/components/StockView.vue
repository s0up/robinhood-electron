<template>
<div class='stock-view-container container-fluid'>
  <div v-if="quoteError" class="text-center">
    <h1 class="display-3 text-center text-danger">Oh Noes!</h1>
    <p class="lead text-center text-danger">Our robots could not find any data about {{symbol}} :(</p>
  </div>
  <div v-if="loaded" class='stock-view'>
    <div class="row">
      <div class="col-xs-6 text-left">
        <h3 v-if="quote"><ticker-link :symbol="symbol"></ticker-link> {{instrument.name}} </h3>
      </div>
      <div class="col-xs-6 text-right">
        <div class="" v-if="quote">
          <button v-if="currentPosition && !isBuying" v-on:click="isBuying = true; buySide = 'buy'" class="btn btn-green">Buy More</button>
          <button v-if="currentPosition && !isBuying" v-on:click="isBuying = true;  buySide = 'sell'" class="btn btn-warning">Sell</button>
          <button v-if="!currentPosition && !isBuying" v-on:click="isBuying = true; buySide = 'buy'" class="btn btn-green">Buy</button>
          <!--<button class="btn btn-primary">Watch</button>-->
        </div>
      </div>
    </div>
    <div class="clear"></div>
    <new-order v-if="isBuying" v-on:orderComplete="orderComplete" v-on:cancelOrder="isBuying = false" :symbol="symbol" :buySide="buySide"></new-order>
    <ul class="nav nav-tabs nav-justified">
      <li role="presentation" v-bind:class="{'active': historicalSpan == 'day'}" @click="historicalSpan = 'day'; historicalInterval = '5minute'"><a>Day</a></li>
      <li role="presentation" v-bind:class="{'active': historicalSpan == 'week'}" @click="historicalSpan = 'week'; historicalInterval = '10minute'"><a>Week</a></li>
      <li role="presentation" v-bind:class="{'active': historicalSpan == 'year'}" @click="historicalSpan = 'year'; historicalInterval = 'day'"><a>Year</a></li>
      <li role="presentation" v-bind:class="{'active': historicalSpan == '5year'}" @click="historicalSpan = '5year'; historicalInterval = 'week'"><a>5 Year</a></li>
    </ul>
    <div class="small" v-if="lineGraphData">
      <line-chart :chart-data="lineGraphData" :options="chartOptions"></line-chart>
    </div>
    <div v-if="currentPosition" class="table-responsive">
      <div class='clear'>&nbsp;</div>
      <h3>Current Position</h3>
      <position-table>
        <position slot="position-table-body" :row="currentPosition"></position>
      </position-table>
    </div>
    <!--
    FINISH THIS SOON!
    <div class='stock-extra-info'>
      <div class='row'>
        <div class='col-sm-4'>
          <h4 class='text-success'>Last Trade Price</h4>
          {{quote.last_trade_price}}
        </div>
        <div class='col-sm-4'>
          Latest Price: {{quote.last_trade_price}}
        </div>
      </div>
    </div>
    -->
    <div v-if="hasNews" class="table-responsive">
      <div class='clear'>&nbsp;</div>
      <h3 v-if="quote">Recent news for {{instrument.name}}</h3>
      <table class="table table-condensed">
        <thead>
        </thead>
        <tbody>
          <tr v-for="item in news.results">
            <td><a @click="openUrl(item.url)">{{item.title}}</a></td>
            <td v-from-now="item.published_at"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</template>
<script>
import {shell} from 'electron';
import NewOrder from '@/components/NewOrder';
import Position from '@/components/Positions/Position';
import PositionTable from '@/components/Positions/PositionTable';
import LineChart from '@/components/Graphs/LineChart';
import TickerLink from '@/components/Common/TickerLink';

import moment from 'moment';
import state from '@/state';

export default {
  created() {
    var self = this;

    (async() => {
      try {
        await state.dispatch('robinhood/getQuote', this.symbol);
      } catch (e) {
        self.quoteError = true;
      }
    })();

    this.updateCharts();

    state.dispatch('robinhood/getNews', this.symbol);
    state.dispatch('robinhood/getPositions');
  },
  data() {
    return {
      loaded: false,
      hasNews: true,
      isBuying: false,
      buySide: 'buy',
      quoteError: false,
      chartOptions: null,
      chartTimer: setTimeout(function() {}, 0),
      historicalInterval: '5minute',
      historicalSpan: 'day'
    }
  },
  beforeDestroy() {
    clearTimeout(this.chartTimer);
  },
  computed: {
    symbol() {
      return this.$route.params.symbol;
    },
    quote() {
      return state.getters['robinhood/quote'](this.symbol);
    },
    news() {
      return state.getters['robinhood/news'](this.symbol);
    },
    positions() {
      return state.getters['robinhood/positions'];
    },
    currentHistoricalView() {
      return {
        symbol: this.symbol,
        interval: this.historicalInterval,
        span: this.historicalSpan
      }
    },
    currentPosition() {
      var self = this;

      return this.positions.find(position => {
        let instrument = state.getters['robinhood/instrument'](position.instrument);

        return instrument.symbol == this.symbol
      });
    },
    instrument() {
      if (!this.quote) {
        return;
      }

      return state.getters['robinhood/instrument'](this.quote.instrument);
    },
    fundamentals(){
      if(!this.instrument){
        return;
      }

      return state.getters['robinhood/resource'](this.instrument.fundamentals);
    },
    historical() {
      return state.getters['robinhood/tickerHistorical'](this.currentHistoricalView);
    },
    lineGraphData() {
      if(!this.historical){
        return;
      }

      return this.getLineGraphData(this.historical);
    }
  },
  watch: {
    symbol() {
      var self = this;

      self.quoteError = false;

      (async() => {
        try {
          await state.dispatch('robinhood/getQuote', this.symbol);
        } catch (e) {
          self.quoteError = true;
        }
      })();

      this.isBuying = false;

      state.dispatch('robinhood/getNews', this.symbol);
      state.dispatch('robinhood/getPositions');
    },
    quote() {
      this.loaded = true;
    },
    news(newsItem) {
      if (typeof newsItem === 'undefined') {
        this.hasNews = false;

        return;
      }

      if ('results' in newsItem && newsItem.results.length > 0) {
        this.hasNews = true;
      } else {
        this.hasNews = false;
      }
    },
    currentHistoricalView(){
      this.updateCharts();
    },
    instrument(instrument){
      state.dispatch('robinhood/getResource', instrument.fundamentals);
    }
  },
  methods: {
    openUrl(url){
      shell.openExternal(url);
    },
    orderComplete() {
      setTimeout(() => this.isBuying = false, 5000);
    },
    async updateCharts() {
      await state.dispatch('robinhood/getTickerHistoricals', this.currentHistoricalView);

      clearTimeout(this.chartTimer);
      this.chartTimer = setTimeout(() => {
        this.updateCharts()
      }, 10000);
    },
    getLineGraphData(data) {
      let lineGraphData = [];
      let priceData = [];
      let priceLabelData = [];

      let momentFormat = "LT";

      switch(this.historicalSpan){
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

      data.historicals.forEach(function(item) {
        priceData.push(parseFloat(item.close_price).toFixed(2));
        priceLabelData.push(moment(new Date(item.begins_at)).format(momentFormat));
      });

      priceData.push(parseFloat(this.quote.last_trade_price).toFixed(2));
      priceLabelData.push(moment().format(momentFormat));

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
              labelString: 'Price ($)',
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
        label: 'Price',
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
  components: {
    'position': Position,
    'position-table': PositionTable,
    'new-order': NewOrder,
    'line-chart': LineChart,
    'ticker-link': TickerLink
  }
}
</script>
