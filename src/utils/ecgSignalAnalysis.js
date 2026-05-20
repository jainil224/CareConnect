/**
 * Parse ECG waveform intervals from the QRS Diagnostic
 * "Measurements" section text block.
 *
 * Expected text format (from PDF):
 *   "... PR: 162 ms  QRS: 88 ms  QT: 380 ms  QTc: 412 ms  P Axis: 62°  QRS Axis: 45° ..."
 *
 * @param {string} text - Raw extracted PDF text containing measurements
 * @returns {{ pr: number|null, qrs: number|null, qt: number|null, qtc: number|null, pAxis: number|null, qrsAxis: number|null }}
 */
export const parseWaveformIntervals = (text) => {
  if (!text || typeof text !== 'string') {
    return { pr: null, qrs: null, qt: null, qtc: null, pAxis: null, qrsAxis: null };
  }

  const extract = (patterns) => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] !== undefined) {
        const val = parseFloat(match[1]);
        return isNaN(val) ? null : val;
      }
    }
    return null;
  };

  const pr = extract([
    /\bPR\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*ms/i,
    /\bPR\s+interval\s*[:\-]?\s*(\d+(?:\.\d+)?)/i,
    /\bP[\-\s]?R\s*[:\-]?\s*(\d+)/i,
  ]);

  const qrs = extract([
    /\bQRS\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*ms/i,
    /\bQRS\s+duration\s*[:\-]?\s*(\d+(?:\.\d+)?)/i,
    /\bQRS\b\s*[:\-]?\s*(\d+)/i,
  ]);

  const qt = extract([
    /\bQT\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*ms/i,
    /\bQT\s+interval\s*[:\-]?\s*(\d+(?:\.\d+)?)/i,
    /(?<![cC])\bQT\b\s*[:\-]?\s*(\d+)/,
  ]);

  const qtc = extract([
    /\bQTc?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*ms/i,
    /\bQTc\s*[:\-]?\s*(\d+(?:\.\d+)?)/i,
    /corrected\s*QT\s*[:\-]?\s*(\d+)/i,
  ]);

  const pAxis = extract([
    /\bP\s*[Aa]xis\s*[:\-]?\s*([+-]?\d+(?:\.\d+)?)/,
    /\bP\s*[Aa]xis\b[^0-9]*([+-]?\d+)/,
  ]);

  const qrsAxis = extract([
    /\bQRS\s*[Aa]xis\s*[:\-]?\s*([+-]?\d+(?:\.\d+)?)/,
    /\bQRS\s*[Aa]xis\b[^0-9]*([+-]?\d+)/,
  ]);

  return { pr, qrs, qt, qtc, pAxis, qrsAxis };
};


/**
 * Classify extracted ECG intervals as normal, borderline, or abnormal.
 * Reference ranges based on AHA/ACC guidelines.
 *
 * @param {{ pr, qrs, qt, qtc, pAxis, qrsAxis }} intervals
 * @param {number} [sex=1] - 1=male, 0=female (affects QTc thresholds)
 * @returns {{ [key]: 'normal'|'borderline'|'abnormal', flags: string[] }}
 */
export const classifyIntervals = (intervals, sex = 1) => {
  const result = {};
  const flags = [];

  // ── PR interval (120–200 ms normal) ───────────────────────────────────
  if (intervals.pr !== null) {
    if (intervals.pr < 120) {
      result.pr = 'abnormal';
      flags.push('Short PR interval — possible pre-excitation (WPW syndrome)');
    } else if (intervals.pr > 200) {
      result.pr = 'abnormal';
      flags.push('Prolonged PR interval — 1st degree AV block');
    } else if (intervals.pr >= 190) {
      result.pr = 'borderline';
    } else {
      result.pr = 'normal';
    }
  }

  // ── QRS duration (70–100 ms normal; >120 ms abnormal) ─────────────────
  if (intervals.qrs !== null) {
    if (intervals.qrs > 120) {
      result.qrs = 'abnormal';
      flags.push('Wide QRS complex — possible bundle branch block or ventricular rhythm');
    } else if (intervals.qrs > 100) {
      result.qrs = 'borderline';
      flags.push('Borderline QRS duration');
    } else {
      result.qrs = 'normal';
    }
  }

  // ── QT interval (approximate; QTc is more clinically reliable) ────────
  if (intervals.qt !== null) {
    if (intervals.qt > 500) {
      result.qt = 'abnormal';
    } else if (intervals.qt > 440) {
      result.qt = 'borderline';
    } else {
      result.qt = 'normal';
    }
  }

  // ── QTc interval (sex-specific AHA thresholds) ─────────────────────────
  if (intervals.qtc !== null) {
    const threshold = sex === 0 ? 470 : 450; // Female: 470ms, Male: 450ms
    if (intervals.qtc > threshold) {
      result.qtc = 'abnormal';
      flags.push(`Prolonged QTc (${intervals.qtc}ms) — increased risk of Torsades de Pointes`);
    } else if (intervals.qtc > threshold - 20) {
      result.qtc = 'borderline';
    } else {
      result.qtc = 'normal';
    }
  }

  // ── QRS Axis (normal: -30° to +90°) ───────────────────────────────────
  if (intervals.qrsAxis !== null) {
    if (intervals.qrsAxis < -30) {
      result.qrsAxis = 'abnormal';
      flags.push('Left axis deviation — possible left anterior fascicular block or inferior MI');
    } else if (intervals.qrsAxis > 90) {
      result.qrsAxis = 'abnormal';
      flags.push('Right axis deviation — possible right heart strain or left posterior fascicular block');
    } else {
      result.qrsAxis = 'normal';
    }
  }

  return { classifications: result, flags };
};


/**
 * Format parsed intervals and their classifications into
 * a human-readable summary string for injection into the AI report.
 *
 * @param {{ pr, qrs, qt, qtc, pAxis, qrsAxis }} intervals
 * @param {{ classifications: object, flags: string[] }} classificationResult
 * @returns {string}
 */
export const formatIntervalsSummary = (intervals, classificationResult) => {
  const parts = [];
  const { classifications, flags } = classificationResult;

  const fmt = (key, label, unit = 'ms') => {
    const val = intervals[key];
    if (val === null || val === undefined) return;
    const status = classifications[key];
    const indicator = status === 'abnormal' ? ' ⚠' : status === 'borderline' ? ' ~' : '';
    parts.push(`${label}: ${val}${unit}${indicator}`);
  };

  fmt('pr', 'PR interval');
  fmt('qrs', 'QRS duration');
  fmt('qt', 'QT interval');
  fmt('qtc', 'QTc interval');
  if (intervals.pAxis !== null) parts.push(`P-wave axis: ${intervals.pAxis}°`);
  if (intervals.qrsAxis !== null) {
    const axisStatus = classifications.qrsAxis;
    const axisNote = axisStatus === 'abnormal' ? ' ⚠' : '';
    parts.push(`QRS axis: ${intervals.qrsAxis}°${axisNote}`);
  }

  let summary = parts.length > 0
    ? `ECG interval measurements: ${parts.join(', ')}.`
    : '';

  if (flags.length > 0) {
    summary += ` Interval analysis flags: ${flags.join('; ')}.`;
  }

  return summary;
};


/**
 * Check whether a set of parsed intervals is meaningfully populated
 * (i.e., at least one key interval was extracted).
 *
 * @param {{ pr, qrs, qt, qtc }} intervals
 * @returns {boolean}
 */
export const hasValidIntervals = (intervals) => {
  return [intervals.pr, intervals.qrs, intervals.qt, intervals.qtc]
    .some(v => v !== null && v !== undefined);
};
