
export interface DataRow {
  [key: string]: any;
}

export enum ChartType {
  BAR = 'BAR',
  LINE = 'LINE',
  PIE = 'PIE',
  AREA = 'AREA',
  SCATTER = 'SCATTER'
}

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  xAxisKey: string;
  yAxisKey: string;
  categoryKey?: string;
  description: string;
}

export interface KPIConfig {
  id: string;
  label: string;
  valueKey: string;
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min';
  prefix?: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface DashboardAnalysis {
  summary: string;
  kpis: KPIConfig[];
  charts: ChartConfig[];
  insights: string[];
}

export interface DashboardLayout {
  kpiOrder: string[]; // List of IDs in order
  chartOrder: string[]; // List of IDs in order
  hiddenIds: string[]; // List of hidden element IDs
}

export interface AppState {
  data: DataRow[];
  columns: string[];
  isAnalyzing: boolean;
  analysis: DashboardAnalysis | null;
  error: string | null;
}
