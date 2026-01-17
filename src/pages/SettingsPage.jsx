import { useState } from 'react';
import { Download, Trash2, Activity, Check, Palette, Image as ImageIcon } from 'lucide-react';
import { useHealthStore, useHealthConnection, useSettings } from '../store/useHealthStore';
import { formatRelativeTime } from '../lib/utils';
import { toast } from '../lib/toast';

export default function SettingsPage() {
  const { updateSettings, toggleHealthConnection, updateHealthPermissions, exportData, clearAllData } = useHealthStore();
  const healthConnection = useHealthConnection();
  const settings = useSettings();

  const isConnected = healthConnection?.status === 'connected';
  const units = settings?.units || 'kg';

  // Local state for color inputs
  const [colorInputs, setColorInputs] = useState({
    primaryColor: settings?.theme?.primaryColor || '#2D5F4F',
    primaryDark: settings?.theme?.primaryDark || '#1F4438',
    secondaryColor: settings?.theme?.secondaryColor || '#E8A87C',
    accentCoral: settings?.theme?.accentCoral || '#F4A896',
    beige100: settings?.theme?.beige100 || '#FBF8F3',
    beige200: settings?.theme?.beige200 || '#F5E6D3',
    beige300: settings?.theme?.beige300 || '#E8D4BC',
  });

  // Local state for image inputs
  const [bgImageInputs, setBgImageInputs] = useState({
    url: settings?.backgroundImage?.url || '',
    opacity: settings?.backgroundImage?.opacity || 0.1,
    fit: settings?.backgroundImage?.fit || 'cover',
    position: settings?.backgroundImage?.position || 'center',
    enabled: settings?.backgroundImage?.enabled || false,
  });

  const [heroImageInputs, setHeroImageInputs] = useState({
    url: settings?.heroImage?.url || '',
    opacity: settings?.heroImage?.opacity || 0.3,
    fit: settings?.heroImage?.fit || 'cover',
    position: settings?.heroImage?.position || 'center',
    enabled: settings?.heroImage?.enabled || false,
  });

  const [cardImageInputs, setCardImageInputs] = useState({
    url: settings?.cardImage?.url || '',
    opacity: settings?.cardImage?.opacity || 0.05,
    fit: settings?.cardImage?.fit || 'cover',
    position: settings?.cardImage?.position || 'center',
    enabled: settings?.cardImage?.enabled || false,
  });

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

  const handleColorChange = (colorKey, value) => {
    setColorInputs(prev => ({ ...prev, [colorKey]: value }));
  };

  const handleApplyColors = () => {
    updateSettings({ theme: colorInputs });
    toast.success('Theme colors updated');
  };

  const handleResetColors = () => {
    const defaultColors = {
      primaryColor: '#2D5F4F',
      primaryDark: '#1F4438',
      secondaryColor: '#E8A87C',
      accentCoral: '#F4A896',
      beige100: '#FBF8F3',
      beige200: '#F5E6D3',
      beige300: '#E8D4BC',
    };
    setColorInputs(defaultColors);
    updateSettings({ theme: defaultColors });
    toast.success('Theme colors reset to default');
  };

  const handleBackgroundImageChange = (key, value) => {
    setBgImageInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyBackgroundImage = () => {
    updateSettings({ backgroundImage: bgImageInputs });
    toast.success('Background image updated');
  };

  const handleHeroImageChange = (key, value) => {
    setHeroImageInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyHeroImage = () => {
    updateSettings({ heroImage: heroImageInputs });
    toast.success('Hero image updated');
  };

  const handleCardImageChange = (key, value) => {
    setCardImageInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyCardImage = () => {
    updateSettings({ cardImage: cardImageInputs });
    toast.success('Card image updated');
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

      {/* Theme Colors Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Theme Colors</h2>
        <div className="settings-card">
          <div className="settings-subsection">
            <div className="color-customization-grid">
              <div className="color-input-group">
                <label className="color-label">
                  <Palette size={16} />
                  Primary Color
                </label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={colorInputs.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={colorInputs.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="color-text-input"
                    placeholder="#2D5F4F"
                  />
                </div>
              </div>

              <div className="color-input-group">
                <label className="color-label">Primary Dark</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={colorInputs.primaryDark}
                    onChange={(e) => handleColorChange('primaryDark', e.target.value)}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={colorInputs.primaryDark}
                    onChange={(e) => handleColorChange('primaryDark', e.target.value)}
                    className="color-text-input"
                    placeholder="#1F4438"
                  />
                </div>
              </div>

              <div className="color-input-group">
                <label className="color-label">Secondary Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={colorInputs.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={colorInputs.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="color-text-input"
                    placeholder="#E8A87C"
                  />
                </div>
              </div>

              <div className="color-input-group">
                <label className="color-label">Accent Coral</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={colorInputs.accentCoral}
                    onChange={(e) => handleColorChange('accentCoral', e.target.value)}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={colorInputs.accentCoral}
                    onChange={(e) => handleColorChange('accentCoral', e.target.value)}
                    className="color-text-input"
                    placeholder="#F4A896"
                  />
                </div>
              </div>

              <div className="color-input-group">
                <label className="color-label">Beige Light</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={colorInputs.beige100}
                    onChange={(e) => handleColorChange('beige100', e.target.value)}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={colorInputs.beige100}
                    onChange={(e) => handleColorChange('beige100', e.target.value)}
                    className="color-text-input"
                    placeholder="#FBF8F3"
                  />
                </div>
              </div>

              <div className="color-input-group">
                <label className="color-label">Beige Medium</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={colorInputs.beige200}
                    onChange={(e) => handleColorChange('beige200', e.target.value)}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={colorInputs.beige200}
                    onChange={(e) => handleColorChange('beige200', e.target.value)}
                    className="color-text-input"
                    placeholder="#F5E6D3"
                  />
                </div>
              </div>

              <div className="color-input-group">
                <label className="color-label">Beige Dark</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={colorInputs.beige300}
                    onChange={(e) => handleColorChange('beige300', e.target.value)}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={colorInputs.beige300}
                    onChange={(e) => handleColorChange('beige300', e.target.value)}
                    className="color-text-input"
                    placeholder="#E8D4BC"
                  />
                </div>
              </div>
            </div>

            <div className="color-actions">
              <button className="btn btn-primary" onClick={handleApplyColors}>
                Apply Colors
              </button>
              <button className="btn btn-secondary" onClick={handleResetColors}>
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Background Images Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Background Images</h2>
        <div className="settings-card">
          {/* Main Background */}
          <div className="settings-subsection">
            <h3 className="settings-subsection-title">
              <ImageIcon size={16} />
              App Background
            </h3>
            <div className="image-customization">
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://images.unsplash.com/photo-123/image.jpg"
                  value={bgImageInputs.url}
                  onChange={(e) => handleBackgroundImageChange('url', e.target.value)}
                />
                <p className="form-helper-text">Use direct image URLs (.jpg, .png, .webp). For Unsplash: right-click image → "Copy Image Address"</p>
              </div>

              <div className="settings-row">
                <div className="form-group">
                  <label className="form-label">Opacity: {bgImageInputs.opacity}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgImageInputs.opacity}
                    onChange={(e) => handleBackgroundImageChange('opacity', parseFloat(e.target.value))}
                    className="range-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fit</label>
                  <select
                    value={bgImageInputs.fit}
                    onChange={(e) => handleBackgroundImageChange('fit', e.target.value)}
                    className="form-select"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Fill</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Position</label>
                  <select
                    value={bgImageInputs.position}
                    onChange={(e) => handleBackgroundImageChange('position', e.target.value)}
                    className="form-select"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bgImageInputs.enabled}
                    onChange={(e) => handleBackgroundImageChange('enabled', e.target.checked)}
                  />
                  Enable Background Image
                </label>
              </div>

              <button className="btn btn-primary" onClick={handleApplyBackgroundImage}>
                Apply Background
              </button>
            </div>
          </div>

          {/* Hero Section Background */}
          <div className="settings-subsection">
            <h3 className="settings-subsection-title">Hero Section Background</h3>
            <div className="image-customization">
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://images.unsplash.com/photo-123/image.jpg"
                  value={heroImageInputs.url}
                  onChange={(e) => handleHeroImageChange('url', e.target.value)}
                />
                <p className="form-helper-text">Use direct image URLs (.jpg, .png, .webp). For Unsplash: right-click image → "Copy Image Address"</p>
              </div>

              <div className="settings-row">
                <div className="form-group">
                  <label className="form-label">Opacity: {heroImageInputs.opacity}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={heroImageInputs.opacity}
                    onChange={(e) => handleHeroImageChange('opacity', parseFloat(e.target.value))}
                    className="range-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fit</label>
                  <select
                    value={heroImageInputs.fit}
                    onChange={(e) => handleHeroImageChange('fit', e.target.value)}
                    className="form-select"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Fill</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Position</label>
                  <select
                    value={heroImageInputs.position}
                    onChange={(e) => handleHeroImageChange('position', e.target.value)}
                    className="form-select"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={heroImageInputs.enabled}
                    onChange={(e) => handleHeroImageChange('enabled', e.target.checked)}
                  />
                  Enable Hero Image
                </label>
              </div>

              <button className="btn btn-primary" onClick={handleApplyHeroImage}>
                Apply Hero Image
              </button>
            </div>
          </div>

          {/* Card Background */}
          <div className="settings-subsection">
            <h3 className="settings-subsection-title">Card Backgrounds</h3>
            <div className="image-customization">
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://images.unsplash.com/photo-123/image.jpg"
                  value={cardImageInputs.url}
                  onChange={(e) => handleCardImageChange('url', e.target.value)}
                />
                <p className="form-helper-text">Use direct image URLs (.jpg, .png, .webp). For Unsplash: right-click image → "Copy Image Address"</p>
              </div>

              <div className="settings-row">
                <div className="form-group">
                  <label className="form-label">Opacity: {cardImageInputs.opacity}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={cardImageInputs.opacity}
                    onChange={(e) => handleCardImageChange('opacity', parseFloat(e.target.value))}
                    className="range-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fit</label>
                  <select
                    value={cardImageInputs.fit}
                    onChange={(e) => handleCardImageChange('fit', e.target.value)}
                    className="form-select"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Fill</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Position</label>
                  <select
                    value={cardImageInputs.position}
                    onChange={(e) => handleCardImageChange('position', e.target.value)}
                    className="form-select"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={cardImageInputs.enabled}
                    onChange={(e) => handleCardImageChange('enabled', e.target.checked)}
                  />
                  Enable Card Images
                </label>
              </div>

              <button className="btn btn-primary" onClick={handleApplyCardImage}>
                Apply Card Image
              </button>
            </div>
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
