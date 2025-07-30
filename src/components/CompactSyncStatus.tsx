import React from 'react';
import { motion } from 'framer-motion';
import { CloudOff, Cloud, AlertCircle, RefreshCw } from 'lucide-react';

interface SyncState {
  isSyncing: boolean;
  isOnline: boolean;
  error: string | null;
}

interface CompactSyncStatusProps {
  syncState: SyncState;
}

export const CompactSyncStatus: React.FC<CompactSyncStatusProps> = ({ syncState }) => {
  const { isSyncing, isOnline, error } = syncState;

  // Determinar el icono y color según el estado
  let icon = <Cloud className="w-5 h-5" />;
  let statusColor = "text-blue-500";
  let statusBg = "bg-blue-100 dark:bg-blue-900/30";
  let tooltipText = "Sincronizado";

  if (error) {
    icon = <AlertCircle className="w-5 h-5" />;
    statusColor = "text-red-500";
    statusBg = "bg-red-100 dark:bg-red-900/30";
    tooltipText = `Error: ${error}`;
  } else if (!isOnline) {
    icon = <CloudOff className="w-5 h-5" />;
    statusColor = "text-amber-500";
    statusBg = "bg-amber-100 dark:bg-amber-900/30";
    tooltipText = "Sin conexión - Cambios guardados localmente";
  } else if (isSyncing) {
    icon = <RefreshCw className="w-5 h-5" />;
    statusColor = "text-blue-500";
    statusBg = "bg-blue-100 dark:bg-blue-900/30";
    tooltipText = "Sincronizando...";
  }

  return (
    <div className="relative group">
      <motion.div
        className={`relative p-2 rounded-lg ${statusBg} ${statusColor} transition-colors overflow-hidden`}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.div
          className="relative z-10"
          animate={{ 
            rotate: isSyncing ? 360 : 0,
          }}
          transition={isSyncing ? { 
            rotate: { repeat: Infinity, duration: 2, ease: "linear" },
          } : {}}
        >
          {icon}
        </motion.div>
        
        {/* Efecto de fondo animado */}
        <motion.div
          className={`absolute inset-0 ${statusBg} opacity-0`}
          animate={{ 
            opacity: 0.1,
            scale: isSyncing ? 1.2 : 1
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          {tooltipText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
};

export default CompactSyncStatus;
