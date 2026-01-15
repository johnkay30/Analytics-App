
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { Dashboard } from './components/Dashboard';
import { DataPreview } from './components/DataPreview';
import { AppState, DataRow, DashboardAnalysis } from './types';
import { analyzeDataset } from './services/geminiService';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    data: [],
    columns: [],
    isAnalyzing: false,
    analysis: null,
    error: null,
  });

  const handleFileUpload = useCallback(async (data: DataRow[]) => {
    if (data.length === 0) return;

    const columns = Object.keys(data[0]);
    setState(prev => ({ 
      ...prev, 
      data, 
      columns, 
      isAnalyzing: true, 
      error: null,
      analysis: null 
    }));

    try {
      // Send schema and sample of first 10 rows for context
      const sample = data.slice(0, 10);
      const analysis = await analyzeDataset(columns, sample);
      setState(prev => ({ ...prev, analysis, isAnalyzing: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        error: err.message || "Failed to analyze data", 
        isAnalyzing: false 
      }));
    }
  }, []);

  const reset = () => {
    setState({
      data: [],
      columns: [],
      isAnalyzing: false,
      analysis: null,
      error: null,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header 
        onReset={state.data.length > 0 ? reset : undefined} 
        analysis={state.analysis}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {!state.data.length ? (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Nexus Analytics <span className="text-indigo-600">Portal</span>
              </h1>
              <p className="text-lg text-slate-600">
                Upload your business datasets. Our Nexus AI engine will automatically identify critical KPIs, 
                detect hidden trends, and build a professional executive dashboard for you.
              </p>
            </div>
            <FileUploader onUpload={handleFileUpload} />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            {state.isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-slate-800">Nexus AI is analyzing...</h3>
                  <p className="text-slate-500">Extracting intelligence, identifying correlations, and architecting your dashboard.</p>
                </div>
              </div>
            ) : state.error ? (
              <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 p-6 rounded-xl flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-red-800">Analysis Error</h3>
                  <p className="text-red-700 mb-4">{state.error}</p>
                  <button 
                    onClick={reset}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <RotateCcw size={18} />
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                {state.analysis && (
                  <Dashboard analysis={state.analysis} data={state.data} />
                )}
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Raw Dataset Explorer</h2>
                  <DataPreview data={state.data} />
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Nexus Analytics Platform. Powered by Gemini Pro.
        </div>
      </footer>
    </div>
  );
};

export default App;
