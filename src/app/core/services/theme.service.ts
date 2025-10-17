import { Injectable } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme-preference';
  private currentTheme: ThemeMode = 'system';
  private mediaQuery: MediaQueryList;

  constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.initializeTheme();
    this.setupSystemThemeListener();
  }

  /**
   * Initialize theme from localStorage or default to system
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode;
    this.currentTheme = savedTheme || 'system';
    this.applyTheme(this.currentTheme);
  }

  /**
   * Listen for system theme changes when in system mode
   */
  private setupSystemThemeListener(): void {
    this.mediaQuery.addEventListener('change', (e) => {
      if (this.currentTheme === 'system') {
        this.applySystemTheme(e.matches);
      }
    });
  }

  /**
   * Get current theme preference
   */
  getCurrentTheme(): ThemeMode {
    return this.currentTheme;
  }

  /**
   * Set theme preference
   */
  setTheme(theme: ThemeMode): void {
    this.currentTheme = theme;
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  /**
   * Apply the selected theme
   */
  private applyTheme(theme: ThemeMode): void {
    const html = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes from both html and body
    html.classList.remove('ion-palette-dark');
    body.classList.remove('ion-palette-dark');
    
    switch (theme) {
      case 'dark':
        // Apply to both html and body for maximum compatibility
        html.classList.add('ion-palette-dark');
        body.classList.add('ion-palette-dark');
        console.log('Dark theme applied');
        break;
      case 'light':
        // Light is default, no class needed
        console.log('Light theme applied');
        break;
      case 'system':
        this.applySystemTheme(this.mediaQuery.matches);
        break;
    }
  }

  /**
   * Apply theme based on system preference
   */
  private applySystemTheme(isDark: boolean): void {
    const html = document.documentElement;
    const body = document.body;
    
    html.classList.remove('ion-palette-dark');
    body.classList.remove('ion-palette-dark');
    
    if (isDark) {
      html.classList.add('ion-palette-dark');
      body.classList.add('ion-palette-dark');
      console.log('System theme: dark');
    } else {
      console.log('System theme: light');
    }
  }

  /**
   * Check if currently in dark mode (useful for UI)
   */
  isDarkMode(): boolean {
    return document.body.classList.contains('ion-palette-dark');
  }
}
