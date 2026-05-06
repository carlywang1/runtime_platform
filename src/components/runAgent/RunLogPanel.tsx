'use client';
import { useState, useEffect, useRef } from 'react';
import { Terminal, Clock, BookOpen, X } from 'lucide-react';
import type { ExecLogLine } from '../../data/runAgentScenarios';

interface RunLogPanelProps {
  lines: ExecLogLine[];
  status: 'running' | 'completed' | 'failed';
  agentName: string;
  startedAt?: string;
  onClose: () => void;
}

const STATUS_CONFIG = {
  running:   { label: 'Running',   cls: 'bg-indigo-500/20 text-indigo-400' },
  completed: { label: 'Completed', cls: 'bg-emerald-500/20 text-emerald-400' },
  failed:    { label: 'Failed',    cls: 'bg-rose-500/20 text-rose-400' },
};

const LOG_STATUS_DOT: Record<string, string> = {
  ok:   'bg-emerald-400',
  info: 'bg-blue-400',
  warn: 'bg-amber-400',
  '':   'bg-gray-500',
};

function LogLine({ line }: { line: ExecLogLine }) {
  const dotColor = LOG_STATUS_DOT[line.status] || LOG_STATUS_DOT[''];
  return (
    <div className="relative flex gap-3 pb-3">
      <div className={`relative z-10 mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-[#111318] ${dotColor}`} />
      <div className="flex-1 min-w-0">
        <span className="text-[10px] text-gray-600 font-mono">{line.time}</span>
        <p className="text-xs text-gray-300 break-words whitespace-pre-wrap leading-relaxed mt-0.5">{line.text}</p>
      </div>
    </div>
  );
}

export default function RunLogPanel({ lines, status, agentName, startedAt, onClose }: RunLogPanelProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'knowledge'>('logs');
  const [visibleCount, setVisibleCount] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount < lines.length) {
      const timer = setTimeout(() => setVisibleCount(c => c + 1), 300);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, lines.length]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleCount]);

  const statusCfg = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col h-full">
      {/* Header with tabs */}
      <div className="flex items-center justify-between px-5 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-center gap-1 border-b border-white/5 w-full">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'text-white border-indigo-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            Logs
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'knowledge'
                ? 'text-white border-indigo-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            Knowledge
          </button>
          <div className="ml-auto">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'logs' ? (
          <div className="space-y-4">
            {/* Meta bar */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-black/30 border border-white/5">
              <Terminal size={14} className="text-gray-500 flex-shrink-0" />
              <span className="text-xs font-medium text-white truncate">{agentName}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusCfg.cls}`}>
                {statusCfg.label}
                {status === 'running' && <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
              </span>
              {startedAt && (
                <span className="text-[10px] text-gray-500 flex items-center gap-1 ml-auto">
                  <Clock size={10} />
                  {startedAt}
                </span>
              )}
            </div>

            {/* Timeline logs */}
            <div className="relative pl-4">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/8" />
              {lines.slice(0, visibleCount).map((line, i) => (
                <LogLine key={i} line={line} />
              ))}
              {status === 'running' && visibleCount < lines.length && (
                <div className="flex items-center gap-2 text-indigo-400 mt-1 pl-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-xs">Executing...</span>
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
              <BookOpen size={20} className="text-gray-600" />
            </div>
            <p className="text-sm text-gray-500">No knowledge items yet</p>
            <p className="text-xs text-gray-600 mt-1">Knowledge extracted during runs will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
