import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, User, AlertCircle, DoorOpen } from 'lucide-react';
import { AuthState, AuthActions } from '../hooks/useAuth';
import LogoutModal from './LogoutModal';
import UserAvatar from './UserAvatar';

interface AuthStatusProps {
  authState: AuthState;
  authActions: AuthActions;
}

export const AuthStatus: React.FC<AuthStatusProps> = ({ authState, authActions }) => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const { user, isLoading, isAnonymous, error } = authState;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      await authActions.registerWithEmail(email, password);
    } else {
      await authActions.loginWithEmail(email, password);
    }
    setShowLoginForm(false);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="mb-4">
      {/* Estado de autenticación */}
      <motion.div 
        className={`flex items-center justify-between p-2 rounded-md ${
          isAnonymous 
            ? 'bg-yellow-50 dark:bg-yellow-900/20' 
            : 'bg-green-50 dark:bg-green-900/20'
        }`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-2">
          {isAnonymous ? (
            <>
              <User className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
              <span className="text-xs text-yellow-600 dark:text-yellow-400">
                Modo anónimo
              </span>
            </>
          ) : (
            <UserAvatar 
              user={user} 
              size="sm" 
              showName={true}
              className="text-green-600 dark:text-green-400"
            />
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isAnonymous ? (
            <button
              onClick={() => setShowLoginForm(true)}
              className="flex items-center space-x-1 text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50"
              disabled={isLoading}
            >
              <LogIn className="w-3 h-3" />
              <span>Iniciar sesión</span>
            </button>
          ) : (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center space-x-1 text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              <DoorOpen className="w-3 h-3" />
              <span>Salir</span>
            </button>
          )}
        </div>
      </motion.div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={authActions.logout}
        userEmail={user?.email || undefined}
      />

      {/* Formulario de login/registro */}
      {showLoginForm && (
        <motion.div
          className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-md shadow-md"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">
              {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
            </h3>
            <button
              onClick={() => setShowLoginForm(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <button
                type="submit"
                className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                disabled={isLoading}
              >
                {isRegistering ? 'Registrarse' : 'Iniciar sesión'}
              </button>

              <button
                type="button"
                onClick={() => authActions.signInWithGoogle()}
                className="w-full px-3 py-2 text-xs bg-white text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                disabled={isLoading}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  <span>Continuar con Google</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline self-start"
              >
                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Mensaje de error */}
      {error && (
        <motion.div
          className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-md flex items-center space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};
