import React from 'react';
import { 
  HeartPulse, 
  LayoutDashboard, 
  Brain, 
  UploadCloud, 
  BellRing, 
  FileDown 
} from 'lucide-react';
import FeatureCard from './FeatureCard';

export default function FeatureGrid() {
  const features = [
    {
      icon: HeartPulse,
      title: "AI ECG Prediction",
      description: "Upload ECG reports and receive AI-powered heart risk prediction, waveform analysis, and cardiovascular insights in real time.",
      points: [
        "ECG waveform visualization",
        "Arrhythmia detection",
        "AI heart risk score",
        "Smart ECG analysis"
      ],
      isBeige: true
    },
    {
      icon: LayoutDashboard,
      title: "Smart Health Dashboard",
      description: "Monitor health analytics through an advanced AI-powered dashboard with real-time medical visualization.",
      points: [
        "Live health graphs",
        "Health score tracking",
        "Interactive analytics",
        "Real-time monitoring"
      ],
      isBeige: false
    },
    {
      icon: Brain,
      title: "AI Medical Insights",
      description: "Receive intelligent AI-generated healthcare summaries and personalized medical insights.",
      points: [
        "AI-generated summaries",
        "Health recommendations",
        "Smart alerts",
        "Risk detection system"
      ],
      isBeige: true
    },
    {
      icon: UploadCloud,
      title: "Smart Report Upload",
      description: "Upload ECG reports, PDFs, and medical documents with automatic AI report detection.",
      points: [
        "Drag & drop upload",
        "ECG auto detection",
        "PDF analysis",
        "AI report classification"
      ],
      isBeige: false
    },
    {
      icon: BellRing,
      title: "Emergency Alert System",
      description: "Automatically detect critical health conditions and generate emergency warnings and alerts.",
      points: [
        "Emergency notifications",
        "Critical health alerts",
        "Risk monitoring",
        "Smart warning system"
      ],
      isBeige: true
    },
    {
      icon: FileDown,
      title: "AI PDF Report Generation",
      description: "Generate professional AI-powered healthcare reports with ECG analysis and health insights.",
      points: [
        "Downloadable PDF reports",
        "ECG chart export",
        "AI medical summaries",
        "Health analytics reports"
      ],
      isBeige: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {features.map((feature, idx) => (
        <FeatureCard
          key={idx}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          points={feature.points}
          isBeige={feature.isBeige}
        />
      ))}
    </div>
  );
}
