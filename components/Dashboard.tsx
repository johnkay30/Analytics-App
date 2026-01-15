
import React from 'react';
import { DashboardAnalysis, DataRow } from '../types';
import { KPICard } from './KPICard';
import { ChartWidget } from './ChartWidget';
import { Sparkles, TrendingUp, Info } from 'lucide-react';

interface DashboardProps {
  analysis: DashboardAnalysis;
  data: DataRow[];
}

export const Dashboard: React.FC<DashboardProps> = ({ analysis, data }) => {
  return (
    <div className="space-y-10">
      {/* Summary Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-indigo-600 w-6 h-6" />
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Intelligence</h2>
        </div>
        <p className="text-slate-600 text-lg leading-relaxed mb-6">
          {analysis.summary}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.insights.map((insight, idx) => (
            <div key={idx} className="flex gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
              <TrendingUp className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <p className="text-sm text-slate-700 font-medium">{insight}</p>
            </div>
          ))}
        </div>
      </section>

      {/* KPIs Grid */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Info className="text-slate-400 w-5 h-5" />
          <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Nexus Primary Metrics</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {analysis.kpis.map((kpi) => (
            <KPICard key={kpi.id} config={kpi} data={data} />
          ))}
        </div>
      </section>

      {/* Charts Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Advanced Data Visualizations</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Synthesized by Nexus Intelligence Engine</span>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {analysis.charts.map((chart) => (
            <ChartWidget key={chart.id} config={chart} data={data} />
          ))}
        </div>
      </section>
    </div>
  );
};
