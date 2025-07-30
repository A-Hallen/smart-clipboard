import React from "react";
import { motion } from "framer-motion";
import { User, UserCheck, UserX, Loader2, AlertCircle, DoorOpen } from "lucide-react";
import { AuthState, AuthActions } from "../hooks/useAuth";
import UserAvatar from './UserAvatar';

interface CompactAuthStatusProps {
  authState: AuthState;
  authActions: AuthActions;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

export const CompactAuthStatus: React.FC<CompactAuthStatusProps> = ({
  authState,
  authActions,
  onLoginClick,
  onLogoutClick,
}) => {
  const { user, isLoading, isAnonymous, error } = authState;

  // Determinar el icono y color según el estado
  let icon = <User className="w-5 h-5" />;
  let statusColor = "text-gray-600 dark:text-gray-400";
  let statusBg = "bg-gray-100 dark:bg-gray-800";
  let statusText = "No autenticado";
  let tooltipText = "Estado de autenticación";

  if (isLoading) {
    icon = <Loader2 className="w-5 h-5 animate-spin" />;
    statusText = "Cargando...";
    tooltipText = "Verificando autenticación...";
  } else if (error) {
    icon = <AlertCircle className="w-5 h-5" />;
    statusColor = "text-red-500";
    statusBg = "bg-red-100 dark:bg-red-900/30";
    statusText = "Error de autenticación";
    tooltipText = error;
  } else if (user) {
    if (isAnonymous) {
      icon = <UserX className="w-5 h-5" />;
      statusColor = "text-amber-500";
      statusBg = "bg-amber-100 dark:bg-amber-900/30";
      statusText = "Anónimo";
      tooltipText = "Usuario anónimo - Inicia sesión para sincronizar";
    } else {
      icon = (
        <UserAvatar 
          user={user} 
          size="sm" 
          className="w-5 h-5"
        />
      );
      statusColor = "text-green-500";
      statusBg = "bg-green-100 dark:bg-green-900/30";
      statusText = `${user.displayName || user.email || "Usuario autenticado"}`;
      tooltipText = `Conectado como ${user.displayName || user.email || "usuario autenticado"}`;
    }
  }

  return (
    <>
      <button
        className="relative group w-full items-center gap-2 justify-between mt-1 mb-1 pt-2 pb-2 pl-4 pr-4 flex rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-500"
        onClick={ 
          user
            ? isAnonymous
              ? onLoginClick
              : onLogoutClick
            : onLoginClick
        }
        aria-label={
          user
            ? isAnonymous
              ? "Iniciar sesión"
              : "Salir"
            : "Iniciar sesión"
        }
      >
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {user && !isAnonymous 
            ? (user.displayName || user.email?.split('@')[0] || 'Usuario')
            : 'Login'
          }
        </span>

          <motion.div
            className={`relative z-10 ${statusColor}`}
            initial={false}
            animate={{ scale: isLoading ? 0.8 : 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {icon}
          </motion.div>

      </button>
    </>
  );
};

export default CompactAuthStatus;
