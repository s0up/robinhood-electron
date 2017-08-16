<template>
<div class='window-top text-right' style="-webkit-app-region: drag">
  <span @click="minimize" class="glyphicon glyphicon-chevron-down"></span>
  <span @click="maximize" class="glyphicon glyphicon-new-window"></span>
  <span @click="close" class="glyphicon glyphicon-remove"></span>
</div>
</template>
<script>
const remote = require('electron').remote;

export default {
  methods: {
    minimize() {
      let window = remote.getCurrentWindow();
      window.minimize();
    },
    maximize() {
      let window = remote.getCurrentWindow();
      if (!window.isMaximized()) {
        window.maximize();
      } else {
        window.unmaximize();
      }
    },
    close(){
      let window = remote.getCurrentWindow();
      window.close();
    }
  }
}
</script>
