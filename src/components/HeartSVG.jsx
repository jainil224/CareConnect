import React from 'react';

export default function HeartSVG() {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className="w-full h-full max-w-[200px] max-h-[200px] transition-all duration-500"
    >
      <defs>
        {/* Glow Filter */}
        <filter id="heartGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        {/* Gradient */}
        <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>

        <linearGradient id="aortaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#b91c1c" />
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
      `}</style>

      {/* Aorta Arch & Tubes at the top */}
      <g filter="url(#heartGlow)">
        {/* Aorta Arch */}
        <path 
          d="M95,65 L95,45 C95,30 120,30 120,48 L120,68" 
          fill="none" 
          stroke="url(#aortaGrad)" 
          strokeWidth="14" 
          strokeLinecap="round" 
        />
        {/* Branching arteries from Aorta */}
        <path d="M101,36 L101,26" stroke="url(#aortaGrad)" strokeWidth="6" strokeLinecap="round" />
        <path d="M109,34 L109,24" stroke="url(#aortaGrad)" strokeWidth="6" strokeLinecap="round" />
        <path d="M117,37 L117,27" stroke="url(#aortaGrad)" strokeWidth="6" strokeLinecap="round" />

        {/* Pulmonary Artery (crosses behind) */}
        <path 
          d="M80,75 L80,52 C80,45 68,45 68,52" 
          fill="none" 
          stroke="#991b1b" 
          strokeWidth="10" 
          strokeLinecap="round" 
        />
        
        {/* Main Heart Muscle Shape */}
        <path 
          d="M100,75 
             C120,60 145,65 145,95 
             C145,130 115,155 100,170 
             C85,155 55,130 55,95 
             C55,65 80,60 100,75 Z" 
          fill="url(#heartGrad)" 
        />

        {/* Ventricle Divisor / Internal details */}
        <path 
          d="M103,80 C95,110 98,140 100,169" 
          fill="none" 
          stroke="#ef4444" 
          strokeWidth="2" 
          strokeDasharray="4 2"
          opacity="0.6"
        />

        {/* Coronary blood vessel lines */}
        <path 
          d="M115,100 C110,115 118,125 112,140" 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="1.5" 
          opacity="0.7"
        />
        <path 
          d="M85,105 C90,118 85,128 92,142" 
          fill="none" 
          stroke="#ef4444" 
          strokeWidth="1.5" 
          opacity="0.8"
        />
      </g>

      {/* Pulsing Dots (Overlaying anatomical locations) */}
      {/* Left Atrium Top */}
      <circle cx="70" cy="80" r="5" className="pulse-dot" />
      {/* Right Atrium Top */}
      <circle cx="130" cy="85" r="5" className="pulse-dot" />
      {/* Apex Bottom */}
      <circle cx="100" cy="160" r="5" className="pulse-dot" />
    </svg>
  );
}
