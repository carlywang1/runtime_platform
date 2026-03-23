import { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowRight, GitBranch, Shuffle } from 'lucide-react';

interface AgentStructure {
  id: string;
  name: string;
  emoji: string;
  role: string;
  roleLabel: string;
  description: string;
  inputFrom?: string;
  outputTo?: string;
  tools: string[];
  approvalRule?: string;
  handoffTargets?: { targetName: string; targetEmoji: string; condition: string }[];
  dispatchRules?: { targetName: string; targetEmoji: string; condition: string }[];
}

interface TeamStructureData {
  id: string;
  name: string;
  type: 'workflow' | 'manager' | 'handoffs';
  description: string;
  version: string;
  agents: AgentStructure[];
}

function AgentCard({ agent, isExpanded, onToggle, teamType }: {
  agent: AgentStructure;
  isExpanded: boolean;
  onToggle: () => void;
  teamType: string;
}) {
  return (
    <div className="relative">
      {/* Card */}
      <div
        className="bg-dark-50 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4">
          <span className="text-2xl flex-shrink-0">{agent.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{agent.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-gray-500 uppercase tracking-wider">
                {agent.roleLabel}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{agent.description}</p>
          </div>
          <div className="text-gray-500">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-0 space-y-3 border-t border-white/5 mt-0 pt-3">
            {/* Input/Output for workflow */}
            {teamType === 'workflow' && (
              <div className="grid grid-cols-2 gap-3">
                {agent.inputFrom && (
                  <div className="p-2.5 rounded-lg bg-black/40">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Input from</p>
                    <p className="text-xs text-indigo-400">{agent.inputFrom}</p>
                  </div>
                )}
                {agent.outputTo && (
                  <div className="p-2.5 rounded-lg bg-black/40">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Output to</p>
                    <p className="text-xs text-emerald-400">{agent.outputTo}</p>
                  </div>
                )}
              </div>
            )}

            {/* Dispatch rules for manager */}
            {teamType === 'manager' && agent.dispatchRules && agent.dispatchRules.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Dispatch Rules</p>
                <div className="space-y-1.5">
                  {agent.dispatchRules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-black/40">
                      <ArrowRight className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                      <span className="text-xs text-gray-300">
                        <span className="text-white">{rule.targetEmoji} {rule.targetName}</span>
                        <span className="text-gray-500 ml-1.5">— {rule.condition}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Handoff targets for handoffs */}
            {teamType === 'handoffs' && agent.handoffTargets && agent.handoffTargets.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Can Handoff To</p>
                <div className="space-y-1.5">
                  {agent.handoffTargets.map((target, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-black/40">
                      <Shuffle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <span className="text-xs text-gray-300">
                        <span className="text-white">{target.targetEmoji} {target.targetName}</span>
                        <span className="text-gray-500 ml-1.5">— {target.condition}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tools */}
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Tools</p>
              <div className="flex flex-wrap gap-1.5">
                {agent.tools.map((tool) => (
                  <span key={tool} className="px-2 py-1 rounded-md text-[11px] bg-white/5 text-gray-400">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Approval rule */}
            {agent.approvalRule && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-1">Approval Required</p>
                <p className="text-xs text-amber-300/80">{agent.approvalRule}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Workflow Structure: horizontal pipeline ── */
function WorkflowDiagram({ agents }: { agents: AgentStructure[] }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-4 px-2">
      {agents.map((agent, i) => (
        <div key={agent.id} className="flex items-center">
          <div className="flex flex-col items-center min-w-[100px]">
            <span className="text-2xl mb-1">{agent.emoji}</span>
            <span className="text-[11px] text-white font-medium text-center leading-tight">{agent.name}</span>
            <span className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">{agent.roleLabel}</span>
          </div>
          {i < agents.length - 1 && (
            <div className="flex items-center mx-1">
              <div className="w-8 h-px bg-indigo/40" />
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400 -ml-1" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Manager Structure: tree layout ── */
function ManagerDiagram({ agents }: { agents: AgentStructure[] }) {
  const manager = agents.find(a => a.role === 'Manager');
  const specialists = agents.filter(a => a.role !== 'Manager');

  return (
    <div className="flex flex-col items-center py-4">
      {/* Manager */}
      {manager && (
        <div className="flex flex-col items-center mb-4">
          <span className="text-3xl mb-1">{manager.emoji}</span>
          <span className="text-[11px] text-white font-medium">{manager.name}</span>
          <span className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">{manager.roleLabel}</span>
        </div>
      )}
      {/* Connector lines */}
      <div className="flex items-start justify-center gap-0 relative">
        {/* Horizontal bar */}
        <div
          className="absolute top-0 h-px bg-indigo/40"
          style={{
            left: `${100 / (specialists.length * 2)}%`,
            right: `${100 / (specialists.length * 2)}%`,
          }}
        />
        {/* Vertical line from manager */}
        <div className="absolute -top-4 left-1/2 w-px h-4 bg-indigo/40" />
        {/* Specialists */}
        {specialists.map((agent) => (
          <div key={agent.id} className="flex flex-col items-center min-w-[100px] relative">
            <div className="w-px h-4 bg-indigo/40 mb-1" />
            <span className="text-2xl mb-1">{agent.emoji}</span>
            <span className="text-[11px] text-white font-medium text-center leading-tight">{agent.name}</span>
            <span className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">{agent.roleLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Handoffs Structure: radial/hub layout ── */
function HandoffsDiagram({ agents }: { agents: AgentStructure[] }) {
  const entry = agents.find(a => a.roleLabel === 'ENTRY');
  const others = agents.filter(a => a.roleLabel !== 'ENTRY');

  return (
    <div className="flex flex-col items-center py-4">
      {/* Entry agent */}
      {entry && (
        <div className="flex flex-col items-center mb-3">
          <span className="text-3xl mb-1">{entry.emoji}</span>
          <span className="text-[11px] text-white font-medium">{entry.name}</span>
          <span className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">Entry Point</span>
        </div>
      )}
      {/* Bidirectional arrows down */}
      <div className="flex items-center gap-1 text-amber-400 mb-3">
        <Shuffle className="w-4 h-4" />
        <span className="text-[10px] text-gray-500">dynamic handoffs</span>
        <Shuffle className="w-4 h-4" />
      </div>
      {/* Other agents in a row */}
      <div className="flex items-start justify-center gap-6">
        {others.map((agent) => (
          <div key={agent.id} className="flex flex-col items-center min-w-[90px]">
            <span className="text-2xl mb-1">{agent.emoji}</span>
            <span className="text-[11px] text-white font-medium text-center leading-tight">{agent.name}</span>
            <span className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">{agent.roleLabel}</span>
          </div>
        ))}
      </div>
      {/* Mutual handoff hint */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-amber-500/20" />
        <span className="text-[9px] text-gray-600">↔ agents can handoff to each other</span>
        <div className="h-px flex-1 bg-amber-500/20" />
      </div>
    </div>
  );
}

/* ── Main StructureView component ── */
export default function StructureView({ team }: { team: TeamStructureData }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const typeLabel = {
    workflow: 'Workflow Pipeline',
    manager: 'Manager Delegation',
    handoffs: 'Dynamic Handoffs',
  };

  const typeIcon = {
    workflow: <ArrowRight className="w-3.5 h-3.5" />,
    manager: <GitBranch className="w-3.5 h-3.5" />,
    handoffs: <Shuffle className="w-3.5 h-3.5" />,
  };

  return (
    <div className="space-y-6">
      {/* Team meta */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo/20 text-indigo-400">
            {typeIcon[team.type]}
            {typeLabel[team.type]}
          </span>
          <span className="text-xs text-gray-500">{team.agents.length} Agents</span>
          <span className="text-xs text-gray-500">·</span>
          <span className="text-xs text-gray-500">{team.version}</span>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{team.description}</p>
      </div>

      {/* Structure diagram */}
      <div className="bg-dark-50 rounded-xl border border-white/5 p-4">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Collaboration Structure</p>
        {team.type === 'workflow' && <WorkflowDiagram agents={team.agents} />}
        {team.type === 'manager' && <ManagerDiagram agents={team.agents} />}
        {team.type === 'handoffs' && <HandoffsDiagram agents={team.agents} />}
      </div>

      {/* Agent detail cards */}
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Agent Details</p>
        <div className="space-y-2 relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-white/5" />
          {team.agents.map((agent) => (
            <div key={agent.id} className="relative pl-10">
              {/* Timeline dot */}
              <div className="absolute left-[15px] top-5 w-[9px] h-[9px] rounded-full bg-dark-50 border-2 border-indigo/40 z-10" />
              <AgentCard
                agent={agent}
                isExpanded={expandedId === agent.id}
                onToggle={() => toggleExpand(agent.id)}
                teamType={team.type}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { TeamStructureData, AgentStructure };
