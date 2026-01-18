import { format, formatDistanceToNow, isToday, startOfDay, subDays } from 'date-fns';

// Date formatting utilities
export function formatDate(date, formatStr = 'MMM d, yyyy') {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

export function formatTime(date) {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'h:mm a');
}

export function formatRelativeTime(date) {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isToday(dateObj)) {
    return `Today at ${formatTime(dateObj)}`;
  }

  return formatDistanceToNow(dateObj, { addSuffix: true });
}

// Weight conversion utilities
export function kgToLb(kg) {
  const value = parseFloat(kg);
  if (isNaN(value) || value == null) return 0;
  return Math.round(value * 2.20462 * 10) / 10;
}

export function lbToKg(lb) {
  const value = parseFloat(lb);
  if (isNaN(value) || value == null) return 0;
  return Math.round(value / 2.20462 * 10) / 10;
}

export function formatWeight(valueKg, units = 'kg') {
  const value = parseFloat(valueKg);
  if (isNaN(value) || value == null) {
    return units === 'lb' ? '-- lb' : '-- kg';
  }
  if (units === 'lb') {
    return `${kgToLb(value)} lb`;
  }
  return `${value} kg`;
}

// Mood utilities
export const MOOD_LABELS = {
  1: 'Very Bad',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

export const MOOD_EMOJIS = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
};

export const MOOD_COLORS = {
  1: '#ef4444', // red
  2: '#f97316', // orange
  3: '#eab308', // yellow
  4: '#84cc16', // lime
  5: '#22c55e', // green
};

// Meal type utilities
export const MEAL_TYPES = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export const MEAL_ICONS = {
  breakfast: '🍳',
  lunch: '🥗',
  dinner: '🍽️',
  snack: '🍎',
};

// Calculate statistics
export function calculateAverage(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  // Filter out invalid values
  const validNumbers = numbers.filter(n => {
    const parsed = parseFloat(n);
    return !isNaN(parsed) && parsed != null;
  }).map(n => parseFloat(n));

  if (validNumbers.length === 0) return 0;
  const sum = validNumbers.reduce((acc, n) => acc + n, 0);
  return Math.round((sum / validNumbers.length) * 10) / 10;
}

export function calculateWeightStats(weightEntries) {
  if (!weightEntries || weightEntries.length === 0) {
    return { latest: null, sevenDayAvg: null, change: null };
  }

  // Sort by date descending
  const sorted = [...weightEntries].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Parse and validate latest weight
  const latestWeight = sorted[0]?.valueKg;
  const latest = latestWeight != null ? parseFloat(latestWeight) : null;
  if (latest === null || isNaN(latest)) {
    return { latest: null, sevenDayAvg: null, change: null };
  }

  // Calculate 7-day average
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentWeights = sorted
    .filter((entry) => new Date(entry.timestamp) >= sevenDaysAgo)
    .map((e) => e.valueKg)
    .filter(w => w != null && !isNaN(parseFloat(w)));

  const sevenDayAvg =
    recentWeights.length > 0
      ? calculateAverage(recentWeights)
      : null;

  const change = latest && sevenDayAvg ? latest - sevenDayAvg : null;

  return { latest, sevenDayAvg, change };
}

// Get today's entries
export function getTodayEntries(entries) {
  if (!entries) return [];

  const today = startOfDay(new Date());

  return entries
    .filter((entry) => {
      const entryDate = startOfDay(new Date(entry.timestamp));
      return entryDate.getTime() === today.getTime();
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Calculate streak
export function calculateStreak(entries) {
  if (!entries || entries.length === 0) return 0;

  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  let streak = 0;
  let currentDate = startOfDay(new Date());

  for (const entry of sorted) {
    const entryDate = startOfDay(new Date(entry.timestamp));

    if (entryDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else if (entryDate.getTime() < currentDate.getTime()) {
      // Gap in entries - streak broken
      break;
    }
  }

  return streak;
}

// Classnames utility
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
