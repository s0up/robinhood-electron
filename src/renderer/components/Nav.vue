<!-- Static navbar -->
<template>
  <nav id='header' class="navbar navbar-inverse">
    <div class="container">
      <div class="navbar-header">
        <router-link to="/" class="navbar-brand">RHClient</router-link>
      </div>
      <div id="navbar" class="">
        <div class="navbar-form navbar-left" role="search"  @keyup.enter="search">
            <div class="form-group">
                <input v-model="ticker_search" type="text" class="form-control input-sm" placeholder="Ticker Search" @keyup="search" @blur="loseFocus">
                <button type="submit" class="btn btn-default btn-sm">
                    <span class="glyphicon glyphicon-search"></span>
                </button>
            </div>
            <div class='search-results' v-if="(searchResults.length > 0 || no_results_found) && search_focused">
              <div class="list-group">
                <a v-for="result in searchResults" class="list-group-item" @click="gotoStock(result.symbol)" :key="result.symbol">({{result.symbol}}) {{result.name}}</a>
                <a v-if="no_results_found" class="text-danger list-group-item">No results found :(</a>
              </div>
            </div>
        </div>
        <ul class="nav navbar-nav navbar-right">
          <li><router-link to="/positions" class="nav-link">Positions</router-link></li>
          <li><router-link to="/recent-orders" class="nav-link">Orders</router-link></li>
          <li><router-link :to="{name: 'banking'}" class="nav-link">Transfers</router-link></li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script>
import state from '@/state';
import _ from 'lodash';

export default {
  name: 'main-nav',
  data(){
    return {
      ticker_search: "",
      search_focused: false,
      no_results_found: false
    }
  },
  methods: {
    logout: function(){
      state.dispatch('auth/logout');
    },
    loseFocus(){
      setTimeout(() => {
        this.search_focused = false;
        this.ticker_search = "";
      }, 500)
    },
    search: _.debounce(function(){
      this.handleSearch();
    }, 500),
    async handleSearch(){
      this.search_focused = true;
      this.no_results_found = false;

      if(this.ticker_search == ""){
        return;
      }

      let ticker = this.ticker_search.toUpperCase();

      //this.ticker_search = "";

      try{
        await state.dispatch('robinhood/search', ticker);

        if(this.searchResults.length == 0){
          this.no_results_found = true;
        }
      }catch(e){
        this.no_results_found = true;
      }
    },
    gotoStock(symbol){
      this.ticker_search = "";
      this.search_focused = false;
      this.$router.push({name: 'stock-view', params: {symbol: symbol}});
    }
  },
  computed: {
    userData: function(){
      return state.getters['auth/userData'];
    },
    account: function(){
      return state.getters['robinhood/currentAccount'];
    },
    searchResults: () => state.getters['robinhood/searchResults']
  },

  watch: {

  }
}
</script>
<style scoped>
.navbar-inverse .navbar-brand {
  color: #fff;
  font-weight: bold;
}
.navbar-form {
    margin-top: 10px;
    margin-bottom: 10px;
}

</style>
