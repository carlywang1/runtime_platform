import { useState } from 'react';
import { Play, Pencil, X, ChevronDown, ChevronUp, FileText, File, FolderOpen, Upload, CheckCircle } from 'lucide-react';
import type { PanelParam } from '../../data/runAgentScenarios';

interface AgentFile {
  name: string;
  type: 'file' | 'folder';
}

interface ParamStatePanelProps {
  agentName: string;
  agentDescription: string;
  params: PanelParam[];
  agentFiles?: AgentFile[];
  highlightFields?: string[];
  editing?: boolean;
  hasChanges?: boolean;
  onParamChange?: (name: string, value: string) => void;
  onEditStart?: () => void;
  onEditCancel?: () => void;
  onConfirm?: () => void;
  onRun?: () => void;
}

export default function ParamStatePanel({
  agentName,
  agentDescription,
  params,
  agentFiles = [],
  highlightFields = [],
  editing = false,
  hasChanges = false,
  onParamChange,
  onEditStart,
  onEditCancel,
  onConfirm,
  onRun,
}: ParamStatePanelProps) {
  const [filesOpen, setFilesOpen] = useState(false);
  const [extraFilesOpen, setExtraFilesOpen] = useState(false);

  const statusBadge = (param: PanelParam) => {
    if (param.value.trim())
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-400">FILLED</span>;
    if (param.status === 'optional')
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/5 text-gray-500">OPTIONAL</span>;
    return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/15 text-rose-400">REQUIRED</span>;
  };

  const allRequiredFilled = params
    .filter((p) => p.status !== 'optional')
    .every((p) => p.value.trim() !== '');

  return (
    <div className="flex flex-col h-full">
      {/* Agent header */}
      <div className="px-5 pt-4 pb-3 border-b border-white/5 flex-shrink-0">
        <h2 className="text-sm font-semibold text-white mb-0.5">{agentName}</h2>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{agentDescription}</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Inputs section */}
        <div className="border-b border-white/5">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-300">Inputs</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-gray-500">
                {params.filter((p) => p.value.trim()).length}/{params.length}
              </span>
            </div>
            {!editing && (
              <button
                onClick={onEditStart}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-gray-400 hover:text-indigo-300 hover:bg-indigo/10 transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>
          <div className="px-4 pb-3 space-y-2">
            {params.map((param) => (
              <div
                key={param.name}
                className={`py-2 px-3 rounded-lg bg-black/40 transition-colors ${
                  highlightFields.includes(param.name) ? 'animate-flash-green' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-gray-300">
                    {param.name}
                    {editing && param.status !== 'optional' && !param.value.trim() && (
                      <span className="text-rose-400 ml-0.5">*</span>
                    )}
                  </span>
                  {statusBadge(param)}
                </div>
                {editing ? (
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => onParamChange?.(param.name, e.target.value)}
                    placeholder={param.status === 'optional' ? 'Optional — not required' : 'Required'}
                    className={`w-full h-7 px-2 rounded-lg bg-white/[0.03] text-xs text-white placeholder-gray-600 focus:outline-none transition-colors ${
                      param.status !== 'optional' && !param.value.trim()
                        ? 'border border-rose-500/20 focus:border-rose-500/40'
                        : 'border border-white/[0.06] focus:border-indigo/40'
                    }`}
                  />
                ) : (
                  <p className="text-[11px] text-gray-500 truncate">
                    {param.value || <span className="italic text-gray-600">—</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Agent Files section */}
        <div className="border-b border-white/5">
          <button
            onClick={() => setFilesOpen(!filesOpen)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-300">Agent Files</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-gray-500">
                {agentFiles.length}
              </span>
            </div>
            {filesOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            )}
          </button>
          {filesOpen && (
            <div className="px-4 pb-3 space-y-1">
              {agentFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  {file.type === 'folder' ? (
                    <FolderOpen className="w-3.5 h-3.5 text-amber-400/60 flex-shrink-0" />
                  ) : file.name.endsWith('.md') ? (
                    <FileText className="w-3.5 h-3.5 text-blue-400/60 flex-shrink-0" />
                  ) : (
              <File className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  )}
                  <span className="text-[11px] text-gray-400 truncate">{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Extra Files section */}
        <div className="border-b border-white/5">
          <button
            onClick={() => setExtraFilesOpen(!extraFilesOpen)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
          >
            <span className="text-xs font-medium text-gray-300">Extra Files</span>
            {extraFilesOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            )}
          </button>
          {extraFilesOpen && (
            <div className="px-4 pb-3">
              {editing ? (
                <button className="w-full flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg border border-dashed border-white/[0.08] hover:border-indigo/30 hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-[11px] text-gray-500">Add files</span>
                </button>
              ) : (
                <p className="text-[11px] text-gray-600 italic">No extra files attached</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      {editing ? (
        <div className="flex gap-2 px-4 py-3 border-t border-white/5 flex-shrink-0">
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all bg-gradient-to-r from-indigo to-[#7F43AD] text-white hover:opacity-90"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Confirm
          </button>
          <button
            onClick={onEditCancel}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-400 border border-white/[0.08] hover:border-white/15 hover:text-gray-200 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-white/5 flex-shrink-0">
          <button
            onClick={onRun}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              allRequiredFilled
                ? 'bg-gradient-to-r from-indigo to-[#7F43AD] text-white hover:opacity-90'
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Run
          </button>
        </div>
      )}
    </div>
  );
}
