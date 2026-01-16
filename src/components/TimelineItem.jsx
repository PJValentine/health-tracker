import { formatTime } from '../lib/utils';

export default function TimelineItem({ icon, title, time, snippet, type, onDelete }) {
  return (
    <div className={`timeline-item timeline-item-${type}`}>
      <div className="timeline-icon">{icon}</div>
      <div className="timeline-content">
        <div className="timeline-header">
          <span className="timeline-title">{title}</span>
          <span className="timeline-time">{formatTime(time)}</span>
        </div>
        {snippet && <div className="timeline-snippet">{snippet}</div>}
      </div>
      {onDelete && (
        <button
          className="timeline-delete"
          onClick={onDelete}
          aria-label="Delete entry"
        >
          ×
        </button>
      )}
    </div>
  );
}
