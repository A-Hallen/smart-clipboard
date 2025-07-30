import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Clipboard } from 'lucide-react';
import { AuthState, AuthActions } from './hooks/useAuth';
import SettingsMenu from './components/SettingsMenu';

// Definición de SyncState para el Header
interface SyncState {
  isSyncing: boolean;
  isOnline: boolean;
  error: string | null;
}

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  clipboardCount: number;
  authState: AuthState;
  authActions: AuthActions;
  syncState: SyncState;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  isDarkMode, 
  onToggleDarkMode, 
  clipboardCount,
  authState,
  authActions,
  syncState,
  onLoginClick,
  onLogoutClick
}) => {
  return (
    <motion.header 
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Clipboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Smart Clipboard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Historial inteligente
              </p>
            </div>
          </motion.div>

          {/* Controles */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Botón de configuración con menú desplegable */}
            <SettingsMenu 
              authState={authState} 
              authActions={authActions} 
              syncState={syncState} 
              onLoginClick={onLoginClick}
              onLogoutClick={onLogoutClick}
            />

            {/* Toggle de modo oscuro */}
            <motion.button
              onClick={onToggleDarkMode}
              className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors overflow-hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              <motion.div
                className="relative z-10"
                initial={false}
                animate={{ 
                  rotate: isDarkMode ? 180 : 0,
                  scale: isDarkMode ? 0.8 : 1
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </motion.div>
              
              {/* Efecto de fondo animado */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-blue-600 dark:to-purple-600 opacity-0"
                animate={{ 
                  opacity: isDarkMode ? 0.1 : 0,
                  scale: isDarkMode ? 1.2 : 0.8
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>
        </div>

        {/* Línea de información adicional */}
        <motion.div 
          className="pb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Presiona <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+Shift+C</kbd> para guardar el portapapeles
            </span>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};
