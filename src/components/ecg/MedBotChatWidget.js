import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Minimize2 } from 'lucide-react';

// ── 3D Doctor Robot SVG ─────────────────────────────────────────────────────
function MedBotAvatar({ size = 80, animate = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 8px 24px rgba(0,210,255,0.35))' }}
    >
      <defs>
        {/* Head gradient - white glossy */}
        <radialGradient id="headGrad" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#dce8f0" />
          <stop offset="100%" stopColor="#b0c8d8" />
        </radialGradient>
        {/* Screen black */}
        <radialGradient id="screenGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#0d1117" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        {/* Coat gradient */}
        <linearGradient id="coatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d0dfe8" />
        </linearGradient>
        {/* Cyan glow */}
        <filter id="cyanGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {/* Ear gradient */}
        <radialGradient id="earGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#5ee8ff" />
          <stop offset="100%" stopColor="#0099cc" />
        </radialGradient>
        {/* Body sheen */}
        <radialGradient id="bodySheen" cx="35%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Antenna ─────────────────────────────────────────── */}
      <rect x="97" y="4" width="6" height="28" rx="3" fill="#c8dde8" />
      {/* Antenna ball */}
      <circle cx="100" cy="4" r="8" fill="url(#earGrad)" filter="url(#cyanGlow)" />
      <circle cx="98" cy="2" r="3" fill="#aef5ff" opacity="0.8" />

      {/* ── Left Ear ─────────────────────────────────────────── */}
      <ellipse cx="44" cy="90" rx="14" ry="18" fill="url(#earGrad)" />
      <ellipse cx="44" cy="90" rx="8" ry="11" fill="#003355" />
      <ellipse cx="43" cy="87" rx="3" ry="4" fill="#00d4ff" opacity="0.7" filter="url(#cyanGlow)" />

      {/* ── Right Ear ─────────────────────────────────────────── */}
      <ellipse cx="156" cy="90" rx="14" ry="18" fill="url(#earGrad)" />
      <ellipse cx="156" cy="90" rx="8" ry="11" fill="#003355" />
      <ellipse cx="155" cy="87" rx="3" ry="4" fill="#00d4ff" opacity="0.7" filter="url(#cyanGlow)" />

      {/* ── Head ─────────────────────────────────────────────── */}
      <rect x="48" y="30" width="104" height="105" rx="38" fill="url(#headGrad)" />
      {/* Head highlight */}
      <ellipse cx="78" cy="48" rx="22" ry="14" fill="white" opacity="0.45" />

      {/* ── Screen / Face ───────────────────────────────────── */}
      <rect x="60" y="52" width="80" height="62" rx="18" fill="url(#screenGrad)" />
      {/* Screen inner border glow */}
      <rect x="60" y="52" width="80" height="62" rx="18" fill="none"
        stroke="#00d4ff" strokeWidth="1.5" opacity="0.5" />

      {/* Smile eyes - closed happy arcs */}
      <path d="M78 82 Q83 76 88 82" stroke="#00ffee" strokeWidth="3.5"
        strokeLinecap="round" fill="none" filter="url(#cyanGlow)"
        className={animate ? 'ecg-bot-blink' : ''} />
      <path d="M112 82 Q117 76 122 82" stroke="#00ffee" strokeWidth="3.5"
        strokeLinecap="round" fill="none" filter="url(#cyanGlow)"
        className={animate ? 'ecg-bot-blink' : ''} />

      {/* Smile mouth */}
      <path d="M83 96 Q100 110 117 96" stroke="#00ffee" strokeWidth="3.5"
        strokeLinecap="round" fill="none" filter="url(#cyanGlow)" />

      {/* ── Neck ─────────────────────────────────────────────── */}
      <rect x="88" y="133" width="24" height="16" rx="6" fill="#c8dde8" />

      {/* ── Body / Coat ───────────────────────────────────────── */}
      <path d="M30 220 Q28 165 50 152 L72 145 L100 155 L128 145 L150 152 Q172 165 170 220 Z"
        fill="url(#coatGrad)" />
      {/* Coat sheen */}
      <path d="M30 220 Q28 165 50 152 L72 145 L100 155 L128 145 L150 152 Q172 165 170 220 Z"
        fill="url(#bodySheen)" />

      {/* ── Shirt & Tie ──────────────────────────────────────── */}
      {/* Light blue shirt showing through coat collar */}
      <path d="M82 145 L100 155 L118 145 L110 148 L100 162 L90 148 Z" fill="#7bbfda" />
      {/* Tie - dark navy */}
      <path d="M97 148 L103 148 L106 175 L100 180 L94 175 Z" fill="#1a2d5a" />
      <path d="M95 148 L105 148 L103 155 L100 158 L97 155 Z" fill="#243672" />

      {/* ── Left Lapel ──────────────────────────────────────── */}
      <path d="M50 152 L72 145 L90 148 L82 168 Q60 165 50 152 Z"
        fill="#f0f6fa" stroke="#dde8ef" strokeWidth="0.5" />
      {/* Right Lapel */}
      <path d="M150 152 L128 145 L110 148 L118 168 Q140 165 150 152 Z"
        fill="#f0f6fa" stroke="#dde8ef" strokeWidth="0.5" />

      {/* ── Arms (folded) ────────────────────────────────────── */}
      {/* Left arm */}
      <path d="M30 220 Q22 198 30 178 Q38 162 60 160 L72 165 L62 188 Q48 195 42 215 Z"
        fill="url(#coatGrad)" stroke="#ccdde8" strokeWidth="0.5" />
      {/* Right arm */}
      <path d="M170 220 Q178 198 170 178 Q162 162 140 160 L128 165 L138 188 Q152 195 158 215 Z"
        fill="url(#coatGrad)" stroke="#ccdde8" strokeWidth="0.5" />
      {/* Folded hands area */}
      <ellipse cx="100" cy="200" rx="42" ry="16" fill="#e8f2f8" stroke="#ccdde6" strokeWidth="0.5" />
      <ellipse cx="100" cy="200" rx="38" ry="12" fill="url(#coatGrad)" />

      {/* ── Stethoscope ─────────────────────────────────────── */}
      {/* Tube around neck */}
      <path d="M88 148 Q72 150 66 162 Q60 175 68 185 Q76 195 82 195"
        stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M112 148 Q128 150 118 168"
        stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Chest piece */}
      <circle cx="119" cy="172" r="7" fill="#1a1a1a" />
      <circle cx="119" cy="172" r="4.5" fill="#333" />
      <circle cx="119" cy="172" r="2.5" fill="#555" />
      {/* Earpieces */}
      <circle cx="83" cy="196" r="5" fill="#1a1a1a" />
      <circle cx="83" cy="196" r="3" fill="#2a2a2a" />
    </svg>
  );
}

// ── Quick suggestion chips ───────────────────────────────────────────────────
const SUGGESTIONS = [
  'What does my ECG result mean?',
  'Is my heart rate normal?',
  'Explain the AI summary',
  'What are cardiac risk factors?',
];

// ── Simple local QA for common ECG questions ─────────────────────────────────
function getLocalAnswer(question) {
  const q = question.toLowerCase();
  if (q.includes('ecg') && (q.includes('mean') || q.includes('result')))
    return "Your ECG result reflects the electrical activity of your heart over time. The AI model analyses waveform intervals (P, QRS, T) to estimate cardiovascular risk. Always consult a cardiologist for a definitive interpretation.";
  if (q.includes('heart rate') || q.includes('bpm'))
    return "A normal resting heart rate for adults is 60–100 BPM. Below 60 may indicate bradycardia; above 100 tachycardia. Athletes often have lower resting rates which is perfectly healthy.";
  if (q.includes('ai summary') || q.includes('summary'))
    return "The AI Medical Summary is generated by analysing 13 clinical ECG parameters — including chest pain type, cholesterol, resting ECG, max heart rate, and ST depression — using a trained ML model to estimate cardiovascular risk.";
  if (q.includes('risk') || q.includes('cardiac'))
    return "Key cardiac risk factors include high blood pressure, high cholesterol, smoking, diabetes, obesity, family history of heart disease, physical inactivity, and stress. Regular screening and a heart-healthy lifestyle significantly reduce risk.";
  if (q.includes('stethoscope') || q.includes('doctor'))
    return "I am MedBot — your AI health assistant! I can help explain your ECG results, heart metrics, and general cardiac health information. For medical decisions, always consult a licensed physician.";
  if (q.includes('hello') || q.includes('hi') || q.includes('hey'))
    return "Hello! 👋 I'm MedBot, your AI medical assistant. I can help you understand your ECG analysis, heart metrics, and answer general cardiac health questions!";
  if (q.includes('irregular') || q.includes('arrhythmia'))
    return "An irregular rhythm (arrhythmia) means the heart is not beating in a regular pattern. This can range from harmless to serious. Common types include atrial fibrillation, bradycardia, and tachycardia. Please consult a cardiologist if detected.";
  return "That's a great question! For accurate medical advice, please consult your cardiologist. I can help explain ECG results, heart rate ranges, and general cardiac health topics. Try asking about your ECG result or cardiac risk factors!";
}

// ── Main Widget ──────────────────────────────────────────────────────────────
export default function MedBotChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: "Hi! I'm MedBot 🤖 — your AI cardiac assistant. Ask me anything about your ECG analysis or heart health!",
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, isTyping]);

  const sendMessage = (text) => {
    const msg = text || inputVal.trim();
    if (!msg) return;
    setInputVal('');

    const userMsg = { id: Date.now(), from: 'user', text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const answer = getLocalAnswer(msg);
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'bot', text: answer }]);
      setIsTyping(false);
    }, 900 + Math.random() * 600);
  };

  return (
    <>
      <style>{`
        @keyframes botFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes botPulseRing {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0,212,255,0.5); }
          70% { transform: scale(1); box-shadow: 0 0 0 16px rgba(0,212,255,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0,212,255,0); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes botTyping {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        .medbot-float { animation: botFloat 3s ease-in-out infinite; }
        .medbot-ring   { animation: botPulseRing 2.5s ease-out infinite; }
        .chat-slide-up { animation: chatSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .typing-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#00d4ff; margin: 0 2px; animation: botTyping 1.4s infinite ease-in-out both; }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        .typing-dot:nth-child(3) { animation-delay: 0s; }
      `}</style>

      {/* ── Chat Panel ───────────────────────────────────────── */}
      {open && (
        <div
          className="chat-slide-up fixed bottom-36 right-6 z-[9999] w-[340px] flex flex-col"
          style={{
            background: 'linear-gradient(145deg, #0a0f1e 0%, #0d1a2e 100%)',
            border: '1px solid rgba(0,212,255,0.25)',
            borderRadius: '24px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
            maxHeight: '480px',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
            <div style={{ width: 40, height: 40, flexShrink: 0 }}>
              <MedBotAvatar size={40} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">MedBot</p>
              <p className="text-[11px] text-cyan-400 font-medium">● Online · AI Cardiac Assistant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 280 }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {msg.from === 'bot' && (
                  <div style={{ width: 28, height: 28, flexShrink: 0, marginTop: 2 }}>
                    <MedBotAvatar size={28} />
                  </div>
                )}
                <div
                  className="text-[13px] leading-relaxed px-3 py-2 rounded-2xl max-w-[230px]"
                  style={
                    msg.from === 'bot'
                      ? {
                          background: 'rgba(0,212,255,0.08)',
                          border: '1px solid rgba(0,212,255,0.15)',
                          color: '#e2eef5',
                          borderTopLeftRadius: 6,
                        }
                      : {
                          background: 'linear-gradient(135deg,#0062cc,#0098d4)',
                          color: '#fff',
                          borderTopRightRadius: 6,
                        }
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start gap-2 items-end">
                <div style={{ width: 28, height: 28, flexShrink: 0 }}>
                  <MedBotAvatar size={28} />
                </div>
                <div
                  className="px-3 py-2 rounded-2xl"
                  style={{
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.15)',
                    borderTopLeftRadius: 6,
                  }}
                >
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          <div className="px-3 py-2 flex gap-1.5 flex-wrap border-t border-white/5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full transition-all hover:scale-105"
                style={{
                  background: 'rgba(0,212,255,0.08)',
                  border: '1px solid rgba(0,212,255,0.2)',
                  color: '#7dd8f0',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2">
            <div
              className="flex items-center gap-2 rounded-2xl px-3 py-2"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(0,212,255,0.2)',
              }}
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask MedBot…"
                className="flex-1 bg-transparent text-[13px] text-white placeholder-zinc-500 outline-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputVal.trim()}
                className="p-1.5 rounded-xl transition-all disabled:opacity-30"
                style={{
                  background: inputVal.trim()
                    ? 'linear-gradient(135deg,#0062cc,#00b4d8)'
                    : 'transparent',
                }}
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Bot Button ───────────────────────────────── */}
      <div
        className="fixed bottom-6 right-6 z-[9999] cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
        title="Chat with MedBot"
      >
        {/* Pulse ring behind avatar */}
        {!open && (
          <div
            className="medbot-ring absolute inset-0 rounded-full"
            style={{ background: 'rgba(0,212,255,0.12)' }}
          />
        )}

        <div className={`relative ${!open ? 'medbot-float' : ''}`}>
          {/* Backdrop glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)',
              transform: 'scale(1.4)',
              filter: 'blur(8px)',
            }}
          />

          {/* Main button */}
          <div
            className="relative flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
            style={{
              width: 72,
              height: 72,
              background: 'linear-gradient(145deg, #0a1628 0%, #0d2240 100%)',
              border: '2px solid rgba(0,212,255,0.4)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <MedBotAvatar size={64} animate />
          </div>

          {/* Close indicator when open */}
          {open && (
            <div
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full"
              style={{ background: '#ef4444', border: '2px solid #0a1628' }}
            >
              <X size={10} className="text-white" />
            </div>
          )}

          {/* Chat bubble badge when closed */}
          {!open && (
            <div
              className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#0062cc,#00b4d8)', border: '2px solid #0a1628' }}
            >
              AI
            </div>
          )}
        </div>

        {/* Label tooltip */}
        {!open && (
          <div
            className="absolute bottom-0 -left-20 whitespace-nowrap text-[11px] font-semibold px-2 py-1 rounded-lg pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
            style={{
              background: 'rgba(10,22,40,0.9)',
              border: '1px solid rgba(0,212,255,0.2)',
              color: '#7dd8f0',
            }}
          >
            Chat with MedBot
          </div>
        )}
      </div>
    </>
  );
}
