import { useState } from 'react';
import { Search, Flame } from 'lucide-react';
import WeightChart from '../components/WeightChart';
import MoodChart from '../components/MoodChart';
import MetricCard from '../components/MetricCard';
import EmptyState from '../components/EmptyState';
import {
  useWeightEntries,
  useMoodEntries,
  useNutritionEntries,
} from '../store/useHealthStore';
import {
  calculateStreak,
  getTodayEntries,
  formatDate,
  formatRelativeTime,
  MEAL_TYPES,
  MEAL_ICONS,
} from '../lib/utils';
import { subDays } from 'date-fns';

export default function InsightsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mealTypeFilter, setMealTypeFilter] = useState('all');

  const weightEntries = useWeightEntries();
  const moodEntries = useMoodEntries();
  const nutritionEntries = useNutritionEntries();

  // Calculate consistency stats
  const sevenDaysAgo = subDays(new Date(), 7);
  const allEntries = [
    ...weightEntries,
    ...moodEntries,
    ...nutritionEntries,
  ];

  const thisWeekEntries = allEntries.filter(
    (e) => new Date(e.timestamp) >= sevenDaysAgo
  );

  const uniqueDaysThisWeek = new Set(
    thisWeekEntries.map((e) => formatDate(e.timestamp, 'yyyy-MM-dd'))
  ).size;

  const streak = calculateStreak(allEntries);
  const lastLogDate = allEntries[0] ? formatRelativeTime(allEntries[0].timestamp) : 'Never';

  // Filter nutrition entries
  const filteredNutrition = nutritionEntries.filter((entry) => {
    // FIX: Add null check for entry.text to prevent crash
    const text = entry.text || '';
    const matchesSearch = searchQuery === '' || text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMealType = mealTypeFilter === 'all' || entry.mealType === mealTypeFilter;
    return matchesSearch && matchesMealType;
  });

  return (
    <div className="page page-insights">
      <h1 className="page-title">Insights</h1>

      {/* Consistency Card */}
      <MetricCard
        icon={<Flame size={24} />}
        title="Consistency"
        value={`${uniqueDaysThisWeek}/7`}
        subtitle="days logged this week"
        trend={
          streak > 0
            ? {
                type: 'up',
                text: `${streak} day streak!`,
              }
            : null
        }
        className="consistency-card"
      />

      {/* Weight Chart */}
      <div className="insights-section">
        <h2 className="section-title">Weight Progress</h2>
        <div className="chart-container">
          <WeightChart entries={weightEntries} />
        </div>
      </div>

      {/* Mood Chart */}
      <div className="insights-section">
        <h2 className="section-title">Mood Trends</h2>
        <div className="chart-container">
          <MoodChart entries={moodEntries} />
        </div>
      </div>

      {/* Nutrition Notes List */}
      <div className="insights-section">
        <h2 className="section-title">Nutrition Notes</h2>

        <div className="notes-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="meal-filter">
            <button
              className={`filter-btn ${mealTypeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setMealTypeFilter('all')}
            >
              All
            </button>
            {Object.entries(MEAL_TYPES).map(([key, label]) => (
              <button
                key={key}
                className={`filter-btn ${mealTypeFilter === key ? 'active' : ''}`}
                onClick={() => setMealTypeFilter(key)}
              >
                {MEAL_ICONS[key]} {label}
              </button>
            ))}
          </div>
        </div>

        {filteredNutrition.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No nutrition notes"
            description={
              searchQuery || mealTypeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start logging meals to see them here'
            }
          />
        ) : (
          <div className="nutrition-notes-list">
            {filteredNutrition.map((entry) => (
              <div key={entry.id} className="nutrition-note-item">
                <div className="note-header">
                  {entry.mealType && (
                    <span className="note-meal-type">
                      {MEAL_ICONS[entry.mealType]} {MEAL_TYPES[entry.mealType]}
                    </span>
                  )}
                  <span className="note-date">{formatRelativeTime(entry.timestamp)}</span>
                </div>
                <div className="note-text">{entry.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
