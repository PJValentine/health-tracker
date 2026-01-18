import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import BottomTabBar from './BottomTabBar';
import { formatDate } from '../lib/utils';
import { RefreshCw, User } from 'lucide-react';
import { useHealthConnection, useSettings } from '../store/useHealthStore';

export default function AppShell() {
  const navigate = useNavigate();
  const healthConnection = useHealthConnection();
  const settings = useSettings();
  const isConnected = healthConnection?.status === 'connected';

  // Apply theme customizations
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
  }, [settings]);

  // Apply background image via CSS variables
  useEffect(() => {
    if (settings?.backgroundImage?.enabled && settings?.backgroundImage?.url) {
      document.documentElement.style.setProperty('--app-bg-image', `url(${settings.backgroundImage.url})`);
      document.documentElement.style.setProperty('--app-bg-size', settings.backgroundImage.fit);
      document.documentElement.style.setProperty('--app-bg-position', settings.backgroundImage.position);
      document.documentElement.style.setProperty('--app-bg-opacity', settings.backgroundImage.opacity);
    } else {
      document.documentElement.style.removeProperty('--app-bg-image');
      document.documentElement.style.removeProperty('--app-bg-opacity');
    }
  }, [settings?.backgroundImage]);

  return (
    <div className="app-shell">
      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-bar-content">
          <div className="top-bar-left">
            <h1 className="top-bar-title">{formatDate(new Date(), 'EEEE, MMM d')}</h1>
          </div>
          <div className="top-bar-right">
            {/* Sync indicator */}
            <button
              className={`sync-indicator ${isConnected ? 'connected' : ''}`}
              aria-label="Health sync status"
              title={isConnected ? 'Connected to Apple Health' : 'Not connected'}
            >
              <RefreshCw size={18} />
            </button>
            {/* Avatar/Settings */}
            <button
              className="avatar-button"
              aria-label="User profile"
              onClick={() => navigate('/settings')}
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="main-content-inner">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomTabBar />
    </div>
  );
}
