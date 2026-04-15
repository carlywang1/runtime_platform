import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, File, FolderOpen } from 'lucide-react';
import type { PanelParam } from '../../data/runAgentScenarios';

interface RunDetailsPanelProps {
  agentName: string;
  agentDescription: string;
  params: PanelParam[];
  agentFiles: { name: string; type: 'file' | 'folder' }[];
  fileContents: Record<string, string>;
}

export default function RunDetailsPanel({
  agentName,
  agentDescription,
  params,
  agentFiles,
  fileContents,
}: RunDetailsPanelProps) {
  const [filesOpen, setFilesOpen] = useState(false);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const handleFileClick = (fileName: string) => {
    if (!(fileName in fileContents)) return;
    setExpandedFile((prev) => (prev === fileName ? null : fileName));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Agent header */}
      <div className="px-5 pt-4 pb-3 border-b border-white/5 flex-shrink-0">
        <h2 className="text-sm font-semibold text-white mb-0.5">{agentName}</h2>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{agentDescription}</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Agent Files — collapsible with inline file preview */}
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
            <div className="px-4 pb-3 space-y-0.5">
              {agentFiles.map((file, i) => {
                const hasContent = file.type === 'file' && file.name in fileContents;
                const isExpanded = expandedFile === file.name;
                return (
                  <div key={i}>
                    <div
                      onClick={() => hasContent && handleFileClick(file.name)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors ${
                        hasContent ? 'cursor-pointer hover:bg-white/[0.04]' : ''
                      } ${isExpanded ? 'bg-white/[0.03]' : ''}`}
                    >
                      {file.type === 'folder' ? (
                        <FolderOpen className="w-3.5 h-3.5 text-amber-400/60 flex-shrink-0" />
                      ) : file.name.endsWith('.md') ? (
                        <FileText className="w-3.5 h-3.5 text-blue-400/60 flex-shrink-0" />
                      ) : (
                        <File className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      )}
                      <span className={`text-[11px] truncate ${isExpanded ? 'text-white' : 'text-gray-400'}`}>
                        {file.name}
                      </span>
                      {hasContent && (
                        <span className="ml-auto">
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3 text-gray-600" />
                          ) : (
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                          )}
                        </span>
                      )}
                    </div>
                    {isExpanded && (
                      <div className="mt-1 mb-2 mx-2 rounded-lg bg-[#08080e] border border-white/[0.06] overflow-hidden">
                        <div className="px-3 py-1.5 border-b border-white/[0.04] flex items-center">
                          <span className="text-[10px] text-gray-500 font-medium">{file.name}</span>
                        </div>
             <pre className="p-3 text-[10px] leading-[1.7] text-gray-400 font-mono overflow-x-auto max-h-[240px] overflow-y-auto scrollbar-thin">
                          {fileContents[file.name]}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Execution Parameters — read-only */}
        <div className="border-b border-white/5">
          <div className="flex items-center gap-2 px-4 py-3">
            <span className="text-xs font-medium text-gray-300">Execution Parameters</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-gray-500">
              {params.filter((p) => p.value.trim()).length}/{params.length}
            </span>
          </div>
          <div className="px-4 pb-3 space-y-2">
            {params.map((param) => (
              <div key={param.name} className="py-2 px-3 rounded-lg bg-black/40">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-gray-300">{param.name}</span>
                  {param.value.trim() ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-400">FILLED</span>
                  ) : param.status === 'optional' ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/5 text-gray-500">OPTIONAL</span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/15 text-rose-400">REQUIRED</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 truncate">
                  {param.value || <span className="italic text-gray-600">—</span>}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Extra Files — read-only */}
        <div className="border-b border-white/5">
          <div className="px-4 py-3">
            <span className="text-xs font-medium text-gray-300">Extra Files</span>
          </div>
          <div className="px-4 pb-3">
            <p className="text-[11px] text-gray-600 italic">No extra files attached</p>
          </div>
        </div>
      </div>
    </div>
  );
}
