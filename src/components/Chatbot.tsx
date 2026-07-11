import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, X, Send, Sparkles, MapPin, 
  Clock, DollarSign, HelpCircle, ArrowRight, CornerDownLeft
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: '¡Hola! Soy **Rosita**, tu asesora virtual de Copias & Impresiones Queréndaro. 🌸\n\n¿Te gustaría conocer nuestras **nuevas novedades**, precios, horarios, ubicación o cómo realizar un pedido de forma rápida en línea?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Map history to standard @google/genai contents list
      const contentsPayload = [...messages, userMsg].map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contents: contentsPayload })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: 'Lo siento, tuve un pequeño problema al conectarme al servidor. Por favor, vuelve a intentarlo o comunícate al WhatsApp **443 338 3043**.' 
        }]);
      }
    } catch (err) {
      console.error('Error in chatbot communication:', err);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'Hubo un error de conexión. Por favor, asegúrate de estar conectado a internet o escríbenos directamente.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  // Convert markdown-like syntax to elegant HTML securely
  const renderMessageContent = (text: string) => {
    // Simple secure parser for bold (**text**) and bullet lists (• or *) and newlines
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let processed = line;
      
      // Bold replacements
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(processed)) !== null) {
        if (match.index > lastIndex) {
          parts.push(processed.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-pink-700">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < processed.length) {
        parts.push(processed.substring(lastIndex));
      }

      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('- ');
      const content = parts.length > 0 ? parts : processed;

      if (isBullet) {
        return (
          <div key={idx} className="flex gap-2 pl-2 my-1">
            <span className="text-pink-500">•</span>
            <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
          </div>
        );
      }

      return (
        <p key={idx} className={line.trim() === '' ? 'h-2' : 'my-1'}>
          {content}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="chatbot-container">
      <AnimatePresence>
        {/* Chat window */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white w-[360px] sm:w-[400px] h-[520px] rounded-3xl border border-pink-100 shadow-2xl overflow-hidden flex flex-col mb-4"
            id="chatbot-window"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden relative border border-white/40 shadow-md">
                  <img 
                    src="/src/assets/images/rosita_avatar_1783665902873.jpg" 
                    alt="Rosita" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-black tracking-tight text-sm flex items-center gap-1.5">
                    Rosita
                    <span className="text-[9px] bg-white/25 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">IA</span>
                  </h3>
                  <p className="text-[10px] text-pink-50 font-light flex items-center gap-1">
                    Asesora en Línea • Activa ahora
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Minimizar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification banner */}
            <div className="bg-pink-50 text-[11px] text-pink-800 px-4 py-2 border-b border-pink-100/50 flex items-center justify-between font-medium">
              <span>📍 Visítanos en Av. del Trabajo S/N</span>
              <span className="text-[9px] bg-pink-200/50 text-pink-700 px-1.5 py-0.5 rounded font-black">QUERÉNDARO</span>
            </div>

            {/* Messages container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 scrollbar-thin">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm border ${
                    msg.role === 'user' 
                      ? 'bg-pink-600 text-white border-pink-600 rounded-tr-none' 
                      : 'bg-white text-slate-700 border-pink-100/60 rounded-tl-none'
                  }`}>
                    {renderMessageContent(msg.text)}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-500 border border-pink-100/60 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2 shadow-sm">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span className="italic text-slate-400 font-light">Rosita está escribiendo...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick action helper questions */}
            <div className="px-4 py-2 border-t border-pink-50 bg-white flex flex-wrap gap-1.5 shrink-0">
              <button 
                onClick={() => handleQuickQuestion('¿Cuáles son las nuevas novedades, precios y horarios?')}
                className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 border border-pink-100/50 text-pink-700 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                Novedades 🚀
              </button>
              <button 
                onClick={() => handleQuickQuestion('¿Cuáles son los precios de las impresiones y copias?')}
                className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 border border-pink-100/50 text-pink-700 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <DollarSign className="w-3 h-3 text-pink-500 shrink-0" />
                Precios
              </button>
              <button 
                onClick={() => handleQuickQuestion('¿Dónde están ubicados en Queréndaro?')}
                className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 border border-pink-100/50 text-pink-700 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-pink-500 shrink-0" />
                Ubicación
              </button>
              <button 
                onClick={() => handleQuickQuestion('¿Cuál es su horario de atención?')}
                className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 border border-pink-100/50 text-pink-700 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Clock className="w-3 h-3 text-pink-500 shrink-0" />
                Horarios
              </button>
              <button 
                onClick={() => handleQuickQuestion('¿Cómo puedo hacer un pedido en línea?')}
                className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 border border-pink-100/50 text-pink-700 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3 h-3 text-pink-500 shrink-0" />
                ¿Cómo pedir?
              </button>
            </div>

            {/* Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="p-3 border-t border-pink-50 bg-slate-50 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pregúntale a Rosita..."
                disabled={isLoading}
                className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none disabled:bg-slate-100"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="w-9 h-9 bg-pink-600 hover:bg-pink-700 text-white rounded-xl flex items-center justify-center transition-all shadow-sm shadow-pink-600/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher bubble button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-tr from-pink-600 to-rose-400 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer relative border border-white"
        id="chatbot-bubble-btn"
        title="Preguntas y ayuda"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative flex items-center justify-center"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 w-3 h-3 rounded-full border-2 border-pink-50 flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
