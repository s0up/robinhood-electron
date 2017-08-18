import util from '@/util/util.js';
import moment from 'moment';

export default {
  register(Vue){
    //Format money as cash
    Vue.directive('money', {
      process: function(el, binding){
        if(isNaN(parseFloat(binding.value))){
          el.innerHTML = "N/A";
          return;
        }

        el.innerHTML = util.formatMoney(binding.value);
      },
      inserted: function (el, binding) {
        Vue.directive('money').process(el, binding);
      },
      update: function(el, binding){
        Vue.directive('money').process(el, binding);
      }
    });

    Vue.directive('round', {
      process: function(el, binding){
        if('number' in binding.value === false || isNaN(parseFloat(binding.value.number))){
          return;
        }

        let decimals = 2;

        if('decimals' in binding.value){
          decimals = binding.value.decimals;
        }

        el.innerHTML = parseFloat(binding.value.number).toFixed(decimals);
      },
      inserted: function(el, binding){
        Vue.directive('round').process(el, binding);
      },
      update: function(el, binding){
        Vue.directive('round').process(el, binding);
      }
    });

    Vue.directive('from-now', {
      inserted: function(el, binding){
        el.innerHTML = moment(new Date(binding.value)).fromNow().toString();
      },
      update(el, binding){
        el.innerHTML = moment(new Date(binding.value)).fromNow().toString();
      }
    });
  }
}
