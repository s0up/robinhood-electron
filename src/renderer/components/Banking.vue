<template>
<div class='banking container-fluid'>
  <ul class="nav nav-tabs nav-justified">
    <li role="presentation" v-bind:class="{'active': activeItem == 'manual'}" @click="activeItem = 'manual'"><a>Manual Transfers</a></li>
    <li role="presentation" v-bind:class="{'active': activeItem == 'automatic'}" @click="activeItem = 'automatic'"><a>Automatic Transfers</a></li>
  </ul>
  <p>&nbsp;</p>
  <div class='manual-transfer' v-if="activeItem == 'manual' && !onetime_transfer_complete">
    <p class="lead">Perform a One Time Transfer</p>
    <div class="form-horizontal">
      <div class="form-group">
        <div class="col-sm-2">
          <label for="achSource">ACH Source: </label>
        </div>
        <div class="col-sm-9">
          <select v-model="onetime_ach_source" name="ach_source" id="achSource" class="form-control">
            <option v-for="account in ACHRelationships" v-bind:value="account.url">
              {{account.bank_account_nickname}}
            </option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <div class="col-sm-2">
          <label for="direction">Direction: </label>
        </div>
        <div class="col-sm-9">
          <select v-model="direction" name="direction" id="direction" class="form-control">
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <div class="col-sm-2">
          <label for="moneyDeposit" class="control-label text-right">Dollar Amount:</label>
        </div>
        <div class="col-sm-9">
          <div class="input-group">
            <span class="input-group-addon">$</span>
            <input v-model="onetime_amount" type="text" class="form-control" id="moneyDeposit" placeholder="100">
          </div>
        </div>
      </div>
      <div v-if="transfer_error" class='alert alert-danger'>{{transfer_error}}</div>
      <button v-if="!submitting" @click="oneTimeTransfer" type="submit" class="btn btn-green">Submit</button>
      <button v-if="submitting" type="submit" class="btn">Submitting...</button>
    </div>
  </div>
  <div class="transfer-complete-msg text-center" v-if="onetime_transfer_complete">
    <h1 class="display-3 text-center">Transfer Complete</h1>
    <p class="lead text-center text-danger">Your transfer has been executed.</p>
  </div>
  <div class="clear">&nbsp;</div>
  <div v-if="activeItem == 'manual'" class="table-responsive">
    <h3>Transfer History</h3>
    <table class="table transfers table-condensed">
      <thead>
        <tr>
          <th>Amount</th>
          <th>Direction</th>
          <th>Early Access Amount</th>
          <th>Expected Landing Date</th>
          <th>Fees</th>
          <th>State</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="transfer in ACHTransfers">
          <td v-money="transfer.amount"></td>
          <td>{{transfer.direction}}</td>
          <td v-money="transfer.early_access_amount"></td>
          <td v-from-now="transfer.expected_landing_date"></td>
          <td v-money="transfer.fees"></td>
          <td>{{transfer.state}}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class='automatic-transfer' v-if="activeItem == 'automatic'">
    <p class="lead">Schedule an Automatic Transfer</p>
    <h1>Coming soon...</h1>
    <!--
    <div class="form-horizontal">
      <div class="form-group">
        <div class="col-sm-2">
          <label for="moneyDeposit" class="control-label text-right">Dollar Amount:</label>
        </div>
        <div class="col-sm-9">
          <div class="input-group">
            <span class="input-group-addon">$</span>
            <input type="text" class="form-control" id="moneyDeposit" placeholder="100">
          </div>
        </div>
      </div>
      <button type="submit" class="btn btn-default">Submit</button>
    </div>-->
  </div>
</div>
</template>
<script>
/*ach_relationship:"https://api.robinhood.com/ach/relationships/b02f2c52-496d-44a6-a92f-033c5641e20e/"
amount:"50.00"
cancel:null
created_at:"2017-08-08T05:27:39.430834Z"
direction:"deposit"
early_access_amount:"50.00"
expected_landing_date:"2017-08-14"
fees:"0.00"
id:"bf4fc73a-13dc-44d9-8eb6-62ed4ea87538"
scheduled:false
state:"pending"
status_description:""
updated_at:"2017-08-08T05:27:39.834116Z"
url:"https://api.robinhoo
*/

import state from '@/state';

export default {
  async created() {
    await state.dispatch('robinhood/getAccounts');
    await state.dispatch('robinhood/getACHRelationships');

    state.dispatch('robinhood/getACHTransfers');
    state.dispatch('robinhood/getAutomaticACHTransfers');
  },
  data() {
    return {
      activeItem: 'manual',
      onetime_amount: '50.00',
      onetime_ach_source: null,
      direction: 'deposit',
      submitting: false,
      transfer_error: null,
      onetime_transfer_complete: false,
    }
  },
  computed: {
    ACHTransfers() {
      return state.getters['robinhood/ACHTransfers'];
    },
    automaticACHTransfers() {
      return state.getters['robinhood/automaticACHTransfers'];
    },
    accounts() {
      return state.getters['robinhood/accounts'];
    },
    currentAccount() {
      return state.getters['robinhood/currentAccount'];
    },
    ACHRelationships(){
      return state.getters['robinhood/ACHRelationships'];
    },
    oneTimeFormData(){
      return {
        amount: this.onetime_amount,
        direction: this.direction,
        ach_relationship: this.onetime_ach_source
      }
    }
  },
  methods: {
    async oneTimeTransfer(){
      try{
        this.submitting = true;
        await state.dispatch('robinhood/ACHTransfer', this.oneTimeFormData);
        this.submitting = false;
        this.onetime_transfer_complete = true;
        await state.dispatch('robinhood/getACHTransfers');
      }catch(e){
        this.submitting = false;
        this.onetime_transfer_complete = false;
        this.transfer_error = e.toString();
      }
    }
  },
  watch: {
    ACHRelationships(){
      if(this.ACHRelationships.length > 0){
        this.onetime_ach_source = this.ACHRelationships[0].url;
      }
    },
    transfer_error(){
      setTimeout(() => this.transfer_error = null, 3000);
    },
    onetime_transfer_complete(status){
      if(status){
        setTimeout(() => this.onetime_transfer_complete = false, 3000);
      }
    }
  }
}
</script>
