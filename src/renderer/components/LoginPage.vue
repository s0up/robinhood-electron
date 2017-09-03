<template>
<div class="container" @keyup.enter="login">
  <div class="form-signin">
    <h2 class="form-signin-heading text-center">Robinhood Login</h2>
    <label for="inputEmail" class="sr-only">Username</label>
    <input v-model="username" type="email" id="username" class="form-control" placeholder="Email" required autofocus>
    <label for="inputPassword" class="sr-only">Password</label>
    <input v-model="password" type="password" id="inputPassword" class="form-control" placeholder="Password" required>
    <label for="inputMFA" class="sr-only">2-Step Auth Code: </label>
    <input v-if="mfaEnabled" v-model="mfaCode" type="text" id="mfacode" class="form-control" placeholder="MFA Code" required>
    <div v-if="error != null" class='alert alert-danger'>{{error}}</div>
    <button v-if="pendingLogin == false" @click="login" class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
    <button v-if="pendingLogin == true" class="btn btn-lg btn-block">Logging In...</button>
  </div>
</div>
<!-- /container -->
</template>
<script>
import state from '@/state';
import util from '@/util/util';

export default {
  name: 'login-page',
  async created() {
    try {
      const creds = await util.storage('get', [
        'loginCredentials'
      ]);

      if (creds && Object.keys(creds).length > 0) {
        this.username = creds.username;
        this.password = creds.password;

        console.log('CREDS', creds, Object.is(creds, {}));
        this.login();
      }
    } catch (e) {
      console.log('Storage error', e);
    }
  },
  data() {
    return {
      username: null,
      password: null,
      mfaCode: '',
      error: null,
      pendingLogin: false,
      mfaEnabled: false
    };
  },
  methods: {
    async login() {
      this.pendingLogin = true;

      try {
        await state.dispatch('auth/login', { username: this.username, password: this.password, mfa_code: this.mfaCode });

        return;
      } catch (e) {
        this.pendingLogin = false;
        this.error = e.toString();

        if (e.toString().includes('2-step')) {
          this.mfaEnabled = true;
        }
      }
    }
  },
  watch: {
    error: () => {
      setTimeout(() => { this.error = null; }, 3000);
    }
  }
};
</script>
