import React from 'react';
import { ParameterTable } from './ParameterTable';
import { AlertCircle, Activity, Heart, Info, ArrowRight, ShieldAlert } from 'lucide-react';

const cardStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 20,
  padding: '24px 28px',
  marginBottom: 18,
};

const sectionTitleStyle = {
  fontSize: 12,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: 2,
  color: 'rgba(255,255,255,0.35)',
  marginBottom: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const OVERALL_STATUS_MAP = {
  NORMAL:           { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  text: 'Normal', icon: <CheckCircle /> },
  MOSTLY_NORMAL:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', text: 'Mostly Normal', icon: <Info /> },
  ATTENTION_NEEDED: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', text: 'Attention Needed', icon: <Activity /> },
  URGENT:           { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  text: 'Urgent', icon: <AlertCircle /> },
};

function CheckCircle() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

function formatText(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function StringList({ items, icon, color }) {
  if (!items?.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ color, marginTop: 2 }}>{icon}</div>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
            {formatText(item)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function HealthReportResults({ data, onReset }) {
  if (!data) return null;

  const status = OVERALL_STATUS_MAP[data.overallStatus] || OVERALL_STATUS_MAP.ATTENTION_NEEDED;

  return (
    <div style={{ paddingBottom: 40 }}>
      
      {/* ── METADATA & SUMMARY HEADER ── */}
      <div style={{
        ...cardStyle,
        background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(99,102,241,0.05) 100%)',
        border: '1px solid rgba(6,182,212,0.15)',
        display: 'flex', gap: 24, flexWrap: 'wrap',
      }}>
        {/* Status Badge */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: status.bg, border: `1px solid ${status.color}40`,
          borderRadius: 24, padding: '24px', minWidth: 160, gap: 12
        }}>
          <div style={{ color: status.color, transform: 'scale(1.5)' }}>{status.icon}</div>
          <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: status.color, textAlign: 'center' }}>
            {status.text}
          </span>
        </div>

        {/* Info & Summary */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            {data.meta?.reportType && (
              <span style={{ fontSize: 11, fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: 2, background: 'rgba(6,182,212,0.1)', padding: '4px 10px', borderRadius: 12 }}>
                {data.meta.reportType}
              </span>
            )}
            {data.meta?.reportDate && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{data.meta.reportDate}</span>}
          </div>
          
          <div style={{ display: 'flex', gap: 20, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16 }}>
            {data.meta?.patientName && (
              <div>
                <span style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>Patient</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{data.meta.patientName}</span>
                {(data.meta?.patientAge || data.meta?.patientGender) && (
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}> ({data.meta.patientAge} {data.meta.patientGender})</span>
                )}
              </div>
            )}
            {data.meta?.facility && (
              <div>
                <span style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>Facility</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{data.meta.facility}</span>
              </div>
            )}
          </div>
          
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            {formatText(data.summary)}
          </p>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
        <div style={{ flex: 1, ...cardStyle, marginBottom: 0, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13 }}>Abnormal Findings</span>
          <span style={{ color: data.abnormalCount > 0 ? '#f59e0b' : '#22c55e', fontSize: 24, fontWeight: 900 }}>{data.abnormalCount || 0}</span>
        </div>
        <div style={{ flex: 1, ...cardStyle, marginBottom: 0, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13 }}>Critical Findings</span>
          <span style={{ color: data.criticalCount > 0 ? '#ef4444' : '#22c55e', fontSize: 24, fontWeight: 900 }}>{data.criticalCount || 0}</span>
        </div>
      </div>

      {/* ── URGENCY FLAGS ── */}
      {data.urgencyFlags?.length > 0 && (
        <div style={{ ...cardStyle, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div style={{ ...sectionTitleStyle, color: '#ef4444' }}><ShieldAlert size={16} /> Urgent Attention Required</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.urgencyFlags.map((flag, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 12, borderLeft: '3px solid #ef4444' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{flag.parameter}</span>
                  <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>{flag.value}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>{flag.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── KEY INSIGHTS ── */}
      {data.keyInsights?.length > 0 && (
        <div style={cardStyle}>
          <div style={sectionTitleStyle}><Activity size={16} /> Key Insights</div>
          <StringList items={data.keyInsights} icon={<ArrowRight size={18} />} color="#3b82f6" />
        </div>
      )}

      {/* ── DETAILED FINDINGS ── */}
      {data.findings?.length > 0 && (
        <div style={cardStyle}>
          <div style={sectionTitleStyle}><span>🔬</span> Detailed Lab Results</div>
          <ParameterTable findings={data.findings} />
        </div>
      )}

      {/* ── RECOMMENDATIONS & LIFESTYLE ── */}
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 18 }}>
        {data.recommendations?.length > 0 && (
          <div style={{ flex: 1, minWidth: 280, ...cardStyle, marginBottom: 0 }}>
            <div style={sectionTitleStyle}><span>💡</span> Recommendations</div>
            <StringList items={data.recommendations} icon={<CheckCircle />} color="#22c55e" />
          </div>
        )}
        {data.lifestyle?.length > 0 && (
          <div style={{ flex: 1, minWidth: 280, ...cardStyle, marginBottom: 0 }}>
            <div style={sectionTitleStyle}><Heart size={16} /> Lifestyle Tips</div>
            <StringList items={data.lifestyle} icon={<Heart size={16} />} color="#ec4899" />
          </div>
        )}
      </div>

      {/* ── DISCLAIMER ── */}
      {data.disclaimer && (
        <div style={{ padding: '16px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 24 }}>
          ⚠️ <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Disclaimer:</strong> {data.disclaimer}
        </div>
      )}

      {/* ── RESET BUTTON ── */}
      <button
        onClick={onReset}
        style={{
          width: '100%', padding: '16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)',
          fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#fff'; }}
        onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = 'rgba(255,255,255,0.8)'; }}
      >
        Analyze Another Report
      </button>

    </div>
  );
}
