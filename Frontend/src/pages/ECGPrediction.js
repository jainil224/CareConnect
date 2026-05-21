import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  Activity,
  FileText,
  HeartPulse,
  History,
  MonitorDot,
  Wifi,
  WifiOff,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import ECGUploadCard from '../components/ecg/ECGUploadCard';
import ECGResultCard from '../components/ecg/ECGResultCard';
import ECGWaveChart from '../components/ecg/ECGWaveChart';
import HeartAnalytics from '../components/ecg/HeartAnalytics';
import AIAnalysisCard from '../components/ecg/AIAnalysisCard';
import EmergencyAlert from '../components/ecg/EmergencyAlert';
import {
  checkFlaskHealth,
  generateLocalCardiologyReport,
  generatePhysiologicalDefaults,
  parseCSVFile,
  parsePDFFileContent,
  predictECGLocal,
} from '../services/ecgApi';

// ── Flask status indicator component ────────────────────────────────────────
function FlaskStatusBadge({ status }) {
  const configs = {
    checking: { dot: 'bg-zinc-500 animate-pulse', label: 'Checking ML server…', text: 'text-zinc-400' },
    online:   { dot: 'bg-emerald-400',            label: 'ML Server Online',    text: 'text-emerald-400' },
    offline:  { dot: 'bg-amber-400 animate-pulse', label: 'Local Estimate Mode', text: 'text-amber-400' },
  };
  const cfg = configs[status] || configs.checking;

  return (
    <div className={`hidden sm:flex items-center gap-2 text-[11px] font-semibold ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </div>
  );
}

// ── Offline banner ───────────────────────────────────────────────────────────
function OfflineBanner() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 pt-4">
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-300">
        <WifiOff className="h-4 w-4 shrink-0 text-amber-400" />
        <span>
          <strong>Running in local estimation mode</strong> — Flask ML server not detected on{' '}
          <code className="text-xs bg-amber-500/10 px-1 py-0.5 rounded">localhost:5000</code>.
          Start it with <code className="text-xs bg-amber-500/10 px-1 py-0.5 rounded">npm run flask</code> for full scikit-learn predictions.
        </span>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ECGPrediction() {
  const [isProcessing, setIsProcessing]     = useState(false);
  const [currentStage, setCurrentStage]     = useState('');
  const [result, setResult]                 = useState(null);
  const [flaskStatus, setFlaskStatus]       = useState('checking');
  const [waveformIntervals, setWaveformIntervals] = useState(null);

  // Keep a ref to the last uploaded file so Refresh re-analyzes the same PDF
  const lastUploadedFileRef = useRef(null);

  const [patientInfo, setPatientInfo] = useState({
    name: '', gender: '', dob: '', height: '', weight: '',
    heartRate: '', bloodPressure: ''
  });

  const [backgroundFeatures, setBackgroundFeatures] = useState({
    cp: '', chol: '', fbs: '', restecg: '',
    exang: '', oldpeak: '', slope: '', ca: '', thal: ''
  });

  const [summary, setSummary]               = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [waveformPattern, setWaveformPattern] = useState('normal');
  const [rhythmType, setRhythmType]         = useState('Normal Sinus Rhythm');
  const [heartRate, setHeartRate]           = useState(0);
  const [showEmergency, setShowEmergency]   = useState(false);

  // ── Flask health check on mount, then every 30s ─────────────────────────
  const runHealthCheck = useCallback(async () => {
    const status = await checkFlaskHealth();
    setFlaskStatus(status);
  }, []);

  useEffect(() => {
    runHealthCheck();
    const interval = setInterval(runHealthCheck, 30000);
    return () => clearInterval(interval);
  }, [runHealthCheck]);

  // ── Age calculation ──────────────────────────────────────────────────────
  const getCalculatedAge = (dobString) => {
    if (!dobString) return '';
    try {
      const dobDate = new Date(dobString);
      if (Number.isNaN(dobDate.getTime())) return '';
      const today = new Date();
      let calculatedAge = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        calculatedAge -= 1;
      }
      return calculatedAge >= 0 ? calculatedAge : '';
    } catch { return ''; }
  };

  // ── Map parsed features → component state ──────────────────────────────
  const mapExtractedToStates = (features) => {
    const info = {
      name:          features.name || '',
      gender:        features.sex !== undefined && features.sex !== '' ? String(features.sex) : '',
      dob:           features.dob || '',
      height:        features.height || '',
      weight:        features.weight || '',
      heartRate:     features.thalach !== undefined && features.thalach !== '' ? String(features.thalach) : '',
      bloodPressure: features.trestbps !== undefined && features.trestbps !== '' ? String(features.trestbps) : '',
    };
    const bg = {
      cp:      features.cp      !== undefined && features.cp      !== '' ? String(features.cp)      : '',
      chol:    features.chol    !== undefined && features.chol    !== '' ? String(features.chol)    : '',
      fbs:     features.fbs     !== undefined && features.fbs     !== '' ? String(features.fbs)     : '',
      restecg: features.restecg !== undefined && features.restecg !== '' ? String(features.restecg) : '',
      exang:   features.exang   !== undefined && features.exang   !== '' ? String(features.exang)   : '',
      oldpeak: features.oldpeak !== undefined && features.oldpeak !== '' ? String(features.oldpeak) : '',
      slope:   features.slope   !== undefined && features.slope   !== '' ? String(features.slope)   : '',
      ca:      features.ca      !== undefined && features.ca      !== '' ? String(features.ca)      : '',
      thal:    features.thal    !== undefined && features.thal    !== '' ? String(features.thal)    : '',
    };
    setPatientInfo(info);
    setBackgroundFeatures(bg);
    return { info, bg };
  };

  // ── Reset handler — clears analysis but KEEPS the uploaded PDF ──────────
  const handleReset = () => {
    // If there is a previously uploaded file, re-run the analysis on it
    if (lastUploadedFileRef.current) {
      setResult(null);
      setWaveformIntervals(null);
      setSummary('');
      setRecommendations([]);
      setWaveformPattern('normal');
      setRhythmType('Normal Sinus Rhythm');
      setHeartRate(0);
      setShowEmergency(false);
      // Re-trigger full analysis pipeline on the same file
      handleECGUpload(lastUploadedFileRef.current);
    } else {
      // No file yet — full reset
      setIsProcessing(false);
      setCurrentStage('');
      setResult(null);
      setWaveformIntervals(null);
      setPatientInfo({
        name: '', gender: '', dob: '', height: '', weight: '',
        heartRate: '', bloodPressure: ''
      });
      setBackgroundFeatures({
        cp: '', chol: '', fbs: '', restecg: '',
        exang: '', oldpeak: '', slope: '', ca: '', thal: ''
      });
      setSummary('');
      setRecommendations([]);
      setWaveformPattern('normal');
      setRhythmType('Normal Sinus Rhythm');
      setHeartRate(0);
      setShowEmergency(false);
    }
  };

  // ── File upload handler ──────────────────────────────────────────────────
  const handleECGUpload = async (file) => {
    setIsProcessing(true);
    setCurrentStage('Uploading');
    setShowEmergency(false);
    setWaveformIntervals(null);
    toast.success('Receiving diagnostic document stream…');

    try {
      let parseResult = null;
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.csv')) {
        setCurrentStage('Extracting');
        await new Promise(r => setTimeout(r, 600));
        parseResult = await parseCSVFile(file);
      } else if (fileName.endsWith('.pdf')) {
        setCurrentStage('Extracting');
        await new Promise(r => setTimeout(r, 800));
        parseResult = await parsePDFFileContent(file);
      } else {
        setCurrentStage('Extracting');
        await new Promise(r => setTimeout(r, 800));
        parseResult = generatePhysiologicalDefaults(file);
      }

      if (!parseResult || !parseResult.features) {
        throw new Error('Unable to parse features from document.');
      }

      // Show any parse warnings as toasts
      if (parseResult.warnings && parseResult.warnings.length > 0) {
        parseResult.warnings.forEach(w => toast(w, { icon: '⚠️', duration: 5000 }));
      }

      // Store waveform intervals for display
      if (parseResult.waveformIntervals) {
        setWaveformIntervals(parseResult.waveformIntervals);
      }

      const { info, bg } = mapExtractedToStates(parseResult.features);
      await executeOfflinePrediction(info, bg, parseResult.waveformIntervals);
    } catch (error) {
      console.error('[ECG Upload] Error:', error);
      toast.error('Format unrecognised. Please upload a clear CSV, image, or PDF.');
      setCurrentStage('');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── ML prediction orchestrator ───────────────────────────────────────────
  const executeOfflinePrediction = async (info, bg, intervals = null) => {
    setIsProcessing(true);
    setCurrentStage('Analyzing');
    await new Promise(r => setTimeout(r, 600));

    try {
      const ageVal = getCalculatedAge(info.dob);
      const mlFeatures = {
        age:      ageVal !== '' ? ageVal : 0,
        sex:      info.gender !== '' ? parseInt(info.gender, 10) : 0,
        cp:       bg.cp !== ''      ? parseInt(bg.cp, 10)       : 0,
        trestbps: info.bloodPressure !== '' ? parseFloat(info.bloodPressure) : 0,
        chol:     bg.chol !== ''    ? parseFloat(bg.chol)       : 0,
        fbs:      bg.fbs !== ''     ? parseInt(bg.fbs, 10)      : 0,
        restecg:  bg.restecg !== '' ? parseInt(bg.restecg, 10)  : 0,
        thalach:  info.heartRate !== '' ? parseFloat(info.heartRate) : 0,
        exang:    bg.exang !== ''   ? parseInt(bg.exang, 10)    : 0,
        oldpeak:  bg.oldpeak !== '' ? parseFloat(bg.oldpeak)    : 0,
        slope:    bg.slope !== ''   ? parseInt(bg.slope, 10)    : 0,
        ca:       bg.ca !== ''      ? parseInt(bg.ca, 10)       : 0,
        thal:     bg.thal !== ''    ? parseInt(bg.thal, 10)     : 0,
      };

      const mlResponse = await predictECGLocal(mlFeatures);

      // Update Flask status after prediction attempt
      setFlaskStatus(mlResponse.isFallback ? 'offline' : 'online');

      const cardiologyReport = generateLocalCardiologyReport(mlResponse, mlFeatures, intervals);
      const highRisk = mlResponse.prediction !== 'Normal';

      setResult({
        prediction:      mlResponse.prediction,
        risk_probability: mlResponse.risk_probability,
        riskLabel:       highRisk ? 'Critical' : 'Healthy',
        isFallback:      mlResponse.isFallback || false,
      });

      setSummary(cardiologyReport.summary);
      setRecommendations(cardiologyReport.recommendations);
      setWaveformPattern(cardiologyReport.waveformPattern);
      setHeartRate(mlFeatures.thalach);

      let derivedRhythm = 'Normal Sinus Rhythm';
      if      (cardiologyReport.waveformPattern === 'afib')        derivedRhythm = 'Atrial Fibrillation';
      else if (cardiologyReport.waveformPattern === 'tachycardia') derivedRhythm = 'Tachycardia';
      else if (cardiologyReport.waveformPattern === 'bradycardia') derivedRhythm = 'Bradycardia';
      else if (highRisk)                                            derivedRhythm = 'Irregular Rhythm';
      setRhythmType(derivedRhythm);

      setCurrentStage('Complete');
      await new Promise(r => setTimeout(r, 400));
      setCurrentStage('');

      if (highRisk) {
        setTimeout(() => setShowEmergency(true), 2000);
      } else {
        toast.success('Diagnostic profile successfully analysed!');
      }
    } catch (err) {
      console.error('[ECG Prediction] Error:', err);
      toast.error('Failed to run ML prediction. Please try again.');
      setCurrentStage('');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Unified feature builder for report download ──────────────────────────
  const getUnifiedFeatures = () => {
    const ageVal = getCalculatedAge(patientInfo.dob);
    return {
      name:     patientInfo.name,
      height:   patientInfo.height,
      weight:   patientInfo.weight,
      age:      ageVal !== '' ? ageVal : 0,
      sex:      patientInfo.gender !== '' ? parseInt(patientInfo.gender, 10) : 0,
      cp:       backgroundFeatures.cp !== ''      ? parseInt(backgroundFeatures.cp, 10)       : 0,
      trestbps: patientInfo.bloodPressure !== ''  ? parseFloat(patientInfo.bloodPressure)      : 120,
      chol:     backgroundFeatures.chol !== ''    ? parseFloat(backgroundFeatures.chol)        : 0,
      fbs:      backgroundFeatures.fbs !== ''     ? parseInt(backgroundFeatures.fbs, 10)       : 0,
      restecg:  backgroundFeatures.restecg !== '' ? parseInt(backgroundFeatures.restecg, 10)   : 0,
      thalach:  patientInfo.heartRate !== ''      ? parseFloat(patientInfo.heartRate)          : 0,
      exang:    backgroundFeatures.exang !== ''   ? parseInt(backgroundFeatures.exang, 10)     : 0,
      oldpeak:  backgroundFeatures.oldpeak !== '' ? parseFloat(backgroundFeatures.oldpeak)     : 0,
      slope:    backgroundFeatures.slope !== ''   ? parseInt(backgroundFeatures.slope, 10)     : 0,
      ca:       backgroundFeatures.ca !== ''      ? parseInt(backgroundFeatures.ca, 10)        : 0,
      thal:     backgroundFeatures.thal !== ''    ? parseInt(backgroundFeatures.thal, 10)      : 0,
    };
  };

  return (
    <div className="min-h-screen pt-20 bg-[#f5f7fa] dark:bg-[#0c0c0e] text-zinc-900 dark:text-[#e5e2e1] font-sans transition-colors duration-300">
      <style>{`
        .ecg-glass {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px rgba(0,0,0,0.05);
          backdrop-filter: blur(16px);
          border-radius: 24px;
        }
        .dark .ecg-glass {
          background: rgba(18, 18, 20, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .ecg-grid-bg {
          background-image:
            linear-gradient(rgba(0, 209, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 209, 255, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .ecg-critical-text {
          color: #ffb4ab;
          text-shadow: 0 0 15px rgba(255, 180, 171, 0.55);
        }
        @keyframes ecg-scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(420%); }
        }
        .ecg-scanline {
          background: linear-gradient(90deg, transparent, rgba(0,209,255,0.2), transparent);
          animation: ecg-scan 4s linear infinite;
        }
      `}</style>

      {/* Header */}
      <section className="border-b border-gray-200/50 dark:border-zinc-800/50 bg-white/60 dark:bg-[#0c0c0e]/60 backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="mr-2 flex items-center justify-center p-2 rounded-xl border border-gray-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title="Go back to Dashboard"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-zinc-400" />
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/20 dark:border-cyan-300/20 bg-cyan-500/10 dark:bg-cyan-300/10">
              <HeartPulse className="h-6 w-6 text-cyan-600 dark:text-[#a4e6ff]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-2xl">ECG Intelligence</h1>
              <p className="hidden text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500 dark:text-[#bbc9cf] sm:block">
                AI Diagnostics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Reset / Refresh button */}
            {result && (
              <button
                onClick={handleReset}
                className="flex items-center justify-center p-2 rounded-xl border border-gray-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                title="Refresh and upload new report"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            
            {/* Flask server status in header */}
            <FlaskStatusBadge status={flaskStatus} />
          </div>
        </div>
      </section>

      {/* Offline banner */}
      {flaskStatus === 'offline' && <OfflineBanner />}

      <main className="mx-auto max-w-[1600px] px-5 py-8">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">

          {/* Left sidebar */}
          <aside className="flex flex-col gap-4 xl:col-span-4">
            <ECGUploadCard
              onUpload={handleECGUpload}
              isProcessing={isProcessing}
              currentStage={currentStage}
              onFileRef={(file) => { lastUploadedFileRef.current = file; }}
            />

            {result ? (
              <ECGResultCard
                result={result.prediction}
                probability={result.risk_probability}
                riskLabel={result.riskLabel}
                isFallback={result.isFallback}
                waveformIntervals={waveformIntervals}
              />
            ) : (
              <EmptyPredictionCard />
            )}

            <CardioRiskFactors backgroundFeatures={backgroundFeatures} patientInfo={patientInfo} />
          </aside>

          {/* Main content */}
          <section className="space-y-4 xl:col-span-8">
            <div className="ecg-glass overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/40 px-6 py-5 transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/20">
                    <MonitorDot className="h-5 w-5 animate-pulse text-cyan-600 dark:text-[#a4e6ff]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-100 tracking-tight">Live ECG Monitor</h3>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/80 dark:bg-[#a4e6ff]" />
                    Lead II
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/80 dark:bg-[#a4e6ff]" />
                    25 mm/s
                  </span>
                </div>
              </div>
              <div className="ecg-grid-bg relative overflow-hidden">
                <div className="ecg-scanline absolute inset-y-0 left-0 z-10 w-1/3" />
                <ECGWaveChart
                  isProcessing={isProcessing}
                  isIdle={!result}
                  heartRate={heartRate}
                  rhythmType={rhythmType}
                  waveformPattern={waveformPattern}
                />
              </div>
            </div>

            <AIAnalysisCard
              summary={summary}
              recommendations={recommendations}
              isProcessing={isProcessing}
              result={result}
              features={getUnifiedFeatures()}
            />

            <HeartAnalytics patientInfo={patientInfo} />
          </section>
        </div>
      </main>

      <EmergencyAlert isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
    </div>
  );
}

// ── Empty state card ────────────────────────────────────────────────────────
function EmptyPredictionCard() {
  return (
    <div className="ecg-glass relative min-h-[260px] overflow-hidden p-6 hover:shadow-xl transition-all duration-300 group">
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 blur-[60px] group-hover:bg-cyan-500/20 transition-all duration-500" />
      <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-blue-500/10 dark:bg-blue-500/10 blur-[60px] group-hover:bg-blue-500/20 transition-all duration-500" />
      <div className="mb-6 flex items-center gap-3 relative z-10">
        <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/20">
          <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-100 tracking-tight">Prediction Engine</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-6 text-center relative z-10">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-cyan-500/30">
          <FileText className="h-9 w-9 text-gray-400 dark:text-zinc-500 group-hover:text-cyan-500 transition-colors" />
        </div>
        <h4 className="text-2xl font-black uppercase tracking-tight text-gray-800 dark:text-zinc-200">Awaiting ECG</h4>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500">
          Upload a record to run prediction
        </p>
      </div>
      <div className="space-y-2 relative z-10">
        <div className="flex items-end justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500">AI Confidence Score</span>
          <span className="font-mono text-lg font-bold text-gray-400 dark:text-zinc-600">--</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

// ── Cardiovascular Risk Factors ────────────────────────────────────────────────────
function CardioRiskFactors({ backgroundFeatures, patientInfo }) {
  const hasData = (backgroundFeatures && backgroundFeatures.chol !== '') || (patientInfo && patientInfo.bloodPressure !== '');

  let rows = [];

  if (hasData) {
    const cholVal = parseFloat(backgroundFeatures.chol);
    const fbsVal = parseInt(backgroundFeatures.fbs, 10);
    const bpVal = parseFloat(patientInfo.bloodPressure);
    const hrVal = parseFloat(patientInfo.heartRate);

    rows = [
      { 
        label: 'Cholesterol', 
        value: !isNaN(cholVal) ? `${cholVal} mg/dl` : 'Unknown', 
        badge: !isNaN(cholVal) ? (cholVal > 200 ? 'High' : 'Normal') : '--', 
        tone: !isNaN(cholVal) ? (cholVal > 200 ? 'red' : 'green') : 'neutral' 
      },
      { 
        label: 'Fasting Blood Sugar',  
        value: !isNaN(fbsVal) ? (fbsVal === 1 ? '> 120 mg/dl' : '< 120 mg/dl') : 'Unknown', 
        badge: !isNaN(fbsVal) ? (fbsVal === 1 ? 'Elevated' : 'Normal') : '--', 
        tone: !isNaN(fbsVal) ? (fbsVal === 1 ? 'red' : 'green') : 'neutral' 
      },
      { 
        label: 'Resting Blood Pressure',  
        value: !isNaN(bpVal) ? `${bpVal} mmHg` : 'Unknown', 
        badge: !isNaN(bpVal) ? (bpVal > 130 ? 'High' : 'Normal') : '--',   
        tone: !isNaN(bpVal) ? (bpVal > 130 ? 'red' : 'green') : 'neutral' 
      },
      { 
        label: 'Max Heart Rate',  
        value: !isNaN(hrVal) ? `${hrVal} bpm` : 'Unknown', 
        badge: !isNaN(hrVal) ? (hrVal > 100 ? 'Elevated' : 'Normal') : '--',   
        tone: !isNaN(hrVal) ? (hrVal > 100 ? 'red' : 'green') : 'neutral' 
      }
    ];
  }

  return (
    <div className="ecg-glass p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/20">
          <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-100 tracking-tight">Cardiovascular Risk</h3>
      </div>
      
      {rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-cyan-500/30 dark:hover:border-cyan-500/30"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500">{row.label}</p>
                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-zinc-200">{row.value}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                row.tone === 'green'
                  ? 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400'
                  : row.tone === 'red'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400'
              }`}>
                {row.badge}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/20">
          <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">No Risk Data Available</p>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 px-4">Upload a clinical report to automatically extract cardiovascular risk factors.</p>
        </div>
      )}
    </div>
  );
}
