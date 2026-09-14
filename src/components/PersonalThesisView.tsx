import React, { useState, useEffect } from 'react';
import { UserThesis } from '../types';
import { FileText, CheckCircle2, AlertTriangle, ShieldAlert, Save, Sparkles, RefreshCw } from 'lucide-react';

interface PersonalThesisViewProps {
  ticker: string;
}

export const PersonalThesisView: React.FC<PersonalThesisViewProps> = ({ ticker }) => {
  const [thesis, setThesis] = useState<UserThesis | null>(null);
  const [thesisInput, setThesisInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const fetchThesis = async () => {
      try {
        const res = await fetch(`/api/stocks/${ticker}/thesis`);
        if (res.ok) {
          const data = await res.json();
          if (data.thesis) {
            setThesis(data.thesis);
            setThesisInput(data.thesis.thesisText);
          } else {
            setThesis(null);
            setThesisInput('');
          }
        }
      } catch (err) {
        console.error('Failed to load thesis:', err);
      }
    };
    fetchThesis();
  }, [ticker]);

  const handleSaveThesis = async () => {
    if (!thesisInput.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/stocks/${ticker}/thesis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thesisText: thesisInput }),
      });
      if (res.ok) {
        const data = await res.json();
        setThesis(data.thesis);
        setStatusMsg('Thesis saved and continuous AI monitoring activated.');
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to save thesis:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: 'VALID' | 'WARNING' | 'INVALIDATED') => {
    if (status === 'VALID') {
      return (
        <span className="flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold font-mono text-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>THESIS VALID (PILARS INTACT)</span>
        </span>
      );
    }
    if (status === 'WARNING') {
      return (
        <span className="flex items-center space-x-1.5 px-3 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold font-mono text-xs">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>THESIS WARNING (MARGIN HEADWIND DETECTED)</span>
        </span>
      );
    }
    return (
      <span className="flex items-center space-x-1.5 px-3 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold font-mono text-xs">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>THESIS INVALIDATED</span>
      </span>
    );
  };

  return (
    <div id="personal-thesis-view" className="space-y-6">
      {/* Top Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>CONTINUOUS THESIS VALIDATION ENGINE</span>
          </div>
          <h3 className="text-xl font-black font-mono text-white mt-1">
            Investment Thesis for {ticker}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1 max-w-xl">
            Record your rationale for owning this business. The AI agent continuously cross-checks incoming earnings reports and news against your core assumptions.
          </p>
        </div>

        {thesis && (
          <div className="self-start md:self-auto">
            {getStatusBadge(thesis.status)}
          </div>
        )}
      </div>

      {/* Thesis Editor & Live Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Editor Input */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-2">
            YOUR CORE INVESTMENT THESIS:
          </label>
          <textarea
            id="thesis-input-textarea"
            rows={5}
            value={thesisInput}
            onChange={(e) => setThesisInput(e.target.value)}
            placeholder={`Example: Expecting 18% revenue CAGR over the next 2 years driven by retail store additions and 5G enterprise monetization while holding net debt to EBITDA under 1.5x...`}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] font-mono text-emerald-400">{statusMsg}</span>
            <button
              id="save-thesis-btn"
              onClick={handleSaveThesis}
              disabled={isSaving || !thesisInput.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save & Monitor Thesis'}</span>
            </button>
          </div>
        </div>

        {/* Right: Validation Evidence */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
              AI CONTINUOUS CHECKPOINTS
            </div>

            {thesis ? (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1.5">
                    Supporting Pillars:
                  </div>
                  <ul className="space-y-1.5">
                    {thesis.supportingPillars.map((p, i) => (
                      <li key={i} className="flex items-start space-x-2 text-slate-300 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase mb-1.5">
                    Active Watch Warnings:
                  </div>
                  <ul className="space-y-1.5">
                    {thesis.warningFlags.map((w, i) => (
                      <li key={i} className="flex items-start space-x-2 text-slate-300 text-[11px]">
                        <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-xs font-mono text-slate-400">
                No thesis recorded yet for {ticker}. Write your thesis on the left and save it to activate 24/7 autonomous monitoring.
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500">
            Trigger: Dispatches notification if 2+ core pillars fail.
          </div>
        </div>
      </div>
    </div>
  );
};
