
export interface DataRow {
  [key: string]: any;
}

export interface DatasetMetadata {
  id: string;
  name: string;
  columns: string[];
  data: DataRow[];
  rowCount: number;
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
  suggestedJoins?: string[]; // AI suggested relationships
}

export interface DashboardLayout {
  kpiOrder: string[];
  chartOrder: string[];
  hiddenIds: string[];
}

export interface AppState {
  datasets: DatasetMetadata[];
  isAnalyzing: boolean;
  analysis: DashboardAnalysis | null;
  error: string | null;
}
