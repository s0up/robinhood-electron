<template>
  <div class='dashboard-layout'>
    <main-nav></main-nav>
    <div class='main-content'>
      <div v-if="fatalError">
        <h1 class="display-3 text-center text-danger">Oh Snap!</h1>
        <p class="lead text-center text-danger">{{fatalError}}</p>
      </div>
      <div class='container-fluid container-main'>
        <router-view v-if="loaded"></router-view>
      </div>
      <footer-page v-if="loaded"></footer-page>
    </div>
  </div>
</template>
<script>
import state from '@/state';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default {
  async created(){
    try{
      await state.dispatch('robinhood/getAccounts');
      await state.dispatch('robinhood/getUser');
      await state.dispatch('robinhood/getMarkets');
    }catch(e){
      state.commit('setFatalError', 'There was a critical error connecting with Robinhood.  This could be an outage!');
      console.log(e.toString());
    }
  },
  computed: {
    loaded(){
      return (this.userData && this.account && this.robinhoodUser && this.portfolio);
    },
    userData: function(){
      return state.getters['auth/userData'];
    },
    account: function(){
      return state.getters['robinhood/currentAccount'];
    },
    loggedIn: function(){
       return state.getters['auth/loginState'];
    },
    loginStateChecked: function(){
       return state.getters['auth/loginStateChecked'];
    },
    robinhoodUser: function(){
      return state.getters['robinhood/robinhoodUser'];
    },
    portfolio(){
      return state.getters['robinhood/resource'](this.account.portfolio);
    },
    markets(){
      return state.getters['robinhood/markets'];
    },
    fatalError(){
      return state.getters.fatalError
    }
  },
  watch: {
    account(account){
      state.dispatch('robinhood/getResource', account.portfolio);
    }
  },
  components: {
    'main-nav': Nav,
    'footer-page': Footer
  }
}
</script>
