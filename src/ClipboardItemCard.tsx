import { ClipboardItem } from "./main";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Copy, Heart, Trash2, Star } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ClipboardItemCardProps {
    item: ClipboardItem;
    handleDeleteItem: (id: string) => Promise<void>;
    handleFavItem: (id: string, value: boolean) => Promise<void>;
    onOpenDialog: (id: string, content: string) => void;
}

// Componente de partículas para el efecto de confeti estilo Twitter
const Particles = ({ count = 10 }: { count?: number }) => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: count }).map((_, i) => {
                // Calcular ángulo para distribución circular desde el centro
                const angle = (Math.PI * 2 / count) * i;
                // Distancia máxima que viajará la partícula
                const distance = 15 + Math.random() * 25;
                // Posición final basada en el ángulo
                const finalX = Math.cos(angle) * distance;
                const finalY = Math.sin(angle) * distance;
                
                return (
                    <motion.div
                        key={i}
                        className={`absolute w-${Math.random() > 0.5 ? '1.5' : '1'} h-${Math.random() > 0.5 ? '1.5' : '1'} rounded-full ${
                            i % 4 === 0 ? 'bg-red-500' : 
                            i % 4 === 1 ? 'bg-red-400' : 
                            i % 4 === 2 ? 'bg-pink-400' : 'bg-red-300'
                        }`}
                        initial={{ 
                            opacity: 1,
                            scale: 0,
                            x: 0,
                            y: 0,
                        }}
                        animate={{
                            opacity: [1, 0.8, 0],
                            scale: [0, 0.8, 1],
                            x: finalX,
                            y: finalY,
                        }}
                        transition={{ 
                            duration: 0.6 + Math.random() * 0.2,
                            ease: "easeOut",
                        }}
                        style={{
                            top: '50%',
                            left: '50%',
                            translateX: '-50%',
                            translateY: '-50%'
                        }}
                    />
                );
            })}
        </div>
    );
};

// Componente para mostrar un elemento del historial
export const ClipboardItemCard: React.FC<ClipboardItemCardProps> = ({ item, handleDeleteItem, handleFavItem, onOpenDialog }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showParticles, setShowParticles] = useState(false);
    const [pulseAnimation, setPulseAnimation] = useState(false);
    const favControls = useAnimation();
    const buttonRef = useRef<HTMLButtonElement>(null);
    
    const formattedTime = new Date(item.timestamp).toLocaleTimeString();
    
    // Efecto para animar el botón cuando el componente se monta si ya es favorito
    useEffect(() => {
        if (item.isFavorite) {
            setPulseAnimation(true);
        }
    }, [item.isFavorite]);

    const openModal = () => {
        onOpenDialog(item.id, item.content);
    }
    
    const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.electronAPI.copyToClipboard(item.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    const handleFav = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const newFavoriteState = !item.isFavorite;
        
        // Animación al marcar como favorito
        if (newFavoriteState) {
            setShowParticles(true);
            favControls.start({
                scale: [1, 1.5, 1],
                rotate: [0, 15, -15, 0],
                transition: { 
                    duration: 0.7,
                    times: [0, 0.4, 0.7, 1]
                }
            });
            setTimeout(() => setShowParticles(false), 800);
            setPulseAnimation(true);
        } else {
            // Animación al quitar favorito
            favControls.start({
                scale: [1, 0.8, 1],
                rotate: [0, -10, 5, 0],
                transition: { duration: 0.5 }
            });
            setPulseAnimation(false);
        }
        
        await handleFavItem(item.id, newFavoriteState);
    }
    
    const handleDelete = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDeleting(true);
      await handleDeleteItem(item.id);
    };
    
    return (
      <motion.div 
        className={`group bg-white dark:bg-gray-800 rounded-lg shadow pb-4 mb-4 hover:shadow-lg relative overflow-hidden 
          border border-transparent hover:border-gray-200 dark:hover:border-gray-700
        `}
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
            <div className="flex justify-between items-center mb-2 mt-4 ml-4 mr-4">
              <span className="text-xs text-gray-500 dark:text-gray-400">{formattedTime}</span>
              <div className="flex space-x-2">

                {/* Botón de favoritos con animaciones avanzadas */}
                <motion.button
                  ref={buttonRef}
                  onClick={handleFav}
                  className={`p-1.5 rounded-full relative ${item.isFavorite 
                    ? 'text-red-500' 
                    : 'text-gray-400  hover:text-red-500 dark:hover:text-red-400'}`}
                  title={item.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                    animate={favControls}
                  >
                  {/* Efecto de partículas cuando se marca como favorito */}
                  {showParticles && <Particles />}
                  {/* Efecto de pulso para elementos favoritos */}
                  {pulseAnimation && (
                    <motion.div 
                      className=" inset-0 rounded-full opacity-30"
                      animate={{ 
                        scale: [1, 1.8, 1],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatType: "reverse",
                        ease: "easeInOut" 
                      }}
                    />
                  )}
                  
                  {/* Icono de corazón con animación */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={item.isFavorite ? "favorite" : "notFavorite"}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.isFavorite ? (
                        <Heart fill="currentColor" size={18} strokeWidth={2} />
                      ) : (
                        <Heart size={18} strokeWidth={2} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>

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
              className="bg-gray-50 dark:bg-gray-700 p-3 rounded ml-4 mr-4" 
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