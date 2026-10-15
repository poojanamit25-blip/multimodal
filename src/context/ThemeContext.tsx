import React, { createContext, useContext, useState, useEffect } from 'react';

export type UiTheme =
  | 'obsidian-luxe'        // Executive Dark Titanium, 10px Bevel, Icy Sky Blue & Deep Indigo
  | 'professional-light';  // Professional White & Black, 8px Precision, High-Contrast Crisp Monochrome

export type UiLayout = 'standard-3panel' | 'dual-split' | 'zen-focus';

export interface ThemeConfig {
  id: UiTheme;
  name: string;
  category: string;
  accentColor: string;
  secondaryAccent: string;
  bgPreview: string;
  cardPreview: string;
  monacoTheme: 'vs-dark' | 'vs';
  badge: string;
  typography: string;
  shape: string;
  fontFamily: string;
  borderRadius: string;
  description: string;
}

export const THEME_PRESETS: Record<UiTheme, ThemeConfig> = {
  'obsidian-luxe': {
    id: 'obsidian-luxe',
    name: 'Obsidian Luxe',
    category: 'Executive Dark',
    accentColor: '#38bdf8',
    secondaryAccent: '#818cf8',
    bgPreview: '#08090b',
    cardPreview: '#10141c',
    monacoTheme: 'vs-dark',
    badge: 'DEFAULT • EXECUTIVE DARK',
    typography: 'Plus Jakarta Sans (Modern Neo-Grotesque)',
    shape: '10px Refined Precision Bevels & Matte Titanium',
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    borderRadius: '10px',
    description: 'Polished graphite titanium with crisp Plus Jakarta Sans typography and refined 10px subtle bevels'
  },
  'professional-light': {
    id: 'professional-light',
    name: 'Professional White & Black',
    category: 'Executive Light',
    accentColor: '#09090b',
    secondaryAccent: '#2563eb',
    bgPreview: '#ffffff',
    cardPreview: '#f8fafc',
    monacoTheme: 'vs',
    badge: 'EXECUTIVE MONOCHROME',
    typography: 'Inter & Plus Jakarta Sans (High-Contrast White & Black)',
    shape: '8px Crisp Modern Hairline Borders',
    fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    borderRadius: '8px',
    description: 'Pristine high-contrast white canvas with sharp black typography, sleek borders, and corporate elegance'
  }
};

export const normalizeTheme = (raw: string | null): UiTheme => {
  if (raw === 'professional-light' || raw === 'nordic-light') return 'professional-light';
  return 'obsidian-luxe';
};

export interface ThemeContextType {
  theme: UiTheme;
  setTheme: (theme: UiTheme) => void;
  layout: UiLayout;
  setLayout: (layout: UiLayout) => void;
  themeConfig: ThemeConfig;
  fontSize: number;
  setFontSize: (size: number) => void;
  toggleTheme: () => void;
  isSwitcherOpen: boolean;
  setIsSwitcherOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<UiTheme>(() => {
    const saved = localStorage.getItem('kodexis_ui_theme');
    return normalizeTheme(saved);
  });

  const [layout, setLayoutState] = useState<UiLayout>(() => {
    const saved = localStorage.getItem('kodexis_ui_layout');
    if (saved === 'standard-3panel' || saved === 'dual-split' || saved === 'zen-focus') return saved as UiLayout;
    return 'standard-3panel';
  });

  const [fontSize, setFontSizeState] = useState<number>(() => {
    const saved = localStorage.getItem('kodexis_editor_fontsize');
    return saved ? parseInt(saved, 10) : 13;
  });

  const [isSwitcherOpen, setIsSwitcherOpen] = useState<boolean>(false);

  const setTheme = (newTheme: UiTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('kodexis_ui_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setLayout = (newLayout: UiLayout) => {
    setLayoutState(newLayout);
    localStorage.setItem('kodexis_ui_layout', newLayout);
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
    localStorage.setItem('kodexis_editor_fontsize', size.toString());
  };

  const toggleTheme = () => {
    const newTheme: UiTheme = theme === 'obsidian-luxe' ? 'professional-light' : 'obsidian-luxe';
    setTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const themeConfig = THEME_PRESETS[theme] || THEME_PRESETS['obsidian-luxe'];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        layout,
        setLayout,
        themeConfig,
        fontSize,
        setFontSize,
        toggleTheme,
        isSwitcherOpen,
        setIsSwitcherOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
