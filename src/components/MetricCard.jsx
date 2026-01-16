export default function MetricCard({ icon, title, value, subtitle, trend, action, className = '' }) {
  return (
    <div className={`metric-card ${className}`}>
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
