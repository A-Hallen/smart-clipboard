import React from 'react';
import { motion } from 'framer-motion';

interface NavOption {
  id: string;
  label: string;
  count?: number;
  icon: React.ReactNode;
}

interface BottomNavBarProps {
  options: NavOption[];
  activeOption: string;
  onOptionChange: (optionId: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  options,
  activeOption,
  onOptionChange
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-1 z-10">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {options.map((option) => {
          const isActive = option.id === activeOption;
          const isFavorites = option.label === 'Favoritos';
          
          // Determinar colores basados en el estado activo y si es favorito
          const textColor = isActive
            ? isFavorites 
              ? 'text-red-500 dark:text-red-400' 
              : 'text-blue-500 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-400';
          
          // Determinar el color del contador
          const countColor = isActive
            ? isFavorites
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 border border-red-300 dark:border-red-500'
              : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-300 dark:border-blue-500'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-600';
          
          return (
            <motion.button
              key={option.id}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg ${textColor} ${
                isActive ? 'bg-gray-50 dark:bg-gray-700' : ''
              } relative`}
              onClick={() => onOptionChange(option.id)}
              whileTap={{ scale: 0.95 }}
            >
              <div>
                {option.icon}
              </div>
              <span className="text-xs mt-1">{option.label}</span>
              
              {/* Contador posicionado abajo a la derecha */}
              {option.count !== undefined && option.count > 0 && (
                <span 
                  className={`absolute bottom-[50%] right-0 px-1 min-w-[16px] h-[16px] text-xs flex items-center justify-center rounded-full shadow-sm ${countColor}`}
                  style={{ fontSize: '0.65rem' }}
                >
                  {option.count}
                </span>
              )}
              
              {isActive && (
                <motion.div
                  className={`absolute bottom-0 h-0.5 w-10 ${
                    isFavorites ? 'bg-red-500 dark:bg-red-400' : 'bg-blue-500 dark:bg-blue-400'
                  }`}
                  layoutId="navIndicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
