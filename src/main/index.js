import { app, BrowserWindow, ipcMain } from 'electron'
import {storage} from 'electron-json-storage'

import IPCHandler from './services/IPCHandler';
import UpdateChecker from './services/UpdateChecker';

IPCHandler.start();

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  mainWindow = new BrowserWindow({
    height: 720,
    useContentSize: true,
    width: 1200,
    nodeIntegration: false,
    frame: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  });

  UpdateChecker.start(mainWindow);
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
});
