// This file is used to expose certain APIs to the renderer process in a secure manner.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        // whitelist channels
        let validChannels = ["toMain"];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = ["fromMain"];
        if (validChannels.includes(channel)) {
            // Strip event as it includes `sender` property
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});