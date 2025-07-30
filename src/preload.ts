import { contextBridge, ipcRenderer } from 'electron';

// Expone de forma segura las APIs de Electron al proceso de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
  // Obtener el historial del portapapeles
  getClipboardHistory: () => ipcRenderer.invoke('get-clipboard-history'),
  
  // Escuchar actualizaciones del portapapeles
  onClipboardUpdate: (callback: (event: any, history: any[]) => void) => {
    ipcRenderer.on('clipboard-updated', (event, history) => callback(event, history));
    
    // Función de limpieza para eliminar el listener cuando el componente se desmonte
    return () => {
      ipcRenderer.removeAllListeners('clipboard-updated');
    };
  },
  
  // Copiar texto al portapapeles
  copyToClipboard: (text: string) => {
    ipcRenderer.send('copy-to-clipboard', text);
  },
  
  // Eliminar un elemento del historial
  deleteClipboardItem: (id: string) => {
    return ipcRenderer.invoke('delete-clipboard-item', id);
  },
  
  // Abrir URL externa en el navegador predeterminado
  openExternalUrl: (url: string) => {
    return ipcRenderer.invoke('open-external-url', url);
  },
  
  // Actualizar un elemento del historial
  updateClipboardItem: (id: string, newContent: string) => {
    return ipcRenderer.invoke('update-clipboard-item', id, newContent);
  },

  // APIs para el manejo del protocolo de autenticación personalizado
  onAuthCallback: (callback: (event: any, url: string) => void) => {
    ipcRenderer.on('auth-callback', callback);
    
    // Retornar función de limpieza
    return () => {
      ipcRenderer.removeListener('auth-callback', callback);
    };
  },

  removeAuthCallback: (callback: (event: any, url: string) => void) => {
    ipcRenderer.removeListener('auth-callback', callback);
  },

  // APIs del servidor de autenticación localhost
  startAuthServer: () => {
    return ipcRenderer.invoke('start-auth-server');
  },

  waitForAuthCallback: () => {
    return ipcRenderer.invoke('wait-for-auth-callback');
  },

  stopAuthServer: () => {
    return ipcRenderer.invoke('stop-auth-server');
  }
});
