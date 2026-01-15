
import React from 'react';
import { BarChart3, RotateCcw, LayoutDashboard, Download, Moon, Sun } from 'lucide-react';
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
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `nexus_analysis_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 md:px-6 py-3 md:py-4 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-1.5 md:p-2 rounded-lg">
          <BarChart3 className="text-white w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none uppercase">Nexus</h1>
          <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">Analytics BI</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} className="md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
        </button>

        {analysis && (
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 md:px-4 py-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-all font-medium text-sm border border-indigo-100 dark:border-indigo-800"
            title="Export analysis to JSON"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}
        
        {onReset && (
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-3 md:px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-all font-medium text-sm border border-transparent hover:border-indigo-100 dark:hover:border-slate-700"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-medium">
          <LayoutDashboard size={14} />
          Workspace
        </div>
      </div>
    </header>
  );
};
