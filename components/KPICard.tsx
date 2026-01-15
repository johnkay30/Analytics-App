
import React from 'react';
import { KPIConfig, DataRow } from '../types';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Maximize2 } from 'lucide-react';

interface KPICardProps {
  config: KPIConfig;
  data: DataRow[];
  onClick: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({ config, data, onClick }) => {
  const calculateValue = () => {
    const values = data.map(row => Number(row[config.valueKey])).filter(v => !isNaN(v));
    
    if (values.length === 0) return 0;

    switch (config.aggregation) {
      case 'sum': return values.reduce((a, b) => a + b, 0);
      case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
      case 'max': return Math.max(...values);
      case 'min': return Math.min(...values);
      case 'count': return values.length;
      default: return 0;
    }
  };

  const rawValue = calculateValue();
  const formattedValue = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: rawValue > 1000 ? 0 : 1,
    notation: rawValue > 1000000 ? 'compact' : 'standard'
  }).format(rawValue);

  const getTrendIcon = () => {
    if (config.trend === 'up') return <ArrowUpRight className="text-green-500 dark:text-green-400" size={16} />;
    if (config.trend === 'down') return <ArrowDownRight className="text-red-500 dark:text-red-400" size={16} />;
    return <Minus className="text-slate-400 dark:text-slate-500" size={16} />;
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Maximize2 size={14} className="text-indigo-400 dark:text-indigo-500" />
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 transition-colors">
          <TrendingUp className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" size={20} />
        </div>
        {getTrendIcon()}
      </div>
      
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 truncate pr-4">{config.label}</p>
      <div className="flex items-baseline gap-1">
        {config.prefix && <span className="text-slate-400 dark:text-slate-500 font-semibold">{config.prefix}</span>}
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
          {formattedValue}
        </span>
        {config.suffix && <span className="text-slate-400 dark:text-slate-500 font-semibold text-sm">{config.suffix}</span>}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter font-bold">
        <span>{config.aggregation} mode</span>
        <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Analysis Details →</span>
      </div>
    </div>
  );
};
