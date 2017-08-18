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


Directives.register(Vue);

const electron = require('electron');
const remote = electron.remote;
const Menu = remote.Menu;

window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  rightClickPosition = {
    x: e.x,
    y: e.y
  }
  menu.popup(remote.getCurrentWindow())
}, false)

const InputMenu = Menu.buildFromTemplate([{
  label: 'Undo',
  role: 'undo',
}, {
  label: 'Redo',
  role: 'redo',
}, {
  type: 'separator',
}, {
  label: 'Cut',
  role: 'cut',
}, {
  label: 'Copy',
  role: 'copy',
}, {
  label: 'Paste',
  role: 'paste',
}, {
  type: 'separator',
}, {
  label: 'Select all',
  role: 'selectall',
}, ])

document.body.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  e.stopPropagation();

  let node = e.target;

  while (node) {
    if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
      InputMenu.popup(remote.getCurrentWindow());
      break;
    }
    node = node.parentNode;
  }
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {
    App
  }
});
