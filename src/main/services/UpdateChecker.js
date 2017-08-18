import packageJson from '../../../package.json';
import compareVersions from 'compare-versions';
import request from 'request-promise-native';

export default {
  start(window){
    this.checkForUpdates(window);
  },

  checkForUpdates(window){
    let currentVersion = packageJson.version;

    (async () => {
      try{
        let releases = await request({
          method: 'GET',
          url: 'https://api.github.com/repos/s0up/robinhood-electron/releases',
          headers: {
            'User-Agent': 'rhclient-electron'
          },
          json: true
        });

        let latestRelease = releases[0];

        if(compareVersions(latestRelease.tag_name, currentVersion) == 1){
          console.log("Sending update notification to client for " + latestRelease.name + ":" + latestRelease.tag_name);

          window.webContents.send('updateAvailable', latestRelease);
        }else{
          console.log("Already using the latest version...");
        }
      }catch(e){
        console.log("Error checking for updates", e);
      }

      setTimeout(() => {this.checkForUpdates(window)}, 60 * 1000 * 30);
    })();
  }
}
