import { Activity } from 'lucide-react';
import { useHealthStore, useHealthConnection } from '../store/useHealthStore';
import { formatRelativeTime } from '../lib/utils';

export default function AppleHealthStatusCard() {
  const { toggleHealthConnection } = useHealthStore();
  const healthConnection = useHealthConnection();

  const isConnected = healthConnection?.status === 'connected';

  return (
    <div className={`health-status-card ${isConnected ? 'connected' : ''}`}>
      <div className="health-status-icon">
        <Activity size={32} />
      </div>

      <div className="health-status-content">
        <h3 className="health-status-title">Apple Health</h3>

        <div className="health-status-badge">
          <span className={`status-indicator ${isConnected ? 'active' : ''}`} />
          <span className="status-text">
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        {isConnected && healthConnection.lastSyncAt && (
          <p className="health-status-sync">
            Last synced {formatRelativeTime(healthConnection.lastSyncAt)}
          </p>
        )}

        <button
          className={`btn ${isConnected ? 'btn-secondary' : 'btn-primary'}`}
          onClick={toggleHealthConnection}
        >
          {isConnected ? 'Disconnect' : 'Connect Now'}
        </button>
      </div>
    </div>
  );
}
