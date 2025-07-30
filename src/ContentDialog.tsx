import { Copy, X, Edit3, Save, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { SmartContentRenderer } from "./SmartContentRenderer";

interface ContentDialogProps {
  onClose: () => void;
  content: string;
  itemId: string;
  onCopy: (e: React.MouseEvent) => void;
  isCopied: boolean;
  isDarkMode?: boolean;
  onSave?: (newContent: string) => void;
}

export const ContentDialog: React.FC<ContentDialogProps> = ({
  onClose,
  content,
  itemId,
  onCopy,
  isCopied,
  isDarkMode = false,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    if (onSave && editedContent !== content) {
      onSave(editedContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-black bg-opacity-50 z-10" 
        onClick={handleClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div 
        className="relative z-20 w-full max-w-[90vw] h-[90vh] max-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col" 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header compacto */}
        <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            {isEditing ? 'Editando contenido' : 'Contenido'}
          </h3>
          <div className="flex items-center space-x-1">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSave}
                  className="p-1 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                  title="Guardar"
                >
                  <Save size={16} />
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className="p-1 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  title="Cancelar"
                >
                  <XCircle size={16} />
                </button>
              </>
            ) : (
              <>
                {onSave && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-1 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                    title="Editar"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
                <button 
                  onClick={handleClose}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Cerrar"
                >
                  <X size={16} />
                </button>
              </>
            )}
          </div>
        </div>
        {/* Contenido principal */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-3">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-full resize-none border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Edita el contenido aquí..."
              />
            ) : (
              <SmartContentRenderer 
                content={content} 
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </div>
        {/* Footer compacto */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={(e) => {
              onCopy(e);
              handleClose();
            }}
            className={`w-full px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              isCopied 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Copy size={14} className="inline mr-2" />
            {isCopied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
