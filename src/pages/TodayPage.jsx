import { useState } from 'react';
import { Scale, Smile, FileText, Plus } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import TimelineItem from '../components/TimelineItem';
import EmptyState from '../components/EmptyState';
import AppleHealthStatusCard from '../components/AppleHealthStatusCard';
import WeightLogSheet from '../components/WeightLogSheet';
import MoodLogSheet from '../components/MoodLogSheet';
import NutritionNoteSheet from '../components/NutritionNoteSheet';
import {
  useWeightEntries,
  useMoodEntries,
  useNutritionEntries,
  useSettings,
} from '../store/useHealthStore';
import {
  calculateWeightStats,
  getTodayEntries,
  formatWeight,
  MOOD_EMOJIS,
  MEAL_ICONS,
} from '../lib/utils';

export default function TodayPage() {
  const [weightSheetOpen, setWeightSheetOpen] = useState(false);
  const [moodSheetOpen, setMoodSheetOpen] = useState(false);
  const [nutritionSheetOpen, setNutritionSheetOpen] = useState(false);

  const weightEntries = useWeightEntries();
  const moodEntries = useMoodEntries();
  const nutritionEntries = useNutritionEntries();
  const settings = useSettings();
  const units = settings?.units || 'kg';

  // Calculate stats
  const weightStats = calculateWeightStats(weightEntries);

  const latestMood = moodEntries[0];
  const latestNutrition = nutritionEntries[0];

  // Get today's timeline
  const allToday = [
    ...getTodayEntries(weightEntries).map((e) => ({ ...e, type: 'weight' })),
    ...getTodayEntries(moodEntries).map((e) => ({ ...e, type: 'mood' })),
    ...getTodayEntries(nutritionEntries).map((e) => ({ ...e, type: 'nutrition' })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="page page-today">
      <h1 className="page-title">Today</h1>

      {/* Dashboard Cards */}
      <div className="dashboard-grid">
        {/* Weight Card */}
        <MetricCard
          icon={<Scale size={24} />}
          title="Weight"
          value={weightStats.latest ? formatWeight(weightStats.latest, units) : 'No data'}
          subtitle={
            weightStats.sevenDayAvg
              ? `7d avg: ${formatWeight(weightStats.sevenDayAvg, units)}`
              : null
          }
          trend={
            weightStats.change
              ? {
                  type: weightStats.change > 0 ? 'up' : 'down',
                  text: `${Math.abs(weightStats.change).toFixed(1)} ${units} vs avg`,
                }
              : null
          }
          action={
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setWeightSheetOpen(true)}
            >
              Log Weight
            </button>
          }
        />

        {/* Mood Card */}
        <MetricCard
          icon={<Smile size={24} />}
          title="Mood"
          value={
            latestMood ? (
              <span style={{ fontSize: '2.5rem' }}>{MOOD_EMOJIS[latestMood.moodScore]}</span>
            ) : (
              'No data'
            )
          }
          subtitle={latestMood ? `${latestMood.moodScore}/5` : null}
          action={
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setMoodSheetOpen(true)}
            >
              Log Mood
            </button>
          }
        />

        {/* Nutrition Card */}
        <MetricCard
          icon={<FileText size={24} />}
          title="Nutrition"
          value={nutritionEntries.length}
          subtitle="notes logged"
          action={
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setNutritionSheetOpen(true)}
            >
              Add Note
            </button>
          }
        />
      </div>

      {/* Apple Health Status */}
      <AppleHealthStatusCard />

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <button
            className="quick-action-btn"
            onClick={() => setWeightSheetOpen(true)}
          >
            <Scale size={24} />
            <span>Log Weight</span>
          </button>
          <button
            className="quick-action-btn"
            onClick={() => setMoodSheetOpen(true)}
          >
            <Smile size={24} />
            <span>Log Mood</span>
          </button>
          <button
            className="quick-action-btn"
            onClick={() => setNutritionSheetOpen(true)}
          >
            <Plus size={24} />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Today's Timeline */}
      <div className="timeline-section">
        <h2 className="section-title">Today's Activity</h2>

        {allToday.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No activity yet"
            description="Start logging to see your daily timeline"
          />
        ) : (
          <div className="timeline-list">
            {allToday.map((entry) => {
              let icon, title, snippet;

              if (entry.type === 'weight') {
                icon = '⚖️';
                title = `Weight: ${formatWeight(entry.valueKg, units)}`;
                snippet = entry.note;
              } else if (entry.type === 'mood') {
                icon = MOOD_EMOJIS[entry.moodScore];
                title = `Mood: ${entry.moodScore}/5`;
                snippet = entry.note || entry.tags?.join(', ');
              } else if (entry.type === 'nutrition') {
                icon = entry.mealType ? MEAL_ICONS[entry.mealType] : '🍽️';
                title = entry.mealType ? entry.mealType.charAt(0).toUpperCase() + entry.mealType.slice(1) : 'Nutrition Note';
                snippet = entry.text;
              }

              return (
                <TimelineItem
                  key={entry.id}
                  icon={icon}
                  title={title}
                  time={entry.timestamp}
                  snippet={snippet}
                  type={entry.type}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Log Sheets */}
      <WeightLogSheet
        isOpen={weightSheetOpen}
        onClose={() => setWeightSheetOpen(false)}
      />
      <MoodLogSheet
        isOpen={moodSheetOpen}
        onClose={() => setMoodSheetOpen(false)}
      />
      <NutritionNoteSheet
        isOpen={nutritionSheetOpen}
        onClose={() => setNutritionSheetOpen(false)}
      />
    </div>
  );
}
