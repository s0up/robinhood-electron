/*Route ipc requests to the robinhood api*/
import { app, BrowserWindow, ipcMain } from 'electron'
const storage = require('electron-json-storage');

import _ from 'lodash';
import RobinHood from './RobinHood';
let rh = new RobinHood();

/*
This is just to replace the API / router of the web version of this app.  Robinhood_username is set as My Account for compatibility
*/

export default {
  start() {
    ipcMain.on('storage', function(event, arg){
      arg.payload.push(function(err, result){
        event.sender.send(arg['requestId'], {err: err, result: result});
      });

      storage[arg['action']].apply(this, arg['payload']);
    });

    ipcMain.on('post', async function(event, arg){
      let requestId = _.clone(arg.requestId);
      delete arg['requestId'];

      try{
        if(arg.url.indexOf('user')){
          if(arg.url == '/user/login'){
            let loginResult = await rh.connect(arg.username, arg.password);
            event.sender.send(requestId, {err: null, result: loginResult, userData: {robinhood_username: "My Account"}});
            return;
          }

          if(arg.url == '/user/logout'){
            rh.api.token = null;
            event.sender.send(requestId, {err: null, result: 'SUCCESS'});
          }

          if(arg.url == '/user/checkLoginState'){
            if(typeof rh.api.token !== 'undefined' && rh.api.token != null){
              event.sender.send(requestId, {err: null, result: true, userData: {robinhood_username: "My Account"}});
            }else{
              event.sender.send(requestId, {err: null, result: false, userData: null});
            }

            return;
          }
        }

        let action = arg.url.replace('/robinhood/', '');

        delete arg['url'];

        console.log("Passing action " + action + " with data ", Object.values(arg) + " to robinhood-api library");

        let result = await rh[action].apply(rh.context, Object.values(arg));

        event.sender.send(requestId, {err: null, result: result});
        return;
      }catch(e){
        event.sender.send(requestId, {err: e.toString(), result: null});
      }
    });
  }
}
