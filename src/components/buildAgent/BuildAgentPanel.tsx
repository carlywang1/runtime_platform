'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Save, Upload, History, X, RotateCcw,
  Download, MoreHorizontal, ChevronRight, File, Folder,
  FolderOpen, Plus, Trash2, GitBranch, GitCommit, Tag,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
}

interface BuildAgentPanelProps {
  agentName: string;
  initialFiles: Record<string, string>;
  onClose?: () => void;
  updated?: boolean;
  publishing?: boolean;
  published?: boolean;
  onPublish?: () => void;
}

// ── Status styling ──────────────────────────────────────────────────────────

const STATUS_CLASS: Record<string, string> = {
  drafting: 'bg-white/10 text-gray-400',
  draft_saved: 'bg-yellow-500/15 text-yellow-400',
  published: 'bg-emerald-500/15 text-emerald-400',
};

const STATUS_LABEL: Record<string, string> = {
  drafting: 'Drafting',
  draft_saved: 'Draft Saved',
  published: 'Published',
};

// ── Build file tree from flat paths ─────────────────────────────────────────

function buildFileTree(files: Record<string, string>): TreeNode[] {
  const root: TreeNode[] = [];
  const sortedPaths = Object.keys(files).sort();

  for (const filePath of sortedPaths) {
    const parts = filePath.split('/');
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');
      const existing = currentLevel.find((n) => n.name === part);

      if (isLast) {
        if (!existing) {
          currentLevel.push({ name: part, path: currentPath, type: 'file' });
        }
      } else {
        if (existing && existing.type === 'directory') {
          currentLevel = existing.children!;
        } else {
          const dir: TreeNode = { name: part, path: currentPath, type: 'directory', children: [] };
          currentLevel.push(dir);
          currentLevel = dir.children!;
        }
      }
    }
  }

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children) sortNodes(node.children);
    }
  };
  sortNodes(root);
  return root;
}

// ── File Tree Node ──────────────────────────────────────────────────────────

function FileTreeNodeView({
  node, activeFile, onSelect, onDelete, depth = 0,
}: {
  node: TreeNode; activeFile: string | null; onSelect: (path: string) => void; onDelete: (path: string) => void; depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const isDir = node.type === 'directory';
  const isActive = node.path === activeFile;

  return (
    <div>
      <button
        onClick={() => { if (isDir) setExpanded((v) => !v); else onSelect(node.path); }}
        className={`group flex w-full items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
          isActive ? 'bg-indigo/10 text-indigo-300' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isDir ? (
          <>
            <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            {expanded ? <FolderOpen className="w-3.5 h-3.5 shrink-0" /> : <Folder className="w-3.5 h-3.5 shrink-0" />}
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <File className="w-3.5 h-3.5 shrink-0" />
          </>
        )}
        <span className="truncate flex-1 text-left">{node.name}</span>
        {!isDir && (
          <Trash2
            className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 text-rose-400 transition-opacity"
            onClick={(e) => { e.stopPropagation(); onDelete(node.path); }}
          />
        )}
      </button>
      {isDir && expanded && node.children?.map((child) => (
        <FileTreeNodeView key={child.path} node={child} activeFile={activeFile} onSelect={onSelect} onDelete={onDelete} depth={depth + 1} />
      ))}
    </div>
  );
}

// ── Add File Button ─────────────────────────────────────────────────────────

function AddFileButton({ label, onAdd }: { label: string; onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(true); setName(''); }}
        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <Plus className="w-3 h-3" />
        <span>{label}</span>
      </button>
      {open && (
        <div className="absolute left-0 bottom-full mb-1 z-50 w-48 rounded-lg border border-white/[0.08] bg-[#0d0d12] shadow-md p-2">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) { onAdd(name.trim()); setOpen(false); }
              if (e.key === 'Escape') setOpen(false);
            }}
            placeholder="name (snake_case)"
            className="w-full px-2 py-1 text-xs rounded border border-white/[0.08] bg-white/[0.03] text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo/50"
          />
          <div className="flex justify-end gap-1 mt-1.5">
            <button onClick={() => setOpen(false)} className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-300">Cancel</button>
            <button onClick={() => { if (name.trim()) { onAdd(name.trim()); setOpen(false); } }} className="px-2 py-0.5 text-xs bg-indigo text-white rounded">Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Version Card ────────────────────────────────────────────────────────────

function VersionCard({ version: v }: { version: { id: string; kind: string; version_label: string; created_at: string; branch_name: string | null; commit_sha: string | null; tag_name: string | null } }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
      <button onClick={() => setExpanded((e) => !e)} className="flex items-center justify-between w-full mb-1">
        <span className="text-sm font-medium text-white">{v.version_label}</span>
        <div className="flex items-center gap-1.5">
          {v.commit_sha && <span className="text-[10px] font-mono text-gray-500">{v.commit_sha.slice(0, 7)}</span>}
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${v.kind === 'published' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/15 text-yellow-400'}`}>{v.kind}</span>
          <ChevronRight className={`w-3 h-3 text-gray-600 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>
      <div className="text-xs text-gray-500 mb-1">{new Date(v.created_at).toLocaleString()}</div>
      {expanded && (
        <div className="mt-2 mb-1 space-y-1.5 text-[11px]">
          {v.branch_name && <div className="flex items-center gap-1.5 text-gray-500"><GitBranch className="w-3 h-3 shrink-0" /><span className="font-mono truncate">{v.branch_name}</span></div>}
          {v.commit_sha && <div className="flex items-center gap-1.5 text-gray-500"><GitCommit className="w-3 h-3 shrink-0" /><span className="font-mono">{v.commit_sha.slice(0, 12)}</span></div>}
          {v.tag_name && <div className="flex items-center gap-1.5 text-gray-500"><Tag className="w-3 h-3 shrink-0" /><span className="font-mono truncate">{v.tag_name}</span></div>}
        </div>
      )}
      <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors mt-1">
        <RotateCcw className="w-3 h-3" />Rollback
      </button>
    </div>
  );
}

// ── Mock versions ───────────────────────────────────────────────────────────

const MOCK_VERSIONS = [
  { id: '1', kind: 'draft', version_label: 'v1.0-draft', created_at: new Date().toISOString(), branch_name: 'main', commit_sha: 'a3f8c2d1e5b7', tag_name: null, rollback_source_version_id: null },
];

// ── Main Component ──────────────────────────────────────────────────────────

export default function BuildAgentPanel({ agentName, initialFiles, onClose, updated, publishing, published, onPublish }: BuildAgentPanelProps) {
  const [files, setFiles] = useState<Record<string, string>>(initialFiles);
  const [activeFile, setActiveFile] = useState<string | null>(Object.keys(initialFiles)[0] || null);
  const [specStatus, setSpecStatus] = useState<string>('draft_saved');
  const [showVersions, setShowVersions] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<Record<string, string>>(initialFiles);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (updated) {
      setRefreshing(true);
      const t = setTimeout(() => setRefreshing(false), 1500);
      return () => clearTimeout(t);
    }
  }, [updated]);

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setIsNarrow(entry.contentRect.width < 420));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!showMoreMenu) return;
    const handler = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) setShowMoreMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMoreMenu]);

  const isDirty = JSON.stringify(files) !== JSON.stringify(savedSnapshot);

  const updateFile = useCallback((path: string, content: string) => {
    setFiles((prev) => ({ ...prev, [path]: content }));
    if (specStatus === 'draft_saved' || specStatus === 'published') setSpecStatus('drafting');
  }, [specStatus]);

  const addFile = useCallback((path: string, content: string) => {
    setFiles((prev) => ({ ...prev, [path]: content }));
    setActiveFile(path);
  }, []);

  const deleteFile = useCallback((path: string) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[path];
      return next;
    });
    if (activeFile === path) {
      const remaining = Object.keys(files).filter((p) => p !== path);
      setActiveFile(remaining[0] || null);
    }
  }, [activeFile, files]);

  function handleSaveDraft() {
    setSavedSnapshot({ ...files });
    setSpecStatus('draft_saved');
  }

  function handlePublish() {
    setSavedSnapshot({ ...files });
    setSpecStatus('published');
    onPublish?.();
  }

  function handleExport() {
    try {
      const { strToU8, zipSync } = require('fflate');
      const zipFiles: Record<string, Uint8Array> = {};
      for (const [path, content] of Object.entries(files)) {
        zipFiles[path] = strToU8(content);
      }
      const zip = zipSync(zipFiles);
      const blob = new Blob([zip.buffer as ArrayBuffer], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${agentName.replace(/\s+/g, '-').toLowerCase()}-spec.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const content = Object.entries(files).map(([p, c]) => `--- ${p} ---\n${c}`).join('\n\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${agentName.replace(/\s+/g, '-').toLowerCase()}-spec.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  function handleAddAgent(name: string) {
    const safeName = name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    const path = `agents/${safeName}.yaml`;
    if (files[path]) return;
    const template = `name: ${safeName}\nmodel: openai:gpt-4o\ndescription: ""\ninstructions:\n  - ""\noutput_schema:\n  type: object\n  properties:\n    control:\n      type: object\n      required: [status]\n      properties:\n        status:\n          type: string\n          enum: [running, finished, failed]\n  required: [control]\ncapabilities: []\nmodel_settings:\n  max_tokens: 4096\nmetadata: {}\n`;
    addFile(path, template);
  }

function handleAddSkill(name: string) {
    const safeName = name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    const path = `skills/${safeName}/SKILL.md`;
    if (files[path]) return;
    const template = `---\nname: ${safeName}\ndescription: ""\n---\n\n# ${safeName}\n\n`;
    addFile(path, template);
  }

  const tree = buildFileTree(files);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] relative">
      {refreshing && (
        <div className="absolute inset-0 z-50 bg-[#0a0a0f]/80 flex items-center justify-center backdrop-blur-[1px]">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
            <span className="text-sm text-indigo-300 font-medium">Updating agent spec...</span>
          </div>
        </div>
      )}
      {publishing && (
        <div className="absolute inset-0 z-50 bg-[#0a0a0f]/80 flex items-center justify-center backdrop-blur-[1px]">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
            <span className="text-sm text-emerald-300 font-medium">Publishing to Teams...</span>
          </div>
        </div>
      )}
      {/* Toolbar */}
      <div ref={toolbarRef} className="flex-shrink-0 h-14 border-b border-white/[0.06] flex items-center gap-2 px-3">
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-white text-sm truncate block">{agentName}</span>
        </div>
        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide bg-blue-500/15 text-blue-400">
          agent
        </span>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[specStatus] ?? STATUS_CLASS.drafting}`}>
          {STATUS_LABEL[specStatus] ?? specStatus}
        </span>

        {!isNarrow && (
          <>
            <button
              onClick={() => setShowVersions((v) => !v)}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${showVersions ? 'bg-white/[0.06] text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'}`}
            >
              <History className="w-3.5 h-3.5" /><span>History</span>
            </button>
            <button onClick={handleExport} className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-xs text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors">
              <Download className="w-3.5 h-3.5" /><span>Export</span>
            </button>
            <button onClick={handleSaveDraft} className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-xs text-white hover:bg-white/[0.04] transition-colors">
              <Save className="w-3.5 h-3.5" /><span>Save</span>
            </button>
            <button onClick={handlePublish} disabled={published && !isDirty} className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${published && !isDirty ? 'bg-emerald-500/15 text-emerald-400 cursor-default' : 'bg-indigo text-white hover:bg-indigo/80'}`}>
              <Upload className="w-3.5 h-3.5" /><span>{published && !isDirty ? 'Published' : 'Publish'}</span>
            </button>
          </>
        )}

        {isNarrow && (
          <>
            <button onClick={handleSaveDraft} className="shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg border border-white/[0.08] text-xs text-white hover:bg-white/[0.04] transition-colors">
              <Save className="w-3.5 h-3.5" /><span>Save</span>
            </button>
            <button onClick={handlePublish} disabled={published && !isDirty} className={`shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${published && !isDirty ? 'bg-emerald-500/15 text-emerald-400 cursor-default' : 'bg-indigo text-white hover:bg-indigo/80'}`}>
              <Upload className="w-3.5 h-3.5" /><span>{published && !isDirty ? 'Published' : 'Publish'}</span>
            </button>
            <div ref={moreMenuRef} className="relative shrink-0">
              <button onClick={() => setShowMoreMenu((v) => !v)} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.04] transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-1 z-50 min-w-36 rounded-lg border border-white/[0.08] bg-[#0d0d12] shadow-md py-1 text-sm">
                  <button onClick={() => { setShowVersions((v) => !v); setShowMoreMenu(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-400 hover:bg-white/[0.04] hover:text-white transition-colors">
                    <History className="w-3.5 h-3.5" />History
                  </button>
                  <button onClick={() => { handleExport(); setShowMoreMenu(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-400 hover:bg-white/[0.04] hover:text-white transition-colors">
                    <Download className="w-3.5 h-3.5" />Export
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {onClose && (
          <button onClick={onClose} className="shrink-0 ml-1 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.04] transition-colors" title="Close panel">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex flex-1 min-h-0">
        {/* File tree sidebar */}
        <div className="flex-shrink-0 w-44 border-r border-white/[0.06] flex flex-col">
          <div className="flex-1 overflow-y-auto py-2">
            {tree.map((node) => (
              <FileTreeNodeView key={node.path} node={node} activeFile={activeFile} onSelect={setActiveFile} onDelete={deleteFile} />
            ))}
          </div>
          <div className="flex-shrink-0 border-t border-white/[0.06] px-1 py-1.5 space-y-0.5">
            <AddFileButton label="Agent" onAdd={handleAddAgent} />
            <AddFileButton label="Skill" onAdd={handleAddSkill} />
          </div>
        </div>

        {/* Editor panel */}
        <div className="flex flex-col flex-1 min-w-0">
          {activeFile ? (
            <>
              <div className="flex-shrink-0 flex items-center border-b border-white/[0.06] px-4 py-2">
                <span className="text-xs font-mono text-gray-500">{activeFile}</span>
                {isDirty && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" title="Unsaved changes" />}
              </div>
              <div className="flex-1 min-h-0 p-4">
                <textarea
                  value={files[activeFile] ?? ''}
                  onChange={(e) => updateFile(activeFile, e.target.value)}
                  spellCheck={false}
                  className="w-full h-full resize-none rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm font-mono text-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo/30"
                  placeholder={`# ${activeFile}`}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Select a file from the tree
            </div>
          )}
        </div>

        {/* Version history sidebar */}
        {showVersions && !isNarrow && (
          <div className="flex-shrink-0 w-56 border-l border-white/[0.06] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <span className="text-sm font-semibold text-white">Version History</span>
              <button onClick={() => setShowVersions(false)} className="p-1 rounded text-gray-500 hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-white/[0.04]">
                {MOCK_VERSIONS.map((v) => <VersionCard key={v.id} version={v} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
