import React, { useEffect } from 'react';
import { ClipboardItem } from '../main';
import { AuthState } from '../hooks/useAuth';
import { ClipboardSyncState, ClipboardSyncActions } from '../hooks/useClipboardSync';

interface ClipboardSyncManagerProps {
  authState: AuthState;
  syncState: ClipboardSyncState;
  syncActions: ClipboardSyncActions;
  setClipboardHistory: React.Dispatch<React.SetStateAction<ClipboardItem[]>>;
}

/**
 * Componente que maneja la sincronización del portapapeles entre local y Firebase
 * Extrae la lógica de sincronización del componente App para mantener el principio de responsabilidad única
 */
const ClipboardSyncManager: React.FC<ClipboardSyncManagerProps> = ({
  authState,
  syncState,
  syncActions,
  setClipboardHistory
}) => {
  // Usar el historial de Firestore cuando está disponible y evitar duplicados
  useEffect(() => {
    const mergeItems = async () => {
      try {
        // Si hay items en Firestore, usarlos como base
        if (syncState.items.length > 0) {
          if (authState.user && !authState.isLoading) {
            // Si estamos autenticados, usar los items de Firebase como fuente principal
            // pero asegurarse de que no haya duplicados con los items locales
            const localHistory = await window.electronAPI.getClipboardHistory();
            
            // Crear un mapa de contenidos de Firebase para verificación rápida
            const firebaseContentMap = new Map(
              syncState.items.map(item => [item.content, item])
            );
            
            // Encontrar items locales que no estén en Firebase
            const uniqueLocalItems = localHistory.filter(
              localItem => !firebaseContentMap.has(localItem.content)
            );
            
            // Si hay items locales únicos, sincronizarlos con Firebase
            if (uniqueLocalItems.length > 0) {
              uniqueLocalItems.forEach(async (item: ClipboardItem) => {
                await syncActions.addItem({
                  content: item.content,
                  timestamp: item.timestamp,
                  type: item.type,
                  createdAt: item.createdAt || item.timestamp
                });
              });
            }
            
            // Usar solo los items de Firebase para mostrar
            setClipboardHistory(syncState.items);
          } else {
            // Si no estamos autenticados pero hay items en Firebase (raro),
            // usar los items de Firebase
            setClipboardHistory(syncState.items);
          }
        } else if (!syncState.isLoading) {
          // Si no hay items en Firestore, cargar el historial local
          const localHistory = await window.electronAPI.getClipboardHistory();
          setClipboardHistory(localHistory);
        }
      } catch (error) {
        console.error('Error al cargar o sincronizar el historial:', error);
      }
    };
    
    mergeItems();
  }, [syncState.items, syncState.isLoading, authState.user, authState.isLoading, syncActions, setClipboardHistory]);

  // Escuchar actualizaciones del portapapeles desde Electron
  useEffect(() => {
    const handleClipboardUpdate = async (event: any, history: ClipboardItem[]) => {
      if (authState.user && !authState.isLoading) {
        const newItem = history[0];
        if (newItem) {
          await syncActions.addItem({
            content: newItem.content,
            timestamp: newItem.timestamp,
            type: newItem.type,
            createdAt: newItem.createdAt || newItem.timestamp
          });
        }
      } else {
        setClipboardHistory(history);
      }
    };

    const removeListener = window.electronAPI.onClipboardUpdate(handleClipboardUpdate);
    return () => {
      removeListener();
    };
  }, [authState.user, authState.isLoading, syncActions, setClipboardHistory]);

  return null; // Este componente no renderiza nada, solo maneja efectos
};

export default ClipboardSyncManager;
