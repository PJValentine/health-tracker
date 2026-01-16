import express from 'express'

const router = express.Router()

// In-memory storage for demo purposes
let nutritionEntries = [
  {
    id: '1',
    date: '2026-01-16',
    mealType: 'breakfast',
    foodName: 'Oatmeal with berries',
    calories: 350,
    protein: 12,
    carbs: 58,
    fat: 8,
    notes: 'With almond milk'
  },
  {
    id: '2',
    date: '2026-01-16',
    mealType: 'lunch',
    foodName: 'Grilled chicken salad',
    calories: 450,
    protein: 35,
    carbs: 25,
    fat: 18,
    notes: null
  },
  {
    id: '3',
    date: '2026-01-16',
    mealType: 'snack',
    foodName: 'Greek yogurt',
    calories: 150,
    protein: 15,
    carbs: 12,
    fat: 4,
    notes: null
  }
]

let nextId = 4

// GET /api/nutrition - Get nutrition entries (optionally filtered by date)
router.get('/', (req, res) => {
  try {
    const { date } = req.query

    let filteredEntries = nutritionEntries

    if (date) {
      filteredEntries = nutritionEntries.filter(entry => entry.date === date)
    }

    res.json(filteredEntries)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch nutrition entries' })
  }
})

// POST /api/nutrition - Add new nutrition entry
router.post('/', (req, res) => {
  try {
    const { date, mealType, foodName, calories, protein, carbs, fat, notes } = req.body

    if (!date || !mealType || !foodName || !calories) {
      return res.status(400).json({
        message: 'Date, meal type, food name, and calories are required'
      })
    }

    const newEntry = {
      id: String(nextId++),
      date,
      mealType,
      foodName,
      calories: parseInt(calories),
      protein: protein ? parseInt(protein) : 0,
      carbs: carbs ? parseInt(carbs) : 0,
      fat: fat ? parseInt(fat) : 0,
      notes: notes || null
    }

    nutritionEntries.push(newEntry)
    res.status(201).json(newEntry)
  } catch (error) {
    res.status(500).json({ message: 'Failed to add nutrition entry' })
  }
})

// DELETE /api/nutrition/:id - Delete nutrition entry
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    const index = nutritionEntries.findIndex(entry => entry.id === id)

    if (index === -1) {
      return res.status(404).json({ message: 'Nutrition entry not found' })
    }

    nutritionEntries.splice(index, 1)
    res.json({ message: 'Nutrition entry deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete nutrition entry' })
  }
})

export default router
