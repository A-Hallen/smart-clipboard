import { ClipboardItem } from '../main';

/**
 * Determina si un contenido es una URL
 */
export const isUrl = (content: string): boolean => {
  const urlRegex = /^https?:\/\/[^\s]+$/;
  return urlRegex.test(content.trim());
};

/**
 * Filtra los elementos del portapapeles por tipo
 * @param items Lista de elementos del portapapeles
 * @param type Tipo de filtro ('links' o 'other')
 * @returns Lista filtrada de elementos
 */
export const filterClipboardItems = (
  items: ClipboardItem[], 
  type: 'links' | 'other' | 'all'
): ClipboardItem[] => {
  if (type === 'all') {
    return items;
  }
  
  return items.filter(item => {
    const isLink = isUrl(item.content);
    return type === 'links' ? isLink : !isLink;
  });
};

/**
 * Cuenta los elementos por tipo
 * @param items Lista de elementos del portapapeles
 * @returns Objeto con contadores por tipo
 */
export const countItemsByType = (items: ClipboardItem[]): { 
  links: number; 
  other: number;
  all: number;
} => {
  let links = 0;
  let other = 0;
  
  items.forEach(item => {
    if (isUrl(item.content)) {
      links++;
    } else {
      other++;
    }
  });
  
  return {
    links,
    other,
    all: items.length
  };
};
