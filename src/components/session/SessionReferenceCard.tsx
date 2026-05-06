import { ExternalLink } from 'lucide-react';
import type { SessionStatus } from '../../types';

interface SessionReferenceCardProps {
  agentName: string;
  agentEmoji: string;
  sessionTitle?: string;
  status: SessionStatus;
  summary?: string;
  onNavigate: () => void;
}

export default function SessionReferenceCard({ agentName, agentEmoji, sessionTitle, status, summary, onNavigate }: SessionReferenceCardProps) {
  const statusLabel = {
    active: 'Running',
    completed: 'Completed',
    stopped: 'Stopped',
    failed: 'Failed',
  }[status];

  const statusColor = {
    active: 'text-green-400',
    completed: 'text-green-400',
    stopped: 'text-gray-400',
    failed: 'text-red-400',
  }[status];

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/3 border border-white/8 rounded-xl">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm flex-shrink-0">
        {agentEmoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-200">{sessionTitle || agentName}</span>
          <span className={`text-[10px] ${statusColor}`}>{statusLabel}</span>
        </div>
        {summary && <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{summary}</div>}
      </div>
      <button
        onClick={onNavigate}
        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-indigo-400 hover:bg-indigo-500/10 transition-colors"
      >
        View <ExternalLink size={10} />
      </button>
    </div>
  );
}
