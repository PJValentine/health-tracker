import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, TrendingUp, Settings } from 'lucide-react';

const tabs = [
  { path: '/today', icon: Home, label: 'Today' },
  { path: '/log', icon: PlusCircle, label: 'Log' },
  { path: '/insights', icon: TrendingUp, label: 'Insights' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomTabBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="bottom-tab-bar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPath === tab.path || (currentPath === '/' && tab.path === '/today');

        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`tab-item ${isActive ? 'active' : ''}`}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="tab-icon" size={24} />
            <span className="tab-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
