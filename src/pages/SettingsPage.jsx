import { useState } from 'react';
import { Download, Trash2, Activity, Check, LogOut, User, Camera } from 'lucide-react';
import { useHealthStore, useHealthConnection, useSettings } from '../store/useHealthStore';
import { useAuth } from '../contexts/AuthContext';
import { formatRelativeTime } from '../lib/utils';
import { toast } from '../lib/toast';

export default function SettingsPage() {
  const { updateSettings, toggleHealthConnection, updateHealthPermissions, exportData, clearAllData } = useHealthStore();
  const healthConnection = useHealthConnection();
  const settings = useSettings();
  const { user, signOut } = useAuth();

  const isConnected = healthConnection?.status === 'connected';
  const units = settings?.units || 'kg';

  // Local state for profile editing
  const [name, setName] = useState(settings?.name || 'Health Tracker User');
  const [profilePicture, setProfilePicture] = useState(settings?.profilePicture || null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Read and compress image
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Max dimensions (keep aspect ratio)
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = (width * MAX_HEIGHT) / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.8 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

          // Check if compressed image is too large (>500KB in base64)
          if (compressedDataUrl.length > 500 * 1024) {
            toast.error('Image is too large even after compression. Please use a smaller image.');
            return;
          }

          setProfilePicture(compressedDataUrl);
          toast.success('Image uploaded and compressed');
        };
        img.onerror = () => {
          toast.error('Failed to load image');
        };
        img.src = event.target.result;
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    updateSettings({
      name: name.trim() || 'Health Tracker User',
      profilePicture
    });
    setIsEditingProfile(false);
    toast.success('Profile updated successfully');
  };

  const handleCancelEdit = () => {
    setName(settings?.name || 'Health Tracker User');
    setProfilePicture(settings?.profilePicture || null);
    setIsEditingProfile(false);
  };

  return (
    <div className="page page-settings">
      <h1 className="page-title">User Profile</h1>

      {/* Profile Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Profile</h2>
        <div className="settings-card">
          {/* Profile Picture */}
          <div className="profile-picture-section">
            <div className="profile-picture-container">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="profile-picture" />
              ) : (
                <div className="profile-picture-placeholder">
                  <User size={48} />
                </div>
              )}
              {isEditingProfile && (
                <label className="profile-picture-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="profile-picture-input"
                  />
                  <div className="profile-picture-upload-overlay">
                    <Camera size={24} />
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="settings-item">
            <div className="settings-item-content">
              <div className="settings-item-label">Name</div>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Enter your name"
                />
              ) : (
                <div className="settings-item-value">{settings?.name || 'Health Tracker User'}</div>
              )}
            </div>
          </div>

          {/* Email (from auth, read-only) */}
          {user && (
            <div className="settings-item">
              <div className="settings-item-content">
                <div className="settings-item-label">Email</div>
                <div className="settings-item-value">{user?.email}</div>
                <div className="settings-item-description">Your account email cannot be changed</div>
              </div>
            </div>
          )}

          {/* Edit Profile Actions */}
          <div className="profile-actions">
            {isEditingProfile ? (
              <>
                <button className="btn btn-primary" onClick={handleSaveProfile}>
                  Save Changes
                </button>
                <button className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setIsEditingProfile(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Units Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Preferences</h2>
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

      {/* Account Section */}
      {user && (
        <div className="settings-section">
          <h2 className="settings-section-title">Account</h2>
          <div className="settings-card">
            <button
              className="settings-action-btn danger"
              onClick={handleSignOut}
            >
              <LogOut size={20} />
              <div>
                <div className="action-btn-label">Sign Out</div>
                <div className="action-btn-description">Sign out of your account</div>
              </div>
            </button>
          </div>
        </div>
      )}

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
