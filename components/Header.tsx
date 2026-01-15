
import React from 'react';
import { BarChart3, RotateCcw, LayoutDashboard, Download } from 'lucide-react';
import { DashboardAnalysis } from '../types';

interface HeaderProps {
  onReset?: () => void;
  analysis?: DashboardAnalysis | null;
}

export const Header: React.FC<HeaderProps> = ({ onReset, analysis }) => {
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
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <BarChart3 className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none uppercase">Nexus</h1>
          <span className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold">Analytics BI</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {analysis && (
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all font-medium text-sm border border-indigo-100"
            title="Export analysis to JSON"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export Analysis</span>
          </button>
        )}
        
        {onReset && (
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-medium text-sm border border-transparent hover:border-indigo-100"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        )}

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-slate-500 text-xs font-medium">
          <LayoutDashboard size={14} />
          Nexus Workspace
        </div>
      </div>
    </header>
  );
};
