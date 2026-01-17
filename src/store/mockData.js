// Mock seed data for initial app state
// This data structure can be replaced with real backend data later

export const initialMockData = {
  // Weight entries - start empty for new users
  weightEntries: [],

  // Mood entries - start empty for new users
  moodEntries: [],

  // Nutrition entries - start empty for new users
  nutritionEntries: [],

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
    // Theme customization
    theme: {
      primaryColor: '#2D5F4F',
      primaryDark: '#1F4438',
      secondaryColor: '#E8A87C',
      accentCoral: '#F4A896',
      beige100: '#FBF8F3',
      beige200: '#F5E6D3',
      beige300: '#E8D4BC',
    },
    // Background image customization
    backgroundImage: {
      url: '',
      opacity: 0.1,
      fit: 'cover', // 'cover' | 'contain' | 'fill' | 'none'
      position: 'center', // 'center' | 'top' | 'bottom' | 'left' | 'right'
      enabled: false,
    },
    // Hero section image customization
    heroImage: {
      url: '',
      opacity: 0.3,
      fit: 'cover',
      position: 'center',
      enabled: false,
    },
    // Card background image customization
    cardImage: {
      url: '',
      opacity: 0.05,
      fit: 'cover',
      position: 'center',
      enabled: false,
    },
  },
};

// These functions are no longer used - users start with clean data
export function generateWeightHistory() {
  return [];
}

export function generateMoodHistory() {
  return [];
}
