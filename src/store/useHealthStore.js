import { useState, useEffect, useCallback } from 'react';
import { initialMockData } from './mockData';
import { supabase } from '../lib/supabase';
import * as supabaseSync from '../lib/supabaseSync';

// Local storage key
const STORAGE_KEY = 'health-tracker-data';

// Initialize state from localStorage or use clean initial data
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

  // First time - start with clean data (no mock entries)
  return { ...initialMockData };
}

// Save to localStorage
function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Get current user ID (helper for Supabase sync)
async function getUserId() {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Sync data to Supabase (fire and forget - doesn't block UI)
async function syncToSupabase(action, ...args) {
  const userId = await getUserId();
  if (!userId || !supabase) {
    console.log('Skipping Supabase sync - no user or Supabase not configured');
    return;
  }

  try {
    await action(userId, ...args);
  } catch (error) {
    console.error('Supabase sync failed (data saved locally):', error);
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
      const newEntry = {
        id: Date.now().toString(),
        type: 'weight',
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString(),
      };

      updateState((prev) => ({
        ...prev,
        weightEntries: [newEntry, ...prev.weightEntries],
      }));

      // Sync to Supabase (async, non-blocking)
      syncToSupabase(supabaseSync.addWeightLog, {
        weight: entry.valueKg,
        timestamp: newEntry.timestamp,
        notes: entry.note || '',
      });
    }, [updateState]),

    deleteWeightEntry: useCallback((id) => {
      updateState((prev) => ({
        ...prev,
        weightEntries: prev.weightEntries.filter((e) => e.id !== id),
      }));
    }, [updateState]),

    // Mood entries
    addMoodEntry: useCallback((entry) => {
      const newEntry = {
        id: Date.now().toString(),
        type: 'mood',
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString(),
      };

      updateState((prev) => ({
        ...prev,
        moodEntries: [newEntry, ...prev.moodEntries],
      }));

      // Sync to Supabase (async, non-blocking)
      syncToSupabase(supabaseSync.addMoodLog, {
        mood: entry.moodScore,
        tags: entry.tags || [],
        notes: entry.note || '',
        timestamp: newEntry.timestamp,
      });
    }, [updateState]),

    deleteMoodEntry: useCallback((id) => {
      updateState((prev) => ({
        ...prev,
        moodEntries: prev.moodEntries.filter((e) => e.id !== id),
      }));
    }, [updateState]),

    // Nutrition entries
    addNutritionEntry: useCallback((entry) => {
      const newEntry = {
        id: Date.now().toString(),
        type: 'nutrition',
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString(),
      };

      updateState((prev) => ({
        ...prev,
        nutritionEntries: [newEntry, ...prev.nutritionEntries],
      }));

      // Sync to Supabase (async, non-blocking)
      syncToSupabase(supabaseSync.addNutritionNote, {
        mealType: entry.mealType || 'other',
        notes: entry.text || '',
        timestamp: newEntry.timestamp,
      });
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
      const updated = { ...globalState.settings, ...newSettings };

      updateState((prev) => ({
        ...prev,
        settings: updated,
      }));

      // Sync to Supabase (async, non-blocking)
      syncToSupabase(supabaseSync.updateUserSettings, updated);
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
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);
        // Reset to clean initial state
        const newState = { ...initialMockData };
        updateState(newState);
      }
    }, [updateState]),

    // Load data from Supabase (call after login)
    loadFromSupabase: useCallback(async () => {
      const userId = await getUserId();
      if (!userId || !supabase) {
        console.log('Cannot load from Supabase - no user or not configured');
        return false;
      }

      try {
        const data = await supabaseSync.syncAllDataFromSupabase(userId);

        updateState((prev) => ({
          ...prev,
          settings: data.settings || prev.settings,
          weightEntries: data.weightEntries || prev.weightEntries,
          moodEntries: data.moodEntries || prev.moodEntries,
          nutritionEntries: data.nutritionNotes || prev.nutritionEntries,
          healthConnection: data.healthConnection || prev.healthConnection,
        }));

        return true;
      } catch (error) {
        console.error('Failed to load from Supabase:', error);
        return false;
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
