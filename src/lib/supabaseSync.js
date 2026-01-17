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
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "no rows returned"
    console.error('Error fetching settings:', error);
    return null;
  }

  if (!data) {
    // Create default settings for new user
    const defaultSettings = {
      user_id: userId,
      units: 'kg',
      theme: {
        primaryColor: '#2D5F4F',
        primaryDark: '#1F4438',
        secondaryColor: '#E8A87C',
        accentCoral: '#F4A896',
        beige100: '#FBF8F3',
        beige200: '#F5E6D3',
        beige300: '#E8D4BC',
      },
      background_image: {
        url: '',
        opacity: 0.1,
        fit: 'cover',
        position: 'center',
        enabled: false,
      },
      hero_image: {
        url: '',
        opacity: 0.3,
        fit: 'cover',
        position: 'center',
        enabled: false,
      },
      card_image: {
        url: '',
        opacity: 0.05,
        fit: 'cover',
        position: 'center',
        enabled: false,
      },
    };

    const { data: newData, error: insertError } = await supabase
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating settings:', insertError);
      return null;
    }

    return transformSettingsFromDB(newData);
  }

  return transformSettingsFromDB(data);
}

export async function updateUserSettings(userId, settings) {
  const { error } = await supabase
    .from('user_settings')
    .update({
      units: settings.units,
      name: settings.name,
      theme: settings.theme,
      background_image: settings.backgroundImage,
      hero_image: settings.heroImage,
      card_image: settings.cardImage,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

function transformSettingsFromDB(dbSettings) {
  return {
    units: dbSettings.units,
    name: dbSettings.name,
    theme: dbSettings.theme,
    backgroundImage: dbSettings.background_image,
    heroImage: dbSettings.hero_image,
    cardImage: dbSettings.card_image,
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
    weight: parseFloat(dbLog.weight),
    timestamp: new Date(dbLog.date).toISOString(),
    notes: dbLog.notes,
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
    mood: dbLog.mood,
    tags: dbLog.tags || [],
    notes: dbLog.notes,
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
    notes: dbNote.notes,
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
