
import React, { useState, useMemo } from 'react';
import { DashboardAnalysis, DataRow, KPIConfig, ChartConfig } from '../types';
import { KPICard } from './KPICard';
import { ChartWidget } from './ChartWidget';
import { KPIDetailDrawer } from './KPIDetailDrawer';
import { Sparkles, Info, LayoutGrid, InfoIcon } from 'lucide-react';

interface DashboardProps {
  analysis: DashboardAnalysis;
  data: DataRow[];
  isDark: boolean;
  activePageId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ analysis, data, isDark, activePageId }) => {
  const [selectedKPI, setSelectedKPI] = useState<KPIConfig | null>(null);

  const activePage = useMemo(() => {
    return analysis.pages.find(p => p.id === activePageId) || analysis.pages[0];
  }, [analysis.pages, activePageId]);

  const pageKPIs = useMemo(() => {
    return (activePage?.kpiIds || [])
      .map(id => analysis.kpis.find(k => k.id === id))
      .filter((k): k is KPIConfig => !!k);
  }, [activePage, analysis.kpis]);

  const pageCharts = useMemo(() => {
    return (activePage?.chartIds || [])
      .map(id => analysis.charts.find(c => c.id === id))
      .filter((c): c is ChartConfig => !!c);
  }, [activePage, analysis.charts]);

  if (!activePage) return null;

  return (
    <div className="space-y-8 pb-12">
      <section className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Sparkles size={140} className="text-blue-600" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
               <InfoIcon className="text-white" size={24} />
             </div>
             <div>
               <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{activePage.title}</h2>
               <p className="text-slate-500 dark:text-slate-400 font-medium">Smart Narratives & Execution Summary</p>
             </div>
          </div>
          <div className="max-w-4xl">
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {activePage.summary || analysis.summary}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {analysis.insights.slice(0, 3).map((insight, i) => (
              <div key={i} className="p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pageKPIs.map((kpi) => (
          <KPICard 
            key={kpi.id}
            config={kpi} 
            data={data} 
            onClick={() => setSelectedKPI(kpi)}
          />
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <LayoutGrid size={24} className="text-blue-600" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Advanced Visualizations</h3>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {data.length} Records In Context
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {pageCharts.map((chart) => (
            <ChartWidget key={chart.id} config={chart} data={data} isDark={isDark} />
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
