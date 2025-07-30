import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthState, AuthActions } from '../hooks/useAuth';
import Modal from './Modal';
import LoginForm from './LoginForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authState: AuthState;
  authActions: AuthActions;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  authState,
  authActions
}) => {
  const { user, isAnonymous, error, isLoading } = authState;

  // Cerrar modal automáticamente cuando el usuario se autentica exitosamente
  useEffect(() => {
    if (user && !isAnonymous && !isLoading && isOpen) {
      // Pequeño delay para mostrar el feedback antes de cerrar
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, isAnonymous, isLoading, isOpen, onClose]);

  const handleCloseModal = () => {
    onClose();
    // Limpiar cualquier error al cerrar el modal
    if (error) {
      authActions.clearError();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal title="Iniciar sesión" onClose={handleCloseModal}>
          <LoginForm 
            onLoginWithGoogle={authActions.signInWithGoogle}
            isAnonymous={isAnonymous}
            error={error}
            user={user}
          />
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
