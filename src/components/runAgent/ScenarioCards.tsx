import { useState, useEffect, useRef } from 'react';
import { Pencil, ChevronDown, ChevronUp, Upload, X } from 'lucide-react';
import type { ExecLogLine } from '../../data/runAgentScenarios';

export function TypingIndicator({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo border-t-transparent animate-spin" />
      <span className="text-xs text-gray-500">{text}</span>
    </div>
  );
}

export function ParamConfirmCard({
  agentLabel,
  headerLabel,
  rows,
  onConfirmRun,
  panelOpen,
  confirmed,
  partial,
  onFieldChange,
  onEdit,
  onSavePartial,
  isLatest,
}: {
  agentLabel: string;
  headerLabel?: string;
  rows: [string, string, boolean?][];
  onConfirmRun?: () => void;
  panelOpen?: boolean;
  confirmed?: boolean;
  partial?: boolean;
  onFieldChange?: (index: number, value: string) => void;
  onEdit?: () => void;
  onSavePartial?: () => void;
  isLatest?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [localRows, setLocalRows] = useState(rows);
  const [filesOpen, setFilesOpen] = useState(false);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);

  useEffect(() => { setLocalRows(rows); }, [rows]);

  const allRequiredFilled = localRows.every(([, v, req]) => req === false || v.trim() !== '');
  const hasChanges = localRows.some(([, v], i) => v !== rows[i]?.[1]);

  const handleLocalChange = (index: number, value: string) => {
    setLocalRows((prev) => prev.map((r, i) => (i === index ? [r[0], value, r[2]] as [string, string, boolean?] : r)));
    onFieldChange?.(index, value);
  };

  const handleEditClick = () => {
    setEditing(true);
    onEdit?.();
  };

  // Show Confirm when not editing: complete card (not partial), only on latest card
  const showConfirmStatic = !editing && !confirmed && !panelOpen && !partial && isLatest;

  const isConfig = headerLabel === 'Environment Configuration' || headerLabel?.includes('环境配置');

  return (
    <div className="mt-3 p-3.5 rounded-xl bg-[#0d0d12] border border-white/[0.06]">
      {/* Header: category + agent name + edit */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <div className="text-[10px] text-gray-600 uppercase tracking-wider">{headerLabel || 'Execution Parameters'}</div>
          <div className="text-[12px] font-semibold text-gray-200 mt-0.5">{agentLabel}</div>
        </div>
        {!editing && isLatest && (
          <button
            onClick={handleEditClick}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-gray-400 hover:text-indigo-300 hover:bg-indigo/10 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        )}
      </div>
      {/* Fields */}
      {localRows.map(([key, value, required], i) => (
        <div
          key={i}
          className={`py-1.5 ${i < localRows.length - 1 ? 'border-b border-white/[0.03]' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-gray-400">{key}</span>
              {required !== false ? (
                <span className="px-1 py-0.5 rounded text-[8px] font-semibold bg-rose-500/10 text-rose-400/80">Required</span>
              ) : (
                <span className="px-1 py-0.5 rounded text-[8px] font-semibold bg-white/5 text-gray-600">Optional</span>
              )}
            </div>
            {!editing && (
              <span className={`text-[11px] font-medium text-right max-w-[55%] truncate ${value.trim() ? 'text-gray-200' : 'text-gray-600 italic'}`}>
                {value.trim() || '—'}
              </span>
            )}
          </div>
          {editing && (
            <input
              type="text"
              value={localRows[i][1]}
              onChange={(e) => handleLocalChange(i, e.target.value)}
              placeholder={value.trim() || '—'}
              className="mt-1 w-full h-7 px-2 rounded-md bg-white/[0.03] border border-white/[0.08] text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo/40"
            />
          )}
        </div>
      ))}
      {/* Extra Files */}
      {!isConfig && (
        <div className="mt-2.5 pt-2 border-t border-white/[0.04]">
          <button
            onClick={() => setFilesOpen(!filesOpen)}
            className="w-full flex items-center justify-between py-1.5"
          >
            <div className="flex items-center gap-1.5">
              <Upload className="w-3 h-3 text-gray-500" />
              <span className="text-[11px] font-medium text-gray-400">Extra Files</span>
              <span className="px-1 py-0.5 rounded text-[8px] font-semibold bg-white/5 text-gray-600">Optional</span>
              {extraFiles.length > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 text-gray-500">{extraFiles.length}</span>
              )}
            </div>
            {filesOpen ? (
              <ChevronUp className="w-3 h-3 text-gray-600" />
            ) : (
              <ChevronDown className="w-3 h-3 text-gray-600" />
            )}
          </button>
          {filesOpen && (
            <div className="mt-1.5 space-y-2">
              {extraFiles.length > 0 && (
                <div className="space-y-1">
                  {extraFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.03]">
                      <span className="text-[10px] text-gray-400 truncate">{file.name}</span>
                      {editing && (
                        <button onClick={() => setExtraFiles((prev) => prev.filter((_, j) => j !== i))} className="text-gray-600 hover:text-gray-400 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {editing ? (
                <label className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-white/[0.08] hover:border-white/[0.15] cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[11px] text-gray-500">Add files</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setExtraFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              ) : extraFiles.length === 0 ? (
                <p className="text-[11px] text-gray-600 italic">No extra files attached</p>
              ) : null}
            </div>
          )}
        </div>
      )}
      {/* Actions — editing mode */}
      {editing && (
        <div className="flex gap-2 mt-3">
          {/* Path 1: all required filled → Confirm & Run / Save Configuration */}
          {hasChanges && allRequiredFilled && (
            <button
              onClick={() => { setEditing(false); onConfirmRun?.(); }}
              className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo to-[#7F43AD] hover:opacity-85 transition-opacity"
            >
              {isConfig ? 'Save Configuration' : 'Confirm & Run'}
            </button>
          )}
          {/* Path 2: has changes but not all required → Save (partial) */}
          {hasChanges && !allRequiredFilled && (
            <button
              onClick={() => { setEditing(false); onSavePartial?.(); }}
              className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-indigo/20 border border-indigo/30 hover:bg-indigo/30 transition-colors"
            >
              Save
            </button>
          )}
          {/* Always show Cancel in editing mode */}
          <button
            onClick={() => { setEditing(false); setLocalRows(rows); }}
            className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 border border-white/[0.08] hover:border-white/15 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      {/* Actions — static mode: complete card shows Confirm */}
      {showConfirmStatic && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onConfirmRun?.()}
            className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo to-[#7F43AD] hover:opacity-85 transition-opacity"
          >
            {isConfig ? 'Save Configuration' : 'Confirm & Run'}
          </button>
        </div>
      )}
    </div>
  );
}

export function ExecLogCard({ lines, progress, done, onViewDetails }: { lines: ExecLogLine[]; progress: number; done: boolean; onViewDetails?: () => void }) {
  const skipAnim = done && progress === 100;
  const [visibleCount, setVisibleCount] = useState(skipAnim ? lines.length : 0);
  const [animDone, setAnimDone] = useState(skipAnim);
  const [collapsed, setCollapsed] = useState(skipAnim);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount < lines.length) {
      const timer = setTimeout(() => setVisibleCount((c) => c + 1), 300);
      return () => clearTimeout(timer);
    } else if (visibleCount === lines.length && lines.length > 0) {
      setAnimDone(true);
      const collapseTimer = setTimeout(() => setCollapsed(true), 1200);
      return () => clearTimeout(collapseTimer);
    }
  }, [visibleCount, lines.length]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [visibleCount]);

  const currentProgress = lines.length > 0 ? Math.round((visibleCount / lines.length) * 100) : 0;
  const okCount = lines.filter(l => l.status === 'ok').length;
  const warnCount = lines.filter(l => l.status === 'warn').length;

  const statusColor = (s: string) => {
    if (s === 'ok') return 'text-emerald-400';
    if (s === 'info') return 'text-blue-400';
    if (s === 'warn') return 'text-amber-400';
    return 'text-gray-500';
  };

  if (collapsed) {
    return (
      <div
        className="mt-3 px-3 py-2 rounded-lg bg-[#08080e] border border-emerald-500/10 flex items-center gap-2 cursor-pointer hover:bg-[#0a0a14] transition-colors"
        onClick={() => setCollapsed(false)}
      >
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/12 text-emerald-400">DONE</span>
        <span className="text-[10px] text-gray-400">{lines.length} steps completed</span>
        {warnCount > 0 && <span className="text-[10px] text-amber-400">{warnCount} warning{warnCount > 1 ? 's' : ''}</span>}
        <ChevronDown size={12} className="ml-auto text-gray-600" />
      </div>
    );
  }

  return (
    <div className="mt-3 p-3.5 rounded-xl bg-[#08080e] border border-indigo/15">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[11px] font-semibold text-indigo-300">Execution Log</span>
        {animDone ? (
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-emerald-500/12 text-emerald-400">COMPLETED</span>
        ) : (
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-indigo/20 text-indigo-300">RUNNING</span>
        )}
        {animDone && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto px-2 py-0.5 rounded text-[10px] font-medium text-gray-400 hover:text-indigo-300 hover:bg-indigo/10 transition-colors"
          >
            <ChevronUp size={12} />
          </button>
        )}
        {!animDone && onViewDetails && (
          <button
            onClick={onViewDetails}
            className="ml-auto px-2 py-0.5 rounded text-[10px] font-medium text-gray-400 hover:text-indigo-300 hover:bg-indigo/10 transition-colors"
          >
            Run Details
          </button>
        )}
      </div>
      <div ref={logRef} className="font-mono text-[10px] leading-[1.9] space-y-0 max-h-[140px] overflow-y-auto scrollbar-thin">
        {lines.slice(0, visibleCount).map((line, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-gray-600 flex-shrink-0">{line.time}</span>
            <span className={statusColor(line.status)}>{line.text}</span>
          </div>
        ))}
      </div>
      {!animDone && (
        <div className="mt-2 h-[3px] rounded-sm bg-white/[0.04] overflow-hidden">
          <div
            className="h-full rounded-sm bg-gradient-to-r from-indigo to-[#7F43AD] transition-all duration-300"
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function ResultCard({
  title,
  body,
  stats,
  buttons,
}: {
  title: string;
  body: string;
  stats: [string, string][];
  buttons: { label: string; primary: boolean }[];
}) {
  return (
    <div className="mt-3 p-3.5 rounded-xl bg-[#0d0d12] border border-emerald-500/12">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[13px]">
          ✅
        </div>
        <span className="text-xs font-semibold text-emerald-400">{title}</span>
      </div>
      <div
        className="text-xs text-gray-400 leading-[1.7] [&_strong]:text-gray-200 [&_strong]:font-medium"
        dangerouslySetInnerHTML={{ __html: body }}
      />
      <div className="grid grid-cols-3 gap-2.5 mt-2.5 pt-2.5 border-t border-white/[0.04]">
        {stats.map(([num, label], i) => (
          <div key={i}>
            <div className="text-[15px] font-bold text-white">{num}</div>
            <div className="text-[9px] text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      {buttons.length > 0 && (
        <div className="flex gap-2 mt-3">
          {buttons.map((btn, i) => (
            <button
              key={i}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                btn.primary
                  ? 'bg-indigo/12 border border-indigo/25 text-indigo-300 hover:bg-indigo/20'
                  : 'border border-white/[0.08] text-gray-400 hover:border-white/15 hover:text-gray-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
