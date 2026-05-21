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

> **CareConnect** is a full-stack, AI-powered personal health management platform that brings together ECG analysis, medical report scanning, real-time health monitoring, AI-driven chat assistance, drug interaction checking, and hospital locator — all in one beautifully designed dashboard.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo & Ports](#-live-demo--ports)
- [Feature Highlights](#-feature-highlights)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Directory Structure](#-directory-structure)
- [Pages & Routes](#-pages--routes)
- [Components](#-components)
- [ECG Intelligence Module](#-ecg-intelligence-module)
- [ML Model (Flask Backend)](#-ml-model-flask-backend)
- [AI Integrations](#-ai-integrations)
- [MedBot AI Chat Widget](#-medbot-ai-chat-widget)
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

CareConnect is designed to give individuals complete control over their health from home. It combines:

- **Machine learning** for cardiovascular risk prediction directly from ECG data
- **OCR-powered report scanning** to extract patient data from uploaded PDFs/images
- **Real-time ECG waveform visualization** with live animated displays
- **Mistral AI language model** for natural-language health consultations
- **Google Maps integration** to find nearby hospitals and clinics
- **Firebase Authentication** for secure user management
- **Comprehensive health dashboards** with charts, analytics, and metrics

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
- Upload ECG reports (PDF, image, or typed data)
- OCR-powered text extraction using **Tesseract.js**
- 13-parameter cardiovascular risk assessment via ML model
- Live animated ECG waveform display with rhythm type detection
- AI-generated medical summary and treatment recommendations
- Downloadable PDF diagnostic report
- Emergency alert system for high-risk predictions
- Reset/refresh to analyze new reports

### 📊 Health Dashboard
- Real-time health score tracking
- Heartbeat, glucose level, blood pressure, and blood count visualizations
- Active Visualizer with 3D-styled organ animations (Heart, Brain, Kidney, Liver SVGs)
- Appointment tracking and management
- R-R interval and blood status monitoring
- 24-hour/weekly health overview with toggle controls

### 📤 Medical Report Upload
- Drag-and-drop file upload for any medical report
- Tesseract.js OCR extracts text from images/PDFs
- Mistral AI parses and structures the report into:
  - Key findings
  - Risk factors
  - Normal values
  - Critical values requiring urgent attention
  - Recommendations
  - Doctor and facility name detection

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
- Full Mistral AI integration (same API as AI Health Assistant)
- Quick action chips for instant health queries
- Animated typing indicator
- Hover-to-reveal "AI Health Assistant" tooltip label

### 🏥 Find Facilities
- Google Maps-powered hospital and clinic locator
- Dark-themed map interface
- Search by location or detect current position
- Filter by facility type (hospital, clinic, pharmacy)

### 💊 Drug Interaction Checker
- Enter multiple medications to check for interactions
- AI-powered analysis of potential drug conflicts
- Severity classification and recommendations

### 📅 Appointment Confirmation
- Book and confirm medical appointments
- Appointment summary cards with doctor and facility details

### 🚨 Emergency Alert System
- Full-screen emergency modal for critical health readings
- One-click facility search escalation
- Built into both the Dashboard and ECG pages

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | UI framework |
| React Router DOM | 6.8.0 | Client-side routing |
| TailwindCSS | 3.2.0 | Utility-first styling |
| Framer Motion | 12.x | Advanced animations |
| Recharts | 2.15.4 | Health data charts |
| Lucide React | 0.263.0 | Icon library |
| React Hot Toast | 2.6.0 | Toast notifications |
| Tesseract.js | 4.0.0 | OCR for report scanning |
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
| **Mistral AI** (mistral-medium) | AI Health Assistant + Report Analysis |
| **Firebase Auth** | User authentication |
| **Firebase Firestore** | User data persistence |
| **Google Maps JavaScript API** | Hospital / facility locator |
| **@google/generative-ai** | Additional Gemini AI support |

### DevOps
| Tool | Purpose |
|------|---------|
| Docker | Containerized deployment |
| docker-compose | Multi-service orchestration |
| concurrently | Run frontend + backend together locally |

---

## 🏗 Project Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  React SPA  (port 3076)                         │
│  ┌────────────┐  ┌───────────────────────────┐  │
│  │  Dashboard │  │   ECG Intelligence Page   │  │
│  │  AI Chat   │  │   Report Upload           │  │
│  │  Facilities│  │   Health Data             │  │
│  └────────────┘  └───────────────────────────┘  │
└──────────────┬──────────────────────────────────┘
               │ HTTP REST
               ▼
┌──────────────────────────┐    ┌──────────────────┐
│  Flask ML Server (5000)  │    │  Mistral AI API   │
│  /predict  (POST)        │    │  mistral-medium   │
│  /health   (GET)         │    │  AI responses     │
│  heart_model.pkl         │    └──────────────────┘
│  scikit-learn classifier │
└──────────────────────────┘
               │
┌──────────────────────────┐    ┌──────────────────┐
│  Firebase Auth           │    │  Google Maps API  │
│  User login / signup     │    │  Facility Search  │
│  Firestore data store    │    └──────────────────┘
└──────────────────────────┘
```

---

## 📁 Directory Structure

```
CareConnect/
│
├── 📄 package.json              # Node dependencies & npm scripts
├── 📄 docker-compose.yml        # Docker multi-service config
├── 📄 tailwind.config.js        # TailwindCSS configuration
├── 📄 postcss.config.js         # PostCSS plugins
├── 📄 .env                      # Environment variables (API keys)
│
├── 📂 ML-model/
│   └── 📂 ECG/
│       ├── 🐍 app.py            # Flask REST API server
│       ├── 🧠 heart_model.pkl   # Trained scikit-learn classifier (~1.2 MB)
│       ├── 📄 requirements.txt  # Python dependencies
│       ├── 🐳 Dockerfile        # Flask container definition
│       ├── 🧪 test_model.py     # Model validation tests
│       ├── 📂 model/            # Model training notebooks/scripts
│       ├── 📂 dataset/          # Cleveland Heart Disease dataset
│       └── 📂 templates/        # Flask HTML templates
│
├── 📂 public/                   # Static assets
│
└── 📂 src/
    ├── 📄 App.js                # Root component, router, global providers
    ├── 📄 index.js              # React entry point
    ├── 📄 index.css             # Global styles
    ├── 📄 config.js             # App configuration constants
    │
    ├── 📂 pages/
    │   ├── 📄 LandingPage.js    # Public marketing/home page
    │   ├── 📄 Login.js          # User login page
    │   ├── 📄 Signup.js         # User registration page
    │   └── 📄 ECGPrediction.js  # ECG Intelligence full-page module
    │
    ├── 📂 components/
    │   ├── 📄 Header.js                    # Navigation bar with theme toggle
    │   ├── 📄 Dashboard.js                 # Main health dashboard
    │   ├── 📄 AIAssistant.js               # Full-page AI chat interface
    │   ├── 📄 ReportUpload.js              # Medical report OCR uploader
    │   ├── 📄 HealthDataVisualization.js   # Health charts and trends
    │   ├── 📄 FacilitySearchDark.js        # Google Maps hospital locator
    │   ├── 📄 DrugInteractionChecker.js    # Drug interaction AI tool
    │   ├── 📄 AppointmentConfirmation.js   # Appointment booking UI
    │   ├── 📄 EmergencyAlert.js            # Emergency modal (dashboard)
    │   ├── 📄 EmergencyButton.js           # Floating emergency button
    │   ├── 📄 BrainSVG.jsx                 # Animated 3D brain SVG
    │   ├── 📄 HeartSVG.jsx                 # Animated 3D heart SVG
    │   ├── 📄 KidneySVG.jsx                # Animated 3D kidney SVG
    │   ├── 📄 LiverSVG.jsx                 # Animated 3D liver SVG
    │   │
    │   ├── 📂 auth/                        # Auth-related UI components
    │   │
    │   ├── 📂 ecg/                         # ECG Intelligence sub-components
    │   │   ├── 📄 ECGUploadCard.js         # Report upload & form UI
    │   │   ├── 📄 ECGWaveChart.js          # Animated live ECG waveform
    │   │   ├── 📄 ECGResultCard.js         # Risk result display card
    │   │   ├── 📄 ECGReportTemplate.js     # Printable PDF report template
    │   │   ├── 📄 AIAnalysisCard.js        # AI medical summary card
    │   │   ├── 📄 HeartAnalytics.js        # Patient heart analytics panel
    │   │   ├── 📄 EmergencyAlert.js        # ECG emergency modal
    │   │   └── 📄 MedBotChatWidget.js      # Floating MedBot AI chatbot
    │   │
    │   └── 📂 features/                    # Feature-specific UI components
    │
    ├── 📂 context/
    │   ├── 📄 AuthContext.js       # Firebase auth state (login/logout)
    │   ├── 📄 HealthContext.js     # Global health data + chat history
    │   └── 📄 ThemeContext.js      # Dark/light mode toggle
    │
    ├── 📂 routes/
    │   └── 📄 ProtectedRoute.js   # Auth guard for protected pages
    │
    ├── 📂 utils/
    │   └── 📄 mistralAPI.js       # Mistral AI API client functions
    │
    ├── 📂 services/               # Firebase and external service clients
    ├── 📂 firebase/               # Firebase initialization config
    └── 📂 data/                   # Static data / mock datasets
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
| `/health-data` | `HealthDataVisualization` | 🔒 Protected | Trends & charts |
| `/facilities` | `FacilitySearchDark` | 🔒 Protected | Find hospitals & clinics |
| `/drug-checker` | `DrugInteractionChecker` | 🔒 Protected | Drug interaction checker |
| `/appointment-confirmation` | `AppointmentConfirmation` | 🔒 Protected | Appointment booking |

> All protected routes use `ProtectedRoute` which redirects unauthenticated users to `/login`.

---

## 🧩 Components

### `Header.js`
- Fixed top navigation bar
- Links to all major sections
- Dark/light mode toggle
- User avatar & logout button

### `Dashboard.js`
- Health score percentage with weekly comparison
- Active report count
- Appointment summary
- Real-time clock display
- Health Overview section with heartbeat waveform
- Organ Visualizer (Heart, Brain, Kidney, Liver SVGs)
- Glucose level chart (Recharts)
- Blood count chart (Recharts)
- R-R interval display
- Blood status readout
- Emergency alert modal integration

### `ReportUpload.js`
- Drag-and-drop zone supporting PDF, PNG, JPG, JPEG, WEBP
- **Tesseract.js** runs OCR in-browser — no server needed for text extraction
- Extracted text sent to **Mistral AI** for structured analysis
- Result sections: Key Findings, Risk Factors, Recommendations, Critical Values, Normal Values
- Download report as PDF

### `AIAssistant.js`
- Full-page chat interface
- Symptom quick-action chips: Fever, Headache, Chest Pain, Cough, Diabetes, Hypertension, Asthma, Arthritis, Anxiety, Mental Health
- Powered by Mistral `mistral-medium` model
- System prompt tuned for empathetic health guidance + emergency escalation
- New Chat button to reset conversation
- Green "Secure Connection Established" status indicator
- Chat history stored in `HealthContext`

### `HealthDataVisualization.js`
- Historical health trend charts
- Multiple metric overlays using Recharts

### `FacilitySearchDark.js`
- Google Maps integration via `@googlemaps/js-api-loader`
- Search bar for location input
- Nearby hospital markers on dark-themed map

### `DrugInteractionChecker.js`
- Multi-drug input field
- AI-powered interaction analysis
- Risk severity labeling

### `EmergencyAlert.js` / `EmergencyButton.js`
- Full-screen red alert modal
- Prominent "Find Facilities" escalation button
- Triggered automatically by high-risk ECG results or manually

---

## 🫀 ECG Intelligence Module

The ECG page (`/ecg`) is the most advanced feature of CareConnect. It is composed of several sub-components:

### Flow Overview
```
User uploads ECG report (PDF/image)
        │
        ▼
Tesseract.js OCR extracts text
        │
        ▼
extractPatientInfo() parses 13 clinical features:
  age, sex, cp, trestbps, chol, fbs, restecg,
  thalach, exang, oldpeak, slope, ca, thal
        │
        ▼
POST /predict → Flask ML Server
        │
        ▼
Returns: prediction, risk_probability, confidence
        │
        ├──→ ECGResultCard (risk score display)
        ├──→ ECGWaveChart (live waveform updates)
        ├──→ AIAnalysisCard (Mistral AI summary)
        ├──→ HeartAnalytics (patient metrics panel)
        └──→ EmergencyAlert (if high risk)
```

### `ECGUploadCard.js`
- Drag-and-drop + click-to-upload
- File type validation
- Processing stage indicators (OCR → Analysis → AI Summary)
- Patient information form (manual override)

### `ECGWaveChart.js`
- SVG-based live ECG waveform animation
- **Idle state**: flat single baseline (no animation before upload)
- **Processing state**: active waveform with rhythm based on detected heart rate
- Waveform patterns: Normal, Tachycardia, Bradycardia, AFib, ST Elevation
- Rhythm label and BPM display

### `ECGResultCard.js`
- Risk percentage gauge
- High Risk / Normal classification badge
- Confidence score breakdown (disease vs. no disease probability)
- Color-coded risk indicators

### `AIAnalysisCard.js`
- Mistral AI-generated medical summary paragraph
- Bulleted recommendations list
- Formatted with icons for readability

### `ECGReportTemplate.js`
- Printable A4-style diagnostic report
- Patient demographics, ECG parameters, AI analysis
- Download as PDF via `html2pdf.js`

### `HeartAnalytics.js`
- Heart rate, blood pressure, cholesterol display
- Patient info summary (name, DOB, gender)

### `EmergencyAlert.js` (ECG-specific)
- Triggered when `risk_probability ≥ 70%`
- Overlays full screen with urgent warning
- Includes "Find Nearest Hospital" button

---

## 🧠 ML Model (Flask Backend)

### Model Details
| Property | Value |
|----------|-------|
| Algorithm | scikit-learn classifier (`heart_model.pkl`) |
| Training dataset | Cleveland Heart Disease Dataset |
| Input features | 13 clinical parameters |
| Output | Binary classification (High Risk / Normal) + probabilities |
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
| `thal` | Thalassemia (1 = normal, 2 = fixed defect, 3 = reversible defect) | Categorical |

### API Endpoints

#### `GET /health`
Returns server status and model info.
```json
{
  "status": "ok",
  "model": "loaded",
  "model_type": "RandomForestClassifier",
  "features_expected": ["age", "sex", "cp", ...]
}
```

#### `POST /predict`
Accepts 13 clinical features and returns cardiovascular risk prediction.

**Request Body:**
```json
{
  "age": 63,
  "sex": 1,
  "cp": 3,
  "trestbps": 145,
  "chol": 233,
  "fbs": 1,
  "restecg": 0,
  "thalach": 150,
  "exang": 0,
  "oldpeak": 2.3,
  "slope": 0,
  "ca": 0,
  "thal": 1
}
```

**Response:**
```json
{
  "prediction": "High Risk of Heart Disease",
  "risk_probability": "71.43%",
  "confidence": {
    "no_disease": 28.57,
    "disease": 71.43
  },
  "raw_prediction": 0
}
```

> **Note:** In the training dataset, `target=0` indicates heart disease PRESENT and `target=1` indicates no heart disease (inverted labeling).

---

## 🤖 AI Integrations

### Mistral AI (`mistral-medium`)
Used in three places:

1. **AI Health Assistant** (`/chat`) — Full conversational health assistant
2. **Report Analysis** (Upload page) — Structured extraction of medical reports
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

**Model settings:**
- Model: `mistral-medium`
- Temperature: `0.7`
- Max tokens: `2000`

### Google Generative AI (`@google/generative-ai`)
Available as an optional secondary AI provider for additional generative features.

### Tesseract.js (OCR)
Runs entirely in the browser — extracts text from uploaded report images/PDFs without any server round-trip.

---

## 🤖 MedBot AI Chat Widget

**File:** `src/components/ecg/MedBotChatWidget.js`

The MedBot is a persistent floating AI chatbot rendered globally in `App.js` — visible on every page of the application.

### Design
- 3D doctor robot built entirely with inline SVG
- White glossy helmet head with cyan glowing face screen
- Animated closed-eye smile and curved mouth in cyan (`#00ffee`)
- Cyan glowing ear pieces and antenna ball
- White doctor coat with navy tie and stethoscope
- **Realistic animations**: `mbBreathe` (4s chest rise) + `mbNod` (5s head tilt)

### Chat Features
- Fully powered by **Mistral AI** (`getMistralResponse`)
- System prompt: empathetic health guidance, emergency escalation for severe symptoms
- Quick action chips: Fever, Headache, Chest Pain, Cough, Diabetes, BP, Asthma, Anxiety
- Animated 3-dot typing indicator while AI responds
- New Chat (➕) button to clear conversation
- User and bot message timestamps
- Custom dark scrollbar styling
- Auto-scrolls to latest message

### Behavior
- Button: transparent background — only the doctor robot is visible (no colored circle)
- Hover: reveals "AI Health Assistant" tooltip label to the left
- Open state: button turns into a red ✕ close button
- **AI badge** (✦ AI) pill on top-right corner of button

---

## 🔥 Firebase Integration

### Authentication (`AuthContext.js`)
- Email/password sign-in and registration
- `onAuthStateChanged` listener for session persistence
- Auto-redirects unauthenticated users away from protected routes

### Firestore
- User health records and appointment data
- Chat history (optional persistence)

### Setup
Firebase config is initialized in `src/firebase/` and consumed via `AuthContext`.

---

## 🗂 State Management & Contexts

### `HealthContext.js`
Global application state for health data:
```js
state = {
  healthData: { ... },       // Dashboard metrics
  reports: [ ... ],          // Uploaded medical reports
  chatHistory: [ ... ],      // AI Assistant message history
  appointments: [ ... ],     // Booked appointments
}

dispatch actions:
  ADD_CHAT_MESSAGE
  CLEAR_CHAT_HISTORY
  ADD_REPORT
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

Create a `.env` file in the project root:

```env
# React App (prefix REACT_APP_ required)
REACT_APP_MISTRAL_API_KEY=your_mistral_api_key_here
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
REACT_APP_FLASK_URL=http://localhost:5000

# Firebase
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Flask ML Server (used in Docker)
FLASK_DEBUG=false
FLASK_PORT=5000
```

> ⚠️ **Never commit `.env` to version control.** It is already listed in `.gitignore`.

---

## 💻 Running the App Locally

### Prerequisites
- **Node.js** ≥ 18.x
- **Python** ≥ 3.9
- **pip**

### Step 1 — Install Node dependencies
```bash
cd CareConnect
npm install
```

### Step 2 — Install Python dependencies
```bash
cd ML-model/ECG
pip install -r requirements.txt
```

### Step 3 — Configure environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### Step 4 — Run both servers concurrently
```bash
npm run dev:local
```

This uses `concurrently` to start:
- ✅ React frontend → `http://localhost:3076`
- ✅ Flask ML backend → `http://localhost:5000`

### Run individually
```bash
# Frontend only
npm run start

# Flask ML server only
npm run flask
```

---

## 🐳 Running with Docker

Docker Compose orchestrates both services with automatic health checking.

```bash
# Build and start all services
npm run dev:docker
# or
docker-compose up --build
```

### Services
| Container | Image | Port | Description |
|-----------|-------|------|-------------|
| `careconnect-flask-ml` | Custom Python/Flask | 5000 | ML prediction server |
| `careconnect-frontend` | node:20-slim | 3076 | React development server |

### Docker Features
- Flask container has a **health check** that polls `/health` every 15 seconds
- Frontend waits for Flask to be healthy before starting (`depends_on: condition: service_healthy`)
- Shared `careconnect-network` bridge for inter-container communication
- Hot-reload enabled via `CHOKIDAR_USEPOLLING=true`

---

## 📡 API Reference

### Flask ML Server — Base URL: `http://localhost:5000`

---

#### `GET /health`
**Description:** Check if the Flask server and ML model are loaded and ready.

**Response `200 OK`:**
```json
{
  "status": "ok",
  "model": "loaded",
  "model_type": "RandomForestClassifier",
  "features_expected": ["age","sex","cp","trestbps","chol","fbs","restecg","thalach","exang","oldpeak","slope","ca","thal"]
}
```

---

#### `POST /predict`
**Description:** Predict cardiovascular risk from 13 clinical ECG features.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:** (all fields required, all numeric)
```json
{
  "age": 55,
  "sex": 1,
  "cp": 2,
  "trestbps": 132,
  "chol": 342,
  "fbs": 0,
  "restecg": 1,
  "thalach": 166,
  "exang": 0,
  "oldpeak": 1.2,
  "slope": 2,
  "ca": 0,
  "thal": 2
}
```

**Response `200 OK`:**
```json
{
  "prediction": "Normal",
  "risk_probability": "24.56%",
  "confidence": {
    "no_disease": 75.44,
    "disease": 24.56
  },
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
npm run build
# Deploy the /build folder
```
Set environment variables in your hosting provider's dashboard.

### Flask Backend (Render / Railway / EC2)
```bash
cd ML-model/ECG
pip install -r requirements.txt
python app.py
```
Or use the included Dockerfile:
```bash
docker build -t careconnect-flask ./ML-model/ECG
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
- All AI API calls centralized in `src/utils/mistralAPI.js`
- Context used for cross-component state; avoid prop drilling

---

## 📜 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 CareConnect Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**Built with ❤️ by the CareConnect Team**

*Empowering individuals to take control of their health through AI.*

</div>
