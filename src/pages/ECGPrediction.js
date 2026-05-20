import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Activity,
  FileText,
  HeartPulse,
  History,
  MonitorDot
} from 'lucide-react';
import ECGUploadCard from '../components/ecg/ECGUploadCard';
import ECGResultCard from '../components/ecg/ECGResultCard';
import ECGWaveChart from '../components/ecg/ECGWaveChart';
import HeartAnalytics from '../components/ecg/HeartAnalytics';
import AIAnalysisCard from '../components/ecg/AIAnalysisCard';
import EmergencyAlert from '../components/ecg/EmergencyAlert';
import {
  generateLocalCardiologyReport,
  generatePhysiologicalDefaults,
  parseCSVFile,
  parsePDFFileContent,
  predictECGLocal
} from '../services/ecgApi';

export default function ECGPrediction() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [result, setResult] = useState(null);

  const [patientInfo, setPatientInfo] = useState({
    name: '',
    gender: '',
    dob: '',
    height: '',
    weight: '',
    heartRate: '',
    bloodPressure: ''
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
  const [rhythmType, setRhythmType] = useState('Normal Sinus Rhythm');
  const [heartRate, setHeartRate] = useState(0);
  const [showEmergency, setShowEmergency] = useState(false);

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
    } catch (e) {
      return '';
    }
  };

  const mapExtractedToStates = (extracted) => {
    const info = {
      name: extracted.name || '',
      gender: extracted.sex !== undefined && extracted.sex !== '' ? String(extracted.sex) : '',
      dob: extracted.dob || '',
      height: extracted.height || '',
      weight: extracted.weight || '',
      heartRate: extracted.thalach !== undefined && extracted.thalach !== '' ? String(extracted.thalach) : '',
      bloodPressure: extracted.trestbps !== undefined && extracted.trestbps !== '' ? String(extracted.trestbps) : ''
    };
    const bg = {
      cp: extracted.cp !== undefined && extracted.cp !== '' ? String(extracted.cp) : '',
      chol: extracted.chol !== undefined && extracted.chol !== '' ? String(extracted.chol) : '',
      fbs: extracted.fbs !== undefined && extracted.fbs !== '' ? String(extracted.fbs) : '',
      restecg: extracted.restecg !== undefined && extracted.restecg !== '' ? String(extracted.restecg) : '',
      exang: extracted.exang !== undefined && extracted.exang !== '' ? String(extracted.exang) : '',
      oldpeak: extracted.oldpeak !== undefined && extracted.oldpeak !== '' ? String(extracted.oldpeak) : '',
      slope: extracted.slope !== undefined && extracted.slope !== '' ? String(extracted.slope) : '',
      ca: extracted.ca !== undefined && extracted.ca !== '' ? String(extracted.ca) : '',
      thal: extracted.thal !== undefined && extracted.thal !== '' ? String(extracted.thal) : ''
    };
    setPatientInfo(info);
    setBackgroundFeatures(bg);
    return { info, bg };
  };

  const handleECGUpload = async (file) => {
    setIsProcessing(true);
    setCurrentStage('Uploading');
    setShowEmergency(false);
    toast.success('Receiving diagnostic document stream...');

    try {
      let extractedFeatures = null;
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.csv')) {
        setCurrentStage('Extracting');
        await new Promise((resolve) => setTimeout(resolve, 600));
        extractedFeatures = await parseCSVFile(file);
      } else if (fileName.endsWith('.pdf')) {
        setCurrentStage('Extracting');
        await new Promise((resolve) => setTimeout(resolve, 800));
        extractedFeatures = await parsePDFFileContent(file);
      } else {
        setCurrentStage('Extracting');
        await new Promise((resolve) => setTimeout(resolve, 800));
        extractedFeatures = generatePhysiologicalDefaults(file);
      }

      if (!extractedFeatures) {
        throw new Error('Unable to parse features from document.');
      }

      const { info, bg } = mapExtractedToStates(extractedFeatures);
      await executeOfflinePrediction(info, bg);
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
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const ageVal = getCalculatedAge(info.dob);
      const mlFeatures = {
        age: ageVal !== '' ? ageVal : 0,
        sex: info.gender !== '' ? parseInt(info.gender, 10) : 0,
        cp: bg.cp !== '' ? parseInt(bg.cp, 10) : 0,
        trestbps: info.bloodPressure !== '' ? parseFloat(info.bloodPressure) : 0,
        chol: bg.chol !== '' ? parseFloat(bg.chol) : 0,
        fbs: bg.fbs !== '' ? parseInt(bg.fbs, 10) : 0,
        restecg: bg.restecg !== '' ? parseInt(bg.restecg, 10) : 0,
        thalach: info.heartRate !== '' ? parseFloat(info.heartRate) : 0,
        exang: bg.exang !== '' ? parseInt(bg.exang, 10) : 0,
        oldpeak: bg.oldpeak !== '' ? parseFloat(bg.oldpeak) : 0,
        slope: bg.slope !== '' ? parseInt(bg.slope, 10) : 0,
        ca: bg.ca !== '' ? parseInt(bg.ca, 10) : 0,
        thal: bg.thal !== '' ? parseInt(bg.thal, 10) : 0
      };

      const mlResponse = await predictECGLocal(mlFeatures);
      const cardiologyReport = generateLocalCardiologyReport(mlResponse, mlFeatures);
      const highRisk = mlResponse.prediction !== 'Normal';

      setResult({
        prediction: mlResponse.prediction,
        risk_probability: mlResponse.risk_probability,
        riskLabel: highRisk ? 'Critical' : 'Healthy'
      });

      setSummary(cardiologyReport.summary);
      setRecommendations(cardiologyReport.recommendations);
      setWaveformPattern(cardiologyReport.waveformPattern);
      setHeartRate(mlFeatures.thalach);

      let derivedRhythm = 'Normal Sinus Rhythm';
      if (cardiologyReport.waveformPattern === 'afib') derivedRhythm = 'Atrial Fibrillation';
      else if (cardiologyReport.waveformPattern === 'tachycardia') derivedRhythm = 'Tachycardia';
      else if (cardiologyReport.waveformPattern === 'bradycardia') derivedRhythm = 'Bradycardia';
      else if (highRisk) derivedRhythm = 'Irregular Rhythm';
      setRhythmType(derivedRhythm);

      setCurrentStage('Complete');
      await new Promise((resolve) => setTimeout(resolve, 400));
      setCurrentStage('');

      if (highRisk) {
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
      sex: patientInfo.gender !== '' ? parseInt(patientInfo.gender, 10) : 0,
      cp: backgroundFeatures.cp !== '' ? parseInt(backgroundFeatures.cp, 10) : 0,
      trestbps: patientInfo.bloodPressure !== '' ? parseFloat(patientInfo.bloodPressure) : 120,
      chol: backgroundFeatures.chol !== '' ? parseFloat(backgroundFeatures.chol) : 0,
      fbs: backgroundFeatures.fbs !== '' ? parseInt(backgroundFeatures.fbs, 10) : 0,
      restecg: backgroundFeatures.restecg !== '' ? parseInt(backgroundFeatures.restecg, 10) : 0,
      thalach: patientInfo.heartRate !== '' ? parseFloat(patientInfo.heartRate) : 0,
      exang: backgroundFeatures.exang !== '' ? parseInt(backgroundFeatures.exang, 10) : 0,
      oldpeak: backgroundFeatures.oldpeak !== '' ? parseFloat(backgroundFeatures.oldpeak) : 0,
      slope: backgroundFeatures.slope !== '' ? parseInt(backgroundFeatures.slope, 10) : 0,
      ca: backgroundFeatures.ca !== '' ? parseInt(backgroundFeatures.ca, 10) : 0,
      thal: backgroundFeatures.thal !== '' ? parseInt(backgroundFeatures.thal, 10) : 0
    };
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e2e1] font-sans">
      <style>{`
        .ecg-glass {
          background: rgba(18, 18, 18, 0.72);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 18px 60px rgba(0,0,0,0.28);
          backdrop-filter: blur(14px);
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

      <section className="border-b border-[#3c494e] bg-[#131313]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10">
              <HeartPulse className="h-6 w-6 text-[#a4e6ff]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">ECG Intelligence</h1>
              <p className="hidden text-[11px] font-bold uppercase tracking-[0.22em] text-[#bbc9cf] sm:block">
                AI Diagnostics
              </p>
            </div>
          </div>

          <div />
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-5 py-8">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <aside className="space-y-4 xl:col-span-4">
            <ECGUploadCard
              onUpload={handleECGUpload}
              isProcessing={isProcessing}
              currentStage={currentStage}
            />

            {result ? (
              <ECGResultCard
                result={result.prediction}
                probability={result.risk_probability}
                riskLabel={result.riskLabel}
              />
            ) : (
              <EmptyPredictionCard />
            )}

            <MedicalHistory />
          </aside>

          <section className="space-y-4 xl:col-span-8">
            <div className="ecg-glass overflow-hidden rounded-xl">
              <div className="flex items-center justify-between border-b border-[#3c494e] bg-[#1c1b1b]/70 px-5 py-4">
                <div className="flex items-center gap-2">
                  <MonitorDot className="h-4 w-4 animate-pulse text-[#a4e6ff]" />
                  <h3 className="text-sm font-bold text-white">Live ECG Monitor</h3>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#bbc9cf]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#a4e6ff]/60" />
                    Lead II
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#a4e6ff]/60" />
                    25 mm/s
                  </span>
                </div>
              </div>
              <div className="ecg-grid-bg relative overflow-hidden">
                <div className="ecg-scanline absolute inset-y-0 left-0 z-10 w-1/3" />
                <ECGWaveChart
                  isProcessing={isProcessing}
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

function EmptyPredictionCard() {
  return (
    <div className="ecg-glass relative min-h-[260px] overflow-hidden rounded-xl border-red-300/10 p-6">
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-red-300/10 blur-[60px]" />
      <div className="mb-6 flex items-center gap-2">
        <Activity className="h-5 w-5 text-[#a4e6ff]" />
        <h3 className="text-lg font-semibold text-white">Prediction Engine</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-[#3c494e] bg-[#1c1b1b]">
          <FileText className="h-9 w-9 text-[#bbc9cf]" />
        </div>
        <h4 className="text-3xl font-black uppercase tracking-tight text-[#bbc9cf]">Awaiting ECG</h4>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#bbc9cf]/70">
          Upload a record to run prediction
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#bbc9cf]">AI Confidence Score</span>
          <span className="font-mono text-lg font-bold text-[#bbc9cf]">--</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#201f1f]" />
      </div>
    </div>
  );
}

function MedicalHistory() {
  const rows = [
    { label: 'Last Visit', value: '12 Jan 2026', badge: 'Stable', tone: 'green' },
    { label: 'Prior ECG', value: '05 Nov 2025', badge: 'Sinus Rhythm', tone: 'neutral' },
    { label: 'Admission', value: '02 Oct 2025', badge: 'Chest Pain', tone: 'red' }
  ];

  return (
    <div className="ecg-glass rounded-xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-[#a4e6ff]" />
        <h3 className="text-lg font-semibold text-white">Medical History</h3>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-lg border border-[#3c494e]/40 bg-[#1c1b1b]/50 p-3 transition hover:border-cyan-300/30"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#bbc9cf]">{row.label}</p>
              <p className="mt-1 text-sm text-white">{row.value}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
              row.tone === 'green'
                ? 'bg-green-500/10 text-green-400'
                : row.tone === 'red'
                  ? 'bg-red-400/10 text-[#ffb4ab]'
                  : 'text-[#bbc9cf]'
            }`}>
              {row.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
