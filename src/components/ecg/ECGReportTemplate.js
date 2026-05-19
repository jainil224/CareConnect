import React from 'react';
import { Activity, Heart, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ECGReportTemplate({ result, features, summary }) {
  // Safe parsing
  const isHighRisk = result?.prediction !== "Normal";
  const confidence = result?.risk_probability || "0%";
  const numConfidence = parseFloat(confidence);
  
  let riskLevel = "Low Risk";
  let statusColor = "text-green-600";
  let bgStatusColor = "bg-green-100";
  let borderStatusColor = "border-green-500";

  if (isHighRisk || numConfidence > 50) {
    riskLevel = "High Risk";
    statusColor = "text-red-600";
    bgStatusColor = "bg-red-100";
    borderStatusColor = "border-red-500";
  } else if (numConfidence > 20) {
    riskLevel = "Moderate Risk";
    statusColor = "text-yellow-600";
    bgStatusColor = "bg-yellow-100";
    borderStatusColor = "border-yellow-500";
  }

  // Generate a mock ECG Waveform SVG path for visual fidelity
  const generateWaveformPath = () => {
    let d = "M 0 50 ";
    for(let i=0; i<800; i+=2) {
      const mod = i % 150;
      let y = 50;
      if (mod > 20 && mod < 30) y = 45; // P wave
      else if (mod > 40 && mod < 45) y = 55; // Q
      else if (mod >= 45 && mod < 55) y = 10; // R
      else if (mod >= 55 && mod < 65) y = 70; // S
      else if (mod > 90 && mod < 110) y = 40; // T
      else y = 50 + (Math.random() * 2 - 1); // Baseline noise
      d += `L ${i} ${y} `;
    }
    return d;
  };

  const currentDate = new Date().toLocaleString();
  const reportId = `ECG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const patientId = `PT-${Math.floor(10000 + Math.random() * 90000)}`;

  return (
    <div id="ecg-pdf-report" className="bg-white text-gray-900 font-sans p-8 w-[210mm] min-h-[297mm] mx-auto box-border flex flex-col">
      
      {/* HEADER */}
      <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-6 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Activity className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-900 tracking-tight">CareConnect</h1>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest">AI ECG Prediction System</p>
          </div>
        </div>
        <div className="text-right text-sm text-gray-600 space-y-1">
          <p><span className="font-semibold text-gray-800">Report ID:</span> {reportId}</p>
          <p><span className="font-semibold text-gray-800">Date & Time:</span> {currentDate}</p>
          <p><span className="font-semibold text-gray-800">Patient ID:</span> {patientId}</p>
        </div>
      </div>

      {/* PATIENT DETAILS */}
      <div className="mb-8 shrink-0">
        <h2 className="text-lg font-bold text-blue-900 uppercase border-l-4 border-blue-600 pl-3 mb-4">Patient Information</h2>
        <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
          <div><span className="text-gray-500 block text-xs uppercase">Name</span><span className="font-semibold">John Doe (Mock)</span></div>
          <div><span className="text-gray-500 block text-xs uppercase">Age</span><span className="font-semibold">{features?.age || 45} Years</span></div>
          <div><span className="text-gray-500 block text-xs uppercase">Gender</span><span className="font-semibold">{features?.sex === 1 ? 'Male' : 'Female'}</span></div>
          <div><span className="text-gray-500 block text-xs uppercase">Blood Group</span><span className="font-semibold">O+</span></div>
          <div><span className="text-gray-500 block text-xs uppercase">Height</span><span className="font-semibold">178 cm</span></div>
          <div><span className="text-gray-500 block text-xs uppercase">Weight</span><span className="font-semibold">75 kg</span></div>
          <div><span className="text-gray-500 block text-xs uppercase">Contact</span><span className="font-semibold">+1 234 567 8900</span></div>
          <div><span className="text-gray-500 block text-xs uppercase">Hospital</span><span className="font-semibold">CareConnect General</span></div>
        </div>
      </div>

      {/* MAIN RESULT */}
      <div className={`mb-8 p-6 rounded-2xl border-2 ${borderStatusColor} ${bgStatusColor} relative overflow-hidden shrink-0`}>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold uppercase text-gray-700 tracking-wider mb-1">AI Diagnostic Result</h2>
            <h1 className={`text-4xl font-extrabold ${statusColor} mb-2`}>{result?.prediction || 'Normal'}</h1>
            <p className="font-semibold text-gray-700 text-lg">Risk Level: <span className={statusColor}>{riskLevel}</span></p>
          </div>
          <div className="text-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 min-w-[120px]">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Confidence</p>
            <p className={`text-3xl font-black ${statusColor}`}>{confidence}</p>
          </div>
        </div>
      </div>

      {/* ECG WAVEFORM */}
      <div className="mb-8 shrink-0" style={{ pageBreakInside: 'avoid' }}>
        <h2 className="text-lg font-bold text-blue-900 uppercase border-l-4 border-blue-600 pl-3 mb-4">Signal Visualization (Lead II Approximation)</h2>
        <div className="border border-gray-300 rounded-xl bg-[#f8fafc] p-2 relative" style={{ backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          <svg viewBox="0 0 800 100" className="w-full h-32 stroke-blue-600 fill-none" style={{ strokeWidth: 1.5 }}>
            <path d={generateWaveformPath()} />
          </svg>
        </div>
      </div>

      {/* CLINICAL ANALYTICS */}
      <div className="mb-8 grid grid-cols-2 gap-8 shrink-0" style={{ pageBreakInside: 'avoid' }}>
        <div>
          <h2 className="text-lg font-bold text-blue-900 uppercase border-l-4 border-blue-600 pl-3 mb-4">Heart Analytics</h2>
          <table className="w-full text-sm text-left border-collapse">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600 font-medium">Heart Rate (BPM)</td>
                <td className="py-2 font-bold text-right">{features?.thalach || '--'}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600 font-medium">Blood Pressure (mmHg)</td>
                <td className="py-2 font-bold text-right">{features?.trestbps || '--'}/80</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600 font-medium">Cholesterol (mg/dl)</td>
                <td className="py-2 font-bold text-right">{features?.chol || '--'}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600 font-medium">ST Depression (mm)</td>
                <td className="py-2 font-bold text-right">{features?.oldpeak || '--'}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600 font-medium">Fasting Blood Sugar</td>
                <td className="py-2 font-bold text-right">{features?.fbs === 1 ? '> 120 mg/dl' : '< 120 mg/dl'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-lg font-bold text-blue-900 uppercase border-l-4 border-blue-600 pl-3 mb-4">AI Medical Summary</h2>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 h-full">
            <p className="text-sm text-gray-700 leading-relaxed">
              {summary || "AI summary not available. Please wait for the analysis to complete."}
            </p>
          </div>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="mb-8 shrink-0" style={{ pageBreakInside: 'avoid' }}>
        <h2 className="text-lg font-bold text-blue-900 uppercase border-l-4 border-blue-600 pl-3 mb-4">Recommendations</h2>
        <ul className="list-disc pl-6 text-sm text-gray-700 space-y-2">
          {isHighRisk ? (
            <>
              <li className="font-bold text-red-600">Immediate cardiology consultation strongly recommended.</li>
              <li>Schedule an echocardiogram and a stress test as soon as possible.</li>
              <li>Monitor blood pressure daily and keep a detailed log.</li>
              <li>Avoid strenuous physical activity until cleared by a physician.</li>
            </>
          ) : (
            <>
              <li>Maintain current healthy cardiovascular lifestyle habits.</li>
              <li>Continue regular aerobic exercise (e.g., 30 mins walking/day).</li>
              <li>Ensure balanced diet to maintain healthy cholesterol levels.</li>
              <li>Schedule standard annual check-ups.</li>
            </>
          )}
        </ul>
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-8 shrink-0" style={{ pageBreakInside: 'avoid' }}>
        <div className="border-t border-gray-300 pt-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Generated by CareConnect AI System</p>
          <p className="text-[10px] text-gray-400">
            DISCLAIMER: This report is generated by an artificial intelligence predictive model and should not be used as the sole basis for clinical diagnosis. 
            All results must be verified by a certified healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
}
