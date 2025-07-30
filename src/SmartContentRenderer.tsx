import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';
import { Code, FileText, Link, Hash, Image as ImageIcon } from 'lucide-react';
import { LinkPreview } from './LinkPreview';

interface SmartContentRendererProps {
  content: string;
  isDarkMode?: boolean;
}

// Función para detectar el tipo de contenido
const detectContentType = (content: string): {
  type: 'code' | 'markdown' | 'url' | 'image' | 'json' | 'text';
  language?: string;
} => {
  const trimmed = content.trim();
  
  // Optimización: solo analizar las primeras 50 líneas para archivos grandes
  const lines = trimmed.split('\n');
  const sampleContent = lines.length > 50 ? lines.slice(0, 50).join('\n') : trimmed;
  const sampleTrimmed = sampleContent.trim();
  
  // Detectar imágenes (URLs de imagen o rutas locales) - usar contenido completo para URLs
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
  const imageUrlRegex = /^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?[^\s]*)?$/i;
  
  if (imageExtensions.test(trimmed) || imageUrlRegex.test(trimmed)) {
    return { type: 'image' };
  }
  
  // Detectar URLs generales - usar contenido completo para URLs
  const urlRegex = /^https?:\/\/[^\s]+$/;
  if (urlRegex.test(trimmed)) {
    return { type: 'url' };
  }
  
  // Detectar JSON - usar contenido completo para validación
  try {
    JSON.parse(trimmed);
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      return { type: 'json', language: 'json' };
    }
  } catch {}
  
  // Primero verificar si es código TSX/JSX (antes de markdown para evitar confusión)
  const tsxPatterns = [
    /<[A-Z][\w]*[^>]*>/m,                    // JSX/TSX components
    /React\.|useState|useEffect|Component|Props/m, // React imports/hooks
    /^(import|export).*from\s+["'][^"']*["']/m,    // ES6 imports
    /^(interface|type|enum)\s+\w+/m,         // TypeScript types
    /:\s*(string|number|boolean|any|void|object|Array|Promise)/m, // Type annotations
    /as\s+(string|number|boolean|any)/m,     // Type assertions
  ];
  
  if (tsxPatterns.some(pattern => pattern.test(sampleTrimmed))) {
    return { type: 'code', language: 'typescript' };
  }
  
  // Detectar Markdown (solo si no es TSX)
  const markdownPatterns = [
    /^#{1,6}\s+/m,     // Headers
    /^\*\s+/m,         // Bullet lists
    /^\d+\.\s+/m,      // Numbered lists
    /\*\*[^*]+\*\*/,   // Bold
    /\*[^*]+\*/,       // Italic
    /`[^`]+`/,         // Inline code
    /```[\s\S]*?```/,  // Code blocks
    /^>\s+/m,          // Blockquotes
    /\[[^\]]+\]\([^)]+\)/ // Links
  ];
  
  // Solo considerar markdown si no tiene características de código
  const hasCodeCharacteristics = /[{}();]|import\s|export\s|function\s|const\s|let\s|var\s/.test(sampleTrimmed);
  
  if (!hasCodeCharacteristics && markdownPatterns.some(pattern => pattern.test(sampleTrimmed))) {
    return { type: 'markdown' };
  }
  
  // Detectar código por patrones específicos (solo lenguajes necesarios)
  const codePatterns = [
    // TypeScript/TSX - debe ir PRIMERO para tener máxima prioridad
    { pattern: /^(interface|type|enum|declare|namespace)\s+/m, language: 'typescript' },
    { pattern: /:\s*(string|number|boolean|any|void|object|Array|Promise|React\.)/m, language: 'typescript' },
    { pattern: /<[A-Z][\w]*[^>]*>/m, language: 'typescript' }, // JSX/TSX components
    { pattern: /React\.|useState|useEffect|Component|Props|FC</m, language: 'typescript' },
    { pattern: /as\s+(string|number|boolean|any)/m, language: 'typescript' },
    { pattern: /^import.*from\s+["'][^"']*["']/m, language: 'typescript' }, // ES6 imports
    
    // HTML - solo si no es JSX
    { pattern: /^<!DOCTYPE\s+html/im, language: 'html' },
    { pattern: /<(html|head|body|title|meta|link|script|style)[^>]*>/im, language: 'html' },
    { pattern: /<\/(html|head|body|script|style)>/im, language: 'html' },
    
    // CSS
    { pattern: /^(\.|#|\*|@)[a-zA-Z-_][\w-]*\s*\{/m, language: 'css' },
    { pattern: /@(media|import|keyframes|font-face|charset)/m, language: 'css' },
    { pattern: /(color|background|margin|padding|border|font|width|height|display|position)\s*:/m, language: 'css' },
    { pattern: /\{[^}]*;[^}]*\}/m, language: 'css' },
    
    // JavaScript (solo si no es TypeScript)
    { pattern: /^(const|let|var|function|class|async|await)\s+/m, language: 'javascript' },
    { pattern: /console\.(log|error|warn|info)/m, language: 'javascript' },
    { pattern: /document\.|window\.|localStorage\.|sessionStorage\./m, language: 'javascript' },
    { pattern: /\.(then|catch|finally)\(/m, language: 'javascript' },
    { pattern: /=>|\$\{.*\}/m, language: 'javascript' },
  ];
  
  for (const { pattern, language } of codePatterns) {
    if (pattern.test(sampleTrimmed)) {
      return { type: 'code', language };
    }
  }
  
  // Detectar código genérico por estructura (solo si no se detectó un lenguaje específico)
  const genericCodePatterns = [
    /[{}();]/,                    // Brackets and semicolons
    /^\s*\/\/|^\s*\/\*/m,        // Comments (// or /* */)
    /[=<>!]+/,                   // Operators
    /\w+\([^)]*\)/,              // Function calls
    /\b(true|false|null|undefined)\b/i, // Common literals
    /\b(if|else|for|while|return|break|continue)\b/i, // Control flow
    /[\[\]]/,                    // Array brackets
    /\w+\.\w+/,                  // Property access
  ];
  
  const codeScore = genericCodePatterns.reduce((score, pattern) => {
    return score + (pattern.test(sampleTrimmed) ? 1 : 0);
  }, 0);
  
  if (codeScore >= 3) {
    return { type: 'code', language: 'javascript' }; // Default to JS for generic code
  }
  
  return { type: 'text' };
};

export const SmartContentRenderer: React.FC<SmartContentRendererProps> = ({ 
  content, 
  isDarkMode = false 
}) => {
  const { type, language } = detectContentType(content);
  
  const getIcon = () => {
    switch (type) {
      case 'code':
      case 'json':
        return <Code className="w-4 h-4" />;
      case 'markdown':
        return <Hash className="w-4 h-4" />;
      case 'url':
        return <Link className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };
  
  const getTypeLabel = () => {
    switch (type) {
      case 'code':
        return `Código ${language ? `(${language})` : ''}`;
      case 'json':
        return 'JSON';
      case 'markdown':
        return 'Markdown';
      case 'url':
        return 'Enlace';
      case 'image':
        return 'Imagen';
      default:
        return 'Texto';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header compacto con tipo de contenido */}
      <motion.div 
        className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 mb-2 flex-shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {getIcon()}
        <span className="font-medium">{getTypeLabel()}</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
      </motion.div>

      {/* Contenido renderizado */}
      <motion.div
        className="flex-1 overflow-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {type === 'code' || type === 'json' ? (
          <SyntaxHighlighter
            language={language || 'text'}
            style={isDarkMode ? oneDark : oneLight}
            customStyle={{
              margin: 0,
              borderRadius: '6px',
              fontSize: '12px',
              lineHeight: '1.4',
              height: '100%',
              overflow: 'auto'
            }}
            showLineNumbers={content.split('\n').length > 10}
            wrapLines={true}
            wrapLongLines={true}
          >
            {content}
          </SyntaxHighlighter>
        ) : type === 'markdown' ? (
          <div className="prose prose-xs dark:prose-invert max-w-none h-full overflow-auto">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  return !isInline ? (
                    <SyntaxHighlighter
                      style={isDarkMode ? oneDark : oneLight}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        fontSize: '12px',
                        borderRadius: '4px',
                      } as any}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : type === 'image' ? (
          <div className="space-y-3">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 overflow-hidden">
              <img 
                src={content} 
                alt="Imagen del portapapeles"
                className="w-full h-auto max-h-96 object-contain rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  // Mostrar un mensaje de error o placeholder
                }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 break-all font-mono">
              {content}
            </div>
          </div>
        ) : type === 'url' ? (
          <LinkPreview url={content} isDarkMode={isDarkMode} />
        ) : (
          <div className="h-full bg-gray-50 dark:bg-gray-800 rounded-lg p-3 overflow-auto">
            <pre className="whitespace-pre-wrap text-xs text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
              {content}
            </pre>
          </div>
        )}
      </motion.div>
    </div>
  );
};
