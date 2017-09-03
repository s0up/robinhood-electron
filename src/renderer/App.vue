<template>
  <div v-if='loginStateChecked' id="app">
    <window-top></window-top>
    <div id='content'>
      <login-page v-if="!loggedIn"></login-page>
      <layout v-if="loggedIn === true"></layout>
    </div>
  </div>
</template>
<script>
import LoginPage from '@/components/LoginPage';
import WindowTop from '@/components/Common/WindowTop';
import Layout from '@/components/Layout';
import state from '@/state';

export default {
  name: 'app',
  created() {
    state.dispatch('monitorUpdates');
  },
  components: {
    'login-page': LoginPage,
    layout: Layout,
    'window-top': WindowTop
  },
  computed: {
    loggedIn() {
      return state.getters['auth/loginState'];
    },
    loginStateChecked() {
      return state.getters['auth/loginStateChecked'];
    }
  }
};
</script>
