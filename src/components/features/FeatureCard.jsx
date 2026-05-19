import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function FeatureCard({ icon: Icon, title, description, points = [], isBeige }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ 
        y: -8,
        scale: 1.01,
        boxShadow: "0 20px 40px -15px rgba(37, 99, 235, 0.08)"
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative p-8 md:p-10 rounded-[32px] transition-all duration-300 border ${
        isBeige 
          ? 'bg-[#F4F1EA] border-transparent text-[#0F172A]' 
          : 'bg-[#FFFFFF] border-[#E2E8F0] shadow-sm text-[#0F172A]'
      }`}
    >
      {/* Icon Box */}
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#2563EB] text-white mb-6 shadow-md shadow-blue-500/10">
        <Icon className="w-6 h-6 animate-pulse-subtle" strokeWidth={2} />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold tracking-tight mb-3 text-[#0F172A]">
        {title}
      </h3>
      
      <p className="text-[#475569] text-[15px] leading-relaxed mb-8 max-w-md">
        {description}
      </p>

      {/* Feature Points Checklist */}
      <ul className="space-y-3.5">
        {points.map((point, index) => (
          <li key={index} className="flex items-center space-x-3 text-sm font-medium text-[#334155]">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full ${isBeige ? 'bg-[#E5E1D5]' : 'bg-[#EFF6FF]'} text-[#2563EB]`}>
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </div>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
