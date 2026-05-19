import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, ShieldCheck, AlertCircle } from 'lucide-react';

export default function FloatingHealthCards() {
  const cards = [
    {
      id: 1,
      icon: Heart,
      title: "Heart Rate",
      value: "88 BPM",
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      border: "border-rose-400/30",
      delay: 0,
      position: "top-[-20px] left-[-40px]",
    },
    {
      id: 2,
      icon: Activity,
      title: "AI Health Score",
      value: "92%",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/30",
      delay: 1.5,
      position: "bottom-[40px] right-[-30px]",
    },
    {
      id: 3,
      icon: ShieldCheck,
      title: "ECG Status",
      value: "Stable",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/30",
      delay: 0.7,
      position: "top-[120px] right-[-50px]",
    }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {cards.map((card) => (
        <motion.div
          key={card.id}
          className={`absolute ${card.position} flex items-center space-x-3 p-3 bg-[#0a1526]/80 backdrop-blur-md border ${card.border} rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)]`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: card.delay
          }}
        >
          <div className={`p-2 rounded-lg ${card.bg}`}>
            <card.icon className={`w-5 h-5 ${card.color}`} />
          </div>
          <div>
            <p className="text-[10px] text-blue-200/60 uppercase tracking-wider font-semibold">{card.title}</p>
            <p className="text-sm font-bold text-blue-50">{card.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
