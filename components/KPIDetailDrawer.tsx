
import React, { useMemo } from 'react';
import { X, BarChart2, PieChart as PieChartIcon, Info, ListFilter, Sigma } from 'lucide-react';
import { KPIConfig, DataRow } from '../types';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Cell 
} from 'recharts';

interface KPIDetailDrawerProps {
  kpi: KPIConfig;
  data: DataRow[];
  onClose: () => void;
  isDark: boolean;
}

const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

export const KPIDetailDrawer: React.FC<KPIDetailDrawerProps> = ({ kpi, data, onClose, isDark }) => {
  const stats = useMemo(() => {
    const values = data.map(d => Number(d[kpi.valueKey])).filter(v => !isNaN(v));
    if (values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    const firstRow = data[0];
    const categoricalColumn = Object.keys(firstRow).find(key => 
      key !== kpi.valueKey && 
      typeof firstRow[key] === 'string' &&
      new Set(data.map(d => d[key])).size < 20 
    ) || Object.keys(firstRow)[0];

    const grouping: { [key: string]: number } = {};
    data.forEach(row => {
      const cat = String(row[categoricalColumn] || 'Unknown');
      grouping[cat] = (grouping[cat] || 0) + (Number(row[kpi.valueKey]) || 0);
    });

    const chartData = Object.entries(grouping)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg,
      median,
      total: sum,
      count: values.length,
      categoricalColumn,
      chartData
    };
  }, [kpi, data]);

  if (!stats) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-indigo-600 rounded-lg">
                <BarChart2 size={16} className="text-white" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{kpi.label}</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Metric Intelligence Detail</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sigma size={16} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Statistical Distribution</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Minimum', value: stats.min },
                { label: 'Maximum', value: stats.max },
                { label: 'Average', value: stats.avg },
                { label: 'Median', value: stats.median },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-1">{item.label}</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white tabular-nums">
                    {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListFilter size={16} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Contribution by {stats.categoricalColumn}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-full uppercase">Top 8 Segments</span>
            </div>
            
            <div className="h-64 w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 transition-colors">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={11}
                    width={80}
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 500 }}
                  />
                  <Tooltip 
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(79, 70, 229, 0.05)' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      color: isDark ? '#fff' : '#000'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {stats.chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-indigo-900 dark:bg-indigo-950 rounded-2xl p-6 text-white relative overflow-hidden transition-colors">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-indigo-300 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300 dark:text-indigo-400">Nexus Observations</h3>
              </div>
              <p className="text-sm leading-relaxed text-indigo-50/90 dark:text-indigo-200/90 font-medium">
                Analysis of <strong>{stats.count}</strong> records shows a concentration of {kpi.label} 
                within the <strong>{stats.chartData[0]?.name || 'primary'}</strong> segment, which accounts 
                for approximately <strong>{((stats.chartData[0]?.value / stats.total) * 100).toFixed(1)}%</strong> of the total 
                aggregated value.
              </p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 transition-colors">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.98]"
          >
            Close Drill-Down View
          </button>
        </div>
      </div>
    </div>
  );
};
