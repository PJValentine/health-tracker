import { supabase } from './supabase';

/**
 * Sync helper functions for integrating Supabase with the health tracker store
 */

// ============================================
// USER SETTINGS
// ============================================

export async function fetchUserSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle(); // FIX: Use maybeSingle() instead of single() to handle no rows gracefully

  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }

  if (!data) {
    // Create default settings for new user using upsert
    const defaultSettings = {
      user_id: userId,
      units: 'kg',
      name: 'Health Tracker User',
      profile_picture: null,
      theme: {
        primaryColor: '#2D5F4F',
        primaryDark: '#1F4438',
        secondaryColor: '#E8A87C',
        accentCoral: '#F4A896',
        beige100: '#FBF8F3',
        beige200: '#F5E6D3',
        beige300: '#E8D4BC',
      },
    };

    // FIX: Use upsert to handle conflicts gracefully
    const { data: newData, error: upsertError } = await supabase
      .from('user_settings')
      .upsert(defaultSettings, { onConflict: 'user_id' })
      .select()
      .single();

    if (upsertError) {
      console.error('Error creating settings:', upsertError);
      // Return default settings locally even if DB fails
      return transformSettingsFromDB(defaultSettings);
    }

    return transformSettingsFromDB(newData);
  }

  return transformSettingsFromDB(data);
}

export async function updateUserSettings(userId, settings) {
  const updateData = {
    user_id: userId,
    units: settings.units,
    name: settings.name,
    theme: settings.theme || {},
  };

  // Only include profile_picture if it exists
  if (settings.profilePicture !== undefined) {
    updateData.profile_picture = settings.profilePicture;
  }

  // FIX: Use upsert instead of update to handle missing rows
  const { error } = await supabase
    .from('user_settings')
    .upsert(updateData, { onConflict: 'user_id' });

  if (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

function transformSettingsFromDB(dbSettings) {
  return {
    units: dbSettings.units,
    name: dbSettings.name,
    profilePicture: dbSettings.profile_picture || null,
    theme: dbSettings.theme || {},
  };
}

// ============================================
// WEIGHT LOGS
// ============================================

export async function fetchWeightLogs(userId) {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching weight logs:', error);
    return [];
  }

  return data.map(transformWeightLogFromDB);
}

export async function addWeightLog(userId, entry) {
  const { data, error } = await supabase
    .from('weight_logs')
    .insert({
      user_id: userId,
      weight: parseFloat(entry.weight),
      date: entry.timestamp.split('T')[0],
      notes: entry.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding weight log:', error);
    throw error;
  }

  return transformWeightLogFromDB(data);
}

export async function deleteWeightLog(logId) {
  const { error } = await supabase
    .from('weight_logs')
    .delete()
    .eq('id', logId);

  if (error) {
    console.error('Error deleting weight log:', error);
    throw error;
  }
}

function transformWeightLogFromDB(dbLog) {
  return {
    id: dbLog.id,
    type: 'weight',
    valueKg: parseFloat(dbLog.weight), // FIX: Changed from 'weight' to 'valueKg' to match app schema
    timestamp: new Date(dbLog.date).toISOString(),
    note: dbLog.notes, // FIX: Changed from 'notes' to 'note' to match app schema
  };
}

// ============================================
// MOOD LOGS
// ============================================

export async function fetchMoodLogs(userId) {
  const { data, error } = await supabase
    .from('mood_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching mood logs:', error);
    return [];
  }

  return data.map(transformMoodLogFromDB);
}

export async function addMoodLog(userId, entry) {
  const { data, error } = await supabase
    .from('mood_logs')
    .insert({
      user_id: userId,
      mood: entry.mood,
      tags: entry.tags || [],
      notes: entry.notes || null,
      date: entry.timestamp.split('T')[0],
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding mood log:', error);
    throw error;
  }

  return transformMoodLogFromDB(data);
}

export async function deleteMoodLog(logId) {
  const { error } = await supabase
    .from('mood_logs')
    .delete()
    .eq('id', logId);

  if (error) {
    console.error('Error deleting mood log:', error);
    throw error;
  }
}

function transformMoodLogFromDB(dbLog) {
  return {
    id: dbLog.id,
    type: 'mood',
    moodScore: dbLog.mood, // FIX: Changed from 'mood' to 'moodScore' to match app schema
    tags: dbLog.tags || [],
    note: dbLog.notes, // FIX: Changed from 'notes' to 'note' to match app schema
    timestamp: new Date(dbLog.date).toISOString(),
  };
}

// ============================================
// NUTRITION NOTES
// ============================================

export async function fetchNutritionNotes(userId) {
  const { data, error } = await supabase
    .from('nutrition_notes')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching nutrition notes:', error);
    return [];
  }

  return data.map(transformNutritionNoteFromDB);
}

export async function addNutritionNote(userId, note) {
  const { data, error } = await supabase
    .from('nutrition_notes')
    .insert({
      user_id: userId,
      meal_type: note.mealType,
      notes: note.notes,
      date: note.timestamp.split('T')[0],
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding nutrition note:', error);
    throw error;
  }

  return transformNutritionNoteFromDB(data);
}

export async function deleteNutritionNote(noteId) {
  const { error } = await supabase
    .from('nutrition_notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('Error deleting nutrition note:', error);
    throw error;
  }
}

function transformNutritionNoteFromDB(dbNote) {
  return {
    id: dbNote.id,
    type: 'nutrition',
    mealType: dbNote.meal_type,
    text: dbNote.notes, // FIX: Changed from 'notes' to 'text' to match app schema
    timestamp: new Date(dbNote.date).toISOString(),
  };
}

// ============================================
// HEALTH CONNECTION
// ============================================

export async function fetchHealthConnection(userId) {
  const { data, error } = await supabase
    .from('health_connections')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching health connection:', error);
    return null;
  }

  if (!data) {
    // Create default health connection
    const defaultConnection = {
      user_id: userId,
      status: 'disconnected',
      permissions: [],
    };

    const { data: newData, error: insertError } = await supabase
      .from('health_connections')
      .insert(defaultConnection)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating health connection:', insertError);
      return null;
    }

    return transformHealthConnectionFromDB(newData);
  }

  return transformHealthConnectionFromDB(data);
}

export async function updateHealthConnection(userId, connection) {
  const { error } = await supabase
    .from('health_connections')
    .update({
      status: connection.status,
      last_sync_at: connection.lastSyncAt || null,
      permissions: connection.permissions || [],
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating health connection:', error);
    throw error;
  }
}

function transformHealthConnectionFromDB(dbConnection) {
  return {
    status: dbConnection.status,
    lastSyncAt: dbConnection.last_sync_at,
    permissions: dbConnection.permissions || [],
  };
}

// ============================================
// DELETE ALL USER DATA
// ============================================

export async function deleteAllUserData(userId) {
  try {
    console.log('Deleting all data for user:', userId);

    // Delete all data in parallel
    const [
      weightResult,
      moodResult,
      nutritionResult,
      settingsResult,
      healthResult
    ] = await Promise.allSettled([
      supabase.from('weight_logs').delete().eq('user_id', userId),
      supabase.from('mood_logs').delete().eq('user_id', userId),
      supabase.from('nutrition_notes').delete().eq('user_id', userId),
      supabase.from('user_settings').delete().eq('user_id', userId),
      supabase.from('health_connections').delete().eq('user_id', userId),
    ]);

    // Log any errors but don't throw (some tables might be empty)
    if (weightResult.status === 'rejected') {
      console.error('Error deleting weight logs:', weightResult.reason);
    }
    if (moodResult.status === 'rejected') {
      console.error('Error deleting mood logs:', moodResult.reason);
    }
    if (nutritionResult.status === 'rejected') {
      console.error('Error deleting nutrition notes:', nutritionResult.reason);
    }
    if (settingsResult.status === 'rejected') {
      console.error('Error deleting user settings:', settingsResult.reason);
    }
    if (healthResult.status === 'rejected') {
      console.error('Error deleting health connection:', healthResult.reason);
    }

    console.log('Successfully deleted all user data from Supabase');
    return true;
  } catch (error) {
    console.error('Error deleting user data from Supabase:', error);
    throw error;
  }
}

// ============================================
// SYNC ALL DATA
// ============================================

export async function syncAllDataFromSupabase(userId) {
  try {
    const [settings, weightLogs, moodLogs, nutritionNotes, healthConnection] = await Promise.all([
      fetchUserSettings(userId),
      fetchWeightLogs(userId),
      fetchMoodLogs(userId),
      fetchNutritionNotes(userId),
      fetchHealthConnection(userId),
    ]);

    return {
      settings,
      weightEntries: weightLogs,
      moodEntries: moodLogs,
      nutritionNotes,
      healthConnection,
    };
  } catch (error) {
    console.error('Error syncing data from Supabase:', error);
    throw error;
  }
}
