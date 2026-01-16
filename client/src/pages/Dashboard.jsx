import { useState, useEffect } from 'react'
import { fetchHealthSummary } from '../services/api'

function Dashboard() {
  const [summary, setSummary] = useState({
    currentWeight: null,
    weightChange: null,
    todayCalories: null,
    weeklyAvgCalories: null,
    appleHealthConnected: false,
    lastSync: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      setLoading(true)
      const data = await fetchHealthSummary()
      setSummary(data)
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="dashboard loading">Loading dashboard...</div>
  }

  if (error) {
    return (
      <div className="dashboard error">
        <p>{error}</p>
        <button onClick={loadSummary}>Retry</button>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <h2>Dashboard Overview</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-content">
            <h3>Current Weight</h3>
            <p className="stat-value">
              {summary.currentWeight ? `${summary.currentWeight} lbs` : 'No data'}
            </p>
            {summary.weightChange && (
              <p className={`stat-change ${summary.weightChange > 0 ? 'positive' : 'negative'}`}>
                {summary.weightChange > 0 ? '+' : ''}{summary.weightChange} lbs this week
              </p>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Today's Calories</h3>
            <p className="stat-value">
              {summary.todayCalories ? `${summary.todayCalories} cal` : 'No data'}
            </p>
            {summary.weeklyAvgCalories && (
              <p className="stat-subtitle">
                Weekly avg: {summary.weeklyAvgCalories} cal
              </p>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-content">
            <h3>Apple Health</h3>
            <p className="stat-value">
              {summary.appleHealthConnected ? 'Connected' : 'Not Connected'}
            </p>
            {summary.lastSync && (
              <p className="stat-subtitle">
                Last sync: {new Date(summary.lastSync).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button className="action-btn">Log Weight</button>
              <button className="action-btn">Log Meal</button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <button onClick={loadSummary} className="refresh-btn">
          🔄 Refresh Data
        </button>
      </div>
    </div>
  )
}

export default Dashboard
