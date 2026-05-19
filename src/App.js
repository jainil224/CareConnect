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

function App() {
  return (
    <ThemeProvider>
      <HealthProvider>
        <AuthProvider>
          <Router>
            <Toaster 
              position="top-right" 
              toastOptions={{
                style: {
                  background: '#0a1526',
                  color: '#e2e8f0',
                  border: '1px solid rgba(59,130,246,0.3)',
                },
                success: {
                  iconTheme: {
                    primary: '#22d3ee',
                    secondary: '#0a1526',
                  },
                },
              }} 
            />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <>
                        <Header />
                        <main className="pt-16">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/upload" element={<ReportUpload />} />
                            <Route path="/ecg" element={<ECGPrediction />} />
                            <Route path="/chat" element={<AIAssistant />} />
                            <Route path="/health-data" element={<HealthDataVisualization />} />
                            <Route path="/facilities" element={<FacilitySearchDark />} />
                            <Route path="/drug-checker" element={<DrugInteractionChecker />} />
                            <Route path="/appointment-confirmation" element={<AppointmentConfirmation />} />
                          </Routes>
                        </main>
                      </>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </HealthProvider>
    </ThemeProvider>
  );
}

export default App;