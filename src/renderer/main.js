// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Directives from '@/util/directives';
import jquery from 'jquery';
import axios from 'axios';
import lodash from 'lodash';
import VueLodash from 'vue-lodash/dist/vue-lodash.min';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue';
import App from './App';
import router from './router';

window.axios = axios;
window.jQuery = jquery;
window.$ = window.jQuery;

/* Userland css */
require('@/assets/styles/main.css');

Vue.use(BootstrapVue);
Vue.use(VueLodash, lodash);

Directives.register(Vue);

const electron = require('electron');

const remote = electron.remote;
const Menu = remote.Menu;

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  Menu.popup(remote.getCurrentWindow());
}, false);

const InputMenu = Menu.buildFromTemplate([
  {
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
  }]
);

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
