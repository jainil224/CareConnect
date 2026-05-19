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
import {
  Shield, Sparkles, RefreshCw, UserCircle, Heart,
  Activity, Zap, ChevronRight, AlertCircle
} from 'lucide-react';

// ─── Helper ──────────────────────────────────────────────────────────────────
const LoaderIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const FieldInput = ({ label, helpText, ...props }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">{label}</label>
    {helpText && <p className="text-[10px] text-zinc-600 leading-tight">{helpText}</p>}
    <input
      {...props}
      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white
        placeholder-zinc-600 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 focus:outline-none
        transition-colors duration-200"
    />
  </div>
);

const FieldSelect = ({ label, helpText, children, ...props }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">{label}</label>
    {helpText && <p className="text-[10px] text-zinc-600 leading-tight">{helpText}</p>}
    <select
      {...props}
      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white
        focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 focus:outline-none
        transition-colors duration-200 appearance-none cursor-pointer"
    >
      {children}
    </select>
  </div>
);

const SectionLabel = ({ icon: Icon, label, color = 'text-blue-400' }) => (
  <div className="flex items-center space-x-2 mb-4">
    <Icon className={`w-4 h-4 ${color}`} />
    <span className={`text-xs font-bold uppercase tracking-widest ${color}`}>{label}</span>
    <div className="flex-1 h-px bg-zinc-800/80 ml-1" />
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ECGPrediction() {
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [result, setResult] = useState(null);

  const [features, setFeatures] = useState({
    age: '', sex: '', cp: '', trestbps: '',
    chol: '', fbs: '', restecg: '', thalach: '',
    exang: '', oldpeak: '', slope: '', ca: '', thal: ''
  });

  const [summary, setSummary] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [waveformPattern, setWaveformPattern] = useState('normal');
  const [rhythmType, setRhythmType] = useState('Normal');
  const [heartRate, setHeartRate] = useState(0);
  const [showEmergency, setShowEmergency] = useState(false);

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
        setFeatures(extractedFeatures);
        await executeOfflinePrediction(extractedFeatures);
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

  const executeOfflinePrediction = async (currentFeatures) => {
    setIsProcessing(true);
    setCurrentStage('Analyzing');
    await new Promise((r) => setTimeout(r, 600));

    try {
      const mlResponse = await predictECGLocal(currentFeatures);
      const cardiologyReport = generateLocalCardiologyReport(mlResponse, currentFeatures);

      setResult({
        prediction: mlResponse.prediction,
        risk_probability: mlResponse.risk_probability,
        riskLabel: mlResponse.prediction !== 'Normal' ? 'Critical' : 'Healthy'
      });

      setSummary(cardiologyReport.summary);
      setRecommendations(cardiologyReport.recommendations);
      setWaveformPattern(cardiologyReport.waveformPattern);
      setHeartRate(currentFeatures.thalach);

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

  const handleFeatureChange = (name, val) => {
    setFeatures(prev => ({ ...prev, [name]: parseFloat(val) }));
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

          {/* ── LEFT SIDEBAR (Upload + Parameters) ─── col 1-4 */}
          <div className="xl:col-span-4 space-y-5">

            {/* Upload Card */}
            <div className="ecg-fade-1">
              <ECGUploadCard
                onUpload={handleECGUpload}
                isProcessing={isProcessing}
                currentStage={currentStage}
              />
            </div>

            {/* Clinical Parameters Panel */}
            <div className="ecg-fade-2">
              <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
                {/* Panel header */}
                <div className="px-5 py-4 border-b border-zinc-800/60 bg-zinc-900/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-bold text-white">Clinical Parameters</h3>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest
                      px-2 py-0.5 bg-zinc-800 rounded-full">
                      13 Features
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-1">
                    Auto-filled from upload. You can manually adjust any value before running prediction.
                  </p>
                </div>

                <div className="p-5 space-y-6">
                  {/* ── Patient Info ─── */}
                  <div>
                    <SectionLabel icon={UserCircle} label="Patient Info" color="text-blue-400" />
                    <div className="grid grid-cols-2 gap-3">
                      <FieldInput
                        label="Age (years)"
                        type="number" min="0" max="120"
                        value={features.age}
                        onChange={(e) => handleFeatureChange('age', e.target.value)}
                      />
                      <FieldSelect
                        label="Gender"
                        value={features.sex}
                        onChange={(e) => handleFeatureChange('sex', e.target.value)}
                      >
                        <option value="">--</option>
                        <option value="0">Female</option>
                        <option value="1">Male</option>
                      </FieldSelect>
                    </div>
                  </div>

                  {/* ── Cardiac Symptoms ─── */}
                  <div>
                    <SectionLabel icon={Heart} label="Cardiac Symptoms" color="text-rose-400" />
                    <div className="grid grid-cols-2 gap-3">
                      <FieldSelect
                        label="Chest Pain Type"
                        helpText="0=Asympt · 1=Atypical · 2=Non-ang · 3=Typical"
                        value={features.cp}
                        onChange={(e) => handleFeatureChange('cp', e.target.value)}
                      >
                        <option value="">--</option>
                        <option value="0">Asymptomatic</option>
                        <option value="1">Atypical Angina</option>
                        <option value="2">Non-anginal Pain</option>
                        <option value="3">Typical Angina</option>
                      </FieldSelect>
                      <FieldSelect
                        label="Exercise Angina"
                        helpText="Pain triggered by exercise?"
                        value={features.exang}
                        onChange={(e) => handleFeatureChange('exang', e.target.value)}
                      >
                        <option value="">--</option>
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </FieldSelect>
                    </div>
                  </div>

                  {/* ── Vitals ─── */}
                  <div>
                    <SectionLabel icon={Activity} label="Vitals & Labs" color="text-cyan-400" />
                    <div className="grid grid-cols-2 gap-3">
                      <FieldInput
                        label="Resting BP (mmHg)"
                        type="number" min="0"
                        value={features.trestbps}
                        onChange={(e) => handleFeatureChange('trestbps', e.target.value)}
                      />
                      <FieldInput
                        label="Cholesterol (mg/dl)"
                        type="number" min="0"
                        value={features.chol}
                        onChange={(e) => handleFeatureChange('chol', e.target.value)}
                      />
                      <FieldSelect
                        label="Fasting Blood Sugar"
                        helpText="> 120 mg/dl?"
                        value={features.fbs}
                        onChange={(e) => handleFeatureChange('fbs', e.target.value)}
                      >
                        <option value="">--</option>
                        <option value="0">Normal (≤ 120)</option>
                        <option value="1">High (&gt; 120)</option>
                      </FieldSelect>
                      <FieldInput
                        label="Max Heart Rate"
                        helpText="thalach (BPM)"
                        type="number" min="0"
                        value={features.thalach}
                        onChange={(e) => handleFeatureChange('thalach', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* ── ECG Readings ─── */}
                  <div>
                    <SectionLabel icon={Zap} label="ECG Readings" color="text-amber-400" />
                    <div className="grid grid-cols-2 gap-3">
                      <FieldSelect
                        label="Resting ECG"
                        value={features.restecg}
                        onChange={(e) => handleFeatureChange('restecg', e.target.value)}
                      >
                        <option value="">--</option>
                        <option value="0">Normal</option>
                        <option value="1">ST-T Abnormality</option>
                        <option value="2">LV Hypertrophy</option>
                      </FieldSelect>
                      <FieldInput
                        label="ST Depression (mm)"
                        helpText="oldpeak – exercise vs rest"
                        type="number" step="0.1" min="0"
                        value={features.oldpeak}
                        onChange={(e) => handleFeatureChange('oldpeak', e.target.value)}
                      />
                      <FieldSelect
                        label="ST Slope"
                        value={features.slope}
                        onChange={(e) => handleFeatureChange('slope', e.target.value)}
                      >
                        <option value="">--</option>
                        <option value="0">Upsloping</option>
                        <option value="1">Flat</option>
                        <option value="2">Downsloping</option>
                      </FieldSelect>
                      <FieldInput
                        label="Major Vessels (ca)"
                        helpText="0–3 fluoroscopy vessels"
                        type="number" min="0" max="3"
                        value={features.ca}
                        onChange={(e) => handleFeatureChange('ca', e.target.value)}
                      />
                      <FieldSelect
                        label="Thalassemia (thal)"
                        value={features.thal}
                        onChange={(e) => handleFeatureChange('thal', e.target.value)}
                      >
                        <option value="">--</option>
                        <option value="0">Unknown</option>
                        <option value="1">Normal</option>
                        <option value="2">Fixed Defect</option>
                        <option value="3">Reversible Defect</option>
                      </FieldSelect>
                    </div>
                  </div>

                  {/* Disclaimer note */}
                  <div className="flex gap-2 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/40">
                    <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Values are parsed directly from the uploaded ECG document. Adjust manually only if the OCR extraction was inaccurate.
                    </p>
                  </div>

                  {/* Run button */}
                  <button
                    onClick={() => executeOfflinePrediction(features)}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm
                      bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500
                      text-white transition-all duration-200 shadow-lg shadow-blue-600/20
                      disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {isProcessing
                      ? <><LoaderIcon className="w-4 h-4 animate-spin" /> Analyzing…</>
                      : <><RefreshCw className="w-4 h-4" /> Run ML Prediction</>
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT MAIN (Monitor + Results) ─── col 5-12 */}
          <div className="xl:col-span-8 space-y-5">

            {/* ECG Live Monitor */}
            <div className="ecg-fade-1">
              <ECGWaveChart
                isProcessing={isProcessing}
                heartRate={heartRate}
                rhythmType={rhythmType}
                waveformPattern={waveformPattern}
              />
            </div>

            {/* Metrics row */}
            <div className="ecg-fade-2">
              <HeartAnalytics features={features} />
            </div>

            {/* Prediction + AI Analysis side by side */}
            <div className="ecg-fade-3 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Prediction Result – always visible, shows empty state if no result */}
              <div>
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

              {/* AI Summary */}
              <div>
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
