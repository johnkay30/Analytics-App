
import React from 'react';
import { BarChart3, RotateCcw, Download, Moon, Sun, ShieldCheck } from 'lucide-react';
import { DashboardAnalysis } from '../types';

interface HeaderProps {
  onReset?: () => void;
  analysis?: DashboardAnalysis | null;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, analysis, isDark, toggleTheme }) => {
  const handleExport = () => {
    if (!analysis) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `nexus_report_${Date.now()}.json`);
    dl.click();
  };

  return (
    <header className="sticky top-0 z-[60] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between transition-all">
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
          <BarChart3 className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none flex items-center gap-2">
            NEXUS <span className="text-blue-600">ANALYTICS</span>
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[9px] uppercase tracking-widest text-slate-400 font-black">AI RELATIONAL ENGINE ACTIVE</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700">
           <ShieldCheck size={14} className="text-blue-500" />
           Enterprise Secure Workspace
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

        <button 
          onClick={toggleTheme}
          className="p-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {analysis && (
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Download size={18} />
            <span>Export Report</span>
          </button>
        )}
        
        {onReset && (
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all font-bold text-sm"
          >
            <RotateCcw size={18} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>
    </header>
  );
};
