import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, Activity, Heart, Droplet, PieChart as PieChartIcon, Sparkles } from 'lucide-react';

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

function HealthDataVisualization() {
  const { state } = useHealth();
  const [activeMetric, setActiveMetric] = useState('bloodPressure');
  
  const mergeHealthData = (staticData, dynamicData) => {
    if (!dynamicData || dynamicData.length === 0) return staticData;
    
    const merged = [...staticData];
    dynamicData.forEach(item => {
      const existingIndex = merged.findIndex(d => d.date === item.date);
      if (existingIndex >= 0) {
        merged[existingIndex] = { ...merged[existingIndex], ...item };
      } else {
        merged.push(item);
      }
    });
    
    return merged.sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  const healthData = {
    bloodPressure: mergeHealthData([
      { date: '2025-01', systolic: 120, diastolic: 80, normal: 120 },
      { date: '2025-02', systolic: 118, diastolic: 78, normal: 120 },
      { date: '2025-03', systolic: 122, diastolic: 82, normal: 120 },
      { date: '2025-04', systolic: 125, diastolic: 85, normal: 120 },
      { date: '2025-05', systolic: 119, diastolic: 79, normal: 120 },
      { date: '2025-06', systolic: 121, diastolic: 80, normal: 120 },
    ], state.healthMetrics?.bloodPressure || []),
    glucose: mergeHealthData([
      { date: '2025-01', value: 95, normal: 100 },
      { date: '2025-02', value: 98, normal: 100 },
      { date: '2025-03', value: 102, normal: 100 },
      { date: '2025-04', value: 97, normal: 100 },
      { date: '2025-05', value: 99, normal: 100 },
      { date: '2025-06', value: 96, normal: 100 },
    ], state.healthMetrics?.glucose || []),
    cholesterol: mergeHealthData([
      { date: '2025-01', hdl: 60, ldl: 100, triglycerides: 150 },
      { date: '2025-02', hdl: 62, ldl: 98, triglycerides: 145 },
      { date: '2025-03', hdl: 59, ldl: 103, triglycerides: 155 },
      { date: '2025-04', hdl: 61, ldl: 101, triglycerides: 148 },
      { date: '2025-05', hdl: 63, ldl: 97, triglycerides: 142 },
      { date: '2025-06', hdl: 62, ldl: 99, triglycerides: 146 },
    ], state.healthMetrics?.cholesterol || []),
    weight: mergeHealthData([
      { date: '2025-01', value: 70 },
      { date: '2025-02', value: 69.5 },
      { date: '2025-03', value: 69 },
      { date: '2025-04', value: 68.5 },
      { date: '2025-05', value: 68 },
      { date: '2025-06', value: 67.5 },
    ], state.healthMetrics?.weight || [])
  };
  
  const healthDistribution = [
    { name: 'Excellent', value: 60 },
    { name: 'Good', value: 25 },
    { name: 'Fair', value: 10 },
    { name: 'Poor', value: 5 },
  ];
  
  const renderActiveChart = () => {
    switch (activeMetric) {
      case 'bloodPressure':
        return (
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={healthData.bloodPressure} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(18, 18, 20, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="systolic" stroke="#06b6d4" strokeWidth={3} activeDot={{ r: 8, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="normal" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'glucose':
        return (
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={healthData.glucose} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(18, 18, 20, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              <Area type="monotone" dataKey="normal" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'cholesterol':
        return (
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={healthData.cholesterol} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(18, 18, 20, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="hdl" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ldl" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="triglycerides" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'weight':
        return (
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={healthData.weight} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(18, 18, 20, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={3} activeDot={{ r: 8, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={healthDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={130}
                innerRadius={70}
                fill="#8884d8"
                dataKey="value"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 20;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill={COLORS[index % COLORS.length]} 
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      className="text-xs font-bold drop-shadow-md"
                    >
                      {`${name} ${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                paddingAngle={5}
              >
                {healthDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(18, 18, 20, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };
  
  const getMetricInsight = () => {
    const hasRecentData = state.reports.length > 0;
    const recentDataText = hasRecentData ? " Recent uploaded reports have been integrated into this visualization." : "";
    
    switch (activeMetric) {
      case 'bloodPressure':
        return `Your blood pressure has remained stable over the past 6 months, with values consistently within the normal range.${recentDataText}`;
      case 'glucose':
        return `Your glucose levels have been consistent, with a slight elevation in March that returned to a healthy baseline.${recentDataText}`;
      case 'cholesterol':
        return `Excellent progress! Your HDL (good) cholesterol has improved slightly, while LDL (bad) cholesterol has decreased.${recentDataText}`;
      case 'weight':
        return `You've shown steady progress in weight management, with a gradual and healthy decrease over the past 6 months.${recentDataText}`;
      case 'distribution':
        return `Overall health metrics show exceptional results in 60% of categories, with only 5% in the concerning range requiring attention.${recentDataText}`;
      default:
        return "";
    }
  };

  const tabs = [
    { id: 'bloodPressure', icon: <Heart className="h-4 w-4" />, label: 'Blood Pressure' },
    { id: 'glucose', icon: <Droplet className="h-4 w-4" />, label: 'Glucose' },
    { id: 'cholesterol', icon: <Activity className="h-4 w-4" />, label: 'Cholesterol' },
    { id: 'weight', icon: <TrendingUp className="h-4 w-4" />, label: 'Weight' },
    { id: 'distribution', icon: <PieChartIcon className="h-4 w-4" />, label: 'Health Distribution' },
  ];

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
              Track and analyze your clinical metrics over time
            </p>
          </div>
        </div>

        {/* Main Glassmorphic Container */}
        <div className="bg-white/60 dark:bg-[#121214]/60 backdrop-blur-2xl rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-2xl p-6 sm:p-8 flex flex-col">
          
          {/* Tabs */}
          <div className="flex overflow-x-auto hide-scroll gap-3 mb-8 pb-2">
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
              Data scope: January - June 2025
            </p>
            {state.reports.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {state.reports.length} report{state.reports.length > 1 ? 's' : ''} successfully synced
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default HealthDataVisualization;