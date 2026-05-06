import { useState, useEffect, useRef } from 'react';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import type { Session } from '../../types';
import { groupSessionsByTime } from '../../utils/sessionUtils';

interface SessionListProps {
  sessions: Session[];
  currentSessionId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onClose: () => void;
}

export default function SessionList({ sessions, currentSessionId, onSelect, onDelete, onRename, onClose }: SessionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const { today, yesterday, earlier } = groupSessionsByTime(sessions);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const typeIcon = (type: Session['session_type']) => {
    switch (type) {
      case 'build_agent': return '🔨';
      case 'run_task': return '▶️';
      case 'run_chat': return '💬';
    }
  };

  const startEdit = (session: Session) => {
    setEditingId(session.id);
    setEditValue(session.title);
  };

  const confirmEdit = () => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  const renderSession = (session: Session) => (
    <div
      key={session.id}
      className={`group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
        session.id === currentSessionId ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
      onClick={() => { if (!editingId) onSelect(session.id); }}
    >
      <span className="text-xs flex-shrink-0">{typeIcon(session.session_type)}</span>

      {editingId === session.id ? (
        <div className="flex-1 flex items-center gap-1">
          <input
            className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-0.5 text-xs text-white outline-none"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') setEditingId(null); }}
            autoFocus
            onClick={e => e.stopPropagation()}
          />
          <button onClick={(e) => { e.stopPropagation(); confirmEdit(); }} className="text-green-400 hover:text-green-300">
            <Check size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="text-gray-500 hover:text-gray-400">
            <X size={12} />
          </button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-xs text-gray-300 truncate">
            {session.title || 'Untitled'}
          </span>
          <div className="hidden group-hover:flex items-center gap-1">
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); startEdit(session); }}
              className="p-0.5 text-gray-500 hover:text-gray-300"
            >
              <Pencil size={11} />
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
              className="p-0.5 text-gray-500 hover:text-red-400"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderGroup = (label: string, items: Session[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-2">
        <div className="px-3 py-1 text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
        {items.map(renderSession)}
      </div>
    );
  };

  return (
    <div ref={listRef} className="absolute top-full left-0 mt-1 w-72 max-h-96 overflow-y-auto bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl z-50">
      <div className="p-2">
        {renderGroup('Today', today)}
        {renderGroup('Yesterday', yesterday)}
        {renderGroup('Earlier', earlier)}
        {sessions.length === 0 && (
          <div className="px-3 py-4 text-xs text-gray-500 text-center">No sessions yet</div>
        )}
      </div>
    </div>
  );
}
