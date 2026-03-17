import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, Users, FlaskConical, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const sampleResponses: Record<string, string[]> = {
  default: [
    "I'm running on the new version in sandbox mode. How can I help you test?",
    "That's a great test case. Let me process that for you — here's what the new version produces.",
    "The new version handles this scenario with improved accuracy. Would you like to try another test?",
  ],
};

export default function VersionTestChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, type, latestVersion, currentVersion } = (location.state as { name: string; type: string; latestVersion: string; currentVersion: string }) || {
    name: 'Unknown',
    type: 'agent',
    latestVersion: 'v0.0.0',
    currentVersion: 'v0.0.0',
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hi! I'm **${name}** running on **${latestVersion}** (sandbox mode). Your production version is ${currentVersion}.\n\nYou can chat with me to test the new version's capabilities before upgrading. Try asking me anything!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = sampleResponses.default;
      const response = responses[Math.floor(Math.random() * responses.length)];
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-white/5 flex items-center px-4 gap-3 flex-shrink-0 bg-dark-50">
        <button
          onClick={() => navigate('/version-control')}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </button>

        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          {type === 'team' ? <Users className="w-4 h-4 text-emerald-400" /> : <Bot className="w-4 h-4 text-emerald-400" />}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{name}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
              <FlaskConical className="w-3 h-3" />
              Testing {latestVersion}
            </span>
          </div>
          <p className="text-[11px] text-gray-500">Sandbox mode · Changes won't affect production</p>
        </div>

        <button
          onClick={() => navigate('/version-control')}
          className="h-8 px-3 rounded-lg bg-white/5 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          End Test
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Sandbox Banner */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <FlaskConical className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-emerald-300">
            You're testing <span className="font-medium">{latestVersion}</span> in a sandboxed environment. No changes will be applied to your production setup.
          </p>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] ${msg.role === 'user' ? '' : 'flex gap-3'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
              )}
              <div>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo text-white rounded-br-md'
                      : 'bg-dark-50 border border-white/5 text-gray-300 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
                <p className={`text-[10px] text-gray-600 mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-dark-50 border border-white/5">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/5 p-4 bg-dark-50">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Test ${name} ${latestVersion}...`}
            className="flex-1 h-10 px-4 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="h-10 w-10 rounded-lg bg-indigo hover:bg-indigo-600 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
