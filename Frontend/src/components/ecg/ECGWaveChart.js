import React, { useEffect, useRef } from 'react';

export default function ECGWaveChart({ isProcessing, isIdle, heartRate = 75, rhythmType = "Normal", waveformPattern = "normal" }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-density (Retina) screens with responsive boundaries
    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = 240; // Proportional height (matches reference ratio)
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId;
    let xCoord = 0; // Current write sweep head x-position
    
    // Store rendering history for the continuous display sweep
    const historyPoints = new Array(1200).fill(120);
    
    // Continuous internal cardiac generator cycle phase
    let timeAcc = 0; 
    
    // Configurable constants
    const sweepSpeed = 2.0; // Horizontal pixel step rate per frame
    const blankingGap = 45; // Width of the visual blanking erase gap (px)

    const render = () => {
      if (!canvas || !ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Calculations: Progress Sweep Head & Generate Next Mathematical ECG Voltages
      const targetX = (xCoord + sweepSpeed) % width;
      const segmentCount = Math.round(sweepSpeed);

      for (let i = 0; i < segmentCount; i++) {
        const currentSubX = (xCoord + (i * sweepSpeed) / segmentCount) % width;
        const index = Math.floor(currentSubX);

        // Map BPM to active simulation time
        // If processing or no heart rate, default to 75
        const currentBpm = (isProcessing || !heartRate) ? 75 : heartRate;
        
        // Add random jitter if AFIB
        const isAfib = waveformPattern.toLowerCase() === 'afib' && !isProcessing;
        const activeBpm = isAfib ? currentBpm + (Math.random() * 20 - 10) : currentBpm;

        const bps = activeBpm / 60;
        const cycleDurationMs = 1000 / bps;
        timeAcc += (16.67 / cycleDurationMs); // Normalized delta assuming ~60fps
        const phase = timeAcc % 1.0;

        let voltage = 0; // Microvolts baseline offset
        const isStDepression = waveformPattern.toLowerCase() === 'stdepression' && !isProcessing;

        if (isIdle) {
          voltage = 0;
        } else if (isProcessing && (!heartRate || heartRate === 0)) {
           // Flatline or processing noise
           voltage = (Math.random() - 0.5) * 5;
        } else {
          // High-fidelity standard Lead II mathematical ECG wave model (P, Q, R, S, T)
          if (phase >= 0.05 && phase < 0.15) {
            // P Wave (Atrial Depolarization)
            // If AFIB, no distinct P wave, instead fibrillatory waves
            if (isAfib) {
              voltage = Math.sin(phase * Math.PI * 40) * 4;
            } else {
              const pPhase = (phase - 0.05) / 0.10;
              voltage = Math.sin(pPhase * Math.PI) * 10;
            }
          } else if (phase >= 0.15 && phase < 0.22) {
            // PR Segment (Baseline)
            voltage = isAfib ? Math.sin(phase * Math.PI * 40) * 3 : 0;
          } else if (phase >= 0.22 && phase < 0.24) {
            // Q Wave (Septal Depolarization - Brief Negative Dip)
            const qPhase = (phase - 0.22) / 0.02;
            voltage = -Math.sin(qPhase * Math.PI) * 12;
          } else if (phase >= 0.24 && phase < 0.28) {
            // R Wave (Ventricular Depolarization - Tall Positive Spike)
            const rPhase = (phase - 0.24) / 0.04;
            voltage = Math.sin(rPhase * Math.PI) * 98;
          } else if (phase >= 0.28 && phase < 0.31) {
            // S Wave (Posterobasal Depolarization - Deep Negative Dip)
            const sPhase = (phase - 0.28) / 0.03;
            voltage = -Math.sin(sPhase * Math.PI) * 32;
          } else if (phase >= 0.31 && phase < 0.38) {
            // ST Segment (Baseline or Depressed)
            voltage = isStDepression ? -15 : 0;
          } else if (phase >= 0.38 && phase < 0.53) {
            // T Wave (Ventricular Repolarization - Smooth Broad Wave)
            const tPhase = (phase - 0.38) / 0.15;
            // If ST Depression, T wave might be inverted or flattened, but we'll just keep it or lower it slightly
            voltage = isStDepression ? Math.sin(tPhase * Math.PI) * 10 - 15 : Math.sin(tPhase * Math.PI) * 24;
          } else {
            // TP Interval (Resting Electrical Baseline)
            voltage = isAfib ? Math.sin(phase * Math.PI * 30) * 3 : 0;
          }
        }

        // Add high-frequency muscular micro-vibration & baseline wander for organic realism
        const baselineWander = isIdle ? 0 : Math.sin(timeAcc * 0.02) * 5;
        const finalY = (height / 2) - (voltage + baselineWander);
        historyPoints[index] = finalY;
      }

      xCoord = targetX;

      // 2. Painting: Render Pink Millimetric Clinical ECG Grid
      ctx.fillStyle = '#fff5f5'; // Light clinical pink paper background
      ctx.fillRect(0, 0, width, height);

      // Minor grids (5px intervals)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx < width; gx += 5) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
      }
      for (let gy = 0; gy < height; gy += 5) {
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
      }
      ctx.stroke();

      // Major grids (25px intervals)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.lineWidth = 1.0;
      for (let gx = 0; gx < width; gx += 25) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
      }
      for (let gy = 0; gy < height; gy += 25) {
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
      }
      ctx.stroke();

      // 3. Painting: Render Sweep Waveform (excluding current blanking window)
      ctx.beginPath();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#004ac6'; // Cobalt clinical blue waveform line
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      let isDrawingLine = false;

      for (let px = 0; px < width; px++) {
        // Evaluate if pixel falls inside the moving blanking gap zone
        const inBlankingGap = (px >= xCoord && px < xCoord + blankingGap) ||
          (xCoord + blankingGap > width && (px >= xCoord || px < (xCoord + blankingGap) % width));

        if (inBlankingGap) {
          isDrawingLine = false;
          continue;
        }

        const py = historyPoints[px] !== undefined ? historyPoints[px] : height / 2;

        if (!isDrawingLine) {
          ctx.moveTo(px, py);
          isDrawingLine = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      // 4. Painting: Render Sweep Head Circular Dot
      ctx.beginPath();
      ctx.fillStyle = '#004ac6'; // Match dot color to blue trace line
      const activeHeadY = historyPoints[Math.floor(xCoord)] || height / 2;
      ctx.arc(xCoord, activeHeadY, 5, 0, 2 * Math.PI);
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isProcessing, isIdle, heartRate, waveformPattern]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-1 relative">
      {/* Absolute Overlays for UI */}
      {/* Floating BPM */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80">
        <svg className={`w-4 h-4 transition-all duration-100 text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-white leading-none">
            {isProcessing || isIdle ? '--' : (heartRate || '--')}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">BPM</span>
        </div>
      </div>

      {/* Rhythm badge */}
      {!isProcessing && !isIdle && (
        <div className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/80 flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rhythm:</span>
          <span className={`text-[11px] font-bold uppercase tracking-wide ${
            rhythmType.toLowerCase().includes('normal')
              ? 'text-green-400'
              : 'text-rose-400 animate-pulse'
          }`}>
            {rhythmType}
          </span>
        </div>
      )}

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
          <div className="w-12 h-12 border-[3px] border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-blue-400 animate-pulse">Analyzing waveform…</p>
        </div>
      )}

      {/* Waveform Viewport Port */}
      <div ref={containerRef} className="w-full relative h-[240px] bg-slate-950">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}
