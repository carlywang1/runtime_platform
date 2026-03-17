import { useState } from 'react';
import { Users, Activity, Play, Pause, Wrench, Settings, Search, Code, Store, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import CustomSelect from '../components/CustomSelect';

type TeamStatus = 'active' | 'inactive' | 'config_required' | 'error';

const teamStatusConfig: Record<TeamStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  active: { label: 'Active', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', dotColor: 'bg-emerald-400' },
  inactive: { label: 'Inactive', color: 'text-rose-400', bgColor: 'bg-rose-500/20', dotColor: 'bg-rose-400' },
  config_required: { label: 'Config Required', color: 'text-amber-400', bgColor: 'bg-amber-500/20', dotColor: 'bg-amber-400' },
  error: { label: 'Error', color: 'text-rose-400', bgColor: 'bg-rose-500/20', dotColor: 'bg-rose-400' },
};

const mockTeams = [
  {
    id: 'team-1',
    name: 'WMS Inbound Team',
    description: 'Warehouse management system inbound processing',
    agentCount: 5,
    status: 'active' as TeamStatus,
    source: 'marketplace' as const,
    tasksToday: 127,
    successRate: 98.5,
    pendingApprovals: 3,
    agents: [
      { name: 'Receipt Validator', emoji: '📦' },
      { name: 'Inventory Updater', emoji: '🔄' },
      { name: 'Quality Inspector', emoji: '🔍' },
      { name: 'Label Generator', emoji: '🏷️' },
      { name: 'Storage Allocator', emoji: '📍' },
    ],
    tasks30d: 1247,
    credits30d: 1229,
    version: 'v1.3.0',
  },
  {
    id: 'team-2',
    name: 'Recruiting Team',
    description: 'End-to-end recruitment and candidate management',
    agentCount: 4,
    status: 'active' as TeamStatus,
    source: 'ide_build' as const,
    tasksToday: 89,
    successRate: 96.2,
    pendingApprovals: 5,
    agents: [
      { name: 'Resume Screener', emoji: '📄' },
      { name: 'Interview Scheduler', emoji: '📅' },
      { name: 'Candidate Evaluator', emoji: '⭐' },
      { name: 'Offer Generator', emoji: '✉️' },
    ],
    tasks30d: 2680,
    credits30d: 890,
    version: 'v2.0.1',
  },
  {
    id: 'team-3',
    name: 'New Employee Onboarding Team',
    description: 'Automated onboarding and training coordination',
    agentCount: 4,
    status: 'active' as TeamStatus,
    source: 'marketplace' as const,
    tasksToday: 45,
    successRate: 99.1,
    pendingApprovals: 1,
    agents: [
      { name: 'Document Processor', emoji: '📋' },
      { name: 'Training Coordinator', emoji: '🎓' },
      { name: 'Equipment Provisioner', emoji: '💻' },
      { name: 'Onboarding Tracker', emoji: '✅' },
    ],
    tasks30d: 1350,
    credits30d: 425,
    version: 'v1.1.2',
  },
  {
    id: 'team-4',
    name: 'Sales Intelligence Team',
    description: 'Lead qualification and sales support',
    agentCount: 4,
    status: 'error' as TeamStatus,
    source: 'ide_build' as const,
    tasksToday: 213,
    successRate: 94.8,
    pendingApprovals: 8,
    agents: [
      { name: 'Lead Scorer', emoji: '🎯' },
      { name: 'Data Enrichment', emoji: '📊' },
      { name: 'Opportunity Analyzer', emoji: '💡' },
      { name: 'CRM Sync Agent', emoji: '🔗' },
    ],
    tasks30d: 6390,
    credits30d: 2140,
    version: 'v0.8.5',
  },
  {
    id: 'team-5',
    name: 'Customer Success Pipeline',
    description: 'End-to-end customer support workflow',
    agentCount: 5,
    status: 'active' as TeamStatus,
    source: 'marketplace' as const,
    tasksToday: 342,
    successRate: 97.3,
    pendingApprovals: 12,
    agents: [
      { name: 'Ticket Router', emoji: '🎫' },
      { name: 'Support Agent', emoji: '💬' },
      { name: 'Sentiment Analyzer', emoji: '😊' },
      { name: 'Knowledge Bot', emoji: '📚' },
      { name: 'Escalation Manager', emoji: '🚨' },
    ],
    tasks30d: 10260,
    credits30d: 3870,
    version: 'v3.2.0',
  },
];

export default function Teams() {
  const navigate = useNavigate();
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

  const handleToggleStatus = (e: React.MouseEvent, teamId: string, currentStatus: TeamStatus) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStatus === 'active') {
      if (pauseConfirmId === teamId) {
        console.log(`Pausing team ${teamId}`);
        setPauseConfirmId(null);
      } else {
        setPauseConfirmId(teamId);
        setTimeout(() => setPauseConfirmId(null), 3000);
      }
    } else {
      console.log(`Activating team ${teamId}`);
    }
  };

  const handleFixError = (e: React.MouseEvent, team: typeof mockTeams[0]) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/steward', { state: { message: `Help me fix the error for team ${team.name}.`, agentName: team.name } });
  };

  const handleConfigTeam = (e: React.MouseEvent, teamId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/teams/${teamId}`);
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
            options={['All Status', 'Active', 'Inactive', 'Config Required', 'Error'].map((o) => ({ value: o, label: o }))}
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
              to={`/teams/${team.id}`}
              className="bg-dark-50 rounded-2xl border border-white/5 p-6 hover:border-indigo/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {team.name}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} ${team.status === 'active' ? 'animate-pulse' : ''}`} />
                        {status.label}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-500 bg-white/5">{team.version}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500">{team.description}</p>
                    </div>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        team.source === 'marketplace'
                          ? 'bg-indigo/20 text-indigo-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {team.source === 'marketplace' ? 'Hired' : 'IDE Build'}
                    </span>
                  </div>
                </div>

              </div>

              <div className="flex items-center gap-4 mb-4">
                <div>
                  <p className="text-lg font-semibold text-white">{team.tasks30d.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Tasks (30d)</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-emerald-400">{team.successRate}%</p>
                  <p className="text-xs text-gray-500">Success</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">
                    {team.source === 'marketplace'
                      ? team.credits30d.toLocaleString()
                      : `${(team.credits30d / 1000).toFixed(0)}K`
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {team.source === 'marketplace' ? 'Credits (30d)' : 'Tokens (30d)'}
                  </p>
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
                {team.source === 'ide_build' && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setToast(`Opening ${team.name} in IDE...`); setTimeout(() => setToast(null), 2500); }}
                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-300 hover:bg-indigo/10 transition-colors"
                    data-tip="Edit in IDE"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                )}
                {team.status === 'error' ? (
                  <button
                    onClick={(e) => handleFixError(e, team)}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    data-tip="Fix Error"
                  >
                    <Wrench className="w-4 h-4" />
                  </button>
                ) : team.status === 'config_required' ? (
                  <button
                    onClick={(e) => handleConfigTeam(e, team.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    data-tip="Configure Team"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="relative">
                    <button
                      onClick={(e) => handleToggleStatus(e, team.id, team.status)}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      data-tip={team.status === 'active' ? 'Pause Team' : 'Activate Team'}
                    >
                      {team.status === 'active' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    {pauseConfirmId === team.id && (
                      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-dark-50 border border-white/10 rounded-lg shadow-lg whitespace-nowrap z-10">
                        <p className="text-xs text-white mb-1">Pause this team?</p>
                        <p className="text-xs text-gray-500">Click again to confirm</p>
                      </div>
                    )}
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
