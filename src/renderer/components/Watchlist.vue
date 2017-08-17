<template>
  <div class='watchlist'>
    
  </div>
</template>
<script>
import state from '@/state';

export default {
  props: ['watchlist'],
  created(){
    state.dispatch('robinhood/getResource', this.watchlist.url);
  },
  computed: {
    watchlistData(){
      return state.getters['robinhood/resource'](this.watchlist.url);
    }
  }
}
</script>
