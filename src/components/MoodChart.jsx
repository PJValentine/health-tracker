import { useMemo } from 'react';
import { MOOD_EMOJIS, MOOD_COLORS } from '../lib/utils';
import { formatDate } from '../lib/utils';

export default function MoodChart({ entries }) {
  const chartData = useMemo(() => {
    if (!entries || entries.length === 0) return null;

    // Sort by date ascending
    const sorted = [...entries].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Get last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const filtered = sorted.filter(
      (entry) => new Date(entry.timestamp) >= fourteenDaysAgo
    );

    return filtered.length > 0 ? filtered : null;
  }, [entries]);

  if (!chartData) {
    return (
      <div className="chart-empty">
        <p>Not enough data to display chart. Log your mood to see trends!</p>
      </div>
    );
  }

  return (
    <div className="mood-chart">
      <div className="mood-chart-bars">
        {chartData.map((entry) => {
          const heightPercent = (entry.moodScore / 5) * 100;

          return (
            <div key={entry.id} className="mood-bar-container">
              <div
                className="mood-bar"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: MOOD_COLORS[entry.moodScore],
                }}
                title={`${formatDate(entry.timestamp, 'MMM d')}: ${entry.moodScore}/5`}
              >
                <span className="mood-bar-emoji">{MOOD_EMOJIS[entry.moodScore]}</span>
              </div>
              <div className="mood-bar-label">
                {formatDate(entry.timestamp, 'MMM d')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
