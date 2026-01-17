import { useEffect } from 'react';
import { useSettings } from '../store/useHealthStore';

export default function MetricCard({ icon, title, value, subtitle, trend, action, className = '' }) {
  const settings = useSettings();

  // Apply card image via CSS variables
  const cardClassName = settings?.cardImage?.enabled && settings?.cardImage?.url
    ? `metric-card with-image ${className}`
    : `metric-card ${className}`;

  useEffect(() => {
    if (settings?.cardImage?.enabled && settings?.cardImage?.url) {
      document.documentElement.style.setProperty('--card-bg-image', `url(${settings.cardImage.url})`);
      document.documentElement.style.setProperty('--card-bg-size', settings.cardImage.fit);
      document.documentElement.style.setProperty('--card-bg-position', settings.cardImage.position);
      document.documentElement.style.setProperty('--card-bg-opacity', settings.cardImage.opacity);
    } else {
      document.documentElement.style.removeProperty('--card-bg-image');
      document.documentElement.style.removeProperty('--card-bg-opacity');
    }
  }, [settings?.cardImage]);

  return (
    <div className={cardClassName}>
      <div className="metric-card-header">
        {icon && <span className="metric-icon">{icon}</span>}
        <h3 className="metric-title">{title}</h3>
      </div>

      <div className="metric-body">
        {value && <div className="metric-value">{value}</div>}

        {subtitle && <div className="metric-subtitle">{subtitle}</div>}

        {trend && (
          <div className={`metric-trend ${trend.type}`}>
            <span className="trend-indicator">{trend.type === 'up' ? '↑' : '↓'}</span>
            <span className="trend-text">{trend.text}</span>
          </div>
        )}
      </div>

      {action && (
        <div className="metric-footer">
          {action}
        </div>
      )}
    </div>
  );
}
