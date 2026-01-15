
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { AppState, DatasetMetadata, FilterState } from './types';
import { analyzeDataset } from './services/geminiService';
import { 
  Loader2, AlertCircle, RotateCcw, Play, 
  ArrowRight, Database, Box, Key, Table, Trash2, 
  Filter as FilterIcon, ChevronRight
} from 'lucide-react';

const ANALYSIS_STAGES = [
  "Mapping table relationships...",
  "Synthesizing report schemas...",
  "Calculating cross-functional metrics...",
  "Building multi-page visuals...",
  "Finalizing workspace..."
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
    activePageId: 'default',
    filters: {}
  });

  const [loadingStage, setLoadingStage] = useState(0);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nexus_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nexus_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    let interval: number;
    if (state.isAnalyzing) {
      setLoadingStage(0);
      interval = window.setInterval(() => {
        setLoadingStage(prev => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
      }, 2000);
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

  const handleOpenKeySelector = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setState(prev => ({ ...prev, error: null }));
    } else {
      setState(prev => ({ ...prev, error: "API Key selector not available. Check environment variables." }));
    }
  };

  const triggerAnalysis = async () => {
    if (state.datasets.length === 0) return;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const analysis = await analyzeDataset(state.datasets);
      setState(prev => ({ 
        ...prev, 
        analysis, 
        isAnalyzing: false, 
        activePageId: analysis.pages[0]?.id || 'overview',
        filters: {} 
      }));
    } catch (err: any) {
      let errorMessage = err.message || "Nexus failed to unify the relational model.";
      if (errorMessage.includes("API Key") || errorMessage.includes("401")) {
        errorMessage = "An active API Key is required for analysis. Please connect a project key.";
      }
      setState(prev => ({ ...prev, error: errorMessage, isAnalyzing: false }));
    }
  };

  const setFilter = (column: string, values: any[]) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [column]: values }
    }));
  };

  const filteredData = useMemo(() => {
    if (state.datasets.length === 0) return [];
    let base = state.datasets[0].data;
    
    // Explicitly cast Object.entries to fix property 'length' and 'includes' not existing on 'unknown'
    (Object.entries(state.filters) as [string, any[]][]).forEach(([col, values]) => {
      if (values.length > 0) {
        base = base.filter(row => values.includes(row[col]));
      }
    });
    
    return base;
  }, [state.datasets, state.filters]);

  const reset = () => {
    setState({
      datasets: [],
      isAnalyzing: false,
      analysis: null,
      error: null,
      activePageId: 'default',
      filters: {}
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Header 
        onReset={state.datasets.length > 0 ? reset : undefined} 
        analysis={state.analysis}
        isDark={isDark}
        toggleTheme={() => setIsDark(!isDark)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {state.analysis && (
          <Sidebar 
            analysis={state.analysis} 
            activePageId={state.activePageId} 
            onPageChange={(id) => setState(p => ({ ...p, activePageId: id }))}
            datasets={state.datasets}
            filters={state.filters}
            onFilterChange={setFilter}
          />
        )}

        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          {!state.datasets.length ? (
            <div className="max-w-4xl mx-auto mt-20 px-6">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100 dark:border-blue-800">
                  <Database size={14} /> Enterprise BI Platform
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                  Professional Data <span className="text-blue-600 dark:text-blue-400">Synthesis</span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                  The world's most advanced AI-powered business intelligence engine. 
                  Connect multiple datasets to generate relational reports automatically.
                </p>
              </div>
              <FileUploader onUpload={handleAddDataset} isDark={isDark} />
            </div>
          ) : state.isAnalyzing ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
               <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
               </div>
               <div className="text-center space-y-4">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white">{ANALYSIS_STAGES[loadingStage]}</h3>
                  <div className="flex gap-1 justify-center">
                    {ANALYSIS_STAGES.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= loadingStage ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200 dark:bg-slate-800'}`} />
                    ))}
                  </div>
               </div>
            </div>
          ) : state.error ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-3xl shadow-2xl text-center">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Relational Engine Fault</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">{state.error}</p>
                <div className="flex flex-col gap-3">
                  {state.error.includes("Key") && (
                    <button onClick={handleOpenKeySelector} className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 active:scale-95">
                      <Key size={18} /> Connect Project Key
                    </button>
                  )}
                  <button onClick={reset} className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                    <RotateCcw size={18} /> Reset Workspace
                  </button>
                </div>
              </div>
            </div>
          ) : !state.analysis ? (
             <div className="p-8 max-w-6xl mx-auto space-y-8">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-10 shadow-xl overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                      <Database size={240} className="text-blue-600" />
                   </div>
                   <div className="relative z-10">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
                         <div>
                            <div className="flex items-center gap-3 mb-3">
                               <Box className="text-blue-600 w-6 h-6" />
                               <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Active Workspace</h2>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Verify your data relationships before the AI architect builds your reporting engine.</p>
                         </div>
                         <div className="flex gap-4 w-full lg:w-auto">
                            <button onClick={triggerAnalysis} className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 group">
                               <Play size={22} className="fill-current" />
                               Analyze Datasets
                               <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {state.datasets.map(ds => (
                            <div key={ds.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between group transition-all hover:border-blue-300 dark:hover:border-blue-800">
                               <div>
                                  <div className="flex items-center justify-between mb-6">
                                     <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                                        <Table className="text-blue-600" size={20} />
                                     </div>
                                     <button onClick={() => removeDataset(ds.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                                        <Trash2 size={18} />
                                     </button>
                                  </div>
                                  <h4 className="font-black text-slate-900 dark:text-white truncate mb-1 text-lg">{ds.name}</h4>
                                  <div className="flex items-center gap-2">
                                     <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-black uppercase tracking-widest">{ds.rowCount} Records</span>
                                     <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-black uppercase tracking-widest">{ds.columns.length} Cols</span>
                                  </div>
                               </div>
                            </div>
                         ))}
                         <div onClick={() => document.getElementById('file-input')?.click()} className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-blue-600 hover:border-blue-400">
                            <Box size={32} />
                            <span className="font-bold text-sm">Add Table</span>
                         </div>
                      </div>
                   </div>
                </div>
                <FileUploader onUpload={handleAddDataset} isDark={isDark} compact />
             </div>
          ) : (
            <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
              <Dashboard analysis={state.analysis} data={filteredData} isDark={isDark} activePageId={state.activePageId} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
