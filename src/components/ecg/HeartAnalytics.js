import React from 'react';
import { Heart, Activity, Thermometer, Zap } from 'lucide-react';

export default function HeartAnalytics({ features }) {
  const stats = [
    { label: 'Heart Rate', value: `${features?.thalach || '--'}`, unit: 'BPM', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { label: 'Blood Pressure', value: `${features?.trestbps || '--'}/80`, unit: 'mmHg', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { label: 'Cholesterol', value: `${features?.chol || '--'}`, unit: 'mg/dl', icon: Thermometer, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'ST Depression', value: `${features?.oldpeak || '--'}`, unit: 'mm', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10' }
  ];

  return (
    <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-semibold text-blue-100 mb-6 flex items-center">
        <Heart className="w-5 h-5 mr-2 text-rose-500" />
        Clinical Metrics
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800/40 rounded-xl p-4 flex items-center space-x-4 hover:bg-blue-500/5 transition-colors">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-blue-200/60 uppercase tracking-wider mb-1">{stat.label}</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-bold text-blue-50">{stat.value}</span>
                <span className="text-xs font-medium text-blue-200/40">{stat.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
