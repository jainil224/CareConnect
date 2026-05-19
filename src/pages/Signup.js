import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, User, Activity } from "lucide-react";
import toast from "react-hot-toast";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setLoading(true);
      await signup(formData.email, formData.password);
      toast.success("Account created securely");
      navigate("/"); // Redirect to dashboard
    } catch (error) {
      toast.error(error.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030b14] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Futuristic Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0a1526]/60 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(14,165,233,0.15)] transition-all duration-500 hover:shadow-[0_0_60px_rgba(14,165,233,0.2)]">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/50 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <Activity className="text-cyan-400 w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Join CareConnect</h2>
            <p className="text-blue-200/60 mt-2 text-sm font-medium">Create your portal access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-blue-200/80 text-sm font-medium mb-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-blue-400/60 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#030b14]/50 border border-blue-500/30 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-blue-50 transition-all placeholder:text-blue-400/30"
                  placeholder="Dr. Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-blue-200/80 text-sm font-medium mb-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-400/60 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#030b14]/50 border border-blue-500/30 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-blue-50 transition-all placeholder:text-blue-400/30"
                  placeholder="doctor@hospital.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-blue-200/80 text-sm font-medium mb-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-400/60 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full pl-10 pr-12 py-2.5 bg-[#030b14]/50 border border-blue-500/30 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-blue-50 transition-all placeholder:text-blue-400/30"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-blue-400/60 hover:text-cyan-400 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-blue-400/60 hover:text-cyan-400 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-blue-200/80 text-sm font-medium mb-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-400/60 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#030b14]/50 border border-blue-500/30 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-blue-50 transition-all placeholder:text-blue-400/30"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white rounded-lg font-medium shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all hover:shadow-[0_0_25px_rgba(14,165,233,0.6)] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-blue-200/70 text-sm">
            Already have access?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
