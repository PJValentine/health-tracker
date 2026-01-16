import { Download, Trash2, Activity, Check } from 'lucide-react';
import { useHealthStore, useHealthConnection, useSettings } from '../store/useHealthStore';
import { formatRelativeTime } from '../lib/utils';
import { toast } from '../lib/toast';

export default function SettingsPage() {
  const { updateSettings, toggleHealthConnection, updateHealthPermissions, exportData, clearAllData } = useHealthStore();
  const healthConnection = useHealthConnection();
  const settings = useSettings();

  const isConnected = healthConnection?.status === 'connected';
  const units = settings?.units || 'kg';

  const handleUnitsChange = (newUnits) => {
    updateSettings({ units: newUnits });
    toast.success(`Units changed to ${newUnits}`);
  };

  const handlePermissionToggle = (permissionName) => {
    const updatedPermissions = healthConnection.permissions.map((p) =>
      p.name === permissionName ? { ...p, enabled: !p.enabled } : p
    );
    updateHealthPermissions(updatedPermissions);
    toast.success(`${permissionName} permission ${updatedPermissions.find(p => p.name === permissionName).enabled ? 'enabled' : 'disabled'}`);
  };

  const handleExport = () => {
    exportData();
    toast.success('Data exported successfully');
  };

  const handleClearData = () => {
    clearAllData();
  };

  return (
    <div className="page page-settings">
      <h1 className="page-title">Settings</h1>

      {/* Profile Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Profile</h2>
        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-content">
              <div className="settings-item-label">Name</div>
              <div className="settings-item-value">{settings?.name || 'Health Tracker User'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Units Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Units</h2>
        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-content">
              <div className="settings-item-label">Weight Unit</div>
              <div className="settings-item-description">Choose your preferred weight measurement</div>
            </div>
            <div className="settings-toggle-group">
              <button
                className={`toggle-btn ${units === 'kg' ? 'active' : ''}`}
                onClick={() => handleUnitsChange('kg')}
              >
                kg
              </button>
              <button
                className={`toggle-btn ${units === 'lb' ? 'active' : ''}`}
                onClick={() => handleUnitsChange('lb')}
              >
                lb
              </button>
            </div>
          </div>

          <div className="settings-helper">
            <p>1 kg = 2.20462 lb</p>
          </div>
        </div>
      </div>

      {/* Apple Health Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Apple Health</h2>
        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-content">
              <div className="settings-item-icon">
                <Activity size={24} />
              </div>
              <div>
                <div className="settings-item-label">Connection Status</div>
                <div className="settings-item-value">
                  <span className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                {isConnected && healthConnection.lastSyncAt && (
                  <div className="settings-item-description">
                    Last synced {formatRelativeTime(healthConnection.lastSyncAt)}
                  </div>
                )}
              </div>
            </div>
            <button
              className={`btn ${isConnected ? 'btn-danger' : 'btn-primary'}`}
              onClick={toggleHealthConnection}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          {isConnected && (
            <div className="settings-subsection">
              <h3 className="settings-subsection-title">Permissions</h3>
              <div className="permissions-list">
                {healthConnection.permissions.map((permission) => (
                  <label key={permission.name} className="permission-item">
                    <div className="permission-content">
                      <span className="permission-name">{permission.name}</span>
                      <span className="permission-status">
                        {permission.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`permission-toggle ${permission.enabled ? 'enabled' : ''}`}
                      onClick={() => handlePermissionToggle(permission.name)}
                      aria-label={`Toggle ${permission.name}`}
                    >
                      <span className="toggle-track">
                        <span className="toggle-thumb">
                          {permission.enabled && <Check size={12} />}
                        </span>
                      </span>
                    </button>
                  </label>
                ))}
              </div>

              <div className="settings-helper">
                <p><strong>Note:</strong> This is a UI stub. Real Apple Health integration requires native iOS capabilities and HealthKit API access.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Management Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Data Management</h2>
        <div className="settings-card">
          <button
            className="settings-action-btn"
            onClick={handleExport}
          >
            <Download size={20} />
            <div>
              <div className="action-btn-label">Export Data</div>
              <div className="action-btn-description">Download all your health data as JSON</div>
            </div>
          </button>

          <button
            className="settings-action-btn danger"
            onClick={handleClearData}
          >
            <Trash2 size={20} />
            <div>
              <div className="action-btn-label">Clear All Data</div>
              <div className="action-btn-description">Delete all logs and reset to default</div>
            </div>
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="settings-footer">
        <p className="app-version">Health Tracker v0.1.0</p>
        <p className="app-copyright">Built with React + Vite</p>
      </div>
    </div>
  );
}
