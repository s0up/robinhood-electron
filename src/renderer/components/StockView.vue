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
      <hr>
      <h3>Current Position</h3>
      <position-table>
        <position slot="position-table-body" :row="currentPosition"></position>
      </position-table>
    </div>
    <hr>
    <div class='stock-extra-info'>
      <ul class="nav nav-pills nav-justified">
        <li role="presentation" v-bind:class="{'active': activeTab == 'price'}" @click="activeTab = 'price'"><a>Price Information</a></li>
        <li role="presentation" v-bind:class="{'active': activeTab == 'companyInfo'}" @click="activeTab = 'companyInfo'"><a>Company Fundamentals</a></li>
      </ul>
      <!--Price info begin-->
      <!--
            adjusted_previous_close:"72.4000"
      ask_price:"72.7000"
      ask_size:1300
      bid_price:"72.6900"
      bid_size:1500
      has_traded:true
      instrument:"https://api.robinhood.com/instruments/50810c35-d215-4866-9758-0ada4ac79ffa/"
      instruments:Array[1]
      last_extended_hours_trade_price:null
      last_trade_price:"72.6750"
      last_trade_price_source:"nls"
      previous_close:"72.4000"
      previous_close_date:"2017-08-17"
      symbol:"MSFT"
      trading_halted:false
      updated_at:"2017-08-18T19:19:05Z"

      fundamentalsaverage_volume:"6399407.0996"
      ceo:"Alex Gorsky"
      description:"Johnson & Johnson is an investment holding company with interests in health care products. It engages in research and development, manufacture and sale of personal care hygienic products, pharmaceuticals and surgical equipment. The company operates through the following business segments: Consumer, Pharmaceutical and Medical Devices. The Consumer segment includes products used in the baby care, skin care, oral care, wound care and women's health care fields, as well as nutritional and over-the-counter pharmaceutical products, and wellness and prevention platforms. Its baby care franchise includes the JOHNSON'S Baby line of products. The Pharmaceutical segment includes products in the anti-infective, antipsychotic, contraceptive, gastrointestinal, hematology, immunology, infectious diseases, neurology, oncology, pain management, thrombosis and vaccines. The Medical Devices segment includes products distributed to wholesalers, hospitals and retailers, used principally in the professional fields by physicians, nurses, hospitals, and clinics. It include products to treat cardiovascular disease; orthopaedic and neurological products; blood glucose monitoring and insulin delivery products; general surgery, biosurgical, and energy products; professional diagnostic products; infection prevention products; and disposable contact lenses. Johnson & Johnson was founded by Robert Wood Johnson I, James Wood Johnson and Edward Mead Johnson Sr. in 1886 and is headquartered in New Brunswick, NJ."
      dividend_yield:"2.7341"
      headquarters_city:"New Brunswick"
      headquarters_state:"New Jersey"
      high:"133.7800"
      high_52_weeks:"137.0800"
      instrument:"https://api.robinhood.com/instruments/fd0c2695-e591-4c28-bdf7-068895ae3b14/"
      low:"132.3810"
      low_52_weeks:"109.3200"
      market_cap:"357237677600.0000"
      num_employees:126400
      open:"132.3810"
      pe_ratio:"22.4206"
      url:"https://api.robinhood.com/fundamentals/JNJ/"
      volume:"1062012.0000"
      year_founded:1886
      -->
      <div v-if="activeTab == 'price'">
        <div class="clear">&nbsp;</div>
        <div class="row stock-info-buttons">
          <div class="col-sm-3">
              <div class="input-group ">
                <div class="input-group-addon">Last Trade Price</div>
                <input type="text" class="form-control"  v-bind:value="formatMoney(quote.last_trade_price)" readonly>
              </div>
          </div>
          <div class="col-sm-3">
              <div class="input-group">
                <div class="input-group-addon">Ask Price</div>
                <input type="text" class="form-control"  v-bind:value="formatMoney(quote.ask_price)" readonly>
              </div>
          </div>
          <div class="col-sm-3">
              <div class="input-group">
                <div class="input-group-addon">Bid Price</div>
                <input type="text" class="form-control"  v-bind:value="formatMoney(quote.bid_price)" readonly>
              </div>
          </div>
          <div class="col-sm-3">
              <div class="input-group">
                <div class="input-group-addon">Prev Close Price</div>
                <input type="text" class="form-control"  v-bind:value="formatMoney(quote.previous_close)" readonly>
              </div>
          </div>
        </div>
      </div>
      <!-- Price info end -->
      <div v-if="activeTab == 'companyInfo'">
        <div class="clear">&nbsp;</div>
        <div class="row stock-info-buttons">
          <div class="col-sm-3">
            <div class="input-group">
              <div class="input-group-addon">Dividend Yield</div>
              <input type="text" class="form-control"  v-bind:value="formatMoney(fundamentals.dividend_yield)" readonly>
            </div>
          </div>
          <div class="col-sm-3">
            <div class="input-group">
              <div class="input-group-addon">P/E Ratio</div>
              <input v-if="fundamentals.pe_ratio" type="text" class="form-control"  v-bind:value="fundamentals.pe_ratio" readonly>
              <input v-else type="text" class="form-control" v-bind:value="'N/A'" readonly>
            </div>
          </div>
          <div class="col-sm-3">
            <div class="input-group">
              <div class="input-group-addon">Average Volume</div>
              <input type="text" class="form-control"  v-bind:value="formatMoney(fundamentals.volume)" readonly>
            </div>
          </div>
          <div class="col-sm-3">
            <div class="input-group">
              <div class="input-group-addon">Market Cap</div>
              <input type="text" class="form-control"  v-bind:value="formatMoney(fundamentals.market_cap)" readonly>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-3">
            <div class="input-group">
              <div class="input-group-addon">All-Time High</div>
              <input type="text" class="form-control"  v-bind:value="formatMoney(fundamentals.high)" readonly>
            </div>
          </div>
          <div class="col-sm-3">
            <div class="input-group">
              <div class="input-group-addon">All-Time Low</div>
              <input type="text" class="form-control"  v-bind:value="formatMoney(fundamentals.low)" readonly>
            </div>
          </div>
          <div class="col-sm-3">
            <div class="input-group">
              <div class="input-group-addon">52 Week Low</div>
              <input type="text" class="form-control"  v-bind:value="formatMoney(fundamentals.low_52_weeks)" readonly>
            </div>
          </div>
          <div class="col-sm-3">
            <div class="input-group">
              <div class="input-group-addon">52 Week High</div>
              <input type="text" class="form-control"  v-bind:value="formatMoney(fundamentals.high_52_weeks)" readonly>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="hasNews" class="table-responsive">
      <hr>
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
import util from '@/util/util';

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

    this.updateData();
  },
  data() {
    return {
      loaded: false,
      hasNews: true,
      isBuying: false,
      buySide: 'buy',
      quoteError: false,
      chartOptions: null,
      updateTimer: setTimeout(function() {}, 0),
      historicalInterval: '5minute',
      historicalSpan: 'day',
      activeTab: 'price'
    }
  },
  beforeDestroy() {
    clearTimeout(this.updateTimer);
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
    formatMoney(money){
      return util.formatMoney(money);
    },
    async updateData() {
      try{
        await state.dispatch('robinhood/getTickerHistoricals', this.currentHistoricalView);
        await state.dispatch('robinhood/getNews', this.symbol);
        await state.dispatch('robinhood/getPositions');
        await state.dispatch('robinhood/getQuote', this.symbol);
      }catch(e){
        console.log("Unable to get stock view information...");
      }

      clearTimeout(this.chartTimer);
      this.updateTimer = setTimeout(() => {
        this.updateData()
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
