import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  UploadCloud, 
  Cpu, 
  MessageSquare, 
  FileDown 
} from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      step: "Step 1",
      title: "Register Profile",
      description: "Sign up securely as a patient or medical professional and complete your credentials verification."
    },
    {
      icon: UploadCloud,
      step: "Step 2",
      title: "Upload ECG Reports",
      description: "Drag & drop ECG charts, PDF health records, or medical files directly into the secure portal."
    },
    {
      icon: Cpu,
      step: "Step 3",
      title: "AI Analysis",
      description: "Our machine learning models process the ECG wave contours and calculate cardiovascular scores."
    },
    {
      icon: MessageSquare,
      step: "Step 4",
      title: "Clinical Insights",
      description: "Review automated warnings, clinical summaries, and chat with our medical AI assistant."
    },
    {
      icon: FileDown,
      step: "Step 5",
      title: "Export Report",
      description: "Download certified PDF healthcare reports with annotated charts for physician sharing."
    }
  ];

  return (
    <section id="how-it-works" className="bg-[#000000] py-24 px-6 sm:px-8 lg:px-16 border-t border-zinc-900 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-zinc-900/20 blur-[130px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1.5 bg-white text-black text-[10px] font-black rounded-full uppercase tracking-widest mb-5"
        >
          Workflow
        </motion.div>

        {/* Heading */}
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.35 }}
          className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-5"
        >
          Seamless Health Orchestration
        </motion.h2>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-16 leading-relaxed"
        >
          Analyze vitals, predict health risks, and generate clinical reports in 5 simple steps.
        </motion.p>

        {/* 5-Step Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((item, idx) => {
            const StepIcon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.3, delay: idx * 0.04, ease: "easeOut" }}
                whileHover={{ y: -8, borderColor: 'rgb(82 82 91)' }}
                className="bg-[#121212] border border-zinc-800/80 p-6 rounded-[24px] flex flex-col items-center transition-all duration-300"
              >
                {/* Icon Circle */}
                <div className="w-16 h-16 rounded-[20px] bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center mb-6 shadow-inner">
                  <StepIcon className="w-7 h-7" strokeWidth={1.75} />
                </div>

                {/* Step badge */}
                <span className="px-3 py-1 bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-[10px] font-black rounded-full uppercase tracking-wider mb-4">
                  {item.step}
                </span>

                {/* Title */}
                <h4 className="text-base font-bold text-white mb-2 tracking-tight">
                  {item.title}
                </h4>

                {/* Description */}
                <p className="text-zinc-400 text-xs leading-relaxed text-center">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
