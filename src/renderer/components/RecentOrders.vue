<template>
   <div class='row'>
      <div class='col-md-12'>
         <h3>Recent Orders</h3>
      </div>
      <div class='col-md-12'>
        <div class="table-responsive">
          <table class='recent-orders table table-condensed'>
             <thead>
                <tr>
                   <th>Stock</th>
                   <th>State</th>
                   <th>Order Side</th>
                   <th>Order Type</th>
                   <th>Quantity</th>
                   <th>Average Price</th>
                   <th>Order Age</th>
                   <th>Options</th>
                </tr>
             </thead>
             <tbody v-if="orders.length > 0">
                <recent-order v-for="(order, index) in orders" :row="order" :key="index"></recent-order>
             </tbody>
          </table>
        </div>
         <nav aria-label="Page navigation example">
           <ul class="pagination">
             <li v-if="previousOrder != null" @click="previousPage" class="page-item"><a class="page-link">Previous</a></li>
             <li v-if="nextOrder != null" @click="nextPage" class="page-item"><a class="page-link">Next</a></li>
           </ul>
         </nav>
      </div>
   </div>
</template>
<script>
import state from '@/state';
import Order from '@/components/RecentOrders/Order';

export default {
   name: 'recent-orders',
   created(){
      this.getRecentOrders();
   },
   data(){
     return {
       recentOrderTimer: null
     }
   },
   beforeDestroy(){
     clearTimeout(this.recentOrderTimer);
   },
   methods: {
      nextPage: function(){
        state.dispatch('robinhood/getRecentOrders', self.nextOrder);
      },
      previousPage: function(){
         state.dispatch('robinhood/getRecentOrders', self.previousOrder);
      },
      async getRecentOrders(){
        try{
          await state.dispatch('robinhood/getRecentOrders');
        }catch(e){
          console.log("Unable to get recent orders...");
        }

        this.recentOrderTimer = setTimeout(this.getRecentOrders, 10000);
      }
   },
   computed: {
      previousOrder: function(){
         return state.getters['robinhood/previousOrder'];
      },
      nextOrder: function(){
         return state.getters['robinhood/nextOrder'];
      },
      orders: function(){
         return state.getters['robinhood/recentOrders'];
      }
   },
   components: {
      'recent-order': Order
   }
}
</script>
