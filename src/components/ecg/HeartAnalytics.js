import React, { useEffect, useState } from 'react';
import { Heart, Activity, Thermometer, Zap } from 'lucide-react';

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

export default function HeartAnalytics({ features }) {
  const stats = [
    { 
      label: 'Heart Rate', 
      rawValue: features?.thalach,
      unit: 'BPM', 
      icon: Heart, 
      color: 'text-rose-400', 
      bg: 'bg-rose-400/10' 
    },
    { 
      label: 'Blood Pressure', 
      rawValue: features?.trestbps,
      // Blood pressure contains both systolic and diastolic: e.g. "120/80"
      display: features?.trestbps > 0 ? `${features.trestbps}/80` : "0",
      unit: 'mmHg', 
      icon: Activity, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-400/10' 
    },
    { 
      label: 'Cholesterol', 
      rawValue: features?.chol,
      unit: 'mg/dl', 
      icon: Thermometer, 
      color: 'text-amber-400', 
      bg: 'bg-amber-400/10' 
    },
    { 
      label: 'ST Depression', 
      rawValue: features?.oldpeak,
      unit: 'mm', 
      icon: Zap, 
      color: 'text-purple-400', 
      bg: 'bg-purple-400/10' 
    }
  ];

  return (
    <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-semibold text-blue-100 mb-6 flex items-center">
        <Heart className="w-5 h-5 mr-2 text-rose-500" />
        Clinical Metrics
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800/40 rounded-xl p-4 flex items-center space-x-4 hover:bg-blue-500/5 transition-colors duration-300">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-200/50 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-bold text-blue-50 leading-none">
                  {stat.display ? (
                    stat.display
                  ) : (
                    <CountUpValue value={stat.rawValue} />
                  )}
                </span>
                <span className="text-[10px] font-medium text-blue-200/40">{stat.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
