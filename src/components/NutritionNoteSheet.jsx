import { useState } from 'react';
import { X } from 'lucide-react';
import { useHealthStore } from '../store/useHealthStore';
import { toast } from '../lib/toast';
import { MEAL_TYPES, MEAL_ICONS } from '../lib/utils';

export default function NutritionNoteSheet({ isOpen, onClose }) {
  const { addNutritionEntry } = useHealthStore();

  const [text, setText] = useState('');
  const [mealType, setMealType] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setLoading(true);

    try {
      addNutritionEntry({
        text: text.trim(),
        mealType: mealType || null,
      });

      toast.success('Nutrition note added');

      // Reset form
      setText('');
      setMealType('');
      onClose();
    } catch (error) {
      toast.error('Failed to add note');
      console.error(error);
    } finally {
      setLoading(false);
    }
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
          <h2>Add Nutrition Note</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sheet-body">
          <div className="form-group">
            <label htmlFor="nutrition-text" className="form-label">
              What did you eat?
            </label>
            <textarea
              id="nutrition-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your meal or snack..."
              className="form-textarea"
              rows={4}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Meal Type (optional)</label>
            <div className="meal-type-selector">
              {Object.entries(MEAL_TYPES).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`meal-type-option ${mealType === key ? 'selected' : ''}`}
                  onClick={() => setMealType(mealType === key ? '' : key)}
                >
                  <span className="meal-icon">{MEAL_ICONS[key]}</span>
                  <span className="meal-label">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Time</label>
            <div className="form-text">Now ({new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })})</div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Note'}
          </button>
        </form>
      </div>
    </div>
  );
}
