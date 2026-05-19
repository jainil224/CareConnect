import React, { useState, useEffect, useRef } from 'react';
import { useHealth } from '../context/HealthContext';
import { useTheme } from '../context/ThemeContext';
import { Activity, Heart, Brain, TrendingUp, Users, Calendar, MessageSquare, Upload, Search, Info, AlertTriangle, CheckCircle, ArrowUpRight, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import EmergencyButton from './EmergencyButton';

// Import custom organ SVGs
import HeartSVG from './HeartSVG';
import KidneySVG from './KidneySVG';
import BrainSVG from './BrainSVG';

// Reusable GlowingCard component for high-fidelity border/background spotlight hover effect
const GlowingCard = ({ children, className = '', contentClassName = '', glowColor = '#3b82f6', borderRadius = '28px', style = {}, ...props }) => {
  const cardRef = useRef(null);
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const cardRect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - cardRect.left;
    const y = e.clientY - cardRect.top;
    cardRef.current.style.setProperty('--x', `${x}px`);
    cardRef.current.style.setProperty('--y', `${y}px`);
  };

  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
  };

  const rgbColor = hexToRgb(glowColor);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden bg-white border border-gray-100/50 shadow-sm transition-shadow duration-300 hover:shadow-md ${className}`}
      style={{
        borderRadius,
        '--glow-color': glowColor,
        '--glow-bg': `rgba(${rgbColor}, 0.05)`,
        '--glow-opacity': opacity,
        ...style
      }}
      {...props}
    >
      {/* Background Glow Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: 'var(--glow-opacity)',
          background: 'radial-gradient(circle 200px at var(--x, 0px) var(--y, 0px), var(--glow-bg), transparent 80%)'
        }}
      />
      {/* Border Glow Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-[inherit]"
        style={{
          opacity: 'var(--glow-opacity)',
          padding: '1.5px',
          background: 'radial-gradient(circle 130px at var(--x, 0px) var(--y, 0px), var(--glow-color), transparent 80%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}
      />
      {/* Content wrapper */}
      <div className={`relative z-10 h-full flex flex-col justify-between ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

// Dynamic health data based on uploaded reports
const getHealthTrendData = (reports, healthMetrics) => {
  const baseData = [
    { name: 'Jan', value: 85 },
    { name: 'Feb', value: 88 },
    { name: 'Mar', value: 82 },
    { name: 'Apr', value: 90 },
    { name: 'May', value: 87 },
    { name: 'Jun', value: 92 }
  ];
  
  if (reports.length > 0) {
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' });
    const latestScore = calculateHealthScoreFromMetrics(healthMetrics);
    baseData.push({ name: currentMonth, value: latestScore });
  }
  
  return baseData;
};

const calculateHealthScoreFromMetrics = (metrics) => {
  let score = 85;
  
  if (metrics.bloodPressure?.length > 0) {
    const latest = metrics.bloodPressure[metrics.bloodPressure.length - 1];
    if (latest.systolic <= 120 && latest.diastolic <= 80) score += 5;
    else if (latest.systolic > 140 || latest.diastolic > 90) score -= 10;
  }
  
  if (metrics.glucose?.length > 0) {
    const latest = metrics.glucose[metrics.glucose.length - 1];
    if (latest.value <= 100) score += 3;
    else if (latest.value > 125) score -= 8;
  }
  
  return Math.min(Math.max(score, 0), 100);
};

const appointmentData = [
  { name: 'Mon', appointments: 4 },
  { name: 'Tue', appointments: 6 },
  { name: 'Wed', appointments: 8 },
  { name: 'Thu', appointments: 5 },
  { name: 'Fri', appointments: 7 },
  { name: 'Sat', appointments: 3 },
  { name: 'Sun', appointments: 2 }
];

function Dashboard() {
  const { state } = useHealth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedChart, setSelectedChart] = useState(null);
  const [healthScore, setHealthScore] = useState(state.healthScore || 92);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [healthData, setHealthData] = useState(getHealthTrendData(state.reports, state.healthMetrics));
  const [hoveredStat, setHoveredStat] = useState(null);
  const [activeOrgan, setActiveOrgan] = useState('heart');
  
  useEffect(() => {
    setHealthData(getHealthTrendData(state.reports, state.healthMetrics));
    setHealthScore(state.healthScore || 92);
  }, [state.reports, state.healthMetrics, state.healthScore]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedScore(prev => {
        if (prev < healthScore) {
          return Math.min(prev + 2, healthScore);
        }
        return prev;
      });
    }, 50);
    
    if (animatedScore >= healthScore) {
      clearInterval(timer);
    }
    
    return () => clearInterval(timer);
  }, [healthScore, animatedScore]);

  const stats = [
    {
      title: 'Health Score',
      value: `${animatedScore}%`,
      change: '+5%',
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      insight: 'Your health score improved due to regular exercise and better sleep patterns.',
      trend: 'improving',
      riskLevel: 'low'
    },
    {
      title: 'Active Reports',
      value: state.reports.length.toString(),
      change: '+2',
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      insight: 'Recent blood work shows improved cholesterol levels.',
      trend: 'stable',
      riskLevel: 'low'
    },
    {
      title: 'Appointments',
      value: state.appointments.length.toString(),
      change: '+3',
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      insight: 'Next cardiology checkup scheduled. All vitals within normal range.',
      trend: 'stable',
      riskLevel: 'low'
    }
  ];

  const organMap = {
    heart:  { component: <HeartSVG  />, color: '#ef4444', label: 'Heart', emoji: '❤️'  },
    kidney: { component: <KidneySVG />, color: '#c084fc', label: 'Kidney', emoji: '🟣' },
    brain:  { component: <BrainSVG  />, color: '#94a3b8', label: 'Brain', emoji: '🧠'  },
  };

  const getInsightIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const handleChartClick = (data, chartType) => {
    setSelectedChart({ data, chartType, timestamp: Date.now() });
  };

  const getChartInsight = (data, chartType) => {
    if (chartType === 'health') {
      const trend = data.value > 85 ? 'excellent' : data.value > 70 ? 'good' : 'needs attention';
      return `${data.name}: Health score is ${trend}. ${data.value > 85 ? 'Keep up the great work!' : 'Consider lifestyle improvements.'}`;
    } else {
      const trend = data.appointments > 5 ? 'busy' : data.appointments > 3 ? 'moderate' : 'light';
      return `${data.name}: ${trend} schedule with ${data.appointments} appointments. ${data.appointments > 6 ? 'Consider spacing out appointments.' : 'Good balance.'}`;
    }
  };

  const CustomTooltip = ({ active, payload, label, chartType }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600 font-bold">
            {chartType === 'health' ? `Health Score: ${payload[0].value}%` : `Appointments: ${payload[0].value}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getChartInsight(data, chartType)}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            Click for detailed analysis
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 space-y-6 text-[#111827] bg-[#f5f7fa] p-4 sm:p-6 lg:p-8 rounded-3xl shadow-inner transition-colors duration-300">
      
      {/* Inline animations styling */}
      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ecgScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-300px, 0, 0); }
        }
        .animate-ecg-scroll {
          animation: ecgScroll 3s linear infinite;
        }
        @keyframes rrScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-60px, 0, 0); }
        }
        .animate-rr-scroll {
          animation: rrScroll 2s linear infinite;
        }
        @keyframes glucoseScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-600px, 0, 0); }
        }
        .animate-glucose-scroll {
          animation: glucoseScroll 8s linear infinite;
        }
        @keyframes bloodScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-600px, 0, 0); }
        }
        .animate-blood-scroll {
          animation: bloodScroll 8s linear infinite;
        }
      `}</style>

      {/* 1. HERO SECTION (100% UNCHANGED) */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1200&h=300&fit=crop&crop=center" 
          alt="Medical Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="relative z-10 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Health Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Welcome back! Here's your health overview for {currentTime.toLocaleDateString()}
            </p>
          </div>
          <div className="text-left lg:text-right">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div className="flex items-center justify-center lg:justify-end">
            <EmergencyButton />
          </div>
        </div>
      </div>



      {/* 3. HEALTH METRICS SUMMARY TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const glowColor = stat.title === 'Health Score' ? '#ef4444' : stat.title === 'Active Reports' ? '#3b82f6' : '#10b981';
          return (
            <div 
              key={index}
              className="relative"
              onMouseEnter={() => setHoveredStat(index)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <GlowingCard 
                className="p-5 cursor-pointer hover:-translate-y-0.5"
                glowColor={glowColor}
                borderRadius="28px"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1 transition-all duration-300 group-hover:scale-105 origin-left">
                      {stat.value}
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-1">{stat.change} from last week</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </GlowingCard>
              
              {hoveredStat === index && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-gray-900 text-white rounded-xl shadow-xl z-30 transform transition-all duration-200 opacity-100">
                  <div className="flex items-start space-x-2">
                    {getInsightIcon(stat.riskLevel)}
                    <div>
                      <p className="text-xs font-bold text-blue-400 mb-1">AI Health Insight</p>
                      <p className="text-xs text-gray-200 leading-relaxed">{stat.insight}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-600 text-green-50">
                          {stat.trend}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-700 text-gray-200">
                          {stat.riskLevel} risk
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. HEALTH OVERVIEW TITLE & PERIOD SELECTORS */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Health Overview</h2>
        <div className="flex space-x-2">
          <select className="bg-white border-none shadow-sm rounded-xl px-4 py-2 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all hover:bg-gray-50">
            <option>24 Hrs</option>
            <option>12 Hrs</option>
            <option>1 Hr</option>
          </select>
          <select className="bg-white border-none shadow-sm rounded-xl px-4 py-2 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all hover:bg-gray-50">
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
        </div>
      </div>

      {/* 5. MAIN 3-COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Vitals Charts */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Heartbeat Card */}
          <GlowingCard className="p-6 flex-1" glowColor="#10B981" borderRadius="28px">
            <div>
              <span className="absolute top-5 right-5 bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                GOOD
              </span>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Heartbeat</p>
              <div className="flex items-baseline space-x-1 mt-2">
                <span className="text-4xl font-black text-gray-800 tracking-tight">83</span>
                <span className="text-sm font-semibold text-gray-500">bpm</span>
              </div>
            </div>
            {/* Heartbeat ECG wave chart */}
            <div className="h-24 mt-4 flex items-end">
              <svg className="w-full h-full text-green-500 overflow-hidden" viewBox="0 0 300 80" fill="none" preserveAspectRatio="none">
                <g className="animate-ecg-scroll">
                  <path 
                    d="M0,40 L60,40 L70,30 L80,50 L90,20 L100,60 L110,38 L120,42 L130,40 L190,40 L200,25 L210,55 L220,10 L230,70 L240,35 L250,45 L260,40 L300,40 L360,40 L370,30 L380,50 L390,20 L400,60 L410,38 L420,42 L430,40 L490,40 L500,25 L510,55 L520,10 L530,70 L540,35 L550,45 L560,40 L600,40" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </g>
              </svg>
            </div>
          </GlowingCard>

          {/* R-R Interval & Blood Status Row */}
          <div className="grid grid-cols-2 gap-4 mt-4 lg:mt-0">
            {/* R-R Interval Card */}
            <GlowingCard className="p-5 h-40" glowColor="#3b82f6" borderRadius="28px">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">R-R Interval</p>
                <div className="flex items-baseline space-x-1 mt-1.5">
                  <span className="text-2xl font-black text-gray-800">0.8</span>
                  <span className="text-xs font-semibold text-gray-500">sec</span>
                </div>
              </div>
              <div className="h-12">
                <svg className="w-full h-full text-blue-500 overflow-hidden" viewBox="0 0 150 40" fill="none" preserveAspectRatio="none">
                  <g className="animate-rr-scroll">
                    <path d="M0,25 Q15,5 30,25 T60,25 T90,25 T120,25 T150,25 T180,25 T210,25" stroke="currentColor" strokeWidth="2.5" fill="none" />
                  </g>
                </svg>
              </div>
            </GlowingCard>

            {/* Blood Status Card */}
            <GlowingCard className="p-5 h-40" glowColor="#ef4444" borderRadius="28px">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blood Status</p>
                <div className="flex items-baseline space-x-0.5 mt-1.5">
                  <span className="text-2xl font-black text-gray-800">115/70</span>
                  <span className="text-[10px] font-semibold text-gray-500">mmHg</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 mb-1">
                  <span>Vitals</span>
                  <span className="text-green-600">Normal</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
            </GlowingCard>
          </div>
        </div>

        {/* CENTER COLUMN: Interactive Organ Visualizer */}
        <GlowingCard 
          className="p-6 min-h-[350px]" 
          contentClassName="items-center" 
          glowColor={organMap[activeOrgan].color} 
          borderRadius="28px"
        >
          {/* Radial color backdrop glow */}
          <div 
            className="absolute w-44 h-44 rounded-full blur-[60px] opacity-20 pointer-events-none transition-all duration-700"
            style={{ 
              backgroundColor: organMap[activeOrgan].color,
              top: '25%',
              left: '25%',
            }}
          />

          <div className="w-full text-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Visualizer</span>
            <h3 className="text-lg font-bold text-gray-800 mt-1">{organMap[activeOrgan].label} Health</h3>
          </div>

          {/* Centered Organ Component with Switcher Animation */}
          <div 
            className="w-full flex justify-center items-center h-48 py-3 organ-display"
            key={activeOrgan}
            style={{ animation: 'fadeScaleIn 0.4s ease-out forwards' }}
          >
            {organMap[activeOrgan].component}
          </div>

          {/* Organ selector tabs */}
          <div className="w-full grid grid-cols-3 gap-1.5 mt-3">
            {Object.entries(organMap).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setActiveOrgan(key)}
                className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-[10px] font-extrabold transition-all duration-300 ${
                  activeOrgan === key 
                    ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm scale-[1.03]' 
                    : 'bg-gray-55 hover:bg-gray-50 text-gray-400 border-gray-100'
                }`}
                style={activeOrgan === key ? { borderColor: val.color, color: val.color } : {}}
              >
                <span className="text-lg mb-1">{val.emoji}</span>
                <span>{val.label}</span>
              </button>
            ))}
          </div>
        </GlowingCard>

        {/* RIGHT COLUMN: Vitals Cards */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Glucose Level Card */}
          <GlowingCard className="p-6 flex-1" glowColor="#F59E0B" borderRadius="28px">
            <div>
              <span className="absolute top-5 right-5 bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                250ml
              </span>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Glucose Level</p>
              <div className="flex items-baseline space-x-1 mt-2">
                <span className="text-4xl font-black text-gray-800 tracking-tight">230</span>
                <span className="text-sm font-semibold text-gray-500">/ml</span>
              </div>
            </div>
            {/* Trending Line Graph */}
            <div className="h-24 mt-4 flex items-end">
              <svg className="w-full h-full text-amber-500 overflow-hidden" viewBox="0 0 300 80" fill="none" preserveAspectRatio="none">
                <g className="animate-glucose-scroll">
                  <path 
                    d="M0,60 L50,55 L100,68 L150,45 L200,35 L250,28 L300,20 L350,28 L400,35 L450,45 L500,68 L550,55 L600,60 L650,55 L700,68 L750,45 L800,35 L850,28 L900,20 L950,28 L1000,35 L1050,45 L1100,68 L1150,55 L1200,60" 
                    stroke="currentColor" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />
                </g>
              </svg>
            </div>
          </GlowingCard>

          {/* Blood Count Card */}
          <GlowingCard className="p-6 flex-1 mt-6 lg:mt-0" glowColor="#3B82F6" borderRadius="28px">
            <div>
              <span className="absolute top-5 right-5 bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                Normal
              </span>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blood Count</p>
              <div className="flex items-baseline space-x-1 mt-2">
                <span className="text-4xl font-black text-gray-800 tracking-tight">80-90</span>
                <span className="text-xs font-bold text-gray-400">k/µL</span>
              </div>
            </div>
            {/* Blue Area Chart */}
            <div className="h-24 mt-4 flex items-end">
              <svg className="w-full h-full text-blue-500 overflow-hidden" viewBox="0 0 300 80" fill="none" preserveAspectRatio="none">
                <g className="animate-blood-scroll">
                  <path 
                    d="M0,80 L0,50 C50,42 100,60 150,38 C200,45 250,28 300,20 C350,28 400,45 450,38 C500,60 550,42 600,50 C650,42 700,60 750,38 C800,45 850,28 900,20 C950,28 1000,45 1050,38 C1100,60 1150,42 1200,50 L1200,80 Z" 
                    fill="rgba(59, 130, 246, 0.08)" 
                  />
                  <path 
                    d="M0,50 C50,42 100,60 150,38 C200,45 250,28 300,20 C350,28 400,45 450,38 C500,60 550,42 600,50 C650,42 700,60 750,38 C800,45 850,28 900,20 C950,28 1000,45 1050,38 C1100,60 1150,42 1200,50" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                </g>
              </svg>
            </div>
          </GlowingCard>
        </div>
      </div>



      {/* 7. QUICK ACTION MODULES (Restyled to modern white cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          { path: '/ecg', icon: Heart, title: 'ECG Prediction', subtitle: 'AI Heart Analysis', accent: 'bg-cyan-500' },
          { path: '/chat', icon: MessageSquare, title: 'AI Assistant', subtitle: 'Medical Guidance', accent: 'bg-blue-500' },
          { path: '/upload', icon: Upload, title: 'Upload Reports', subtitle: 'Analyze Vitals', accent: 'bg-green-500' },
          { path: '/health-data', icon: TrendingUp, title: 'Health Data', subtitle: 'Track Metrics', accent: 'bg-amber-500' },
          { path: '/facilities', icon: Search, title: 'Find Healthcare', subtitle: 'Search Hospitals', accent: 'bg-purple-500' },
        ].map((action, idx) => {
          const ActionIcon = action.icon;
          return (
            <div 
              key={idx}
              onClick={() => navigate(action.path)}
              className="group relative bg-white p-5 rounded-2xl shadow-sm border border-gray-50 cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-1.5 h-full ${action.accent}`} />
              <div className="relative z-10 pl-1.5">
                <ActionIcon className="h-6 w-6 mb-3 text-gray-600 group-hover:text-blue-600 transition-colors group-hover:scale-110 duration-300" />
                <h4 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{action.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{action.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>





      {/* CHART DETAILS MODAL */}
      {selectedChart && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 tracking-tight">Chart Details</h3>
              <button 
                onClick={() => setSelectedChart(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center font-bold text-sm transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="p-4.5 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="font-bold text-blue-900 text-sm">Data Insight</span>
                </div>
                <p className="text-blue-800 text-xs leading-relaxed">
                  {getChartInsight(selectedChart.data, selectedChart.chartType)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-2xl font-black text-gray-800">
                    {selectedChart.chartType === 'health' ? `${selectedChart.data.value}%` : selectedChart.data.appointments}
                  </p>
                  <p className="text-xs font-semibold text-gray-400 mt-1">
                    {selectedChart.chartType === 'health' ? 'Health Score' : 'Appointments'}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-2xl font-bold text-green-600">
                    {selectedChart.chartType === 'health' ? '↗' : selectedChart.data.appointments > 5 ? '⚠' : '✓'}
                  </p>
                  <p className="text-xs font-semibold text-gray-400 mt-1">
                    {selectedChart.chartType === 'health' ? 'Trending Up' : selectedChart.data.appointments > 5 ? 'Busy Day' : 'Normal'}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-bold text-gray-800 text-sm mb-2.5">Recommendations:</h4>
                <ul className="text-xs text-gray-500 space-y-2">
                  {selectedChart.chartType === 'health' ? (
                    selectedChart.data.value > 85 ? [
                      '• Continue current health routine',
                      '• Consider sharing tips with family',
                      '• Schedule preventive checkups'
                    ] : [
                      '• Focus on sleep and nutrition',
                      '• Increase physical activity',
                      '• Consult healthcare provider'
                    ]
                  ) : (
                    selectedChart.data.appointments > 5 ? [
                      '• Consider rescheduling non-urgent appointments',
                      '• Plan rest time between appointments',
                      '• Prepare questions in advance'
                    ] : [
                      '• Good appointment balance',
                      '• Use free time for self-care',
                      '• Stay consistent with routine'
                    ]
                  ).map((rec, index) => (
                    <li key={index} className="leading-relaxed">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
