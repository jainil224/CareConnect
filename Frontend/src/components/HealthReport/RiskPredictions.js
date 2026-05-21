import React from 'react';

const LEVEL_STYLES = {
  high:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',  text: '#ef4444', dot: '#ef4444',  label: 'HIGH' },
  medium: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', text: '#f59e0b', dot: '#f59e0b',  label: 'MEDIUM' },
  low:    { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)',   text: '#22c55e', dot: '#22c55e',  label: 'LOW' },
};

// Sort order: high → medium → low
const LEVEL_ORDER = { high: 0, medium: 1, low: 2 };

export function RiskPredictions({ risks }) {
  if (!risks?.length) return null;

  const sorted = [...risks].sort((a, b) =>
    (LEVEL_ORDER[a.level] ?? 3) - (LEVEL_ORDER[b.level] ?? 3)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sorted.map((risk, i) => {
        const s = LEVEL_STYLES[risk.level] || LEVEL_STYLES.low;
        return (
          <div key={i} style={{
            padding: '14px 16px',
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderRadius: 14,
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: s.dot, marginTop: 6, flexShrink: 0,
              boxShadow: `0 0 6px ${s.dot}`,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{risk.title}</span>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10,
                  background: s.bg, border: `1px solid ${s.border}`, color: s.text,
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>{s.label}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>{risk.description}</p>
              {risk.relatedParameter && (
                <span style={{
                  display: 'inline-block', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'monospace',
                }}>↳ {risk.relatedParameter}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
