import React, { useEffect } from 'react';
import { ShieldAlert, X, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmergencyAlert({ isOpen, onClose }) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-950/80 backdrop-blur-sm"
            onClick={onClose}
          ></motion.div>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-gradient-to-b from-[#1a0505] to-[#2a0808] border border-red-500/50 rounded-2xl w-full max-w-lg shadow-[0_0_100px_rgba(220,38,38,0.4)] overflow-hidden"
          >
            {/* Flashing Background effect */}
            <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-red-400 hover:text-red-200 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 text-center relative z-10">
              <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                <ShieldAlert className="w-10 h-10 text-red-500" />
              </div>

              <h2 className="text-3xl font-bold text-red-500 mb-2">CRITICAL ALERT</h2>
              <p className="text-red-200/80 text-sm uppercase tracking-widest font-semibold mb-6">
                High Risk Heart Condition Detected
              </p>

              <div className="bg-black/40 border border-red-500/20 rounded-xl p-5 mb-8 text-left">
                <p className="text-red-100 text-sm leading-relaxed">
                  The AI has identified patterns consistent with elevated cardiovascular risk. 
                  Immediate clinical evaluation is highly recommended. Do not ignore these symptoms.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-colors">
                  <PhoneCall className="w-5 h-5 mr-2" />
                  Call Emergency (911)
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-200 font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Dismiss Warning
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
