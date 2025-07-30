import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface LoginFormProps {
  onLoginWithGoogle: () => Promise<void>;
  isAnonymous?: boolean;
  error?: string | null;
  user?: any;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLoginWithGoogle,
  isAnonymous = false,
  error = null,
  user = null
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Siempre usar signInWithGoogle, Firebase maneja automáticamente
      // la vinculación de cuentas anónimas
      await onLoginWithGoogle();
    } catch (error) {
      console.error('Error con Google:', error);
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      {error && (
        <motion.div
          className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      {user && !isAnonymous && (
        <motion.div
          className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">¡Bienvenido, {user.displayName || user.email}!</span>
        </motion.div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white">
          Iniciar sesión
        </h2>
        <p className="text-sm text-center text-gray-600 dark:text-gray-300 mt-1">
          Accede para sincronizar tu historial
        </p>
      </div>

      <div className="flex flex-col space-y-3">

          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white font-medium rounded-lg flex justify-center items-center transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
              <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
              <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
              <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
            </svg>
            Continuar con Google
          </motion.button>
        </div>
    </motion.div>
  );
};

export default LoginForm;
