import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LoginForm({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  handleLogin, 
  handleGoogleSignIn, 
  loading 
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      className="bg-[#0a1526]/60 backdrop-blur-2xl border border-blue-500/20 rounded-2xl p-8 sm:p-10 shadow-[0_0_40px_rgba(14,165,233,0.1)] w-full"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h2>
        <p className="text-blue-200/60 text-sm">Sign in to your CareConnect account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-blue-200/80 text-xs uppercase tracking-wider font-semibold mb-2">Email address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-blue-400/50 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="email"
              required
              className="w-full pl-11 pr-4 py-3.5 bg-[#030b14]/50 border border-blue-500/20 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-blue-50 transition-all placeholder:text-blue-400/30 shadow-inner"
              placeholder="you@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-blue-200/80 text-xs uppercase tracking-wider font-semibold mb-2">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-blue-400/50 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full pl-11 pr-12 py-3.5 bg-[#030b14]/50 border border-blue-500/20 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-blue-50 transition-all placeholder:text-blue-400/30 shadow-inner"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-blue-400/50 hover:text-cyan-400 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-blue-400/50 hover:text-cyan-400 transition-colors" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-blue-200/70 hover:text-cyan-400 cursor-pointer transition-colors group">
            <div className="relative flex items-center justify-center w-4 h-4 mr-2 border border-blue-500/40 rounded bg-[#030b14] group-hover:border-cyan-400 transition-colors">
              <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer peer" />
              <div className="w-2 h-2 rounded-sm bg-cyan-400 scale-0 peer-checked:scale-100 transition-transform"></div>
            </div>
            <span>Remember me</span>
          </label>
          <a href="#" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Forgot password?</a>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex justify-center items-center group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin text-white" />
          ) : (
            <>
              Access Dashboard
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-blue-500/20"></div>
          <span className="flex-shrink-0 mx-4 text-blue-200/40 text-xs uppercase tracking-widest font-semibold">Or continue with</span>
          <div className="flex-grow border-t border-blue-500/20"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-blue-500/20 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
      </form>

      <p className="mt-8 text-center text-blue-200/60 text-sm">
        Don't have an account?{' '}
        <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors underline decoration-cyan-400/30 underline-offset-4">
          Sign up for free
        </Link>
      </p>
    </motion.div>
  );
}
