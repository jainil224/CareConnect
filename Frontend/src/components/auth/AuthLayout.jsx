import React from 'react';

export default function AuthLayout({ leftContent, rightContent }) {
  return (
    <div className="min-h-screen bg-[#030b14] flex font-sans overflow-hidden">
      {/* 
        LEFT SIDE (Hero Section) 
        Hidden on mobile/tablet (hidden lg:flex), takes up 50% width on large screens.
      */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden border-r border-blue-500/20">
        
        {/* Background Gradients & Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Mesh Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>

        <div className="relative z-10 w-full max-w-lg">
          {leftContent}
        </div>
      </div>

      {/* 
        RIGHT SIDE (Form Section) 
        Takes full width on mobile/tablet, 50% width on large screens.
      */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        
        {/* Subtle background glow for mobile (since left side is hidden) */}
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none lg:hidden"></div>
        
        <div className="w-full max-w-md relative z-10">
          {rightContent}
        </div>
      </div>
    </div>
  );
}
