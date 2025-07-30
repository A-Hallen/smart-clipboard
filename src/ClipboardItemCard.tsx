import React, { useState } from "react";
import { ClipboardItem } from "./main";
import { motion } from "framer-motion";
import { Copy, Trash2 } from "lucide-react";

interface ClipboardItemCardProps {
    item: ClipboardItem;
    handleDeleteItem: (id: string) => Promise<void>;
    onOpenDialog: (id: string, content: string) => void;
}

// Componente para mostrar un elemento del historial
export const ClipboardItemCard: React.FC<ClipboardItemCardProps> = ({ item, handleDeleteItem, onOpenDialog }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const formattedTime = new Date(item.timestamp).toLocaleTimeString();

    const openModal = () => {
        onOpenDialog(item.id, item.content);
    }
    
    const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.electronAPI.copyToClipboard(item.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };
    
    const handleDelete = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDeleting(true);
      await handleDeleteItem(item.id);
    };
    
    return (
      <motion.div 
        className="group bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 hover:shadow-lg relative overflow-hidden border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={isDeleting ? { opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, scale: 0.95} : { opacity: 1, y: 0, height: 'auto', scale: 1 }}
        exit={{ opacity: 0, height: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
        onClick={() => openModal()}
        style={{ cursor: 'pointer' }}
        layout
        whileHover={{ 
          y: -2,
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
      > 
        <div className="flex justify-between items-start">
          <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">{formattedTime}</span>
              <div className="flex space-x-2">
                <motion.button 
                  onClick={handleDelete} 
                  className="p-1.5 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" 
                  disabled={isDeleting} 
                  title="Eliminar" 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={16} strokeWidth={2} />
                </motion.button>
                <motion.button 
                  onClick={handleCopy} 
                  className={`p-1.5 rounded-full transition-colors ${ isCopied ? 'text-green-500 bg-green-100 dark:bg-green-900/50 dark:text-green-300' : 'text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 dark:text-blue-300'}`} 
                  disabled={isCopied} 
                  title={isCopied ? '¡Copiado!' : 'Copiar al portapapeles'} 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                >
                  <Copy size={16} strokeWidth={2} />
                </motion.button>
              </div>
            </div>
            
            <div 
              className="bg-gray-50 dark:bg-gray-700 p-3 rounded" 
            >
              <div className="line-clamp-2 font-mono text-sm dark:text-gray-200">
                {item.content}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };