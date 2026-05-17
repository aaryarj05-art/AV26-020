import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, ArrowRight } from 'lucide-react';
import { useChatBotContext } from './ChatBotProvider';

export default function ChatBot() {
  const { isOpen, toggle, messages, sendMessage, isTyping, navigateTo } = useChatBotContext();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggle}
        className={`fixed bottom-6 right-6 z-[9999] p-4 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 bg-[#3B82F6] hover:bg-[#2563EB] shadow-[#3B82F6]/30'
        }`}
      >
        <div className="absolute inset-0 rounded-full animate-ping bg-[#3B82F6] opacity-20" />
        <MessageCircle size={28} className="text-white relative z-10" />
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-6 right-6 z-[9999] w-[400px] h-[600px] bg-[#111827] border border-[#1E2D40] rounded-2xl shadow-2xl shadow-black/50 flex flex-col transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="h-[64px] bg-[#0C1220] border-b border-[#1E2D40] rounded-t-2xl px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
              <Sparkles size={16} className="text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="text-[#F0F4F8] font-bold text-[14px]">Helix Assistant</h3>
              <p className="text-[#8A9BB0] text-[11px] font-medium">Powered by Claude</p>
            </div>
          </div>
          <button onClick={toggle} className="p-2 text-[#8A9BB0] hover:text-[#F0F4F8] hover:bg-[#1E2D40] rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-[#8A9BB0]">
              <Sparkles size={32} className="opacity-20" />
              <div>
                <p className="text-[13px] font-medium text-[#F0F4F8]">Hi, I'm your Helix guide.</p>
                <p className="text-[12px] mt-1">Ask me about outbreak forecasting, SEIR simulations, or navigating the platform.</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#3B82F6] text-white rounded-br-none'
                    : 'bg-[#1E2D40] text-[#F0F4F8] rounded-bl-none'
                }`}
              >
                {/* Render markdown bold roughly */}
                <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                
                {msg.role === 'assistant' && msg.navLink && (
                  <button
                    onClick={() => { toggle(); navigateTo(msg.navLink!); }}
                    className="mt-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#3B82F6] bg-[#111827] px-3 py-1.5 rounded-lg hover:bg-[#0C1220] transition-colors"
                  >
                    Go there <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#1E2D40] rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#8A9BB0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#8A9BB0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#8A9BB0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-[#0C1220] border-t border-[#1E2D40] rounded-b-2xl">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-[#111827] border border-[#1E2D40] rounded-xl px-4 py-3 text-[13px] text-[#F0F4F8] placeholder-[#4A5568] focus:border-[#3B82F6] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-3 bg-[#3B82F6] text-white rounded-xl hover:bg-[#2563EB] disabled:opacity-50 disabled:hover:bg-[#3B82F6] transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
