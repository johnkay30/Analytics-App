
import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, Bar, 
  LineChart, Line, 
  AreaChart, Area, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { ChartConfig, ChartType, DataRow } from '../types';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';

interface ChartWidgetProps {
  config: ChartConfig;
  data: DataRow[];
  isDark?: boolean;
}

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#4f46e5'];

export const ChartWidget: React.FC<ChartWidgetProps> = ({ config, data, isDark }) => {
  const processedData = useMemo(() => {
    if (!data.length) return [];
    
    const agg: { [key: string]: number } = {};
    const count: { [key: string]: number } = {};

    data.forEach(row => {
      const xVal = String(row[config.xAxisKey] || 'Other');
      const yVal = Number(row[config.yAxisKey]);
      if (!isNaN(yVal)) {
        agg[xVal] = (agg[xVal] || 0) + yVal;
        count[xVal] = (count[xVal] || 0) + 1;
      }
    });

    return Object.entries(agg).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
      avg: Number((value / count[name]).toFixed(2))
    })).sort((a, b) => b.value - a.value).slice(0, 15);
  }, [data, config]);

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';

  const renderChart = () => {
    if (processedData.length === 0) return (
      <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No valid data for this visual context</div>
    );

    switch (config.type) {
      case ChartType.BAR:
        return (
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="name" stroke={textColor} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke={textColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => Intl.NumberFormat('en', { notation: 'compact' }).format(v)} />
            <Tooltip 
              contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={24} />
          </BarChart>
        );
      case ChartType.AREA:
        return (
          <AreaChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="name" stroke={textColor} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke={textColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => Intl.NumberFormat('en', { notation: 'compact' }).format(v)} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#7c3aed" fill="#7c3aed33" strokeWidth={3} />
          </AreaChart>
        );
      case ChartType.PIE:
        return (
          <PieChart>
            <Pie data={processedData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {processedData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        );
      case ChartType.LINE:
      default:
        return (
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="name" stroke={textColor} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke={textColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => Intl.NumberFormat('en', { notation: 'compact' }).format(v)} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: '#2563eb' }} activeDot={{ r: 6 }} />
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[480px] hover:shadow-xl transition-all duration-500 group">
      <div className="mb-8">
        <div className="flex items-start justify-between">
           <h4 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{config.title}</h4>
           <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
             <Info size={16} className="text-slate-400" />
           </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">{config.description}</p>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
           <TrendingUp size={12} className="text-green-500" />
           Confidence: 98%
        </div>
        <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Full Details</button>
      </div>
    </div>
  );
};
