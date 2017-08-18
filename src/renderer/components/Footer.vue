<template>
<footer class='footer'>
  <div class='container'>
    <div class='row'>
      <div class="col-xs-4 text-center">
        Account Equity: <span v-money="portfolio.equity"></span>
      </div>
      <div class="col-xs-4 text-center">
        Buying Power: <span v-money="account.computed_buying_power"></span>
      </div>
      <div class="col-xs-4 text-center">
        Market Close: <span v-from-now="marketClose"></span>
      </div>
    </div>
  </div>
</footer>
</template>
<script>
import state from '@/state';

export default {
  computed: {
    account(){
      return state.getters['robinhood/currentAccount'];
    },
    robinhoodUser(){
      return state.getters['robinhood/robinhoodUser'];
    },
    portfolio(){
      return state.getters['robinhood/resource'](this.account.portfolio);
    },
    nyse(){
      if(!this.markets){
        return;
      }

      return this.markets.find(market => {
        return market.acronym == 'NYSE';
      });
    },
    marketClose(){
      if(!this.nyse){
        return;
      }

      return this.nyse.todays_hours.closes_at;
    },
    markets(){
      return state.getters['robinhood/markets'];
    }
  }
}
</script>
<style>
html{  position: relative;
  min-height: 100%;}

</style>
