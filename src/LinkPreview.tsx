import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Globe, Image as ImageIcon } from 'lucide-react';

interface LinkPreviewProps {
  url: string;
  isDarkMode?: boolean;
}

interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({ url, isDarkMode = false }) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const domain = new URL(url).hostname;
        
        // Intentar obtener metadatos reales usando un proxy CORS
        try {
          // Usar allorigins.win como proxy para evitar problemas de CORS
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            const htmlContent = data.contents;
            
            // Parsear el HTML para extraer metadatos
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            const extractedMetadata: LinkMetadata = {
              siteName: domain,
              favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
            };
            
            // Extraer título
            const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
            const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
            const pageTitle = doc.querySelector('title')?.textContent;
            extractedMetadata.title = ogTitle || twitterTitle || pageTitle || `Contenido de ${domain}`;
            
            // Extraer descripción
            const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
            const twitterDescription = doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
            const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content');
            extractedMetadata.description = ogDescription || twitterDescription || metaDescription || `Enlace a ${domain}`;
            
            // Extraer imagen
            const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
            const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
            if (ogImage || twitterImage) {
              let imageUrl = ogImage || twitterImage || '';
              // Convertir URLs relativas a absolutas
              if (imageUrl.startsWith('/')) {
                imageUrl = new URL(imageUrl, url).href;
              }
              extractedMetadata.image = imageUrl;
            }
            
            // Extraer nombre del sitio
            const ogSiteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
            if (ogSiteName) {
              extractedMetadata.siteName = ogSiteName;
            }
            
            setMetadata(extractedMetadata);
            return;
          }
        } catch (proxyError) {
          console.log('Error con proxy, usando metadatos básicos:', proxyError);
        }
        
        // Fallback: metadatos básicos mejorados basados en el dominio
        const fallbackMetadata: LinkMetadata = {
          siteName: domain,
          favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        };
        
        // Metadatos específicos por dominio
        if (domain.includes('github.com')) {
          const pathParts = new URL(url).pathname.split('/').filter(Boolean);
          if (pathParts.length >= 2) {
            fallbackMetadata.title = `${pathParts[0]}/${pathParts[1]}`;
            fallbackMetadata.description = `Repositorio de GitHub de ${pathParts[0]}`;
            fallbackMetadata.image = `https://opengraph.githubassets.com/1/${pathParts[0]}/${pathParts[1]}`;
          } else {
            fallbackMetadata.title = 'GitHub';
            fallbackMetadata.description = 'Plataforma de desarrollo colaborativo';
          }
        } else if (domain.includes('youtube.com')) {
          const videoId = new URL(url).searchParams.get('v');
          if (videoId) {
            fallbackMetadata.title = 'Video de YouTube';
            fallbackMetadata.description = 'Contenido de video en YouTube';
            fallbackMetadata.image = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          }
        } else if (domain.includes('youtu.be')) {
          const videoId = new URL(url).pathname.slice(1);
          if (videoId) {
            fallbackMetadata.title = 'Video de YouTube';
            fallbackMetadata.description = 'Contenido de video en YouTube';
            fallbackMetadata.image = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          }
        } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
          fallbackMetadata.title = 'Post en X (Twitter)';
          fallbackMetadata.description = 'Contenido de redes sociales';
          fallbackMetadata.siteName = 'X (Twitter)';
        } else if (domain.includes('linkedin.com')) {
          fallbackMetadata.title = 'LinkedIn';
          fallbackMetadata.description = 'Red profesional';
          fallbackMetadata.siteName = 'LinkedIn';
        } else if (domain.includes('instagram.com')) {
          fallbackMetadata.title = 'Instagram';
          fallbackMetadata.description = 'Contenido de Instagram';
          fallbackMetadata.siteName = 'Instagram';
        } else {
          fallbackMetadata.title = `Contenido de ${domain}`;
          fallbackMetadata.description = `Enlace a ${domain}`;
        }
        
        setMetadata(fallbackMetadata);
      } catch (err) {
        console.error('Error al obtener metadatos:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [url]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Globe className="w-8 h-8 text-gray-400" />
          <div className="flex-1">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline break-all text-sm font-medium"
            >
              {url}
            </a>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              No se pudo cargar la vista previa
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
    >
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        {metadata.image && (
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
            <img 
              src={metadata.image} 
              alt={metadata.title || 'Preview'}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.parentElement?.remove();
              }}
            />
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {metadata.favicon && (
              <img 
                src={metadata.favicon} 
                alt="Favicon"
                className="w-6 h-6 rounded flex-shrink-0 mt-0.5"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            
            <div className="flex-1 min-w-0">
              {metadata.title && (
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1" 
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                  {metadata.title}
                </h3>
              )}
              
              {metadata.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2" 
                   style={{
                     display: '-webkit-box',
                     WebkitLineClamp: 3,
                     WebkitBoxOrient: 'vertical',
                     overflow: 'hidden'
                   }}>
                  {metadata.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-500 truncate">
                  {metadata.siteName || new URL(url).hostname}
                </span>
                <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
};
