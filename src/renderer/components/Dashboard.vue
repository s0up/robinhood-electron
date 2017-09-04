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
  <div v-if="currentWatchlist" class='watchlist'>
    <hr>
    <h3>Watchlist</h3>
    <watchlist :watchlist="currentWatchlist"></watchlist>
  </div>
  <hr>
  <h3>Notifications</h3>
  <notification-cards></notification-cards>
</div>
</template>
<script>
import state from '@/state';
import NotificationCards from '@/components/NotificationCards';
import PortfolioHistoricals from '@/components/Graphs/PortfolioHistoricals';
import Watchlist from '@/components/Watchlist';

export default {
  async created() { // Requests historical data from Robinhood for the following attributes
    try {
      await state.dispatch('robinhood/getWatchlists');
    } catch (e) {
      console.log('Error retrieving dashboard data...', e);
    }
  },
  data() { // Initializes ChartOptions as null
    return {
      currentWatchlist: null,
    };
  },
  computed: {
    account() {
      return state.getters['robinhood/currentAccount'];
    },
    robinhoodUser() {
      return state.getters['robinhood/robinhoodUser'];
    },
    portfolio() {
      return state.getters['robinhood/resource'](this.account.portfolio);
    },
    watchlists() {
      return state.getters['robinhood/watchlists'];
    }
  },
  watch: {
    watchlists(watchlists) {
      if (!this.currentWatchlist) {
        this.currentWatchlist = watchlists[0];
      }
    }
  },
  components: {
    watchlist: Watchlist,
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
