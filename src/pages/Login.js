import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// New specialized auth components
import AuthLayout from "../components/auth/AuthLayout";
import HeroSection from "../components/auth/HeroSection";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      toast.success("Authentication successful");
      navigate("/"); // Redirect to dashboard
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
      navigate("/");
    } catch (error) {
      toast.error("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      leftContent={<HeroSection />}
      rightContent={
        <LoginForm 
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
          handleGoogleSignIn={handleGoogleSignIn}
          loading={loading}
        />
      }
    />
  );
}
