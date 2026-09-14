import React from 'react';
import { NewsItem } from '../types';
import { Newspaper, CheckCircle, AlertTriangle, ShieldCheck, Flame, ExternalLink } from 'lucide-react';

interface NewsIntelligenceViewProps {
  news: NewsItem[];
  newsScore: number;
}

export const NewsIntelligenceView: React.FC<NewsIntelligenceViewProps> = ({
  news,
  newsScore,
}) => {
  return (
    <div id="news-intelligence-view" className="space-y-6">
      {/* Top Banner: News Sentiment Score */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            <Newspaper className="w-4 h-4" />
            <span>AI NEWS INTELLIGENCE & SENTIMENT IMPACT ENGINE</span>
          </div>
          <div className="flex items-baseline space-x-3 mt-1">
            <span className="text-3xl font-black font-mono text-white">{newsScore}</span>
            <span className="text-sm font-mono text-slate-400">/100 News Sentiment Score</span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Verified corporate actions, earnings releases, and regulatory filings analyzed for direct business impact.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 font-mono text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">All feeds verified against official regulatory wires.</span>
        </div>
      </div>

      {/* News Feed List */}
      <div className="space-y-4">
        {news.map((item) => (
          <div
            key={item.id}
            id={`news-item-${item.id}`}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
          >
            {/* Header: Sentiment, Impact, Affected Area, Source */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/70">
              <div className="flex items-center space-x-2">
                {/* Sentiment Pill */}
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                  item.sentiment === 'Positive'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : item.sentiment === 'Negative'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {item.sentiment} Sentiment
                </span>

                {/* Impact Badge */}
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center space-x-1 ${
                  item.impact === 'High'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}>
                  <Flame className="w-3 h-3" />
                  <span>{item.impact} Impact</span>
                </span>

                {/* Affected Area */}
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  Target: {item.affectedArea}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                <span>{item.source}</span>
                <span>•</span>
                <span>{item.publishedAt}</span>
                {item.isVerified && (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" title="Verified source" />
                )}
              </div>
            </div>

            {/* Headline */}
            <h4 className="text-base font-bold text-white mt-3 leading-snug">
              {item.headline}
            </h4>

            {/* Why It Matters (The Core Value-Add) */}
            <div className="mt-3 p-3 bg-slate-950/80 rounded-lg border border-slate-800/90 text-xs">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>WHY THIS MATTERS FOR VALUATION & CASH FLOW:</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-mono text-xs">
                {item.whyItMatters}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
