import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Fingerprint } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  // Floating particles generator
  const particles = Array.from({ length: 40 });

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans overflow-hidden relative selection:bg-[#00E5FF]/30">
      
      {/* BACKGROUND EFFECTS */}
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-10 mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      {/* Radial Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#39FF88]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00E5FF]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              scale: Math.random() * 1.5 + 0.5,
            }}
            animate={{
              y: [0, -Math.random() * 100 - 50],
              opacity: [0, Math.random() * 0.5 + 0.2, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Vignette Edge */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none z-10"></div>


      {/* NAVBAR */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <span className="text-xl font-bold tracking-tight">CareConnect</span>
          <motion.div 
            className="w-2.5 h-2.5 bg-[#39FF88] shadow-[0_0_15px_#39FF88]"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </Link>
        
        {/* Menu Links */}
        <div className="flex items-center space-x-6 sm:space-x-8 text-sm font-medium text-gray-300">
          <a href="#" className="hover:text-white transition-colors duration-300">Features</a>
          <a href="#" className="hover:text-white transition-colors duration-300">How It Works</a>
          <Link to="/login" className="hover:text-white transition-colors duration-300">Login</Link>
        </div>
      </nav>

      {/* HERO CONTENT */}
      <main className="relative z-20 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 pb-20">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Huge Typography */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[110px] font-bold leading-[1.05] tracking-tight mb-8">
            <span className="text-gray-500 hover:text-gray-400 transition-colors duration-500">The vision</span> <br />
            <span className="text-gray-500 hover:text-gray-400 transition-colors duration-500">of engineering</span> <br />
            <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 mt-2">
              <span className="text-gray-600">is</span>
              <div className="flex items-center space-x-3 mx-2">
                {/* Glowing Fingerprint */}
                <motion.div 
                  className="relative flex items-center justify-center w-14 h-14 md:w-20 md:h-20"
                  whileHover={{ scale: 1.1 }}
                  animate={{ filter: ["drop-shadow(0 0 10px rgba(57,255,136,0.4))", "drop-shadow(0 0 25px rgba(57,255,136,0.8))", "drop-shadow(0 0 10px rgba(57,255,136,0.4))"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Fingerprint className="w-12 h-12 md:w-16 md:h-16 text-[#39FF88]" strokeWidth={1.5} />
                </motion.div>
                <span className="text-white">human</span>
              </div>
              <span className="text-gray-600 mx-2">+</span>
              <div className="flex items-center space-x-2 mx-2">
                {/* Glowing Star */}
                <motion.div 
                  className="relative flex items-center justify-center w-12 h-12 md:w-16 md:h-16"
                  whileHover={{ rotate: 180, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  animate={{ filter: ["drop-shadow(0 0 10px rgba(0,229,255,0.4))", "drop-shadow(0 0 30px rgba(0,229,255,0.9))", "drop-shadow(0 0 10px rgba(0,229,255,0.4))"] }}
                >
                  <Sparkles className="w-10 h-10 md:w-14 md:h-14 text-[#00E5FF] fill-[#00E5FF]/20" strokeWidth={1.5} />
                </motion.div>
                <span className="text-white">AI</span>
              </div>
            </div>
          </h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            We help you map the talent you need, track the talent you have, and close your gaps to thrive in a GenAI world.
          </motion.p>

          {/* Glowing CTA Button */}
          <motion.button
            onClick={() => navigate('/signup')}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white transition-all duration-200 bg-black border border-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            {/* Animated Glow Wrapper */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#39FF88] opacity-30 group-hover:opacity-60 blur-md transition-opacity duration-500"></div>
            <div className="absolute inset-0 rounded-full bg-black"></div>
            <span className="relative z-10 flex items-center">
              Join The Movement!
            </span>
          </motion.button>
          
        </motion.div>
      </main>

    </div>
  );
}
