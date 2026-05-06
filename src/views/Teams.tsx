'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Play, Pause, Search, Code, Store, ExternalLink, Clock, Trash2 } from 'lucide-react';
import Header from '../components/layout/Header';
import CustomSelect from '../components/CustomSelect';

type TeamStatus = 'running' | 'inactive' | 'config_required' | 'error';

const teamStatusConfig: Record<TeamStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  running: { label: 'Running', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', dotColor: 'bg-emerald-400' },
  inactive: { label: 'Inactive', color: 'text-rose-400', bgColor: 'bg-rose-500/20', dotColor: 'bg-rose-400' },
  config_required: { label: 'Config Required', color: 'text-amber-400', bgColor: 'bg-amber-500/20', dotColor: 'bg-amber-400' },
  error: { label: 'Error', color: 'text-rose-400', bgColor: 'bg-rose-500/20', dotColor: 'bg-rose-400' },
};

const mockTeams = [
  {
    id: 'team-1',
    name: 'OMS Agent for Multichannel Orders and Inventory and Fulfillment v1',
    description: 'Unified single-agent OMS/DI operator for Shopify-first multichannel orders, inventory sync, and fulfillment orchestration',
    agentCount: 1,
    status: 'inactive' as TeamStatus,
    source: 'ide_build' as 'ide_build' | 'marketplace',
    mode: 'task' as const,
    tasksToday: 10,
    accuracy: 100.0,
    tokens: 0,
    pendingApprovals: 0,
    agents: [
      { name: 'OMS Agent for Multichannel Orders and Inventory and Fulfillment v2', emoji: '🛒' },
    ],
    version: 'v7',
  },
  {
    id: 'team-2',
    name: 'Email Draft Confirmation Assistant',
    description: 'Drafts an email subject and body from user input, requires explicit manual approval before sending',
    agentCount: 1,
    status: 'running' as TeamStatus,
    source: 'ide_build' as 'ide_build' | 'marketplace',
    mode: 'chatflow' as const,
    tasksToday: 0,
    accuracy: 0,
    tokens: 0,
    pendingApprovals: 0,
    agents: [
      { name: 'Email Draft & Send Assistant Agent', emoji: '✉️' },
    ],
    version: 'v7',
  },
  {
    id: 'team-3',
    name: 'Warehouse Network Design Agent',
    description: 'Single-agent registry package for US warehouse network design, grounded in real geospatial and logistics data',
    agentCount: 1,
    status: 'running' as TeamStatus,
    source: 'ide_build' as 'ide_build' | 'marketplace',
    mode: 'task' as const,
    tasksToday: 3,
    accuracy: 26.7,
    tokens: 0,
    pendingApprovals: 0,
    agents: [
      { name: 'Warehouse Network Design Agent', emoji: '🏭' },
    ],
    version: 'v5',
  },
  {
    id: 'team-4',
    name: 'WES Pick Task Execution Agent',
    description: 'Reusable API-first manual-station WES pick execution agent for OMRON shelf-to-person systems',
    agentCount: 1,
    status: 'config_required' as TeamStatus,
    source: 'ide_build' as 'ide_build' | 'marketplace',
    mode: 'task' as const,
    tasksToday: 0,
    accuracy: 0,
    tokens: 0,
    pendingApprovals: 0,
    agents: [
      { name: 'WES Pick Task Execution Agent', emoji: '📦' },
    ],
    version: 'v22',
  },
  {
    id: 'team-5',
    name: 'Customer Service Email Assistant',
    description: 'Reads customer emails, classifies by type, drafts professional replies, and routes for manager approval',
    agentCount: 1,
    status: 'config_required' as TeamStatus,
    source: 'ide_build' as 'ide_build' | 'marketplace',
    mode: 'task' as const,
    tasksToday: 0,
    accuracy: 0,
    tokens: 0,
    pendingApprovals: 0,
    agents: [
      { name: 'Customer Service Email Assistant', emoji: '📧' },
    ],
    version: 'v1',
  },
];

export default function Teams() {
  const router = useRouter();
  const [pauseConfirmId, setPauseConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sourceFilter, setSourceFilter] = useState('All Types');

  const filteredTeams = mockTeams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All Status' ||
      statusFilter.toLowerCase().replace(' ', '_') === team.status;
    const matchesSource =
      sourceFilter === 'All Types' ||
      (sourceFilter === 'Marketplace' && team.source === 'marketplace') ||
      (sourceFilter === 'IDE Build' && team.source === 'ide_build');
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleToggleStatus = (e: React.MouseEvent, team: typeof mockTeams[number]) => {
    e.preventDefault();
    e.stopPropagation();
    if (team.status === 'running') {
      if (pauseConfirmId === team.id) {
        console.log(`Pausing team ${team.id}`);
        setPauseConfirmId(null);
      } else {
        setPauseConfirmId(team.id);
        setTimeout(() => setPauseConfirmId(null), 3000);
      }
    } else {
      // Navigate to Steward with agent info to trigger Run Agent flow
      router.push(`/teams/${team.id}/run`);
    }
  };


  return (
    <div className="min-h-screen">
      <Header title="Teams" subtitle="Manage your teams" />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-10 pl-10 pr-4 bg-dark-50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo/50 transition-colors"
            />
          </div>

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={['All Status', 'Running', 'Inactive', 'Config Required', 'Error'].map((o) => ({ value: o, label: o }))}
          />

          <CustomSelect
            value={sourceFilter}
            onChange={setSourceFilter}
            options={['All Types', 'Marketplace', 'IDE Build'].map((o) => ({ value: o, label: o }))}
          />

          <div className="flex items-center gap-2 ml-auto">
            <button className="flex items-center gap-1.5 h-10 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-gray-300 transition-colors">
              <Code className="w-4 h-4" />
              Build in IDE
            </button>
            <button className="flex items-center gap-1.5 h-10 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-gray-300 transition-colors">
              <Store className="w-4 h-4" />
              Marketplace
              <ExternalLink className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTeams.map((team) => {
            const status = teamStatusConfig[team.status];

            return (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="bg-dark-50 rounded-2xl border border-white/5 p-6 hover:border-indigo/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-indigo-300 group-hover:text-indigo-200 transition-colors leading-snug">
                        {team.name}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color} shrink-0`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} ${team.status === 'running' ? 'animate-pulse' : ''}`} />
                        {status.label}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-500 bg-white/5 shrink-0">{team.version}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                        team.mode === 'chatflow'
                          ? 'bg-cyan-500/15 text-cyan-400'
                          : 'bg-violet-500/15 text-violet-400'
                      }`}>
                        {team.mode === 'chatflow' ? 'Chat' : 'Task'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500 line-clamp-2">{team.description}</p>
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">
                      IDE Build
                    </span>
                  </div>
                </div>

              </div>

              <div className="flex items-center gap-4 mb-4">
                <div>
                  <p className="text-lg font-semibold text-white">{team.tasksToday.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Tasks (today)</p>
                </div>
                <div>
                  <p className={`text-lg font-semibold ${team.accuracy > 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {team.accuracy > 0 ? `${team.accuracy}%` : '—'}
                  </p>
                  <p className="text-xs text-gray-500">Accuracy</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{team.tokens > 0 ? team.tokens.toLocaleString() : '0'}</p>
                  <p className="text-xs text-gray-500">Tokens</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Team Agents</p>
                <div className="flex flex-wrap gap-2">
                  {team.agents.map((agent, idx) => (
                    <div
                      key={idx}
                      className="h-7 px-3 rounded-[14px] bg-black/60 hover:bg-black/70 transition-colors flex items-center gap-1.5"
                    >
                      <span className="text-sm">{agent.emoji}</span>
                      <span className="text-xs text-gray-300">{agent.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 pt-3 border-t border-white/5">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleStatus(e, team); }}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {team.status === 'running' ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setToast(`Opening ${team.name} in IDE...`); setTimeout(() => setToast(null), 2500); }}
                  className="p-2 rounded-lg text-gray-400 hover:text-indigo-300 hover:bg-indigo/10 transition-colors"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {pauseConfirmId === team.id && (
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-dark-50 border border-white/10 rounded-lg shadow-lg whitespace-nowrap z-10">
                    <p className="text-xs text-white mb-1">Pause this team?</p>
                    <p className="text-xs text-gray-500">Click again to confirm</p>
                  </div>
                )}
              </div>
            </Link>
            );
          })}
        </div>

        {filteredTeams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-dark-50 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No teams found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl bg-indigo text-white text-xs font-medium shadow-lg shadow-indigo/30 whitespace-nowrap z-[60] flex items-center gap-2">
          <Code className="w-3.5 h-3.5" />
          {toast}
        </div>
      )}
    </div>
  );
}
