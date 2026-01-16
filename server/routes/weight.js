import express from 'express'

const router = express.Router()

// In-memory storage for demo purposes
let weightEntries = [
  {
    id: '1',
    weight: 177.8,
    date: '2026-01-10',
    notes: 'Morning weight'
  },
  {
    id: '2',
    weight: 176.2,
    date: '2026-01-13',
    notes: 'After workout'
  },
  {
    id: '3',
    weight: 175.5,
    date: '2026-01-16',
    notes: null
  }
]

let nextId = 4

// GET /api/weight - Get all weight entries
router.get('/', (req, res) => {
  try {
    res.json(weightEntries)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch weight entries' })
  }
})

// POST /api/weight - Add new weight entry
router.post('/', (req, res) => {
  try {
    const { weight, date, notes } = req.body

    if (!weight || !date) {
      return res.status(400).json({ message: 'Weight and date are required' })
    }

    const newEntry = {
      id: String(nextId++),
      weight: parseFloat(weight),
      date,
      notes: notes || null
    }

    weightEntries.push(newEntry)
    res.status(201).json(newEntry)
  } catch (error) {
    res.status(500).json({ message: 'Failed to add weight entry' })
  }
})

// DELETE /api/weight/:id - Delete weight entry
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    const index = weightEntries.findIndex(entry => entry.id === id)

    if (index === -1) {
      return res.status(404).json({ message: 'Weight entry not found' })
    }

    weightEntries.splice(index, 1)
    res.json({ message: 'Weight entry deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete weight entry' })
  }
})

export default router
