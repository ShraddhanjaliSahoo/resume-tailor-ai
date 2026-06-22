import { useState } from 'react';
import { Columns, History, Sparkles, Info } from 'lucide-react';
import type { MasterResume, TailoringResult } from '../utils/gemini';

interface ComparisonViewProps {
  original: MasterResume;
  tailored: TailoringResult;
}

export default function ComparisonView({ original, tailored }: ComparisonViewProps) {
  const [selectedExplanation, setSelectedExplanation] = useState<{
    section: string;
    index: number;
    bulletIndex: number;
    text: string;
  } | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Columns className="w-5 h-5 text-indigo-400" /> Resume Comparison
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare your original master resume (left) with the AI-optimized resume (right). Hover or click tailored bullets to see why they were adjusted.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: ORIGINAL RESUME */}
        <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-6 relative">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold">
            <History className="w-3.5 h-3.5" />
            <span>Master Resume</span>
          </div>

          {/* Header/Personal info */}
          <div className="border-b border-slate-800/60 pb-4 space-y-2">
            <h3 className="text-2xl font-bold text-slate-200">
              {original.personalInfo.fullName || 'Name Placeholder'}
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              {original.personalInfo.email && <span>{original.personalInfo.email}</span>}
              {original.personalInfo.phone && <span>{original.personalInfo.phone}</span>}
              {original.personalInfo.location && <span>{original.personalInfo.location}</span>}
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Professional Summary</h4>
            <p className="text-sm text-slate-350 leading-relaxed">
              {original.summary || 'No summary present.'}
            </p>
          </div>

          {/* Core Skills */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {original.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 text-xs bg-slate-800/40 text-slate-400 border border-slate-800 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Experience</h4>
            {original.experience.map((exp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <h5 className="text-sm font-semibold text-slate-200">{exp.role}</h5>
                  <span className="text-xs text-slate-500">{exp.duration}</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">{exp.company} • {exp.location}</p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-350 leading-relaxed">
                  {exp.bullets.map((b, bidx) => (
                    <li key={bidx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Projects */}
          {original.projects && original.projects.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Projects</h4>
              {original.projects.map((proj, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <h5 className="text-sm font-semibold text-slate-200">{proj.title}</h5>
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-[10px] text-indigo-400 font-semibold">{proj.technologies.join(' • ')}</p>
                  )}
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-350 leading-relaxed">
                    {proj.bullets.map((b, bidx) => (
                      <li key={bidx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: TAILORED RESUME */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-6 relative shadow-xl">
          {/* Decorative side border indicating optimization */}
          <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-violet-500 rounded-r-2xl" />

          <div className="absolute top-4 right-6 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Tailored</span>
          </div>

          {/* Header/Personal info */}
          <div className="border-b border-slate-800/60 pb-4 space-y-2">
            <h3 className="text-2xl font-bold text-slate-150">
              {original.personalInfo.fullName || 'Name Placeholder'}
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              {original.personalInfo.email && <span>{original.personalInfo.email}</span>}
              {original.personalInfo.phone && <span>{original.personalInfo.phone}</span>}
              {original.personalInfo.location && <span>{original.personalInfo.location}</span>}
            </div>
          </div>

          {/* Professional Summary (potentially rewritten) */}
          <div className="space-y-2 p-3 bg-indigo-500/[0.02] border border-indigo-500/5 rounded-xl">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
              Professional Summary
              {original.summary !== tailored.summary && (
                <span className="ml-1.5 text-[10px] lowercase font-normal bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded">optimized</span>
              )}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {tailored.summary}
            </p>
          </div>

          {/* Core Skills (reordered & styled) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Reordered Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {tailored.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 text-xs bg-indigo-600/10 text-indigo-300 border border-indigo-500/20 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Experience</h4>
            {tailored.experience.map((exp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <h5 className="text-sm font-semibold text-slate-200">{exp.role}</h5>
                  <span className="text-xs text-slate-500">{exp.duration}</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">{exp.company} • {exp.location}</p>
                <ul className="space-y-2 list-none pl-0">
                  {exp.bullets.map((bullet, bidx) => (
                    <li
                      key={bidx}
                      onClick={() => {
                        if (bullet.modified) {
                          setSelectedExplanation({
                            section: 'Experience',
                            index: idx,
                            bulletIndex: bidx,
                            text: bullet.explanation,
                          });
                        }
                      }}
                      className={`relative pl-4 text-xs leading-relaxed transition-all cursor-pointer rounded-lg p-2 ${
                        bullet.modified
                          ? 'border border-indigo-500/20 bg-indigo-500/[0.04] text-slate-250 hover:bg-indigo-500/[0.08]'
                          : 'text-slate-350 hover:bg-slate-800/20'
                      }`}
                    >
                      {/* Custom bullets indicator */}
                      <span className={`absolute left-1.5 top-3.5 w-1 h-1 rounded-full ${
                        bullet.modified ? 'bg-indigo-400' : 'bg-slate-600'
                      }`} />

                      <div>
                        {bullet.tailored}
                        {bullet.modified && (
                          <div className="mt-1 flex items-center justify-between text-[10px] text-indigo-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Tailored
                            </span>
                            <span className="underline hover:text-indigo-300 flex items-center gap-0.5">
                              <Info className="w-2.5 h-2.5" /> View alignment rationale
                            </span>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Projects */}
          {tailored.projects && tailored.projects.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Projects</h4>
              {tailored.projects.map((proj, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <h5 className="text-sm font-semibold text-slate-200">{proj.title}</h5>
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-[10px] text-indigo-400 font-semibold">{proj.technologies.join(' • ')}</p>
                  )}
                  <ul className="space-y-2 list-none pl-0">
                    {proj.bullets.map((bullet, bidx) => (
                      <li
                        key={bidx}
                        onClick={() => {
                          if (bullet.modified) {
                            setSelectedExplanation({
                              section: 'Projects',
                              index: idx,
                              bulletIndex: bidx,
                              text: bullet.explanation,
                            });
                          }
                        }}
                        className={`relative pl-4 text-xs leading-relaxed transition-all cursor-pointer rounded-lg p-2 ${
                          bullet.modified
                            ? 'border border-indigo-500/20 bg-indigo-500/[0.04] text-slate-250 hover:bg-indigo-500/[0.08]'
                            : 'text-slate-350 hover:bg-slate-800/20'
                        }`}
                      >
                        <span className={`absolute left-1.5 top-3.5 w-1 h-1 rounded-full ${
                          bullet.modified ? 'bg-indigo-400' : 'bg-slate-600'
                        }`} />

                        <div>
                          {bullet.tailored}
                          {bullet.modified && (
                            <div className="mt-1 flex items-center justify-between text-[10px] text-indigo-400 font-medium">
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Tailored
                              </span>
                              <span className="underline hover:text-indigo-300 flex items-center gap-0.5">
                                <Info className="w-2.5 h-2.5" /> View alignment rationale
                              </span>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alignment Explanation Rationale Modal */}
      {selectedExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
            <h4 className="text-sm font-bold uppercase text-indigo-400 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> AI Alignment Rationale
            </h4>
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Rationale for modification in <span className="font-semibold text-slate-350">{selectedExplanation.section}</span>:
              </p>
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{selectedExplanation.text}"
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedExplanation(null)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
