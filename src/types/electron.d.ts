/**
 * Definiciones de tipos para la API de Electron expuesta al proceso de renderizado
 */

import { ClipboardItem } from '../main';

declare global {
  interface Window {
    electronAPI: {
      getClipboardHistory: () => Promise<ClipboardItem[]>;
      onClipboardUpdate: (callback: (event: any, history: ClipboardItem[]) => void) => () => void;
      copyToClipboard: (text: string) => void;
      deleteClipboardItem: (id: string) => Promise<boolean>;
      updateClipboardItem: (id: string, newItem: Partial<ClipboardItem>) => Promise<boolean>;
      openExternalUrl: (url: string) => Promise<boolean>;
      // APIs para el manejo del protocolo de autenticación personalizado
      onAuthCallback: (callback: (event: any, url: string) => void) => () => void;
      removeAuthCallback: (callback: (event: any, url: string) => void) => void;
      // APIs del servidor de autenticación localhost
      startAuthServer: () => Promise<number>;
      waitForAuthCallback: () => Promise<{ code?: string; error?: string; state?: string }>;
      stopAuthServer: () => Promise<void>;
    }
  }
}
