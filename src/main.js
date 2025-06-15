const { app, BrowserWindow, Tray, Menu, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

text_latest = ""

function readClipboard(){
    setInterval(() => {
        text_latest = clipboard.readText();
        if(isURL(text_latest)){
            console.log("Link detectado: " + text_latest);
            storeLink(text_latest);
        }
    }, 2000);
}

function isURL(text) {
    const regex = /^(https?:\/\/)[^\s]+$/;
    return regex.test(text);
}

function storeLink(link) {
    const dbPath = path.join(__dirname, 'links.json');
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
        console.log("Link guardado en la base de datos.");
    }
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
