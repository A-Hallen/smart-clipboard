import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Las definiciones de tipos para la API de Electron se importan globalmente
// No es necesario importarlas explícitamente aquí

// Declarar la interfaz extendida de window para TypeScript
declare global {
  // Extender la interfaz ClipboardItem para el renderizador
}

export interface ClipboardItem {
  id: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'file';
  createdAt?: number; // Fecha de creación (opcional para compatibilidad con código existente)
}

// Montar la aplicación React
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('No se encontró el elemento con id "root" en el DOM');
}
