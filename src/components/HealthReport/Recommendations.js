import React from 'react';

const TYPE_ICONS = {
  diet:       '🥗',
  test:       '🧪',
  medication: '💊',
  lifestyle:  '🏃',
  specialist: '👨‍⚕️',
  other:      '📌',
};

const PRIORITY_STYLES = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export function Recommendations({ recommendations }) {
  if (!recommendations?.length) return null;

  const sorted = [...recommendations].sort((a, b) =>
    (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sorted.map((rec, i) => {
        const ps = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.low;
        const icon = TYPE_ICONS[rec.type] || TYPE_ICONS.other;
        return (
          <div key={i} style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderLeft: `3px solid ${ps.color}`,
            borderRadius: 12,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0 }}>{rec.text}</p>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10,
              background: ps.bg, border: `1px solid ${ps.border}`, color: ps.color,
              textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0, alignSelf: 'flex-start',
            }}>{rec.priority}</span>
          </div>
        );
      })}
    </div>
  );
}
