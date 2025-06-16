const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getLinks: () => ipcRenderer.invoke('get-links'),
    openLink: (link) => ipcRenderer.invoke('open-link', link),
    onLinksUpdated: (callback) => ipcRenderer.on('links-updated', callback)
});