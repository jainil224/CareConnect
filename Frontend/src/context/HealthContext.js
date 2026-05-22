import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

const HealthContext = createContext();

const initialState = {
  user: null,
  reports: [],
  recommendations: [],
  appointments: [],
  facilities: [],
  chatHistory: [],
  healthMetrics: {
    bloodPressure: [],
    glucose: [],
    cholesterol: [],
    weight: [],
    heartRate: [],
    bmi: []
  },
  healthScore: 92
};

function healthReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_REPORT':
      return { ...state, reports: [...state.reports, action.payload] };
    case 'UPDATE_HEALTH_METRICS': {
      const updatedMetrics = { ...state.healthMetrics };
      if (action.payload) {
        Object.keys(action.payload).forEach(key => {
          if (updatedMetrics[key] && Array.isArray(updatedMetrics[key])) {
            updatedMetrics[key] = [...updatedMetrics[key], ...action.payload[key]];
          } else {
            updatedMetrics[key] = [...action.payload[key]];
          }
        });
      }
      return { 
        ...state, 
        healthMetrics: updatedMetrics,
        healthScore: action.healthScore || state.healthScore
      };
    }
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] };
    case 'SET_FACILITIES':
      return { ...state, facilities: action.payload };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case 'CLEAR_CHAT_HISTORY':
      return { ...state, chatHistory: [] };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

export function HealthProvider({ children }) {
  const { currentUser } = useAuth();
  const [state, dispatch] = useReducer(healthReducer, initialState);

  // Define enhancedDispatch BEFORE useEffect so we can use it
  const enhancedDispatch = (action) => {
    if (action.type === 'ADD_REPORT' && action.payload.analysis) {
      const reportDate = action.payload.analysis.meta?.reportDate || new Date().toISOString().split('T')[0];
      const newMetrics = {};
      
      // Calculate health score based on AI status
      let healthScore = 85;
      
      if (action.payload.analysis.findings && Array.isArray(action.payload.analysis.findings)) {
        action.payload.analysis.findings.forEach(finding => {
          // Adjust score based on status
          if (finding.status === 'HIGH' || finding.status === 'LOW') healthScore -= 2;
          if (finding.status === 'CRITICAL_HIGH' || finding.status === 'CRITICAL_LOW') healthScore -= 5;
          if (finding.status === 'NORMAL') healthScore += 1;
          
          // Try to extract a numeric value from the finding (e.g., "13.5 g/dL" -> 13.5)
          // We look for numbers, allowing decimals
          if (finding.value) {
            // First check if it's blood pressure (e.g. "120/80")
            const bpMatch = finding.value.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
            if (finding.testName.toLowerCase().includes('blood pressure') && bpMatch) {
              if (!newMetrics['Blood Pressure']) newMetrics['Blood Pressure'] = [];
              newMetrics['Blood Pressure'].push({
                date: reportDate,
                systolic: parseInt(bpMatch[1]),
                diastolic: parseInt(bpMatch[2]),
                status: finding.status,
                referenceRange: finding.referenceRange || ''
              });
              return; // Skip normal numeric parsing
            }
            
            // Normal numeric parsing
            const numMatch = finding.value.toString().match(/[-+]?[0-9]*\.?[0-9]+/);
            if (numMatch) {
              const val = parseFloat(numMatch[0]);
              if (!isNaN(val)) {
                // Use a clean test name for the key
                const testName = finding.testName.trim();
                if (!newMetrics[testName]) {
                  newMetrics[testName] = [];
                }
                newMetrics[testName].push({
                  date: reportDate,
                  value: val,
                  unit: finding.unit || '',
                  status: finding.status,
                  referenceRange: finding.referenceRange || ''
                });
              }
            }
          }
        });
      }
      
      healthScore = Math.min(Math.max(healthScore, 0), 100);

      // Dispatch the report
      dispatch(action);
      
      // Update health metrics if any were extracted
      if (Object.keys(newMetrics).length > 0) {
        dispatch({
          type: 'UPDATE_HEALTH_METRICS',
          payload: newMetrics,
          healthScore: healthScore
        });
      }
    } else {
      dispatch(action);
    }
  };

  useEffect(() => {
    if (currentUser) {
      const fetchReports = async () => {
        try {
          const q = query(
            collection(db, `users/${currentUser.uid}/reports`),
            orderBy('uploadDate', 'asc') // Ascending so metrics build chronologically
          );
          const snapshot = await getDocs(q);
          
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.aiAnalysis) {
              // Avoid duplicating if we somehow already have it
              // (e.g. strict mode or re-mounts)
              enhancedDispatch({
                type: 'ADD_REPORT',
                payload: {
                  id: doc.id,
                  filename: data.filename,
                  uploadDate: data.uploadDate,
                  analysis: data.aiAnalysis,
                  summary: data.summary,
                  storageUrl: data.storageUrl,
                  reportType: data.reportType,
                  metadata: {
                    reportDate: data.uploadDate.split('T')[0]
                  }
                }
              });
            }
          });
        } catch (err) {
          console.error("Error fetching context reports:", err);
        }
      };
      
      // We only fetch if state.reports is empty to prevent infinite loops or duplication
      if (state.reports.length === 0) {
        fetchReports();
      }
    } else {
      // User logged out: clear all health data from global context!
      enhancedDispatch({ type: 'RESET_STATE' });
    }
  }, [currentUser]); // Note: omitted state.reports.length from dependency to avoid re-triggering

  return (
    <HealthContext.Provider value={{ state, dispatch: enhancedDispatch }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}