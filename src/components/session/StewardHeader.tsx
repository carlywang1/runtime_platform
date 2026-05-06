'use client';
import { useState } from 'react';
import { Plus, Square, ChevronDown, ArrowLeft, Trash2 } from 'lucide-react';
import { useSessionStore, useCurrentSession, useIsRunAgentSession } from '../../stores/useSessionStore';
import SessionList from './SessionList';

interface StewardHeaderProps {
  runAgentMode?: boolean;
  runAgentName?: string;
  runAgentEmoji?: string;
  runLabel?: string;
  onStopBack?: () => void;
  onNewSession?: () => void;
  onDeleteSession?: () => void;
}

export default function StewardHeader({ runAgentMode, runAgentName, runAgentEmoji, runLabel, onStopBack, onNewSession, onDeleteSession }: StewardHeaderProps) {
  const {
    sessions,
    currentSessionId,
    switchSession,
    deleteSession,
    updateSessionTitle,
    stopRunSession,
    createSession,
  } = useSessionStore();
  const currentSession = useCurrentSession();
  const isRunAgentSession = useIsRunAgentSession();

  const [showList, setShowList] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const showRunIndicator = runAgentMode || isRunAgentSession;
  const displayTitle = showRunIndicator ? (runAgentName || currentSession.title || 'Agent') : (currentSession.title || 'New Conversation');
  const agentLabel = runAgentName || currentSession.agent_name || 'Agent';

  // Run Agent mode: simplified header with only Stop
  if (showRunIndicator) {
    return (
      <header className="h-14 flex items-center justify-between px-6 bg-gradient-to-r from-indigo-950/80 to-purple-950/60 border-b border-indigo-500/30">
        <div className="flex items-center gap-2 min-w-0">
          {editingTitle ? (
            <input
              autoFocus
              className="text-sm font-medium text-white bg-white/10 rounded px-1.5 py-0.5 outline-none border border-white/20 focus:border-indigo-400/50"
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={() => {
                if (titleDraft.trim()) updateSessionTitle(currentSessionId, titleDraft.trim());
                setEditingTitle(false);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (titleDraft.trim()) updateSessionTitle(currentSessionId, titleDraft.trim());
                  setEditingTitle(false);
                }
                if (e.key === 'Escape') setEditingTitle(false);
              }}
            />
          ) : (
            <span
              className="text-sm font-medium text-white cursor-pointer hover:text-indigo-200 transition-colors"
              onClick={() => { setTitleDraft(displayTitle); setEditingTitle(true); }}
            >
              {displayTitle}
            </span>
          )}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/25 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-medium text-indigo-200">
              {runLabel || (currentSession.session_type === 'run_chat' ? 'Chatting' : 'Running')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onNewSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-white/8 border border-white/12 hover:bg-white/15 transition-colors"
          >
            <Plus size={12} />
            New Session
          </button>
          <button
            onClick={onStopBack || stopRunSession}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-gray-300 bg-white/8 border border-white/12 hover:bg-white/15 transition-colors"
          >
            <ArrowLeft size={12} />
            Stop & Back
          </button>
        </div>
      </header>
    );
  }

  // Normal mode: full header with session list + New
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/10 relative">
      <div className="flex items-center gap-3 relative">
        <button
          onClick={() => setShowList(!showList)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <span className="text-sm font-medium text-white truncate max-w-[240px]">
            {displayTitle}
          </span>
          <ChevronDown size={14} className="text-gray-500" />
        </button>

        {showList && (
          <SessionList
            sessions={sessions.filter(s => s.session_type === 'build_agent')}
            currentSessionId={currentSessionId}
            onSelect={(id) => { switchSession(id); setShowList(false); }}
            onDelete={deleteSession}
            onRename={updateSessionTitle}
            onClose={() => setShowList(false)}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onDeleteSession}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 transition-colors"
          title="Delete conversation"
        >
          <Trash2 size={12} />
        </button>
        <button
          onClick={() => { createSession('build_agent'); setShowList(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <Plus size={12} />
          New
        </button>
      </div>
    </header>
  );
}
