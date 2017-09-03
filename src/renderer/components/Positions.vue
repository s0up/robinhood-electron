<template>
   <div class='row'>
      <div class='col-md-12'>
         <h3>Currently Held Positions</h3>
      </div>
      <div class='col-md-12'>
        <div class="table-responsive">
          <position-table v-if="positions">
            <position slot="position-table-body" v-for="(position, index) in positions" :key="index" :row="position"></position>
          </position-table>
        </div>
         <nav v-if="previousPosition || nextPosition" aria-label="Page navigation">
           <ul class="pagination">
             <li v-if="previousPosition != null" @click="previousPage" class="page-item"><a class="page-link">Previous</a></li>
             <li v-if="nextPosition != null" @click="nextPage" class="page-item"><a class="page-link">Next</a></li>
           </ul>
         </nav>
      </div>
   </div>
</template>
<script>
import state from '@/state';

import Position from '@/components/Positions/Position';
import PositionTable from '@/components/Positions/PositionTable';

export default {
  name: 'positions',
  created() {
    this.getPositions();
  },
  data() {
    return {
      positionTimer: setTimeout(() => {}, 0)
    };
  },
  computed: {
    positions() {
      return state.getters['robinhood/positions'];
    },
    nextPosition() {
      return state.getters['robinhood/nextPosition'];
    },
    previousPosition() {
      return state.getters['robinhood/previousPosition'];
    },
    dayHistoricals() {
      return state.getters['robinhood/historical']({
        interval: '5minute',
        span: 'day'
      });
    },
    account() {
      return state.getters['robinhood/currentAccount'];
    },
    gainsToday() {
      // eslint-disable-next-line max-len
      return this.dayHistoricals.adjusted_open_equity - this.dayHistoricals.adjusted_previous_close_equity;
    }
  },
  beforeDestroy() {
    clearTimeout(this.positionTimer);
  },
  methods: {
    async getPositions() {
      clearTimeout(this.positionTimer);

      try {
        await state.dispatch('robinhood/getPositions');
        await state.dispatch('robinhood/getHistoricals', {
          account_number: this.account.account_number,
          interval: '5minute',
          span: 'day'
        });
      } catch (e) {
        console.log('Error retrieving positions', e);
      }

      this.positionTimer = setTimeout(this.getPositions, 10000);
    },
    nextPage() {
      state.dispatch('robinhood/getPositions', self.nextPosition);
    },
    previousPage() {
      state.dispatch('robinhood/getPositions', self.previousPosition);
    }
  },
  components: {
    position: Position,
    'position-table': PositionTable
  }
};
</script>
