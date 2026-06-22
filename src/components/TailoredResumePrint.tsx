import { useRef, useState } from 'react';
import { Printer, Download, Eye, Loader2 } from 'lucide-react';
import type { TailoringResult } from '../utils/gemini';

interface TailoredResumePrintProps {
  resume: TailoringResult;
  candidateName: string;
}

export default function TailoredResumePrint({ resume, candidateName }: TailoredResumePrintProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Trigger high quality native browser print
  const handlePrint = () => {
    window.print();
  };

  // Trigger html2pdf client-side download
  const handleDownloadPdf = async () => {
    setDownloading(true);
    const element = resumeRef.current;
    if (!element) return;

    try {
      // Dynamically import html2pdf to prevent server-side render or bundle issues
      const { default: html2pdf } = await import('html2pdf.js');
      
      // Clean formatted filename
      const formattedName = candidateName.replace(/\s+/g, '_') || 'Tailored';
      
      const opt = {
        margin: 0.5, // 0.5 inch margin on all sides
        filename: `${formattedName}_Tailored_Resume.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2.5, // High resolution
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };

      await html2pdf().from(element).set(opt).save();
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Could not generate PDF. Please try the "Print Resume" option as a fallback.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl no-print">
        <div className="flex items-center gap-2 text-sm text-slate-350">
          <Eye className="w-4 h-4 text-indigo-400" />
          <span>Export Tailored Resume</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-xl transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save via Browser</span>
          </button>
          
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-950/20 transition-all cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* VIEWPORT CONTROLLER (Centered Paper Resume) */}
      <div className="w-full overflow-x-auto flex justify-center py-4 bg-slate-950/20 border border-slate-900 rounded-2xl no-print">
        {/* Document A4/Letter Preview Wrapper */}
        <div className="shadow-2xl bg-white text-slate-900 p-10 w-[8.5in] min-h-[11in] text-[12px] font-sans box-border shrink-0 select-text leading-relaxed">
          
          {/* Static Printable Layout */}
          <div ref={resumeRef} className="print-page space-y-5 bg-white text-black">
            {/* Candidate Header */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold tracking-wide uppercase text-slate-900 leading-tight">
                {candidateName || 'Candidate Name'}
              </h2>
              {/* Optional details placeholder (usually found in master resume) */}
              <div className="text-[10px] text-slate-600 flex justify-center items-center gap-2.5 flex-wrap">
                {resume.education[0] && (
                  <span>Ref: {resume.education[0].institution}</span>
                )}
              </div>
            </div>

            {/* Divider line */}
            <div className="border-t border-slate-350" />

            {/* Profile Summary */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">
                Professional Summary
              </h3>
              <p className="text-[11px] text-slate-700 text-justify font-serif">
                {resume.summary}
              </p>
            </div>

            {/* Core Skills */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">
                Skills
              </h3>
              <p className="text-[11px] text-slate-700 font-medium">
                {resume.skills.join(' • ')}
              </p>
            </div>

            {/* Professional Experience */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">
                Professional Experience
              </h3>
              
              {resume.experience.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                    <span>{exp.role}</span>
                    <span>{exp.duration}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 font-semibold italic">
                    <span>{exp.company}</span>
                    <span>{exp.location}</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11.5px] text-slate-700">
                    {exp.bullets.map((b, bidx) => (
                      <li key={bidx} className="text-justify font-serif leading-normal">
                        {b.tailored}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Projects Section */}
            {resume.projects && resume.projects.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">
                  Projects
                </h3>
                
                {resume.projects.map((proj, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                      <span>{proj.title}</span>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span className="text-[9.5px] text-slate-600 font-medium font-mono uppercase">
                          [{proj.technologies.join(', ')}]
                        </span>
                      )}
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11.5px] text-slate-700">
                      {proj.bullets.map((b, bidx) => (
                        <li key={bidx} className="text-justify font-serif leading-normal">
                          {b.tailored}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">
                Education
              </h3>
              
              {resume.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-baseline text-[11px] text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-800">{edu.degree}</span>
                    <span className="text-slate-500"> — {edu.institution} ({edu.location})</span>
                  </div>
                  <span className="font-medium text-slate-600 text-[10px]">{edu.duration}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* PRINT-ONLY CSS CONTAINER (Visible only in @media print) */}
      <div className="hidden print-only print:block text-slate-950 p-6 bg-white max-w-full">
        <div className="print-page space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold tracking-wide uppercase text-black">
              {candidateName || 'Candidate Name'}
            </h2>
            <div className="text-[10px] text-slate-700 flex justify-center items-center gap-2">
              {resume.education[0] && <span>{resume.education[0].institution}</span>}
            </div>
          </div>

          <div className="border-t border-slate-400" />

          {/* Profile Summary */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5 text-black">
              Professional Summary
            </h3>
            <p className="text-[11px] text-slate-800 text-justify">
              {resume.summary}
            </p>
          </div>

          {/* Skills */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5 text-black">
              Skills
            </h3>
            <p className="text-[11px] text-slate-800">
              {resume.skills.join(' • ')}
            </p>
          </div>

          {/* Work Experience */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5 text-black">
              Professional Experience
            </h3>
            
            {resume.experience.map((exp, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold text-[11px] text-black">
                  <span>{exp.role}</span>
                  <span>{exp.duration}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-700 font-semibold italic">
                  <span>{exp.company}</span>
                  <span>{exp.location}</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-800">
                  {exp.bullets.map((b, bidx) => (
                    <li key={bidx} className="text-justify leading-tight">
                      {b.tailored}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5 text-black">
                Projects
              </h3>
              
              {resume.projects.map((proj, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-[11px] text-black">
                    <span>{proj.title}</span>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="text-[9.5px] text-slate-700">[{proj.technologies.join(', ')}]</span>
                    )}
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-800">
                    {proj.bullets.map((b, bidx) => (
                      <li key={bidx} className="text-justify leading-tight">
                        {b.tailored}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5 text-black">
              Education
            </h3>
            
            {resume.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-[11px] text-slate-800">
                <div>
                  <span className="font-semibold text-black">{edu.degree}</span>
                  <span> — {edu.institution} ({edu.location})</span>
                </div>
                <span className="text-slate-600 text-[10px]">{edu.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
