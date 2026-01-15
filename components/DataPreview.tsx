
import React from 'react';
import { DataRow } from '../types';

interface DataPreviewProps {
  data: DataRow[];
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const previewData = data.slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Dataset Preview</h3>
        <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
          Showing 10 of {data.length} rows
        </span>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-6 py-4 font-semibold border-b border-slate-100">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {previewData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                {columns.map((col) => (
                  <td key={col} className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
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
