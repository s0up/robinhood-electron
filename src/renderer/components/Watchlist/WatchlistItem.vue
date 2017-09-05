<template>
  <tr v-if="quote && instrument">
    <td><ticker-link :symbol="instrument.symbol"></ticker-link></td>
    <td v-money="quote.last_trade_price"></td>
    <td v-money="quote.adjusted_previous_close"></td>
    <td v-money="quote.ask_price"></td>
    <td v-money="quote.bid_price"></td>
    <td class='text-center'><span @click="remove" role="button" class="glyphicon glyphicon-remove"></span></td>
  </tr>
</template>
<script>
import TickerLink from '@/components/TickerLink';
import state from '@/state';

export default {
  props: ['data'],
  computed: {
    instrument() {
      return state.getters['robinhood/instrument'](this.data.instrument);
    },
    quote() {
      if (!this.instrument) {
        return null;
      }

      return state.getters['robinhood/quote'](this.instrument.symbol);
    }
  },
  methods: {
    remove() {
      this.$emit('remove', this.data);
    }
  },
  components: {
    'ticker-link': TickerLink
  }
};
</script>
