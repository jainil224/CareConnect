import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Upload, MapPin, MessageCircle, Home, Moon, Sun, BarChart, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload Report' },
    { path: '/health-data', icon: BarChart, label: 'Health Data' },
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
    <header className="bg-white dark:bg-[#09090b] border-b border-transparent dark:border-zinc-800/80 shadow-lg transition-colors absolute w-full z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">CareConnect</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-8">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'text-primary bg-blue-50 dark:bg-zinc-800/50'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
            
            <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-zinc-800 pl-4 ml-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2 hidden sm:block">
                {currentUser?.email}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;