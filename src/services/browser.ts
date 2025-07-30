/**
 * Servicio para manejar interacciones con el navegador externo
 * Esto es especialmente útil para aplicaciones Electron donde necesitamos
 * abrir URLs en el navegador predeterminado del sistema
 */

// Las definiciones de tipos para la API de Electron se importan globalmente
// No es necesario importarlas explícitamente aquí

/**
 * Abre una URL en el navegador predeterminado del sistema
 * @param url URL a abrir
 * @returns Promise que se resuelve cuando la URL se ha abierto
 */
export const openExternalUrl = async (url: string): Promise<boolean> => {
  // Verificar si estamos en un entorno Electron
  if (window.electronAPI && window.electronAPI.openExternalUrl) {
    // Usar la API de Electron para abrir la URL
    return await window.electronAPI.openExternalUrl(url);
  } else {
    // Fallback para entornos web: abrir en una nueva pestaña/ventana
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }
};

/**
 * Verifica si la aplicación está ejecutándose en un entorno Electron
 * @returns true si la aplicación está en Electron, false en caso contrario
 */
export const isElectronEnvironment = (): boolean => {
  return window.electronAPI !== undefined;
};

/**
 * Obtiene la URL de redirección para autenticación OAuth
 * En Electron, usamos localhost para compatibilidad con Google OAuth
 * @returns URL de redirección apropiada para el entorno actual
 */
export const getAuthRedirectUrl = (): string => {
  if (isElectronEnvironment()) {
    // Usar localhost para compatibilidad con Google OAuth
    // Google no permite protocolos personalizados como smartclip://
    return 'http://localhost:8080/auth/callback';
  }
  
  // Fallback para entorno web
  return window.location.origin + '/auth/callback';
};

/**
 * Inicia un servidor temporal para manejar el callback de OAuth
 * @returns Promise que resuelve con el puerto del servidor
 */
export const startAuthServer = async (): Promise<number> => {
  if (isElectronEnvironment() && window.electronAPI) {
    return await window.electronAPI.startAuthServer();
  }
  throw new Error('startAuthServer solo está disponible en entorno Electron');
};

/**
 * Espera por el resultado del callback de autenticación
 * @returns Promise que resuelve con el resultado del callback
 */
export const waitForAuthCallback = async (): Promise<{ code?: string; error?: string; state?: string }> => {
  if (isElectronEnvironment() && window.electronAPI) {
    return await window.electronAPI.waitForAuthCallback();
  }
  throw new Error('waitForAuthCallback solo está disponible en entorno Electron');
};

/**
 * Detiene el servidor de autenticación temporal
 */
export const stopAuthServer = async (): Promise<void> => {
  if (isElectronEnvironment() && window.electronAPI) {
    await window.electronAPI.stopAuthServer();
  }
};
