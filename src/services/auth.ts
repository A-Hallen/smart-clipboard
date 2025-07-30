import { 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
  linkWithCredential,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '../firebase-config';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  photoURL: string | null;
}

/**
 * Convierte un objeto User de Firebase a nuestro tipo AuthUser simplificado
 */
export const mapUserToAuthUser = (user: User | null): AuthUser | null => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    isAnonymous: user.isAnonymous,
    photoURL: user.photoURL
  };
};

/**
 * Inicia sesión de forma anónima
 */
export const signInAsAnonymous = async (): Promise<AuthUser> => {
  const result = await signInAnonymously(auth);
  return mapUserToAuthUser(result.user) as AuthUser;
};

/**
 * Inicia sesión con Google usando redirección al navegador
 */
export const signInWithGoogle = async (): Promise<void> => {
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
  // No devuelve nada, el resultado se maneja en getRedirectResult
};

/**
 * Autentica con Google usando un código de autorización OAuth
 * Para uso en entornos Electron con servidor localhost
 */
export const signInWithGoogleCode = async (authCode: string): Promise<AuthUser> => {
  try {
    // Para usar el código de autorización necesitamos intercambiarlo por un token
    // Esto requiere hacer una petición al endpoint de token de Google
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET; // Necesario para Electron
    const redirectUri = 'http://localhost:8080/auth/callback';
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: authCode,
        client_id: clientId,
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(`Error obteniendo token: ${tokenData.error_description || tokenData.error}`);
    }
    
    // Crear credencial de Google con el token de acceso
    const credential = GoogleAuthProvider.credential(tokenData.id_token, tokenData.access_token);
    
    // Autenticar con Firebase
    const result = await signInWithCredential(auth, credential);
    return mapUserToAuthUser(result.user) as AuthUser;
  } catch (error) {
    console.error('Error al autenticar con código de Google:', error);
    throw error;
  }
};

/**
 * Obtiene el resultado de la autenticación por redirección
 * Debe llamarse al cargar la aplicación
 */
export const getGoogleRedirectResult = async (): Promise<AuthUser | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return mapUserToAuthUser(result.user) as AuthUser;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener resultado de redirección:', error);
    return null;
  }
};



/**
 * Cierra la sesión actual
 */
export const logout = async (): Promise<void> => {
  await signOut(auth);
};



/**
 * Vincula una cuenta anónima con credenciales de Google
 * Nota: Debido al uso de redirección, la vinculación se completará
 * cuando la aplicación se recargue y se procese getRedirectResult
 */
export const linkAnonymousWithGoogle = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay usuario autenticado');
  
  const provider = new GoogleAuthProvider();
  // Usamos redirección para evitar problemas con ventanas emergentes
  await signInWithRedirect(auth, provider);
  // El resultado se maneja en getRedirectResult
};

/**
 * Obtiene el usuario actual
 */
export const getCurrentUser = (): AuthUser | null => {
  return mapUserToAuthUser(auth.currentUser);
};

/**
 * Suscribe a cambios en el estado de autenticación
 * @param callback Función a llamar cuando cambia el estado de autenticación
 * @returns Función para cancelar la suscripción
 */
export const onAuthChanged = (
  callback: (user: AuthUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(mapUserToAuthUser(user));
  });
};
