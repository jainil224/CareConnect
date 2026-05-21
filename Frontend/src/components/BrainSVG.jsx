import React from 'react';

export default function BrainSVG() {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className="w-full h-full max-w-[200px] max-h-[200px] transition-all duration-500"
    >
      <defs>
        {/* Glow Filter */}
        <filter id="brainGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        {/* Gradients */}
        <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
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
        @keyframes brainPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .pulse-brain {
          transform-origin: 100px 100px;
          animation: brainPulse 4s ease-in-out infinite;
        }
      `}</style>

      <g filter="url(#brainGlow)" className="pulse-brain">
        {/* Brainstem at the bottom center */}
        <path 
          d="M92,142 L92,168 C92,172 108,172 108,168 L108,142 Z" 
          fill="url(#stemGrad)" 
          stroke="#334155"
          strokeWidth="1.5"
        />
        {/* Cerebellum bumps behind */}
        <ellipse cx="80" cy="140" rx="18" ry="12" fill="#475569" />
        <ellipse cx="120" cy="140" rx="18" ry="12" fill="#475569" />
        <line x1="80" y1="140" x2="92" y2="142" stroke="#334155" strokeWidth="1" />
        <line x1="120" y1="140" x2="108" y2="142" stroke="#334155" strokeWidth="1" />

        {/* Main Brain Hemispheres Shape */}
        <path 
          d="M100,50 
             C70,45 50,60 50,95 
             C50,118 62,135 80,140 
             C88,142 98,144 100,142 
             C102,144 112,142 120,140 
             C138,135 150,118 150,95 
             C150,60 130,45 100,50 Z" 
          fill="url(#brainGrad)" 
        />

        {/* Midline Fissure */}
        <path 
          d="M100,50 C99,80 101,110 100,142" 
          fill="none" 
          stroke="#334155" 
          strokeWidth="2.5" 
          opacity="0.8"
        />

        {/* Gyri Folds (Left Hemisphere) */}
        <path d="M75,60 C65,70 70,80 60,90" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <path d="M60,95 C75,98 80,85 90,95" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <path d="M58,110 C68,125 78,115 82,130" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <path d="M88,68 C78,75 88,88 78,102" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" opacity="0.4" />

        {/* Gyri Folds (Right Hemisphere) */}
        <path d="M125,60 C135,70 130,80 140,90" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <path d="M140,95 C125,98 120,85 110,95" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <path d="M142,110 C132,125 122,115 118,130" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <path d="M112,68 C122,75 112,88 122,102" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      </g>

      {/* Pulsing Dots */}
      {/* Left Hemisphere Crown */}
      <circle cx="75" cy="72" r="5" className="pulse-dot" />
      {/* Right Hemisphere Crown */}
      <circle cx="125" cy="72" r="5" className="pulse-dot" />
      {/* Brainstem Base */}
      <circle cx="100" cy="162" r="5" className="pulse-dot" />
    </svg>
  );
}
