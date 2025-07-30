import { useState, useEffect } from 'react';
import { ClipboardItem } from '../main';
import { 
  subscribeToClipboardItems, 
  addClipboardItem, 
  updateClipboardItem, 
  deleteClipboardItem 
} from '../services/firestore';
import { AuthUser } from '../services/auth';

export interface ClipboardSyncState {
  items: ClipboardItem[];
  isLoading: boolean;
  error: string | null;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
}

export interface ClipboardSyncActions {
  addItem: (item: Omit<ClipboardItem, 'id'>) => Promise<string | undefined>;
  updateItem: (id: string, data: Partial<ClipboardItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

/**
 * Hook para sincronizar el historial del portapapeles con Firestore
 * @param user Usuario actual
 */
export const useClipboardSync = (
  user: AuthUser | null
): [ClipboardSyncState, ClipboardSyncActions] => {
  const [state, setState] = useState<ClipboardSyncState>({
    items: [],
    isLoading: true,
    error: null,
    syncStatus: 'syncing'
  });

  // Suscribirse a cambios en Firestore cuando cambia el usuario
  useEffect(() => {
    if (!user) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        syncStatus: 'error',
        error: 'Usuario no autenticado'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      syncStatus: 'syncing'
    }));

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = subscribeToClipboardItems((items) => {
        setState(prev => ({
          ...prev,
          items,
          isLoading: false,
          syncStatus: 'synced'
        }));
      }, user.uid);
    } catch (error) {
      console.error('Error al suscribirse a los items:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        syncStatus: 'error',
        error: 'Error al sincronizar con Firestore'
      }));
    }

    // Detectar estado offline/online
    const handleOnline = () => {
      setState(prev => ({
        ...prev,
        syncStatus: 'syncing'
      }));
      // La reconexión la maneja Firestore automáticamente
    };

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        syncStatus: 'offline'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.uid]);

  // Acciones para manipular items
  const actions: ClipboardSyncActions = {
    addItem: async (item: Omit<ClipboardItem, 'id'>) => {
      if (!user) {
        setState(prev => ({
          ...prev,
          error: 'Usuario no autenticado'
        }));
        return undefined;
      }

      try {
        const id = await addClipboardItem(item);
        return id;
      } catch (error) {
        console.error('Error al añadir item:', error);
        setState(prev => ({
          ...prev,
          error: 'Error al añadir item'
        }));
        return undefined;
      }
    },

    updateItem: async (id: string, data: Partial<ClipboardItem>) => {
      if (!user) {
        setState(prev => ({
          ...prev,
          error: 'Usuario no autenticado'
        }));
        return;
      }

      try {
        await updateClipboardItem(id, data);
      } catch (error) {
        console.error('Error al actualizar item:', error);
        setState(prev => ({
          ...prev,
          error: 'Error al actualizar item'
        }));
      }
    },

    deleteItem: async (id: string) => {
      if (!user) {
        setState(prev => ({
          ...prev,
          error: 'Usuario no autenticado'
        }));
        return;
      }

      try {
        // Pasamos explícitamente el ID del usuario para asegurar que se elimine correctamente
        await deleteClipboardItem(id, user.uid);
        console.log(`Solicitud de eliminación enviada para item ${id} del usuario ${user.uid}`);
      } catch (error) {
        console.error('Error al eliminar item:', error);
        setState(prev => ({
          ...prev,
          error: 'Error al eliminar item'
        }));
      }
    }
  };

  return [state, actions];
};
