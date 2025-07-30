import { useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  getCurrentUser,
  onAuthChanged,
  signInAsAnonymous,
  logout,
  linkAnonymousWithGoogle,
  signInWithGoogleCode,
  getGoogleRedirectResult,
  signInWithGoogle
} from '../services/auth';
import { migrateClipboardItems } from '../services/firestore';
import { openExternalUrl, isElectronEnvironment, getAuthRedirectUrl, startAuthServer, waitForAuthCallback, stopAuthServer } from '../services/browser';
import { GoogleAuthProvider } from 'firebase/auth';

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAnonymous: boolean;
  error: string | null;
}

export interface AuthActions {
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  linkAnonymousWithGoogle: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook para manejar la autenticación con Firebase
 */
export const useAuth = (): [AuthState, AuthActions] => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAnonymous: false,
    error: null
  });

  const handleAuthCallback = useCallback(async (url: string) => {
    try {
      console.log('Manejando URL de autenticación:', url);
      // Aquí puedes procesar la URL de autenticación
      // Por ejemplo, extraer el token de la URL y usarlo para autenticar al usuario
      
      // Por ahora, simplemente intentamos obtener el resultado de la redirección
      const user = await getGoogleRedirectResult();
      if (user) {
        setState(prev => ({
          ...prev,
          user,
          isAnonymous: user.isAnonymous,
          isLoading: false,
          error: null
        }));
      }
    } catch (error) {
      console.error('Error procesando callback de autenticación:', error);
      setState(prev => ({
        ...prev,
        error: 'Error al procesar la autenticación',
        isLoading: false
      }));
    }
  }, []);

  useEffect(() => {
    // Configurar el listener para el evento de autenticación
    const authCallbackListener = (event: any, url: string) => {
      console.log('Evento de autenticación recibido:', url);
      handleAuthCallback(url);
    };

    let cleanup: (() => void) | undefined;

    if (isElectronEnvironment() && window.electronAPI) {
      // Usar la API de Electron expuesta de forma segura
      cleanup = window.electronAPI.onAuthCallback(authCallbackListener);
    }

    // Limpiar el listener al desmontar
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [handleAuthCallback]);

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const user = await getGoogleRedirectResult();
        if (user) {
          // Si había un usuario anónimo previo, migrar sus datos
          const currentUser = getCurrentUser();
          if (currentUser?.isAnonymous && user.uid !== currentUser.uid) {
            await migrateClipboardItems(currentUser.uid, user.uid);
          }
          
          setState(prev => ({
            ...prev,
            user,
            isAnonymous: user.isAnonymous,
            isLoading: false
          }));
        }
      } catch (error: any) {
        console.error('Error al procesar redirección:', error);
        setState(prev => ({
          ...prev,
          error: error.message || 'Error al procesar la autenticación con Google',
          isLoading: false
        }));
      }
    };
    
    checkRedirectResult();
  }, []);

  useEffect(() => {
    // Suscribirse a cambios en el estado de autenticación PRIMERO
    // Esto permite que Firebase detecte sesiones persistentes
    const unsubscribe = onAuthChanged((user) => {
      console.log('Estado de autenticación cambió:', user);
      setState(prev => {
        const newState = {
          ...prev,
          user,
          isAnonymous: user?.isAnonymous || false,
          isLoading: false
        };
        
        // Solo crear usuario anónimo si no hay ningún usuario después de la verificación inicial
        if (!user && prev.isLoading) {
          console.log('No hay usuario persistente, creando sesión anónima...');
          signInAsAnonymous().then(anonymousUser => {
            setState(current => ({
              ...current,
              user: anonymousUser,
              isLoading: false,
              isAnonymous: true,
              error: null
            }));
          }).catch(error => {
            console.error('Error al crear usuario anónimo:', error);
            setState(current => ({
              ...current,
              user: null,
              isLoading: false,
              isAnonymous: false,
              error: error.message || 'Error al inicializar la autenticación'
            }));
          });
        }
        
        return newState;
      });
    });

    return () => unsubscribe();
  }, []);

  const actions: AuthActions = {
    signInWithGoogle: async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        // En entorno Electron, usar el flujo personalizado
        if (isElectronEnvironment()) {
          console.log('Iniciando flujo de autenticación con Google en Electron');
          
          // 1. Iniciar el servidor local para recibir el callback
          const port = await startAuthServer();
          console.log(`Servidor de autenticación iniciado en puerto ${port}`);
          
          // 2. Crear una URL de autenticación de Google con todos los parámetros necesarios
          const provider = new GoogleAuthProvider();
          const authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
          
          // Obtener el ID del cliente de Firebase desde la configuración
          const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
          
          // Añadir todos los parámetros requeridos
          authUrl.searchParams.append('client_id', clientId);
          authUrl.searchParams.append('redirect_uri', getAuthRedirectUrl());
          authUrl.searchParams.append('response_type', 'code');
          authUrl.searchParams.append('scope', 'email profile');
          authUrl.searchParams.append('access_type', 'offline');
          authUrl.searchParams.append('prompt', 'select_account');
          
          // 3. Abrir el navegador externo con la URL de autenticación
          await openExternalUrl(authUrl.toString());
          console.log('URL de autenticación abierta en navegador externo');
          
          // 4. Esperar a que el usuario complete la autenticación y el servidor reciba el callback
          const { code, error } = await waitForAuthCallback();
          console.log('Callback de autenticación recibido:', { code, error });
          
          // 5. Detener el servidor
          await stopAuthServer();
          
          if (error) {
            throw new Error(`Error en autenticación: ${error}`);
          }
          
          if (!code) {
            throw new Error('No se recibió código de autorización');
          }
          
          // 6. Intercambiar el código por un token y autenticar con Firebase
          const wasAnonymous = state.user?.isAnonymous || false;
          const anonymousUserId = state.user?.uid;
          
          const user = await signInWithGoogleCode(code);
          
          // 7. Si el usuario era anónimo, migrar sus datos
          if (wasAnonymous && anonymousUserId && user.uid !== anonymousUserId) {
            await migrateClipboardItems(anonymousUserId, user.uid);
          }
          
          setState(prev => ({
            ...prev,
            user,
            isAnonymous: false,
            isLoading: false,
            error: null
          }));
        } else {
          // En entorno web, usar el flujo normal de Firebase
          await signInWithGoogle();
          // El estado se actualizará cuando la app se recargue después de la redirección
        }
      } catch (error: any) {
        console.error('Error al autenticar con Google:', error);
        setState(prev => ({
          ...prev,
          error: error.message || 'Error al autenticar con Google',
          isLoading: false
        }));
      }
    },
    
    logout: async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        await logout();
        // Iniciar sesión anónima después de cerrar sesión
        const user = await signInAsAnonymous();
        setState({
          user,
          isLoading: false,
          isAnonymous: true,
          error: null
        });
      } catch (error: any) {
        console.error('Error al cerrar sesión:', error);
        setState(prev => ({
          ...prev,
          error: error.message || 'Error al cerrar sesión',
          isLoading: false
        }));
      }
    },
    
    
    linkAnonymousWithGoogle: async () => {
      if (!state.user?.isAnonymous) {
        throw new Error('Solo usuarios anónimos pueden vincular cuentas');
      }
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        // En entorno Electron, abrimos el navegador externo
        if (isElectronEnvironment()) {
          // Crear una URL de autenticación de Google con todos los parámetros necesarios
          const provider = new GoogleAuthProvider();
          const authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
          
          // Obtener el ID del cliente de Firebase desde la configuración
          const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
          
          // Añadir todos los parámetros requeridos
          authUrl.searchParams.append('client_id', clientId);
          authUrl.searchParams.append('redirect_uri', getAuthRedirectUrl());
          authUrl.searchParams.append('response_type', 'code');
          authUrl.searchParams.append('scope', 'email profile');
          authUrl.searchParams.append('access_type', 'offline');
          authUrl.searchParams.append('prompt', 'select_account');
          
          await openExternalUrl(authUrl.toString());
          // El usuario tendrá que volver manualmente a la app después de autenticarse
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: null
          }));
        } else {
          // En entorno web, usar redirección normal
          await linkAnonymousWithGoogle();
          // El estado se actualizará cuando la app se recargue después de la redirección
        }
      } catch (error: any) {
        console.error('Error al vincular con Google:', error);
        setState(prev => ({
          ...prev,
          error: error.message || 'Error al vincular con Google',
          isLoading: false
        }));
      }
    },
    
    clearError: () => {
      setState(prev => ({ ...prev, error: null }));
    }
  };

  return [state, actions];
};
