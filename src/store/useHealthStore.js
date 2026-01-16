import { useState, useEffect, useCallback } from 'react';
import { initialMockData, generateWeightHistory, generateMoodHistory } from './mockData';

// Local storage key
const STORAGE_KEY = 'health-tracker-data';

// Initialize state from localStorage or use mock data
function loadInitialState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }

  // First time - seed with mock data + generated history
  return {
    ...initialMockData,
    weightEntries: [
      ...generateWeightHistory(),
      ...initialMockData.weightEntries,
    ],
    moodEntries: [
      ...generateMoodHistory(),
      ...initialMockData.moodEntries,
    ],
  };
}

// Save to localStorage
function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Main store hook (singleton pattern via closure)
let globalState = null;
let globalSetState = null;
const listeners = new Set();

export function useHealthStore() {
  const [state, setState] = useState(() => {
    if (!globalState) {
      globalState = loadInitialState();
    }
    return globalState;
  });

  // Register this component as a listener
  useEffect(() => {
    if (!globalSetState) {
      globalSetState = setState;
    }

    listeners.add(setState);
    return () => listeners.delete(setState);
  }, [setState]);

  // Update all listeners when state changes
  const updateState = useCallback((updater) => {
    const newState = typeof updater === 'function' ? updater(globalState) : updater;
    globalState = newState;
    saveToStorage(newState);

    listeners.forEach((listener) => {
      if (listener !== setState) {
        listener(newState);
      }
    });
    setState(newState);
  }, [setState]);

  // Actions
  const actions = {
    // Weight entries
    addWeightEntry: useCallback((entry) => {
      updateState((prev) => ({
        ...prev,
        weightEntries: [
          {
            id: Date.now().toString(),
            type: 'weight',
            ...entry,
            timestamp: entry.timestamp || new Date().toISOString(),
          },
          ...prev.weightEntries,
        ],
      }));
    }, [updateState]),

    deleteWeightEntry: useCallback((id) => {
      updateState((prev) => ({
        ...prev,
        weightEntries: prev.weightEntries.filter((e) => e.id !== id),
      }));
    }, [updateState]),

    // Mood entries
    addMoodEntry: useCallback((entry) => {
      updateState((prev) => ({
        ...prev,
        moodEntries: [
          {
            id: Date.now().toString(),
            type: 'mood',
            ...entry,
            timestamp: entry.timestamp || new Date().toISOString(),
          },
          ...prev.moodEntries,
        ],
      }));
    }, [updateState]),

    deleteMoodEntry: useCallback((id) => {
      updateState((prev) => ({
        ...prev,
        moodEntries: prev.moodEntries.filter((e) => e.id !== id),
      }));
    }, [updateState]),

    // Nutrition entries
    addNutritionEntry: useCallback((entry) => {
      updateState((prev) => ({
        ...prev,
        nutritionEntries: [
          {
            id: Date.now().toString(),
            type: 'nutrition',
            ...entry,
            timestamp: entry.timestamp || new Date().toISOString(),
          },
          ...prev.nutritionEntries,
        ],
      }));
    }, [updateState]),

    deleteNutritionEntry: useCallback((id) => {
      updateState((prev) => ({
        ...prev,
        nutritionEntries: prev.nutritionEntries.filter((e) => e.id !== id),
      }));
    }, [updateState]),

    // Apple Health connection
    toggleHealthConnection: useCallback(() => {
      updateState((prev) => ({
        ...prev,
        healthConnection: {
          ...prev.healthConnection,
          status: prev.healthConnection.status === 'connected' ? 'disconnected' : 'connected',
          lastSyncAt: prev.healthConnection.status === 'disconnected' ? new Date().toISOString() : prev.healthConnection.lastSyncAt,
        },
      }));
    }, [updateState]),

    updateHealthPermissions: useCallback((permissions) => {
      updateState((prev) => ({
        ...prev,
        healthConnection: {
          ...prev.healthConnection,
          permissions,
        },
      }));
    }, [updateState]),

    // Settings
    updateSettings: useCallback((newSettings) => {
      updateState((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          ...newSettings,
        },
      }));
    }, [updateState]),

    // Export data
    exportData: useCallback(() => {
      const dataStr = JSON.stringify(globalState, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, []),

    // Clear all data (reset to initial state)
    clearAllData: useCallback(() => {
      if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        const newState = loadInitialState();
        updateState(newState);
      }
    }, [updateState]),
  };

  return {
    state,
    ...actions,
  };
}

// Convenience selectors
export function useWeightEntries() {
  const { state } = useHealthStore();
  return state.weightEntries || [];
}

export function useMoodEntries() {
  const { state } = useHealthStore();
  return state.moodEntries || [];
}

export function useNutritionEntries() {
  const { state } = useHealthStore();
  return state.nutritionEntries || [];
}

export function useHealthConnection() {
  const { state } = useHealthStore();
  return state.healthConnection;
}

export function useSettings() {
  const { state } = useHealthStore();
  return state.settings;
}
