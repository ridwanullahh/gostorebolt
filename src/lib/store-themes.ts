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
  // NEW THEMES - 9 Additional Professional Themes
  {
    id: 'fashion',
    name: 'Fashion Forward',
    description: 'Elegant design perfect for fashion and lifestyle brands',
    category: 'fashion',
    colors: {
      primary: '#e91e63',
      secondary: '#ad1457',
      accent: '#f8bbd9',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#212121',
      textSecondary: '#757575'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Source Sans Pro'
    },
    layout: {
      headerStyle: 'minimal',
      navigationStyle: 'horizontal',
      productGridStyle: 'masonry',
      footerStyle: 'minimal'
    },
    components: {
      buttonStyle: 'pill',
      cardStyle: 'elevated',
      imageStyle: 'rounded'
    },
    effects: {
      animations: true,
      gradients: true,
      shadows: true,
      borders: false,
    },
  },
  {
    id: 'food',
    name: 'Gourmet',
    description: 'Warm and inviting design for food and restaurant businesses',
    category: 'food',
    colors: {
      primary: '#ff6f00',
      secondary: '#e65100',
      accent: '#ffcc02',
      background: '#fff8e1',
      surface: '#ffffff',
      text: '#3e2723',
      textSecondary: '#6d4c41'
    },
    fonts: {
      heading: 'Merriweather',
      body: 'Open Sans'
    },
    layout: {
      headerStyle: 'classic',
      navigationStyle: 'horizontal',
      productGridStyle: 'grid',
      footerStyle: 'detailed'
    },
    components: {
      buttonStyle: 'rounded',
      cardStyle: 'shadow',
      imageStyle: 'rounded'
    },
    effects: {
      animations: true,
      gradients: false,
      shadows: true,
      borders: true,
    },
  },
  {
    id: 'fitness',
    name: 'Athletic',
    description: 'Dynamic and energetic design for fitness and sports brands',
    category: 'fitness',
    colors: {
      primary: '#4caf50',
      secondary: '#388e3c',
      accent: '#8bc34a',
      background: '#f1f8e9',
      surface: '#ffffff',
      text: '#1b5e20',
      textSecondary: '#4caf50'
    },
    fonts: {
      heading: 'Roboto Condensed',
      body: 'Roboto'
    },
    layout: {
      headerStyle: 'bold',
      navigationStyle: 'horizontal',
      productGridStyle: 'grid',
      footerStyle: 'simple'
    },
    components: {
      buttonStyle: 'square',
      cardStyle: 'border',
      imageStyle: 'square'
    },
    effects: {
      animations: true,
      gradients: true,
      shadows: false,
      borders: true,
    },
  },
  {
    id: 'beauty',
    name: 'Beauty Salon',
    description: 'Sophisticated and glamorous design for beauty and cosmetics',
    category: 'beauty',
    colors: {
      primary: '#9c27b0',
      secondary: '#7b1fa2',
      accent: '#e1bee7',
      background: '#fce4ec',
      surface: '#ffffff',
      text: '#4a148c',
      textSecondary: '#7b1fa2'
    },
    fonts: {
      heading: 'Dancing Script',
      body: 'Lato'
    },
    layout: {
      headerStyle: 'minimal',
      navigationStyle: 'horizontal',
      productGridStyle: 'masonry',
      footerStyle: 'minimal'
    },
    components: {
      buttonStyle: 'pill',
      cardStyle: 'elevated',
      imageStyle: 'circle'
    },
    effects: {
      animations: true,
      gradients: true,
      shadows: true,
      borders: false,
    },
  },
  {
    id: 'automotive',
    name: 'Auto Parts',
    description: 'Industrial and robust design for automotive and machinery',
    category: 'automotive',
    colors: {
      primary: '#607d8b',
      secondary: '#455a64',
      accent: '#90a4ae',
      background: '#eceff1',
      surface: '#ffffff',
      text: '#263238',
      textSecondary: '#546e7a'
    },
    fonts: {
      heading: 'Oswald',
      body: 'Roboto'
    },
    layout: {
      headerStyle: 'bold',
      navigationStyle: 'horizontal',
      productGridStyle: 'grid',
      footerStyle: 'detailed'
    },
    components: {
      buttonStyle: 'square',
      cardStyle: 'border',
      imageStyle: 'square'
    },
    effects: {
      animations: false,
      gradients: false,
      shadows: false,
      borders: true,
    },
  },
  {
    id: 'jewelry',
    name: 'Luxury Jewelry',
    description: 'Premium and elegant design for jewelry and luxury goods',
    category: 'jewelry',
    colors: {
      primary: '#795548',
      secondary: '#5d4037',
      accent: '#d7ccc8',
      background: '#efebe9',
      surface: '#ffffff',
      text: '#3e2723',
      textSecondary: '#6d4c41'
    },
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'Crimson Text'
    },
    layout: {
      headerStyle: 'minimal',
      navigationStyle: 'horizontal',
      productGridStyle: 'grid',
      footerStyle: 'minimal'
    },
    components: {
      buttonStyle: 'outlined',
      cardStyle: 'elevated',
      imageStyle: 'rounded'
    },
    effects: {
      animations: true,
      gradients: true,
      shadows: true,
      borders: false,
    },
  },
  {
    id: 'books',
    name: 'Bookstore',
    description: 'Classic and scholarly design for books and educational content',
    category: 'books',
    colors: {
      primary: '#3f51b5',
      secondary: '#303f9f',
      accent: '#c5cae9',
      background: '#e8eaf6',
      surface: '#ffffff',
      text: '#1a237e',
      textSecondary: '#3f51b5'
    },
    fonts: {
      heading: 'Libre Baskerville',
      body: 'Source Serif Pro'
    },
    layout: {
      headerStyle: 'classic',
      navigationStyle: 'sidebar',
      productGridStyle: 'list',
      footerStyle: 'detailed'
    },
    components: {
      buttonStyle: 'rounded',
      cardStyle: 'shadow',
      imageStyle: 'square'
    },
    effects: {
      animations: false,
      gradients: false,
      shadows: true,
      borders: true,
    },
  },
  {
    id: 'electronics',
    name: 'Electronics Store',
    description: 'Modern and tech-focused design for electronics and gadgets',
    category: 'electronics',
    colors: {
      primary: '#2196f3',
      secondary: '#1976d2',
      accent: '#bbdefb',
      background: '#e3f2fd',
      surface: '#ffffff',
      text: '#0d47a1',
      textSecondary: '#1976d2'
    },
    fonts: {
      heading: 'Roboto',
      body: 'Roboto'
    },
    layout: {
      headerStyle: 'modern',
      navigationStyle: 'horizontal',
      productGridStyle: 'grid',
      footerStyle: 'simple'
    },
    components: {
      buttonStyle: 'rounded',
      cardStyle: 'border',
      imageStyle: 'square'
    },
    effects: {
      animations: true,
      gradients: true,
      shadows: false,
      borders: true,
    },
  },
  {
    id: 'handmade',
    name: 'Artisan Crafts',
    description: 'Rustic and authentic design for handmade and artisan products',
    category: 'handmade',
    colors: {
      primary: '#8d6e63',
      secondary: '#6d4c41',
      accent: '#d7ccc8',
      background: '#f3e5f5',
      surface: '#ffffff',
      text: '#3e2723',
      textSecondary: '#5d4037'
    },
    fonts: {
      heading: 'Amatic SC',
      body: 'Nunito'
    },
    layout: {
      headerStyle: 'classic',
      navigationStyle: 'horizontal',
      productGridStyle: 'masonry',
      footerStyle: 'detailed'
    },
    components: {
      buttonStyle: 'rounded',
      cardStyle: 'shadow',
      imageStyle: 'rounded'
    },
    effects: {
      animations: true,
      gradients: false,
      shadows: true,
      borders: true,
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

// Theme utilities
export const getTheme = (themeId: string): StoreTheme => {
  return storeThemes.find(theme => theme.id === themeId) || storeThemes[0];
};

export const applyTheme = (theme: StoreTheme, brandColors?: any) => {
  const root = document.documentElement;

  // Use brand colors if provided, otherwise use theme colors
  const colors = brandColors || theme.colors;

  // Apply CSS custom properties
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-text', colors.text);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);

  // Apply neutral colors if available
  if (brandColors?.neutral) {
    Object.entries(brandColors.neutral).forEach(([shade, color]) => {
      root.style.setProperty(`--color-neutral-${shade}`, color as string);
    });
  }

  // Apply semantic colors if available
  if (brandColors?.success) root.style.setProperty('--color-success', brandColors.success);
  if (brandColors?.warning) root.style.setProperty('--color-warning', brandColors.warning);
  if (brandColors?.error) root.style.setProperty('--color-error', brandColors.error);
  if (brandColors?.info) root.style.setProperty('--color-info', brandColors.info);

  // Apply fonts
  root.style.setProperty('--font-heading', theme.fonts.heading);
  root.style.setProperty('--font-body', theme.fonts.body);

  // Apply theme effects
  root.style.setProperty('--theme-animations', theme.effects.animations ? 'enabled' : 'disabled');
  root.style.setProperty('--theme-gradients', theme.effects.gradients ? 'enabled' : 'disabled');
  root.style.setProperty('--theme-shadows', theme.effects.shadows ? 'enabled' : 'disabled');
  root.style.setProperty('--theme-borders', theme.effects.borders ? 'enabled' : 'disabled');

  // Apply theme class to body
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${theme.id}`);

  // Apply layout classes
  document.body.classList.add(`header-${theme.layout.headerStyle}`);
  document.body.classList.add(`nav-${theme.layout.navigationStyle}`);
  document.body.classList.add(`grid-${theme.layout.productGridStyle}`);
  document.body.classList.add(`footer-${theme.layout.footerStyle}`);

  // Apply component classes
  document.body.classList.add(`btn-${theme.components.buttonStyle}`);
  document.body.classList.add(`card-${theme.components.cardStyle}`);
  document.body.classList.add(`img-${theme.components.imageStyle}`);
};