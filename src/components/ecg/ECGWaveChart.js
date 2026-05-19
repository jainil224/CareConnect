import React, { useEffect, useRef, useState } from 'react';
import { Activity, Heart } from 'lucide-react';

export default function ECGWaveChart({ isProcessing, heartRate = 0, rhythmType = "Normal", waveformPattern = "normal" }) {
  const canvasRef = useRef(null);
  const [liveBpm, setLiveBpm] = useState(heartRate);
  const [flash, setFlash] = useState(false);

  // Sync state heart rate changes
  useEffect(() => {
    setLiveBpm(heartRate);
  }, [heartRate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Auto scale to match high-DPI displays
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const ctx = canvas.getContext('2d');
    let animationId;
    
    // Waveform parameters
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    const baseline = height / 2;
    
    // Keep a buffer of Y coordinates
    const bufferSize = Math.floor(width);
    const dataBuffer = new Array(bufferSize).fill(baseline);
    
    let scanX = 0;
    const scanSpeed = 3.5; // pixels per frame

    // PQRST waveforms templates (normalized 0 to 1, where 0.5 is baseline)
    const normalPQRST = [
      0.5, 0.5, 0.51, 0.52, 0.51, 0.5,       // P wave
      0.5, 0.49, 0.48, 0.5,                   // PR segment
      0.44, 0.2, 0.85, 0.5, 0.35, 0.5,        // QRS spike
      0.5, 0.51, 0.53, 0.51, 0.5,             // ST + T wave
      0.5, 0.5, 0.5, 0.5, 0.5                 // Baseline
    ];

    const stDepPQRST = [
      0.5, 0.5, 0.51, 0.52, 0.51, 0.5,
      0.5, 0.49, 0.48, 0.5,
      0.44, 0.2, 0.85, 0.5, 0.35, 0.5,
      0.62, 0.62, 0.58, 0.54, 0.5,            // ST Segment depressed below baseline (0.5)
      0.5, 0.5, 0.5, 0.5, 0.5
    ];

    let currentWaveIndex = 0;
    let waveInProgress = false;
    let msSinceLastBeat = 0;
    let lastTime = performance.now();

    // Sound/visual beat trigger
    const triggerBeatFlash = () => {
      setFlash(true);
      setTimeout(() => setFlash(false), 120);
    };

    // Core Animation loop
    const animate = (timestamp) => {
      const elapsed = timestamp - lastTime;
      lastTime = timestamp;

      // Render a perfectly flat straight line if liveBpm is 0 and not processing
      if (liveBpm === 0 && !isProcessing) {
        const steps = Math.ceil(scanSpeed);
        for (let i = 0; i < steps; i++) {
          const targetIdx = Math.floor(scanX);
          if (targetIdx < bufferSize) {
            dataBuffer[targetIdx] = baseline;
          }
          scanX += 1;
          if (scanX >= bufferSize) {
            scanX = 0;
          }
        }
      } else {
        const currentBpm = isProcessing ? 75 : liveBpm;
        const beatIntervalMs = 60000 / currentBpm;
        msSinceLastBeat += elapsed;

        // Rhythm conditions & irregularities
        const pattern = isProcessing ? "normal" : waveformPattern.toLowerCase();
        let isBeatDue = msSinceLastBeat >= beatIntervalMs;

        // Introduce slight spacing irregularity if AFIB is active
        if (pattern === 'afib') {
          const jitter = (Math.random() - 0.5) * (beatIntervalMs * 0.4);
          isBeatDue = msSinceLastBeat >= (beatIntervalMs + jitter);
        }

        if (isBeatDue && !waveInProgress) {
          waveInProgress = true;
          currentWaveIndex = 0;
          msSinceLastBeat = 0;
          triggerBeatFlash();
        }

        // Generate coordinates
        const steps = Math.ceil(scanSpeed);
        for (let i = 0; i < steps; i++) {
          const targetIdx = Math.floor(scanX);
          if (targetIdx >= bufferSize) continue;

          let targetY = baseline;

          if (waveInProgress) {
            let template = normalPQRST;
            if (pattern === 'stdepression') {
              template = stDepPQRST;
            } else if (pattern === 'afib') {
              template = [
                0.5, 0.49, 0.52, 0.47, 0.53, 0.48, 0.51, 0.49,
                0.44, 0.25, 0.8, 0.5, 0.38, 0.52, 0.48, 0.53,
                0.49, 0.51, 0.47, 0.52, 0.5, 0.49, 0.51
              ];
            }

            if (currentWaveIndex < template.length) {
              const rawVal = template[currentWaveIndex];
              const noise = (Math.random() - 0.5) * 0.015;
              targetY = baseline + ((rawVal - 0.5) * (height * 0.7)) + (noise * height);
              currentWaveIndex++;
            } else {
              waveInProgress = false;
            }
          } else {
            const noise = (Math.random() - 0.5) * 0.012;
            targetY = baseline + (noise * height);
          }

          dataBuffer[targetIdx] = targetY;

          scanX += 1;
          if (scanX >= bufferSize) {
            scanX = 0;
          }
        }
      }

      // 3. Draw standard Clinical ECG Grid Background
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#050d1a'; // Deep navy black primary
      ctx.fillRect(0, 0, width, height);

      // Grid line configurations
      ctx.lineWidth = 0.5;
      const gridSpacing = 20;

      // Small vertical & horizontal grid lines
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.strokeStyle = (x % (gridSpacing * 5) === 0) ? 'rgba(0, 229, 255, 0.15)' : 'rgba(0, 229, 255, 0.04)';
        ctx.lineWidth = (x % (gridSpacing * 5) === 0) ? 1.0 : 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSpacing) {
        ctx.strokeStyle = (y % (gridSpacing * 5) === 0) ? 'rgba(0, 229, 255, 0.15)' : 'rgba(0, 229, 255, 0.04)';
        ctx.lineWidth = (y % (gridSpacing * 5) === 0) ? 1.0 : 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 4. Draw Animated Neon ECG line with high-intensity glow
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00e5ff';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // We draw in two separate paths split at the scanX to prevent joining at wrapping edge
      const drawRange = (start, end) => {
        if (start >= end) return;
        ctx.beginPath();
        ctx.moveTo(start, dataBuffer[start]);
        for (let x = start + 1; x < end; x++) {
          ctx.lineTo(x, dataBuffer[x]);
        }
        ctx.stroke();
      };

      const gap = 12; // visual gap right in front of scan sweep bar
      const firstSectionEnd = Math.max(0, Math.floor(scanX) - gap);
      const secondSectionStart = Math.min(bufferSize, Math.floor(scanX) + 1);

      drawRange(0, firstSectionEnd);
      drawRange(secondSectionStart, bufferSize);

      // Reset shadows for scan line sweeps
      ctx.shadowBlur = 0;

      // 5. Draw bright neon scanning line
      const grad = ctx.createLinearGradient(scanX - gap, 0, scanX, 0);
      grad.addColorStop(0, 'rgba(0, 229, 255, 0)');
      grad.addColorStop(0.8, 'rgba(0, 229, 255, 0.25)');
      grad.addColorStop(1, '#00e5ff');

      ctx.fillStyle = grad;
      ctx.fillRect(Math.max(0, scanX - gap), 0, Math.min(gap, scanX), height);

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [liveBpm, isProcessing, waveformPattern]);

  // Determine rhythm colors
  const flashColor = flash ? 'text-[#00e5ff] scale-110' : 'text-zinc-600 scale-100';

  return (
    <div className="bg-[#0c0c0e]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-xl w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="text-cyan-400 w-5 h-5 animate-pulse" />
          <h3 className="text-lg font-semibold text-blue-100">Live ECG Monitor</h3>
        </div>
        <div className="flex space-x-4">
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

      <div className="h-64 w-full relative rounded-xl overflow-hidden border border-zinc-800/60 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
        {/* HTML5 ECG Drawing Canvas */}
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block"
        />

        {/* Live Floating BPM display */}
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-zinc-800/60 transition-all duration-300">
          <Heart className={`w-5 h-5 transition-all duration-100 ${flashColor}`} fill={flash ? '#00e5ff' : 'none'} />
          <div>
            <span className="text-2xl font-black text-white tracking-tight leading-none">
              {isProcessing ? '--' : liveBpm}
            </span>
            <span className="text-[10px] font-bold text-zinc-500 ml-1 uppercase">BPM</span>
          </div>
        </div>

        {/* Live Condition badge */}
        {!isProcessing && (
          <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-lg border border-zinc-800/60">
            <span className="text-xs text-zinc-400 font-medium mr-2">RHYTHM:</span>
            <span className={`text-xs font-bold uppercase ${
              rhythmType.toLowerCase().includes('normal') ? 'text-green-400' : 'text-rose-400 animate-pulse'
            }`}>
              {rhythmType}
            </span>
          </div>
        )}
        
        {isProcessing && (
          <div className="absolute inset-0 bg-[#050d1a]/85 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in">
            <div className="w-14 h-14 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(34,211,238,0.2)]"></div>
            <p className="text-cyan-400 font-medium tracking-wide animate-pulse">Extracting Waveform Data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
