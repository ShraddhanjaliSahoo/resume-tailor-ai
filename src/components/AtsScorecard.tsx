import { Target, TrendingUp, Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

interface AtsScorecardProps {
  scoreBefore: number;
  scoreAfter: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  insights: string;
}

export default function AtsScorecard({
  scoreBefore,
  scoreAfter,
  matchedKeywords,
  missingKeywords,
  insights,
}: AtsScorecardProps) {
  // Helpers to choose color scheme based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 stroke-emerald-500 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 stroke-amber-500 bg-amber-500/10';
    return 'text-rose-400 stroke-rose-500 bg-rose-500/10';
  };

  const scoreIncrease = Math.max(0, scoreAfter - scoreBefore);
  const strokeDashOffset = (score: number) => 251.2 - (251.2 * score) / 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Circle Scores */}
      <div className="lg:col-span-1 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative lights */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <h3 className="text-sm font-semibold text-slate-400 mb-6 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-indigo-400" /> ATS Optimization Score
        </h3>

        <div className="flex items-center gap-8 md:gap-12 lg:gap-8 xl:gap-12">
          {/* Before Score */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-500 mb-2 font-medium">Original Match</span>
            <div className="relative flex items-center justify-center w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" className="stroke-slate-800 fill-transparent" strokeWidth="6" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className={`fill-transparent transition-all duration-1000 ${getScoreColor(scoreBefore)}`}
                  strokeWidth="6"
                  strokeDasharray="251.2"
                  strokeDashoffset={strokeDashOffset(scoreBefore)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-200">{scoreBefore}%</span>
              </div>
            </div>
          </div>

          {/* After Score */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-500 mb-2 font-medium">Optimized Match</span>
            <div className="relative flex items-center justify-center w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" className="stroke-slate-800 fill-transparent" strokeWidth="6" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className={`fill-transparent transition-all duration-1000 ${getScoreColor(scoreAfter)}`}
                  strokeWidth="6"
                  strokeDasharray="251.2"
                  strokeDashoffset={strokeDashOffset(scoreAfter)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-200">{scoreAfter}%</span>
              </div>
            </div>
          </div>
        </div>

        {scoreIncrease > 0 && (
          <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Score improved by +{scoreIncrease}%</span>
          </div>
        )}
      </div>

      {/* Keywords matched / missing */}
      <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between relative overflow-hidden">
        {/* Decorative lights */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" /> Keywords Analysis
            </h3>
            <span className="text-xs text-slate-500">
              {matchedKeywords.length} matched • {missingKeywords.length} missing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Keywords */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matched Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                {matchedKeywords.length > 0 ? (
                  matchedKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 text-xs font-medium bg-emerald-500/5 text-emerald-300 border border-emerald-500/15 rounded-lg"
                    >
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-600">No matched keywords found yet.</span>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" /> Missing Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                {missingKeywords.length > 0 ? (
                  missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 text-xs font-medium bg-amber-500/5 text-amber-300 border border-amber-500/15 rounded-lg animate-pulse"
                    >
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-400 font-medium">All essential keywords matched!</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recruiter Insight note */}
        {insights && (
          <div className="mt-6 p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex gap-2.5 items-start">
            <Lightbulb className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "{insights}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
