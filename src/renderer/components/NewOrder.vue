<template>
<transition name="fade">
  <div class='new-order'>
    <div v-if="!order_complete" class="order-form">
      <button @click="$emit('cancelOrder')" type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
      <h3>Place an Order</h3>
      <div class="form-group">
        <label for="askPrice">Ask Price: </label> <span v-money="quote.ask_price"></span> |
        <label for="bidPrice">Bid Price: </label> <span v-money="quote.bid_price"></span> |
        <label for="tradingHalted">Trading Halted: </label> <span>{{quote.trading_halted}}</span>
      </div>
      <div class="form-group">
        <label for="buyType">Buy Type</label>
        <select v-model="type" class="form-control" id="buyType">
            <option value='market'>Market Order</option>
            <option value='limit'>Limit Order</option>
          </select>
      </div>
      <div class="form-group">
        <label for="buyTimeInForce">Time in Force</label>
        <select v-model="time_in_force" class="form-control" id="buyTimeInForce">
            <option value='gfd'>Good for Day</option>
            <option value='gtc'>Good til canceled</option>
            <option value='ioc'>Immediate or cancel</option>
            <option value='fok'>Fill or Kill</option>
            <option value='opg'>Limit-On-Open order</option>
          </select>
      </div>
      <div class="form-group">
        <div class="alert alert-info alert-dismissible alert-green" role="alert">
          <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
          <span v-if="time_in_force == 'gfd'">
            A day order or good for day order (GFD) (the most common) is a market or limit order that is in force from the time the order is submitted to the end of the day's trading session. For stock markets, the closing time is defined by the exchange.
          </span>
          <span v-if="time_in_force == 'gtc'">
            A good 'til canceled (GTC) order can be placed by an investor to buy or sell a security at a specified price that remains active until it is either rescinded by the investor or the trade is executed. GTC orders offer an alternative to placing a sequence of day orders, which expire at the end of each trading day.
          </span>
          <span v-if="time_in_force == 'ioc'">
            An immediate or cancel (IOC) order, also known as an "accept order", is a finance term used in investment banking or securities transactions that refers "an order to buy or sell a stock that must be executed immediately".
          </span>
          <span v-if="time_in_force == 'fok'">
            A fill or kill (FOK) order is "an order to buy or sell a stock that must be executed immediately"—a few seconds, customarily—in its entirety; otherwise, the entire order is cancelled; no partial fulfillments are allowed.
          </span>
          <span v-if="time_in_force == 'opg'">
            OPG is used with a Limit order to indicate a Limit-On-Open order, or with a Market order to indicate a Market-on-Open order.
          </span>
        </div>
      </div>
      <div class="form-group">
        <label for="trigger">Trigger</label>
        <select v-model="trigger" class="form-control" id="trigger">
          <option value='immediate'>Immediate</option>
          <option value='stop'>Stop</option>
        </select>
      </div>
      <div class="form-group">
        <label for="price">Price</label>
        <input type='text' class="form-control" v-model="price"/>
      </div>
      <div class="form-group" v-if="trigger == 'stop'">
        <label for="stopPrice">Stop Price</label>
        <input type='text' class="form-control" v-model="stop_price"/>
      </div>
      <div class="form-group">
        <label for="quantity">Quantity</label>
        <input type="text" class="form-control" v-model="quantity"/>
      </div>
      <div class="form-group">
        <label for="side">Side</label>
        <select v-model="side" class="form-control" id="side">
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>
      <div class="form-group">
        <label for="extendedHours">Extended Hours</label>
        <input type='checkbox' v-model="extended_hours" class="form-control"/>
      </div>
      <div class="form-group" v-if="order_error !== null">
        <div class="alert alert-danger">{{order_error}}</div>
      </div>
      <div class="form-group">
        <label>Order Total: &nbsp;</label><span v-money="orderTotal"></span>
      </div>
      <div class="form-group">
        <button v-if="!submitting" @click="order" class="btn btn-primary">Submit Order</button>
        <button v-else class="btn">Submitting...</button>
      </div>
      <hr>
    </div>
    <div v-else class='order-complete text-center'>
      <h1 class="display-3 text-center">Order Complete</h1>
      <p class="lead text-center text-danger">{{symbol}} order executed.</p>
    </div>
  </div>
</transition>
</template>
<script>
import state from '@/state';
import util from '@/util/util';

export default {
  props: ['symbol', 'buySide'],
  async created() {
    await state.dispatch('robinhood/getQuote', this.symbol);
    this.side = this.buySide;
  },
  data() {
    return {
      type: 'market',
      time_in_force: 'gfd',
      trigger: 'immediate',
      price: 0,
      stop_price: 0,
      quantity: 1,
      side: 'buy',
      extended_hours: false,
      order_error: null,
      submitting: false,
      order_complete: false
    }
  },
  computed: {
    orderTotal(){
      if(isNaN(parseFloat(this.quantity)) || isNaN(parseFloat(this.price))){
        return 0;
      }

      return (parseFloat(this.quantity) * parseFloat(this.price));
    },
    quote() {
      return state.getters['robinhood/quote'](this.symbol);
    },
    account() {
      return state.getters['robinhood/currentAccount'];
    },
    instrument(){
      if(!this.quote){
        return;
      }

      return state.getters['robinhood/instrument'](this.quote.instrument);
    },
    formData(){
      let formData = {
        account: this.account.url,
        instrument: this.instrument.url,
        symbol: this.symbol,
        type: this.type,
        time_in_force: this.time_in_force,
        trigger: this.trigger,
        quantity: this.quantity,
        side: this.side,
        price: this.price
      }

      if(this.trigger === 'stop'){
        formData.stop_price = this.stop_price;
      }

      if(this.extended_hours === true){
        formData.extended_hours = true;
      }

      return formData;
    }
  },
  methods: {
    async order(){
      console.log("Submitting order", this.formData);

      this.submitting = true;

      try{
        await state.dispatch('robinhood/placeOrder', this.formData);
        this.submitting = false;
        this.order_complete = true;
      }catch(e){
        this.order_error = e.toString();
        this.submitting = false;
      }
    }
  },
  watch: {
    quote(){
      this.price = this.quote.ask_price;
    },
    order_error(){
      setTimeout(() => this.order_error = null, 3000);
    },
    order_complete(status){
      if(status){
        state.dispatch('robinhood/getAccounts'); //Update balances, etc
        this.$emit('orderComplete');
      }
    }
  }
}
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s
}

.fade-enter,
.fade-leave-to
/* .fade-leave-active in <2.1.8 */

{
  opacity: 0
}
</style>
