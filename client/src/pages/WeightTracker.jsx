import { useState, useEffect } from 'react'
import { fetchWeightEntries, addWeightEntry, deleteWeightEntry } from '../services/api'

function WeightTracker() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newWeight, setNewWeight] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      setLoading(true)
      const data = await fetchWeightEntries()
      setEntries(data)
      setError(null)
    } catch (err) {
      setError('Failed to load weight entries')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEntry = async (e) => {
    e.preventDefault()

    if (!newWeight || isNaN(newWeight)) {
      alert('Please enter a valid weight')
      return
    }

    try {
      const entry = {
        weight: parseFloat(newWeight),
        date: newDate,
        notes: notes.trim() || null
      }

      await addWeightEntry(entry)
      await loadEntries()

      setNewWeight('')
      setNotes('')
      setNewDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      alert('Failed to add weight entry')
      console.error(err)
    }
  }

  const handleDeleteEntry = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return
    }

    try {
      await deleteWeightEntry(id)
      await loadEntries()
    } catch (err) {
      alert('Failed to delete entry')
      console.error(err)
    }
  }

  const calculateStats = () => {
    if (entries.length === 0) return null

    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))
    const latest = sortedEntries[sortedEntries.length - 1]
    const earliest = sortedEntries[0]
    const totalChange = latest.weight - earliest.weight

    return {
      current: latest.weight,
      starting: earliest.weight,
      totalChange,
      average: (entries.reduce((sum, e) => sum + e.weight, 0) / entries.length).toFixed(1)
    }
  }

  const stats = calculateStats()

  if (loading) {
    return <div className="weight-tracker loading">Loading weight data...</div>
  }

  return (
    <div className="weight-tracker">
      <h2>Weight Tracker</h2>

      {stats && (
        <div className="weight-stats">
          <div className="stat-item">
            <span className="stat-label">Current:</span>
            <span className="stat-value">{stats.current} lbs</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Starting:</span>
            <span className="stat-value">{stats.starting} lbs</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Change:</span>
            <span className={`stat-value ${stats.totalChange < 0 ? 'negative' : 'positive'}`}>
              {stats.totalChange > 0 ? '+' : ''}{stats.totalChange.toFixed(1)} lbs
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average:</span>
            <span className="stat-value">{stats.average} lbs</span>
          </div>
        </div>
      )}

      <div className="weight-form-container">
        <h3>Add Weight Entry</h3>
        <form onSubmit={handleAddEntry} className="weight-form">
          <div className="form-group">
            <label htmlFor="weight">Weight (lbs)</label>
            <input
              type="number"
              id="weight"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="150.0"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <input
              type="text"
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Morning weight after workout"
            />
          </div>
          <button type="submit" className="btn-primary">Add Entry</button>
        </form>
      </div>

      <div className="weight-history">
        <h3>Weight History</h3>
        {error && <p className="error-message">{error}</p>}
        {entries.length === 0 ? (
          <p className="empty-state">No weight entries yet. Add your first entry above!</p>
        ) : (
          <div className="entries-list">
            {entries
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((entry) => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-header">
                    <span className="entry-weight">{entry.weight} lbs</span>
                    <span className="entry-date">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="entry-notes">{entry.notes}</p>
                  )}
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WeightTracker
