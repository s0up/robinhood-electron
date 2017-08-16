<template>
  <div v-if='loginStateChecked' id="app">
    <login-page v-if="!loggedIn"></login-page>
    <layout v-if="loggedIn === true"></layout>
  </div>
</template>
<script>
import LoginPage from '@/components/LoginPage';
import Layout from '@/components/Layout';
import state from '@/state';

export default {
   name: 'app',
   components: {
      'login-page' : LoginPage,
      'layout': Layout
   },
   computed: {
      loggedIn: function(){
         return state.getters['auth/loginState'];
      },
      loginStateChecked: function(){
         return state.getters['auth/loginStateChecked'];
      }
   }
}
</script>
