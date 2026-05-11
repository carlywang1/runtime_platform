'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Play, CheckSquare, Square, Pencil, Plus } from 'lucide-react';
import type { TestCase, TestCaseInput, TestCaseExpected, TestCaseExecLog } from '../../data/testCasesScenarios';

interface TestCasesPanelProps {
  cases: TestCase[];
  execLogs: Record<string, TestCaseExecLog>;
  onRunAll: () => void;
  onRunSingle: (caseId: string) => void;
  onUpdateCase: (caseId: string, updates: Partial<TestCase>) => void;
  onToggleSelect: (caseId: string) => void;
  onToggleSelectAll: () => void;
  onClose: () => void;
}

const statusBadge = (status: TestCase['status']) => {
  switch (status) {
    case 'pass':
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400">PASS</span>;
    case 'fail':
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/15 text-rose-400">FAIL</span>;
    case 'running':
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/15 text-blue-400 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full border border-blue-400 border-t-transparent animate-spin" />
          RUNNING
        </span>
      );
    default:
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 text-gray-500">PENDING</span>;
  }
};

export default function TestCasesPanel({
  cases,
  execLogs,
  onRunAll,
  onRunSingle,
  onUpdateCase,
  onToggleSelect,
  onToggleSelectAll,
  onClose,
}: TestCasesPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ input: TestCaseInput; expected: TestCaseExpected } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const total = cases.length;
  const passed = cases.filter(c => c.status === 'pass').length;
  const failed = cases.filter(c => c.status === 'fail').length;
  const running = cases.filter(c => c.status === 'running').length;
  const allSelected = cases.every(c => c.selected);
  const someSelected = cases.some(c => c.selected);

  // Auto-expand running case, collapse when done
  useEffect(() => {
    const runningCase = cases.find(c => c.status === 'running');
    if (runningCase) {
      setExpandedId(runningCase.id);
    }
  }, [cases]);

  const handleEdit = (tc: TestCase) => {
    setEditingId(tc.id);
    setEditDraft({ input: { ...tc.input }, expected: { ...tc.expected } });
    setExpandedId(tc.id);
  };

  const handleSave = () => {
    if (editingId && editDraft) {
      onUpdateCase(editingId, { input: editDraft.input, expected: editDraft.expected });
      setEditingId(null);
      setEditDraft(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-white leading-tight">Test Cases</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Validation</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="px-5 pb-3 flex-shrink-0">
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center py-2 rounded-lg bg-white/[0.03]">
            <div className="text-sm font-bold text-white">{total}</div>
            <div className="text-[9px] text-gray-500">Total</div>
          </div>
          <div className="text-center py-2 rounded-lg bg-emerald-500/[0.06]">
            <div className="text-sm font-bold text-emerald-400">{passed}</div>
            <div className="text-[9px] text-gray-500">Passed</div>
          </div>
          <div className="text-center py-2 rounded-lg bg-rose-500/[0.06]">
            <div className="text-sm font-bold text-rose-400">{failed}</div>
            <div className="text-[9px] text-gray-500">Failed</div>
          </div>
          <div className="text-center py-2 rounded-lg bg-blue-500/[0.06]">
            <div className="text-sm font-bold text-blue-400">{running}</div>
            <div className="text-[9px] text-gray-500">Running</div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-5 pb-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={onToggleSelectAll}
          className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors"
        >
          {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-indigo-400" /> : someSelected ? <CheckSquare className="w-3.5 h-3.5 text-gray-500" /> : <Square className="w-3.5 h-3.5" />}
          Select All
        </button>
        <button
          onClick={onRunAll}
          disabled={running > 0 || !someSelected}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-indigo/15 border border-indigo/25 text-indigo-300 hover:bg-indigo/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-3 h-3" />
          Run All
        </button>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-white/[0.06]" />

      {/* Case List */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
        {cases.map((tc, idx) => (
          <div
            key={tc.id}
            className={`rounded-lg border overflow-hidden transition-colors ${
              tc.status === 'running' ? 'border-blue-500/20 bg-blue-500/[0.03]' :
              tc.status === 'pass' ? 'border-emerald-500/10 bg-white/[0.01]' :
              tc.status === 'fail' ? 'border-rose-500/10 bg-white/[0.01]' :
              'border-white/[0.06] bg-white/[0.02]'
            }`}
          >
            {/* Case Row */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
              onClick={() => setExpandedId(expandedId === tc.id ? null : tc.id)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSelect(tc.id); }}
                className="flex-shrink-0"
              >
                {tc.selected
                  ? <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                  : <Square className="w-3.5 h-3.5 text-gray-600" />
                }
              </button>
              <span className="text-[10px] text-gray-600 font-mono w-5 flex-shrink-0">#{idx + 1}</span>
              <span className="flex-1 text-[11px] text-gray-300 truncate min-w-0">{tc.name}</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {statusBadge(tc.status)}
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(tc); }}
                  disabled={tc.status === 'running'}
                  className="p-1 rounded text-gray-600 hover:text-gray-300 hover:bg-white/5 disabled:opacity-30 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRunSingle(tc.id); }}
                  disabled={tc.status === 'running' || running > 0}
                  className="p-1 rounded text-gray-600 hover:text-indigo-300 hover:bg-indigo/10 disabled:opacity-30 transition-colors"
                >
                  <Play className="w-3 h-3" />
                </button>
                {expandedId === tc.id
                  ? <ChevronDown className="w-3 h-3 text-gray-600" />
                  : <ChevronRight className="w-3 h-3 text-gray-600" />
                }
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === tc.id && (
              <div className="px-3 pb-3 pt-1 border-t border-white/[0.04] space-y-2.5">
                {/* Input */}
                <div>
                  <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Input</div>
                  {editingId === tc.id && editDraft ? (
                    <div className="space-y-1.5">
                      <input
                        value={editDraft.input.from}
                        onChange={e => setEditDraft({ ...editDraft, input: { ...editDraft.input, from: e.target.value } })}
                        placeholder="From"
                        className="w-full h-6 px-2 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo/40"
                      />
                      <input
                        value={editDraft.input.subject}
               onChange={e => setEditDraft({ ...editDraft, input: { ...editDraft.input, subject: e.target.value } })}
                        placeholder="Subject"
                        className="w-full h-6 px-2 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo/40"
                      />
                      <textarea
                        value={editDraft.input.body}
                        onChange={e => setEditDraft({ ...editDraft, input: { ...editDraft.input, body: e.target.value } })}
                        placeholder="Body"
                        rows={2}
                        className="w-full px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo/40 resize-none"
                      />
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-400 space-y-0.5 bg-white/[0.02] rounded px-2 py-1.5">
                      <div><span className="text-gray-600">From:</span> {tc.input.from}</div>
                      <div><span className="text-gray-600">Subject:</span> {tc.input.subject || '(empty)'}</div>
                      <div className="line-clamp-2"><span className="text-gray-600">Body:</span> {tc.input.body || '(empty)'}</div>
                    </div>
                  )}
                </div>

                {/* Expected */}
                <div>
                  <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Expected</div>
                  {editingId === tc.id && editDraft ? (
                    <div className="space-y-1.5">
                      <input
                        value={editDraft.expected.classification}
                        onChange={e => setEditDraft({ ...editDraft, expected: { ...editDraft.expected, classification: e.target.value } })}
                        placeholder="Classification"
                        className="w-full h-6 px-2 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo/40"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-[10px] text-gray-400">
                          <input
                            type="checkbox"
                            checked={editDraft.expected.requires_followup}
                            onChange={e => setEditDraft({ ...editDraft, expected: { ...editDraft.expected, requires_followup: e.target.checked } })}
                            className="w-3 h-3 rounded"
                          />
                          Requires followup
                        </label>
                      </div>
                      {editDraft.expected.requires_followup && (
                        <input
                          value={editDraft.expected.followup_question || ''}
                          onChange={e => setEditDraft({ ...editDraft, expected: { ...editDraft.expected, followup_question: e.target.value } })}
                          placeholder="Followup question contains..."
                          className="w-full h-6 px-2 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo/40"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-400 space-y-0.5 bg-white/[0.02] rounded px-2 py-1.5">
                      <div><span className="text-gray-600">Classification:</span> {tc.expected.classification}</div>
                      {tc.expected.draft_reply_contains && <div><span className="text-gray-600">Reply contains:</span> {tc.expected.draft_reply_contains}</div>}
                      <div><span className="text-gray-600">Requires followup:</span> {tc.expected.requires_followup ? 'Yes' : 'No'}</div>
                      {tc.expected.followup_question && <div><span className="text-gray-600">Followup about:</span> {tc.expected.followup_question}</div>}
                      {tc.expected.routed_to && <div><span className="text-gray-600">Routed to:</span> {tc.expected.routed_to}</div>}
                    </div>
                  )}
                </div>

                {/* Exec Log — chat-style back-and-forth */}
                {execLogs[tc.id] && (tc.status === 'running' || tc.status === 'pass' || tc.status === 'fail') && (
                  <div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Execution Log</div>
                    <div className="rounded-lg bg-[#0a0a12] border border-white/[0.06] overflow-hidden max-h-[220px] overflow-y-auto">
                      <div className="px-2.5 py-2 space-y-2">
                        {execLogs[tc.id].lines.map((line, i) => {
                          const isAgent = line.status === '' || line.status === 'ok';
                          return (
                            <div key={i} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] px-2.5 py-1.5 rounded-lg text-[10px] ${
                                isAgent
                                  ? 'bg-indigo-500/10 border border-indigo-500/15 rounded-br-sm'
                                  : 'bg-white/[0.04] border border-white/[0.06] rounded-bl-sm'
                              }`}>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className={`text-[9px] font-medium ${isAgent ? 'text-indigo-400' : 'text-gray-500'}`}>
                                    {isAgent ? 'Agent' : 'System'}
                                  </span>
                                  <span className="text-[9px] text-gray-600">{line.time}</span>
                                  {line.status === 'ok' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                  {line.status === 'warn' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                                </div>
                                <div className={`font-mono leading-relaxed ${
                                  line.status === 'ok' ? 'text-emerald-300' :
                                  line.status === 'warn' ? 'text-amber-300' :
                                  isAgent ? 'text-indigo-200' : 'text-gray-400'
                                }`}>{line.text}</div>
                              </div>
                            </div>
                          );
                        })}
                        {tc.status === 'running' && (
                          <div className="flex justify-end">
                            <div className="max-w-[85%] px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/15 rounded-br-sm">
                              <div className="flex items-center gap-1.5 text-[10px] text-indigo-300">
                                <span className="w-2 h-2 rounded-full border border-indigo-400 border-t-transparent animate-spin" />
                                <span className="font-mono">Processing...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actual (only shown after run) */}
                {tc.actual && (
                  <div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Actual</div>
                    <div className={`text-[10px] space-y-0.5 rounded px-2 py-1.5 ${tc.status === 'fail' ? 'bg-rose-500/[0.04] border border-rose-500/10' : 'bg-emerald-500/[0.04] border border-emerald-500/10'}`}>
                      {tc.actual.error ? (
                        <div className="text-rose-400">Error: {tc.actual.error}</div>
                      ) : (
                        <>
                          <div><span className="text-gray-600">Classification:</span> <span className="text-gray-300">{tc.actual.classification}</span></div>
                          {tc.actual.draft_reply && <div><span className="text-gray-600">Reply:</span> <span className="text-gray-300 line-clamp-2">{tc.actual.draft_reply}</span></div>}
                          <div><span className="text-gray-600">Requires followup:</span> <span className="text-gray-300">{tc.actual.requires_followup ? 'Yes' : 'No'}</span></div>
                          {tc.actual.followup_question && <div><span className="text-gray-600">Followup:</span> <span className="text-gray-300">{tc.actual.followup_question}</span></div>}
                          {tc.actual.routed_to && <div><span className="text-gray-600">Routed to:</span> <span className="text-gray-300">{tc.actual.routed_to}</span></div>}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Edit Actions */}
                {editingId === tc.id && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSave}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-medium bg-indigo/15 border border-indigo/25 text-indigo-300 hover:bg-indigo/25 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-medium border border-white/[0.08] text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add Case Button — at bottom of list */}
        <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-white/[0.08] hover:border-white/[0.15] text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Add Test Case
        </button>
      </div>
    </div>
  );
}
