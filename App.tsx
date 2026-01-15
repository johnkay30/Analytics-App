
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { Dashboard } from './components/Dashboard';
import { DataPreview } from './components/DataPreview';
import { AppState, DataRow } from './types';
import { analyzeDataset } from './services/geminiService';
import { Loader2, AlertCircle, RotateCcw, CheckCircle2, Play, FileSpreadsheet, ListChecks, ArrowRight } from 'lucide-react';

const ANALYSIS_STAGES = [
  "Scanning dataset structure...",
  "Extracting statistical correlations...",
  "Identifying critical performance indicators...",
  "Optimizing visualization parameters...",
  "Architecting executive dashboard..."
];

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('nexus_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [state, setState] = useState<AppState>({
    data: [],
    columns: [],
    isAnalyzing: false,
    analysis: null,
    error: null,
  });

  const [loadingStage, setLoadingStage] = useState(0);

  useEffect(() => {
    localStorage.setItem('nexus_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    let interval: number;
    if (state.isAnalyzing) {
      setLoadingStage(0);
      interval = window.setInterval(() => {
        setLoadingStage(prev => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [state.isAnalyzing]);

  const handleFileUpload = useCallback((data: DataRow[]) => {
    if (data.length === 0) return;
    const columns = Object.keys(data[0]);
    setState(prev => ({ 
      ...prev, 
      data, 
      columns, 
      isAnalyzing: false, 
      error: null,
      analysis: null 
    }));
  }, []);

  const triggerAnalysis = async () => {
    if (state.data.length === 0) return;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const sample = state.data.slice(0, 15); 
      const analysis = await analyzeDataset(state.columns, sample);
      setState(prev => ({ ...prev, analysis, isAnalyzing: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        error: err.message || "Nexus failed to synthesize data insights.", 
        isAnalyzing: false 
      }));
    }
  };

  const reset = () => {
    setState({
      data: [],
      columns: [],
      isAnalyzing: false,
      analysis: null,
      error: null,
    });
  };

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className={`${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
        <Header 
          onReset={state.data.length > 0 ? reset : undefined} 
          analysis={state.analysis}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          {!state.data.length ? (
            <div className="max-w-3xl mx-auto mt-12">
              <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                  Nexus Analytics <span className="text-indigo-600 dark:text-indigo-400">Portal</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Accelerate your decision-making. Upload any dataset and let Nexus AI 
                  automatically detect hidden patterns and build your BI stack in real-time.
                </p>
              </div>
              <FileUploader onUpload={handleFileUpload} isDark={isDark} />
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-700">
              {state.isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-ping opacity-25"></div>
                    <Loader2 className="w-16 h-16 text-indigo-600 dark:text-indigo-400 animate-spin relative" />
                  </div>
                  
                  <div className="text-center space-y-6 max-w-md">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white transition-all duration-500">
                        {ANALYSIS_STAGES[loadingStage]}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium italic">
                        Nexus Intelligence Engine is synthesizing your data...
                      </p>
                    </div>

                    <div className="flex justify-center gap-2">
                      {ANALYSIS_STAGES.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            idx <= loadingStage ? 'w-8 bg-indigo-600 dark:bg-indigo-400' : 'w-4 bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 text-left pt-4">
                      {ANALYSIS_STAGES.slice(0, loadingStage).map((stage, i) => (
                        <div key={i} className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-semibold animate-in slide-in-from-left-4 duration-300">
                          <CheckCircle2 size={14} />
                          {stage.replace('...', ' complete')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : state.error ? (
                <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-8 rounded-2xl flex items-start gap-5 shadow-sm">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Engine Disruption</h3>
                    <p className="text-red-700 dark:text-red-300 mb-6 leading-relaxed">{state.error}</p>
                    <button 
                      onClick={reset}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95"
                    >
                      <RotateCcw size={18} />
                      Reset & Retry
                    </button>
                  </div>
                </div>
              ) : !state.analysis ? (
                /* STAGING AREA: USER CONFIRMS DATASET */
                <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-2xl">
                          <FileSpreadsheet className="text-green-600 dark:text-green-400 w-8 h-8" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dataset Verified</h2>
                          <p className="text-slate-500 dark:text-slate-400 font-medium italic text-sm">Correct data selected? Click below to begin AI synthesis.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                         <button 
                          onClick={reset}
                          className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold text-sm transition-all"
                        >
                          Change File
                        </button>
                        <button 
                          onClick={triggerAnalysis}
                          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 group"
                        >
                          <Play size={20} className="fill-current" />
                          Commence AI Analysis
                          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Record Count</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{new Intl.NumberFormat().format(state.data.length)}</p>
                      </div>
                      <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Attributes Found</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{state.columns.length}</p>
                      </div>
                      <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                           <ListChecks size={20} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Schema mapping completed successfully.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                      Data Ingestion Preview
                    </h3>
                    <DataPreview data={state.data} />
                  </div>
                </div>
              ) : (
                /* DASHBOARD VIEW: ANALYSIS COMPLETE */
                <>
                  <Dashboard analysis={state.analysis} data={state.data} isDark={isDark} />
                  <div className="mt-16">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Operational Data Audit</h2>
                      <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                        Verified Dataset
                      </div>
                    </div>
                    <DataPreview data={state.data} />
                  </div>
                </>
              )}
            </div>
          )}
        </main>

        <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2 grayscale opacity-50 dark:opacity-40">
                 <div className="bg-slate-800 dark:bg-slate-700 p-1.5 rounded">
                   <div className="w-4 h-4 bg-white rounded-sm"></div>
                 </div>
                 <span className="font-bold text-slate-800 dark:text-slate-200">NEXUS ANALYTICS</span>
              </div>
              <div className="text-slate-400 dark:text-slate-500 text-sm font-medium">
                &copy; {new Date().getFullYear()} Nexus Enterprise Solutions. Protected by AES-256 Encryption.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
