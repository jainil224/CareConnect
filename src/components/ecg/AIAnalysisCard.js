import React, { useState, useEffect } from 'react';
import { Brain, FileText, Loader, CheckCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import ECGReportTemplate from './ECGReportTemplate';
import { createRoot } from 'react-dom/client';

export default function AIAnalysisCard({ summary, recommendations = [], isProcessing, result, features }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [showRecs, setShowRecs] = useState(false);
  const [typedCount, setTypedCount] = useState(0);

  // Typewriter effect
  useEffect(() => {
    if (!summary || isProcessing) {
      setDisplayedText("");
      setShowRecs(false);
      setTypedCount(0);
      return;
    }

    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(summary.substring(0, i));
      setTypedCount(i);
      i++;
      if (i > summary.length) {
        clearInterval(intervalId);
        // Show recommendations list with delay after typewriter completes
        setTimeout(() => setShowRecs(true), 250);
      }
    }, 15); // faster, smooth typing speed

    return () => clearInterval(intervalId);
  }, [summary, isProcessing]);

  const handleDownload = async () => {
    if (!summary || isDownloading) return;
    setIsDownloading(true);

    try {
      // 1. Create a temporary container in the DOM
      const container = document.createElement('div');
      // Hide it off-screen
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // 2. Render the React component into the container
      const root = createRoot(container);
      
      // We wrap it in a Promise to wait for React to finish rendering
      await new Promise(resolve => {
        root.render(
          <div id="pdf-wrapper">
            <ECGReportTemplate result={result} features={features} summary={summary} />
          </div>
        );
        // Give React a moment to flush to DOM
        setTimeout(resolve, 500);
      });

      // 3. Select the element to convert
      const element = container.querySelector('#ecg-pdf-report');

      // 4. Configure html2pdf
      const opt = {
        margin:       0,
        filename:     `CareConnect_ECG_Report_${new Date().getTime()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // 5. Generate and save PDF
      await html2pdf().set(opt).from(element).save();

      // 6. Cleanup
      root.unmount();
      document.body.removeChild(container);

    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const hasRecommendations = recommendations && recommendations.length > 0;

  return (
    <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      
      {/* Dynamic staggered anim entry */}
      <style>{`
        @keyframes fade-slide-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stagger-recommendation {
          animation: fade-slide-in 0.45s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <Brain className={`w-6 h-6 text-cyan-400 ${isProcessing ? 'animate-pulse' : ''}`} />
        </div>
        <h3 className="text-lg font-semibold text-blue-100">AI Medical Summary</h3>
      </div>

      <div className="min-h-[160px] bg-zinc-900/50 border border-zinc-800/40 rounded-xl p-5 relative">
        {isProcessing ? (
          <div className="flex items-center space-x-3 text-blue-200/50 mt-4 justify-center">
            <span className="flex space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
            <span className="text-sm font-semibold tracking-wide animate-pulse">Synthesizing clinical data...</span>
          </div>
        ) : summary ? (
          <div className="space-y-5">
            <div>
              <p className="text-blue-100 leading-relaxed text-sm">
                {displayedText}
                {typedCount < summary.length && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse"></span>
                )}
              </p>
            </div>
            
            {/* Staggered bullet recommendations */}
            {showRecs && hasRecommendations && (
              <div className="space-y-2 border-t border-zinc-800/80 pt-4 animate-fade-in">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2.5">
                  Cardiac Recommendations
                </h4>
                <ul className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <li 
                      key={index} 
                      className="stagger-recommendation flex items-start text-xs text-zinc-300 leading-relaxed"
                      style={{ animationDelay: `${index * 300}ms` }}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-2 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-[10px] text-zinc-500 italic leading-tight">
                *This analysis is AI-generated and should not replace professional medical advice.
              </span>
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center self-end px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-cyan-400 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(59,130,246,0.1)]"
              >
                {isDownloading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                {isDownloading ? 'Generating PDF...' : 'Download Report'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-blue-200/30 text-sm italic text-center">
              Upload an ECG to generate an AI clinical summary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
