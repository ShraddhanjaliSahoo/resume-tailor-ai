import { useState } from 'react';
import { Search, Calendar, Award, Trash2, ArrowUpRight, Database, FolderOpen, AlertCircle } from 'lucide-react';
import type { TailoringResult } from '../utils/gemini';

export interface HistoryItem {
  id: string;
  jobTitle: string;
  jobDescription: string;
  tailoredResume: TailoringResult;
  timestamp: any; // Date, number, or Firestore Timestamp
}

interface HistoryDashboardProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export default function HistoryDashboard({ history, onSelect, onDelete, isLoading }: HistoryDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Format timestamp safely
  const formatDate = (ts: any) => {
    if (!ts) return '';
    let date: Date;
    if (ts.seconds) {
      // Firestore Timestamp
      date = new Date(ts.seconds * 1000);
    } else {
      date = new Date(ts);
    }
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredHistory = history.filter((item) =>
    item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tailoredResume.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" /> Optimization History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access and manage your previously tailored resumes and job descriptions.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by job title or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Loading history records...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          <FolderOpen className="w-10 h-10 text-slate-650 mb-3" />
          <p className="text-sm font-semibold text-slate-400">No records found</p>
          <p className="text-xs text-slate-500 text-center max-w-xs mt-1">
            {searchQuery
              ? 'No history matches your search query. Try typing something else.'
              : 'Pasted job descriptions and optimized versions will be listed here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHistory.map((item) => {
            const atsScore = item.tailoredResume.atsAfter || 0;
            const scoreColorClass =
              atsScore >= 80
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : atsScore >= 60
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

            return (
              <div
                key={item.id}
                className="group relative p-5 bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:shadow-indigo-950/[0.05]"
              >
                <div className="space-y-3">
                  {/* Meta: Date & Score */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(item.timestamp)}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-full ${scoreColorClass}`}>
                      {atsScore}% ATS Match
                    </span>
                  </div>

                  {/* Job Title */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {item.jobTitle}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.jobDescription}
                    </p>
                  </div>

                  {/* Skills/Keywords summary */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.tailoredResume.matchedKeywords.slice(0, 3).map((kw) => (
                      <span
                        key={kw}
                        className="px-1.5 py-0.5 text-[9px] bg-slate-950/60 text-slate-450 border border-slate-850 rounded"
                      >
                        {kw}
                      </span>
                    ))}
                    {item.tailoredResume.matchedKeywords.length > 3 && (
                      <span className="text-[9px] text-slate-650 font-medium self-center pl-1">
                        +{item.tailoredResume.matchedKeywords.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-slate-800/60 mt-4 pt-3">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-450 hover:bg-slate-950/50 transition-all cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelect(item)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    <span>View Optimization</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
