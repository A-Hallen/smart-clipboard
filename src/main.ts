import { app, BrowserWindow, clipboard, globalShortcut, ipcMain, Tray, Menu, nativeImage, shell } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import fs from 'node:fs';


// Registrar el protocolo personalizado
const PROTOCOL = 'smartclip';

// Configurar el protocolo personalizado de forma más segura
if (!app.isDefaultProtocolClient(PROTOCOL)) {
  if (process.defaultApp) {
    if (process.platform === 'win32') {
      // En desarrollo en Windows
      app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
    } else {
      // En desarrollo en otros sistemas
      app.setAsDefaultProtocolClient(PROTOCOL);
    }
  } else {
    // En producción
    app.setAsDefaultProtocolClient(PROTOCOL);
  }
}

// Variable para manejar la URL de autenticación
let authCallbackUrl: string | null = null;


// Declaración de variables de entorno de Electron Forge
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

// Interfaz para los elementos del historial
export interface ClipboardItem {
  id: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'file';
  createdAt?: number; // Fecha de creación (opcional para compatibilidad con código existente)
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Configuraciones para solucionar problemas de GPU en Electron
app.commandLine.appendSwitch('--disable-gpu-sandbox');

// Deshabilitar aceleración de hardware si hay problemas
if (process.platform === 'win32') {
  app.disableHardwareAcceleration();
}

// Almacenamiento del historial del portapapeles
const clipboardHistory: ClipboardItem[] = [];

// Variables globales
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Función para obtener la ruta correcta de los recursos
const getAssetPath = (...paths: string[]): string => {
  // En desarrollo, los assets están en src/assets
  // En producción, los assets están en resources/assets
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const fullPath = path.join(RESOURCES_PATH, ...paths);
  console.log(`Ruta de recurso solicitada: ${fullPath} (Existe: ${fs.existsSync(fullPath)})`);
  return fullPath;
};

// Función para generar un ID único
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Función para manejar el copiado al portapapeles
const handleClipboardCopy = (): void => {
  // Obtener el contenido del portapapeles
  const content = clipboard.readText();
  
  // Solo guardar si hay contenido
  if (content.trim()) {
    const newItem: ClipboardItem = {
      id: generateId(),
      content,
      timestamp: Date.now(),
      type: 'text'
    };
    
    clipboardHistory.unshift(newItem); // Agregar al inicio del array
    console.log('Contenido guardado:', content.substring(0, 50) + '...');
    
    // Notificar a la ventana de renderizado sobre la actualización
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('clipboard-updated', clipboardHistory);
    });
  }
};

const createWindow = () => {
  // Buscar el icono de la aplicación en varias rutas posibles
  const possibleIconPaths = [
    getAssetPath('icons', 'app-icon.ico'),
    path.join(__dirname, '../assets/icons/app-icon.ico'),
    path.join(process.cwd(), 'src/assets/icons/app-icon.ico'),
    path.join(app.getAppPath(), 'assets/icons/app-icon.ico')
  ];
  
  let appIcon: string | undefined = undefined;
  
  // Intentar cargar el icono desde diferentes rutas
  for (const iconPath of possibleIconPaths) {
    if (fs.existsSync(iconPath)) {
      console.log(`Icono de ventana encontrado en: ${iconPath}`);
      appIcon = iconPath;
      break;
    } else {
      console.log(`Icono de ventana no encontrado en: ${iconPath}`);
    }
  }
  
  // Crear la ventana del navegador con las dimensiones específicas
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    maximizable: true, // Permitir pantalla completa
    minimizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false, // No mostrar hasta que esté listo
    autoHideMenuBar: true, // Ocultar la barra de menú por defecto
    icon: appIcon // Icono de la aplicación para Windows
  });

  // and load the index.html of the app.
  if (typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== 'undefined') {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Mostrar la ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Manejar el evento de cerrar ventana
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Abrir DevTools en desarrollo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// Función para crear el sistema tray
const createTray = () => {
  // Intentar diferentes rutas para encontrar el icono
  const possiblePaths = [
    getAssetPath('icons', 'tray-icon.png'),
    path.join(__dirname, '../assets/icons/tray-icon.png'),
    path.join(process.cwd(), 'src/assets/icons/tray-icon.png'),
    path.join(app.getAppPath(), 'assets/icons/tray-icon.png')
  ];
  
  let trayIcon = null;
  let foundPath = '';
  
  // Intentar cargar el icono desde diferentes rutas
  for (const iconPath of possiblePaths) {
    if (fs.existsSync(iconPath)) {
      console.log(`Icono encontrado en: ${iconPath}`);
      trayIcon = nativeImage.createFromPath(iconPath);
      foundPath = iconPath;
      break;
    } else {
      console.log(`Icono no encontrado en: ${iconPath}`);
    }
  }
  
  // Si no se encontró el icono, crear uno de respaldo
  if (!trayIcon) {
    console.error('No se pudo encontrar el icono del tray en ninguna ruta. Usando icono de respaldo.');
    trayIcon = nativeImage.createEmpty();
    trayIcon.addRepresentation({
      scaleFactor: 1.0,
      width: 16,
      height: 16,
      buffer: Buffer.alloc(16 * 16 * 4, 255) // Icono blanco simple
    });
  } else {
    console.log(`Usando icono de tray desde: ${foundPath}`);
  }
  
  tray = new Tray(trayIcon);
  
  // Crear menú contextual
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mostrar',
      click: () => {
        mainWindow?.show();
      }
    },
    {
      label: 'Minimizar a bandeja',
      click: () => {
        mainWindow?.hide();
      }
    },
    { type: 'separator' },
    {
      label: 'Salir',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Clipboard Manager');
  
  // Doble clic para mostrar ventana
  tray.on('double-click', () => {
    mainWindow?.show();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// Función para manejar la URL de autenticación
const handleAuthCallback = (url: string) => {
  try {
    console.log('URL de autenticación recibida:', url);
    authCallbackUrl = url;
    
    // Enviar la URL de autenticación al proceso de renderizado
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('auth-callback', url);
      
      // Mostrar y enfocar la ventana
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  } catch (error) {
    console.error('Error manejando callback de autenticación:', error);
  }
};

// Manejar el evento cuando la aplicación se inicia con una URL (macOS)
app.on('open-url', (event, url) => {
  event.preventDefault();
  if (url.startsWith(`${PROTOCOL}://`)) {
    handleAuthCallback(url);
  }
});

// Manejar instancias secundarias (Windows/Linux)
app.on('second-instance', (event, commandLine) => {
  try {
    // Buscar la URL de autenticación en los argumentos de línea de comandos
    const url = commandLine.find(arg => arg.startsWith(`${PROTOCOL}://`));
    if (url) {
      handleAuthCallback(url);
    }
    
    // Enfocar la ventana principal si está minimizada
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  } catch (error) {
    console.error('Error manejando segunda instancia:', error);
  }
});

// Asegurar que solo haya una instancia de la aplicación
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  // Continuar con la inicialización normal
}

app.whenReady().then(() => {
  // Registrar el atajo global Ctrl+Shift+C
  const ret = globalShortcut.register('CommandOrControl+Shift+C', () => {
    console.log('Ctrl+Shift+C fue presionado');
    handleClipboardCopy();
  });

  if (!ret) {
    console.log('No se pudo registrar el atajo de teclado');
  }

  createWindow();
  createTray();

  // Manejar la comunicación con el proceso de renderizado
  ipcMain.handle('get-clipboard-history', () => {
    return clipboardHistory;
  });

  // Manejar la copia de texto al portapapeles
  ipcMain.on('copy-to-clipboard', (event, text: string) => {
    clipboard.writeText(text);
    console.log(`Texto copiado al portapapeles: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
  });

  // Manejar la eliminación de un elemento del historial
  ipcMain.handle('delete-clipboard-item', (event, id: string) => {
    const index = clipboardHistory.findIndex(item => item.id === id);
    if (index !== -1) {
      const [deletedItem] = clipboardHistory.splice(index, 1);
      console.log(`Elemento eliminado: ${deletedItem.content.substring(0, 50)}...`);
      
      // Notificar a todas las ventanas sobre la actualización
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('clipboard-updated', clipboardHistory);
      });
      
      return true;
    }
    return false;
  });

  // Manejar la apertura de URLs externas en el navegador predeterminado
  ipcMain.handle('open-external-url', (event, url: string) => {
    console.log(`Abriendo URL externa: ${url}`);
    return shell.openExternal(url);
  });

  // Variable para almacenar el callback resolver
  let authCallbackResolver: ((value: any) => void) | null = null;

  // Función para resolver el callback cuando llegue el resultado
  const resolveAuthCallback = (result: any) => {
    if (authCallbackResolver) {
      authCallbackResolver(result);
      authCallbackResolver = null;
    }
  };

  // Manejadores para el servidor de autenticación localhost
  ipcMain.handle('start-auth-server', async () => {
    console.log('IPC: Recibida solicitud para iniciar servidor de autenticación');
    try {
      // Crear un servidor HTTP simple en puerto 8080
      const http = require('http');
      const url = require('url');
      const fs = require('fs/promises');
      const path = require('path');
      
      // Usar la ruta correcta para la plantilla HTML (funciona en desarrollo y producción)
      const templatePath = app.isPackaged 
        ? path.join(process.resourcesPath, 'assets/templates/auth-callback.html')
        : path.join(__dirname, '../assets/templates/auth-callback.html');
      
      // Leer el contenido de la plantilla
      let templateHtml;
      try {
        templateHtml = await fs.readFile(templatePath, 'utf8');
        console.log('Plantilla HTML cargada correctamente');
      } catch (err: any) {
        console.error(`Error al leer la plantilla HTML: ${err}`);
        throw new Error(`No se pudo leer la plantilla HTML: ${err.message}`);
      }
      
      return new Promise((resolve, reject) => {
        const server = http.createServer((req: any, res: any) => {
          const parsedUrl = url.parse(req.url, true);
          
          if (parsedUrl.pathname === '/auth/callback') {
            const { code, error, state } = parsedUrl.query;
            
            // Reemplazar variables en la plantilla
            const status = error ? 'error' : 'success';
            const statusText = error ? 'fallida' : 'exitosa';
            const message = error ? `Error: ${error}` : 'Puedes cerrar esta ventana.';
            
            const html = templateHtml
              .replace('{{status}}', status)
              .replace('{{statusText}}', statusText)
              .replace('{{message}}', message);
            
            // Enviar respuesta al navegador
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);

            // Resolver el callback con el resultado
            resolveAuthCallback({ code, error, state });
            
            // También enviar al proceso de renderizado por si acaso
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('auth-callback-result', { code, error, state });
            }
            
            // Cerrar servidor después de un breve delay
            setTimeout(() => {
              server.close();
            }, 1000);
          } else {
            res.writeHead(404);
            res.end('Not found');
          }
        });
        
        server.listen(8080, 'localhost', () => {
          console.log('Servidor de autenticación iniciado en http://localhost:8080');
          resolve(8080);
        });
        
        server.on('error', (err: any) => {
          console.error('Error iniciando servidor de autenticación:', err);
          reject(err);
        });
      });
    } catch (error) {
      console.error('Error iniciando servidor de autenticación:', error);
      throw error;
    }
  });

  ipcMain.handle('wait-for-auth-callback', async () => {
    return new Promise((resolve) => {
      authCallbackResolver = resolve;
    });
  });

  ipcMain.handle('stop-auth-server', async () => {
    // El servidor se cierra automáticamente después del callback
    console.log('Servidor de autenticación detenido');
  });



  // Manejar la actualización de un elemento del historial
  ipcMain.handle('update-clipboard-item', (event, id: string, newContent: string) => {
    const index = clipboardHistory.findIndex(item => item.id === id);
    if (index !== -1) {
      clipboardHistory[index].content = newContent;
      clipboardHistory[index].timestamp = Date.now();
      console.log(`Elemento actualizado: ${newContent.substring(0, 50)}...`);
      
      // Notificar a todas las ventanas sobre la actualización
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('clipboard-updated', clipboardHistory);
      });
      
      return true;
    }
    return false;
  });
});

// Anular el registro de los atajos cuando la aplicación se cierre
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On OS X it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow?.show();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
