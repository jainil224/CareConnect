import React from 'react';
import { motion } from 'framer-motion';

export default function ECGAnimation() {
  // A realistic looking ECG heartbeat path
  const ecgPath = "M 0 50 L 100 50 L 120 40 L 130 50 L 150 50 L 160 80 L 180 10 L 190 60 L 200 50 L 230 50 L 250 30 L 270 50 L 400 50 L 420 40 L 430 50 L 450 50 L 460 80 L 480 10 L 490 60 L 500 50 L 530 50 L 550 30 L 570 50 L 700 50";

  return (
    <div className="w-full h-32 relative mt-8 opacity-60">
      {/* Background glow behind the line */}
      <div className="absolute inset-0 bg-cyan-500/5 blur-xl rounded-full"></div>
      
      <svg 
        viewBox="0 0 700 100" 
        className="w-full h-full relative z-10 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
        preserveAspectRatio="none"
      >
        <motion.path
          d={ecgPath}
          fill="transparent"
          stroke="#22d3ee"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 1],
            opacity: [0, 1, 0] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.8, 1] // Draw over 80% of the time, fade out at end
          }}
        />
        
        {/* Subtle persistent background line */}
        <path
          d={ecgPath}
          fill="transparent"
          stroke="#0f4a66"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-30"
        />
      </svg>
    </div>
  );
}
