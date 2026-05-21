import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_STYLES = {
  NORMAL:        { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  text: '#22c55e',  label: 'Normal' },
  LOW:           { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6',  label: 'Low' },
  HIGH:          { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b',  label: 'High' },
  CRITICAL_LOW:  { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  text: '#ef4444',  label: 'Critically Low' },
  CRITICAL_HIGH: { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  text: '#ef4444',  label: 'Critically High' },
  ABNORMAL:      { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', text: '#f97316',  label: 'Abnormal' },
};

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

export function ParameterTable({ findings }) {
  const [expandedRows, setExpandedRows] = useState({});

  if (!findings?.length) return null;

  const toggleRow = (idx) => {
    setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Group by section
  const groups = findings.reduce((acc, f) => {
    const sec = f.section || 'General Findings';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(f);
    return acc;
  }, {});

  let globalIndex = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {Object.entries(groups).map(([section, items]) => (
        <div key={section}>
          <h4 style={{
            fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2,
            color: 'rgba(255,255,255,0.4)', marginBottom: 12,
            borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8
          }}>{section}</h4>
          
          <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.1)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'rgba(255,255,255,0.4)' }}>Test Parameter</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'rgba(255,255,255,0.4)' }}>Result</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'rgba(255,255,255,0.4)' }}>Ref. Range</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', color: 'rgba(255,255,255,0.4)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const currentIndex = globalIndex++;
                  const s = STATUS_STYLES[item.status] || STATUS_STYLES.NORMAL;
                  const hasDetails = item.plainExplanation || item.clinicalSignificance;
                  const isExpanded = expandedRows[currentIndex];
                  
                  return (
                    <React.Fragment key={currentIndex}>
                      <tr 
                        onClick={() => hasDetails && toggleRow(currentIndex)}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          cursor: hasDetails ? 'pointer' : 'default',
                          transition: 'background 0.2s',
                          background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                        }}
                        onMouseEnter={e => { if(!isExpanded) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                        onMouseLeave={e => { if(!isExpanded) e.currentTarget.style.background = 'transparent' }}
                      >
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {item.testName}
                            {hasDetails && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.5 }}>
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Info</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: s.text, fontSize: 14 }}>
                          {item.value} {item.unit && <span style={{ fontSize: 11, opacity: 0.6 }}>{item.unit}</span>}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 12 }}>
                          {item.referenceRange}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <span style={{
                            display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                            background: s.bg, border: `1px solid ${s.border}`, color: s.text,
                          }}>{s.label}</span>
                        </td>
                      </tr>
                      {isExpanded && hasDetails && (
                        <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td colSpan={4} style={{ padding: '16px', paddingLeft: '32px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {item.plainExplanation && (
                                <div>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>What it means</span>
                                  <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.5 }}>
                                    {formatText(item.plainExplanation)}
                                  </p>
                                </div>
                              )}
                              {item.clinicalSignificance && (
                                <div>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Clinical Significance</span>
                                  <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.5 }}>
                                    {formatText(item.clinicalSignificance)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
