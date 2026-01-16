import { useState, useEffect } from 'react'
import {
  fetchAppleHealthStatus,
  connectAppleHealth,
  disconnectAppleHealth,
  syncAppleHealthData
} from '../services/api'

function AppleHealthConnect() {
  const [status, setStatus] = useState({
    connected: false,
    lastSync: null,
    dataTypes: []
  })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      setLoading(true)
      const data = await fetchAppleHealthStatus()
      setStatus(data)
      setError(null)
    } catch (err) {
      setError('Failed to load Apple Health status')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      setLoading(true)
      await connectAppleHealth()
      await loadStatus()
      alert('Successfully connected to Apple Health!')
    } catch (err) {
      alert('Failed to connect to Apple Health. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect from Apple Health?')) {
      return
    }

    try {
      setLoading(true)
      await disconnectAppleHealth()
      await loadStatus()
    } catch (err) {
      alert('Failed to disconnect from Apple Health')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      const result = await syncAppleHealthData()
      await loadStatus()
      alert(`Sync complete! Imported ${result.recordsImported} records.`)
    } catch (err) {
      alert('Failed to sync data from Apple Health')
      console.error(err)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return <div className="apple-health loading">Loading Apple Health status...</div>
  }

  return (
    <div className="apple-health">
      <h2>Apple Health Integration</h2>

      <div className="connection-status">
        <div className={`status-badge ${status.connected ? 'connected' : 'disconnected'}`}>
          <span className="status-icon">{status.connected ? '✓' : '✗'}</span>
          <span className="status-text">
            {status.connected ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        {status.connected && status.lastSync && (
          <p className="last-sync">
            Last synced: {new Date(status.lastSync).toLocaleString()}
          </p>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="connection-info">
        <h3>About Apple Health Integration</h3>
        <p>
          Connect your Apple Health account to automatically sync your health data including:
        </p>
        <ul className="feature-list">
          <li>Weight measurements</li>
          <li>Body composition data</li>
          <li>Activity and exercise data</li>
          <li>Nutritional information</li>
          <li>Heart rate and vitals</li>
        </ul>
      </div>

      {!status.connected ? (
        <div className="connection-actions">
          <button
            onClick={handleConnect}
            className="btn-primary btn-large"
            disabled={loading}
          >
            Connect to Apple Health
          </button>
          <p className="connection-note">
            You'll be redirected to Apple's authorization page to grant access to your health data.
          </p>
        </div>
      ) : (
        <div className="connected-actions">
          <div className="data-types">
            <h3>Synced Data Types</h3>
            {status.dataTypes.length > 0 ? (
              <ul className="data-types-list">
                {status.dataTypes.map((type, index) => (
                  <li key={index} className="data-type-item">
                    <span className="type-icon">📊</span>
                    <span className="type-name">{type}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No data types selected</p>
            )}
          </div>

          <div className="action-buttons">
            <button
              onClick={handleSync}
              className="btn-primary"
              disabled={syncing}
            >
              {syncing ? 'Syncing...' : '🔄 Sync Now'}
            </button>
            <button
              onClick={handleDisconnect}
              className="btn-danger"
              disabled={loading || syncing}
            >
              Disconnect
            </button>
          </div>

          <div className="sync-info">
            <h3>Automatic Sync</h3>
            <p>
              Your data automatically syncs every 24 hours. You can also manually sync at any time
              using the button above.
            </p>
          </div>
        </div>
      )}

      <div className="privacy-info">
        <h3>Privacy & Security</h3>
        <p>
          Your health data is encrypted and stored securely. We only access the data types you
          explicitly authorize, and you can disconnect at any time. Your data is never shared
          with third parties.
        </p>
      </div>
    </div>
  )
}

export default AppleHealthConnect
