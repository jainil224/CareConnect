import React from 'react';
import { motion } from 'framer-motion';
import FeatureGrid from './FeatureGrid';

export default function FeaturesSection() {
  return (
    <section className="bg-white py-24 px-6 sm:px-8 lg:px-16 border-t border-gray-100 relative overflow-hidden">
      {/* Subtle Background Accent Pattern */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-50/30 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#F4F1EA]/40 blur-[130px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-black text-[#0F172A] tracking-tight mb-5"
          >
            Core Features
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[#475569] text-base sm:text-lg md:text-xl font-medium leading-relaxed"
          >
            Advanced AI-powered healthcare tools designed for smart ECG analysis, medical insights, and intelligent health monitoring.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <FeatureGrid />
      </div>
    </section>
  );
}
