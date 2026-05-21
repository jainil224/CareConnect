import React from 'react';

export default function KidneySVG() {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className="w-full h-full max-w-[200px] max-h-[200px] transition-all duration-500"
    >
      <defs>
        {/* Glow Filter */}
        <filter id="kidneyGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        {/* Gradients */}
        <linearGradient id="kidneyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        <linearGradient id="medullaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>

      <style>{`
        @keyframes organPulse {
          0%   { r: 4; opacity: 1; }
          50%  { r: 7; opacity: 0.4; }
          100% { r: 4; opacity: 1; }
        }
        .pulse-dot {
          fill: #2563EB;
          animation: organPulse 1.8s ease-in-out infinite;
          filter: drop-shadow(0 0 4px #3b82f6);
        }
        .pulse-dot:nth-child(2) { animation-delay: 0.4s; }
        .pulse-dot:nth-child(3) { animation-delay: 0.8s; }
        @keyframes kidneyPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        .pulse-kidney {
          transform-origin: 100px 100px;
          animation: kidneyPulse 3s ease-in-out infinite;
        }
      `}</style>

      <g filter="url(#kidneyGlow)" className="pulse-kidney">
        {/* Renal artery and vein entering the hilum */}
        <path d="M75,100 L95,103" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
        <path d="M70,110 L94,110" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
        
        {/* Ureter tube going down */}
        <path 
          d="M93,115 C88,125 85,145 80,165" 
          fill="none" 
          stroke="#e2e8f0" 
          strokeWidth="5" 
          strokeLinecap="round" 
        />

        {/* Main Kidney Bean Shape */}
        <path 
          d="M100,50 
             C120,48 145,65 142,105 
             C139,145 118,155 98,153 
             C85,152 82,135 90,123
             C96,114 97,105 92,97
             C85,86 85,52 100,50 Z" 
          fill="url(#kidneyGrad)" 
        />

        {/* Medulla (Inner kidney detail bean) */}
        <path 
          d="M106,65 
             C116,64 130,75 128,103 
             C126,131 114,138 103,137 
             C97,136 94,128 98,120
             C102,112 101,107 98,101
             C93,92 95,66 106,65 Z" 
          fill="url(#medullaGrad)" 
          opacity="0.75"
        />

        {/* Internal renal pyramids detailed lines */}
        <path d="M120,80 L112,83" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M125,95 L115,96" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M123,110 L114,107" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M115,123 L108,118" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* Pulsing Dots */}
      {/* Upper Pole */}
      <circle cx="106" cy="60" r="5" className="pulse-dot" />
      {/* Outer Curve Midpoint */}
      <circle cx="138" cy="100" r="5" className="pulse-dot" />
      {/* Lower Pole */}
      <circle cx="104" cy="144" r="5" className="pulse-dot" />
    </svg>
  );
}
