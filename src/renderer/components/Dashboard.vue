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
          <h3 v-money="account.computed_buying_power"></h3>
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
  <portfolio-historicals></portfolio-historicals>
  <hr>
  <positions></positions>
  <hr>
  <h3>Notifications</h3>
  <notification-cards></notification-cards>
</div>
</template>
<script>
import state from '@/state';
import NotificationCards from '@/components/NotificationCards';
import PortfolioHistoricals from '@/components/Graphs/PortfolioHistoricals';
import Positions from '@/components/Positions';

export default {
  computed: {
    account() {
      return state.getters['robinhood/currentAccount'];
    },
    robinhoodUser() {
      return state.getters['robinhood/robinhoodUser'];
    },
    portfolio() {
      return state.getters['robinhood/resource'](this.account.portfolio);
    }
  },
  components: {
    positions: Positions,
    'portfolio-historicals': PortfolioHistoricals,
    'notification-cards': NotificationCards
  }
};
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

.small {
  margin: 0px auto;
  background-color: #333333;
}
</style>
