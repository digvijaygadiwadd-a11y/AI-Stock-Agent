import React, { useState, useEffect } from 'react';
import { BellRing, Plus, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { AlertRule } from '../types';

interface AlertsViewProps {
  currentTicker: string;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ currentTicker }) => {
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [newTicker, setNewTicker] = useState(currentTicker);
  const [newType, setNewType] = useState<string>('PRICE_ABOVE');
  const [newThreshold, setNewThreshold] = useState('3000');
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setNewTicker(currentTicker);
  }, [currentTicker]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: newTicker,
          type: newType,
          threshold: Number(newThreshold),
          note: newNote || `${newType} trigger for ${newTicker}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts([data.alert, ...alerts]);
        setNewNote('');
      }
    } catch (err) {
      console.error('Failed to create alert:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="alerts-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <BellRing className="w-4 h-4" />
            <span>24/7 AUTONOMOUS MONITORING & ALERT DISPATCH</span>
          </div>
          <h3 className="text-xl font-black font-mono text-white mt-1">
            Active Multi-Vector Alert Triggers
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Monitors price levels, technical momentum indicators, fundamental score drift, and breaking news headlines.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
          Active Monitors: <span className="text-emerald-400 font-bold">{alerts.length} Rules</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Alert Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>CREATE NEW ALERT RULE</span>
          </h4>

          <form onSubmit={handleCreateAlert} className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Security Ticker:</label>
              <input
                id="alert-ticker-input"
                type="text"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Trigger Type:</label>
              <select
                id="alert-type-select"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
              >
                <option value="PRICE_ABOVE">Price Above Threshold</option>
                <option value="PRICE_BELOW">Price Below Threshold</option>
                <option value="RSI_OVERBOUGHT">RSI Overbought (&gt; 70)</option>
                <option value="RSI_OVERSOLD">RSI Oversold (&lt; 30)</option>
                <option value="SCORE_CHANGE">Overall Score Drops Below</option>
                <option value="NEGATIVE_NEWS">High-Impact Negative News</option>
                <option value="THESIS_INVALIDATED">Investment Thesis Warning</option>
              </select>
            </div>

            {newType !== 'NEGATIVE_NEWS' && newType !== 'THESIS_INVALIDATED' && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Threshold Value:</label>
                <input
                  id="alert-threshold-input"
                  type="number"
                  step="any"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Note / Description:</label>
              <input
                id="alert-note-input"
                type="text"
                placeholder="e.g. Exit 50% position on resistance hit"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
              />
            </div>

            <button
              id="submit-alert-rule-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors"
            >
              {isSubmitting ? 'Creating Rule...' : 'Deploy Autonomous Alert'}
            </button>
          </form>
        </div>

        {/* Active Rules List */}
        <div className="lg:col-span-2 space-y-3">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              id={`alert-card-${alt.id}`}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-mono text-xs"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-black text-white">{alt.ticker}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 font-bold">
                    {alt.type.replace('_', ' ')}
                  </span>
                  {alt.threshold !== undefined && (
                    <span className="text-emerald-400 font-bold">
                      @ {alt.threshold}
                    </span>
                  )}
                </div>
                <div className="text-slate-300 text-xs mt-1">
                  {alt.note}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Created: {alt.createdAt} {alt.lastTriggeredAt ? `• Triggered: ${alt.lastTriggeredAt}` : ''}
                </div>
              </div>

              <div className="self-start sm:self-auto">
                {alt.isTriggered ? (
                  <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>TRIGGERED</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-slate-950 text-emerald-400 border border-slate-800 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>ACTIVE POLLING</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
