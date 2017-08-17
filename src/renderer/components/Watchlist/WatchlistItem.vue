<template>
  <tr v-if="quote && instrument">
    <td><ticker-link :symbol="instrument.symbol"></ticker-link></td>
    <td><span>{{quote.ask_price}}</span></td>
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
