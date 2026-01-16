import express from 'express'

const router = express.Router()

// In-memory storage for demo purposes
let healthData = {
  currentWeight: 175.5,
  weightChange: -2.3,
  todayCalories: 1850,
  weeklyAvgCalories: 2100,
  appleHealthConnected: false,
  lastSync: null
}

// GET /api/health/summary - Get health summary for dashboard
router.get('/summary', (req, res) => {
  try {
    res.json(healthData)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch health summary' })
  }
})

export default router
