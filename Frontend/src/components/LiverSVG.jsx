import React from 'react';

export default function LiverSVG() {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className="w-full h-full max-w-[200px] max-h-[200px] transition-all duration-500"
    >
      <defs>
        {/* Glow Filter */}
        <filter id="liverGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        {/* Gradients */}
        <linearGradient id="liverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>

        <linearGradient id="gallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
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

      <g filter="url(#liverGlow)">
        {/* Gallbladder peeking from underneath */}
        <ellipse 
          cx="122" 
          cy="142" 
          rx="10" 
          ry="15" 
          transform="rotate(-15 122 142)" 
          fill="url(#gallGrad)" 
          stroke="#166534"
          strokeWidth="1.5"
        />
        <path d="M122,127 C122,120 115,115 110,115" fill="none" stroke="#15803d" strokeWidth="2.5" />

        {/* Main Liver Body Shape */}
        <path 
          d="M100,60 
             C125,58 165,70 168,95 
             C170,115 155,135 140,138 
             C128,140 120,132 108,135 
             C95,138 78,137 65,130
             C50,122 35,115 38,105
             C40,95 75,62 100,60 Z" 
          fill="url(#liverGrad)" 
        />

        {/* Falciform Ligament (Vertical lobe divider line) */}
        <path 
          d="M104,61 C102,80 106,105 110,126" 
          fill="none" 
          stroke="#fdba74" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Portal vein details on liver */}
        <path d="M110,110 L115,100" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M115,100 L125,98" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M115,100 L112,90" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* Pulsing Dots */}
      {/* Right Lobe Top */}
      <circle cx="135" cy="85" r="5" className="pulse-dot" />
      {/* Left Lobe Tip */}
      <circle cx="55" cy="112" r="5" className="pulse-dot" />
      {/* Gallbladder Area */}
      <circle cx="122" cy="144" r="5" className="pulse-dot" />
    </svg>
  );
}
