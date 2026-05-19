import React, { useEffect, useState } from 'react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export default function ECGWaveChart({ isProcessing }) {
  const [data, setData] = useState([]);

  // Generate basic ECG-like waveform data
  useEffect(() => {
    let baseValue = 50;
    const generatePoint = (index) => {
      // PQRST wave approximation
      const mod = index % 100;
      if (mod === 10) return 60; // P wave
      if (mod === 15) return 40; // Q wave
      if (mod === 20) return 120; // R wave
      if (mod === 25) return 20; // S wave
      if (mod === 40) return 65; // T wave
      
      // Add slight noise
      return baseValue + (Math.random() * 4 - 2);
    };

    const initialData = Array.from({ length: 200 }, (_, i) => ({
      time: i,
      value: generatePoint(i)
    }));
    setData(initialData);

    let counter = 200;
    const interval = setInterval(() => {
      if (isProcessing) return; // Stop scrolling if processing new one

      setData(prevData => {
        const newData = [...prevData.slice(1)];
        newData.push({
          time: counter,
          value: generatePoint(counter)
        });
        counter++;
        return newData;
      });
    }, 30); // smooth fast scrolling

    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-xl w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="text-cyan-400 w-5 h-5 animate-pulse" />
          <h3 className="text-lg font-semibold text-blue-100">Live ECG Monitor</h3>
        </div>
        <div className="flex space-x-3">
          <span className="flex items-center text-xs text-blue-200/50">
            <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2 animate-pulse"></span>
            Lead II
          </span>
          <span className="flex items-center text-xs text-blue-200/50">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            25mm/s
          </span>
        </div>
      </div>

      <div className="h-64 w-full relative bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800/40">
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(14, 165, 233, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(14, 165, 233, 0.3) 1px, transparent 1px),
              linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
            backgroundPosition: '-1px -1px, -1px -1px, -1px -1px, -1px -1px'
          }}
        ></div>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 10 }}>
            <YAxis domain={[0, 150]} hide />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#22d3ee" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              style={{ filter: 'drop-shadow(0 0 5px rgba(34,211,238,0.6))' }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {isProcessing && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-cyan-400 font-medium">Extracting Waveform Data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
