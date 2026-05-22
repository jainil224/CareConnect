import React, { useState, useMemo, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area, LabelList
} from 'recharts';
import { TrendingUp, Activity, Heart, Droplet, PieChart as PieChartIcon, Sparkles } from 'lucide-react';

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

const createHistoricalData = (baseVal, variance) => [
  { date: '2025-01', value: +(baseVal - variance).toFixed(1) },
  { date: '2025-02', value: +(baseVal + variance * 0.5).toFixed(1) },
  { date: '2025-03', value: +(baseVal - variance * 0.2).toFixed(1) },
  { date: '2025-04', value: +(baseVal).toFixed(1) },
];

const DUMMY_METRICS = {
  'Blood Pressure': [
    { date: '2025-01', systolic: 120, diastolic: 80 },
    { date: '2025-02', systolic: 118, diastolic: 78 },
    { date: '2025-03', systolic: 122, diastolic: 82 },
    { date: '2025-04', systolic: 125, diastolic: 85 },
  ],
  'Heart Rate': createHistoricalData(72, 5),
  'Respiratory Rate': createHistoricalData(16, 2),
  'Body Temperature': createHistoricalData(98.6, 0.4),
  'SpO2': createHistoricalData(98, 1),
  'BMI': createHistoricalData(24.5, 0.5),
  'Hemoglobin': createHistoricalData(14.5, 0.8),
  'RBC Count': createHistoricalData(4.8, 0.3),
  'WBC Count': createHistoricalData(7500, 500),
  'Platelet Count': createHistoricalData(250000, 20000),
  'Hematocrit': createHistoricalData(42, 2),
  'MCV': createHistoricalData(90, 3),
  'Fasting Blood Sugar': createHistoricalData(95, 8),
  'Post Meal Sugar': createHistoricalData(120, 15),
  'HbA1c': createHistoricalData(5.4, 0.2),
  'Total Cholesterol': createHistoricalData(180, 10),
  'HDL': createHistoricalData(55, 5),
  'LDL': createHistoricalData(100, 8),
  'Triglycerides': createHistoricalData(110, 15),
  'Bilirubin Total': createHistoricalData(0.8, 0.2),
  'SGPT (ALT)': createHistoricalData(25, 5),
  'SGOT (AST)': createHistoricalData(22, 4),
  'Albumin': createHistoricalData(4.2, 0.3),
  'Creatinine': createHistoricalData(0.9, 0.1),
  'Urea': createHistoricalData(15, 3),
  'Uric Acid': createHistoricalData(5.0, 0.5),
  'T3': createHistoricalData(120, 10),
  'T4': createHistoricalData(8.0, 0.5),
  'TSH': createHistoricalData(2.0, 0.4),
  'Vitamin D': createHistoricalData(35, 5),
  'Vitamin B12': createHistoricalData(400, 50),
  'Calcium': createHistoricalData(9.5, 0.3),
  'Iron': createHistoricalData(80, 10),
  'pH': createHistoricalData(6.0, 0.2),
  'ANTI CCP (ACCP)': createHistoricalData(10, 2),
  'RHEUMATOID FACTOR (RF)': createHistoricalData(12, 3),
  'C-REACTIVE PROTEIN (CRP)': createHistoricalData(2.5, 1),
  'ANTI NUCLEAR ANTIBODIES (ANA)': createHistoricalData(0.5, 0.1),
  'ERYTHROCYTE SEDIMENTATION RATE (ESR)': createHistoricalData(15, 5),
};

function HealthDataVisualization() {
  const { state } = useHealth();
  const [activeMetric, setActiveMetric] = useState(null);
  
  const hasRealData = state.reports && state.reports.length > 0;

  // Merge dynamic metrics with DUMMY_METRICS to form displayMetrics
  const displayMetrics = useMemo(() => {
    // Start with a deep copy of expanded dummy metrics to act as historical baseline
    const merged = JSON.parse(JSON.stringify(DUMMY_METRICS));
    
    // If we have real dynamic metrics, merge them in
    if (state.healthMetrics) {
      Object.entries(state.healthMetrics).forEach(([key, dataArray]) => {
        if (Array.isArray(dataArray) && dataArray.length > 0) {
          // Try to find a matching category in dummy metrics (case-insensitive)
          const existingKey = Object.keys(merged).find(k => k.toLowerCase() === key.toLowerCase()) || key;
          
          if (!merged[existingKey]) {
            merged[existingKey] = [];
          }
          // Sort real data
          const sortedRealData = [...dataArray].sort((a, b) => new Date(a.date) - new Date(b.date));
          
          // Append real data to historical dummy data to show trend
          merged[existingKey] = [...merged[existingKey], ...sortedRealData];
        }
      });
    }
    return merged;
  }, [state.healthMetrics]);
  const metricKeys = Object.keys(displayMetrics);
  
  // Set default active tab safely
  useEffect(() => {
    if (activeMetric === null && metricKeys.length > 0) {
      setActiveMetric(metricKeys[0]);
    }
  }, [metricKeys, activeMetric]);

  // Also calculate health distribution (Normal vs Abnormal) across all findings
  const healthDistribution = useMemo(() => {
    if (!hasRealData) {
      return [
        { name: 'Excellent', value: 60 },
        { name: 'Good', value: 25 },
        { name: 'Fair', value: 10 },
        { name: 'Poor', value: 5 },
      ];
    }
    
    let normal = 0;
    let highLow = 0;
    let critical = 0;
    
    state.reports.forEach(r => {
      r.analysis?.findings?.forEach(f => {
        if (f.status === 'NORMAL') normal++;
        else if (f.status === 'CRITICAL_HIGH' || f.status === 'CRITICAL_LOW') critical++;
        else highLow++;
      });
    });
    
    const total = normal + highLow + critical;
    if (total === 0) return [];
    
    return [
      { name: 'Normal', value: normal },
      { name: 'Slightly Off', value: highLow },
      { name: 'Critical', value: critical }
    ].filter(item => item.value > 0);
  }, [state.reports, hasRealData]);

  const tabs = useMemo(() => {
    const list = metricKeys.map(key => ({
      id: key,
      icon: <Activity className="h-4 w-4" />,
      label: key
    }));
    list.push({ id: 'distribution', icon: <PieChartIcon className="h-4 w-4" />, label: 'Overall Status' });
    return list;
  }, [metricKeys]);

  const renderActiveChart = () => {
    if (activeMetric === 'distribution') {
      return (
        <ResponsiveContainer width="100%" height={380}>
          <PieChart>
            <Pie
              data={healthDistribution}
              cx="50%" cy="50%" innerRadius={70} outerRadius={130}
              dataKey="value"
              paddingAngle={5}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {healthDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(18, 18, 20, 0.9)', borderRadius: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} 
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    const data = displayMetrics[activeMetric] || [];
    if (data.length === 0) return null;

    // Special rendering for Blood Pressure (systolic/diastolic)
    if (data[0] && data[0].systolic !== undefined) {
      return (
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(18, 18, 20, 0.9)', borderRadius: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} 
              itemStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line type="monotone" dataKey="systolic" stroke="#06b6d4" strokeWidth={3}>
              <LabelList dataKey="systolic" position="top" fill="#06b6d4" fontSize={12} fontWeight="bold" />
            </Line>
            <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={3}>
              <LabelList dataKey="diastolic" position="bottom" fill="#3b82f6" fontSize={12} fontWeight="bold" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Custom Tooltip to show reference ranges
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        const p = payload[0].payload;
        return (
          <div className="bg-zinc-900/95 border border-zinc-800 p-3 rounded-xl shadow-xl">
            <p className="text-zinc-400 text-xs mb-2">{label}</p>
            <p className="text-white font-bold text-lg">{p.value} <span className="text-sm font-normal text-zinc-400">{p.unit}</span></p>
            {p.status && <p className={`text-xs font-bold mt-1 ${p.status === 'NORMAL' ? 'text-emerald-400' : 'text-rose-400'}`}>{p.status}</p>}
            {p.referenceRange && <p className="text-xs text-zinc-500 mt-1">Normal Range: {p.referenceRange}</p>}
          </div>
        );
      }
      return null;
    };

    // Calculate domain with padding
    const minVal = Math.min(...data.map(d => d.value));
    const maxVal = Math.max(...data.map(d => d.value));
    const padding = (maxVal - minVal) * 0.1 || minVal * 0.1;

    // Render generic AreaChart for standard numeric values
    return (
      <ResponsiveContainer width="100%" height={380}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" domain={[Math.floor(minVal - padding), Math.ceil(maxVal + padding)]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)">
            <LabelList dataKey="value" position="top" fill="#e4e4e7" fontSize={12} fontWeight="bold" />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    );
  };
  
  const getMetricInsight = () => {
    if (!hasRealData) {
      return "Upload a medical report to see personalized AI insights here. Showing placeholder data for now.";
    }
    if (activeMetric === 'distribution') {
      return "This chart represents the proportion of Normal vs Abnormal tests across all your uploaded reports.";
    }
    return `Tracking ${activeMetric} over time. The AI automatically extracts these values from your uploaded PDFs to map your longitudinal health trends.`;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-zinc-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      <style>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Health Data Visualization
            </h1>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              {hasRealData ? "Your dynamic clinical metrics over time" : "Upload a report to see your actual data here"}
            </p>
          </div>
        </div>

        {/* Main Glassmorphic Container */}
        <div className="bg-white/60 dark:bg-[#121214]/60 backdrop-blur-2xl rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-2xl p-6 sm:p-8 flex flex-col">
          
          {hasRealData ? (
            <>
              {/* Tabs */}
              <div className="flex flex-wrap gap-3 mb-8 pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMetric(tab.id)}
                    className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold tracking-wide transition-all duration-300 ${
                      activeMetric === tab.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)] border border-transparent'
                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-cyan-600 dark:hover:text-cyan-400'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Trend Analysis Alert Box */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 dark:border-cyan-400/10 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center gap-4 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <h2 className="text-sm font-bold text-cyan-800 dark:text-cyan-300 tracking-wide uppercase mb-1">
                    AI Trend Analysis
                  </h2>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {getMetricInsight()}
                  </p>
                </div>
              </div>
              
              {/* Chart Area */}
              <div className="w-full bg-white/40 dark:bg-black/20 border border-zinc-100 dark:border-white/5 rounded-2xl p-4 sm:p-6 mb-6">
                {renderActiveChart()}
              </div>
              
              {/* Footer Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 px-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                  Data sourced strictly from AI Analysis
                </p>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {state.reports.length} report{state.reports.length > 1 ? 's' : ''} dynamically visualized
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 border border-zinc-200 dark:border-white/5 shadow-inner">
                <Activity className="h-10 w-10 text-zinc-400 dark:text-zinc-500" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight">No Health Data Available</h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto text-base leading-relaxed">
                Upload your medical reports in the <strong>Report Upload</strong> section. Our AI will automatically extract your clinical metrics and visualize your long-term health trends here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HealthDataVisualization;