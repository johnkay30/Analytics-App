
import React from 'react';
import { KPIConfig, DataRow } from '../types';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KPICardProps {
  config: KPIConfig;
  data: DataRow[];
}

export const KPICard: React.FC<KPICardProps> = ({ config, data }) => {
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
    if (config.trend === 'up') return <ArrowUpRight className="text-green-500" size={16} />;
    if (config.trend === 'down') return <ArrowDownRight className="text-red-500" size={16} />;
    return <Minus className="text-slate-400" size={16} />;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
          <TrendingUp className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={20} />
        </div>
        {getTrendIcon()}
      </div>
      
      <p className="text-slate-500 text-sm font-medium mb-1 truncate">{config.label}</p>
      <div className="flex items-baseline gap-1">
        {config.prefix && <span className="text-slate-400 font-semibold">{config.prefix}</span>}
        <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
          {formattedValue}
        </span>
        {config.suffix && <span className="text-slate-400 font-semibold text-sm">{config.suffix}</span>}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-tighter font-bold">
        <span>Aggregation: {config.aggregation}</span>
        <span>{data.length} Rows</span>
      </div>
    </div>
  );
};
