import React, { useState, useRef, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { Send, Bot, User, MessageCircle, Sparkles, PlusCircle } from 'lucide-react';
import { getMistralResponse } from '../utils/mistralAPI';

function AIAssistant() {
  const { state, dispatch } = useHealth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.chatHistory]);

  useEffect(() => {
    if (state.chatHistory.length === 0) {
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: {
          id: Date.now(),
          type: 'bot',
          message: `Hello! I'm your AI Health Assistant.

I can help you with:
• Symptom analysis
• Health information
• Medical guidance
• Treatment suggestions

What health concerns would you like to discuss today?`,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [dispatch, state.chatHistory.length]);

  const getAIResponse = async (userMessage) => {
    try {
      const systemPrompt = `You are a helpful AI health assistant. Provide accurate, helpful medical information while being clear about your limitations. 
      Always recommend consulting healthcare professionals for diagnosis and treatment. 
      CRITICAL INSTRUCTION: If the user reports severe, acute, or potentially life-threatening symptoms (such as "chest pain", "shortness of breath", "severe injury", etc.), you MUST explicitly advise them to seek immediate emergency medical care and highly recommend they use the "Find Facilities" tab in this application to quickly locate the nearest hospitals or urgent care centers.
      Be empathetic and informative. Keep responses concise and focused on the user's health question.`;
      
      return await getMistralResponse(userMessage, systemPrompt);
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later or consult a healthcare professional for medical advice.";
    }
  };
  
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: message.trim(),
      timestamp: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMessage });
    setMessage('');
    setIsTyping(true);

    setTimeout(async () => {
      try {
        const response = await getAIResponse(userMessage.message);
        
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          message: response,
          timestamp: new Date().toISOString()
        };

        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: botMessage });
      } catch (error) {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          message: "I'm having trouble right now. Please consult a healthcare professional for medical advice.",
          timestamp: new Date().toISOString()
        };
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: errorMessage });
      }
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: '🤒', label: 'Fever', prompt: 'I have a fever' },
    { icon: '🤕', label: 'Headache', prompt: 'I have a headache' },
    { icon: '💔', label: 'Chest Pain', prompt: 'I have chest pain' },
    { icon: '😷', label: 'Cough', prompt: 'I have a cough' },
    { icon: '🩺', label: 'Diabetes', prompt: 'I have diabetes' },
    { icon: '💓', label: 'Hypertension', prompt: 'I have high blood pressure' },
    { icon: '🫁', label: 'Asthma', prompt: 'I have asthma' },
    { icon: '🦴', label: 'Arthritis', prompt: 'I have joint pain' },
    { icon: '🧘', label: 'Mental Health', prompt: 'I have anxiety' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-10 bg-zinc-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      <style>{`
        /* Custom scrollbar for chat area */
        .chat-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .dark .chat-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-8rem)] flex flex-col">
        {/* Header Title */}
        <div className="flex items-center space-x-4 mb-6 shrink-0">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              AI Health Assistant
            </h1>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Powered by CareConnect AI
            </p>
          </div>
        </div>
        
        {/* Main Chat Interface */}
        <div className="flex-1 bg-white/60 dark:bg-[#121214]/60 backdrop-blur-2xl rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-2xl flex flex-col overflow-hidden relative">
          
          {/* Header Bar inside Chat */}
          <div className="h-16 border-b border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-black/20 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 tracking-wide">Secure Connection Established</span>
            </div>
            <button
              onClick={() => {
                dispatch({ type: 'CLEAR_CHAT_HISTORY' });
                dispatch({
                  type: 'ADD_CHAT_MESSAGE',
                  payload: {
                    id: Date.now(),
                    type: 'bot',
                    message: `Hello! I'm your AI Health Assistant.\n\nI can help you with:\n• Symptom analysis\n• Health information\n• Medical guidance\n• Treatment suggestions\n\nWhat health concerns would you like to discuss today?`,
                    timestamp: new Date().toISOString()
                  }
                });
              }}
              className="px-4 py-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 text-sm font-bold rounded-xl transition-colors duration-300 flex items-center space-x-2 border border-zinc-200/50 dark:border-white/5"
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto chat-scroll p-6 space-y-6">
            {state.chatHistory.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end space-x-3 max-w-[85%] sm:max-w-[75%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-br from-indigo-500 to-blue-600' 
                      : 'bg-gradient-to-br from-emerald-400 to-teal-500'
                  }`}>
                    {msg.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`px-5 py-3.5 rounded-2xl shadow-sm ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-br-sm' 
                      : 'bg-white dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-white/5 rounded-bl-sm'
                  }`}>
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </div>
                    <p className={`text-[10px] font-semibold mt-2 text-right ${msg.type === 'user' ? 'text-blue-100/70' : 'text-zinc-400 dark:text-zinc-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-3 max-w-[75%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="px-5 py-4 rounded-2xl rounded-bl-sm bg-white dark:bg-zinc-800/80 border border-zinc-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Input Area */}
          <div className="p-4 sm:p-6 bg-white/50 dark:bg-black/30 border-t border-zinc-200/50 dark:border-white/5 shrink-0">
            {/* Quick Actions Scroll */}
            <div className="flex overflow-x-auto chat-scroll pb-4 mb-2 space-x-2 w-full">
              {quickActions.map((action, idx) => (
                <button 
                  key={idx}
                  onClick={() => setMessage(action.prompt)}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 dark:bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 text-zinc-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-400 border border-zinc-200/50 dark:border-white/10 rounded-full text-[12px] font-bold tracking-wide transition-all duration-300"
                >
                  <span className="text-sm">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your health symptoms or medical concerns..."
                className="w-full pl-5 pr-14 py-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all shadow-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                className="absolute right-2 p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:hover:shadow-none transition-all duration-300"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;