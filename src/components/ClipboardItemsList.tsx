import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardItem } from '../main';
import { ClipboardItemCard } from '../ClipboardItemCard';
import { BottomNavBar } from './BottomNavBar';
import { filterClipboardItems, countItemsByType } from '../utils/contentUtils';

type TabType = 'all' | 'links' | 'other' | 'favorites';

interface ClipboardItemsListProps {
  clipboardHistory: ClipboardItem[];
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  handleDeleteItem: (id: string) => Promise<void>;
  onOpenDialog: (id: string, content: string) => void;
  handleFavItem: (id: string, value: boolean) => Promise<void>;
}

/**
 * Componente que muestra la lista de elementos del portapapeles
 * con pestañas para filtrar por tipo
 */
const ClipboardItemsList: React.FC<ClipboardItemsListProps> = ({
  clipboardHistory,
  activeTab,
  setActiveTab,
  handleDeleteItem,
  onOpenDialog,
  handleFavItem
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  // Obtener contadores por tipo
  const counts = countItemsByType(clipboardHistory);

  // Si no hay elementos, mostrar mensaje vacío
  if (clipboardHistory.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-64 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key="empty-state"
      >
        <motion.svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          variants={itemVariants}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </motion.svg>
        <motion.h3 
          className="mt-2 text-sm font-medium text-gray-900 dark:text-white"
          variants={itemVariants}
        >
          No hay elementos en el historial
        </motion.h3>
        <motion.p 
          className="mt-1 text-sm text-gray-500 dark:text-gray-400"
          variants={itemVariants}
        >
          Usa <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+Shift+C</kbd> para guardar el contenido del portapapeles.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      key="history-list"
    >
      {/* Contenido principal con padding para la barra inferior */}
      <div className="pb-16">  {/* Añadimos padding-bottom para dejar espacio para la barra inferior */}
        <div className="overflow-y-auto max-h-full pr-2 py-2">
          {filterClipboardItems(clipboardHistory, activeTab).map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4"
            >
              <ClipboardItemCard 
                item={item} 
                handleDeleteItem={handleDeleteItem}
                handleFavItem={handleFavItem}
                onOpenDialog={onOpenDialog}
              />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Barra de navegación inferior */}
      <motion.div variants={itemVariants} className="fixed bottom-0 left-0 right-0 z-10">
        <BottomNavBar 
          options={[
            { 
              id: 'all', 
              label: 'Todos', 
              count: counts.all,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              )
            },
            { 
              id: 'links', 
              label: 'Enlaces', 
              count: counts.links,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )
            },
            { 
              id: 'other', 
              label: 'Otros', 
              count: counts.other,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              )
            },
            { 
              id: 'favorites', 
              label: 'Favoritos', 
              count: counts.favorites,
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )
            }
          ]}
          activeOption={activeTab}
          onOptionChange={(tabId) => setActiveTab(tabId as TabType)}
        />
      </motion.div>
    </motion.div>
  );
};

export default ClipboardItemsList;
