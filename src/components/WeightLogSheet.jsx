import { useState } from 'react';
import { X } from 'lucide-react';
import { useHealthStore } from '../store/useHealthStore';
import { toast } from '../lib/toast';
import { formatWeight, kgToLb, lbToKg } from '../lib/utils';

export default function WeightLogSheet({ isOpen, onClose }) {
  const { state, addWeightEntry } = useHealthStore();
  const units = state.settings?.units || 'kg';

  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    setLoading(true);

    try {
      // Convert to kg if needed
      const valueKg = units === 'lb' ? lbToKg(weightValue) : weightValue;

      addWeightEntry({
        valueKg,
        note: note.trim(),
      });

      toast.success('Weight logged successfully');

      // Reset form
      setWeight('');
      setNote('');
      onClose();
    } catch (error) {
      toast.error('Failed to log weight');
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
          <h2>Log Weight</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sheet-body">
          <div className="form-group">
            <label htmlFor="weight" className="form-label">
              Weight ({units})
            </label>
            <input
              type="number"
              id="weight"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={units === 'kg' ? '75.0' : '165.0'}
              className="form-input"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="note" className="form-label">
              Note (optional)
            </label>
            <input
              type="text"
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Morning weight after workout"
              className="form-input"
            />
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
            {loading ? 'Saving...' : 'Save Weight'}
          </button>
        </form>
      </div>
    </div>
  );
}
