<template>
  <tr v-if="quote && instrument">
    <!--
    <th>Symbol</th>
    <th>Last Trade Price</th>
    <th>Previous Close Price</th>
    <th>Ask Price</th>
    <th>Bid Price</th>
    -->
    <td><ticker-link :symbol="instrument.symbol"></ticker-link></td>
    <td v-money="quote.last_trade_price"></td>
    <td v-money="quote.adjusted_previous_close"></td>
    <td v-money="quote.ask_price"></td>
    <td v-money="quote.bid_price"></td>
  </tr>
</template>
<script>
import TickerLink from '@/components/Common/TickerLink';
import state from '@/state';

export default {
  props: ['data'],
  created(){
    //console.log(state.getters['robinhood/quote'](state.getters['robinhood/instrument'](this.data.instrument)['symbol']));
  },
  computed: {
    instrument(){
      return state.getters['robinhood/instrument'](this.data.instrument);
    },
    quote(){
      if(!this.instrument){
        return;
      }

      return state.getters['robinhood/quote'](this.instrument.symbol);
    }
  },
  components: {
    'ticker-link': TickerLink
  }
}
</script>
