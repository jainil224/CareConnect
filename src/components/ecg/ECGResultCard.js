import React from 'react';
import { Activity, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ECGResultCard({ result, probability }) {
  const isHighRisk = result !== "Normal";
  const numProbability = parseFloat(probability);
  
  // Determine color and styling based on risk
  let statusColor = "from-green-500 to-emerald-400";
  let glowColor = "rgba(16, 185, 129, 0.4)";
  let Icon = CheckCircle;
  let riskText = "Low Risk";

  if (isHighRisk || numProbability > 50) {
    statusColor = "from-red-500 to-rose-600";
    glowColor = "rgba(225, 29, 72, 0.4)";
    Icon = ShieldAlert;
    riskText = "Critical Risk";
  } else if (numProbability > 20) {
    statusColor = "from-yellow-400 to-amber-500";
    glowColor = "rgba(245, 158, 11, 0.4)";
    Icon = AlertTriangle;
    riskText = "Moderate Risk";
  }

  return (
    <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none" style={{ background: glowColor }}></div>

      <div className="flex items-center space-x-3 mb-6 relative z-10">
        <Activity className="text-cyan-400 w-6 h-6" />
        <h3 className="text-lg font-semibold text-blue-100">Prediction Engine</h3>
      </div>

      <div className="flex flex-col items-center justify-center space-y-4 py-4 relative z-10">
        <div className={`p-4 rounded-full bg-gradient-to-br ${statusColor} bg-opacity-20 backdrop-blur-md border border-white/10 shadow-lg`} style={{ boxShadow: `0 0 30px ${glowColor}` }}>
          <Icon className="w-10 h-10 text-white" />
        </div>
        
        <div className="text-center">
          <h2 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${statusColor} mb-2`}>
            {result}
          </h2>
          <p className="text-blue-200/70 text-sm font-medium uppercase tracking-wider">
            {riskText} DETECTED
          </p>
        </div>

        <div className="w-full mt-6 bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/40">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-blue-200/70">AI Confidence Score</span>
            <span className="font-bold text-blue-100">{probability}</span>
          </div>
          <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${statusColor} transition-all duration-1000 ease-out`} 
              style={{ width: probability }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
