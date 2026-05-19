import React, { useEffect, useState } from 'react';
import { Heart, Activity, Ruler, Scale } from 'lucide-react';

const CountUpValue = ({ value, defaultValue = "--" }) => {
  const [current, setCurrent] = useState(defaultValue);
  
  useEffect(() => {
    if (value === undefined || value === null || value === "" || value === "--") {
      setCurrent(defaultValue);
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setCurrent(value);
      return;
    }

    let start = 0;
    const end = numValue;
    const duration = 900; // 900ms count-up
    const startTime = performance.now();

    const animate = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutQuad animation
      const easeProgress = progress * (2 - progress);
      const val = start + easeProgress * (end - start);
      
      if (end % 1 === 0) {
        setCurrent(Math.floor(val));
      } else {
        setCurrent(val.toFixed(1));
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, defaultValue]);

  return <span>{current}</span>;
};

export default function HeartAnalytics({ patientInfo }) {
  const stats = [
    { 
      label: 'Heart Rate', 
      rawValue: patientInfo?.heartRate,
      unit: 'BPM', 
      icon: Heart, 
      color: 'text-rose-400', 
      bg: 'bg-rose-500/10 border-rose-500/20' 
    },
    { 
      label: 'Height', 
      rawValue: patientInfo?.height,
      unit: 'cm', 
      icon: Ruler, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/10 border-cyan-500/20' 
    },
    { 
      label: 'Weight', 
      rawValue: patientInfo?.weight,
      unit: 'kg', 
      icon: Scale, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10 border-emerald-500/20' 
    }
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-zinc-800/60 bg-zinc-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Clinical Metrics</h3>
        </div>
      </div>

      {/* Patient Profile Row */}
      {patientInfo?.name && (
        <div className="px-5 py-4 border-b border-zinc-800/40 bg-zinc-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-blue-400">
                {patientInfo.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Patient Profile</p>
              <h4 className="text-sm font-bold text-white mt-0.5">{patientInfo.name}</h4>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {patientInfo.gender && (
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Gender</p>
                <p className="text-xs text-zinc-300 font-bold mt-0.5">
                  {patientInfo.gender === '1' ? 'Male' : 'Female'}
                </p>
              </div>
            )}
            {patientInfo.dob && (
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Date of Birth</p>
                <p className="text-xs text-zinc-300 font-bold mt-0.5">{patientInfo.dob}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900/20 border border-zinc-800/40 rounded-xl p-4 flex items-center space-x-4 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-300">
            <div className={`p-2.5 rounded-xl border flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-bold text-white leading-none">
                  {stat.display ? (
                    stat.display
                  ) : (
                    <CountUpValue value={stat.rawValue} />
                  )}
                </span>
                <span className="text-[10px] font-medium text-zinc-500">{stat.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
