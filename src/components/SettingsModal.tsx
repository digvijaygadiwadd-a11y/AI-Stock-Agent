import React, { useState } from 'react';
import { Settings2, X, RotateCcw, Check } from 'lucide-react';
import { ScoreWeights } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: ScoreWeights;
  onSaveWeights: (newWeights: ScoreWeights) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  weights,
  onSaveWeights,
}) => {
  const [localWeights, setLocalWeights] = useState<ScoreWeights>({ ...weights });

  if (!isOpen) return null;

  const total =
    localWeights.fundamental +
    localWeights.technical +
    localWeights.valuation +
    localWeights.news +
    localWeights.risk;

  const handleReset = () => {
    const defaultWeights: ScoreWeights = {
      fundamental: 30,
      technical: 25,
      valuation: 20,
      news: 15,
      risk: 10,
    };
    setLocalWeights(defaultWeights);
  };

  const handleSave = () => {
    if (total === 100) {
      onSaveWeights(localWeights);
      onClose();
    }
  };

  return (
    <div id="settings-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div id="settings-modal-content" className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl font-mono">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Settings2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Scoring Weights Configuration
            </h3>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          Customize the mathematical weights for the Overall Score calculation. The 5 pillars must sum to exactly 100%.
        </p>

        <div className="space-y-4 my-6 text-xs">
          {/* Fundamental */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300">Fundamental Weight:</span>
              <span className="text-emerald-400 font-bold">{localWeights.fundamental}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={localWeights.fundamental}
              onChange={(e) => setLocalWeights({ ...localWeights, fundamental: Number(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Technical */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300">Technical Weight:</span>
              <span className="text-cyan-400 font-bold">{localWeights.technical}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={localWeights.technical}
              onChange={(e) => setLocalWeights({ ...localWeights, technical: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Valuation */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300">Valuation Weight:</span>
              <span className="text-amber-400 font-bold">{localWeights.valuation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={localWeights.valuation}
              onChange={(e) => setLocalWeights({ ...localWeights, valuation: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          {/* News */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300">News Sentiment Weight:</span>
              <span className="text-slate-200 font-bold">{localWeights.news}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={localWeights.news}
              onChange={(e) => setLocalWeights({ ...localWeights, news: Number(e.target.value) })}
              className="w-full accent-slate-400"
            />
          </div>

          {/* Risk */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300">Risk Safety Weight:</span>
              <span className="text-purple-400 font-bold">{localWeights.risk}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={localWeights.risk}
              onChange={(e) => setLocalWeights({ ...localWeights, risk: Number(e.target.value) })}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Total Sum indicator */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Total Pillar Weight:</span>
            <span className={`font-black text-sm ${total === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {total}% {total === 100 ? '✓ (Valid)' : '(Must equal 100%)'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
          <button
            id="reset-weights-btn"
            onClick={handleReset}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex space-x-2">
            <button
              id="cancel-weights-btn"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-weights-btn"
              onClick={handleSave}
              disabled={total !== 100}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Weights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
