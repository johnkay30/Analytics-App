
import React from 'react';
import { LayoutDashboard, FileText, Database, Filter, ChevronRight, Check, Activity } from 'lucide-react';
import { DashboardAnalysis, DatasetMetadata, FilterState } from '../types';

interface SidebarProps {
  analysis: DashboardAnalysis;
  activePageId: string;
  onPageChange: (id: string) => void;
  datasets: DatasetMetadata[];
  filters: FilterState;
  onFilterChange: (col: string, values: any[]) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  analysis, 
  activePageId, 
  onPageChange, 
  datasets,
  filters,
  onFilterChange
}) => {
  const primaryData = datasets[0]?.data || [];

  const getDimensionOptions = (col: string) => {
    const counts: { [key: string]: number } = {};
    primaryData.forEach(r => {
      const val = String(r[col] || 'Other');
      counts[val] = (counts[val] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  };

  return (
    <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full transition-colors z-20">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
          <FileText size={12} /> Navigation
        </h3>
        <nav className="space-y-2">
          {analysis.pages.map((page) => (
            <button
              key={page.id}
              onClick={() => onPageChange(page.id)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all group ${
                activePageId === page.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={18} />
                <span className="font-bold text-sm tracking-tight">{page.title}</span>
              </div>
              <ChevronRight size={14} className={`transition-transform duration-300 ${activePageId === page.id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
          <Filter size={12} /> Slicers
        </h3>
        <div className="space-y-8">
          {analysis.dimensions.map((dim) => {
            const options = getDimensionOptions(dim);
            if (options.length === 0) return null;
            
            return (
              <div key={dim} className="space-y-3">
                <label className="text-[11px] font-black text-slate-800 dark:text-slate-200 tracking-tight block border-b border-slate-100 dark:border-slate-800 pb-2 flex justify-between">
                  <span>{dim}</span>
                  <span className="text-[9px] text-slate-400">{options.length} Values</span>
                </label>
                <div className="space-y-1">
                  {options.map(([opt, count]) => {
                    const isSelected = filters[dim]?.includes(opt);
                    return (
                      <button
                        key={String(opt)}
                        onClick={() => {
                          const current = filters[dim] || [];
                          const next = isSelected 
                            ? current.filter(v => v !== opt) 
                            : [...current, opt];
                          onFilterChange(dim, next);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-all ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-700'
                          }`}>
                            {isSelected && <Check size={10} className="text-white" />}
                          </div>
                          <span className="truncate max-w-[140px] text-left">{String(opt)}</span>
                        </div>
                        <span className="text-[9px] opacity-60 tabular-nums">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <Database className="text-blue-600" size={18} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-50 dark:border-slate-900 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Activity size={10} className="text-blue-500" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Readiness Level</p>
            </div>
            <p className="text-xs font-black text-slate-700 dark:text-slate-300">Authorized • V3.1</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
