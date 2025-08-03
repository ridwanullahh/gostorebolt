import { StoreTheme } from './store-themes';

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ColorHarmony {
  type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic';
  colors: string[];
  description: string;
}

class BrandColorSystem {
  // Convert hex to HSL
  private hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  // Convert HSL to hex
  private hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Generate color palette from primary color
  generatePalette(primaryColor: string): BrandColors {
    const [h, s, l] = this.hexToHsl(primaryColor);
    
    // Generate secondary color (analogous)
    const secondaryHue = (h + 30) % 360;
    const secondary = this.hslToHex(secondaryHue, Math.max(s - 10, 20), Math.max(l - 10, 20));
    
    // Generate accent color (complementary)
    const accentHue = (h + 180) % 360;
    const accent = this.hslToHex(accentHue, Math.min(s + 20, 80), Math.min(l + 20, 80));
    
    // Generate neutral palette
    const neutral = {
      50: this.hslToHex(h, Math.min(s, 20), 98),
      100: this.hslToHex(h, Math.min(s, 20), 95),
      200: this.hslToHex(h, Math.min(s, 20), 90),
      300: this.hslToHex(h, Math.min(s, 20), 80),
      400: this.hslToHex(h, Math.min(s, 20), 60),
      500: this.hslToHex(h, Math.min(s, 20), 40),
      600: this.hslToHex(h, Math.min(s, 20), 30),
      700: this.hslToHex(h, Math.min(s, 20), 20),
      800: this.hslToHex(h, Math.min(s, 20), 15),
      900: this.hslToHex(h, Math.min(s, 20), 10),
    };

    return {
      primary: primaryColor,
      secondary,
      accent,
      neutral,
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    };
  }

  // Check color contrast for accessibility
  checkContrast(color1: string, color2: string): { ratio: number; level: 'AAA' | 'AA' | 'A' | 'FAIL' } {
    const getLuminance = (hex: string) => {
      const rgb = [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16)
      ].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

    let level: 'AAA' | 'AA' | 'A' | 'FAIL';
    if (ratio >= 7) level = 'AAA';
    else if (ratio >= 4.5) level = 'AA';
    else if (ratio >= 3) level = 'A';
    else level = 'FAIL';

    return { ratio, level };
  }

  // Generate color harmonies
  generateHarmonies(baseColor: string): ColorHarmony[] {
    const [h, s, l] = this.hexToHsl(baseColor);
    
    return [
      {
        type: 'monochromatic',
        colors: [
          this.hslToHex(h, s, Math.min(l + 30, 90)),
          baseColor,
          this.hslToHex(h, s, Math.max(l - 30, 10))
        ],
        description: 'Different shades of the same color'
      },
      {
        type: 'analogous',
        colors: [
          this.hslToHex((h - 30 + 360) % 360, s, l),
          baseColor,
          this.hslToHex((h + 30) % 360, s, l)
        ],
        description: 'Colors adjacent on the color wheel'
      },
      {
        type: 'complementary',
        colors: [
          baseColor,
          this.hslToHex((h + 180) % 360, s, l)
        ],
        description: 'Colors opposite on the color wheel'
      },
      {
        type: 'triadic',
        colors: [
          baseColor,
          this.hslToHex((h + 120) % 360, s, l),
          this.hslToHex((h + 240) % 360, s, l)
        ],
        description: 'Three colors evenly spaced on the color wheel'
      },
      {
        type: 'tetradic',
        colors: [
          baseColor,
          this.hslToHex((h + 90) % 360, s, l),
          this.hslToHex((h + 180) % 360, s, l),
          this.hslToHex((h + 270) % 360, s, l)
        ],
        description: 'Four colors forming a rectangle on the color wheel'
      }
    ];
  }

  // Apply brand colors to theme
  applyBrandColorsToTheme(theme: StoreTheme, brandColors: BrandColors): StoreTheme {
    return {
      ...theme,
      colors: {
        primary: brandColors.primary,
        secondary: brandColors.secondary,
        accent: brandColors.accent,
        background: brandColors.neutral[50],
        surface: '#ffffff',
        text: brandColors.neutral[900],
        textSecondary: brandColors.neutral[600]
      }
    };
  }

  // Apply brand colors to CSS custom properties
  applyBrandColorsToCss(brandColors: BrandColors): void {
    const root = document.documentElement;
    
    // Primary colors
    root.style.setProperty('--color-primary', brandColors.primary);
    root.style.setProperty('--color-secondary', brandColors.secondary);
    root.style.setProperty('--color-accent', brandColors.accent);
    
    // Neutral colors
    Object.entries(brandColors.neutral).forEach(([shade, color]) => {
      root.style.setProperty(`--color-neutral-${shade}`, color);
    });
    
    // Semantic colors
    root.style.setProperty('--color-success', brandColors.success);
    root.style.setProperty('--color-warning', brandColors.warning);
    root.style.setProperty('--color-error', brandColors.error);
    root.style.setProperty('--color-info', brandColors.info);
    
    // Background and text
    root.style.setProperty('--color-background', brandColors.neutral[50]);
    root.style.setProperty('--color-surface', '#ffffff');
    root.style.setProperty('--color-text', brandColors.neutral[900]);
    root.style.setProperty('--color-text-secondary', brandColors.neutral[600]);
  }

  // Validate color accessibility
  validateAccessibility(brandColors: BrandColors): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check primary color contrast
    const primaryContrast = this.checkContrast(brandColors.primary, '#ffffff');
    if (primaryContrast.level === 'FAIL') {
      issues.push('Primary color has poor contrast with white text');
      suggestions.push('Consider using a darker shade of your primary color');
    }
    
    // Check text contrast
    const textContrast = this.checkContrast(brandColors.neutral[900], brandColors.neutral[50]);
    if (textContrast.level === 'FAIL') {
      issues.push('Text color has poor contrast with background');
      suggestions.push('Increase the contrast between text and background colors');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }
}

export default BrandColorSystem;
