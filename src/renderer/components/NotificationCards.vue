<template>
<div class='notification-cards'>
  <div v-if="cards">
    <div class='row' v-for="card in cards">
      <div class='col-xs-12'>
        <div class="panel panel-default ">
          <div class="panel-heading">
            {{card.title}}
            <button @click="dismissCard(card)" type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
          </div>
          <div class="panel-body">
            <span>{{card.message}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script>
import state from '@/state';

export default {
  name: 'notification-cards',
  async created() {
    try {
      await state.dispatch('robinhood/getCards');
    } catch (e) {
      console.log('Unable to load notification cards...');
    }
  },
  computed: {
    cards() {
      return state.getters['robinhood/cards'];
    }
  },
  methods: {
    async dismissCard(card) {
      try {
        const urlPieces = card.url.split('/');
        const cardId = urlPieces[urlPieces.length - 2];
        const cards = state.getters['robinhood/cards'];

        cards.splice(cards.findIndex(item => item.url === card.url), 1);

        state.commit('setCards', cards);

        await state.dispatch('robinhood/dismissCard', cardId);
      } catch (e) {
        console.log('Card removal failed', e);
      }
    }
  },
};
</script>
