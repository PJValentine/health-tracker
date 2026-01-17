import { useEffect } from 'react';
import { useSettings } from '../store/useHealthStore';

export default function ThemeProvider({ children }) {
  const settings = useSettings();

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    // Apply theme colors
    if (settings.theme) {
      root.style.setProperty('--color-primary', settings.theme.primaryColor);
      root.style.setProperty('--color-primary-dark', settings.theme.primaryDark);
      root.style.setProperty('--color-secondary', settings.theme.secondaryColor);
      root.style.setProperty('--color-accent-coral', settings.theme.accentCoral);
      root.style.setProperty('--color-beige-100', settings.theme.beige100);
      root.style.setProperty('--color-beige-200', settings.theme.beige200);
      root.style.setProperty('--color-beige-300', settings.theme.beige300);
    }

    // Apply background image
    const appShell = document.querySelector('.app-shell');
    if (appShell && settings.backgroundImage?.enabled && settings.backgroundImage?.url) {
      appShell.style.backgroundImage = `url(${settings.backgroundImage.url})`;
      appShell.style.backgroundSize = settings.backgroundImage.fit;
      appShell.style.backgroundPosition = settings.backgroundImage.position;
      appShell.style.backgroundRepeat = 'no-repeat';
      appShell.style.backgroundAttachment = 'fixed';
      appShell.style.setProperty('--bg-image-opacity', settings.backgroundImage.opacity);
    } else if (appShell) {
      appShell.style.backgroundImage = '';
      appShell.style.removeProperty('--bg-image-opacity');
    }
  }, [settings]);

  return <>{children}</>;
}
