var {ipcRenderer, remote} = require('electron');
var uuid = require('uuid');

export default {
  formatMoney: function(amount) {
    return ((parseFloat(amount) < 0) ? '-' : '') + '$' + (Math.abs(parseFloat(amount)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
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
  }
}
