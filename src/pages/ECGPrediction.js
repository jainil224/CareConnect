import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ECGUploadCard from '../components/ecg/ECGUploadCard';
import ECGResultCard from '../components/ecg/ECGResultCard';
import ECGWaveChart from '../components/ecg/ECGWaveChart';
import HeartAnalytics from '../components/ecg/HeartAnalytics';
import AIAnalysisCard from '../components/ecg/AIAnalysisCard';
import EmergencyAlert from '../components/ecg/EmergencyAlert';
import {
  parsePDFFileContent,
  predictECGLocal,
  generateLocalCardiologyReport
} from '../services/ecgApi';
import toast from 'react-hot-toast';
import {
  Shield, Sparkles, Activity, ChevronRight
} from 'lucide-react';

// ─── Helper ──────────────────────────────────────────────────────────────────
const LoaderIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ECGPrediction() {
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [result, setResult] = useState(null);

  const [patientInfo, setPatientInfo] = useState({
    name: '',
    gender: '', // '0' for Female, '1' for Male
    dob: '', // 'YYYY-MM-DD'
    height: '', // cm
    weight: '', // kg
    heartRate: '', // BPM
    bloodPressure: '' // mmHg
  });

  const [backgroundFeatures, setBackgroundFeatures] = useState({
    cp: '',
    chol: '',
    fbs: '',
    restecg: '',
    exang: '',
    oldpeak: '',
    slope: '',
    ca: '',
    thal: ''
  });

  const [summary, setSummary] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [waveformPattern, setWaveformPattern] = useState('normal');
  const [rhythmType, setRhythmType] = useState('Normal');
  const [heartRate, setHeartRate] = useState(0);
  const [showEmergency, setShowEmergency] = useState(false);

  const getCalculatedAge = (dobString) => {
    if (!dobString) return '';
    try {
      const dobDate = new Date(dobString);
      if (isNaN(dobDate.getTime())) return '';
      const today = new Date();
      let calculatedAge = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        calculatedAge--;
      }
      return calculatedAge >= 0 ? calculatedAge : '';
    } catch (e) {
      return '';
    }
  };

  const mapExtractedToStates = (extracted) => {
    const info = {
      name: extracted.name || '',
      gender: extracted.sex !== undefined && extracted.sex !== "" ? String(extracted.sex) : '',
      dob: extracted.dob || '',
      height: extracted.height || '',
      weight: extracted.weight || '',
      heartRate: extracted.thalach !== undefined && extracted.thalach !== "" ? String(extracted.thalach) : '',
      bloodPressure: extracted.trestbps !== undefined && extracted.trestbps !== "" ? String(extracted.trestbps) : ''
    };
    const bg = {
      cp: extracted.cp !== undefined && extracted.cp !== "" ? String(extracted.cp) : '',
      chol: extracted.chol !== undefined && extracted.chol !== "" ? String(extracted.chol) : '',
      fbs: extracted.fbs !== undefined && extracted.fbs !== "" ? String(extracted.fbs) : '',
      restecg: extracted.restecg !== undefined && extracted.restecg !== "" ? String(extracted.restecg) : '',
      exang: extracted.exang !== undefined && extracted.exang !== "" ? String(extracted.exang) : '',
      oldpeak: extracted.oldpeak !== undefined && extracted.oldpeak !== "" ? String(extracted.oldpeak) : '',
      slope: extracted.slope !== undefined && extracted.slope !== "" ? String(extracted.slope) : '',
      ca: extracted.ca !== undefined && extracted.ca !== "" ? String(extracted.ca) : '',
      thal: extracted.thal !== undefined && extracted.thal !== "" ? String(extracted.thal) : ''
    };
    setPatientInfo(info);
    setBackgroundFeatures(bg);
    return { info, bg };
  };

  const handleECGUpload = async (file) => {
    setIsProcessing(true);
    setCurrentStage('Uploading');
    toast.success('Receiving diagnostic document stream...');

    try {
      let extractedFeatures = null;

      if (file.name.toLowerCase().endsWith('.csv')) {
        setCurrentStage('Extracting');
        await new Promise((r) => setTimeout(r, 600));
        extractedFeatures = await parseCSVFile(file);
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        setCurrentStage('Extracting');
        await new Promise((r) => setTimeout(r, 800));
        extractedFeatures = await parsePDFFileContent(file);
      } else {
        setCurrentStage('Extracting');
        await new Promise((r) => setTimeout(r, 800));
        extractedFeatures = generatePhysiologicalDefaults(file);
      }

      if (extractedFeatures) {
        const { info, bg } = mapExtractedToStates(extractedFeatures);
        await executeOfflinePrediction(info, bg);
      } else {
        throw new Error('Unable to parse features from document.');
      }
    } catch (error) {
      toast.error('Format unrecognized. Please upload a clear CSV, image, or PDF.');
      setCurrentStage('');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeOfflinePrediction = async (info, bg) => {
    setIsProcessing(true);
    setCurrentStage('Analyzing');
    await new Promise((r) => setTimeout(r, 600));

    try {
      const ageVal = getCalculatedAge(info.dob);
      const mlFeatures = {
        age: ageVal !== '' ? ageVal : 0,
        sex: info.gender !== '' ? parseInt(info.gender) : 0,
        cp: bg.cp !== '' ? parseInt(bg.cp) : 0,
        trestbps: info.bloodPressure !== '' ? parseFloat(info.bloodPressure) : 0,
        chol: bg.chol !== '' ? parseFloat(bg.chol) : 0,
        fbs: bg.fbs !== '' ? parseInt(bg.fbs) : 0,
        restecg: bg.restecg !== '' ? parseInt(bg.restecg) : 0,
        thalach: info.heartRate !== '' ? parseFloat(info.heartRate) : 0,
        exang: bg.exang !== '' ? parseInt(bg.exang) : 0,
        oldpeak: bg.oldpeak !== '' ? parseFloat(bg.oldpeak) : 0.0,
        slope: bg.slope !== '' ? parseInt(bg.slope) : 0,
        ca: bg.ca !== '' ? parseInt(bg.ca) : 0,
        thal: bg.thal !== '' ? parseInt(bg.thal) : 0
      };

      const mlResponse = await predictECGLocal(mlFeatures);
      const cardiologyReport = generateLocalCardiologyReport(mlResponse, mlFeatures);

      setResult({
        prediction: mlResponse.prediction,
        risk_probability: mlResponse.risk_probability,
        riskLabel: mlResponse.prediction !== 'Normal' ? 'Critical' : 'Healthy'
      });

      setSummary(cardiologyReport.summary);
      setRecommendations(cardiologyReport.recommendations);
      setWaveformPattern(cardiologyReport.waveformPattern);
      setHeartRate(mlFeatures.thalach);

      let derivedRhythm = 'Normal Sinus Rhythm';
      if (cardiologyReport.waveformPattern === 'afib') derivedRhythm = 'Atrial Fibrillation';
      else if (cardiologyReport.waveformPattern === 'tachycardia') derivedRhythm = 'Tachycardia';
      else if (cardiologyReport.waveformPattern === 'bradycardia') derivedRhythm = 'Bradycardia';
      else if (mlResponse.prediction !== 'Normal') derivedRhythm = 'Irregular Rhythm';
      setRhythmType(derivedRhythm);

      setCurrentStage('Complete');
      await new Promise((r) => setTimeout(r, 400));
      setCurrentStage('');

      if (mlResponse.prediction !== 'Normal') {
        setTimeout(() => setShowEmergency(true), 2000);
      } else {
        toast.success('Diagnostic profile successfully analyzed!');
      }
    } catch (err) {
      toast.error('Failed to run local ML prediction.');
      setCurrentStage('');
    } finally {
      setIsProcessing(false);
    }
  };


  const getUnifiedFeatures = () => {
    const ageVal = getCalculatedAge(patientInfo.dob);
    return {
      name: patientInfo.name,
      height: patientInfo.height,
      weight: patientInfo.weight,
      age: ageVal !== '' ? ageVal : 0,
      sex: patientInfo.gender !== '' ? parseInt(patientInfo.gender) : 0,
      cp: backgroundFeatures.cp !== '' ? parseInt(backgroundFeatures.cp) : 0,
      trestbps: patientInfo.bloodPressure !== '' ? parseFloat(patientInfo.bloodPressure) : 120,
      chol: backgroundFeatures.chol !== '' ? parseFloat(backgroundFeatures.chol) : 0,
      fbs: backgroundFeatures.fbs !== '' ? parseInt(backgroundFeatures.fbs) : 0,
      restecg: backgroundFeatures.restecg !== '' ? parseInt(backgroundFeatures.restecg) : 0,
      thalach: patientInfo.heartRate !== '' ? parseFloat(patientInfo.heartRate) : 0,
      exang: backgroundFeatures.exang !== '' ? parseInt(backgroundFeatures.exang) : 0,
      oldpeak: backgroundFeatures.oldpeak !== '' ? parseFloat(backgroundFeatures.oldpeak) : 0.0,
      slope: backgroundFeatures.slope !== '' ? parseInt(backgroundFeatures.slope) : 0,
      ca: backgroundFeatures.ca !== '' ? parseInt(backgroundFeatures.ca) : 0,
      thal: backgroundFeatures.thal !== '' ? parseInt(backgroundFeatures.thal) : 0
    };
  };

  return (
    <div className="min-h-screen bg-[#09090b] font-sans pb-16 pt-8">

      {/* ── Page-level animations ─────────────────────────────── */}
      <style>{`
        @keyframes ecg-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ecg-fade-0 { animation: ecg-fade-up 0.55s ease-out 0ms   forwards; opacity:0; }
        .ecg-fade-1 { animation: ecg-fade-up 0.55s ease-out 80ms  forwards; opacity:0; }
        .ecg-fade-2 { animation: ecg-fade-up 0.55s ease-out 160ms forwards; opacity:0; }
        .ecg-fade-3 { animation: ecg-fade-up 0.55s ease-out 240ms forwards; opacity:0; }
        .ecg-fade-4 { animation: ecg-fade-up 0.55s ease-out 320ms forwards; opacity:0; }

        select option { background: #18181b; color: #fff; }
      `}</style>

      {/* Subtle ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page Header ───────────────────────────────────────── */}
        <div className="ecg-fade-0 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  ECG Intelligence
                </h1>
              </div>
              <p className="text-zinc-500 text-sm sm:text-base ml-14">
                Upload a patient ECG report, review extracted clinical parameters, then run the local ML model.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-green-500/8 border border-green-500/20 text-xs font-semibold text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                100% Offline
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-blue-500/8 border border-blue-500/20 text-xs font-semibold text-blue-400">
                <Sparkles className="w-3 h-3" />
                scikit-learn ML
              </span>
            </div>
          </div>

          {/* 3-step guide strip */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { step: '01', label: 'Upload ECG File', desc: 'PDF, CSV, or image', color: 'border-blue-500/30 bg-blue-500/5' },
              { step: '02', label: 'Review Parameters', desc: 'Verify extracted values', color: 'border-zinc-700/50 bg-zinc-900/30' },
              { step: '03', label: 'Get Prediction', desc: 'Heart risk assessment', color: 'border-zinc-700/50 bg-zinc-900/30' },
            ].map(({ step, label, desc, color }) => (
              <div key={step} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${color} transition-colors`}>
                <span className="text-2xl font-black text-zinc-700 leading-none shrink-0">{step}</span>
                <div>
                  <p className="text-sm font-semibold text-zinc-300">{label}</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* ── LEFT COLUMN (Upload, Prediction, Metrics) ─── col 1-4 */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Upload Card */}
            <div className="ecg-fade-1">
              <ECGUploadCard
                onUpload={handleECGUpload}
                isProcessing={isProcessing}
                currentStage={currentStage}
              />
            </div>

            {/* Prediction Result */}
            <div className="ecg-fade-2">
              {result ? (
                <ECGResultCard
                  result={result.prediction}
                  probability={result.risk_probability}
                  riskLabel={result.riskLabel}
                />
              ) : (
                <EmptyResultCard />
              )}
            </div>

            {/* Clinical Metrics & Demographics */}
            <div className="ecg-fade-3">
              <HeartAnalytics patientInfo={patientInfo} />
            </div>

          </div>

          {/* ── RIGHT COLUMN (Monitor, AI Medical Summary) ─── col 5-12 */}
          <div className="xl:col-span-8 space-y-6">

            {/* ECG Live Monitor */}
            <div className="ecg-fade-1">
              <ECGWaveChart
                isProcessing={isProcessing}
                heartRate={heartRate}
                rhythmType={rhythmType}
                waveformPattern={waveformPattern}
              />
            </div>

            {/* AI Summary */}
            <div className="ecg-fade-2">
              <AIAnalysisCard
                summary={summary}
                recommendations={recommendations}
                isProcessing={isProcessing}
                result={result}
                features={getUnifiedFeatures()}
              />
            </div>

          </div>

        </div>
      </div>

      <EmergencyAlert isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
    </div>
  );
}

// Empty placeholder before first prediction
function EmptyResultCard() {
  return (
    <div className="h-full bg-zinc-950 border border-zinc-800/60 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] space-y-3">
      <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
        <Activity className="w-7 h-7 text-zinc-700" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-zinc-500">Prediction Engine</p>
        <p className="text-xs text-zinc-700 mt-1">
          Run ML prediction to see your<br />cardiovascular risk assessment.
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-zinc-600">
        <ChevronRight className="w-3 h-3" />
        Upload ECG → Run ML Prediction
      </div>
    </div>
  );
}
