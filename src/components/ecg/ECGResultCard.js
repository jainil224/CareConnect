import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export default function ECGResultCard({ result, probability, riskLabel }) {
  const [animateState, setAnimateState] = useState(false);
  const isHighRisk = result !== "Normal" || (riskLabel && riskLabel.toLowerCase() === 'critical');
  const numProbability = parseFloat(probability) || 0;

  // Sync animation triggers when predictions arrive
  useEffect(() => {
    if (result) {
      setAnimateState(true);
      const timer = setTimeout(() => setAnimateState(false), 900);
      return () => clearTimeout(timer);
    }
  }, [result]);

  // Determine styling based on riskLabel or prediction result
  const activeLabel = riskLabel || (isHighRisk ? "Critical" : "Healthy");
  const normLabel = activeLabel.toLowerCase();

  let statusColor = "from-green-500 to-emerald-400";
  let textColor = "text-green-400";
  let glowColor = "rgba(16, 185, 129, 0.4)";
  let barColor = "from-green-500 to-emerald-400";
  let Icon = CheckCircle;
  let riskTitle = "Healthy";
  let pulseClass = "";

  if (normLabel === 'critical' || normLabel === 'high') {
    statusColor = "from-red-500 to-rose-600";
    textColor = "text-rose-400";
    glowColor = "rgba(225, 29, 72, 0.5)";
    barColor = "from-red-500 to-rose-500";
    Icon = ShieldAlert;
    riskTitle = "Critical";
    pulseClass = "animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.3)] border-red-500/40";
  } else if (normLabel === 'moderate risk' || normLabel === 'moderate') {
    statusColor = "from-yellow-400 to-amber-500";
    textColor = "text-amber-400";
    glowColor = "rgba(245, 158, 11, 0.4)";
    barColor = "from-yellow-500 to-amber-500";
    Icon = AlertTriangle;
    riskTitle = "Moderate Risk";
  } else if (normLabel === 'normal') {
    statusColor = "from-amber-400 to-yellow-500";
    textColor = "text-amber-300";
    glowColor = "rgba(245, 158, 11, 0.35)";
    barColor = "from-amber-400 to-yellow-500";
    Icon = AlertCircle;
    riskTitle = "Normal";
  }

  // Determine progress bar color based on prompt thresholds:
  // amber for <60%, green for >80%, red for <30%
  let confidenceBarColor = "from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
  if (numProbability > 80) {
    confidenceBarColor = "from-green-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
  } else if (numProbability < 30) {
    confidenceBarColor = "from-red-500 to-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]";
  }

  const bounceClass = animateState ? "scale-110 rotate-1 ease-out duration-300" : "scale-100 rotate-0 ease-in duration-200";

  return (
    <div className={`bg-[#0c0c0e]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden h-full transition-all duration-500 ${pulseClass}`}>
      
      {/* Styles for dynamic pulse breathing */}
      <style>{`
        @keyframes scale-up-bounce {
          0% { transform: scale(0.9); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .bounce-updater {
          animation: scale-up-bounce 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none" style={{ background: glowColor }}></div>

      <div className="flex items-center space-x-3 mb-6 relative z-10">
        <Activity className="text-cyan-400 w-6 h-6 animate-pulse" />
        <h3 className="text-lg font-semibold text-blue-100">Prediction Engine</h3>
      </div>

      <div className={`flex flex-col items-center justify-center space-y-4 py-4 relative z-10 transition-transform ${bounceClass}`}>
        
        {/* Large pulsing/glowing state icon */}
        <div 
          className={`p-4.5 rounded-full bg-gradient-to-br ${statusColor} bg-opacity-20 backdrop-blur-md border border-white/10 shadow-lg transition-transform duration-300 ${animateState ? 'bounce-updater' : ''}`}
          style={{ boxShadow: `0 0 35px ${glowColor}` }}
        >
          <Icon className="w-11 h-11 text-white" />
        </div>
        
        <div className="text-center">
          <h2 className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${statusColor} mb-1 tracking-tight`}>
            {riskTitle}
          </h2>
          <p className="text-blue-200/50 text-[10px] font-bold uppercase tracking-widest">
            {result} Detected
          </p>
        </div>

        {/* Confidence Progress bar */}
        <div className="w-full mt-6 bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/40">
          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="text-blue-200/60 font-semibold">AI Confidence Score</span>
            <span className={`font-black ${textColor}`}>{probability}</span>
          </div>
          <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
            <div 
              className={`h-full bg-gradient-to-r ${confidenceBarColor} transition-all duration-[1200ms] ease-out`} 
              style={{ width: probability }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
