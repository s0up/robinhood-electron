import util from '@/util/util.js';
import moment from 'moment';

export default {
  register(Vue){
    //Format money as cash
    Vue.directive('money', {
      inserted: function (el, binding) {
        if(isNaN(parseFloat(binding.value))){
          el.innerHTML = "N/A";
          return;
        }

        el.innerHTML = util.formatMoney(binding.value);
      },

      update: function(el, binding){
        if(isNaN(parseFloat(binding.value))){
          el.innerHTML = "N/A";
          return;
        }

        el.innerHTML = util.formatMoney(binding.value);
      }
    });

    Vue.directive('round', {
      inserted: function(el, binding){
        if(isNaN(parseFloat(el.innerHTML))){
          return;
        }

        binding.value = (typeof binding.value === 'undefined') ? 2 : binding.value;

        el.innerHTML = parseFloat(el.innerHTML).toFixed(binding.value);
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
