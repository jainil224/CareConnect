import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Circle, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      toast.success("Authentication successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast.success("Welcome to CareConnect");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main 
      className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4 text-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* LEFT COLUMN: HERO VIDEO */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" type="video/mp4" />
        </video>
        
        {/* Hero Content */}
        <motion.div 
          className="z-10 w-full max-w-xs space-y-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
          }}
        >
          {/* Brand */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
            className="flex items-center space-x-2"
          >
            <Circle className="w-5 h-5 fill-[#39FF88] text-[#39FF88]" />
            <span className="text-xl font-semibold tracking-tight">CareConnect</span>
          </motion.div>
          
          {/* Heading */}
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
            <h1 className="text-4xl font-medium tracking-tight whitespace-nowrap">Join CareConnect</h1>
            <p className="text-white/60 text-sm leading-relaxed mt-2 pr-4">
              Follow these 3 quick phases to access your medical dashboard.
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
            className="space-y-3"
          >
            <StepItem number={1} text="Authenticate your credentials" active={true} />
            <StepItem number={2} text="Upload patient ECG reports" />
            <StepItem number={3} text="Generate AI diagnostics" />
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT COLUMN: FORM */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
        >
          <div>
            <h2 className="text-3xl font-medium tracking-tight text-white">Welcome Back</h2>
            <p className="text-white/40 text-sm mt-2">Input your credentials to continue your journey.</p>
          </div>

          {/* Social Logins */}
          <div className="w-full">
            <SocialButton 
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              } 
              label="Google" 
              onClick={handleGoogleSignIn}
            />
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 bg-black px-4 text-xs font-medium text-white/40 uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <InputGroup 
              label="Email" 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-white">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--color-brand-gray)] border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-white/40 hover:text-white/80 transition-colors" />
                  ) : (
                    <Eye className="w-5 h-5 text-white/40 hover:text-white/80 transition-colors" />
                  )}
                </button>
              </div>
              <p className="text-xs text-white/40 mt-1 pl-1">Requires at least 8 symbols.</p>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] mt-6 transition-all disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : "Sign In"}
            </button>
          </form>

          <div className="text-center">
            <Link to="/signup" className="text-sm text-white/60 hover:text-white transition-colors">
              Don't have a profile? Sign up
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Reusable Subcomponents
// ---------------------------------------------------------------------------

function StepItem({ number, text, active = false }) {
  return (
    <div className={`flex items-center space-x-3 p-3 rounded-xl transition-colors duration-300 ${
      active ? "bg-white text-black border border-white" : "bg-[var(--color-brand-gray)] text-white border border-transparent"
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        active ? "bg-black text-white" : "bg-white/10 text-white/40"
      }`}>
        {number}
      </div>
      <span className={`text-sm font-medium ${active ? "text-black" : "text-white/60"}`}>
        {text}
      </span>
    </div>
  );
}

function SocialButton({ icon, label, onClick }) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className="flex items-center justify-center space-x-2 w-full h-12 bg-black border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-white"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function InputGroup({ label, type, placeholder, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-white block">{label}</label>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-[var(--color-brand-gray)] border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all"
      />
    </div>
  );
}
