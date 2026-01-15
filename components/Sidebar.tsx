
import React from 'react';
import { LayoutDashboard, FileText, Database, Filter, ChevronRight, Check } from 'lucide-react';
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
    const values = Array.from(new Set(primaryData.map(r => r[col]))).filter(Boolean);
    return values.slice(0, 15); // Limit for UI sanity
  };

  return (
    <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
          <FileText size={12} /> Report Pages
        </h3>
        <nav className="space-y-2">
          {analysis.pages.map((page) => (
            <button
              key={page.id}
              onClick={() => onPageChange(page.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                activePageId === page.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={18} />
                <span className="font-bold text-sm tracking-tight">{page.title}</span>
              </div>
              <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${activePageId === page.id ? 'opacity-100' : ''}`} />
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
          <Filter size={12} /> Global Slicers
        </h3>
        <div className="space-y-8">
          {analysis.dimensions.map((dim) => {
            const options = getDimensionOptions(dim);
            if (options.length === 0) return null;
            
            return (
              <div key={dim} className="space-y-3">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight block border-b border-slate-100 dark:border-slate-800 pb-2">
                  {dim}
                </label>
                <div className="space-y-1">
                  {options.map((opt) => {
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
                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-xs font-medium transition-all ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isSelected && <Check size={10} className="text-white" />}
                        </div>
                        <span className="truncate">{String(opt)}</span>
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
          <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
            <Database className="text-blue-600" size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Engine Status</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nexus Core V3.1</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
