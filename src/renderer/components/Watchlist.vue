<template>
<div v-if="watchlistData" class='row'>
  <div class='col-md-12'>
    <h3>&nbsp;Default Watchlist</h3>
  </div>
  <div class='col-md-12'>
    <table class='watchlist-tbl table table-condensed text-center'>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Last Trade Price</th>
          <th>Previous Close Price</th>
          <th>Last Extended Hours Trade Price</th>
          <th>Ask Price</th>
          <th>Bid Price</th>
          <th style='text-align: center'>Remove</th>
        </tr>
      </thead>
      <watchlist-item @remove="deleteWatchlistItem" :data="watchlistItem" v-for="watchlistItem in watchlistData.results" :key="watchlistItem.url" v-on:delete="deleteWatchlistItem(watchlistItem)"></watchlist-item>
    </table>
  </div>
</div>
</template>
<script>
import WatchlistItem from '@/components/Watchlist/WatchlistItem';
import state from '@/state';

export default {
  props: ['watchlist'],
  data() {
    return {
      currentWatchlist: null,
      watchlist_timer: setTimeout(() => {}, 0)
    };
  },
  async created() {
    if (this.watchlist) {
      this.currentWatchlist = this.watchlist;
    } else {
      await state.dispatch('robinhood/getWatchlists');
    }

    this.updateWatchlist();
  },
  computed: {
    watchlistData() {
      if (!this.currentWatchlist) {
        return null;
      }

      return state.getters['robinhood/watchlistData'](this.currentWatchlist.url);
    },
    watchlists() {
      return state.getters['robinhood/watchlists'];
    }
  },
  methods: {
    async updateWatchlist() {
      clearTimeout(this.watchlist_timer);

      try {
        await state.dispatch('robinhood/getWatchlist', this.currentWatchlist.url);
      } catch (e) {
        console.log('Failed to retrieve watchlist data...', e.toString());
      }

      this.watchlist_timer = setTimeout(() => this.updateWatchlist(), 60000);
    },
    async deleteWatchlistItem(item) {
      const uuids = this.watchlistData.instruments.filter(
        row => row.url !== item.instrument
      ).map(
        row => row.id
      );

      if (uuids.length === 0) {
        uuids.push('NULL'); // To prevent api error when attempting to remove the last item
      }

      try {
        await state.dispatch('robinhood/reorderWatchlist', {
          name: 'Default',
          uuids: uuids.join(',')
        });
        await state.dispatch('robinhood/getWatchlist', 'https://api.robinhood.com/watchlists/Default/');
      } catch (e) {
        console.log('WATCHLIST: Unable to reorder watchlist', e);
      }
    }
  },
  watch: {
    watchlists(watchlists) {
      if (!this.currentWatchlist) {
        this.currentWatchlist = watchlists[0];
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.watchlist_timer);
  },
  components: {
    'watchlist-item': WatchlistItem
  }
};
</script>
