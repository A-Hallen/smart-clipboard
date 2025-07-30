// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY as string,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_APP_ID as string,
  measurementId: import.meta.env.VITE_MEASSUREMENT_ID as string
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Habilita la persistencia offline para múltiples pestañas
// Esta es la versión moderna recomendada para persistencia offline
enableMultiTabIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('La persistencia de Firestore no se pudo habilitar: múltiples pestañas abiertas');
      // Múltiples pestañas abiertas, la persistencia solo se puede habilitar en una.
    } else if (err.code === 'unimplemented') {
      console.warn('La persistencia de Firestore no está disponible en este navegador');
      // El navegador actual no soporta la persistencia.
    }
  });

// Exporta las instancias para usarlas en otros archivos
export { app, auth, db, analytics };