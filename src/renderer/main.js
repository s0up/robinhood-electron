// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuex from 'vuex'
import state from '@/state'
import Directives from '@/util/directives';

/*Require jquery & bootstrap*/
//window.jQuery = require('../node_modules/jquery/dist/jquery.js');
//window.$ = window.jQuery;

import axios from 'axios';
window.axios = axios;

import jquery from 'jquery';
window.jQuery = jquery;
window.$ = window.jQuery;

import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'


Vue.use(BootstrapVue);

/*Userland css*/
require('@/assets/styles/main.css');

import lodash from 'lodash'
import VueLodash from 'vue-lodash/dist/vue-lodash.min'

Vue.use(VueLodash, lodash)

Vue.config.productionTip = false;

Directives.register(Vue);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
});
