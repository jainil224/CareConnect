import React, { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Loader, RefreshCw } from 'lucide-react';
import { detectReportType } from '../../utils/ReportTypeDetector';

export default function ECGUploadCard({ onUpload }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    setLoading(true);
    // Simulate parsing/uploading time
    setTimeout(() => {
      const type = detectReportType(file);
      onUpload(file, type);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-[#0c0c0e]/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-[0_0_40px_rgba(14,165,233,0.05)] relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(14,165,233,0.1)]">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none"></div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Upload ECG Record
        </h3>
        <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-cyan-400 font-medium tracking-wide uppercase">
          AI Auto-Detect
        </span>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 
          ${dragActive ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-zinc-800/50 bg-zinc-900/30 hover:border-cyan-400/60 hover:bg-cyan-500/5'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="ecg-upload"
          className="hidden" 
          accept=".pdf,.png,.jpg,.jpeg,.csv"
          onChange={handleChange}
          disabled={loading}
        />
        
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <Loader className="w-12 h-12 text-cyan-400 animate-spin" />
            <p className="text-cyan-400 font-medium animate-pulse">Analyzing file parameters...</p>
          </div>
        ) : (
          <label htmlFor="ecg-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <p className="text-blue-100 font-medium mb-1">Drag & drop your ECG report</p>
              <p className="text-sm text-blue-200/60">or click to browse from your device</p>
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-blue-200/50">
              <span className="flex items-center"><FileText className="w-3 h-3 mr-1" /> PDF, CSV</span>
              <span className="flex items-center"><ImageIcon className="w-3 h-3 mr-1" /> PNG, JPG</span>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}
