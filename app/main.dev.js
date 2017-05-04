/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import fs from 'fs';
import path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';
import MenuBuilder from './menu';
import base64 from 'file-base64';

let mainWindow = null;

/**
 * simule un acces base ou n'importe
 * pour récupérer le fichier pdf et l'envoyer au front:
 */
ipcMain.on(
  'queryAllPdfFiles',
  (event, arg) => {
    const pdfNames = arg;
    const allPdf = [];

    console.log('queryAllPdfFiles: ', pdfNames);

    pdfNames.forEach(
      pdfName => {
        if (typeof pdfName === 'string') {
          const directory = path.join(__dirname, 'pdf');
          const pdf = fs.readFileSync(`${directory}/${pdfName}.pdf`);
          base64.encode(pdf, (err, base64String) => allPdf.push(base64String));
        }
      }
    );

    if (allPdf.length === pdfNames.length) {
      return event.sender.send('reveivedAllPdfFiles', allPdf);
    }
    // return an empty array since something's wrongs
    // return event.sender.send('reveivedAllPdfFiles', []);
  }
);

ipcMain.on(
  'getPdfDirectory',
  (event) => event.sender.send('reveivedPdfDirectory', path.join(__dirname, 'pdf'))
);


if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
