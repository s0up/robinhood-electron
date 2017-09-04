<template>
   <tr v-if="quote && instrument">
      <td><ticker-link :symbol="instrument.symbol"></ticker-link></td>
      <td v-round="{number: position.quantity, decimals: 0}" class="text-center"></td>
      <td v-money="position.average_buy_price"></td>
      <td v-money="quote.last_trade_price"></td>
      <td v-money="totalValue"></td>
      <td v-money="dayROI" v-bind:class="{'text-success': dayROI > 0, 'text-danger': dayROI < 0}"></td>
      <td v-money="roi" v-bind:class="{'text-success': roi > 0, 'text-danger': roi < 0}"></td>
      <td>{{heldFromNow}}</td>
   </tr>
</template>
<script>
import state from '@/state';
import moment from 'moment';
import TickerLink from '@/components/TickerLink';

export default {
  name: 'position',
  props: ['row'],
  computed: {
    totalValue() {
      return (this.position.quantity * this.quote.last_trade_price);
    },
    heldFromNow() {
      return moment(new Date(this.position.created_at)).fromNow().toString();
    },
    position() {
      return this.row;
    },
    instrument() {
      return state.getters['robinhood/instrument'](this.position.instrument);
    },
    quote() {
      return state.getters['robinhood/quote'](this.instrument.symbol);
    },
    totalSpend() {
      return (this.position.average_buy_price * this.position.quantity);
    },
    roi() {
      const lastPrice =
        (this.quote.last_extended_hours_trade_price) ?
          this.quote.last_extended_hours_trade_price : this.quote.last_trade_price;

      return ((lastPrice * this.position.quantity) - this.totalSpend);
    },
    dayROI() {
      const lastPrice =
        (this.quote.last_extended_hours_trade_price) ?
          this.quote.last_extended_hours_trade_price : this.quote.last_trade_price;

      const change = (parseFloat(lastPrice) - parseFloat(this.quote.adjusted_previous_close));

      return change * parseFloat(this.position.quantity);
    }
  },
  components: {
    'ticker-link': TickerLink
  }
};
</script>
