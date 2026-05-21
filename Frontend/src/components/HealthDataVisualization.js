import React, { useState, useMemo, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, Activity, Heart, Droplet, PieChart as PieChartIcon, Sparkles } from 'lucide-react';

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

// DUMMY DATA FOR FALLBACK
const DUMMY_METRICS = {
  'Blood Pressure': [
    { date: '2025-01', systolic: 120, diastolic: 80 },
    { date: '2025-02', systolic: 118, diastolic: 78 },
    { date: '2025-03', systolic: 122, diastolic: 82 },
    { date: '2025-04', systolic: 125, diastolic: 85 },
  ],
  'Glucose': [
    { date: '2025-01', value: 95 },
    { date: '2025-02', value: 98 },
    { date: '2025-03', value: 102 },
    { date: '2025-04', value: 97 },
  ],
  'Cholesterol': [
    { date: '2025-01', value: 180 },
    { date: '2025-02', value: 175 },
    { date: '2025-03', value: 190 },
    { date: '2025-04', value: 160 },
  ]
};

function HealthDataVisualization() {
  const { state } = useHealth();
  const [activeMetric, setActiveMetric] = useState(null);
  
  const hasRealData = state.reports && state.reports.length > 0;

  // Extract all valid dynamic metrics from state.healthMetrics
  const dynamicMetrics = useMemo(() => {
    const valid = {};
    if (state.healthMetrics) {
      Object.entries(state.healthMetrics).forEach(([key, dataArray]) => {
        if (Array.isArray(dataArray) && dataArray.length > 0) {
          // Sort by date
          valid[key] = [...dataArray].sort((a, b) => new Date(a.date) - new Date(b.date));
        }
      });
    }
    return valid;
  }, [state.healthMetrics]);

  const displayMetrics = hasRealData && Object.keys(dynamicMetrics).length > 0 ? dynamicMetrics : DUMMY_METRICS;
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
            <Tooltip contentStyle={{ backgroundColor: 'rgba(18, 18, 20, 0.9)', borderRadius: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
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
            <Tooltip contentStyle={{ backgroundColor: 'rgba(18, 18, 20, 0.9)', borderRadius: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line type="monotone" dataKey="systolic" stroke="#06b6d4" strokeWidth={3} />
            <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={3} />
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
          <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
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
            <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30">
              <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
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
              {hasRealData ? "Data sourced strictly from AI Analysis" : "Data scope: Demo Placeholder"}
            </p>
            {hasRealData && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {state.reports.length} report{state.reports.length > 1 ? 's' : ''} dynamically visualized
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default HealthDataVisualization;