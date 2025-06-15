const { app, BrowserWindow, Tray, Menu, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

text_latest = ""

function readClipboard(){
    setInterval(() => {
        text_latest = clipboard.readText()
        printClipboard(text_latest)
    }, 2000);
}

function printClipboard(text){
    console.log(text)
}


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

    readClipboard();
});
