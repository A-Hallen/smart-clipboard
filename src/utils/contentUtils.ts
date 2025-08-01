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
 * @param type Tipo de filtro ('links', 'other', 'all', 'favorites')
 * @returns Lista filtrada de elementos
 */
export const filterClipboardItems = (
  items: ClipboardItem[], 
  type: 'links' | 'other' | 'all' | 'favorites',
  searchTerm?: string
): ClipboardItem[] => {
  // First filter by type
  let filteredItems = items;
  
  if (type === 'favorites') {
    filteredItems = items.filter(item => item.isFavorite);
  } else if (type !== 'all') {
    filteredItems = items.filter(item => {
      const isLink = isUrl(item.content);
      return type === 'links' ? isLink : !isLink;
    });
  }
  
  // Then filter by search term if provided
  if (searchTerm && searchTerm.trim() !== '') {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    filteredItems = filteredItems.filter(item => 
      item.content.toLowerCase().includes(normalizedSearchTerm)
    );
  }
  
  return filteredItems;
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
  favorites: number;
} => {
  let links = 0;
  let other = 0;
  let favorites = 0;
  
  items.forEach(item => {
    if (isUrl(item.content)) {
      links++;
    } else {
      other++;
    }
    
    if (item.isFavorite) {
      favorites++;
    }
  });
  
  return {
    links,
    other,
    all: items.length,
    favorites
  };
};
