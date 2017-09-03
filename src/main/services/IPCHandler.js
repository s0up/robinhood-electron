/* Route ipc requests to the robinhood api */
import { ipcMain } from 'electron';
import _ from 'lodash';
import RobinHood from './RobinHood';

const storage = require('electron-json-storage');

const rh = new RobinHood();

/*
This is just to replace the API / router of the web version of this app.
Robinhood_username is set as My Account for compatibility
*/

export default {
  start() {
    ipcMain.on('storage', (event, arg) => {
      arg.payload.push((err, result) => {
        event.sender.send(arg.requestId, { err, result });
      });

      storage[arg.action].apply(this, arg.payload);
    });

    ipcMain.on('post', async (event, arg) => {
      const requestId = _.clone(arg.requestId);
      delete arg.requestId;

      try {
        if (arg.url.indexOf('user')) {
          if (arg.url === '/user/login') {
            const loginResult = await rh.connect(arg.username, arg.password, arg.mfa_code);
            event.sender.send(requestId, { err: null, result: loginResult, userData: { robinhood_username: 'My Account' } });
            return;
          }

          if (arg.url === '/user/logout') {
            rh.api.token = null;
            event.sender.send(requestId, { err: null, result: 'SUCCESS' });
          }

          if (arg.url === '/user/checkLoginState') {
            if (typeof rh.api.token !== 'undefined' && rh.api.token != null) {
              event.sender.send(requestId, { err: null, result: true, userData: { robinhood_username: 'My Account' } });
            } else {
              event.sender.send(requestId, { err: null, result: false, userData: null });
            }

            return;
          }
        }

        const action = arg.url.replace('/robinhood/', '');

        delete arg.url;

        console.log(`Passing action ${action} with data `, `${Object.values(arg)} to robinhood-api library`);

        const result = await rh[action].apply(rh.context, Object.values(arg));

        event.sender.send(requestId, { err: null, result });
        return;
      } catch (e) {
        event.sender.send(requestId, { err: e.toString(), result: null });
      }
    });
  }
};
