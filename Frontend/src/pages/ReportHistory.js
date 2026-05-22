import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { FileText, Download, Calendar, Activity, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportHistory() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDelete = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) return;
    
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/reports`, reportId));
      setReports(reports.filter(r => r.id !== reportId));
    } catch (err) {
      console.error("Error deleting report:", err);
      alert("Failed to delete the report. Please try again.");
    }
  };

  const handleDownload = (report) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Dark Background for first page
    doc.setFillColor(15, 15, 18); // #0F0F12
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Hook into addPage to automatically paint the background black
    const originalAddPage = doc.addPage.bind(doc);
    doc.addPage = function() {
      originalAddPage();
      doc.setFillColor(15, 15, 18);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    };

    // Header Background
    doc.setFillColor(20, 20, 25);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setDrawColor(34, 211, 238); // Cyan border bottom
    doc.setLineWidth(0.5);
    doc.line(0, 30, pageWidth, 30);

    // Header Text - Left
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("CareConnect", 20, 15);
    doc.setTextColor(34, 211, 238); // Cyan
    doc.setFontSize(10);
    doc.text("AI PREDICTION SYSTEM", 20, 22);

    // Header Text - Right
    doc.setTextColor(150, 150, 160);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const reportId = report.id ? report.id.substring(0, 8).toUpperCase() : 'REP-UNKNOWN';
    doc.text(`Report ID: REP-${reportId}`, pageWidth - 20, 12, { align: 'right' });
    doc.text(`Date: ${format(new Date(report.uploadDate), 'yyyy-MM-dd HH:mm')}`, pageWidth - 20, 17, { align: 'right' });
    doc.text(`Type: ${report.reportType || 'General Health Report'}`, pageWidth - 20, 22, { align: 'right' });

    // Section 1: AI Diagnostic Result
    let startY = 45;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("AI DIAGNOSTIC RESULT", 20, startY);
    
    startY += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 210);
    
    // Check if there are findings or just a summary
    const ai = report.aiAnalysis || {};
    const riskLevel = ai.riskLevel || (report.summary && report.summary.toLowerCase().includes('high') ? 'High Risk' : 'Normal / Low Risk');
    
    doc.setTextColor(34, 211, 238);
    doc.text(`Assessment: ${riskLevel}`, 20, startY);
    doc.setTextColor(200, 200, 210);

    // Section 2: AI Medical Summary
    startY += 15;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("AI MEDICAL SUMMARY", 20, startY);
    
    startY += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 210);
    
    const summaryText = report.summary || "No summary available.";
    const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 40);
    doc.text(splitSummary, 20, startY);

    startY += (splitSummary.length * 5) + 10;

    // Helper for pagination
    const checkPageBreak = (requiredSpace) => {
      if (startY + requiredSpace > pageHeight - 30) {
        doc.addPage();
        startY = 20;
      }
    };

    // Section: Key Insights
    if (ai.keyInsights && ai.keyInsights.length > 0) {
      checkPageBreak(30);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("KEY INSIGHTS", 20, startY);
      
      startY += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 200, 210);
      
      ai.keyInsights.forEach((insight) => {
        const text = `• ${insight.replace(/\*\*/g, '')}`;
        const splitText = doc.splitTextToSize(text, pageWidth - 40);
        checkPageBreak(splitText.length * 5 + 5);
        doc.text(splitText, 20, startY);
        startY += (splitText.length * 5) + 3;
      });
      startY += 10;
    }

    // Section: Detailed Lab Results
    if (ai.findings && ai.findings.length > 0) {
      checkPageBreak(40);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DETAILED LAB RESULTS", 20, startY);
      
      autoTable(doc, {
        startY: startY + 5,
        head: [['Test Parameter', 'Result', 'Ref. Range', 'Status']],
        body: ai.findings.map(f => [
          f.testName,
          `${f.value || ''} ${f.unit || ''}`.trim() || 'N/A',
          f.referenceRange || 'N/A',
          f.status || 'NORMAL'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [34, 211, 238], textColor: [15, 15, 18], fontStyle: 'bold' },
        bodyStyles: { fillColor: [20, 20, 25], textColor: [200, 200, 210] },
        alternateRowStyles: { fillColor: [25, 25, 30] },
        margin: { top: 20, left: 20, right: 20 },
        styles: { fontSize: 9, cellPadding: 4, lineColor: [40, 40, 45], lineWidth: 0.1 },
        columnStyles: { 3: { fontStyle: 'bold' } },
        willDrawCell: function (data) {
          if (data.section === 'body' && data.column.index === 3) {
            const status = data.cell.raw.toUpperCase();
            if (status.includes('HIGH') || status.includes('LOW')) data.cell.styles.textColor = [239, 68, 68];
            if (status.includes('NORMAL')) data.cell.styles.textColor = [34, 197, 94];
          }
        }
      });
      
      startY = doc.lastAutoTable.finalY + 15;
    }

    // Section: Recommendations
    if (ai.recommendations && ai.recommendations.length > 0) {
      checkPageBreak(30);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("RECOMMENDATIONS", 20, startY);
      
      startY += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 200, 210);
      
      ai.recommendations.forEach((rec) => {
        const text = `• ${rec.replace(/\*\*/g, '')}`;
        const splitRec = doc.splitTextToSize(text, pageWidth - 40);
        checkPageBreak(splitRec.length * 5 + 5);
        doc.text(splitRec, 20, startY);
        startY += (splitRec.length * 5) + 3;
      });
      startY += 10;
    }

    // Apply footer to ALL pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      doc.setFillColor(20, 20, 25);
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      doc.setDrawColor(30, 30, 35);
      doc.line(0, pageHeight - 20, pageWidth, pageHeight - 20);
      
      doc.setTextColor(100, 100, 110);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`GENERATED BY CARECONNECT AI SYSTEM • PAGE ${i} OF ${pageCount}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
      doc.text("DISCLAIMER: This report is AI-generated and should not be used as the sole basis for clinical diagnosis.", pageWidth / 2, pageHeight - 6, { align: 'center' });
    }

    // Save PDF
    doc.save(`CareConnect_Report_${report.filename || 'Summary'}.pdf`);
  };

  useEffect(() => {
    const fetchReports = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const q = query(
          collection(db, `users/${currentUser.uid}/reports`),
          orderBy('uploadDate', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedReports = [];
        querySnapshot.forEach((doc) => {
          fetchedReports.push({ id: doc.id, ...doc.data() });
        });
        
        setReports(fetchedReports);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load report history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-500">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500">
        <AlertCircle className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 text-zinc-900 dark:text-zinc-100">
      <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <h1 className="text-3xl font-black tracking-tight mb-2">Report History</h1>
        <p className="text-zinc-500 dark:text-zinc-400">View and download your previously analyzed medical records and ECGs.</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white dark:bg-[#121214] rounded-3xl border border-zinc-200 dark:border-zinc-800/80 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Reports Found</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            You haven't uploaded any reports yet. Head over to the Dashboard to upload a general medical report or an ECG.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-start justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    report.reportType?.includes('ECG') 
                      ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400' 
                      : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {report.reportType?.includes('ECG') ? <Activity className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm truncate max-w-[180px]">{report.filename}</h3>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mt-0.5">{report.reportType || 'Medical Report'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(report.id)}
                  className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Delete Report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-4 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(report.uploadDate), 'MMM dd, yyyy • h:mm a')}
                </div>
                
                <div className="flex-1">
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3">
                    {report.summary || "No summary available for this report."}
                  </p>
                </div>
                
                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex gap-2">
                  {report.storageUrl && (
                    <a 
                      href={report.storageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="View Original Upload"
                      className="flex items-center justify-center py-2 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  )}
                  <button 
                    onClick={() => handleDownload(report)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-sm font-semibold rounded-xl transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Analysis
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
