import React, { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Loader, CheckCircle, RefreshCw } from 'lucide-react';

export default function ECGUploadCard({ onUpload, isProcessing, currentStage }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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
      setupFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setupFile(e.target.files[0]);
    }
  };

  const setupFile = (file) => {
    setSelectedFile(file);
    
    // Generate image preview if it's an image
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    onUpload(file);
  };

  const getStagePercentage = () => {
    switch (currentStage) {
      case "Uploading": return 25;
      case "Extracting": return 55;
      case "Analyzing": return 80;
      case "Complete": return 100;
      default: return 0;
    }
  };

  const getStageLabel = () => {
    switch (currentStage) {
      case "Uploading": return "Transmission of raw clinical telemetry...";
      case "Extracting": return "Executing first page high-DPI rasterization...";
      case "Analyzing": return "Interrogating Gemini AI neural cardiologist model...";
      case "Complete": return "Cardiovascular diagnostics compiled successfully.";
      default: return "Awaiting document telemetry feed...";
    }
  };

  const hasPreview = selectedFile || isProcessing;

  return (
    <div className="bg-[#0c0c0e]/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-[0_0_40px_rgba(14,165,233,0.05)] relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(14,165,233,0.1)]">
      
      {/* Styles for animated marching ants border */}
      <style>{`
        @keyframes marching-ants {
          0% { background-position: 0 0, 0 100%, 0 0, 100% 0; }
          100% { background-position: 40px 0, -40px 100%, 0 -40px, 100% 40px; }
        }
        .marching-ants-border {
          background-image: 
            linear-gradient(90deg, #00e5ff 50%, transparent 50%), 
            linear-gradient(90deg, #00e5ff 50%, transparent 50%), 
            linear-gradient(0deg, #00e5ff 50%, transparent 50%), 
            linear-gradient(0deg, #00e5ff 50%, transparent 50%);
          background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
          background-size: 20px 2px, 20px 2px, 2px 20px, 2px 20px;
          animation: marching-ants 0.85s linear infinite;
        }
      `}</style>

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
        className={`relative rounded-xl p-8 text-center transition-all duration-300 min-h-[220px] flex flex-col justify-center items-center overflow-hidden
          ${dragActive ? 'marching-ants-border bg-cyan-400/5 shadow-[0_0_25px_rgba(0,229,255,0.2)]' : 'border-2 border-dashed border-zinc-800/80 bg-zinc-900/30 hover:border-cyan-400/50 hover:bg-cyan-500/5'}`}
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
          disabled={isProcessing}
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-4 animate-fade-in">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin"></div>
              <Upload className="absolute inset-0 m-auto w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <p className="text-cyan-400 font-bold tracking-wide uppercase text-xs">AI Extraction Pipeline</p>
              <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold">{currentStage} state active</p>
            </div>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-4 w-full animate-fade-in">
            {previewUrl ? (
              <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-cyan-400/40 shadow-[0_0_15px_rgba(0,229,255,0.15)] bg-black">
                <img src={previewUrl} alt="ECG Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <FileText className="w-8 h-8 text-cyan-400" />
              </div>
            )}
            
            <div className="text-center max-w-xs">
              <p className="text-blue-100 font-bold text-sm truncate">{selectedFile.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>

            <label 
              htmlFor="ecg-upload"
              className="flex items-center px-4 py-1.5 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-xs text-zinc-300 rounded-lg cursor-pointer transition-all hover:border-cyan-400/40"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Replace File
            </label>
          </div>
        ) : (
          <label htmlFor="ecg-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-4 w-full">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-cyan-400 animate-pulse" />
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

      {/* 5-Stage Animated Clinical Progress Tracker */}
      {currentStage && (
        <div className="mt-6 border-t border-zinc-800/80 pt-4 animate-fade-in">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
              {currentStage} Stage
            </span>
            <span className="text-zinc-500 font-black">
              {getStagePercentage()}%
            </span>
          </div>

          {/* Smooth glowing progress track */}
          <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/40">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(0,229,255,0.4)]"
              style={{ width: `${getStagePercentage()}%` }}
            ></div>
          </div>

          <p className="text-[10px] text-zinc-500 mt-2 italic leading-relaxed">
            {getStageLabel()}
          </p>
        </div>
      )}
    </div>
  );
}
