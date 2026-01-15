
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
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

interface ChartWidgetProps {
  config: ChartConfig;
  data: DataRow[];
  isDark?: boolean;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const value = payload[0].value;
    const average = dataPoint.average;
    const prevValue = dataPoint.prevValue;

    const diffFromAvg = average ? ((value - average) / average) * 100 : 0;
    const diffFromPrev = prevValue !== undefined ? ((value - prevValue) / prevValue) * 100 : null;

    return (
      <div className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} p-4 rounded-xl border shadow-xl ring-1 ring-black/5 min-w-[220px] animate-in fade-in zoom-in duration-150`}>
        <p className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider mb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-50'} pb-1`}>
          {label || payload[0].name}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-sm" 
                style={{ backgroundColor: payload[0].color || payload[0].fill || COLORS[0] }}
              />
              <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Value</span>
            </div>
            <span className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} tabular-nums`}>
              {new Intl.NumberFormat('en-US').format(value)}
            </span>
          </div>

          <div className={`pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-50'} space-y-2`}>
            <div className="flex items-center justify-between text-[11px]">
              <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
                <Target size={12} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
                <span>Vs. Average</span>
              </div>
              <div className={`flex items-center gap-0.5 font-bold ${diffFromAvg >= 0 ? 'text-green-500' : 'text-amber-500'}`}>
                {diffFromAvg >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(diffFromAvg).toFixed(1)}%
              </div>
            </div>

            {diffFromPrev !== null && isFinite(diffFromPrev) && (
              <div className="flex items-center justify-between text-[11px]">
                <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
                  {diffFromPrev >= 0 ? <TrendingUp size={12} className={isDark ? 'text-slate-600' : 'text-slate-400'} /> : <TrendingDown size={12} className={isDark ? 'text-slate-600' : 'text-slate-400'} />}
                  <span>Period Trend</span>
                </div>
                <div className={`font-bold ${diffFromPrev >= 0 ? 'text-indigo-500' : 'text-rose-500'}`}>
                  {diffFromPrev > 0 ? '+' : ''}{diffFromPrev.toFixed(1)}%
                </div>
              </div>
            )}
          </div>

          <div className={`flex items-center justify-between gap-4 pt-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
            <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} font-bold uppercase tracking-tighter`}>Samples</span>
            <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400 bg-slate-800' : 'text-slate-500 bg-slate-100'} px-1.5 py-0.5 rounded`}>{dataPoint.count}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ChartWidget: React.FC<ChartWidgetProps> = ({ config, data, isDark }) => {
  const processedData = useMemo(() => {
    const agg: { [key: string]: any } = {};
    const count: { [key: string]: number } = {};
    const workingSet = data.slice(0, 100);

    workingSet.forEach(row => {
      const xVal = row[config.xAxisKey];
      const yVal = Number(row[config.yAxisKey]) || 0;
      
      if (!agg[xVal]) {
        agg[xVal] = 0;
        count[xVal] = 0;
      }
      agg[xVal] += yVal;
      count[xVal]++;
    });

    const items = Object.keys(agg).map(key => ({
      name: key,
      value: Number(agg[key].toFixed(2)),
      count: count[key]
    })).sort((a, b) => {
      const valA = isNaN(Number(a.name)) ? a.name : Number(a.name);
      const valB = isNaN(Number(b.name)) ? b.name : Number(b.name);
      return valA < valB ? -1 : 1;
    });

    const totalValue = items.reduce((sum, item) => sum + item.value, 0);
    const seriesAverage = items.length > 0 ? totalValue / items.length : 0;

    return items.map((item, idx) => ({
      ...item,
      average: seriesAverage,
      prevValue: idx > 0 ? items[idx - 1].value : undefined
    }));
  }, [data, config]);

  const textColor = isDark ? '#94a3b8' : '#94a3b8'; // Adjusted axis label color
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';

  const renderChart = () => {
    switch (config.type) {
      case ChartType.BAR:
        return (
          <BarChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val)} />
            <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', radius: 4 }} />
            <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        );
      case ChartType.LINE:
        return (
          <LineChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val)} />
            <Tooltip content={<CustomTooltip isDark={isDark} />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#4f46e5" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: isDark ? '#0f172a' : '#fff' }} 
              activeDot={{ r: 6, strokeWidth: 0 }} 
            />
          </LineChart>
        );
      case ChartType.AREA:
        return (
          <AreaChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val)} />
            <Tooltip content={<CustomTooltip isDark={isDark} />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#4f46e5" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={isDark ? 0.4 : 0.25}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        );
      case ChartType.PIE:
        return (
          <PieChart>
            <Pie
              data={processedData}
              innerRadius={70}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.2)'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip isDark={isDark} />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: isDark ? '#94a3b8' : '#64748b' }} />
          </PieChart>
        );
      default:
        return <div className="flex items-center justify-center h-full text-slate-400 italic">Unsupported visualization type</div>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[450px] hover:shadow-lg dark:hover:shadow-indigo-500/5 transition-all duration-300 group overflow-hidden">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{config.title}</h4>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800"></div>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[90%]">{config.description}</p>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
