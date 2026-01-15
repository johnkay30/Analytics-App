
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { Dashboard } from './components/Dashboard';
import { DataPreview } from './components/DataPreview';
import { AppState, DatasetMetadata } from './types';
import { analyzeDataset } from './services/geminiService';
import { 
  Loader2, AlertCircle, RotateCcw, CheckCircle2, Play, 
  FileSpreadsheet, ListChecks, ArrowRight, Trash2, 
  Link as LinkIcon, Table, Database, Sparkles, Box
} from 'lucide-react';

const ANALYSIS_STAGES = [
  "Mapping multi-table relationships...",
  "Detecting join keys and data hierarchies...",
  "Running cross-table statistical synthesis...",
  "Calculating unified performance metrics...",
  "Building relational intelligence dashboard..."
];

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('nexus_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [state, setState] = useState<AppState>({
    datasets: [],
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
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [state.isAnalyzing]);

  const handleAddDataset = useCallback((newDataset: DatasetMetadata) => {
    setState(prev => ({
      ...prev,
      datasets: [...prev.datasets, newDataset],
      error: null,
      analysis: null
    }));
  }, []);

  const removeDataset = (id: string) => {
    setState(prev => ({
      ...prev,
      datasets: prev.datasets.filter(ds => ds.id !== id),
      analysis: null
    }));
  };

  const triggerAnalysis = async () => {
    if (state.datasets.length === 0) return;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const analysis = await analyzeDataset(state.datasets);
      setState(prev => ({ ...prev, analysis, isAnalyzing: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        error: err.message || "Nexus failed to unify the relational model.", 
        isAnalyzing: false 
      }));
    }
  };

  const reset = () => {
    setState({
      datasets: [],
      isAnalyzing: false,
      analysis: null,
      error: null,
    });
  };

  const toggleTheme = () => setIsDark(!isDark);

  // Unified data view for existing preview components (using the first dataset as primary preview)
  const primaryData = state.datasets.length > 0 ? state.datasets[0].data : [];

  // Identify potential shared keys across tables for visual feedback
  const sharedKeys = useMemo(() => {
    if (state.datasets.length < 2) return [];
    const allCols = state.datasets.flatMap(ds => ds.columns);
    const counts: { [key: string]: number } = {};
    allCols.forEach(c => counts[c] = (counts[c] || 0) + 1);
    return Object.keys(counts).filter(c => counts[c] > 1);
  }, [state.datasets]);

  return (
    <div className={`${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
        <Header 
          onReset={state.datasets.length > 0 ? reset : undefined} 
          analysis={state.analysis}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          {state.datasets.length === 0 ? (
            <div className="max-w-3xl mx-auto mt-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                  <Database size={14} /> Relational Data Engine
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                  Nexus Intelligence <span className="text-indigo-600 dark:text-indigo-400">Workspace</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Connect multiple datasets (Sales, Customers, Products) to unlock 
                  deep cross-functional insights. Upload your files to begin architecting.
                </p>
              </div>
              <FileUploader onUpload={handleAddDataset} isDark={isDark} />
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
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {ANALYSIS_STAGES[loadingStage]}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium italic">
                        Nexus is joining {state.datasets.length} tables...
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
                  </div>
                </div>
              ) : state.error ? (
                <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-8 rounded-2xl flex items-start gap-5 shadow-sm">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Relational Engine Fault</h3>
                    <p className="text-red-700 dark:text-red-300 mb-6 leading-relaxed">{state.error}</p>
                    <button onClick={reset} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95">
                      <RotateCcw size={18} /> Reset Workspace
                    </button>
                  </div>
                </div>
              ) : !state.analysis ? (
                /* NEXUS DATA ARCHITECT STAGING */
                <div className="max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Workspace Stats & Controls */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                       <Database size={150} className="text-indigo-600" />
                    </div>
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <Box className="text-indigo-600 dark:text-indigo-400" size={24} />
                           <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Nexus Data Architect</h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Verify relationships between your {state.datasets.length} tables before synchronizing.</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <FileUploader onUpload={handleAddDataset} isDark={isDark} />
                        <button 
                          onClick={triggerAnalysis}
                          disabled={state.datasets.length === 0}
                          className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-2xl shadow-indigo-300 dark:shadow-indigo-900/40 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 group disabled:opacity-50"
                        >
                          <Play size={24} className="fill-current" />
                          Synchronize & Analyze
                          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {/* Datasets Workspace Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {state.datasets.map((ds) => (
                        <div key={ds.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between group">
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg shadow-sm">
                                <Table className="text-indigo-600 dark:text-indigo-400" size={20} />
                              </div>
                              <button 
                                onClick={() => removeDataset(ds.id)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white truncate mb-1">{ds.name}</h4>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{ds.rowCount} Records Found</p>
                          </div>
                          
                          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex flex-wrap gap-1">
                               {ds.columns.slice(0, 3).map(col => (
                                 <span key={col} className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${sharedKeys.includes(col) ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-700'}`}>
                                   {col} {sharedKeys.includes(col) && '🔗'}
                                 </span>
                               ))}
                               {ds.columns.length > 3 && <span className="text-[9px] text-slate-400 font-bold">+{ds.columns.length - 3}</span>}
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {sharedKeys.length > 0 && (
                      <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/40 flex items-center gap-4">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                           <LinkIcon size={16} className="text-white" />
                        </div>
                        <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                          Nexus discovered potential relationships through <span className="font-bold underline">{sharedKeys.join(', ')}</span>. Cross-table intelligence enabled.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Primary Data Preview */}
                  {state.datasets.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <ListChecks className="text-indigo-600" size={18} />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                          Raw Feed Sample: {state.datasets[0].name}
                        </h3>
                      </div>
                      <DataPreview data={primaryData} />
                    </div>
                  )}
                </div>
              ) : (
                /* DASHBOARD VIEW: ANALYSIS COMPLETE */
                <>
                  <Dashboard analysis={state.analysis} data={primaryData} isDark={isDark} />
                  <div className="mt-16">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <Sparkles className="text-indigo-600" />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Relational Insights Detail</h2>
                      </div>
                      <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                        Joined Schema Verified
                      </div>
                    </div>
                    {state.analysis.suggestedJoins && state.analysis.suggestedJoins.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {state.analysis.suggestedJoins.map((join, i) => (
                           <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3">
                              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                <LinkIcon size={14} className="text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{join}</span>
                           </div>
                        ))}
                      </div>
                    )}
                    <DataPreview data={primaryData} />
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
