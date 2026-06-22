import React, { useState } from 'react';
import { AlignLeft, Sparkles, AlertCircle } from 'lucide-react';

interface JobDescriptionInputProps {
  onTailor: (jobDescription: string) => void;
  disabled: boolean;
  isProcessing: boolean;
}

export default function JobDescriptionInput({ onTailor, disabled, isProcessing }: JobDescriptionInputProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobDescription.trim().length < 50) {
      setError('Please paste a substantial job description (at least 50 characters) to get accurate results.');
      return;
    }
    setError(null);
    onTailor(jobDescription.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="jd-textarea" className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <AlignLeft className="w-4 h-4 text-indigo-400" /> Target Job Description
          </label>
          <span className="text-xs text-slate-500">
            {jobDescription.length} characters
          </span>
        </div>
        <textarea
          id="jd-textarea"
          value={jobDescription}
          onChange={(e) => {
            setJobDescription(e.target.value);
            if (error) setError(null);
          }}
          disabled={isProcessing}
          placeholder="Paste the job description here (e.g. key responsibilities, required skills, and technologies)..."
          className="w-full h-48 px-4 py-3 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      {error && (
        <div className="p-4 flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || isProcessing || !jobDescription.trim()}
        className={`w-full py-3 px-6 rounded-xl font-medium text-white flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${
          disabled || isProcessing || !jobDescription.trim()
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800/50'
            : 'bg-indigo-600 hover:bg-indigo-500 hover:-translate-y-0.5 cursor-pointer shadow-indigo-950/20'
        }`}
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
            <span>Tailoring Resume & Computing ATS...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Optimize & Tailor Resume</span>
          </>
        )}
      </button>
    </form>
  );
}
