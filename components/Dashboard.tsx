
import React, { useState, useEffect, useMemo } from 'react';
import { DashboardAnalysis, DataRow, KPIConfig, ChartConfig, DashboardLayout } from '../types';
import { KPICard } from './KPICard';
import { ChartWidget } from './ChartWidget';
import { KPIDetailDrawer } from './KPIDetailDrawer';
import { Sparkles, TrendingUp, Info, Settings2, Save, RotateCcw, Eye, EyeOff, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface DashboardProps {
  analysis: DashboardAnalysis;
  data: DataRow[];
  isDark: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ analysis, data, isDark }) => {
  const [selectedKPI, setSelectedKPI] = useState<KPIConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const datasetKey = useMemo(() => {
    const cols = Object.keys(data[0] || {}).sort().join(',');
    return `nexus_layout_${btoa(cols).slice(0, 16)}`;
  }, [data]);

  const [layout, setLayout] = useState<DashboardLayout>(() => {
    const saved = localStorage.getItem(datasetKey);
    if (saved) return JSON.parse(saved);
    return {
      kpiOrder: analysis.kpis.map(k => k.id),
      chartOrder: analysis.charts.map(c => c.id),
      hiddenIds: []
    };
  });

  const saveLayout = () => {
    localStorage.setItem(datasetKey, JSON.stringify(layout));
    setIsEditing(false);
  };

  const resetLayout = () => {
    const defaultLayout = {
      kpiOrder: analysis.kpis.map(k => k.id),
      chartOrder: analysis.charts.map(c => c.id),
      hiddenIds: []
    };
    setLayout(defaultLayout);
    localStorage.removeItem(datasetKey);
  };

  const toggleVisibility = (id: string) => {
    setLayout(prev => ({
      ...prev,
      hiddenIds: prev.hiddenIds.includes(id) 
        ? prev.hiddenIds.filter(h => h !== id) 
        : [...prev.hiddenIds, id]
    }));
  };

  const moveItem = (type: 'kpi' | 'chart', id: string, direction: number) => {
    setLayout(prev => {
      const orderKey = type === 'kpi' ? 'kpiOrder' : 'chartOrder';
      const currentOrder = [...prev[orderKey]];
      const index = currentOrder.indexOf(id);
      const newIndex = index + direction;
      
      if (newIndex < 0 || newIndex >= currentOrder.length) return prev;
      
      const [removed] = currentOrder.splice(index, 1);
      currentOrder.splice(newIndex, 0, removed);
      
      return { ...prev, [orderKey]: currentOrder };
    });
  };

  const visibleKPIs = useMemo(() => {
    return layout.kpiOrder
      .map(id => analysis.kpis.find(k => k.id === id))
      .filter((k): k is KPIConfig => !!k && (isEditing || !layout.hiddenIds.includes(k.id)));
  }, [analysis.kpis, layout, isEditing]);

  const visibleCharts = useMemo(() => {
    return layout.chartOrder
      .map(id => analysis.charts.find(c => c.id === id))
      .filter((c): c is ChartConfig => !!c && (isEditing || !layout.hiddenIds.includes(c.id)));
  }, [analysis.charts, layout, isEditing]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 sticky top-20 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md py-4 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Settings2 className="text-white w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Workspace</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={resetLayout}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-bold text-sm transition-colors"
              >
                <RotateCcw size={16} />
                Reset Defaults
              </button>
              <button 
                onClick={saveLayout}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Save size={16} />
                Save Configuration
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
            >
              <Settings2 size={16} />
              Customize Layout
            </button>
          )}
        </div>
      </div>

      <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Intelligence</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
          {analysis.summary}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.insights.map((insight, idx) => (
            <div key={idx} className="flex gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
              <TrendingUp className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{insight}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <Info className="text-slate-400 dark:text-slate-500 w-5 h-5" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Nexus Primary Metrics</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleKPIs.map((kpi) => (
            <div key={kpi.id} className="relative group">
              <KPICard 
                config={kpi} 
                data={data} 
                onClick={() => !isEditing && setSelectedKPI(kpi)}
              />
              {isEditing && (
                <div className="absolute inset-0 z-10 bg-indigo-50/60 dark:bg-indigo-950/60 backdrop-blur-[1px] border-2 border-dashed border-indigo-400 dark:border-indigo-600 rounded-2xl flex flex-col items-center justify-center gap-3 p-4">
                  <div className="flex gap-2">
                    <button onClick={() => moveItem('kpi', kpi.id, -1)} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white transition-colors text-slate-700 dark:text-slate-300"><ArrowLeft size={16}/></button>
                    <button onClick={() => moveItem('kpi', kpi.id, 1)} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white transition-colors text-slate-700 dark:text-slate-300"><ArrowRight size={16}/></button>
                  </div>
                  <button 
                    onClick={() => toggleVisibility(kpi.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-sm ${layout.hiddenIds.includes(kpi.id) ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  >
                    {layout.hiddenIds.includes(kpi.id) ? <><Eye size={14}/> Show Metric</> : <><EyeOff size={14}/> Hide Metric</>}
                  </button>
                  {layout.hiddenIds.includes(kpi.id) && <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-[10px] rounded font-bold uppercase tracking-widest">Hidden in View</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Advanced Data Visualizations</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Synthesized by Nexus Intelligence Engine</span>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {visibleCharts.map((chart) => (
            <div key={chart.id} className="relative group">
              <ChartWidget config={chart} data={data} isDark={isDark} />
              {isEditing && (
                <div className="absolute inset-0 z-10 bg-indigo-50/60 dark:bg-indigo-950/60 backdrop-blur-[1px] border-2 border-dashed border-indigo-400 dark:border-indigo-600 rounded-2xl flex flex-col items-center justify-center gap-4 p-8">
                   <div className="flex gap-4">
                    <button onClick={() => moveItem('chart', chart.id, -1)} className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:bg-indigo-600 hover:text-white transition-all scale-110 text-slate-700 dark:text-slate-300"><ArrowUp size={24}/></button>
                    <button onClick={() => moveItem('chart', chart.id, 1)} className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:bg-indigo-600 hover:text-white transition-all scale-110 text-slate-700 dark:text-slate-300"><ArrowDown size={24}/></button>
                  </div>
                  <button 
                    onClick={() => toggleVisibility(chart.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${layout.hiddenIds.includes(chart.id) ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  >
                    {layout.hiddenIds.includes(chart.id) ? <><Eye size={18}/> Restore Chart</> : <><EyeOff size={18}/> Hide Visualization</>}
                  </button>
                  {layout.hiddenIds.includes(chart.id) && <span className="absolute top-4 left-4 px-3 py-1 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs rounded-full font-bold uppercase tracking-widest">Hidden in Public View</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {selectedKPI && (
        <KPIDetailDrawer 
          kpi={selectedKPI} 
          data={data} 
          onClose={() => setSelectedKPI(null)} 
          isDark={isDark}
        />
      )}
    </div>
  );
};
