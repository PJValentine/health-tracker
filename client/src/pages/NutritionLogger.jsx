import { useState, useEffect } from 'react'
import { fetchNutritionEntries, addNutritionEntry, deleteNutritionEntry } from '../services/api'

function NutritionLogger() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const [formData, setFormData] = useState({
    mealType: 'breakfast',
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    notes: ''
  })

  useEffect(() => {
    loadEntries()
  }, [selectedDate])

  const loadEntries = async () => {
    try {
      setLoading(true)
      const data = await fetchNutritionEntries(selectedDate)
      setEntries(data)
      setError(null)
    } catch (err) {
      setError('Failed to load nutrition entries')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.foodName || !formData.calories) {
      alert('Please enter food name and calories')
      return
    }

    try {
      const entry = {
        date: selectedDate,
        mealType: formData.mealType,
        foodName: formData.foodName.trim(),
        calories: parseInt(formData.calories),
        protein: formData.protein ? parseInt(formData.protein) : 0,
        carbs: formData.carbs ? parseInt(formData.carbs) : 0,
        fat: formData.fat ? parseInt(formData.fat) : 0,
        notes: formData.notes.trim() || null
      }

      await addNutritionEntry(entry)
      await loadEntries()

      setFormData({
        mealType: formData.mealType,
        foodName: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        notes: ''
      })
    } catch (err) {
      alert('Failed to add nutrition entry')
      console.error(err)
    }
  }

  const handleDeleteEntry = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return
    }

    try {
      await deleteNutritionEntry(id)
      await loadEntries()
    } catch (err) {
      alert('Failed to delete entry')
      console.error(err)
    }
  }

  const calculateDailyTotals = () => {
    return {
      calories: entries.reduce((sum, e) => sum + e.calories, 0),
      protein: entries.reduce((sum, e) => sum + (e.protein || 0), 0),
      carbs: entries.reduce((sum, e) => sum + (e.carbs || 0), 0),
      fat: entries.reduce((sum, e) => sum + (e.fat || 0), 0)
    }
  }

  const groupEntriesByMeal = () => {
    const groups = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    }

    entries.forEach(entry => {
      if (groups[entry.mealType]) {
        groups[entry.mealType].push(entry)
      }
    })

    return groups
  }

  const totals = calculateDailyTotals()
  const mealGroups = groupEntriesByMeal()

  if (loading) {
    return <div className="nutrition-logger loading">Loading nutrition data...</div>
  }

  return (
    <div className="nutrition-logger">
      <h2>Nutrition Logger</h2>

      <div className="date-selector">
        <label htmlFor="date">Select Date:</label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="daily-totals">
        <h3>Daily Totals</h3>
        <div className="totals-grid">
          <div className="total-item">
            <span className="total-label">Calories</span>
            <span className="total-value">{totals.calories} cal</span>
          </div>
          <div className="total-item">
            <span className="total-label">Protein</span>
            <span className="total-value">{totals.protein}g</span>
          </div>
          <div className="total-item">
            <span className="total-label">Carbs</span>
            <span className="total-value">{totals.carbs}g</span>
          </div>
          <div className="total-item">
            <span className="total-label">Fat</span>
            <span className="total-value">{totals.fat}g</span>
          </div>
        </div>
      </div>

      <div className="nutrition-form-container">
        <h3>Add Food Entry</h3>
        <form onSubmit={handleSubmit} className="nutrition-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mealType">Meal Type</label>
              <select
                id="mealType"
                name="mealType"
                value={formData.mealType}
                onChange={handleInputChange}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="foodName">Food Name</label>
              <input
                type="text"
                id="foodName"
                name="foodName"
                value={formData.foodName}
                onChange={handleInputChange}
                placeholder="Grilled chicken breast"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="calories">Calories</label>
              <input
                type="number"
                id="calories"
                name="calories"
                value={formData.calories}
                onChange={handleInputChange}
                placeholder="250"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="protein">Protein (g)</label>
              <input
                type="number"
                id="protein"
                name="protein"
                value={formData.protein}
                onChange={handleInputChange}
                placeholder="30"
              />
            </div>
            <div className="form-group">
              <label htmlFor="carbs">Carbs (g)</label>
              <input
                type="number"
                id="carbs"
                name="carbs"
                value={formData.carbs}
                onChange={handleInputChange}
                placeholder="10"
              />
            </div>
            <div className="form-group">
              <label htmlFor="fat">Fat (g)</label>
              <input
                type="number"
                id="fat"
                name="fat"
                value={formData.fat}
                onChange={handleInputChange}
                placeholder="5"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <input
              type="text"
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="With vegetables"
            />
          </div>

          <button type="submit" className="btn-primary">Add Entry</button>
        </form>
      </div>

      <div className="meals-container">
        <h3>Today's Meals</h3>
        {error && <p className="error-message">{error}</p>}
        {entries.length === 0 ? (
          <p className="empty-state">No nutrition entries for this day. Add your first meal above!</p>
        ) : (
          <div className="meals-list">
            {Object.entries(mealGroups).map(([mealType, mealEntries]) => (
              mealEntries.length > 0 && (
                <div key={mealType} className="meal-section">
                  <h4 className="meal-title">
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  </h4>
                  <div className="meal-entries">
                    {mealEntries.map((entry) => (
                      <div key={entry.id} className="nutrition-entry">
                        <div className="entry-header">
                          <span className="food-name">{entry.foodName}</span>
                          <span className="calories">{entry.calories} cal</span>
                        </div>
                        <div className="entry-macros">
                          {entry.protein > 0 && <span>P: {entry.protein}g</span>}
                          {entry.carbs > 0 && <span>C: {entry.carbs}g</span>}
                          {entry.fat > 0 && <span>F: {entry.fat}g</span>}
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
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NutritionLogger
