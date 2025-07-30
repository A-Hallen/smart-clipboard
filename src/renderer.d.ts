// Tipos para la API de Electron expuesta a través del preload
declare interface ElectronAPI {
  // Obtener el historial del portapapeles
  getClipboardHistory: () => Promise<ClipboardItem[]>;
  
  // Escuchar actualizaciones del portapapeles
  onClipboardUpdate: (callback: (event: any, history: ClipboardItem[]) => void) => () => void;
  
  // Copiar texto al portapapeles
  copyToClipboard: (text: string) => void;
  
  // Eliminar un elemento del historial
  deleteClipboardItem: (id: string) => Promise<boolean>;
}

declare interface Window {
  electronAPI: ElectronAPI;
}

// Interfaz para los elementos del historial del portapapeles
interface ClipboardItem {
  id: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'file';
}
