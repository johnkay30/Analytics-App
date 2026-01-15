
import React from 'react';
import { DataRow } from '../types';

interface DataPreviewProps {
  data: DataRow[];
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const previewData = data.slice(0, 10);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 dark:text-slate-200">Dataset Preview</h3>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
          Showing 10 of {data.length} rows
        </span>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-950/10">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-6 py-4 font-semibold border-b border-slate-100 dark:border-slate-800">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {previewData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                {columns.map((col) => (
                  <td key={col} className="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
