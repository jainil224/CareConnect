import React from 'react';

/** Small animated health score circle with color based on level */
export function HealthScoreCircle({ score, level }) {
  const colorMap = {
    good:    { ring: '#22c55e', bg: 'rgba(34,197,94,0.12)',    text: '#16a34a', label: 'Good' },
    caution: { ring: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   text: '#d97706', label: 'Caution' },
    risk:    { ring: '#ef4444', bg: 'rgba(239,68,68,0.12)',    text: '#dc2626', label: 'Risk' },
  };
  const c = colorMap[level] || colorMap.caution;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={c.ring}
            strokeWidth="12"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${c.ring})`, transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: c.bg, borderRadius: '50%',
        }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: c.text, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: c.text, opacity: 0.8, letterSpacing: 1 }}>/ 100</span>
        </div>
      </div>
      <span style={{
        fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2,
        color: c.text, padding: '3px 12px', borderRadius: 20,
        background: c.bg, border: `1px solid ${c.ring}40`,
      }}>{c.label}</span>
    </div>
  );
}
