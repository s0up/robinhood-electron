import Vue from 'vue';
import Vuex from 'vuex';

import Auth from '@/state/auth';
import Robinhood from '@/state/robinhood';

import { ipcRenderer } from 'electron';

Vue.use(Vuex);

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  fatalError: null,
  updateAvailable: null
};

const actions = {
  monitorUpdates(state) {
    ipcRenderer.on('updateAvailable', (event, data) => {
      state.commit('setUpdateAvailable', data);
    });
  }
};

const mutations = {
  setFatalError: (state, error) => { state.fatalError = error; },
  setUpdateAvailable: (state, update) => { state.updateAvailable = update; }
};

const getters = {
  fatalError: state => state.fatalError,
  updateAvailable: state => state.updateAvailable
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  modules: {
    auth: Auth,
    robinhood: Robinhood
  }
});
