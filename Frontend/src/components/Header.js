import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Upload, MapPin, MessageCircle, Home, Moon, Sun, BarChart, LogOut, User, HeartPulse } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload Report' },
    { path: '/health-data', icon: BarChart, label: 'Health Data' },
    { path: '/ecg', icon: HeartPulse, label: 'ECG Prediction' },
    { path: '/facilities', icon: MapPin, label: 'Find Facilities' },
    { path: '/chat', icon: MessageCircle, label: 'AI Assistant' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-500 bg-white/80 dark:bg-[#060608]/70 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_40px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-2 group">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-all duration-300">
            CareConnect
          </h1>
          <div className="w-4 h-4 bg-emerald-400"></div>
        </Link>
        
        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-2 bg-zinc-100/50 dark:bg-black/40 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-white/5 shadow-inner">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : ''}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Actions / User Profile Section */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 bg-zinc-100/80 dark:bg-black/40 px-3 py-1.5 rounded-full border border-zinc-200/50 dark:border-white/5 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide pr-2">
              {currentUser?.email?.split('@')[0] || 'User'}
            </span>
          </div>

          <div className="flex items-center space-x-2 border-l border-zinc-200 dark:border-zinc-800/80 pl-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-zinc-500 dark:text-zinc-400 bg-zinc-100/50 dark:bg-black/30 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-cyan-500 dark:hover:text-cyan-400 border border-transparent dark:border-white/5 transition-all duration-300 shadow-sm"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl text-zinc-500 dark:text-zinc-400 bg-zinc-100/50 dark:bg-black/30 hover:bg-rose-100 dark:hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 border border-transparent dark:border-white/5 hover:border-rose-500/20 transition-all duration-300 shadow-sm"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;