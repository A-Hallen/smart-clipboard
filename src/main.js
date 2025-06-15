const { app, BrowserWindow, Tray, Menu, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(() => {
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Salir', click: () => app.quit() }
    ]);

    const win = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.loadFile('index.html');

});
