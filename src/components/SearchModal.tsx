import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardItem } from '../main';
import { ClipboardItemCard } from '../ClipboardItemCard';
import { filterClipboardItems } from '../utils/contentUtils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clipboardHistory: ClipboardItem[];
  isDarkMode: boolean;
  handleDeleteItem: (id: string) => Promise<void>;
  handleFavItem: (id: string, value: boolean) => Promise<void>;
  onOpenDialog: (id: string, content: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  searchTerm,
  setSearchTerm,
  clipboardHistory,
  isDarkMode,
  handleDeleteItem,
  handleFavItem,
  onOpenDialog
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = searchTerm.trim()
    ? filterClipboardItems(clipboardHistory, 'all', searchTerm)
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col backdrop-blur-xl"
          style={{
            backgroundColor: isDarkMode ? 'rgba(18, 18, 30, 0.95)' : 'rgba(255, 255, 255, 0.9)'
          }}
        >
          <div className="w-full max-w-5xl mx-auto p-6 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar en el historial..."
                  className="w-full py-3 pl-12 pr-12 rounded-full border border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-md"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
              Presiona <kbd className="bg-gray-200 dark:bg-gray-700 px-1 rounded">ESC</kbd> para cerrar
            </p>

            <div ref={resultsRef} className="flex-1 overflow-y-auto pb-8">
              {searchTerm.trim() === '' ? (
                <div className="text-center py-10 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md">
                  <p className="text-gray-600 dark:text-gray-400">Empieza a escribir para buscar en tu historial</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-10 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md">
                  <p className="text-gray-600 dark:text-gray-400">No hay resultados para "{searchTerm}"</p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredItems.length} {filteredItems.length === 1 ? 'resultado' : 'resultados'} encontrados
                  </p>
                  {filteredItems.map((item) => (
                    <motion.div key={item.id} variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-3">
                      <ClipboardItemCard
                        item={item}
                        handleDeleteItem={handleDeleteItem}
                        handleFavItem={handleFavItem}
                        onOpenDialog={onOpenDialog}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
