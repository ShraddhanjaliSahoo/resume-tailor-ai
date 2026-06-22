import { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, Database, Info } from 'lucide-react';
import { getGeminiApiKey, saveGeminiApiKey } from '../utils/gemini';
import { isFirebaseConfigured } from '../config/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function SettingsModal({ isOpen, onClose, onSaved }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getGeminiApiKey());
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveGeminiApiKey(apiKey.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onSaved();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl">
        {/* Glow effect */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-slate-100">API Configurations</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-3 pr-20 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="flex items-start gap-1.5 text-xs text-slate-500 mt-1">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
              <span>
                Your API key is saved locally in your browser's local storage and is sent directly to Google Gemini API servers.
              </span>
            </p>
          </div>

          {/* Firebase Connection Status */}
          <div className="p-4 rounded-xl bg-slate-950/30 border border-slate-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-400" /> Firebase Integration
              </span>
              {isFirebaseConfigured ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Configured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Local Fallback
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {isFirebaseConfigured
                ? 'App data is successfully syncing with Firebase Auth, Firestore, and Storage.'
                : 'Using browser LocalStorage. To connect Firebase, add the proper credentials in your .env file.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveSuccess}
              className={`flex-1 py-2.5 text-sm font-medium text-white rounded-xl transition-all shadow-md ${
                saveSuccess
                  ? 'bg-emerald-600 shadow-emerald-950/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/20'
              }`}
            >
              {saveSuccess ? 'Saved successfully!' : 'Save Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
