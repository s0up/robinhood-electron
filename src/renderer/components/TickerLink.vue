<template>
  <div class='ticker-link'  @mouseenter="showStats = true" @mouseleave="showStats = false">
    <router-link v-if="!basic" :to="{name: 'stock-view', params: {symbol: symbol}}">
      <span v-if="dayGains != 0" v-bind:class="{'glyphicon glyphicon-triangle-top' : dayGains > 0, 'glyphicon glyphicon-triangle-bottom' : dayGains < 0}"></span>
      <strong>{{this.symbol}} <span v-bind:class='textClass'>{{gainsText}}</span></strong>
    </router-link>
    <router-link v-else :to="{name: 'stock-view', params: {symbol: symbol}}"><strong>{{symbol}}</strong></router-link>
  </div>
</template>
<script>
import state from '@/state';

export default {
  props: ['symbol', 'basic'],
  name: 'ticker-link',
  created() {
    if (this.basic) {
      return;
    }

    if (!state.getters['robinhood/quote'](this.symbol)) {
      state.dispatch('robinhood/getQuote', this.symbol);
    }
  },
  data() {
    return {
      showStats: false
    };
  },
  computed: {
    quote() {
      return state.getters['robinhood/quote'](this.symbol);
    },
    gainsText() {
      if (!this.quote) {
        return null;
      }

      return `(${this.dayGains}%)`;
    },
    dayGains() {
      if (!this.quote) {
        return 0;
      }

      return (
        (
          (parseFloat(this.quote.last_trade_price) / parseFloat(this.quote.adjusted_previous_close)
        ) * 100) - 100
      ).toFixed(2);
    },
    textClass() {
      if (this.dayGains === 0) {
        return '';
      }

      return (this.dayGains > 0) ? 'text-success' : 'text-danger';
    }
  },
  watch: {
    quote(quote) {
      this.$emit('quote', quote);
    }
  }
};
</script>
