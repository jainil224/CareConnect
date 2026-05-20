import axios from 'axios';
import { parseWaveformIntervals, classifyIntervals, formatIntervalsSummary, hasValidIntervals } from '../utils/ecgSignalAnalysis';

// ── Flask server URL (override via env for Docker) ──────────────────────────
const FLASK_URL = process.env.REACT_APP_FLASK_URL || 'http://127.0.0.1:5000';

// ── Health check: detect Flask availability ─────────────────────────────────
/**
 * Ping the Flask /health endpoint.
 * @returns {Promise<'online'|'offline'>}
 */
export const checkFlaskHealth = async () => {
  try {
    await axios.get(`${FLASK_URL}/health`, { timeout: 3000 });
    return 'online';
  } catch {
    return 'offline';
  }
};

// ── PDF.js dynamic loader ───────────────────────────────────────────────────
/**
 * Load PDF.js from CDN if not already present, then extract text from the file.
 * @param {File} file
 * @returns {Promise<{ features: object, waveformIntervals: object|null, warnings: string[], parseSource: string }>}
 */
export const parsePDFFileContent = async (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = async () => {
          window.pdfjsLib = window['pdfjs-dist/build/pdf'];
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          try {
            resolve(await extractPDFText(file));
          } catch (e) {
            reject(e);
          }
        };
        script.onerror = () => reject(new Error('Failed to load PDF.js library from CDN.'));
        document.head.appendChild(script);
      } else {
        resolve(await extractPDFText(file));
      }
    } catch (error) {
      reject(error);
    }
  });
};

// ── Multi-page PDF text extraction ─────────────────────────────────────────
const extractPDFText = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  // Extract text from ALL pages and merge
  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += (pageNum > 1 ? ' ' : '') + pageText;
  }

  console.log(`[ECG Parser] Extracted ${pdf.numPages} page(s) from PDF.`);
  console.log('[ECG Parser] Full text preview:', fullText.substring(0, 400));

  if (!fullText || fullText.trim().length === 0) {
    console.warn('[ECG Parser] PDF contains no selectable text. Returning empty clinical profile.');
    return {
      features: buildEmptyFeatures(),
      waveformIntervals: null,
      warnings: ['PDF contained no extractable text. Please upload a text-based ECG report.'],
      parseSource: 'fallback'
    };
  }

  return parseECGText(fullText);
};

const buildEmptyFeatures = () => ({
  name: '', dob: '', height: '', weight: '',
  age: '', sex: '', cp: '', trestbps: '',
  chol: '', fbs: '', restecg: '', thalach: '',
  exang: '', oldpeak: '', slope: '', ca: '', thal: ''
});

// ── Core ECG text parser ────────────────────────────────────────────────────
const parseECGText = (fullText) => {
  const warnings = [];
  let parseSource = 'generic';

  let name = '', dob = '', height = '', weight = '';
  let age = '', sex = '', cp = '', trestbps = '';
  let chol = '', fbs = '', restecg = '', thalach = '';
  let exang = '', oldpeak = '', slope = '', ca = '', thal = '';
  let waveformIntervals = null;

  // ── QRS Diagnostic specific layout ───────────────────────────────────────
  const isQrsDiagnostic = /Name:\s*ID:\s*Gender:\s*Date of Birth:\s*Height:\s*Weight:/i.test(fullText);

  if (isQrsDiagnostic) {
    parseSource = 'QRSDiagnostic';
    console.log('[ECG Parser] QRS Diagnostic layout detected — using high-fidelity parser.');

    // Patient details block
    const patientDetailsMatch = fullText.match(/Weight:\s*(.*?)(?=\s*(?:Recording Details|Measurements|$))/i);
    if (patientDetailsMatch) {
      const valuesPart = patientDetailsMatch[1].trim();

      // Gender
      const genderMatch = valuesPart.match(/\b(Male|Female)\b/i);
      if (genderMatch) {
        sex = genderMatch[1].toLowerCase() === 'male' ? 1 : 0;
      }

      // DOB
      const dobMatch = valuesPart.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\b/)
        || valuesPart.match(/\b(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/);
      if (dobMatch) dob = dobMatch[1].trim();

      // Age
      const ageMatch = valuesPart.match(/\((\d+)\s*years?\)/i) || valuesPart.match(/\b(\d+)\s*years?\b/i);
      if (ageMatch) age = parseInt(ageMatch[1]);

      // Height
      const ftInMatch = valuesPart.match(/(\d+)\s*ft\s*(\d+)\s*in/i) || valuesPart.match(/(\d+)'\s*(\d+)"/);
      if (ftInMatch) {
        height = Math.round(parseInt(ftInMatch[1]) * 30.48 + parseInt(ftInMatch[2]) * 2.54);
      } else {
        const cmMatch = valuesPart.match(/(\d+)\s*cm/i);
        if (cmMatch) height = parseInt(cmMatch[1]);
      }

      // Weight
      const lbsMatch = valuesPart.match(/(\d+(?:\.\d+)?)\s*lbs?/i);
      if (lbsMatch) {
        weight = Math.round(parseFloat(lbsMatch[1]) * 0.453592);
      } else {
        const kgMatch = valuesPart.match(/(\d+(?:\.\d+)?)\s*kg/i);
        if (kgMatch) weight = Math.round(parseFloat(kgMatch[1]));
      }

      // Name
      if (genderMatch) {
        const preGender = valuesPart.split(genderMatch[0])[0].trim();
        name = preGender.replace(/\s+\d+\s*$/, '').trim();
      }
    }

    // Heart Rate from Measurements section
    const measurementsMatch = fullText.match(/Measurements\s+(.*?)(?=\s*(?:Interpretation|Conclusion|$))/is);
    if (measurementsMatch) {
      const measurementsPart = measurementsMatch[1].trim();

      const hrValMatch = measurementsPart.match(/(\d+)\s*bpm/i);
      if (hrValMatch) thalach = parseInt(hrValMatch[1]);

      // ── Extract waveform intervals (Phase 2 signal processing) ──────
      const intervals = parseWaveformIntervals(measurementsPart);
      if (hasValidIntervals(intervals)) {
        waveformIntervals = intervals;
        const sexVal = sex !== '' ? parseInt(sex) : 1;
        const classified = classifyIntervals(intervals, sexVal);
        waveformIntervals._classifications = classified.classifications;
        waveformIntervals._flags = classified.flags;
        waveformIntervals._summary = formatIntervalsSummary(intervals, classified);
        console.log('[ECG Parser] Waveform intervals extracted:', waveformIntervals);
      }
    }
  } else {
    // ── Standard generic layout parser ───────────────────────────────────
    const namePatterns = [
      /(?:patient\s*name|fullname|client|subject)\s*[:\-\s]\s*([a-zA-Z\s\.\-]+?)(?:\s*(?:age|sex|gender|dob|date|ht|height|wt|weight|bp|blood|resting|hr|heart|thalach|chol|fbs|restecg|exang|oldpeak|slope|ca|thal|id|physician|doctor|ref|clinical|ordered|status|page|mrn|acc)\b|$)/i,
      /(?:patient\s*name|patient|fullname|client|subject)\s*[:\-\s]\s*([a-zA-Z\s\.\-]+)/i,
      /\bname\b\s*[:\-\s]\s*([a-zA-Z\s\.\-]+)/i,
    ];
    for (const pattern of namePatterns) {
      const match = fullText.match(pattern);
      if (match && match[1] && match[1].trim().length > 2 && !/details/i.test(match[1])) {
        name = match[1].trim().replace(/\s+/g, ' ');
        break;
      }
    }

    const dobPatterns = [
      /(?:dob|date\s*of\s*birth|birthdate|birth\s*date|born)\s*[:\-\s]\s*([\d\-\/\.\w,\s]{6,25}?)(?:\s*(?:age|sex|gender|ht|height|wt|weight|bp|blood|resting|hr|heart|thalach|chol|fbs|restecg|exang|oldpeak|slope|ca|thal|id|physician|doctor|mrn)\b|$)/i,
      /(?:dob|date\s*of\s*birth|birthdate|birth\s*date|born)\s*[:\-\s]\s*([\d\-\/\w,\s]{6,25})/i,
      /\b(?:dob|date\s*of\s*birth)\b\s*([\d\-\/]+)/i
    ];
    for (const pattern of dobPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        const cleanDob = match[1].trim();
        if (/\d/.test(cleanDob)) { dob = cleanDob; break; }
      }
    }

    const heightPatterns = [
      /(?:height|ht)\s*[:\-\s]\s*(\d+(?:\.\d+)?)\s*(?:cm|in|inch|inches|m|feet|ft)?/i,
      /(?:height|ht)\s*(\d+(?:\.\d+)?)/i,
    ];
    for (const pattern of heightPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) { height = parseInt(match[1]); break; }
    }

    const weightPatterns = [
      /(?:weight|wt)\s*[:\-\s]\s*(\d+(?:\.\d+)?)\s*(?:kg|lbs|lb|pound|pounds)?/i,
      /(?:weight|wt)\s*(\d+(?:\.\d+)?)/i,
    ];
    for (const pattern of weightPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) { weight = parseInt(match[1]); break; }
    }

    const ageMatch = fullText.match(/(?:age|yrs|years)\s*:?\s*(\d+)/i) || fullText.match(/(\d+)\s*(?:years\s*old|yo)/i);
    if (ageMatch) age = parseInt(ageMatch[1]);

    const sexMatch = fullText.match(/(?:sex|gender)\s*:?\s*(male|female|1|0)/i) || fullText.match(/\b(male|female)\b/i);
    if (sexMatch) {
      const s = sexMatch[1].toLowerCase();
      sex = (s === 'male' || s === '1') ? 1 : 0;
    }

    // Try to extract intervals from generic format too
    const allIntervals = parseWaveformIntervals(fullText);
    if (hasValidIntervals(allIntervals)) {
      waveformIntervals = allIntervals;
      const sexVal = sex !== '' ? parseInt(sex) : 1;
      const classified = classifyIntervals(allIntervals, sexVal);
      waveformIntervals._classifications = classified.classifications;
      waveformIntervals._flags = classified.flags;
      waveformIntervals._summary = formatIntervalsSummary(allIntervals, classified);
    }
  }

  // ── Shared parsers (both QRS and generic) ────────────────────────────────
  const textWithoutDates = fullText.replace(/\d{1,4}[\/\-\.]\d{1,4}[\/\-\.]\d{1,4}/g, '');
  const bpPatterns = [
    /(?:blood\s*pressure|bp|resting\s*bp|trestbps|pressure)\s*[:\-\s]\s*(\d+)\s*\/\s*(\d+)/i,
    /(?:blood\s*pressure|bp|resting\s*bp|trestbps|pressure)\s*[:\-\s]\s*(\d+)/i,
    /(\d{2,3})\s*\/\s*(\d{2,3})/
  ];
  for (const pattern of bpPatterns) {
    const match = textWithoutDates.match(pattern);
    if (match && match[1]) { trestbps = parseInt(match[1]); break; }
  }

  const cholMatch = fullText.match(/(?:cholesterol|chol):\s*(\d+)/i);
  if (cholMatch) chol = parseInt(cholMatch[1]);

  // Heart rate — only override thalach if not already set by QRS Measurements block
  if (!thalach) {
    const hrMatch = fullText.match(/(?:heart rate|max hr|thalach|bpm):\s*(\d+)/i) || fullText.match(/(\d+)\s*bpm/i);
    if (hrMatch) thalach = parseInt(hrMatch[1]);
  }

  const oldpeakMatch = fullText.match(/(?:st depression|oldpeak):\s*([\d.]+)/i) || fullText.match(/st\s*dep[a-z]*\s*([\d.]+)\s*mm/i);
  if (oldpeakMatch) oldpeak = parseFloat(oldpeakMatch[1]);

  const cpMatch = fullText.match(/(?:chest pain|cp|pain type):\s*(\d)/i);
  if (cpMatch) cp = parseInt(cpMatch[1]);

  const fbsMatch = fullText.match(/(?:fasting sugar|fbs):\s*(\d)/i);
  if (fbsMatch) fbs = parseInt(fbsMatch[1]);

  const restecgMatch = fullText.match(/(?:rest ecg|restecg):\s*(\d)/i);
  if (restecgMatch) restecg = parseInt(restecgMatch[1]);

  const exangMatch = fullText.match(/(?:exercise induced angina|exang):\s*(\d)/i);
  if (exangMatch) exang = parseInt(exangMatch[1]);

  const slopeMatch = fullText.match(/(?:slope):\s*(\d)/i);
  if (slopeMatch) slope = parseInt(slopeMatch[1]);

  const caMatch = fullText.match(/(?:ca):\s*(\d)/i);
  if (caMatch) ca = parseInt(caMatch[1]);

  const thalMatch = fullText.match(/(?:thal):\s*(\d)/i);
  if (thalMatch) thal = parseInt(thalMatch[1]);

  // ── Feature validation (physiological range check) ────────────────────
  const featureRanges = {
    age:      { min: 1,  max: 120, label: 'Age' },
    trestbps: { min: 60, max: 250, label: 'Resting BP' },
    chol:     { min: 80, max: 700, label: 'Cholesterol' },
    thalach:  { min: 30, max: 250, label: 'Max Heart Rate' },
  };
  const rawFeatures = { age, trestbps, chol, thalach };
  for (const [key, range] of Object.entries(featureRanges)) {
    const val = parseFloat(rawFeatures[key]);
    if (!isNaN(val) && (val < range.min || val > range.max)) {
      warnings.push(`${range.label} value ${val} is outside expected physiological range (${range.min}–${range.max}).`);
    }
  }

  const features = { name, dob, height, weight, age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal };
  return { features, waveformIntervals, warnings, parseSource };
};


// ── CSV parser ──────────────────────────────────────────────────────────────
export const parseCSVFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = parseCSVText(e.target.result);
      // Wrap in same structure as PDF parser for consistency
      resolve({
        features: result,
        waveformIntervals: null,
        warnings: [],
        parseSource: 'csv'
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};

const parseCSVText = (csvText) => {
  try {
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) return null;

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const values = lines[1].split(',').map(v => v.trim());

    const f = {};
    headers.forEach((h, i) => { f[h] = parseFloat(values[i]); });

    return {
      age:      isNaN(f.age)      ? 0   : f.age,
      sex:      isNaN(f.sex)      ? 0   : f.sex,
      cp:       isNaN(f.cp)       ? 0   : f.cp,
      trestbps: isNaN(f.trestbps) ? 0   : f.trestbps,
      chol:     isNaN(f.chol)     ? 0   : f.chol,
      fbs:      isNaN(f.fbs)      ? 0   : f.fbs,
      restecg:  isNaN(f.restecg)  ? 0   : f.restecg,
      thalach:  isNaN(f.thalach)  ? 0   : f.thalach,
      exang:    isNaN(f.exang)    ? 0   : f.exang,
      oldpeak:  isNaN(f.oldpeak)  ? 0.0 : f.oldpeak,
      slope:    isNaN(f.slope)    ? 0   : f.slope,
      ca:       isNaN(f.ca)       ? 0   : f.ca,
      thal:     isNaN(f.thal)     ? 0   : f.thal
    };
  } catch (err) {
    console.error('[ECG Parser] CSV parsing error:', err);
    return null;
  }
};


// ── Physiological defaults for image drops ──────────────────────────────────
export const generatePhysiologicalDefaults = (file) => {
  const age      = Math.floor(Math.random() * 30) + 40;
  const sex      = Math.random() > 0.5 ? 1 : 0;
  const cp       = Math.floor(Math.random() * 4);
  const trestbps = Math.floor(Math.random() * 40) + 115;
  const chol     = Math.floor(Math.random() * 110) + 170;
  const fbs      = Math.random() > 0.85 ? 1 : 0;
  const restecg  = Math.floor(Math.random() * 3);
  const thalach  = Math.floor(Math.random() * 50) + 110;
  const exang    = Math.random() > 0.7 ? 1 : 0;
  const oldpeak  = +(Math.random() * 2.5).toFixed(1);
  const slope    = Math.floor(Math.random() * 3);
  const ca       = Math.floor(Math.random() * 4);
  const thal     = Math.floor(Math.random() * 3) + 1;

  return {
    features: { age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal },
    waveformIntervals: null,
    warnings: ['Using estimated values — upload a PDF or CSV for precise analysis.'],
    parseSource: 'image-defaults'
  };
};


// ── Local fallback predictor ────────────────────────────────────────────────
const runLocalPredictFallback = (features) => {
  const isHighRisk = features.chol > 240 || features.trestbps > 140 || features.oldpeak > 1.8;
  const prediction = isHighRisk ? 'High Risk of Heart Disease' : 'Normal';

  let prob = 30 + (features.oldpeak * 15) + ((features.chol - 150) / 4);
  prob = Math.min(Math.max(prob, 10), 99.5);

  return {
    prediction,
    risk_probability: `${prob.toFixed(2)}%`,
    isFallback: true
  };
};


// ── Flask ML predictor with fallback ───────────────────────────────────────
export const predictECGLocal = async (features) => {
  // Sanitize: map empty/null/undefined to 0
  const sanitized = {};
  Object.keys(features).forEach(key => {
    const val = features[key];
    sanitized[key] = (val === '' || val === null || val === undefined) ? 0 : parseFloat(val);
  });

  try {
    const response = await axios.post(`${FLASK_URL}/predict`, sanitized, { timeout: 5000 });
    // Server returns prediction, risk_probability, confidence, raw_prediction
    return { ...response.data, isFallback: false };
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      console.warn('[ECG API] Flask request timed out — using local fallback.');
    } else {
      console.warn('[ECG API] Flask server unavailable — using local fallback.', err.message);
    }
    return runLocalPredictFallback(sanitized);
  }
};


// ── Cardiology report generator ─────────────────────────────────────────────
export const generateLocalCardiologyReport = (prediction, features, waveformIntervals = null) => {
  const isHighRisk = prediction.prediction !== 'Normal';
  const prob = prediction.risk_probability;

  let summary = '';
  let recommendations = [];
  let waveformPattern = 'normal';

  if (isHighRisk) {
    summary = `ML model analysis indicates high cardiovascular risk (${prob}). `;

    if (features.chol > 240) {
      summary += `Significant hypercholesterolemia (${features.chol} mg/dl) observed. `;
      recommendations.push('Initiate high-intensity statin therapy as clinically indicated.');
    }
    if (features.trestbps > 140) {
      summary += `Markedly elevated resting blood pressure (${features.trestbps} mmHg) detected. `;
      recommendations.push('Continuous ambulatory BP monitoring and anti-hypertensive evaluation.');
    }
    if (features.oldpeak > 1.0) {
      summary += `ST depression of ${features.oldpeak}mm suggests inducible myocardial ischemia. `;
      waveformPattern = 'stdepression';
      recommendations.push('Immediate referral to a specialist for a comprehensive Stress Echocardiogram.');
    }

    summary += 'Urgent clinical correlation, ECG tracing review, and specialist consultation are advised.';
    recommendations.push('Limit strenuous physical activities and avoid high-sodium diets.');

    if (features.thalach > 120) waveformPattern = 'tachycardia';
  } else {
    summary = `ML model analysis indicates normal cardiac profile and low cardiovascular risk (${prob}). `;
    summary += `Cholesterol (${features.chol} mg/dl) and other essential features reside within safe physiological envelopes.`;

    recommendations.push('Maintain a balanced dietary profile (Mediterranean or DASH diets).');
    recommendations.push('Continue regular moderate aerobic exercise (e.g. 150 minutes per week).');
    recommendations.push('Schedule standard routine cardiometabolic screens annually.');

    waveformPattern = features.thalach < 55 ? 'bradycardia' : 'normal';
  }

  // AFIB simulation: chest pain type 3 + resting ECG type 2
  if (features.cp === 3 && features.restecg === 2) waveformPattern = 'afib';

  // Inject waveform interval summary if available
  if (waveformIntervals && waveformIntervals._summary) {
    summary += ` ${waveformIntervals._summary}`;

    // Escalate recommendation if abnormal intervals detected
    if (waveformIntervals._flags && waveformIntervals._flags.length > 0) {
      recommendations.unshift('Cardiology review recommended based on abnormal ECG interval findings.');
    }
  }

  return { summary, recommendations, waveformPattern };
};


// ── Legacy stubs (kept for any remaining import references) ────────────────
export const predictECG = async () => null;
export const generateECGSummary = async () => '';
