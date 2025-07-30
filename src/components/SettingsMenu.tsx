import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import CompactAuthStatus from './CompactAuthStatus';
import CompactSyncStatus from './CompactSyncStatus';
import { AuthState, AuthActions } from '../hooks/useAuth';

interface SyncState {
  isSyncing: boolean;
  isOnline: boolean;
  error: string | null;
}

interface SettingsMenuProps {
  authState: AuthState;
  authActions: AuthActions;
  syncState: SyncState;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  authState,
  authActions,
  syncState,
  onLoginClick,
  onLogoutClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        className="p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Configuración"
      >
        <Settings className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Configuración
              </h3>
              
              <div className="space-y-">
                {/* Estado de autenticación */}
                <div className="flex items-center justify-between">
                  <CompactAuthStatus authState={authState} authActions={authActions} onLoginClick={onLoginClick} onLogoutClick={onLogoutClick} />
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <button
                    className="w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-1"
                    onClick={() => {
                      // Acción adicional si es necesario
                      setIsOpen(false);
                    }}
                  >
                    Más opciones...
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsMenu;
