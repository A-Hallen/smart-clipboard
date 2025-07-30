import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  getDoc, 
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { ClipboardItem } from '../main';
import { getCurrentUser } from './auth';

// Constantes para colecciones
const CLIPBOARD_COLLECTION = 'clipboard';
const ITEMS_COLLECTION = 'items';

/**
 * Obtiene la referencia a la colección de items del portapapeles de un usuario
 * @param userId ID del usuario
 * @returns Referencia a la colección
 */
export const getClipboardItemsRef = (userId: string) => {
  return collection(db, CLIPBOARD_COLLECTION, userId, ITEMS_COLLECTION);
};

/**
 * Obtiene la referencia a un item específico del portapapeles
 * @param userId ID del usuario
 * @param itemId ID del item
 * @returns Referencia al documento
 */
export const getClipboardItemRef = (userId: string, itemId: string) => {
  return doc(db, CLIPBOARD_COLLECTION, userId, ITEMS_COLLECTION, itemId);
};

/**
 * Añade un nuevo item al portapapeles en Firestore
 * @param item Item a añadir
 * @returns ID del documento creado
 */
export const addClipboardItem = async (item: Omit<ClipboardItem, 'id'>): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');
  
  const itemsRef = getClipboardItemsRef(user.uid);
  const docRef = await addDoc(itemsRef, {
    ...item,
    createdAt: serverTimestamp(),
    userId: user.uid
  });
  
  return docRef.id;
};

/**
 * Actualiza un item existente en el portapapeles
 * @param itemId ID del item a actualizar
 * @param data Datos a actualizar
 */
export const updateClipboardItem = async (
  itemId: string, 
  data: Partial<ClipboardItem>
): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');
  
  const itemRef = getClipboardItemRef(user.uid, itemId);
  await updateDoc(itemRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

/**
 * Elimina un item del portapapeles
 * @param itemId ID del item a eliminar
 * @param userId ID del usuario (opcional, usa el actual por defecto)
 */
export const deleteClipboardItem = async (itemId: string, userId?: string): Promise<void> => {
  const user = userId ? { uid: userId } : getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');
  
  try {
    const itemRef = getClipboardItemRef(user.uid, itemId);
    await deleteDoc(itemRef);
    console.log(`Item ${itemId} eliminado correctamente para usuario ${user.uid}`);
  } catch (error) {
    console.error(`Error al eliminar item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Obtiene todos los items del portapapeles de un usuario
 * @param userId ID del usuario (opcional, usa el actual por defecto)
 * @returns Lista de items
 */
export const getClipboardItems = async (userId?: string): Promise<ClipboardItem[]> => {
  const user = userId ? { uid: userId } : getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');
  
  const itemsRef = getClipboardItemsRef(user.uid);
  const q = query(itemsRef, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toMillis() || Date.now()
  } as ClipboardItem));
};

/**
 * Suscribe a cambios en los items del portapapeles
 * @param callback Función a llamar cuando hay cambios
 * @param userId ID del usuario (opcional, usa el actual por defecto)
 * @returns Función para cancelar la suscripción
 */
export const subscribeToClipboardItems = (
  callback: (items: ClipboardItem[]) => void,
  userId?: string
): (() => void) => {
  const user = userId ? { uid: userId } : getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');
  
  const itemsRef = getClipboardItemsRef(user.uid);
  const q = query(itemsRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now()
    } as ClipboardItem));
    
    callback(items);
  });
};

/**
 * Migra los items de un usuario anónimo a uno autenticado
 * @param anonymousUserId ID del usuario anónimo
 * @param authenticatedUserId ID del usuario autenticado
 */
export const migrateClipboardItems = async (
  anonymousUserId: string,
  authenticatedUserId: string
): Promise<void> => {
  // Obtener todos los items del usuario anónimo
  const anonItemsRef = getClipboardItemsRef(anonymousUserId);
  const q = query(anonItemsRef);
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log('No hay items para migrar');
    return;
  }
  
  // Crear un batch para operaciones en lote
  const batch = writeBatch(db);
  
  // Añadir cada item a la colección del usuario autenticado
  snapshot.docs.forEach(docSnapshot => {
    const data = docSnapshot.data();
    const targetRef = doc(db, CLIPBOARD_COLLECTION, authenticatedUserId, ITEMS_COLLECTION, docSnapshot.id);
    batch.set(targetRef, {
      ...data,
      userId: authenticatedUserId,
      migratedFrom: anonymousUserId,
      migratedAt: serverTimestamp()
    });
  });
  
  // Ejecutar el batch
  await batch.commit();
  
  // Opcional: eliminar los items del usuario anónimo
  const deleteBatch = writeBatch(db);
  snapshot.docs.forEach(doc => {
    const sourceRef = doc.ref;
    deleteBatch.delete(sourceRef);
  });
  
  await deleteBatch.commit();
};
