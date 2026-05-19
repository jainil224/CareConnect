import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import ECGAnimation from './ECGAnimation';

export default function HeroSection() {
  return (
    <div className="relative z-10 w-full h-full flex flex-col justify-center">
      
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <Activity className="text-cyan-400 w-7 h-7 animate-pulse" />
          </div>
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
            CareConnect
          </span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
          AI-Powered <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Healthcare</span> Monitoring
        </h1>
        
        <p className="text-blue-200/70 text-lg leading-relaxed max-w-md mb-10">
          Upload ECG reports, analyze heart risks, monitor patient health, and generate AI-powered medical insights in real time with our premium clinical dashboard.
        </p>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#030b14] bg-blue-${900 - i*100} flex items-center justify-center overflow-hidden`}>
                <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
              </div>
            ))}
          </div>
          <p className="text-sm text-blue-200/60 font-medium">
            Join <span className="text-cyan-400">10,000+</span> healthcare professionals
          </p>
        </div>

        <ECGAnimation />
      </motion.div>
    </div>
  );
}
