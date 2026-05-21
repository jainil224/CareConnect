import React, { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, RefreshCw, Loader2 } from 'lucide-react';

const STAGE_CONFIG = {
  Uploading:  { pct: 25, label: 'Receiving file from device…' },
  Extracting: { pct: 55, label: 'Parsing clinical parameters from document…' },
  Analyzing:  { pct: 82, label: 'Running local ML heart-risk model…' },
  Complete:   { pct: 100, label: 'Analysis complete ✓' },
};

export default function ECGUploadCard({ onUpload, isProcessing, currentStage }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setupFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) setupFile(e.target.files[0]);
  };

  const setupFile = (file) => {
    setSelectedFile(file);
    setPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    onUpload(file);
  };

  const stageInfo = STAGE_CONFIG[currentStage];

  return (
    <div className="ecg-glass overflow-hidden transition-all duration-300">

      {/* Card Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/40 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/20">
            <Upload className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-100 tracking-tight">Upload ECG Record</h3>
        </div>
        <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest
          px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
          Auto-Detect
        </span>
      </div>

      <div className="p-5">
        {/* Drop Zone */}
        <label
          htmlFor="ecg-upload-input"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center rounded-xl
            border-2 border-dashed min-h-[180px] text-center cursor-pointer
            transition-all duration-200 overflow-hidden
            ${isProcessing
              ? 'border-blue-500/30 bg-blue-500/5 cursor-not-allowed'
              : dragActive
                ? 'border-blue-500/60 bg-blue-500/8 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                : selectedFile
                  ? 'border-zinc-300 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-600/80'
                  : 'border-zinc-300 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900/20 hover:border-blue-400 dark:hover:border-blue-500/40 hover:bg-blue-500/5'
            }
          `}
        >
          <input
            id="ecg-upload-input"
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.csv"
            onChange={handleChange}
            disabled={isProcessing}
          />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                <Loader2 className="absolute inset-0 m-auto w-5 h-5 text-blue-400 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">Processing…</p>
                <p className="text-[11px] text-zinc-500 mt-0.5 uppercase tracking-wider">
                  {currentStage} Stage Active
                </p>
              </div>
            </div>

          ) : selectedFile ? (
            <div className="flex flex-col items-center gap-3 py-4 w-full px-4">
              {previewUrl ? (
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-zinc-700">
                  <img src={previewUrl} alt="ECG Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-blue-400" />
                </div>
              )}
              <div className="text-center">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Replace file
              </span>
            </div>

          ) : (
            <div className="flex flex-col items-center gap-3 py-6 px-4">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Upload className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Drag & drop your ECG report</p>
                <p className="text-xs text-zinc-500 mt-1">or click to browse from your device</p>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-600">
                  <FileText className="w-3 h-3" /> PDF · CSV
                </span>
                <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-600">
                  <ImageIcon className="w-3 h-3" /> PNG · JPG
                </span>
              </div>
            </div>
          )}
        </label>

        {/* Progress Bar */}
        {currentStage && stageInfo && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-blue-400 uppercase tracking-wider">{currentStage}</span>
              <span className="font-bold text-zinc-500 dark:text-zinc-400">{stageInfo.pct}%</span>
            </div>
            <div className="h-1.5 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-800/40">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-600 dark:to-blue-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${stageInfo.pct}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-600 italic">{stageInfo.label}</p>
          </div>
        )}

        {/* Format hint */}
        {!currentStage && !isProcessing && (
          <p className="mt-4 text-center text-[11px] text-zinc-500 dark:text-zinc-700">
            Upload a <span className="text-zinc-700 dark:text-zinc-500">PDF ECG report</span> for best parameter extraction accuracy.
          </p>
        )}
      </div>
    </div>
  );
}
