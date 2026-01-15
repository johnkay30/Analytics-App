import React, { useState, useMemo } from 'react';
import { DashboardAnalysis, DataRow, KPIConfig, ChartConfig, DashboardLayout } from '../types';
import { KPICard } from './KPICard';
import { ChartWidget } from './ChartWidget';
import { KPIDetailDrawer } from './KPIDetailDrawer';
import { Sparkles, TrendingUp, Info, Settings2, Save, RotateCcw, Eye, EyeOff, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, LayoutGrid, BarChartHorizontal, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  analysis: DashboardAnalysis;
  data: DataRow[];
  isDark: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ analysis, data, isDark }) => {
  const [selectedKPI, setSelectedKPI] = useState<KPIConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Basic validation to prevent white screen on malformed analysis
  if (!analysis || !Array.isArray(analysis.kpis) || !Array.isArray(analysis.charts)) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Analysis Structure Invalid</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">The AI returned a non-standard response. Please try analyzing again.</p>
      </div>
    );
  }

  const datasetKey = useMemo(() => {
    try {
      const kpiIds = (analysis.kpis || []).map(k => k.id).sort().join(',');
      return `nexus_multi_layout_${btoa(kpiIds).slice(0, 16)}`;
    } catch (e) {
      return 'nexus_default_layout';
    }
  }, [analysis]);

  const [layout, setLayout] = useState<DashboardLayout>(() => {
    try {
      const saved = localStorage.getItem(datasetKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    
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
      const currentOrder = [...(prev[orderKey] || [])];
      const index = currentOrder.indexOf(id);
      const newIndex = index + direction;
      
      if (newIndex < 0 || newIndex >= currentOrder.length) return prev;
      
      const [removed] = currentOrder.splice(index, 1);
      currentOrder.splice(newIndex, 0, removed);
      
      return { ...prev, [orderKey]: currentOrder };
    });
  };

  const visibleKPIs = useMemo(() => {
    const order = Array.isArray(layout.kpiOrder) ? layout.kpiOrder : [];
    return order
      .map(id => analysis.kpis.find(k => k.id === id))
      .filter((k): k is KPIConfig => !!k && (isEditing || !layout.hiddenIds.includes(k.id)));
  }, [analysis.kpis, layout, isEditing]);

  const visibleCharts = useMemo(() => {
    const order = Array.isArray(layout.chartOrder) ? layout.chartOrder : [];
    return order
      .map(id => analysis.charts.find(c => c.id === id))
      .filter((c): c is ChartConfig => !!c && (isEditing || !layout.hiddenIds.includes(c.id)));
  }, [analysis.charts, layout, isEditing]);

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/5 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-2">
            <BarChartHorizontal size={14} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Relational Metrics Stream</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400">Multi-Source Synchronized</span>
          </div>
        </div>
        <div className="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
          {visibleKPIs.map((kpi) => (
            <div key={kpi.id} className="relative group flex-shrink-0">
              <KPICard 
                config={kpi} 
                data={data} 
                variant="compact"
                onClick={() => !isEditing && setSelectedKPI(kpi)}
              />
              {isEditing && (
                <div className="absolute inset-0 z-10 bg-indigo-600/10 backdrop-blur-[2px] border-2 border-dashed border-indigo-400 rounded-xl flex items-center justify-center gap-1">
                  <button onClick={() => moveItem('kpi', kpi.id, -1)} className="p-1.5 bg-white dark:bg-slate-800 rounded shadow hover:bg-indigo-600 hover:text-white transition-colors"><ArrowLeft size={12}/></button>
                  <button onClick={() => toggleVisibility(kpi.id)} className="p-1.5 bg-white dark:bg-slate-800 rounded shadow hover:bg-indigo-600 hover:text-white transition-colors"><EyeOff size={12}/></button>
                  <button onClick={() => moveItem('kpi', kpi.id, 1)} className="p-1.5 bg-white dark:bg-slate-800 rounded shadow hover:bg-indigo-600 hover:text-white transition-colors"><ArrowRight size={12}/></button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-full shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none">
                  <Settings2 className="text-white w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white tracking-tight">Intelligence Config</h3>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2 rounded-lg transition-all ${isEditing ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'}`}
              >
                <Settings2 size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-3 tracking-widest">Active Join Context</p>
                {selectedKPI ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedKPI.label}</span>
                      <button onClick={() => setSelectedKPI(null)} className="text-[10px] text-indigo-600 font-bold hover:underline">Clear</button>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                      <Info size={14} /> Harmonizing visuals around this metric
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Select a cross-table metric to isolate insights.</p>
                )}
              </div>

              {isEditing && (
                <div className="space-y-2 animate-in slide-in-from-top duration-300">
                   <button onClick={saveLayout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 hover:bg-indigo-700">
                    <Save size={14} /> Save Relational View
                  </button>
                  <button onClick={resetLayout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs hover:bg-slate-200">
                    <RotateCcw size={14} /> Restore Default Map
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 h-full transition-colors overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles size={120} className="text-indigo-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Relational Summary</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-6 max-w-2xl">
                {analysis.summary || "No summary available."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(analysis.insights || []).map((insight, idx) => (
                  <div key={idx} className="flex gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                      <TrendingUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-normal">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <LayoutGrid size={18} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Cross-Dataset Visualizations</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Query Engine Active</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <div className="px-3 py-1 bg-white dark:bg-slate-700 rounded shadow-sm text-[10px] font-bold text-indigo-600">GRID VIEW</div>
            </div>
          </div>
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