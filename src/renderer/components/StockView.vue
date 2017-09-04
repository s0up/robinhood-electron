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
    <quote-historicals :symbol="symbol"></quote-historicals>
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
        <li role="presentation" v-bind:class="{'active': activeTab === 'price'}" @click="activeTab = 'price'"><a>Price Information</a></li>
        <li role="presentation" v-bind:class="{'active': activeTab === 'companyInfo'}" @click="activeTab = 'companyInfo'"><a>Company Fundamentals</a></li>
      </ul>
      <div v-if="activeTab === 'price'">
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
      <div v-if="activeTab === 'companyInfo'">
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
              <div class="input-group-addon">High</div>
              <input type="text" class="form-control"  v-bind:value="formatMoney(fundamentals.high)" readonly>
            </div>
          </div>
          <div class="col-sm-3">
            <div class="input-group">
              <div class="input-group-addon">Low</div>
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
    <div v-if="news" class="table-responsive">
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
import { shell } from 'electron';
import NewOrder from '@/components/NewOrder';
import Position from '@/components/Positions/Position';
import PositionTable from '@/components/Positions/PositionTable';
import QuoteHistoricals from '@/components/Graphs/QuoteHistoricals';
import TickerLink from '@/components/TickerLink';

import state from '@/state';
import util from '@/util/util';

export default {
  created() {
    const self = this;

    (async () => {
      try {
        await state.dispatch('robinhood/getQuote', this.symbol);
        await state.dispatch('robinhood/getNews', this.symbol);
      } catch (e) {
        self.quoteError = true;
      }
    })();
  },
  data() {
    return {
      loaded: false,
      isBuying: false,
      buySide: 'buy',
      quoteError: false,
      activeTab: 'price'
    };
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
    currentPosition() {
      return this.positions.find((position) => {
        const instrument = state.getters['robinhood/instrument'](position.instrument);

        return instrument.symbol === this.symbol;
      });
    },
    instrument() {
      if (!this.quote) {
        return null;
      }

      return state.getters['robinhood/instrument'](this.quote.instrument);
    },
    fundamentals() {
      if (!this.instrument) {
        return null;
      }

      return state.getters['robinhood/resource'](this.instrument.fundamentals);
    }
  },
  watch: {
    symbol() {
      const self = this;

      self.quoteError = false;

      (async () => {
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
    instrument(instrument) {
      if (!this.fundamentals) {
        state.dispatch('robinhood/getResource', instrument.fundamentals);
      }
    }
  },
  methods: {
    openUrl(url) {
      shell.openExternal(url);
    },
    orderComplete() {
      setTimeout(() => { this.isBuying = false; }, 5000);
    },
    formatMoney(money) {
      return util.formatMoney(money);
    }
  },
  components: {
    position: Position,
    'position-table': PositionTable,
    'new-order': NewOrder,
    'ticker-link': TickerLink,
    'quote-historicals': QuoteHistoricals
  }
};
</script>
