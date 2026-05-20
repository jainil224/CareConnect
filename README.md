# CareConnect — AI-Driven Home Health Orchestrator

An AI-powered health platform featuring real-time ECG analysis, ML-based cardiac risk prediction, drug interaction checking, and emergency alerting.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- (Optional) **Docker Desktop** for containerised deployment

---

### Option 1 · Local Development (Recommended for dev)

**1. Install frontend dependencies**
```bash
npm install
```

**2. Install Flask ML server dependencies**
```bash
pip install -r ML-model/ECG/requirements.txt
```

**3. Start both React frontend and Flask ML server together**
```bash
npm run dev:local
```

This launches:
- React frontend at `http://localhost:3076`
- Flask ML server at `http://localhost:5000`

> **Tip**: You can also start them separately in two terminals:
> ```bash
> npm start          # terminal 1 — React
> npm run flask      # terminal 2 — Flask ML server
> ```

---

### Option 2 · Docker (Production-like)

**Requirements**: Docker Desktop must be installed and running.

```bash
npm run dev:docker
```

Or directly:
```bash
docker-compose up --build
```

This builds and starts:
| Service | URL |
|---------|-----|
| Flask ML server | `http://localhost:5000` |
| React frontend  | `http://localhost:3076` |

---

## 🏗️ Architecture

```
CareConnect/
├── src/
│   ├── pages/
│   │   └── ECGPrediction.js      # Main ECG analysis page
│   ├── components/ecg/
│   │   ├── ECGUploadCard.js      # File upload with progress stages
│   │   ├── ECGResultCard.js      # Risk result + interval metrics
│   │   ├── ECGWaveChart.js       # Animated real-time ECG canvas
│   │   ├── AIAnalysisCard.js     # AI summary + recommendations
│   │   └── HeartAnalytics.js     # Patient vitals display
│   ├── services/
│   │   └── ecgApi.js             # PDF/CSV parsing, Flask API, fallback
│   └── utils/
│       └── ecgSignalAnalysis.js  # ECG interval extraction & classification
│
└── ML-model/ECG/
    ├── app.py                    # Flask prediction server
    ├── heart_model.pkl           # Trained scikit-learn model
    ├── requirements.txt          # Pinned Python dependencies
    └── Dockerfile                # Container definition
```

---

## 🔬 ECG Pipeline

```
PDF/CSV Upload
      │
      ▼
PDF Text Extraction (all pages, pdf.js)
      │
      ▼
Feature Parser (QRS Diagnostic layout or generic)
   + Waveform Interval Extraction (PR, QRS, QT, QTc, Axes)
   + Physiological Range Validation
      │
      ▼
Flask /predict endpoint (scikit-learn model)
   → Falls back to local heuristic if Flask offline
      │
      ▼
Cardiology Report Generator
   (with interval flags injected into summary)
      │
      ▼
UI: Risk card + intervals panel + ECG wave + AI summary
```

---

## 🌐 API Endpoints (Flask)

| Method | Endpoint   | Description |
|--------|------------|-------------|
| GET    | `/health`  | Health check — returns `{"status":"ok"}` |
| POST   | `/predict` | Predicts cardiac risk from 13 clinical features |

**POST `/predict` body (JSON):**
```json
{
  "age": 61, "sex": 1, "cp": 0, "trestbps": 145,
  "chol": 233, "fbs": 1, "restecg": 0, "thalach": 150,
  "exang": 0, "oldpeak": 2.3, "slope": 0, "ca": 0, "thal": 1
}
```

**Response:**
```json
{
  "prediction": "High Risk of Heart Disease",
  "risk_probability": "87.54%",
  "confidence": { "low_risk": 12.46, "high_risk": 87.54 }
}
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_FLASK_URL` | `http://127.0.0.1:5000` | Flask server URL (set automatically in Docker) |
| `FLASK_DEBUG` | `false` | Enable Flask debug mode |
| `FLASK_PORT` | `5000` | Flask server port |

---

## 🩺 Supported ECG Report Formats

| Format | Support | Notes |
|--------|---------|-------|
| QRS Diagnostic PDF | ✅ Full | High-fidelity parser with interval extraction |
| Generic ECG PDF | ✅ Partial | Regex-based feature extraction |
| CSV | ✅ Full | Direct feature mapping |
| PNG / JPG / JPEG | ✅ Estimated | Generates physiological defaults for manual review |

---

## 🔒 Production Hardening Notes

- CORS is enabled on Flask for all origins (`flask-cors`)
- Input validation: all 13 features checked for presence and numeric type before inference
- Structured JSON errors with HTTP status codes (400/500)
- Automatic fallback to local heuristic predictor if Flask is unreachable
- Frontend shows server status badge and offline warning banner
- Docker health check prevents frontend from starting before Flask is ready

---

## ⚠️ Medical Disclaimer

This application is an AI-assisted demonstration tool. Results **must not** be used as a substitute for professional medical diagnosis, advice, or treatment. Always consult a qualified healthcare provider for medical decisions.
