<template>
  <div v-if="watchlistData" class='watchlist'>
    <table class='watchlist-tbl table table-condensed text-left'>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Last Trade Price</th>
          <th>Previous Close Price</th>
          <th>Ask Price</th>
          <th>Bid Price</th>
        </tr>
      </thead>
      <watchlist-item :data="watchlistItem" v-for="watchlistItem in watchlistData.results" :key="watchlistItem.url"></watchlist-item>
    </table>
  </div>
</template>
<script>
import WatchlistItem from '@/components/Watchlist/WatchlistItem';
import state from '@/state';

export default {
  props: ['watchlist'],
  created(){
    this.updateWatchlist();
  },
  data(){
    return {
      watchlist_timer: setTimeout(function(){}, 0)
    }
  },
  computed: {
    watchlistData(){
      return state.getters['robinhood/watchlistData'](this.watchlist.url);
    }
  },
  methods: {
    async updateWatchlist(){
      clearTimeout(this.watchlist_timer);

      await state.dispatch('robinhood/getWatchlist', this.watchlist.url);

      this.watchlist_timer = setTimeout(() => this.updateWatchlist(), 60000);
    }
  },
  beforeDestroy(){
    clearTimeout(this.watchlist_timer);
  },
  components: {
    'watchlist-item': WatchlistItem
  }
}
</script>
