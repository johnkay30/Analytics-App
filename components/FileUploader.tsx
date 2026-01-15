
import React, { useState } from 'react';
import { Upload, FileType, CheckCircle2, AlertCircle } from 'lucide-react';
import { DataRow } from '../types';

interface FileUploaderProps {
  onUpload: (data: DataRow[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    const validTypes = ['text/csv', 'application/json'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      setError("Please upload a valid CSV or JSON file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data: DataRow[] = [];

        if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
        } else {
          // Simple CSV parser
          const lines = content.split('\n').filter(l => l.trim());
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          
          data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const obj: any = {};
            headers.forEach((header, i) => {
              const val = values[i];
              // Try to parse as number
              const num = Number(val);
              obj[header] = !isNaN(num) && val !== '' ? num : val;
            });
            return obj;
          });
        }
        
        if (data.length > 0) {
          onUpload(data);
        } else {
          setError("The file appears to be empty.");
        }
      } catch (err) {
        setError("Error parsing file. Check the format.");
      }
    };
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full">
      <div
        className={`relative group border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50 shadow-inner' 
            : 'border-slate-300 bg-white hover:border-indigo-400 hover:shadow-xl'
          }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".csv,.json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Upload size={32} />
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-2">Drop your dataset here</h3>
        <p className="text-slate-500 text-center max-w-sm mb-6">
          Drag and drop your .csv or .json file, or click to browse.
        </p>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg">
            <FileType size={14} /> CSV Support
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg">
            <CheckCircle2 size={14} className="text-green-500" /> Auto-Analyze
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};
