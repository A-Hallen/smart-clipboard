import React, { useEffect } from 'react';
import { ClipboardItem } from '../main';
import { AuthState } from '../hooks/useAuth';
import { ClipboardSyncState, ClipboardSyncActions } from '../hooks/useClipboardSync';

interface ClipboardSyncManagerProps {
  authState: AuthState;
  syncState: ClipboardSyncState;
  syncActions: ClipboardSyncActions;
  setClipboardHistory: React.Dispatch<React.SetStateAction<ClipboardItem[]>>;
  deletingItems: Set<string>;
  setDeletingItems: React.Dispatch<React.SetStateAction<Set<string>>>;
}

/**
 * Componente que maneja la sincronización del portapapeles entre local y Firebase
 * Extrae la lógica de sincronización del componente App para mantener el principio de responsabilidad única
 */
const ClipboardSyncManager: React.FC<ClipboardSyncManagerProps> = ({
  authState,
  syncState,
  syncActions,
  setClipboardHistory,
  deletingItems,
}) => {
  // Sincronizar items entre Firebase y local
  useEffect(() => {
    const loadItems = async () => {
      try {
        if (authState.user && !authState.isLoading) {
          // Usuario autenticado
          if (syncState.items.length > 0) {
            // Usar items de Firebase como fuente principal
            const filteredItems = syncState.items.filter(
              item => !deletingItems.has(item.id)
            );
            setClipboardHistory(filteredItems);
          } else if (!syncState.isLoading) {
            // Sin items en Firebase, usar historial local
            const localHistory = await window.electronAPI.getClipboardHistory();
            const filteredLocalHistory = localHistory.filter(
              item => !deletingItems.has(item.id)
            );
            setClipboardHistory(filteredLocalHistory);
          }
        } else if (!authState.isLoading) {
          // Usuario no autenticado: usar solo historial local
          const localHistory = await window.electronAPI.getClipboardHistory();
          const filteredLocalHistory = localHistory.filter(
            item => !deletingItems.has(item.id)
          );
          setClipboardHistory(filteredLocalHistory);
        }
      } catch (error) {
        console.error('Error al cargar el historial:', error);
      }
    };
    
    loadItems();
  }, [syncState.items, syncState.isLoading, authState.user, authState.isLoading, setClipboardHistory, deletingItems]);

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
            createdAt: newItem.createdAt || newItem.timestamp,
            isFavorite: newItem.isFavorite
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
