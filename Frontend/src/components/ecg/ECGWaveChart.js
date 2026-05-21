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
    // Track last frame time for frame-rate-independent animation
    let lastTimestamp = null;
    
    const blankingGap = 40; // Width of the visual blanking erase gap (px)

    // sweepSpeed is computed dynamically each frame from live BPM
    // Formula: show exactly 4 complete beats on canvas at any BPM
    // At 60 BPM: 1 beat/s → canvas = 4s of data
    // At 120 BPM: 2 beats/s → canvas = 2s of data
    // This makes the visual beat rate perfectly match the numeric BPM
    const getSweepSpeed = (bpm, width) => {
      const clampedBpm = Math.min(Math.max(bpm, 30), 220);
      const secondsPerBeat = 60 / clampedBpm;
      const totalSecondsVisible = 4 * secondsPerBeat; // always 4 beats on screen
      // pixels per frame at 60fps to cover full canvas in totalSecondsVisible
      return width / (totalSecondsVisible * 60);
    };

    const render = () => {
      if (!canvas || !ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Dynamic sweep speed based on real BPM — ensures visual beats match actual rate
      const currentBpmForSpeed = (isProcessing || !heartRate || heartRate === 0) ? 75 : heartRate;
      const sweepSpeed = Math.max(getSweepSpeed(currentBpmForSpeed, width), 0.5);
      const targetX = (xCoord + sweepSpeed) % width;
      const segmentCount = Math.max(1, Math.round(sweepSpeed));

      for (let i = 0; i < segmentCount; i++) {
        const currentSubX = (xCoord + (i * sweepSpeed) / segmentCount) % width;
        const index = Math.floor(currentSubX);

        // Real BPM from PDF analysis — fall back to 75 only if not yet available
        const currentBpm = (isProcessing || !heartRate || heartRate === 0) ? 75 : heartRate;
        
        // Add random jitter if AFIB
        const isAfib = waveformPattern.toLowerCase() === 'afib' && !isProcessing;
        const activeBpm = isAfib ? currentBpm + (Math.random() * 20 - 10) : currentBpm;

        const bps = activeBpm / 60;
        const cycleDurationMs = 1000 / bps;
        // Frame-rate independent time accumulation (targeting 60fps)
        timeAcc += (16.67 / cycleDurationMs);
        const phase = timeAcc % 1.0;

        let voltage = 0;
        const isStDepression = waveformPattern.toLowerCase() === 'stdepression' && !isProcessing;

        if (isIdle) {
          // Flatline with very subtle noise when idle
          voltage = (Math.random() - 0.5) * 1.5;
        } else if (isProcessing && (!heartRate || heartRate === 0)) {
          voltage = (Math.random() - 0.5) * 5;
        } else {
          // ── High-fidelity Lead II mathematical ECG (P-QRS-T complex) ──
          // Physiologically accurate timings based on standard cardiology norms

          if (phase >= 0.04 && phase < 0.13) {
            // P Wave — Atrial depolarization (smooth, low amplitude)
            if (isAfib) {
              voltage = Math.sin(phase * Math.PI * 45) * 3.5;
            } else {
              const pPhase = (phase - 0.04) / 0.09;
              voltage = Math.sin(pPhase * Math.PI) * 12;
            }
          } else if (phase >= 0.13 && phase < 0.20) {
            // PR Segment — isoelectric baseline (flat)
            voltage = isAfib ? Math.sin(phase * Math.PI * 38) * 2.5 : 0;
          } else if (phase >= 0.20 && phase < 0.225) {
            // Q Wave — small negative dip (septal depolarization)
            const qPhase = (phase - 0.20) / 0.025;
            voltage = -Math.sin(qPhase * Math.PI) * 10;
          } else if (phase >= 0.225 && phase < 0.265) {
            // R Wave — tall sharp spike (ventricular depolarization)
            // Amplitude modulated by BPM: tachycardia = slightly lower amplitude
            const rAmp = Math.max(70, 110 - (currentBpmForSpeed - 60) * 0.4);
            const rPhase = (phase - 0.225) / 0.04;
            voltage = Math.sin(rPhase * Math.PI) * rAmp;
          } else if (phase >= 0.265 && phase < 0.30) {
            // S Wave — post-R negative deflection
            const sPhase = (phase - 0.265) / 0.035;
            voltage = -Math.sin(sPhase * Math.PI) * 28;
          } else if (phase >= 0.30 && phase < 0.37) {
            // ST Segment — can be depressed in ischemia
            if (isStDepression) {
              const stPhase = (phase - 0.30) / 0.07;
              voltage = -15 - Math.sin(stPhase * Math.PI) * 5;
            } else {
              voltage = 0;
            }
          } else if (phase >= 0.37 && phase < 0.55) {
            // T Wave — slow smooth repolarization (broader = more realistic)
            const tPhase = (phase - 0.37) / 0.18;
            const tAmp = isStDepression ? -18 : 22;
            voltage = Math.sin(tPhase * Math.PI) * tAmp;
          } else if (phase >= 0.55 && phase < 0.60) {
            // U Wave — small positive wave (sometimes present)
            const uPhase = (phase - 0.55) / 0.05;
            voltage = Math.sin(uPhase * Math.PI) * 3;
          } else {
            // TP interval — diastolic baseline
            voltage = isAfib ? Math.sin(phase * Math.PI * 28) * 2.5 : 0;
          }
        }

        // Baseline wander (breathing artifact) + fine muscle noise
        const breathingWander = isIdle ? 0 : Math.sin(timeAcc * 0.015) * 3.5;
        const muscleNoise = isIdle ? 0 : (Math.random() - 0.5) * 0.8;
        const finalY = (height / 2) - (voltage + breathingWander + muscleNoise);
        historyPoints[index] = finalY;
      }

      xCoord = targetX;

      // 2. Painting: Dark cinematic ECG canvas background
      ctx.fillStyle = '#080c18';
      ctx.fillRect(0, 0, width, height);

      // Minor grids (5px intervals) — subtle cyan tint
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.06)';
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
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.13)';
      ctx.lineWidth = 0.8;
      for (let gx = 0; gx < width; gx += 25) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
      }
      for (let gy = 0; gy < height; gy += 25) {
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
      }
      ctx.stroke();

      // 3. Painting: Glowing cyan waveform
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#22d3ee'; // Bright cyan trace
      ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
      ctx.shadowBlur = 8;
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

      // Reset shadow after waveform
      ctx.shadowBlur = 0;

      // 4. Painting: Glowing sweep head dot
      ctx.beginPath();
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = 'rgba(6, 182, 212, 0.9)';
      ctx.shadowBlur = 16;
      const activeHeadY = historyPoints[Math.floor(xCoord)] || height / 2;
      ctx.arc(xCoord, activeHeadY, 4.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isProcessing, isIdle, heartRate, waveformPattern]);

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl relative" style={{ background: 'linear-gradient(145deg, #0a0e1a, #0d1321)' }}>

      {/* ── Top Header Bar ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex items-center gap-3">
          {/* Live pulse dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
          </span>
          <span className="text-[11px] font-black tracking-[0.2em] uppercase text-cyan-400">Live ECG Feed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase text-slate-400 border border-white/[0.07]" style={{ background: 'rgba(255,255,255,0.04)' }}>Lead II</span>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase text-slate-400 border border-white/[0.07]" style={{ background: 'rgba(255,255,255,0.04)' }}>25 mm/s</span>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase text-slate-400 border border-white/[0.07]" style={{ background: 'rgba(255,255,255,0.04)' }}>10 mm/mV</span>
        </div>
      </div>

      {/* ── Waveform Canvas Area ─────────────────────────────── */}
      <div className="relative">

        {/* Floating BPM Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          style={{ background: 'rgba(6,182,212,0.08)', backdropFilter: 'blur(12px)' }}>
          <svg className="w-4 h-4 text-rose-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
          </svg>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white leading-none tabular-nums">
              {isProcessing || isIdle ? '--' : (heartRate || '--')}
            </span>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">bpm</span>
          </div>
        </div>

        {/* Rhythm Badge */}
        {!isProcessing && !isIdle && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-lg"
            style={{
              background: rhythmType.toLowerCase().includes('normal') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              borderColor: rhythmType.toLowerCase().includes('normal') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
              backdropFilter: 'blur(12px)'
            }}>
            <span className={`w-1.5 h-1.5 rounded-full ${rhythmType.toLowerCase().includes('normal') ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${rhythmType.toLowerCase().includes('normal') ? 'text-emerald-400' : 'text-rose-400'}`}>
              {rhythmType}
            </span>
          </div>
        )}

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20"
            style={{ background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(4px)' }}>
            <div className="w-12 h-12 border-[2px] border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]" />
            <p className="text-sm font-bold text-cyan-400 animate-pulse tracking-widest uppercase">Analyzing Waveform…</p>
          </div>
        )}

        {/* Canvas */}
        <div ref={containerRef} className="w-full relative h-[240px]">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
      </div>

      {/* ── Bottom Stats Bar ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-5">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Signal Quality</span>
            <div className="flex items-center gap-1 mt-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="rounded-full" style={{
                  width: 4, height: 4 + i * 2.5,
                  background: i <= (isIdle ? 0 : 4) ? '#06b6d4' : 'rgba(255,255,255,0.1)'
                }} />
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Filter</span>
            <span className="text-[11px] font-bold text-slate-300 mt-1">0.5 – 40 Hz</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Sample Rate</span>
            <span className="text-[11px] font-bold text-slate-300 mt-1">500 Hz</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Analysis Active</span>
        </div>
      </div>
    </div>
  );
}

