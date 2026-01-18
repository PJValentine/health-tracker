import { useState } from 'react';
import { X } from 'lucide-react';
import { useHealthStore } from '../store/useHealthStore';
import { toast } from '../lib/toast';
import { MOOD_EMOJIS, MOOD_LABELS } from '../lib/utils';

const MOOD_TAGS = [
  'energized',
  'productive',
  'calm',
  'stressed',
  'tired',
  'anxious',
  'happy',
  'focused',
];

export default function MoodLogSheet({ isOpen, onClose }) {
  const { addMoodEntry } = useHealthStore();

  const [moodScore, setMoodScore] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate mood score
    if (!moodScore || moodScore < 1 || moodScore > 5) {
      toast.error('Please select a mood (1-5)');
      return;
    }

    // Note length limit
    if (note.trim().length > 500) {
      toast.error('Note must be less than 500 characters');
      return;
    }

    setLoading(true);

    try {
      addMoodEntry({
        moodScore,
        tags: selectedTags,
        note: note.trim(),
      });

      toast.success('Mood logged successfully');

      // Reset form
      setMoodScore(null);
      setSelectedTags([]);
      setNote('');
      onClose();
    } catch (error) {
      toast.error('Failed to log mood. Please try again.');
      console.error('Mood log error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="sheet-overlay" onClick={handleOverlayClick}>
      <div className="sheet-content">
        <div className="sheet-header">
          <h2>Log Mood</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sheet-body">
          <div className="form-group">
            <label className="form-label">How are you feeling?</label>
            <div className="mood-selector">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  className={`mood-option ${moodScore === score ? 'selected' : ''}`}
                  onClick={() => setMoodScore(score)}
                  aria-label={MOOD_LABELS[score]}
                >
                  <span className="mood-emoji">{MOOD_EMOJIS[score]}</span>
                  <span className="mood-label">{MOOD_LABELS[score]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags (optional)</label>
            <div className="tag-selector">
              {MOOD_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-option ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="mood-note" className="form-label">
              Note (optional)
            </label>
            <textarea
              id="mood-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind?"
              className="form-textarea"
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !moodScore}
          >
            {loading ? 'Saving...' : 'Save Mood'}
          </button>
        </form>
      </div>
    </div>
  );
}
