<div align="center">

# 🏥 CareConnect
### AI-Driven Home Health Orchestrator

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.3-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.x-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![Mistral AI](https://img.shields.io/badge/Mistral_AI-Powered-FF7000?style=for-the-badge)](https://mistral.ai/)

> **CareConnect** is a full-stack, AI-powered personal health management platform that combines ECG analysis, medical report scanning, dynamic health data visualization, real-time health monitoring, AI-driven chat assistance, drug interaction checking, and a hospital locator — all in one beautifully designed dashboard.

</div>

-----

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo & Ports](#-live-demo--ports)
- [Feature Highlights](#-feature-highlights)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Directory Structure](#-directory-structure)
- [Pages & Routes](#-pages--routes)
- [ECG Intelligence Module](#-ecg-intelligence-module)
- [Health Data Visualization](#-health-data-visualization)
- [ML Model (Flask Backend)](#-ml-model-flask-backend)
- [AI Integrations](#-ai-integrations)
- [Firebase Integration](#-firebase-integration)
- [State Management & Contexts](#-state-management--contexts)
- [Environment Variables](#-environment-variables)
- [Running the App Locally](#-running-the-app-locally)
- [Running with Docker](#-running-with-docker)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Overview

CareConnect gives individuals complete control over their health from home. It combines:

- **Machine learning** for cardiovascular risk prediction directly from ECG data
- **PDF/OCR-powered report scanning** to extract patient data from uploaded reports
- **Dynamic health data visualization** — charts auto-update based on uploaded PDF reports
- **Real-time ECG waveform** with BPM-accurate sweep animation
- **Mistral AI language model** for natural-language health consultations
- **Google Maps integration** to find nearby hospitals and clinics
- **Firebase Authentication** for secure user management
- **Comprehensive health dashboards** with animated organs, charts, and analytics

---

## 🚀 Live Demo & Ports

| Service | URL | Description |
|---------|-----|-------------|
| React Frontend | `http://localhost:3076` | Main web application |
| Flask ML Backend | `http://localhost:5000` | ECG prediction API |
| Flask Health Check | `http://localhost:5000/health` | Server status |

---

## ✨ Feature Highlights

### 🫀 ECG Intelligence (AI Cardiac Analysis)
- Upload ECG reports in **PDF, CSV, or image** format
- **PDF text extraction** via PDF.js (in-browser, no server required)
- 13-parameter cardiovascular risk assessment via scikit-learn ML model
- **Live animated ECG waveform** with BPM-accurate sweep speed — the waveform animation exactly matches the real heart rate from the report
- **Cardiovascular Risk Factors** panel — automatically extracts Cholesterol, Blood Pressure, Fasting Blood Sugar, and Max Heart Rate from uploaded PDF
- AI-generated medical summary and treatment recommendations
- Downloadable PDF diagnostic report
- Emergency alert system for high-risk predictions
- **Smart Refresh** — clicking the refresh button re-analyzes the same uploaded PDF without losing the file

### 📊 Health Data Visualization
- **Fully dynamic charts** — graphs auto-update based on uploaded PDF reports from the Health Report Analysis section
- Auto-generates chart tabs for every numeric test found in the PDF (Hemoglobin, Vitamin D, TSH, Glucose, etc.)
- Multiple chart types: Line, Bar, Area charts with smooth animations
- Status badges (Normal/High/Low) with reference range overlays
- Empty state when no report is uploaded; fully populated after analysis

### 📤 Health Report Analysis (Medical Report Upload)
- Drag-and-drop file upload for any medical report (PDF, PNG, JPG, JPEG, WEBP)
- **Tesseract.js OCR** extracts text from images in-browser
- **Mistral AI** parses and structures the report into:
  - Key Findings
  - Risk Factors
  - Normal Values
  - Critical Values requiring urgent attention
  - Recommendations
  - Doctor and facility name detection
- Analyzed data feeds directly into the Health Data Visualization charts

### 💬 AI Health Assistant
- Full-page conversational AI interface
- Powered by **Mistral AI (mistral-medium)**
- Quick-action symptom chips (Fever, Headache, Chest Pain, Cough, etc.)
- Emergency escalation prompts for severe symptoms
- New Chat / conversation reset
- Persistent chat history via React Context

### 🤖 MedBot Floating Widget
- Persistent AI chatbot available on **every page**
- 3D doctor robot SVG with realistic breathing and head-nod animations
- Full Mistral AI integration
- Quick action chips for instant health queries
- Animated typing indicator

### 🏥 Find Facilities
- Google Maps-powered hospital and clinic locator
- Dark-themed map interface
- Search by location or detect current position
- Filter by facility type

### 💊 Drug Interaction Checker
- Enter multiple medications to check for interactions
- AI-powered analysis of potential drug conflicts
- Severity classification and recommendations

### 🚨 Emergency Alert System
- Full-screen emergency modal for critical health readings
- One-click facility search escalation
- Integrated in both Dashboard and ECG pages

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | UI framework |
| React Router DOM | 6.8.0 | Client-side routing |
| TailwindCSS | 3.2.0 | Utility-first styling |
| Framer Motion | 12.x | Advanced animations |
| Recharts | 2.15.4 | Dynamic health data charts |
| Lucide React | 0.263.0 | Icon library |
| React Hot Toast | 2.6.0 | Toast notifications |
| Tesseract.js | 4.0.0 | OCR for report image scanning |
| PDF.js (CDN) | 3.11.174 | PDF text extraction (in-browser) |
| html2pdf.js | 0.14.0 | PDF report generation |
| Axios | 1.3.0 | HTTP client |

### Backend / ML
| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11 | ML runtime |
| Flask | 3.0.3 | REST API server |
| Flask-CORS | 4.0.1 | Cross-origin requests |
| scikit-learn | 1.5.0 | ML model (trained classifier) |
| joblib | 1.4.2 | Model serialization |
| NumPy | 1.26.4 | Numerical computation |
| Pandas | 2.2.2 | Feature DataFrame construction |

### External Services
| Service | Purpose |
|---------|---------|
| **Mistral AI** (mistral-medium) | AI Health Assistant + Report Analysis + MedBot |
| **Firebase Auth** | User authentication |
| **Firebase Firestore** | User data persistence |
| **Google Maps JavaScript API** | Hospital / facility locator |

### DevOps
| Tool | Purpose |
|------|---------|
| Docker | Containerized deployment |
| docker-compose | Multi-service orchestration |

---

## 🏗 Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│  React SPA  (port 3076)                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │  Dashboard   │  │ ECG Intel.   │  │ Report Upload │ │
│  │  AI Chat     │  │ Health Viz   │  │ Drug Checker  │ │
│  │  Facilities  │  │ MedBot Chat  │  │ Appointments  │ │
│  └──────────────┘  └──────────────┘  └───────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP REST
                       ▼
┌──────────────────────────┐    ┌──────────────────────┐
│  Flask ML Server (5000)  │    │   Mistral AI API     │
│  POST /predict           │    │   mistral-medium     │
│  GET  /health            │    │   AI responses       │
│  heart_model.pkl         │    └──────────────────────┘
│  scikit-learn classifier │
└──────────────────────────┘
              │
┌──────────────────────────┐    ┌──────────────────────┐
│  Firebase Auth           │    │  Google Maps API     │
│  User login / signup     │    │  Facility Search     │
│  Firestore data store    │    └──────────────────────┘
└──────────────────────────┘
```

---

## 📁 Directory Structure

```
CareConnect/
│
├── 📄 README.md                   # This file
├── 📄 package.json                # Root-level helper scripts
├── 📄 docker-compose.yml          # Docker multi-service config
├── 📄 .env                        # Environment variables (API keys)
├── 📄 .gitignore
│
├── 📂 Frontend/                   # ── React Web Application ──
│   ├── 📄 package.json            # Node dependencies & npm scripts
│   ├── 📄 tailwind.config.js      # TailwindCSS configuration
│   ├── 📄 postcss.config.js       # PostCSS plugins
│   │
│   ├── 📂 public/                 # Static assets (favicon, index.html)
│   │
│   └── 📂 src/
│       ├── 📄 App.js              # Root component, router, global providers
│       ├── 📄 index.js            # React entry point
│       ├── 📄 index.css           # Global styles & custom animations
│       ├── 📄 config.js           # App configuration constants
│       │
│       ├── 📂 pages/
│       │   ├── 📄 LandingPage.js      # Public marketing/home page
│       │   ├── 📄 Login.js            # Firebase email/password login
│       │   ├── 📄 Signup.js           # User registration
│       │   └── 📄 ECGPrediction.js    # ECG Intelligence full-page module
│       │
│       ├── 📂 components/
│       │   ├── 📄 Header.js                      # Navigation bar with theme toggle
│       │   ├── 📄 Dashboard.js                   # Main health overview dashboard
│       │   ├── 📄 AIAssistant.js                 # Full-page AI chat interface
│       │   ├── 📄 ReportUpload.js                # Medical report OCR uploader
│       │   ├── 📄 HealthDataVisualization.js     # Dynamic PDF-driven health charts
│       │   ├── 📄 FacilitySearchDark.js          # Google Maps hospital locator
│       │   ├── 📄 DrugInteractionChecker.js      # Drug interaction AI tool
│       │   ├── 📄 AppointmentConfirmation.js     # Appointment booking UI
│       │   ├── 📄 EmergencyAlert.js              # Emergency modal (dashboard)
│       │   ├── 📄 EmergencyButton.js             # Floating emergency button
│       │   ├── 📄 BrainSVG.jsx                   # Animated 3D brain SVG
│       │   ├── 📄 HeartSVG.jsx                   # Animated 3D heart SVG
│       │   ├── 📄 KidneySVG.jsx                  # Animated 3D kidney SVG
│       │   ├── 📄 LiverSVG.jsx                   # Animated 3D liver SVG
│       │   │
│       │   ├── 📂 ecg/                           # ECG Intelligence sub-components
│       │   │   ├── 📄 ECGUploadCard.js           # Drag-drop upload with stage progress
│       │   │   ├── 📄 ECGWaveChart.js            # Live BPM-accurate ECG canvas animation
│       │   │   ├── 📄 ECGResultCard.js           # Risk score & prediction display
│       │   │   ├── 📄 ECGReportTemplate.js       # Printable PDF diagnostic report
│       │   │   ├── 📄 AIAnalysisCard.js          # AI summary & recommendations
│       │   │   ├── 📄 HeartAnalytics.js          # Patient vitals analytics panel
│       │   │   ├── 📄 EmergencyAlert.js          # ECG-specific emergency modal
│       │   │   └── 📄 MedBotChatWidget.js        # Floating MedBot AI chatbot
│       │   │
│       │   ├── 📂 HealthReport/                  # Health report sub-components
│       │   ├── 📂 auth/                          # Auth-related UI components
│       │   └── 📂 features/                      # Feature-specific UI components
│       │
│       ├── 📂 context/
│       │   ├── 📄 AuthContext.js        # Firebase auth state (login/logout)
│       │   ├── 📄 HealthContext.js      # Global health data, reports, chat history
│       │   └── 📄 ThemeContext.js       # Dark/light mode toggle
│       │
│       ├── 📂 routes/
│       │   └── 📄 ProtectedRoute.js    # Auth guard for protected pages
│       │
│       ├── 📂 utils/
│       │   ├── 📄 mistralAPI.js         # Mistral AI API client functions
│       │   ├── 📄 ecgSignalAnalysis.js  # ECG waveform interval parser & classifier
│       │   ├── 📄 ReportTypeDetector.js # Auto-detect report type from text
│       │   └── 📄 fileToBase64.js       # File → Base64 utility
│       │
│       ├── 📂 services/
│       │   ├── 📄 ecgApi.js             # PDF parser, Flask ML client, report generator
│       │   ├── 📄 api.js                # General API client
│       │   └── 📄 claudeHealthService.js # Claude AI health service (optional)
│       │
│       ├── 📂 firebase/               # Firebase initialization & config
│       └── 📂 data/                   # Static data / mock datasets
│
└── 📂 Backend/                        # ── Flask ML Server ──
    └── 📂 ML-model/
        └── 📂 ECG/
            ├── 🐍 app.py              # Flask REST API server
            ├── 🧠 heart_model.pkl     # Trained scikit-learn classifier (~1.2 MB)
            ├── 📄 requirements.txt    # Python dependencies
            ├── 🐳 Dockerfile          # Flask container definition
            ├── 🧪 test_model.py       # Model validation tests
            ├── 📂 model/              # Model training scripts/notebooks
            ├── 📂 dataset/            # Cleveland Heart Disease dataset
            └── 📂 templates/          # Flask HTML templates
```

---

## 🗺 Pages & Routes

| Route | Component | Auth | Description |
|-------|-----------|------|-------------|
| `/` | `LandingPage` | Public | Marketing landing page |
| `/login` | `Login` | Public | Firebase email/password login |
| `/signup` | `Signup` | Public | User registration |
| `/dashboard` | `Dashboard` | 🔒 Protected | Main health overview |
| `/upload` | `ReportUpload` | 🔒 Protected | Upload & scan medical reports |
| `/ecg` | `ECGPrediction` | 🔒 Protected | ECG Intelligence Analysis |
| `/chat` | `AIAssistant` | 🔒 Protected | AI Health Assistant chat |
| `/health-data` | `HealthDataVisualization` | 🔒 Protected | Dynamic PDF-driven charts |
| `/facilities` | `FacilitySearchDark` | 🔒 Protected | Find hospitals & clinics |
| `/drug-checker` | `DrugInteractionChecker` | 🔒 Protected | Drug interaction checker |
| `/appointment-confirmation` | `AppointmentConfirmation` | 🔒 Protected | Appointment booking |

> All protected routes use `ProtectedRoute` which redirects unauthenticated users to `/login`.

---

## 🫀 ECG Intelligence Module

The ECG page (`/ecg`) is the most advanced feature of CareConnect.

### Flow Overview
```
User uploads ECG report (PDF / CSV / Image)
        │
        ▼
PDF.js extracts full text from all pages  (PDF)
Tesseract.js runs OCR                     (Image)
parseCSVText parses columns               (CSV)
        │
        ▼
ecgApi.js → parseECGText() extracts 13 clinical features:
  age, sex, cp, trestbps, chol, fbs, restecg,
  thalach, exang, oldpeak, slope, ca, thal
        │
        ├──→ ecgSignalAnalysis.js parses QRS/P/T waveform intervals
        │
        ▼
POST /predict → Flask ML Server
        │
        ▼
Returns: prediction, risk_probability, confidence
        │
        ├──→ ECGResultCard        (risk score display)
        ├──→ ECGWaveChart         (BPM-accurate live waveform)
        ├──→ AIAnalysisCard       (Mistral AI generated summary)
        ├──→ HeartAnalytics       (patient metrics panel)
        ├──→ CardioRiskFactors    (Cholesterol, BP, Sugar, HR panel)
        └──→ EmergencyAlert       (if high risk detected)
```

### Key Components

#### `ECGUploadCard.js`
- Drag-and-drop + click-to-upload (PDF, CSV, PNG, JPG)
- File type auto-detection
- Stage progress indicators: Uploading → Extracting → Analyzing → Complete
- Exposes current file to parent via `onFileRef` callback

#### `ECGWaveChart.js` *(Fully Upgraded)*
- Canvas-based live ECG waveform with dark cinematic UI
- **BPM-accurate sweep speed** — always shows exactly 4 complete beats on screen; animation rate matches the real heart rate extracted from the PDF
- High-fidelity P-QRS-T wave model with physiologically accurate timings
- Glowing cyan waveform with `shadowBlur` canvas glow
- R-wave amplitude scales with BPM (tachycardia = slightly lower amplitude)
- Includes U-wave for added clinical realism
- Subtle breathing baseline wander + muscle noise artifacts
- Waveform patterns: Normal, Tachycardia, Bradycardia, AFib, ST Depression

#### `CardioRiskFactors` *(New — replaces Medical History)*
- Displays Cholesterol, Fasting Blood Sugar, Resting Blood Pressure, Max Heart Rate
- Auto-populated from PDF analysis; shows empty state before upload
- Color-coded badges: Normal (green) / High (red)

#### `ECGResultCard.js`
- Risk percentage gauge
- High Risk / Normal classification badge
- Confidence score breakdown

#### `AIAnalysisCard.js`
- Mistral AI-generated medical summary paragraph
- Bulleted recommendations list

#### `ECGReportTemplate.js`
- Printable A4-style diagnostic report
- Patient demographics, ECG parameters, AI analysis
- Download as PDF via `html2pdf.js`

#### Smart Refresh Button
- Clicking ↺ Refresh re-analyzes the **same uploaded PDF** (not a full reset)
- Clears only the result state; file reference is preserved via `useRef`
- Falls back to full reset if no file has been uploaded yet

---

## 📊 Health Data Visualization

The Health Data Visualization page (`/health-data`) is **fully dynamic** — it reads directly from the AI analysis produced when you upload a report in the Health Report Analysis section.

### How It Works
```
User uploads PDF in "Health Report Analysis"
        │
        ▼
Mistral AI returns structured JSON with findings[]
Each finding: { test, value, unit, status, referenceRange }
        │
        ▼
HealthContext.js → enhancedDispatch(ADD_REPORT)
Extracts all numeric findings → state.healthMetrics
        │
        ▼
HealthDataVisualization.js reads state.healthMetrics
Auto-generates a tab + chart for every metric found:
  e.g. Hemoglobin → Line Chart tab
       TSH → Bar Chart tab
       Vitamin D → Area Chart tab
```

### Features
- **Zero hardcoded data** — all charts driven by real PDF analysis
- Auto-generates tabs for every numeric test in the report
- Reference range shown as horizontal threshold line on charts
- Status color coding (Normal / High / Low) on data points
- Tooltip shows exact value, unit, status, and reference range on hover
- Empty state when no report has been uploaded yet

---

## 🧠 ML Model (Flask Backend)

### Model Details
| Property | Value |
|----------|-------|
| Algorithm | scikit-learn classifier (`heart_model.pkl`) |
| Training dataset | Cleveland Heart Disease Dataset |
| Input features | 13 clinical parameters |
| Output | Binary classification + probabilities |
| Model size | ~1.2 MB |
| Serialization | `joblib` |

### Input Features (13 Parameters)

| Feature | Description | Type |
|---------|-------------|------|
| `age` | Patient age in years | Numeric |
| `sex` | Sex (1 = male, 0 = female) | Binary |
| `cp` | Chest pain type (0–3) | Categorical |
| `trestbps` | Resting blood pressure (mmHg) | Numeric |
| `chol` | Serum cholesterol (mg/dl) | Numeric |
| `fbs` | Fasting blood sugar > 120 mg/dl (1 = true) | Binary |
| `restecg` | Resting ECG results (0–2) | Categorical |
| `thalach` | Maximum heart rate achieved | Numeric |
| `exang` | Exercise-induced angina (1 = yes) | Binary |
| `oldpeak` | ST depression induced by exercise | Numeric |
| `slope` | Slope of peak exercise ST segment (0–2) | Categorical |
| `ca` | Number of major vessels colored by fluoroscopy (0–3) | Numeric |
| `thal` | Thalassemia (1 = normal, 2 = fixed defect, 3 = reversible) | Categorical |

### API Endpoints

#### `GET /health`
```json
{
  "status": "ok",
  "model": "loaded",
  "model_type": "RandomForestClassifier",
  "features_expected": ["age", "sex", "cp", "..."]
}
```

#### `POST /predict`
**Request:**
```json
{
  "age": 63, "sex": 1, "cp": 3, "trestbps": 145,
  "chol": 233, "fbs": 1, "restecg": 0, "thalach": 150,
  "exang": 0, "oldpeak": 2.3, "slope": 0, "ca": 0, "thal": 1
}
```

**Response:**
```json
{
  "prediction": "High Risk of Heart Disease",
  "risk_probability": "71.43%",
  "confidence": { "no_disease": 28.57, "disease": 71.43 },
  "raw_prediction": 0
}
```

> **Offline Fallback:** If Flask is unavailable, the frontend automatically switches to a local estimation mode using `runLocalPredictFallback()` in `ecgApi.js`. The "ML Server Online / Local Estimate Mode" badge in the header shows current status.

---

## 🤖 AI Integrations

### Mistral AI (`mistral-medium`)
Used in three places:

1. **AI Health Assistant** (`/chat`) — Full conversational health assistant
2. **Health Report Analysis** (Upload page) — Structured extraction of medical reports
3. **MedBot Widget** — Floating chatbot on every page

**API Client** — `src/utils/mistralAPI.js`:
```js
getMistralResponse(userMessage, systemPrompt)
// → Returns: string (AI response)

analyzeMedicalReport(reportText)
// → Returns: { keyFindings, riskFactors, recommendations,
//              criticalValues, normalValues, summary,
//              reportType, detectedDoctor, detectedFacility }
```

### ECG Signal Analysis — `src/utils/ecgSignalAnalysis.js`
Parses waveform intervals directly from ECG PDF text:
- Extracts PR interval, QRS duration, QT interval, RR interval
- Classifies intervals as Normal / Prolonged / Short
- Generates a clinical summary string injected into the AI report

### PDF Parser — `src/services/ecgApi.js`
- Detects QRS Diagnostic layout vs. generic ECG format
- Extracts patient demographics, waveform intervals, and all 13 ML features
- Validates extracted values against physiological ranges
- Falls back to `generatePhysiologicalDefaults()` for image uploads

---

## 🔥 Firebase Integration

### Authentication (`AuthContext.js`)
- Email/password sign-in and registration
- `onAuthStateChanged` listener for session persistence
- Auto-redirects unauthenticated users away from protected routes

### Firestore
- User health records and appointment data
- Chat history (optional persistence)

---

## 🗂 State Management & Contexts

### `HealthContext.js`
Global application state for health data:
```js
state = {
  healthData: { ... },       // Dashboard metrics
  reports: [ ... ],          // Uploaded medical reports
  healthMetrics: { ... },    // Dynamic chart data from PDF analysis
  chatHistory: [ ... ],      // AI Assistant message history
  appointments: [ ... ],     // Booked appointments
}

dispatch actions:
  ADD_CHAT_MESSAGE
  CLEAR_CHAT_HISTORY
  ADD_REPORT           // ← also triggers metric extraction for charts
  UPDATE_HEALTH_DATA
  ADD_APPOINTMENT
```

### `AuthContext.js`
```js
const { user, login, logout, signup } = useAuth();
```

### `ThemeContext.js`
```js
const { theme, toggleTheme } = useTheme();
// theme: 'dark' | 'light'
```

---

## ⚙️ Environment Variables

Create a `.env` file in the **project root** (or in `Frontend/` for local dev):

```env
# Mistral AI
REACT_APP_MISTRAL_API_KEY=your_mistral_api_key_here

# Google Maps
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Flask ML Server URL
REACT_APP_FLASK_URL=http://localhost:5000

# Firebase
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Flask (used in Docker)
FLASK_DEBUG=false
FLASK_PORT=5000
```

> ⚠️ **Never commit `.env` to version control.** It is already listed in `.gitignore`.

---

## 💻 Running the App Locally

> The project is split into two top-level folders — **`Frontend/`** (React app) and **`Backend/`** (Flask ML server). You need **two separate terminals** to run the full stack.

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18.x | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9.x | Comes with Node.js |
| Python | ≥ 3.9 | [python.org](https://python.org) |
| pip | latest | Comes with Python |

---

### Step 1 — Clone & Set Up Environment

```bash
git clone https://github.com/your-username/CareConnect.git
cd CareConnect
```

Copy and configure your environment file:
```bash
cp .env.example .env
# Open .env and fill in your API keys
```

---

### Step 2 — Run the Frontend (React)

Open **Terminal 1**:

```bash
cd Frontend
npm install
npm run dev
```

✅ React app → **`http://localhost:3076`**

---

### Step 3 — Run the Backend (Flask ML Server)

Open **Terminal 2**:

```bash
cd Backend/ML-model/ECG
pip install -r requirements.txt
python app.py
```

✅ Flask ML server → **`http://localhost:5000`**

> 💡 **Tip:** The frontend works **without** the Flask server — it automatically switches to local estimation mode. You only need Flask running for full scikit-learn ML predictions. The header badge shows **"ML Server Online"** or **"Local Estimate Mode"** depending on status.

---

### Quick Reference

| What | Command | Directory |
|------|---------|-----------|
| Start React frontend | `npm run dev` | `Frontend/` |
| Install frontend deps | `npm install` | `Frontend/` |
| Start Flask backend | `python app.py` | `Backend/ML-model/ECG/` |
| Install Python deps | `pip install -r requirements.txt` | `Backend/ML-model/ECG/` |
| Build for production | `npm run build` | `Frontend/` |

---

## 🐳 Running with Docker

Docker Compose orchestrates both services with automatic health checking.

```bash
# Build and start all services
docker-compose up --build
```

### Services
| Container | Port | Description |
|-----------|------|-------------|
| `careconnect-flask-ml` | 5000 | Flask ML prediction server |
| `careconnect-frontend` | 3076 | React development server |

### Docker Features
- Flask container has a **health check** that polls `/health` every 15 seconds
- Frontend waits for Flask to be healthy before starting (`depends_on: service_healthy`)
- Shared `careconnect-network` bridge for inter-container communication
- Hot-reload enabled via `CHOKIDAR_USEPOLLING=true`

---

## 📡 API Reference

### Flask ML Server — Base URL: `http://localhost:5000`

#### `GET /health`
**Description:** Check if the Flask server and ML model are loaded.

**Response `200 OK`:**
```json
{
  "status": "ok",
  "model": "loaded",
  "model_type": "RandomForestClassifier",
  "features_expected": ["age","sex","cp","trestbps","chol","fbs","restecg","thalach","exang","oldpeak","slope","ca","thal"]
}
```

#### `POST /predict`
**Description:** Predict cardiovascular risk from 13 clinical ECG features.

**Request Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "age": 55, "sex": 1, "cp": 2, "trestbps": 132, "chol": 342,
  "fbs": 0, "restecg": 1, "thalach": 166, "exang": 0,
  "oldpeak": 1.2, "slope": 2, "ca": 0, "thal": 2
}
```

**Response `200 OK`:**
```json
{
  "prediction": "Normal",
  "risk_probability": "24.56%",
  "confidence": { "no_disease": 75.44, "disease": 24.56 },
  "raw_prediction": 1
}
```

**Error Responses:**
| Status | Reason |
|--------|--------|
| `400` | Missing features or non-numeric values |
| `500` | Internal server error during prediction |

---

## 🚢 Deployment

### Frontend (Vercel / Netlify)
```bash
cd Frontend
npm run build
# Deploy the /build folder
```
Set all `REACT_APP_*` environment variables in your hosting provider's dashboard.

### Flask Backend (Render / Railway / EC2)
```bash
cd Backend/ML-model/ECG
pip install -r requirements.txt
python app.py
```
Or use the included Dockerfile:
```bash
docker build -t careconnect-flask ./Backend/ML-model/ECG
docker run -p 5000:5000 careconnect-flask
```

Set `REACT_APP_FLASK_URL` in your frontend environment to point to the deployed Flask URL.

---

## 🤝 Contributing

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'Add: your feature description'`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. Open a **Pull Request**

### Code Style Guidelines
- React components use functional components with hooks
- CSS utility classes via TailwindCSS; avoid inline styles unless dynamic
- All Mistral AI API calls centralized in `src/utils/mistralAPI.js`
- All ECG parsing and ML calls centralized in `src/services/ecgApi.js`
- Context used for cross-component state; avoid prop drilling
---

<div align="center">

**Built with ❤️ by the CareConnect Team**

*Empowering individuals to take control of their health through AI.*

</div>
