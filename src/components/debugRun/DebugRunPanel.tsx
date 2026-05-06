'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import type { DebugSidebarMessage } from '../../data/debugRunSidebarScenarios';

interface DebugRunPanelProps {
  agentName: string;
  agentEmoji: string;
  messages: DebugSidebarMessage[];
  onClose: () => void;
}

export default function DebugRunPanel({ agentName, agentEmoji, messages, onClose }: DebugRunPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{agentEmoji}</span>
          <div>
            <h2 className="text-sm font-semibold text-white leading-tight">{agentName}</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Debug Session</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          title="Close panel"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* System prompt */}
        <div className="text-center py-6">
          <p className="text-xs text-gray-500">Debug session started. Send a message to test the agent.</p>
        </div>

        {messages.map((msg) => {
          if (msg.role === 'steward') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 bg-indigo-600/80 text-white">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className="text-[10px] text-indigo-200/50 mt-1 text-right">{msg.timestamp}</p>
                </div>
              </div>
            );
          }
          return (
            <div key={msg.id} className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.06]">
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <p className="text-[10px] text-gray-600 mt-1">{msg.timestamp}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 py-4">
        <div className="relative rounded-2xl border transition-colors bg-indigo-950/40 border-indigo-500/20 focus-within:border-indigo-500/40">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
              }
            }}
            placeholder={`Chat with ${agentName}...`}
            rows={3}
            className="w-full px-4 pt-4 pb-12 bg-transparent text-white placeholder-gray-600 focus:outline-none resize-none text-sm"
          />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <button className="p-2 text-gray-500 hover:text-gray-300 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              disabled={!input.trim()}
              className="p-2 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
