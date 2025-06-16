const { app, BrowserWindow, Tray, Menu, clipboard, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let text_latest = "";
let tray;
let win;

function readClipboard(){
    setInterval(() => {
        text_latest = clipboard.readText();
        if(isURL(text_latest)){
            storeLink(text_latest);
        }
    }, 2000);
}

function isURL(text) {
    const regex = /^(https?:\/\/)[^\s]+$/;
    return regex.test(text);
}

function storeLink(link) {
    const dbPath = path.join(__dirname, 'data/links.json');
    let links = [];
    if(fs.existsSync(dbPath)) {
        try {
            links = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            if(!Array.isArray(links)) {
                links = [];
            }
        } catch (error) {
            console.error("Error al leer la base de datos:", error);
        }
    }
    if(!links.includes(link)){
        links.push(link);
        fs.writeFileSync(dbPath, JSON.stringify(links, null, 2));
        if(win && win.webContents) {
            win.webContents.send('links-updated');
        }
    }
}

ipcMain.handle('get-links', () => {
    const dbPath = path.join(__dirname, 'data/links.json');
    let links = [];
    if(fs.existsSync(dbPath)){
         try {
             links = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
             if (!Array.isArray(links)) {
                 links = [];
             }
         } catch (error) {
             console.error("Error al leer la base de datos:", error);
         }
    }
    return links;
});

ipcMain.handle('open-link', (event, link) => {
    shell.openExternal(link);
});

app.whenReady().then(() => {
    win = new BrowserWindow({
        width: 400,
        height: 600,
        show: false,
        icon: path.join(__dirname, '..', 'icon.png'),
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    
    win.loadFile('index.html');
    
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Mostrar/Ocultar', click: () => { win.isVisible() ? win.hide() : win.show(); } },
        { label: 'Salir', click: () => {
            app.isQuitting = true; // Indicamos que se quiere salir realmente
            app.quit();
        }}
    ]);
    
    const trayIcon = path.join(__dirname, '..', 'icon.png');
    tray = new Tray(trayIcon);
    tray.setToolTip('Save Links App');
    tray.setContextMenu(contextMenu);
    
    tray.on('double-click', () => {
        win.isVisible() ? win.hide() : win.show();
    });
    
    win.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            win.hide();
        }
    });
    
    win.show();

    readClipboard();
});