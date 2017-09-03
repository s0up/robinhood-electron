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
// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  setFatalError: (state, error) => { state.fatalError = error; },
  setUpdateAvailable: (state, update) => { state.updateAvailable = update; }
};


// getters are functions
const getters = {
  fatalError: state => state.fatalError,
  updateAvailable: state => state.updateAvailable
};

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
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
