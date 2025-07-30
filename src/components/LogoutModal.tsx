import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Modal from './Modal';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail?: string;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal title="Cerrar sesión" onClose={onClose}>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              {userEmail 
                ? `¿Estás seguro de que quieres cerrar sesión de ${userEmail}?`
                : '¿Estás seguro de que quieres cerrar sesión?'
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Podrás volver a iniciar sesión en cualquier momento.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;
