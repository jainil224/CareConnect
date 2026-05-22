import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Download, AlertCircle, CheckCircle, Loader, Brain, MapPin, Star, Phone } from 'lucide-react';
import { analyzeMedicalReport, extractTextFromDocument } from '../utils/mistralAPI';
import { fileToBase64 } from '../utils/fileToBase64';
import { HealthReportResults } from './HealthReport/HealthReportResults';
import { facilities } from '../data/facilities';
import { detectReportType } from '../utils/ReportTypeDetector';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import { useAuth } from '../context/AuthContext';
import { storage, db } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

function ReportUpload() {
  const { dispatch } = useHealth();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [reportProcessed, setReportProcessed] = useState(() => {
    return sessionStorage.getItem('currentUploadProcessed') === 'true';
  });
  const [analysis, setAnalysis] = useState(() => {
    const saved = sessionStorage.getItem('currentUploadAnalysis');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState(() => {
    return sessionStorage.getItem('currentUploadText') || '';
  });
  const [recommendedFacilities, setRecommendedFacilities] = useState([]);

  // Save to sessionStorage whenever state changes
  React.useEffect(() => {
    if (analysis) sessionStorage.setItem('currentUploadAnalysis', JSON.stringify(analysis));
    else sessionStorage.removeItem('currentUploadAnalysis');
    
    if (extractedText) sessionStorage.setItem('currentUploadText', extractedText);
    else sessionStorage.removeItem('currentUploadText');
    
    sessionStorage.setItem('currentUploadProcessed', reportProcessed);
  }, [analysis, extractedText, reportProcessed]);

  // Clear data instantly when user logs out to prevent data leaks between sessions
  React.useEffect(() => {
    if (!currentUser) {
      setFile(null);
      setPreview(null);
      setReportProcessed(false);
      setAnalysis(null);
      setExtractedText('');
      setRecommendedFacilities([]);
      sessionStorage.removeItem('currentUploadProcessed');
      sessionStorage.removeItem('currentUploadAnalysis');
      sessionStorage.removeItem('currentUploadText');
    }
  }, [currentUser]);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const type = detectReportType(selectedFile);
      
      if (type !== 'GENERAL_MEDICAL_REPORT' && type !== 'unknown') {
        toast.success("ECG Report Detected! Redirecting to Intelligence Engine...");
        setTimeout(() => {
          navigate('/ecg', { state: { file: selectedFile } });
        }, 1500);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setReportProcessed(false);
      setAnalysis(null);
      setExtractedText('');
      setRecommendedFacilities([]);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const processReport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Extract text from the PDF or image using Mistral OCR
      const base64 = await fileToBase64(file);
      const mediaType = file.type || 'application/octet-stream';
      const extractedOCRText = await extractTextFromDocument(base64, mediaType);
      
      const text = extractedOCRText || "No text could be extracted from the file.";
      setExtractedText(text);
      
      // Add a 1.5 second delay to prevent hitting Mistral's strict rate limits
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Analyze with Mistral AI
      const aiAnalysis = await analyzeMedicalReport(text);
      setAnalysis(aiAnalysis);
      
      let storageUrl = null;
      let firebaseDocId = null;

      if (currentUser) {
        try {
          const docRef = await addDoc(collection(db, `users/${currentUser.uid}/reports`), {
            filename: file.name,
            uploadDate: new Date().toISOString(),
            reportType: aiAnalysis.reportType || 'General Health Report',
            storageUrl: null, // Skipping file storage
            summary: aiAnalysis.summary,
            aiAnalysis: aiAnalysis
          });
          firebaseDocId = docRef.id;
          toast.success("Report saved to history successfully!");
        } catch (fbError) {
          console.error("Firebase upload error:", fbError);
          toast.error("Analysis complete, but failed to save to history.");
        }
      }

      // Save to context
      dispatch({
        type: 'ADD_REPORT',
        payload: {
          id: firebaseDocId || Date.now(),
          filename: file.name,
          uploadDate: new Date().toISOString(),
          extractedText: text,
          analysis: aiAnalysis,
          summary: aiAnalysis.summary,
          storageUrl: storageUrl,
          metadata: {
            reportDate: new Date().toISOString().split('T')[0],
            doctorName: aiAnalysis.detectedDoctor || '',
            facilityName: aiAnalysis.detectedFacility || '',
            reportType: aiAnalysis.reportType || '',
            notes: '',
            tags: []
          }
        }
      });
      
      const recommendations = getFacilityRecommendations(aiAnalysis, text);
      setRecommendedFacilities(recommendations);
      
      setReportProcessed(true);
    } catch (error) {
      console.error('Processing Error:', error);
      setError(`Error processing report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const getFacilityRecommendations = (analysis, reportText) => {
    const recommendations = [];
    
    const hasCardiacIssues = reportText.toLowerCase().includes('heart') || 
                             reportText.toLowerCase().includes('cardiac') ||
                             reportText.toLowerCase().includes('blood pressure') ||
                             analysis.keyFindings?.some(finding => 
                               finding.toLowerCase().includes('heart') || 
                               finding.toLowerCase().includes('cardiac')
                             );
    
    const hasHighGlucose = reportText.toLowerCase().includes('glucose') ||
                          reportText.toLowerCase().includes('diabetes') ||
                          analysis.keyFindings?.some(finding => 
                            finding.toLowerCase().includes('glucose') || 
                            finding.toLowerCase().includes('diabetes')
                          );
    
    const needsAdvancedCare = analysis.riskFactors?.length > 2 ||
                             analysis.criticalValues?.length > 0;
    
    if (hasCardiacIssues) {
      const cardiacFacilities = facilities.filter(f => 
        f.name.includes('Apex Heart') || 
        f.services.some(s => s.toLowerCase().includes('cardiology'))
      ).slice(0, 2);
      recommendations.push(...cardiacFacilities.map(f => ({...f, reason: 'Cardiac care specialist'})));
    }
    
    if (needsAdvancedCare) {
      const advancedHospitals = facilities.filter(f => 
        f.type === 'Hospital' && 
        (f.name.includes('Sterling') || f.name.includes('Sayaji') || f.priceRange === '₹₹₹')
      ).slice(0, 2);
      recommendations.push(...advancedHospitals.map(f => ({...f, reason: 'Advanced medical care'})));
    }
    
    const generalRecommendations = facilities.filter(f => 
      (f.type === 'Hospital' && f.rating >= 4.5) ||
      (f.type === 'Laboratory' && f.name.includes('SRL'))
    ).slice(0, 2);
    
    recommendations.push(...generalRecommendations.map(f => ({
      ...f, 
      reason: f.type === 'Hospital' ? 'Highly rated hospital' : 'Follow-up tests'
    })));
    
    const uniqueRecommendations = recommendations.filter((facility, index, self) => 
      index === self.findIndex(f => f.id === facility.id)
    ).slice(0, 4);
    
    return uniqueRecommendations;
  };
  
  const bookAppointment = (facility) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointmentData = {
      id: Date.now(),
      appointmentId: Math.floor(100000 + Math.random() * 900000),
      facilityName: facility.name,
      date: tomorrow.toLocaleDateString('en-GB'),
      time: '10:00 AM',
      service: 'Follow-up Consultation',
      status: 'confirmed',
      name: 'Patient Name',
      phone: '+91 98765 43210',
      reason: `Follow-up based on medical report analysis: ${facility.reason}`,
      doctorDetails: {
        name: 'Dr. ' + ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta'][Math.floor(Math.random() * 5)],
        specialty: facility.reason.includes('Cardiac') ? 'Cardiology' : 'General Medicine',
        experience: '10+ years experience',
        photo: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`
      }
    };
    
    dispatch({ type: 'ADD_APPOINTMENT', payload: appointmentData });
    
    navigate('/appointment-confirmation', {
      state: { appointment: appointmentData }
    });
  };

  const exportReport = () => {
    if (!analysis || !file) return;
    
    const element = document.getElementById('report-results-container');
    if (!element) {
      toast.error("Could not find the report to export");
      return;
    }
    
    toast.success("Generating PDF report...");
    
    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     `${file.name.split('.')[0]}_analysis.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#0a0a0c' },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const renderItem = (item) => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      if (item.metric && item.value) return `${item.metric}: ${item.value} ${item.unit || ''} ${item.category ? `[${item.category}]` : ''}`.trim();
      if (item.target && item.advice) return `${item.target}: ${item.advice} ${item.followUp ? `(Follow-up: ${item.followUp})` : ''}`;
      if (item.metric && item.total) return `${item.metric}: Total ${item.total}, HDL ${item.HDL || ''}, LDL ${item.LDL || ''}`;
      
      // Generic fallback for any other object shape returned by the AI
      return Object.entries(item)
        .filter(([_, v]) => typeof v !== 'object')
        .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
        .join(' | ');
    }
    return String(item);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="relative overflow-hidden bg-white/50 dark:bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl shadow-2xl p-8 mb-6">
        
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

        <div className="relative z-10 flex items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mr-4 border border-blue-500/20">
            <FileText className="h-6 w-6 text-blue-500 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Health Report Analysis
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Upload your medical documents for AI-powered extraction</p>
          </div>
        </div>
        
        {/* Dropzone Area */}
        <div className="group relative">
          {/* Animated glow ring behind the dropzone on hover */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
          
          <div className="relative border-2 border-dashed border-gray-300 dark:border-zinc-700/80 rounded-2xl p-10 text-center bg-white/50 dark:bg-black/40 hover:bg-white/80 dark:hover:bg-black/60 hover:border-blue-500/50 dark:hover:border-cyan-500/50 transition-all duration-300">
            
            <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-cyan-500/20 transition-all duration-500">
              <Upload className="h-8 w-8 text-blue-500 dark:text-cyan-400 group-hover:-translate-y-1 transition-transform duration-300" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Select your health report
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
              Drag and drop your files here or click the button below to browse. Supports PDF, JPG, PNG, and WebP.
            </p>
            
            <input
              type="file"
              accept="image/*,.pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center justify-center px-8 py-3.5 font-bold text-white rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <FileText className="h-5 w-5 mr-2" />
              Browse Files
            </label>
          </div>
        </div>
        
        {preview && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Selected Report</h2>
            <div className="flex justify-center">
              {file && file.type === 'application/pdf' ? (
                <div className="flex flex-col items-center justify-center py-8 w-full bg-red-50/50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-500/10">
                  <FileText className="h-12 w-12 text-red-500 mb-3" />
                  <p className="text-gray-900 dark:text-white font-medium">{file.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    PDF Document • {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <img src={preview} alt="Report preview" className="max-h-64 rounded-lg border border-gray-200" />
              )}
            </div>
          </div>
        )}
        
        {file && !reportProcessed ? (
          <button
            onClick={processReport}
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 mr-2 animate-spin" />
                Analyzing Report...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5 mr-2" />
                Analyze Report
              </>
            )}
          </button>
        ) : (
          reportProcessed && (
            <div className="flex space-x-4">
              <button
                onClick={processReport}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                Analyze Again
              </button>
              <button
                onClick={exportReport}
                className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </button>
            </div>
          )
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>


      {analysis && (
        <div className="mt-8 rounded-xl overflow-hidden" id="report-results-container" style={{ backgroundColor: '#0a0a0c', padding: '30px' }}>
          <HealthReportResults 
            data={analysis} 
            onReset={() => {
              setFile(null);
              setAnalysis(null);
              setReportProcessed(false);
              setPreview(null);
              setExtractedText('');
            }} 
          />
        </div>
      )}
      
      {recommendedFacilities.length > 0 && (
        <div className="relative overflow-hidden bg-white/50 dark:bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl shadow-2xl p-8 mt-8">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="p-3.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-500/20 shadow-inner">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                Recommended Healthcare Facilities
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Based on your medical report analysis</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
            {recommendedFacilities.map((facility) => (
              <div key={facility.id} className="group relative border border-gray-200 dark:border-white/5 bg-white/60 dark:bg-white/[0.02] rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/30 overflow-hidden backdrop-blur-sm">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-500" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-5">
                    <div className="pr-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{facility.name}</h3>
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{facility.type}</p>
                    </div>
                    <span className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-400 rounded-full text-xs font-bold shadow-sm whitespace-nowrap ml-2">
                      {facility.reason}
                    </span>
                  </div>
                  
                  <div className="space-y-3.5 mb-6">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 font-medium">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mr-3 shadow-inner">
                        <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      {facility.address}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 font-medium">
                      <div className="w-8 h-8 rounded-full bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center mr-3 shadow-inner">
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white mr-1">{facility.rating}</span> rating <span className="mx-1.5 text-gray-300 dark:text-gray-600">•</span> {facility.distance} km away
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 font-medium">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mr-3 shadow-inner">
                        <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      {facility.phone}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4 border-t border-gray-100 dark:border-white/5">
                    <button
                      onClick={() => bookAppointment(facility)}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transform hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center"
                    >
                      Book Appointment
                    </button>
                    <button
                      onClick={() => navigate('/facilities', { state: { searchQuery: facility.name } })}
                      className="px-5 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center relative z-10">
            <button
              onClick={() => navigate('/facilities')}
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-cyan-600 dark:text-cyan-400 hover:bg-gray-50 dark:hover:bg-white/10 font-bold shadow-sm transition-all text-sm group"
            >
              View All Healthcare Facilities 
              <span className="ml-2 transform group-hover:translate-x-1.5 transition-transform text-lg leading-none">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportUpload;