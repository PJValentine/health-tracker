import { useMemo } from 'react';
import { formatDate, formatWeight } from '../lib/utils';
import { useSettings } from '../store/useHealthStore';

export default function WeightChart({ entries }) {
  const settings = useSettings();
  const units = settings?.units || 'kg';

  const chartData = useMemo(() => {
    if (!entries || entries.length === 0) return null;

    // Sort by date ascending
    const sorted = [...entries].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Get last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filtered = sorted.filter(
      (entry) => new Date(entry.timestamp) >= thirtyDaysAgo
    );

    if (filtered.length === 0) return null;

    const weights = filtered.map((e) => e.valueKg);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = max - min || 1;

    return {
      entries: filtered,
      min,
      max,
      range,
    };
  }, [entries]);

  if (!chartData) {
    return (
      <div className="chart-empty">
        <p>Not enough data to display chart. Log more weights to see your progress!</p>
      </div>
    );
  }

  const { entries: data, min, max, range } = chartData;

  const width = 800; // pixels for viewBox
  const height = 300; // pixels for viewBox
  const padding = 40;

  // Calculate points for SVG polyline
  const points = data
    .map((entry, index) => {
      const x = (index / (data.length - 1 || 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((entry.valueKg - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="weight-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="chart-svg"
      >
        {/* Grid lines */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#E8D4BC"
          strokeWidth="2"
        />

        {/* Weight line */}
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((entry, index) => {
          const x = (index / (data.length - 1 || 1)) * (width - padding * 2) + padding;
          const y = height - padding - ((entry.valueKg - min) / range) * (height - padding * 2);

          return (
            <circle
              key={entry.id}
              cx={x}
              cy={y}
              r="6"
              fill="var(--color-primary)"
            />
          );
        })}
      </svg>

      <div className="chart-labels">
        <div className="chart-label-left">
          <span className="label-value">{formatWeight(min, units)}</span>
        </div>
        <div className="chart-label-center">
          <span className="label-text">Last 30 Days</span>
        </div>
        <div className="chart-label-right">
          <span className="label-value">{formatWeight(max, units)}</span>
        </div>
      </div>
    </div>
  );
}
