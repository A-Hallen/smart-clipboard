import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardItem } from '../main';
import { ClipboardItemCard } from '../ClipboardItemCard';
import { Tabs } from './Tabs';
import { filterClipboardItems, countItemsByType } from '../utils/contentUtils';

interface ClipboardItemsListProps {
  clipboardHistory: ClipboardItem[];
  activeTab: 'all' | 'links' | 'other';
  setActiveTab: (tab: 'all' | 'links' | 'other') => void;
  handleDeleteItem: (id: string) => Promise<void>;
  onOpenDialog: (id: string, content: string) => void;
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
  onOpenDialog
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
      {/* Pestañas para filtrar contenido */}
      <motion.div variants={itemVariants}>
        <Tabs 
          tabs={[
            { id: 'all', label: 'Todos', count: countItemsByType(clipboardHistory).all },
            { id: 'links', label: 'Enlaces', count: countItemsByType(clipboardHistory).links },
            { id: 'other', label: 'Otros', count: countItemsByType(clipboardHistory).other }
          ]}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as 'all' | 'links' | 'other')}
        />
      </motion.div>
      
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
              onOpenDialog={onOpenDialog}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ClipboardItemsList;
