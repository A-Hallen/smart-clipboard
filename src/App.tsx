import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardItem } from './main';
import { ContentDialog } from './ContentDialog';
import { Header } from './Header';
import { useAuth } from './hooks/useAuth';
import { useClipboardSync } from './hooks/useClipboardSync';
import AuthModal from './components/AuthModal';
import LogoutModal from './components/LogoutModal';
import ClipboardSyncManager from './components/ClipboardSyncManager';
import ClipboardItemsList from './components/ClipboardItemsList';
import './index.css';


// Componente principal de la aplicación
const App: React.FC = () => {
  // Estado de autenticación
  const [authState, authActions] = useAuth();
  
  // Estado de sincronización con Firestore
  const [syncState, syncActions] = useClipboardSync(authState.user);
  
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [showModal, setShowModal] = useState(false);
  const [itemContent, setItemContent] = useState('');
  const [itemId, setItemId] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'links' | 'other'>('all');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());

  const openDialog = (id: string, content: string) => {
    setShowModal(true);
    setItemId(id);
    setItemContent(content);
  }

  // Función para copiar texto al portapapeles
  const handleCopyToClipboard = async (e: React.MouseEvent) => {
    try {
      await navigator.clipboard.writeText(itemContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  // Función para eliminar un elemento del historial
  const handleDeleteItem = async (id: string) => {
    // Evitar eliminaciones múltiples del mismo item
    if (deletingItems.has(id)) {
      return;
    }

    try {
      // Marcar el item como "siendo eliminado"
      setDeletingItems(prev => new Set([...prev, id]));
      
      // ELIMINACIÓN OPTIMISTA: Remover inmediatamente de la UI
      setClipboardHistory(prev => prev.filter(item => item.id !== id));
      
      // Siempre eliminar localmente primero (para soporte offline)
      await window.electronAPI.deleteClipboardItem(id);
      
      // Si estamos autenticados y online, también eliminar de Firestore
      if (authState.user && !authState.isLoading && syncState.syncStatus !== 'offline') {
        try {
          await syncActions.deleteItem(id);
        } catch (error) {
          console.error('Error al eliminar de Firestore (modo offline?):', error);
          // No es crítico si falla - se sincronizará cuando vuelva online
        }
      }
      
      // Remover del estado de eliminación tras éxito
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
    } catch (error) {
      console.error('Error al eliminar elemento:', error);
      
      // Remover del estado de eliminación en caso de error
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      // En caso de error, restaurar el elemento en la UI
      if (authState.user && !authState.isLoading) {
        // Si estamos autenticados, el efecto de sincronización restaurará el estado
      } else {
        const updatedHistory = await window.electronAPI.getClipboardHistory();
        setClipboardHistory(updatedHistory);
      }
    }
  };

  // Función para actualizar el contenido de un elemento
  const handleUpdateItem = async (id: string, newContent: string) => {
    try {
      // Si estamos autenticados, actualizar en Firestore
      if (authState.user && !authState.isLoading) {
        await syncActions.updateItem(id, { content: newContent });
      } else {
        // Si no, actualizar localmente
        await window.electronAPI.updateClipboardItem(id, newContent);
        const updatedHistory = await window.electronAPI.getClipboardHistory();
        setClipboardHistory(updatedHistory);
      }
      
      // Cerrar el modal
      setShowModal(false);
    } catch (error) {
      console.error('Error al actualizar elemento:', error);
    }
  };

  // Efecto para manejar el tema oscuro/claro
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Header 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
        clipboardCount={clipboardHistory.length} 
        authState={authState}
        authActions={authActions}
        syncState={{
          isSyncing: syncState.syncStatus === 'syncing',
          isOnline: syncState.syncStatus !== 'offline',
          error: syncState.error
        }}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
      />
      
      {/* Componente para manejar la sincronización del portapapeles */}
      <ClipboardSyncManager 
        authState={authState}
        syncState={syncState}
        syncActions={syncActions}
        setClipboardHistory={setClipboardHistory}
        deletingItems={deletingItems}
        setDeletingItems={setDeletingItems}
      />
      
      <motion.main 
        className="flex-1 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ClipboardItemsList 
            clipboardHistory={clipboardHistory}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleDeleteItem={handleDeleteItem}
            onOpenDialog={openDialog}
          />
                
          <AnimatePresence>
            {showModal && (
                <ContentDialog
                  key="content-dialog"
                  onClose={() => setShowModal(false)}
                  content={itemContent}
                  itemId={itemId}
                  onCopy={handleCopyToClipboard}
                isCopied={isCopied}
                isDarkMode={isDarkMode}
                onSave={(newContent) => handleUpdateItem(itemId, newContent)}
              />
            )}
          </AnimatePresence>
          
          {/* Modal de login/registro */}
          <AuthModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            authState={authState}
            authActions={authActions}
          />
          
          {/* Modal de logout */}
          <LogoutModal
            isOpen={isLogoutModalOpen}
            onClose={() => setIsLogoutModalOpen(false)}
            onConfirm={authActions.logout}
            userEmail={authState.user?.email || undefined}
          />
        </div>
      </motion.main>
    </motion.div>
  );
};

export default App;
