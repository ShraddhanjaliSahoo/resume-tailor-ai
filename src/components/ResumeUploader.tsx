import { useState, useRef } from 'react';
import { UploadCloud, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { extractTextFromPdf } from '../utils/pdfParser';
import { parseResumeWithGemini } from '../utils/gemini';
import type { MasterResume } from '../utils/gemini';

interface ResumeUploaderProps {
  onUploadSuccess: (resume: MasterResume) => void;
}

export default function ResumeUploader({ onUploadSuccess }: ResumeUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fileUploaded, setFileUploaded] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }

    setLoading(true);
    setError(null);
    setFileUploaded(file.name);

    try {
      setLoadingStep('Extracting text from PDF...');
      const rawText = await extractTextFromPdf(file);
      
      setLoadingStep('Analyzing & structuring with Gemini...');
      const structuredResume = await parseResumeWithGemini(rawText);
      
      onUploadSuccess(structuredResume);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during file parsing.');
      setFileUploaded(null);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 min-h-[220px] ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/5'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleChange}
          disabled={loading}
        />

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />

        {loading ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
            <div className="space-y-1">
              <p className="text-lg font-medium text-slate-200">Processing master resume</p>
              <p className="text-sm text-slate-400 animate-pulse">{loadingStep}</p>
            </div>
          </div>
        ) : fileUploaded ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-200">{fileUploaded}</p>
              <p className="text-xs text-emerald-400 mt-1">Successfully parsed & structured</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onButtonClick();
              }}
              className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Upload a different file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-full shadow-lg">
              <UploadCloud className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="space-y-1.5">
              <p className="text-lg font-semibold text-slate-200">
                Upload your master resume
              </p>
              <p className="text-sm text-slate-400">
                Drag and drop your PDF file here, or click to browse
              </p>
            </div>
            <p className="text-xs text-slate-500 bg-slate-950/40 px-3 py-1 rounded-full border border-slate-850">
              PDF files only • Extracted and stored client-side
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-sm">Upload Error</p>
            <p className="text-xs text-rose-300/95 leading-relaxed">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
