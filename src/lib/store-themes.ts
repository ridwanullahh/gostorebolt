// Store Theme System
export interface StoreTheme {
  id: string;
  name: string;
  description: string;
  category: 'fashion' | 'electronics' | 'food' | 'beauty' | 'general';
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    headerStyle: 'minimal' | 'classic' | 'modern' | 'bold';
    productCardStyle: 'card' | 'minimal' | 'overlay' | 'detailed';
    buttonStyle: 'rounded' | 'square' | 'pill';
    spacing: 'tight' | 'normal' | 'relaxed';
  };
  features: {
    animations: boolean;
    gradients: boolean;
    shadows: boolean;
    borders: boolean;
  };
  customCSS?: string;
}

export const storeThemes: StoreTheme[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean, minimalist design perfect for fashion and lifestyle brands',
    category: 'fashion',
    preview: '1562577909-0616839d-87b8-4e8a-98ea-ff2b4b76dd38',
    colors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#f5f5f5',
      background: '#ffffff',
      surface: '#fafafa',
      text: '#000000',
      textSecondary: '#666666',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    layout: {
      headerStyle: 'minimal',
      productCardStyle: 'minimal',
      buttonStyle: 'square',
      spacing: 'relaxed',
    },
    features: {
      animations: true,
      gradients: false,
      shadows: false,
      borders: true,
    },
  },
  {
    id: 'vibrant-tech',
    name: 'Vibrant Tech',
    description: 'Bold, colorful design ideal for electronics and tech products',
    category: 'electronics',
    preview: '1560472354-b3973d1b-e64c-4dae-8c2a-32b3f4ff5d4e',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#fbbf24',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Inter',
    },
    layout: {
      headerStyle: 'modern',
      productCardStyle: 'card',
      buttonStyle: 'rounded',
      spacing: 'normal',
    },
    features: {
      animations: true,
      gradients: true,
      shadows: true,
      borders: false,
    },
  },
  {
    id: 'organic-natural',
    name: 'Organic Natural',
    description: 'Earthy, natural design perfect for organic and eco-friendly products',
    category: 'food',
    preview: '1556909114-f6e7d8c9-a1b2-4c3d-8e9f-1a2b3c4d5e6f',
    colors: {
      primary: '#059669',
      secondary: '#065f46',
      accent: '#fbbf24',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#064e3b',
      textSecondary: '#6b7280',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Source Sans Pro',
    },
    layout: {
      headerStyle: 'classic',
      productCardStyle: 'overlay',
      buttonStyle: 'pill',
      spacing: 'normal',
    },
    features: {
      animations: true,
      gradients: false,
      shadows: true,
      borders: true,
    },
  },
  {
    id: 'luxury-elegant',
    name: 'Luxury Elegant',
    description: 'Sophisticated design for premium and luxury brands',
    category: 'beauty',
    preview: '1596462502-e0d2e2b5-ac8a-4b6c-b1a6-9b3c4d5e6f7g',
    colors: {
      primary: '#7c2d12',
      secondary: '#fbbf24',
      accent: '#f3f4f6',
      background: '#fffbeb',
      surface: '#ffffff',
      text: '#7c2d12',
      textSecondary: '#92400e',
    },
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'Crimson Text',
    },
    layout: {
      headerStyle: 'bold',
      productCardStyle: 'detailed',
      buttonStyle: 'square',
      spacing: 'relaxed',
    },
    features: {
      animations: true,
      gradients: true,
      shadows: true,
      borders: true,
    },
  },
  {
    id: 'playful-creative',
    name: 'Playful Creative',
    description: 'Fun, colorful design perfect for creative and artistic products',
    category: 'general',
    preview: '1558618047-d4e5f6g7-h8i9-0j1k-2l3m-n4o5p6q7r8s9',
    colors: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#fef7ff',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
    },
    fonts: {
      heading: 'Fredoka One',
      body: 'Open Sans',
    },
    layout: {
      headerStyle: 'modern',
      productCardStyle: 'card',
      buttonStyle: 'pill',
      spacing: 'normal',
    },
    features: {
      animations: true,
      gradients: true,
      shadows: true,
      borders: false,
    },
  },
];

export const getThemeById = (themeId: string): StoreTheme | null => {
  return storeThemes.find(theme => theme.id === themeId) || null;
};

export const getThemesByCategory = (category: string): StoreTheme[] => {
  return storeThemes.filter(theme => theme.category === category || category === 'all');
};

export const applyThemeToStore = (theme: StoreTheme): string => {
  return `
    :root {
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-surface: ${theme.colors.surface};
      --color-text: ${theme.colors.text};
      --color-text-secondary: ${theme.colors.textSecondary};
      --font-heading: ${theme.fonts.heading}, sans-serif;
      --font-body: ${theme.fonts.body}, sans-serif;
    }

    .store-theme-${theme.id} {
      background-color: var(--color-background);
      color: var(--color-text);
      font-family: var(--font-body);
    }

    .store-theme-${theme.id} h1,
    .store-theme-${theme.id} h2,
    .store-theme-${theme.id} h3,
    .store-theme-${theme.id} h4,
    .store-theme-${theme.id} h5,
    .store-theme-${theme.id} h6 {
      font-family: var(--font-heading);
    }

    .store-theme-${theme.id} .btn-primary {
      background-color: var(--color-primary);
      color: ${theme.colors.primary === '#ffffff' ? '#000000' : '#ffffff'};
      ${theme.layout.buttonStyle === 'pill' ? 'border-radius: 9999px;' : ''}
      ${theme.layout.buttonStyle === 'square' ? 'border-radius: 0;' : ''}
      ${theme.features.shadows ? 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);' : ''}
    }

    .store-theme-${theme.id} .product-card {
      background-color: var(--color-surface);
      ${theme.features.shadows ? 'box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);' : ''}
      ${theme.features.borders ? 'border: 1px solid #e5e7eb;' : ''}
      ${theme.layout.spacing === 'tight' ? 'padding: 0.75rem;' : ''}
      ${theme.layout.spacing === 'relaxed' ? 'padding: 2rem;' : ''}
    }

    ${theme.features.gradients ? `
    .store-theme-${theme.id} .gradient-bg {
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    }
    ` : ''}

    ${theme.customCSS || ''}
  `;
};

export const generateDemoData = (theme: StoreTheme) => {
  const categoryProducts = {
    fashion: [
      { name: 'Premium Cotton T-Shirt', price: 29.99, image: '1562577909-0616839d-87b8-4e8a-98ea-ff2b4b76dd38' },
      { name: 'Designer Jeans', price: 89.99, image: '1441986300-e92c8878-5135-4f69-b00e-a90a2c0b7c8d' },
      { name: 'Leather Jacket', price: 199.99, image: '1524592301-c3d4e5f6-g7h8-9i0j-1k2l-m3n4o5p6q7r8' },
      { name: 'Sneakers', price: 79.99, image: '1506905925-i9j0k1l2-m3n4-5o6p-7q8r-s9t0u1v2w3x4' },
    ],
    electronics: [
      { name: 'Wireless Headphones', price: 149.99, image: '1560472354-b3973d1b-e64c-4dae-8c2a-32b3f4ff5d4e' },
      { name: 'Smart Watch', price: 299.99, image: '1523275335-684dbf681514' },
      { name: 'Laptop Stand', price: 49.99, image: '1527864550-2b8b0d1b7b8c' },
      { name: 'Phone Case', price: 19.99, image: '1512499617-c4c22fb97972' },
    ],
    food: [
      { name: 'Organic Coffee Beans', price: 24.99, image: '1495474472-e5f6g7h8-i9j0-1k2l-3m4n-o5p6q7r8s9t0' },
      { name: 'Artisan Honey', price: 18.99, image: '1556909114-f6e7d8c9-a1b2-4c3d-8e9f-1a2b3c4d5e6f' },
      { name: 'Herbal Tea Set', price: 34.99, image: '1504674900-j0k1l2m3-n4o5-6p7q-8r9s-t0u1v2w3x4y5' },
      { name: 'Olive Oil', price: 22.99, image: '1559056199-h8i9j0k1-l2m3-4n5o-6p7q-r8s9t0u1v2w3' },
    ],
    beauty: [
      { name: 'Luxury Face Cream', price: 89.99, image: '1596462502-e0d2e2b5-ac8a-4b6c-b1a6-9b3c4d5e6f7g' },
      { name: 'Organic Shampoo', price: 29.99, image: '1571019613-b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7' },
      { name: 'Makeup Palette', price: 59.99, image: '1559056199-h8i9j0k1-l2m3-4n5o-6p7q-r8s9t0u1v2w3' },
      { name: 'Perfume', price: 79.99, image: '1542751371-g7h8i9j0-k1l2-3m4n-5o6p-q7r8s9t0u1v2' },
    ],
    general: [
      { name: 'Desk Organizer', price: 39.99, image: '1586023492-a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' },
      { name: 'Wall Art Print', price: 24.99, image: '1558618047-d4e5f6g7-h8i9-0j1k-2l3m-n4o5p6q7r8s9' },
      { name: 'Candle Set', price: 34.99, image: '1416879595-f6g7h8i9-j0k1-2l3m-4n5o-p6q7r8s9t0u1' },
      { name: 'Plant Pot', price: 19.99, image: '1416879595-f6g7h8i9-j0k1-2l3m-4n5o-p6q7r8s9t0u1' },
    ],
  };

  return categoryProducts[theme.category] || categoryProducts.general;
};