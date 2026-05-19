import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ECGUploadCard from '../components/ecg/ECGUploadCard';
import ECGResultCard from '../components/ecg/ECGResultCard';
import ECGWaveChart from '../components/ecg/ECGWaveChart';
import HeartAnalytics from '../components/ecg/HeartAnalytics';
import AIAnalysisCard from '../components/ecg/AIAnalysisCard';
import EmergencyAlert from '../components/ecg/EmergencyAlert';
import { predictECG, generateECGSummary } from '../services/ecgApi';
import toast from 'react-hot-toast';

export default function ECGPrediction() {
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [features, setFeatures] = useState(null);
  const [summary, setSummary] = useState("");
  const [showEmergency, setShowEmergency] = useState(false);

  // If a file was passed via router state from ReportUpload.js
  React.useEffect(() => {
    if (location.state?.file) {
      handleECGUpload(location.state.file);
    }
  }, [location.state]);

  const handleECGUpload = async (file) => {
    setIsProcessing(true);
    setResult(null);
    setFeatures(null);
    setSummary("");
    toast.success("ECG file received. Starting AI analysis...");

    try {
      const response = await predictECG(file);
      
      if (response.success) {
        setResult(response.data);
        setFeatures(response.features);
        
        // Check for emergency
        if (response.data.prediction !== "Normal") {
          setTimeout(() => setShowEmergency(true), 2000);
        }

        // Generate text summary
        const aiSummary = await generateECGSummary(response.data, response.features);
        setSummary(aiSummary);
      }
    } catch (error) {
      toast.error("Failed to analyze ECG. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans pb-12 pt-8">
      {/* Abstract Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed top-[30%] right-[20%] w-[20%] h-[20%] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            ECG Intelligence
          </h1>
          <p className="text-blue-200/60 mt-2 text-sm sm:text-base">
            Upload your electrocardiogram data for real-time AI cardiovascular risk assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <ECGUploadCard onUpload={handleECGUpload} />
            
            {result && (
              <ECGResultCard 
                result={result.prediction} 
                probability={result.risk_probability} 
              />
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <ECGWaveChart isProcessing={isProcessing} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HeartAnalytics features={features} />
              <AIAnalysisCard 
                summary={summary} 
                isProcessing={isProcessing} 
                result={result}
                features={features}
              />
            </div>
          </div>
        </div>
      </div>

      <EmergencyAlert isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
    </div>
  );
}
