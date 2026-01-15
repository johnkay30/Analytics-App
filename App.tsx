
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { AppState, DatasetMetadata, FilterState } from './types';
import { analyzeDataset } from './services/geminiService';
import { 
  Loader2, RotateCcw, Play, 
  Database, Box, Key, Table, Trash2, 
  ChevronRight, ShieldAlert, CreditCard, X
} from 'lucide-react';

const ANALYSIS_STAGES = [
  "Initializing Nexus Core...",
  "Synchronizing Relational Schemas...",
  "Applying Multi-Page Architectures...",
  "Heuristic Insight Generation...",
  "Finalizing Data Workspace..."
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
      interval = window.setInterval(() => {
        setLoadingStage(prev => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
      }, 2000);
    } else {
      setLoadingStage(0);
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
    }
  };

  const triggerAnalysis = async () => {
    if (state.datasets.length === 0) return;

    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await handleOpenKeySelector();
      }
    }

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
      
      if (
        errorMessage.includes("Requested entity was not found") || 
        errorMessage.includes("API Key") || 
        errorMessage.includes("401") || 
        errorMessage.includes("403")
      ) {
        errorMessage = "The AI Engine encountered an authentication issue. Please ensure your project has billing enabled.";
        // Proactively open key selector as per instructions for 404/401
        handleOpenKeySelector();
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
        hasError={!!state.error}
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
            <div className="max-w-4xl mx-auto mt-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100 dark:border-blue-800">
                  <Database size={14} /> AI-Powered BI Platform
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                  Relational Data <span className="text-blue-600 dark:text-blue-400">Synthesis</span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                  Nexus analyzes disparate datasets to generate professional reports. 
                  Upload your files to begin the architectural mapping phase.
                </p>
              </div>
              <FileUploader onUpload={handleAddDataset} isDark={isDark} />
            </div>
          ) : state.isAnalyzing ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-md z-50">
               <div className="relative mb-12">
                  <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-[80px] animate-pulse"></div>
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
                  </div>
               </div>
               <div className="text-center space-y-6 max-w-sm px-6">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white transition-all duration-1000 tracking-tight">
                    {ANALYSIS_STAGES[loadingStage]}
                  </h3>
                  <div className="flex gap-2 justify-center">
                    {ANALYSIS_STAGES.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-1000 ${i <= loadingStage ? 'w-12 bg-blue-600' : 'w-2 bg-slate-200 dark:bg-slate-800'}`} />
                    ))}
                  </div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Processing relational architecture...</p>
               </div>
            </div>
          ) : !state.analysis ? (
             <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
                {state.error && (
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-3xl p-6 shadow-lg animate-in slide-in-from-top-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-2xl flex-shrink-0">
                        <ShieldAlert className="text-red-600 w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-lg font-black text-red-900 dark:text-red-400">Relational Engine Fault</h4>
                          <button onClick={() => setState(s => ({ ...s, error: null }))} className="text-red-400 hover:text-red-600 transition-colors">
                            <X size={18} />
                          </button>
                        </div>
                        <p className="text-red-700 dark:text-red-300/80 font-medium text-sm leading-relaxed mb-4">
                          {state.error}
                        </p>
                        <div className="flex gap-3">
                           <button onClick={handleOpenKeySelector} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-all shadow-md shadow-red-600/20">
                             <Key size={14} /> Update Project Key
                           </button>
                           <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl font-bold text-xs hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                             <CreditCard size={14} /> Billing Help
                           </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[48px] p-12 shadow-xl overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none translate-x-1/4 -translate-y-1/4">
                      <Database size={400} className="text-blue-600" />
                   </div>
                   <div className="relative z-10">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 mb-16">
                         <div className="max-w-xl">
                            <div className="flex items-center gap-4 mb-4">
                               <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                                 <Box className="text-white w-7 h-7" />
                               </div>
                               <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Workspace Ready</h2>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-xl leading-relaxed">
                               Multiple datasets detected. Nexus is prepared to synthesize the data relationships and architect your report.
                            </p>
                         </div>
                         <div className="flex gap-4 w-full lg:w-auto">
                            <button onClick={triggerAnalysis} className="flex-1 lg:flex-none flex items-center justify-center gap-4 px-12 py-7 bg-blue-600 text-white rounded-[28px] font-black text-2xl shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-2 transition-all active:scale-95 group">
                               <Play size={28} className="fill-current" />
                               Analyze Datasets
                               <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                            </button>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                         {state.datasets.map(ds => (
                            <div key={ds.id} className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800 flex flex-col justify-between group transition-all hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-2xl hover:bg-white dark:hover:bg-slate-800">
                               <div>
                                  <div className="flex items-center justify-between mb-10">
                                     <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">
                                        <Table className="text-blue-600" size={28} />
                                     </div>
                                     <button onClick={() => removeDataset(ds.id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                                        <Trash2 size={24} />
                                     </button>
                                  </div>
                                  <h4 className="font-black text-slate-900 dark:text-white truncate mb-3 text-2xl">{ds.name}</h4>
                                  <div className="flex items-center gap-4">
                                     <span className="text-[11px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest">{ds.rowCount} Records</span>
                                     <span className="text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest">{ds.columns.length} Fields</span>
                                  </div>
                               </div>
                            </div>
                         ))}
                         <div onClick={() => document.getElementById('file-input')?.click()} className="p-10 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-slate-400 hover:text-blue-600 hover:border-blue-400 group">
                            <Box size={48} className="group-hover:scale-125 transition-transform duration-500" />
                            <span className="font-black text-sm uppercase tracking-[0.2em]">Add Table</span>
                         </div>
                      </div>
                   </div>
                </div>
                <FileUploader onUpload={handleAddDataset} isDark={isDark} compact />
             </div>
          ) : (
            <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in zoom-in-95 duration-1000">
              <Dashboard analysis={state.analysis} data={filteredData} isDark={isDark} activePageId={state.activePageId} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
