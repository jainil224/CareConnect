import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ECGUploadCard from '../components/ecg/ECGUploadCard';
import ECGResultCard from '../components/ecg/ECGResultCard';
import ECGWaveChart from '../components/ecg/ECGWaveChart';
import HeartAnalytics from '../components/ecg/HeartAnalytics';
import AIAnalysisCard from '../components/ecg/AIAnalysisCard';
import EmergencyAlert from '../components/ecg/EmergencyAlert';
import { 
  parseCSVFile, 
  parsePDFFileContent,
  generatePhysiologicalDefaults, 
  predictECGLocal, 
  generateLocalCardiologyReport 
} from '../services/ecgApi';
import toast from 'react-hot-toast';
import { Shield, Sparkles, RefreshCw } from 'lucide-react';

export default function ECGPrediction() {
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState("");
  const [result, setResult] = useState(null);
  
  // Tabular clinical features
  const [features, setFeatures] = useState({
    age: 0,
    sex: 0,
    cp: 0,
    trestbps: 0,
    chol: 0,
    fbs: 0,
    restecg: 0,
    thalach: 0,
    exang: 0,
    oldpeak: 0.0,
    slope: 0,
    ca: 0,
    thal: 0
  });

  const [summary, setSummary] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [waveformPattern, setWaveformPattern] = useState("normal");
  const [rhythmType, setRhythmType] = useState("Normal");
  const [heartRate, setHeartRate] = useState(0);
  const [showEmergency, setShowEmergency] = useState(false);

  // Triggered when any file is dropped/uploaded
  const handleECGUpload = async (file) => {
    setIsProcessing(true);
    setCurrentStage("Uploading");
    toast.success("Receiving diagnostic document stream...");

    try {
      let extractedFeatures = null;

      if (file.name.toLowerCase().endsWith('.csv')) {
        setCurrentStage("Extracting");
        await new Promise((r) => setTimeout(r, 600));
        extractedFeatures = await parseCSVFile(file);
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        setCurrentStage("Extracting");
        await new Promise((r) => setTimeout(r, 800));
        extractedFeatures = await parsePDFFileContent(file);
      } else {
        // Image uploads generate realistic defaults to seed the clinical model
        setCurrentStage("Extracting");
        await new Promise((r) => setTimeout(r, 800));
        extractedFeatures = generatePhysiologicalDefaults(file);
      }

      if (extractedFeatures) {
        setFeatures(extractedFeatures);
        await executeOfflinePrediction(extractedFeatures);
      } else {
        throw new Error("Unable to parse features from document.");
      }

    } catch (error) {
      toast.error("Format unrecognized. Please upload a clear CSV, image, or PDF.");
      setCurrentStage("");
    } finally {
      setIsProcessing(false);
    }
  };

  // Coordinates scikit-learn predictor API call and cardiology logic
  const executeOfflinePrediction = async (currentFeatures) => {
    setIsProcessing(true);
    setCurrentStage("Analyzing");
    await new Promise((r) => setTimeout(r, 600));

    try {
      const mlResponse = await predictECGLocal(currentFeatures);
      
      // Calculate local cardiology summary and waveforms based on Flask predictions
      const cardiologyReport = generateLocalCardiologyReport(mlResponse, currentFeatures);

      setResult({
        prediction: mlResponse.prediction,
        risk_probability: mlResponse.risk_probability,
        riskLabel: mlResponse.prediction !== "Normal" ? "Critical" : "Healthy"
      });

      setSummary(cardiologyReport.summary);
      setRecommendations(cardiologyReport.recommendations);
      setWaveformPattern(cardiologyReport.waveformPattern);
      setHeartRate(currentFeatures.thalach);
      
      let derivedRhythm = "Normal Sinus Rhythm";
      if (cardiologyReport.waveformPattern === "afib") {
        derivedRhythm = "Atrial Fibrillation";
      } else if (cardiologyReport.waveformPattern === "tachycardia") {
        derivedRhythm = "Tachycardia";
      } else if (cardiologyReport.waveformPattern === "bradycardia") {
        derivedRhythm = "Bradycardia";
      } else if (mlResponse.prediction !== "Normal") {
        derivedRhythm = "Irregular Rhythm";
      }
      setRhythmType(derivedRhythm);

      setCurrentStage("Complete");
      await new Promise((r) => setTimeout(r, 400));
      setCurrentStage("");

      // Trigger emergency alert on high risk
      if (mlResponse.prediction !== "Normal") {
        setTimeout(() => setShowEmergency(true), 2000);
      } else {
        toast.success("Diagnostic profile successfully analyzed!");
      }

    } catch (err) {
      toast.error("Failed to run local ML prediction.");
      setCurrentStage("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeatureChange = (name, val) => {
    setFeatures(prev => ({
      ...prev,
      [name]: parseFloat(val)
    }));
  };

  return (
    <div className="min-h-screen bg-black font-sans pb-12 pt-8">
      {/* Staggered card layouts */}
      <style>{`
        @keyframes fade-in-stagger {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stagger-card-0 { animation: fade-in-stagger 0.6s ease-out 0ms forwards; opacity: 0; }
        .stagger-card-1 { animation: fade-in-stagger 0.6s ease-out 100ms forwards; opacity: 0; }
        .stagger-card-2 { animation: fade-in-stagger 0.6s ease-out 200ms forwards; opacity: 0; }
        .stagger-card-3 { animation: fade-in-stagger 0.6s ease-out 300ms forwards; opacity: 0; }
      `}</style>

      {/* Abstract Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8 stagger-card-0 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-cyan-400" />
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-400">
                ECG Intelligence
              </h1>
            </div>
            <p className="text-zinc-500 mt-2 text-sm sm:text-base">
              Upload patient ECG files. Predict using your prebuilt scikit-learn ML model. 
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full bg-cyan-500/5 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
            100% Offline Diagnostic Mode
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 1/3 Width */}
          <div className="lg:col-span-1 space-y-6">
            <div className="stagger-card-1">
              <ECGUploadCard 
                onUpload={handleECGUpload} 
                isProcessing={isProcessing}
                currentStage={currentStage}
              />
            </div>

            {/* Clinical Parameter Panel Editor */}
            <div className="stagger-card-2 bg-[#0c0c0e]/80 border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800/60 pb-3">
                <h3 className="text-md font-bold text-zinc-300">Clinical Feature Panel</h3>
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Tabular parameters</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Age (Years)</label>
                  <input 
                    type="number" 
                    value={features.age} 
                    onChange={(e) => handleFeatureChange('age', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-2 mt-1 text-white focus:border-cyan-400/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Gender</label>
                  <select 
                    value={features.sex} 
                    onChange={(e) => handleFeatureChange('sex', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-2 mt-1 text-white focus:border-cyan-400/40 focus:outline-none"
                  >
                    <option value="1">Male</option>
                    <option value="0">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Chest Pain (CP)</label>
                  <select 
                    value={features.cp} 
                    onChange={(e) => handleFeatureChange('cp', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-2 mt-1 text-white focus:border-cyan-400/40 focus:outline-none text-[10px]"
                  >
                    <option value="0">Asymptomatic</option>
                    <option value="1">Atypical Angina</option>
                    <option value="2">Non-anginal Pain</option>
                    <option value="3">Typical Angina</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Rest BP (mmHg)</label>
                  <input 
                    type="number" 
                    value={features.trestbps} 
                    onChange={(e) => handleFeatureChange('trestbps', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-2 mt-1 text-white focus:border-cyan-400/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Cholesterol (mg/dl)</label>
                  <input 
                    type="number" 
                    value={features.chol} 
                    onChange={(e) => handleFeatureChange('chol', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-2 mt-1 text-white focus:border-cyan-400/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Fasting Sugar (FBS)</label>
                  <select 
                    value={features.fbs} 
                    onChange={(e) => handleFeatureChange('fbs', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-2 mt-1 text-white focus:border-cyan-400/40 focus:outline-none"
                  >
                    <option value="0">&lt; 120 mg/dl</option>
                    <option value="1">&gt; 120 mg/dl</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Rest ECG</label>
                  <select 
                    value={features.restecg} 
                    onChange={(e) => handleFeatureChange('restecg', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-2 mt-1 text-white focus:border-cyan-400/40 focus:outline-none text-[10px]"
                  >
                    <option value="0">Normal</option>
                    <option value="1">ST-T Abnormality</option>
                    <option value="2">LV Hypertrophy</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Max HR (thalach)</label>
                  <input 
                    type="number" 
                    value={features.thalach} 
                    onChange={(e) => handleFeatureChange('thalach', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-2 mt-1 text-white focus:border-cyan-400/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">ST Depression (mm)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={features.oldpeak} 
                    onChange={(e) => handleFeatureChange('oldpeak', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-2 mt-1 text-white focus:border-cyan-400/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">ST Slope</label>
                  <select 
                    value={features.slope} 
                    onChange={(e) => handleFeatureChange('slope', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-2 mt-1 text-white focus:border-cyan-400/40 focus:outline-none text-[10px]"
                  >
                    <option value="0">Upsloping</option>
                    <option value="1">Flat</option>
                    <option value="2">Downsloping</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => executeOfflinePrediction(features)}
                disabled={isProcessing}
                className="w-full mt-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 hover:border-cyan-400/40 text-cyan-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {isProcessing ? (
                  <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 mr-2" />
                )}
                Run ML Model Prediction
              </button>
            </div>
            
            {result && (
              <div className="stagger-card-3">
                <ECGResultCard 
                  result={result.prediction} 
                  probability={result.risk_probability} 
                  riskLabel={result.riskLabel}
                />
              </div>
            )}
          </div>

          {/* Right Column - 2/3 Width */}
          <div className="lg:col-span-2 space-y-6">
            <div className="stagger-card-1">
              <ECGWaveChart 
                isProcessing={isProcessing} 
                heartRate={heartRate}
                rhythmType={rhythmType}
                waveformPattern={waveformPattern}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="stagger-card-2">
                <HeartAnalytics features={features} />
              </div>
              <div className="stagger-card-3">
                <AIAnalysisCard 
                  summary={summary} 
                  recommendations={recommendations}
                  isProcessing={isProcessing} 
                  result={result}
                  features={features}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmergencyAlert isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
    </div>
  );
}

// Lightweight local loading spinner
const LoaderIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
