
import React, { useState } from 'react';
import { Upload, FileType, CheckCircle2, AlertCircle, Loader2, FileJson, FileSpreadsheet } from 'lucide-react';
import { DatasetMetadata } from '../types';

interface FileUploaderProps {
  onUpload: (dataset: DatasetMetadata) => void;
  isDark?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isDark }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    
    const validTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      setError("Supported formats: CSV, JSON.");
      setIsProcessing(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data: any[] = [];

        if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
        } else {
          const lines = content.split(/\r?\n/).filter(l => l.trim());
          if (lines.length < 2) throw new Error("File has insufficient data.");
          
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          
          data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const obj: any = {};
            headers.forEach((header, i) => {
              const val = values[i];
              const num = Number(val);
              obj[header] = !isNaN(num) && val !== '' ? num : val;
            });
            return obj;
          });
        }
        
        if (data.length > 0) {
          onUpload({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            columns: Object.keys(data[0]),
            data: data,
            rowCount: data.length
          });
          setIsProcessing(false);
        } else {
          setError("Target dataset contains no records.");
          setIsProcessing(false);
        }
      } catch (err) {
        setError("Structural validation failed. Check file formatting.");
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setError("File system read error.");
      setIsProcessing(false);
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
        className={`relative group border-2 border-dashed rounded-3xl p-12 transition-all duration-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-inner' 
            : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-2xl dark:hover:shadow-indigo-500/5'
          } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !isProcessing && document.getElementById('file-input')?.click()}
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
        
        {isProcessing ? (
          <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
            <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-xs">Architecting Data...</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-all duration-500 shadow-sm group-hover:bg-indigo-600 group-hover:text-white">
              <Upload size={32} />
            </div>
            
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Add Dataset to Workspace</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-xs mb-8 font-medium text-sm leading-relaxed">
              Upload multiple files to create relationships. 
              Supports <span className="text-slate-800 dark:text-white font-bold">CSV</span> and <span className="text-slate-800 dark:text-white font-bold">JSON</span>.
            </p>
            
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-extrabold px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-100 dark:border-slate-700 uppercase tracking-tighter">
                <FileSpreadsheet size={12} className="text-green-500" /> Multi-Table Support
              </div>
              <div className="flex items-center gap-2 text-[10px] font-extrabold px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-100 dark:border-slate-700 uppercase tracking-tighter">
                <FileJson size={12} className="text-amber-500" /> Fuzzy Join Engine
              </div>
            </div>
          </>
        )}
      </div>
      
      {error && (
        <div className="mt-4 flex items-center gap-3 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 font-bold text-xs animate-in slide-in-from-top-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};
