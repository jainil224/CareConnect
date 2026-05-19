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

      // Render a perfectly flat straight line if liveBpm is 0, empty or falsy and not processing
      if ((!liveBpm || liveBpm === 0) && !isProcessing) {
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
      ctx.fillStyle = '#09090b'; // True site black
      ctx.fillRect(0, 0, width, height);

      // Grid line configurations
      ctx.lineWidth = 0.5;
      const gridSpacing = 20;

      // Small vertical & horizontal grid lines (blue-tinted, matching site palette)
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.strokeStyle = (x % (gridSpacing * 5) === 0) ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.05)';
        ctx.lineWidth = (x % (gridSpacing * 5) === 0) ? 1.0 : 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSpacing) {
        ctx.strokeStyle = (y % (gridSpacing * 5) === 0) ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.05)';
        ctx.lineWidth = (y % (gridSpacing * 5) === 0) ? 1.0 : 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 4. Draw Animated blue ECG line with soft glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(96,165,250,0.8)';
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2.0;
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

      // 5. Draw scanning sweep bar
      const grad = ctx.createLinearGradient(scanX - gap, 0, scanX, 0);
      grad.addColorStop(0, 'rgba(59,130,246,0)');
      grad.addColorStop(0.8, 'rgba(59,130,246,0.18)');
      grad.addColorStop(1, 'rgba(96,165,250,0.7)');

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

  const flashColor = flash ? 'text-blue-400 scale-110' : 'text-zinc-700 scale-100';

  return (
    <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">

      {/* Card Header */}
      <div className="px-5 py-4 border-b border-zinc-800/60 bg-zinc-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Live ECG Monitor</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Lead II
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            25 mm/s
          </span>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative" style={{ height: '220px' }}>
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Floating BPM */}
        <div className="absolute top-3 left-4 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800/70">
          <Heart className={`w-4 h-4 transition-all duration-100 ${flashColor}`} fill={flash ? '#60a5fa' : 'none'} />
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-white leading-none">
              {isProcessing ? '--' : (liveBpm || '--')}
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase">BPM</span>
          </div>
        </div>

        {/* Rhythm badge */}
        {!isProcessing && (
          <div className="absolute bottom-3 left-4 z-10 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-zinc-800/70 flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rhythm:</span>
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
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="w-12 h-12 border-[3px] border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium text-blue-400 animate-pulse">Analyzing waveform…</p>
          </div>
        )}
      </div>
    </div>
  );
}
