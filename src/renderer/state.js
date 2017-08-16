import Vue from 'vue'
import Vuex from 'vuex'

import Auth from '@/state/auth';
import Robinhood from '@/state/robinhood';

Vue.use(Vuex)

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  fatalError: null
}

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  setFatalError: (state, error) => state.fatalError = error
}


// getters are functions
const getters = {
  fatalError: (state) => state.fatalError
}

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  state,
  getters,
  mutations,
  modules: {
    'auth': Auth,
    'robinhood': Robinhood
  }
})
