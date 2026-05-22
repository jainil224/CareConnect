import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HealthProvider } from './context/HealthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import ReportUpload from './components/ReportUpload';
import AIAssistant from './components/AIAssistant';
import HealthDataVisualization from './components/HealthDataVisualization';
import FacilitySearchDark from './components/FacilitySearchDark';
import DrugInteractionChecker from './components/DrugInteractionChecker';
import AppointmentConfirmation from './components/AppointmentConfirmation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './routes/ProtectedRoute';
import ECGPrediction from './pages/ECGPrediction';
import LandingPage from './pages/LandingPage';
import MedBotChatWidget from './components/ecg/MedBotChatWidget';
import ReportHistory from './pages/ReportHistory';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HealthProvider>
          <Router>
            <Toaster 
              position="top-right" 
              toastOptions={{
                style: {
                  background: '#09090b',
                  color: '#e2e8f0',
                  border: '1px solid rgba(59,130,246,0.3)',
                },
                success: {
                  iconTheme: {
                    primary: '#22d3ee',
                    secondary: '#09090b',
                  },
                },
              }} 
            />
            <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected Dashboard Routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <>
                        <Header />
                        <main className="pt-16">
                          <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/upload" element={<ReportUpload />} />
                            <Route path="/ecg" element={<ECGPrediction />} />
                            <Route path="/chat" element={<AIAssistant />} />
                            <Route path="/health-data" element={<HealthDataVisualization />} />
                            <Route path="/facilities" element={<FacilitySearchDark />} />
                            <Route path="/drug-checker" element={<DrugInteractionChecker />} />
                            <Route path="/appointment-confirmation" element={<AppointmentConfirmation />} />
                            <Route path="/history" element={<ReportHistory />} />
                            
                            {/* Fallback to dashboard if a logged-in user hits a non-existent protected route */}
                            <Route path="*" element={<Dashboard />} />
                          </Routes>
                        </main>
                      </>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
            <MedBotChatWidget />
          </Router>
        </HealthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;