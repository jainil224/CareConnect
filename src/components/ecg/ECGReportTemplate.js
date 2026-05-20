import React from 'react';
import { Activity, Heart, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ECGReportTemplate({ result, features, summary, recommendations = [] }) {
  // Safe parsing
  const isHighRisk = result?.prediction !== "Normal";
  const confidence = result?.risk_probability || "0%";
  const numConfidence = parseFloat(confidence);
  
  let riskLevel = "Low Risk";
  let statusColor = "text-green-400";
  let bgStatusColor = "bg-green-500/10";
  let borderStatusColor = "border-green-500/30";

  if (isHighRisk || numConfidence > 50) {
    riskLevel = "High Risk";
    statusColor = "text-[#ffb4ab]";
    bgStatusColor = "bg-red-500/10";
    borderStatusColor = "border-red-500/30";
  } else if (numConfidence > 20) {
    riskLevel = "Moderate Risk";
    statusColor = "text-amber-400";
    bgStatusColor = "bg-amber-500/10";
    borderStatusColor = "border-amber-500/30";
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
  const reportId = `REP-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`;
  const patientId = `PT-${Math.floor(10000 + Math.random() * 90000)}`;

  return (
    <div id="ecg-pdf-report" className="bg-[#0a0a0a] text-[#bbc9cf] font-sans w-[210mm] h-[296mm] mx-auto box-border flex flex-col relative overflow-hidden"
         style={{ backgroundImage: 'radial-gradient(circle, #2a2a2a 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      
      {/* HEADER */}
      <div className="flex justify-between items-start border-b border-cyan-500/30 p-5 shrink-0 bg-[#0c0c0e]/90">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Activity className="text-cyan-400 w-8 h-8" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">CareConnect</h1>
            <p className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest">AI ECG Prediction System</p>
          </div>
        </div>
        <div className="text-right text-[10px] text-zinc-400 space-y-0.5">
          <p><span className="font-semibold text-zinc-300">Report ID:</span> {reportId}</p>
          <p><span className="font-semibold text-zinc-300">Date:</span> {currentDate}</p>
          <p><span className="font-semibold text-zinc-300">Patient ID:</span> {patientId}</p>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow gap-4">
        {/* PATIENT DETAILS */}
        <div className="shrink-0">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-500 pl-2 mb-2">Patient Information</h2>
          <div className="grid grid-cols-4 gap-3 bg-[#1c1b1b]/80 p-3 rounded-lg border border-zinc-800/80 text-xs">
            <div><span className="text-zinc-500 block text-[9px] font-bold tracking-widest uppercase">Name</span><span className="font-semibold text-white">{features?.name || "N/A"}</span></div>
            <div><span className="text-zinc-500 block text-[9px] font-bold tracking-widest uppercase">Age</span><span className="font-semibold text-white">{features?.age ? `${features.age} Years` : "N/A"}</span></div>
            <div><span className="text-zinc-500 block text-[9px] font-bold tracking-widest uppercase">Gender</span><span className="font-semibold text-white">{features?.sex === 1 ? 'Male' : features?.sex === 0 ? 'Female' : 'N/A'}</span></div>
            <div><span className="text-zinc-500 block text-[9px] font-bold tracking-widest uppercase">Blood Group</span><span className="font-semibold text-white">O+</span></div>
            <div><span className="text-zinc-500 block text-[9px] font-bold tracking-widest uppercase">Height</span><span className="font-semibold text-white">{features?.height ? `${features.height} cm` : "N/A"}</span></div>
            <div><span className="text-zinc-500 block text-[9px] font-bold tracking-widest uppercase">Weight</span><span className="font-semibold text-white">{features?.weight ? `${features.weight} kg` : "N/A"}</span></div>
            <div><span className="text-zinc-500 block text-[9px] font-bold tracking-widest uppercase">Contact</span><span className="font-semibold text-white">+1 555-0198</span></div>
            <div><span className="text-zinc-500 block text-[9px] font-bold tracking-widest uppercase">Hospital</span><span className="font-semibold text-white">CareConnect Central</span></div>
          </div>
        </div>

        {/* MAIN RESULT */}
        <div className={`p-4 rounded-lg border ${borderStatusColor} ${bgStatusColor} relative overflow-hidden shrink-0`}>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h2 className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest mb-1">AI Diagnostic Result</h2>
              <h1 className={`text-3xl font-extrabold ${statusColor} mb-1 tracking-tight`}>{result?.prediction || 'Normal'}</h1>
              <p className="font-semibold text-zinc-300 text-xs tracking-wide">Risk Level: <span className={statusColor}>{riskLevel}</span></p>
            </div>
            <div className="text-center bg-[#0c0c0e]/80 p-3 rounded-lg border border-zinc-800/80 min-w-[120px]">
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Confidence</p>
              <p className={`text-2xl font-black ${statusColor}`}>{confidence}</p>
            </div>
          </div>
        </div>

        {/* ECG WAVEFORM */}
        <div className="shrink-0" style={{ pageBreakInside: 'avoid' }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-500 pl-2">Lead II • 25 mm/s</h2>
            <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">Rhythm: {isHighRisk ? 'Irregular' : 'Normal Sinus Rhythm'}</span>
          </div>
          <div className="border border-zinc-700/50 rounded-lg bg-[#0a0a0a] p-2 relative overflow-hidden" 
               style={{ backgroundImage: 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            <svg viewBox="0 0 800 100" className="w-full h-24 stroke-[#ffb4ab] fill-none drop-shadow-[0_0_8px_rgba(255,180,171,0.5)]" style={{ strokeWidth: 1.5 }}>
              <path d={generateWaveformPath()} />
            </svg>
          </div>
        </div>

        {/* CLINICAL ANALYTICS */}
        <div className="grid grid-cols-2 gap-4 shrink-0" style={{ pageBreakInside: 'avoid' }}>
          <div className="flex flex-col">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-500 pl-2 mb-2">Clinical Metrics</h2>
            <div className="bg-[#1c1b1b]/80 rounded-lg border border-zinc-800/80 overflow-hidden flex-grow">
              <table className="w-full text-[10px] text-left border-collapse">
                <tbody>
                  <tr className="border-b border-zinc-800/80">
                    <td className="py-2.5 px-3 text-zinc-400 font-medium tracking-wide">Heart Rate (BPM)</td>
                    <td className="py-2.5 px-3 font-bold text-right text-white">{features?.thalach || '--'}</td>
                  </tr>
                  <tr className="border-b border-zinc-800/80">
                    <td className="py-2.5 px-3 text-zinc-400 font-medium tracking-wide">Cholesterol (mg/dl)</td>
                    <td className="py-2.5 px-3 font-bold text-right text-white">{features?.chol || '--'}</td>
                  </tr>
                  <tr className="border-b border-zinc-800/80">
                    <td className="py-2.5 px-3 text-zinc-400 font-medium tracking-wide">ST Depression (mm)</td>
                    <td className="py-2.5 px-3 font-bold text-right text-white">{features?.oldpeak || '--'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-zinc-400 font-medium tracking-wide">Fasting Blood Sugar</td>
                    <td className="py-2.5 px-3 font-bold text-right text-white">{features?.fbs === 1 ? '> 120 mg/dl' : '< 120 mg/dl'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-500 pl-2 mb-2">AI Medical Summary</h2>
            <div className="bg-[#1c1b1b]/80 p-3 rounded-lg border border-zinc-800/80 flex-grow">
              <p className="text-[10px] text-zinc-300 leading-relaxed">
                {summary || "AI summary not available. Please wait for the analysis to complete."}
              </p>
            </div>
          </div>
        </div>

        {/* RECOMMENDATIONS */}
        <div className="shrink-0" style={{ pageBreakInside: 'avoid' }}>
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-500 pl-2 mb-2">Cardiac Recommendations</h2>
          <div className="bg-[#1c1b1b]/40 p-3 rounded-lg border border-zinc-800/40">
            <ul className="space-y-2">
              {recommendations && recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start text-[10px] text-zinc-300">
                    <CheckCircle className="w-3.5 h-3.5 mr-2 text-cyan-500 shrink-0 mt-0.5" /> 
                    <span>{rec}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start text-[10px] text-zinc-500 italic">No specific recommendations available.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-auto shrink-0 bg-[#0c0c0e]/90 p-4 border-t border-cyan-500/10" style={{ pageBreakInside: 'avoid' }}>
        <div className="text-center">
          <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Generated by CareConnect AI System</p>
          <p className="text-[7px] text-zinc-600 leading-relaxed">
            DISCLAIMER: This report is AI-generated and should not be used as the sole basis for clinical diagnosis. 
            All results must be verified by a certified healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
}
