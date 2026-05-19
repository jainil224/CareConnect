import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function FeatureCard({ icon: Icon, title, description, points = [], isBeige }) {
  // in dark mode, 'isBeige' represents the charcoal `#121212` background card
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      whileHover={{ 
        y: -8,
        scale: 1.01,
        boxShadow: "0 20px 40px -15px rgba(255, 255, 255, 0.03)"
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative p-8 md:p-10 rounded-[32px] transition-all duration-300 border ${
        isBeige 
          ? 'bg-[#121212] border-transparent text-white' 
          : 'bg-[#000000] border-zinc-800 text-white shadow-sm'
      }`}
    >
      {/* Icon Box */}
      <div className={`flex items-center justify-center w-12 h-12 rounded-2xl mb-6 shadow-md ${
        isBeige
          ? 'bg-white text-black'
          : 'bg-zinc-900 text-white border border-zinc-800'
      }`}>
        <Icon className="w-6 h-6 animate-pulse-subtle" strokeWidth={2} />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold tracking-tight mb-3 text-white">
        {title}
      </h3>
      
      <p className="text-zinc-400 text-[15px] leading-relaxed mb-8 max-w-md">
        {description}
      </p>

      {/* Feature Points Checklist */}
      <ul className="space-y-3.5">
        {points.map((point, index) => (
          <li key={index} className="flex items-center space-x-3 text-sm font-medium text-zinc-300">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
              isBeige ? 'bg-zinc-800' : 'bg-zinc-900 border border-zinc-800'
            } text-white`}>
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </div>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
