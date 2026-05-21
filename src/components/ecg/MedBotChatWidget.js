import React, { useState, useRef, useEffect } from 'react';
import { Send, X, PlusCircle, Sparkles, Bot, User } from 'lucide-react';
import { getMistralResponse } from '../../utils/mistralAPI';

// ── 3D Doctor Robot SVG ─────────────────────────────────────────────────────
function MedBotAvatar({ size = 80 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 6px 18px rgba(0,210,255,0.35))' }}
    >
      <defs>
        <radialGradient id="mbHeadGrad" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#dce8f0" />
          <stop offset="100%" stopColor="#b0c8d8" />
        </radialGradient>
        <radialGradient id="mbScreenGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#0d1117" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <linearGradient id="mbCoatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d0dfe8" />
        </linearGradient>
        <radialGradient id="mbEarGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#5ee8ff" />
          <stop offset="100%" stopColor="#0099cc" />
        </radialGradient>
        <radialGradient id="mbBodySheen" cx="35%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="mbCyanGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Antenna */}
      <rect x="97" y="4" width="6" height="28" rx="3" fill="#c8dde8" />
      <circle cx="100" cy="4" r="8" fill="url(#mbEarGrad)" filter="url(#mbCyanGlow)" />
      <circle cx="98" cy="2" r="3" fill="#aef5ff" opacity="0.8" />
      {/* Left Ear */}
      <ellipse cx="44" cy="90" rx="14" ry="18" fill="url(#mbEarGrad)" />
      <ellipse cx="44" cy="90" rx="8" ry="11" fill="#003355" />
      <ellipse cx="43" cy="87" rx="3" ry="4" fill="#00d4ff" opacity="0.7" filter="url(#mbCyanGlow)" />
      {/* Right Ear */}
      <ellipse cx="156" cy="90" rx="14" ry="18" fill="url(#mbEarGrad)" />
      <ellipse cx="156" cy="90" rx="8" ry="11" fill="#003355" />
      <ellipse cx="155" cy="87" rx="3" ry="4" fill="#00d4ff" opacity="0.7" filter="url(#mbCyanGlow)" />
      {/* Head */}
      <rect x="48" y="30" width="104" height="105" rx="38" fill="url(#mbHeadGrad)" />
      <ellipse cx="78" cy="48" rx="22" ry="14" fill="white" opacity="0.45" />
      {/* Screen */}
      <rect x="60" y="52" width="80" height="62" rx="18" fill="url(#mbScreenGrad)" />
      <rect x="60" y="52" width="80" height="62" rx="18" fill="none" stroke="#00d4ff" strokeWidth="1.5" opacity="0.5" />
      {/* Eyes */}
      <path d="M78 82 Q83 76 88 82" stroke="#00ffee" strokeWidth="3.5" strokeLinecap="round" fill="none" filter="url(#mbCyanGlow)" />
      <path d="M112 82 Q117 76 122 82" stroke="#00ffee" strokeWidth="3.5" strokeLinecap="round" fill="none" filter="url(#mbCyanGlow)" />
      {/* Smile */}
      <path d="M83 96 Q100 110 117 96" stroke="#00ffee" strokeWidth="3.5" strokeLinecap="round" fill="none" filter="url(#mbCyanGlow)" />
      {/* Neck */}
      <rect x="88" y="133" width="24" height="16" rx="6" fill="#c8dde8" />
      {/* Body */}
      <path d="M30 220 Q28 165 50 152 L72 145 L100 155 L128 145 L150 152 Q172 165 170 220 Z" fill="url(#mbCoatGrad)" />
      <path d="M30 220 Q28 165 50 152 L72 145 L100 155 L128 145 L150 152 Q172 165 170 220 Z" fill="url(#mbBodySheen)" />
      {/* Shirt & Tie */}
      <path d="M82 145 L100 155 L118 145 L110 148 L100 162 L90 148 Z" fill="#7bbfda" />
      <path d="M97 148 L103 148 L106 175 L100 180 L94 175 Z" fill="#1a2d5a" />
      <path d="M95 148 L105 148 L103 155 L100 158 L97 155 Z" fill="#243672" />
      {/* Lapels */}
      <path d="M50 152 L72 145 L90 148 L82 168 Q60 165 50 152 Z" fill="#f0f6fa" stroke="#dde8ef" strokeWidth="0.5" />
      <path d="M150 152 L128 145 L110 148 L118 168 Q140 165 150 152 Z" fill="#f0f6fa" stroke="#dde8ef" strokeWidth="0.5" />
      {/* Arms */}
      <path d="M30 220 Q22 198 30 178 Q38 162 60 160 L72 165 L62 188 Q48 195 42 215 Z" fill="url(#mbCoatGrad)" stroke="#ccdde8" strokeWidth="0.5" />
      <path d="M170 220 Q178 198 170 178 Q162 162 140 160 L128 165 L138 188 Q152 195 158 215 Z" fill="url(#mbCoatGrad)" stroke="#ccdde8" strokeWidth="0.5" />
      <ellipse cx="100" cy="200" rx="42" ry="16" fill="#e8f2f8" stroke="#ccdde6" strokeWidth="0.5" />
      <ellipse cx="100" cy="200" rx="38" ry="12" fill="url(#mbCoatGrad)" />
      {/* Stethoscope */}
      <path d="M88 148 Q72 150 66 162 Q60 175 68 185 Q76 195 82 195" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M112 148 Q128 150 118 168" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="119" cy="172" r="7" fill="#1a1a1a" />
      <circle cx="119" cy="172" r="4.5" fill="#333" />
      <circle cx="119" cy="172" r="2.5" fill="#555" />
      <circle cx="83" cy="196" r="5" fill="#1a1a1a" />
      <circle cx="83" cy="196" r="3" fill="#2a2a2a" />
    </svg>
  );
}

// ── Quick Actions ─────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '🤒', label: 'Fever',       prompt: 'I have a fever' },
  { icon: '🤕', label: 'Headache',    prompt: 'I have a headache' },
  { icon: '💔', label: 'Chest Pain',  prompt: 'I have chest pain' },
  { icon: '😷', label: 'Cough',       prompt: 'I have a cough' },
  { icon: '🩺', label: 'Diabetes',    prompt: 'I have diabetes' },
  { icon: '💓', label: 'BP',          prompt: 'I have high blood pressure' },
  { icon: '🫁', label: 'Asthma',      prompt: 'I have asthma' },
  { icon: '🧘', label: 'Anxiety',     prompt: 'I have anxiety' },
];

const SYSTEM_PROMPT = `You are MedBot, a helpful AI Health Assistant powered by CareConnect. 
Provide accurate, empathetic, concise medical information while always recommending professional consultation. 
If a user reports severe or life-threatening symptoms (chest pain, difficulty breathing, severe injury), 
immediately advise them to seek emergency care. Keep responses helpful and focused.`;

const INITIAL_MESSAGE = {
  id: 'init',
  type: 'bot',
  text: `Hello! I'm your **AI Health Assistant** 👋\n\nI can help you with:\n• Symptom analysis\n• Health information\n• Medical guidance\n• Treatment suggestions\n\nWhat health concerns would you like to discuss today?`,
  timestamp: new Date().toISOString(),
};

// ── Render markdown-like bold text ────────────────────────────────────────────
function RenderText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

// ── Main Widget ───────────────────────────────────────────────────────────────
export default function MedBotChatWidget() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef               = useRef(null);
  const inputRef                = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, isTyping]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const clearChat = () => setMessages([INITIAL_MESSAGE]);

  const sendMessage = async (text) => {
    const msg = (text || inputVal).trim();
    if (!msg || isTyping) return;
    setInputVal('');

    const userMsg = { id: Date.now(), type: 'user', text: msg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await getMistralResponse(msg, SYSTEM_PROMPT);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: response,
        timestamp: new Date().toISOString(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: "I'm having trouble connecting right now. Please try again or consult a healthcare professional.",
        timestamp: new Date().toISOString(),
      }]);
    }
    setIsTyping(false);
  };

  return (
    <>
      <style>{`
        @keyframes mbFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes mbPulse    {
          0%   { box-shadow: 0 0 0 0 rgba(0,212,255,0.6), 0 0 0 0 rgba(99,102,241,0.4); }
          70%  { box-shadow: 0 0 0 20px rgba(0,212,255,0), 0 0 0 16px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,212,255,0), 0 0 0 0 rgba(99,102,241,0); }
        }
        @keyframes mbSlideUp  { from{opacity:0;transform:translateY(24px) scale(0.94)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes mbFadeIn   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mbBounce1  { 0%,80%,100%{transform:scale(0);opacity:.5} 40%{transform:scale(1);opacity:1} }
        @keyframes mbBounce2  { 0%,80%,100%{transform:scale(0);opacity:.5} 40%{transform:scale(1);opacity:1} }
        @keyframes mbBounce3  { 0%,80%,100%{transform:scale(0);opacity:.5} 40%{transform:scale(1);opacity:1} }
        @keyframes mbLabelPop { 0%{opacity:0;transform:translateX(8px)} 100%{opacity:1;transform:translateX(0)} }
        .mb-float     { animation: mbFloat 3.2s ease-in-out infinite; }
        .mb-pulse     { animation: mbPulse 2s ease-out infinite; }
        .mb-slide-up  { animation: mbSlideUp 0.32s cubic-bezier(0.34,1.5,0.64,1) forwards; }
        .mb-msg-in    { animation: mbFadeIn 0.25s ease forwards; }
        .mb-label-pop { animation: mbLabelPop 0.3s ease forwards; }
        .mb-dot1 { display:inline-block;width:7px;height:7px;border-radius:50%;background:#6ee7f7;animation:mbBounce1 1.4s infinite ease-in-out both;animation-delay:-0.32s; }
        .mb-dot2 { display:inline-block;width:7px;height:7px;border-radius:50%;background:#6ee7f7;animation:mbBounce2 1.4s infinite ease-in-out both;animation-delay:-0.16s; }
        .mb-dot3 { display:inline-block;width:7px;height:7px;border-radius:50%;background:#6ee7f7;animation:mbBounce3 1.4s infinite ease-in-out both; }
        .mb-scroll::-webkit-scrollbar { width:4px; }
        .mb-scroll::-webkit-scrollbar-track { background:transparent; }
        .mb-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1);border-radius:10px; }
        .mb-quick::-webkit-scrollbar { height:0; }
        .mb-trigger:hover .mb-tooltip { opacity:1 !important; transform:translateX(0) !important; }
      `}</style>

      {/* ── Chat Panel ───────────────────────────────────────────────────── */}
      {open && (
        <div
          className="mb-slide-up fixed bottom-[104px] right-5 z-[9998] flex flex-col"
          style={{
            width: 360,
            maxHeight: 560,
            background: 'linear-gradient(160deg,#07111f 0%,#0b1a30 100%)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 24,
            boxShadow: '0 32px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(0,212,255,0.08),inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* ── Panel Header ────────────────────────────────────────────── */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px 24px 0 0', background: 'rgba(0,0,0,0.25)' }}
          >
            {/* Bot avatar small */}
            <div style={{ width: 40, height: 40, flexShrink: 0, marginTop: -2 }}>
              <MedBotAvatar size={40} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-tight">AI Health Assistant</span>
                <Sparkles size={12} className="text-cyan-400" />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[11px] font-semibold text-emerald-400">Secure · Powered by Mistral AI</span>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={clearChat}
              title="New chat"
              className="p-1.5 rounded-xl text-zinc-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
            >
              <PlusCircle size={15} />
            </button>
            <button
              onClick={() => setOpen(false)}
              title="Close"
              className="p-1.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* ── Messages ─────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto mb-scroll px-4 py-4 space-y-4" style={{ minHeight: 0 }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-msg-in flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>

                {/* Bot avatar */}
                {msg.type === 'bot' && (
                  <div style={{ width: 30, height: 30, flexShrink: 0, marginTop: 2 }}>
                    <MedBotAvatar size={30} />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className="max-w-[240px] px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap"
                  style={
                    msg.type === 'bot'
                      ? {
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(0,212,255,0.12)',
                          borderRadius: '18px 18px 18px 4px',
                          color: '#d4eaf5',
                        }
                      : {
                          background: 'linear-gradient(135deg,#0062cc,#00a8d4)',
                          borderRadius: '18px 18px 4px 18px',
                          color: '#fff',
                          boxShadow: '0 4px 20px rgba(0,100,200,0.3)',
                        }
                  }
                >
                  <RenderText text={msg.text} />
                  <p
                    className="text-[10px] font-semibold mt-1.5 text-right"
                    style={{ color: msg.type === 'user' ? 'rgba(255,255,255,0.5)' : 'rgba(150,180,200,0.6)' }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* User avatar */}
                {msg.type === 'user' && (
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#4f46e5,#0ea5e9)', marginTop: 2 }}
                  >
                    <User size={13} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="mb-msg-in flex justify-start gap-2 items-end">
                <div style={{ width: 30, height: 30, flexShrink: 0 }}>
                  <MedBotAvatar size={30} />
                </div>
                <div
                  className="px-4 py-3 flex items-center gap-1"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(0,212,255,0.12)',
                    borderRadius: '18px 18px 18px 4px',
                  }}
                >
                  <span className="mb-dot1" />
                  <span className="mb-dot2" />
                  <span className="mb-dot3" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Quick Actions ─────────────────────────────────────────────── */}
          <div
            className="px-3 py-2 flex gap-2 overflow-x-auto mb-quick shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => sendMessage(a.prompt)}
                disabled={isTyping}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-full transition-all hover:scale-105 disabled:opacity-40"
                style={{
                  background: 'rgba(0,212,255,0.07)',
                  border: '1px solid rgba(0,212,255,0.18)',
                  color: '#7dd8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className="text-sm">{a.icon}</span> {a.label}
              </button>
            ))}
          </div>

          {/* ── Input ────────────────────────────────────────────────────── */}
          <div className="px-3 pb-3 pt-2 shrink-0">
            <div
              className="flex items-center gap-2 rounded-2xl px-3 py-2 transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(0,212,255,0.18)',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about your health…"
                disabled={isTyping}
                className="flex-1 bg-transparent text-[13px] text-white placeholder-zinc-500 outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputVal.trim() || isTyping}
                className="p-2 rounded-xl transition-all disabled:opacity-30"
                style={{
                  background: inputVal.trim() && !isTyping
                    ? 'linear-gradient(135deg,#0062cc,#00b4d8)'
                    : 'transparent',
                  boxShadow: inputVal.trim() && !isTyping ? '0 0 12px rgba(0,180,216,0.4)' : 'none',
                }}
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Trigger Button ──────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3" style={{ userSelect: 'none' }}>

        {/* Hover tooltip label — always to the left of button */}
        {!open && (
          <div
            className="mb-tooltip flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg,#0f172a,#1e293b)',
              border: '1px solid rgba(0,212,255,0.35)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.1)',
              opacity: 0,
              transform: 'translateX(8px)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#e2f4fd', letterSpacing: '0.01em' }}>AI Health Assistant</span>
          </div>
        )}

        {/* Main button wrapper — hover reveals tooltip */}
        <div
          className="mb-trigger relative"
          style={{ position: 'relative' }}
          onMouseEnter={e => {
            const tip = e.currentTarget.parentElement.querySelector('.mb-tooltip');
            if (tip) { tip.style.opacity = '1'; tip.style.transform = 'translateX(0)'; }
          }}
          onMouseLeave={e => {
            const tip = e.currentTarget.parentElement.querySelector('.mb-tooltip');
            if (tip) { tip.style.opacity = '0'; tip.style.transform = 'translateX(8px)'; }
          }}
        >

          <button
            onClick={() => setOpen(v => !v)}
            title={open ? 'Close AI Assistant' : 'Chat with AI Health Assistant'}
            className="relative flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
            style={{
              width: 72,
              height: 72,
              /* Bright visible gradient — works on both dark and light backgrounds */
              background: open
                ? 'linear-gradient(145deg, #7f1d1d, #dc2626)'
                : 'linear-gradient(145deg, #0369a1, #06b6d4, #6366f1)',
              border: `3px solid ${open ? 'rgba(252,165,165,0.6)' : 'rgba(255,255,255,0.35)'}`,
              boxShadow: open
                ? '0 8px 24px rgba(220,38,38,0.5), 0 0 0 1px rgba(252,165,165,0.2)'
                : '0 8px 32px rgba(6,182,212,0.55), 0 4px 16px rgba(99,102,241,0.35), 0 0 0 1px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            {/* Inner bright highlight ring */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.35) 0%, transparent 60%)',
              }}
            />

            {open ? (
              <X size={26} className="text-white relative z-10" strokeWidth={2.5} />
            ) : (
              <div className="mb-float relative z-10" style={{ width: 62, height: 62, marginTop: 2 }}>
                <MedBotAvatar size={62} />
              </div>
            )}
          </button>

          {/* AI badge pill */}
          {!open && (
            <div
              className="absolute -top-1.5 -right-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(99,102,241,0.5)',
              }}
            >
              <Sparkles size={8} className="text-white" />
              <span style={{ fontSize: 9, fontWeight: 900, color: 'white', letterSpacing: '0.06em' }}>AI</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
