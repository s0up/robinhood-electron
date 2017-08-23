var {ipcRenderer, remote} = require('electron');
var uuid = require('uuid');

export default {
  formatPercent: function(before, after){
      if(isNaN(parseFloat(before)) || isNaN(parseFloat(after))){
        return "N/A";
      }

      if(parseFloat(before) === 0 || parseFloat(after) === 0){
        return "0%";
      }

      return (((parseFloat(after) / parseFloat(before)) * 100) - 100).toFixed(2) + "%";
  },

  formatMoney: function(amount, showPlus) {
    if(isNaN(parseFloat(amount))){
      return "N/A";
    }

    return ((parseFloat(amount) < 0) ? '-' : (showPlus) ? '+' : '') + '$' + (Math.abs(parseFloat(amount)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  },

  post(url, data) {
    return new Promise(function(resolve, reject){
      if(!data){
        data = {url: url};
      }else{
        data.url = url;
      }

      data.requestId = uuid.v4();

      ipcRenderer.once(data.requestId, function(event, arg){
        if('err' in arg && arg.err != null){
          return reject(arg.err.toString());
        }else{
          console.log("Got response for " + url, arg);
          return resolve(arg);
        }
      });

      console.log("Sending data ", data);
      ipcRenderer.send('post', data);
    });
  },

  storage(action, payload){
    let requestId = uuid.v4();

    return new Promise(function(resolve, reject){
      ipcRenderer.once(requestId, function(event, arg){
        if('err' in arg && arg.err != null){
          return reject(arg.err.toString());
        }else{
          return resolve(arg['result']);
        }
      });

      ipcRenderer.send('storage', {
        action: action,
        payload: payload,
        requestId: requestId
      });
    });
  }
}
