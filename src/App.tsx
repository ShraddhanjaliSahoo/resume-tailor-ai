import { useState, useEffect } from 'react';
import {
  Sparkles,
  Settings,
  FileText,
  AlertCircle,
  User,
  LogOut,
  Target,
  RefreshCw,
  Trophy,
  History,
  CheckCircle2
} from 'lucide-react';
import {
  auth,
  db,
  isFirebaseConfigured
} from './config/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import SettingsModal from './components/SettingsModal';
import ResumeUploader from './components/ResumeUploader';
import JobDescriptionInput from './components/JobDescriptionInput';
import AtsScorecard from './components/AtsScorecard';
import ComparisonView from './components/ComparisonView';
import TailoredResumePrint from './components/TailoredResumePrint';
import { hasApiKey, tailorResumeWithGemini } from './utils/gemini';
import type { MasterResume, TailoringResult } from './utils/gemini';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [masterResume, setMasterResume] = useState<MasterResume | null>(null);
  const [tailoredResult, setTailoredResult] = useState<TailoringResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'score' | 'compare' | 'export'>('score');
  const [firebaseSyncing, setFirebaseSyncing] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Check Gemini Key on Load
  useEffect(() => {
    setHasKey(hasApiKey());
  }, []);

  // Monitor Firebase Auth State
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthLoading(false);
      // Load master resume from LocalStorage if firebase is not available
      const localResume = localStorage.getItem('MASTER_RESUME');
      if (localResume) {
        try {
          setMasterResume(JSON.parse(localResume));
        } catch (e) {
          console.error('Error parsing local master resume:', e);
        }
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        // Load master resume from Firestore
        setFirebaseSyncing(true);
        try {
          const docRef = doc(db, 'users', currentUser.uid, 'resumes', 'master');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setMasterResume(docSnap.data() as MasterResume);
          } else {
            // Fallback to local storage if user just logged in and Firestore is empty
            const localResume = localStorage.getItem('MASTER_RESUME');
            if (localResume) {
              setMasterResume(JSON.parse(localResume));
            }
          }
        } catch (e) {
          console.error('Error loading resume from Firestore:', e);
        } finally {
          setFirebaseSyncing(false);
        }
      } else {
        // Load from LocalStorage in guest mode
        const localResume = localStorage.getItem('MASTER_RESUME');
        if (localResume) {
          try {
            setMasterResume(JSON.parse(localResume));
          } catch (e) {
            console.error('Error parsing local resume:', e);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handler for login
  const handleLogin = async () => {
    if (!isFirebaseConfigured) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  // Handler for logout
  const handleLogout = async () => {
    if (!isFirebaseConfigured) return;
    try {
      await signOut(auth);
      setMasterResume(null);
      setTailoredResult(null);
      localStorage.removeItem('MASTER_RESUME');
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  // Handle successful Master Resume Upload
  const handleUploadSuccess = async (resume: MasterResume) => {
    setMasterResume(resume);
    // Always persist to localstorage as a cache
    localStorage.setItem('MASTER_RESUME', JSON.stringify(resume));

    // Save to Firestore if user logged in
    if (user && isFirebaseConfigured) {
      setFirebaseSyncing(true);
      try {
        const docRef = doc(db, 'users', user.uid, 'resumes', 'master');
        await setDoc(docRef, resume);
      } catch (e) {
        console.error('Error saving resume to Firestore:', e);
      } finally {
        setFirebaseSyncing(false);
      }
    }
  };

  // Handle Tailoring Request
  const handleTailorResume = async (jobDescription: string) => {
    if (!masterResume) return;
    setIsProcessing(true);
    setTailoredResult(null);

    try {
      const result = await tailorResumeWithGemini(masterResume, jobDescription);
      setTailoredResult(result);
      setActiveTab('score'); // automatically switch to ATS Score view
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'An error occurred during tailoring.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetResume = () => {
    if (confirm('Are you sure you want to clear your current Master Resume?')) {
      setMasterResume(null);
      setTailoredResult(null);
      localStorage.removeItem('MASTER_RESUME');
      if (user && isFirebaseConfigured) {
        const docRef = doc(db, 'users', user.uid, 'resumes', 'master');
        setDoc(docRef, {}); // clear document
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col antialiased relative selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-40 w-full bg-[#0b0f19]/70 backdrop-blur-md border-b border-slate-800/80 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-950/40">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-violet-300 bg-clip-text text-transparent">
              ResumeTailor AI
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* API Settings toggle */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer transition-all ${
                hasKey
                  ? 'bg-slate-900/60 border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-slate-100'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 animate-pulse'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{hasKey ? 'Settings' : 'Configure API Key'}</span>
            </button>

            {/* Firebase Auth view */}
            {isFirebaseConfigured && !authLoading && (
              user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-medium text-slate-200">{user.displayName}</span>
                    <span className="text-[10px] text-slate-500">Sync Active</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Google Sign-In</span>
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 no-print">
        
        {/* API Key Missing Alert */}
        {!hasKey && (
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 justify-between">
            <div className="flex items-start gap-3 text-center sm:text-left">
              <AlertCircle className="w-5.5 h-5.5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-indigo-350">Gemini API Key Required</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  To parse your resumes and generate tailored applications, you need a Gemini API Key. Setup takes 30 seconds and is completely free.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>
        )}

        {/* STEP 1: MASTER RESUME SECTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Step 1: Master Resume
            </h2>
            {masterResume && (
              <button
                onClick={handleResetResume}
                className="text-xs font-semibold text-slate-500 hover:text-slate-350 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Clear Resume
              </button>
            )}
          </div>

          {masterResume ? (
            /* Uploaded Resume Summary card */
            <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-200">
                    {masterResume.personalInfo.fullName || 'Candidate Name'}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                    {masterResume.personalInfo.email && <span>{masterResume.personalInfo.email}</span>}
                    <span>•</span>
                    <span>{masterResume.skills.length} core skills</span>
                    <span>•</span>
                    <span>{masterResume.experience.length} career experiences</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {firebaseSyncing && (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
                    <LoaderIcon /> Syncing Firestore...
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                  Active Master Resume
                </span>
              </div>
            </div>
          ) : (
            /* Upload Box */
            <div className="p-2.5 bg-slate-900/20 border border-slate-800/60 rounded-3xl">
              <ResumeUploader onUploadSuccess={handleUploadSuccess} />
            </div>
          )}
        </section>

        {/* STEP 2: JOB DESCRIPTION INPUT */}
        {masterResume && (
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" /> Step 2: Target Job Description
            </h2>
            <div className="p-2.5 bg-slate-900/20 border border-slate-800/60 rounded-3xl">
              <JobDescriptionInput
                onTailor={handleTailorResume}
                disabled={!hasKey}
                isProcessing={isProcessing}
              />
            </div>
          </section>
        )}

        {/* STEP 3: RESULTS DASHBOARD */}
        {tailoredResult && masterResume && (
          <section className="space-y-6 pt-4 border-t border-slate-800/50">
            {/* Sliding navigation tabs */}
            <div className="flex items-center justify-center">
              <div className="inline-flex p-1 bg-slate-950/60 border border-slate-800 rounded-xl backdrop-blur-md">
                <button
                  onClick={() => setActiveTab('score')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'score'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>ATS Scorecard</span>
                </button>
                <button
                  onClick={() => setActiveTab('compare')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'compare'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Comparison View</span>
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'export'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* Tab content renderer */}
            <div className="transition-all duration-300">
              {activeTab === 'score' && (
                <AtsScorecard
                  scoreBefore={tailoredResult.atsBefore}
                  scoreAfter={tailoredResult.atsAfter}
                  matchedKeywords={tailoredResult.matchedKeywords}
                  missingKeywords={tailoredResult.missingKeywords}
                  insights={tailoredResult.recruiterInsights}
                />
              )}
              {activeTab === 'compare' && (
                <ComparisonView original={masterResume} tailored={tailoredResult} />
              )}
              {activeTab === 'export' && (
                <TailoredResumePrint
                  resume={tailoredResult}
                  candidateName={masterResume.personalInfo.fullName}
                />
              )}
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-6 border-t border-slate-800/40 text-center text-xs text-slate-600 no-print mt-auto">
        <p>© 2026 ResumeTailor AI. All user details and APIs are processed securely in-browser.</p>
      </footer>

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => setHasKey(hasApiKey())}
      />
    </div>
  );
}

// Inline custom loader icon
function LoaderIcon() {
  return (
    <svg className="animate-spin h-3.5 w-3.5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
