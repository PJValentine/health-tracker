// Mock seed data for initial app state
// This data structure can be replaced with real backend data later

export const initialMockData = {
  // Weight entries
  weightEntries: [
    {
      id: '1',
      type: 'weight',
      valueKg: 75.2,
      note: 'Morning weight after workout',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'weight',
      valueKg: 75.5,
      note: '',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'weight',
      valueKg: 76.0,
      note: 'Post-vacation',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],

  // Mood entries
  moodEntries: [
    {
      id: '1',
      type: 'mood',
      moodScore: 4, // 1-5 scale
      tags: ['energized', 'productive'],
      note: 'Great workout this morning',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'mood',
      moodScore: 3,
      tags: ['calm'],
      note: '',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ],

  // Nutrition notes
  nutritionEntries: [
    {
      id: '1',
      type: 'nutrition',
      text: 'Oatmeal with berries and protein powder. Felt full and satisfied.',
      mealType: 'breakfast',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'nutrition',
      text: 'Chicken salad with olive oil dressing',
      mealType: 'lunch',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ],

  // Apple Health connection status
  healthConnection: {
    status: 'disconnected', // 'connected' | 'disconnected'
    lastSyncAt: null,
    permissions: [
      { name: 'Weight', enabled: false },
      { name: 'Steps', enabled: false },
      { name: 'Sleep', enabled: false },
    ],
  },

  // User settings
  settings: {
    units: 'kg', // 'kg' | 'lb'
    name: 'Health Tracker User',
  },
};

// Generate additional mock weight entries for chart (last 30 days)
export function generateWeightHistory() {
  const entries = [];
  const baseWeight = 76;

  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Add some variance
    const variance = (Math.random() - 0.5) * 2;
    const weight = baseWeight + variance - (i * 0.02); // Slight downward trend

    entries.push({
      id: `weight-hist-${i}`,
      type: 'weight',
      valueKg: Math.round(weight * 10) / 10,
      note: '',
      timestamp: date.toISOString(),
    });
  }

  return entries;
}

// Generate additional mock mood entries for chart (last 14 days)
export function generateMoodHistory() {
  const entries = [];

  for (let i = 14; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Random mood 1-5
    const moodScore = Math.floor(Math.random() * 3) + 3; // 3-5 range for better looking data

    entries.push({
      id: `mood-hist-${i}`,
      type: 'mood',
      moodScore,
      tags: [],
      note: '',
      timestamp: date.toISOString(),
    });
  }

  return entries;
}
