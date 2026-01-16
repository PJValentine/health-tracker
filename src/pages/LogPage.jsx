import { useState } from 'react';
import { Scale, Smile, FileText } from 'lucide-react';
import WeightLogSheet from '../components/WeightLogSheet';
import MoodLogSheet from '../components/MoodLogSheet';
import NutritionNoteSheet from '../components/NutritionNoteSheet';

export default function LogPage() {
  const [weightSheetOpen, setWeightSheetOpen] = useState(false);
  const [moodSheetOpen, setMoodSheetOpen] = useState(false);
  const [nutritionSheetOpen, setNutritionSheetOpen] = useState(false);

  return (
    <div className="page page-log">
      <h1 className="page-title">Quick Log</h1>
      <p className="page-description">Choose what you'd like to track</p>

      <div className="log-tiles">
        <button
          className="log-tile"
          onClick={() => setWeightSheetOpen(true)}
        >
          <div className="log-tile-icon">
            <Scale size={48} />
          </div>
          <h2 className="log-tile-title">Weight</h2>
          <p className="log-tile-description">Track your weight progress</p>
        </button>

        <button
          className="log-tile"
          onClick={() => setMoodSheetOpen(true)}
        >
          <div className="log-tile-icon">
            <Smile size={48} />
          </div>
          <h2 className="log-tile-title">Mood</h2>
          <p className="log-tile-description">How are you feeling today?</p>
        </button>

        <button
          className="log-tile"
          onClick={() => setNutritionSheetOpen(true)}
        >
          <div className="log-tile-icon">
            <FileText size={48} />
          </div>
          <h2 className="log-tile-title">Nutrition Note</h2>
          <p className="log-tile-description">Log what you ate</p>
        </button>
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
