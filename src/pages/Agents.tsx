import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Play,
  Pause,
  Wrench,
  Settings,
  Code,
  Store,
  ExternalLink,
} from 'lucide-react';
import Header from '../components/layout/Header';
import CustomSelect from '../components/CustomSelect';
import { agents } from '../data/mockData';
import type { AgentStatus } from '../types';

const statusConfig: Record<
  AgentStatus,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  active: {
    label: 'Running',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    dotColor: 'bg-emerald-400',
  },
  inactive: {
    label: 'Inactive',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    dotColor: 'bg-rose-400',
  },
  config_required: {
    label: 'Config Required',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    dotColor: 'bg-amber-400',
  },
  error: {
    label: 'Error',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    dotColor: 'bg-rose-400',
  },
};

const filterOptions = ['All Status', 'Active', 'Inactive', 'Config Required', 'Error'];
const sourceOptions = ['All Types', 'Marketplace', 'IDE Build'];

export default function Agents() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sourceFilter, setSourceFilter] = useState('All Types');
  const [pauseConfirmId, setPauseConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All Status' ||
      statusFilter.toLowerCase().replace(' ', '_') === agent.status;
    const matchesSource =
      sourceFilter === 'All Types' ||
      (sourceFilter === 'Marketplace' && agent.source === 'marketplace') ||
      (sourceFilter === 'IDE Build' && agent.source === 'ide_build');
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleCardClick = (agentId: string, status: AgentStatus) => {
    if (status === 'config_required') {
      navigate(`/agents/${agentId}?tab=config`);
    } else {
      navigate(`/agents/${agentId}`);
    }
  };

  const handleToggleStatus = (e: React.MouseEvent, agentId: string, currentStatus: AgentStatus) => {
    e.stopPropagation();
    
    // If trying to pause an active agent, show confirmation
    if (currentStatus === 'active') {
      if (pauseConfirmId === agentId) {
        // Confirmed, proceed with pause
        console.log(`Pausing agent ${agentId}`);
        setPauseConfirmId(null);
      } else {
        // Show confirmation
        setPauseConfirmId(agentId);
        // Auto-hide confirmation after 3 seconds
        setTimeout(() => setPauseConfirmId(null), 3000);
      }
    } else {
      // Activate agent directly
      console.log(`Activating agent ${agentId}`);
    }
  };

  const handleFixError = (e: React.MouseEvent, agent: typeof agents[0]) => {
    e.stopPropagation();
    const errorMessage = `Help me fix the error for ${agent.name}. The agent is currently in error state and needs attention.`;
    navigate('/steward', { state: { message: errorMessage, agentName: agent.name } });
  };

  const handleConfigAgent = (e: React.MouseEvent, agentId: string) => {
    e.stopPropagation();
    navigate(`/agents/${agentId}?tab=config`);
  };

  return (
    <div className="min-h-screen">
      <Header title="Agents" subtitle="Manage your agents" />

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-10 pl-10 pr-4 bg-dark-50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo/50 transition-colors"
            />
          </div>

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={filterOptions.map((o) => ({ value: o, label: o }))}
          />

          <CustomSelect
            value={sourceFilter}
            onChange={setSourceFilter}
            options={sourceOptions.map((o) => ({ value: o, label: o }))}
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => {
            const status = statusConfig[agent.status];

            return (
              <div
                key={agent.id}
                onClick={() => handleCardClick(agent.id, agent.status)}
                className="bg-dark-50 rounded-2xl border border-white/5 hover:border-indigo/30 transition-all group cursor-pointer"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{agent.name}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} ${agent.status === 'active' ? 'animate-pulse' : ''}`} />
                            {status.label}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-500 bg-white/5">{agent.version}</span>
                        </div>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            agent.source === 'marketplace'
                              ? 'bg-indigo/20 text-indigo-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {agent.source === 'marketplace' ? 'Hired' : 'IDE Build'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">
                    {agent.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {agent.tasksCompleted.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Tasks (30d)</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-emerald-400">
                          {agent.successRate}%
                        </p>
                        <p className="text-xs text-gray-500">Success</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {agent.source === 'marketplace' 
                            ? `${(agent.costThisMonth * 5).toFixed(0)}`
                            : `${(agent.costThisMonth * 1000).toFixed(0)}K`
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {agent.source === 'marketplace' ? 'Credits (30d)' : 'Tokens (30d)'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {agent.source === 'ide_build' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setToast(`Opening ${agent.name} in IDE...`); setTimeout(() => setToast(null), 2500); }}
                          className="p-2 rounded-lg text-gray-400 hover:text-indigo-300 hover:bg-indigo/10 transition-colors"
                          data-tip="Edit in IDE"
                        >
                          <Code className="w-4 h-4" />
                        </button>
                      )}
                      {agent.status === 'error' ? (
                      <button
                        onClick={(e) => handleFixError(e, agent)}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        data-tip="Fix Error"
                      >
                        <Wrench className="w-4 h-4" />
                      </button>
                    ) : agent.status === 'config_required' ? (
                      <button
                        onClick={(e) => handleConfigAgent(e, agent.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        data-tip="Configure Agent"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={(e) => handleToggleStatus(e, agent.id, agent.status)}
                          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                          data-tip={agent.status === 'active' ? 'Pause Agent' : 'Activate Agent'}
                        >
                          {agent.status === 'active' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        {pauseConfirmId === agent.id && (
                          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-dark-50 border border-white/10 rounded-lg shadow-lg whitespace-nowrap">
                            <p className="text-xs text-white mb-1">Pause this agent?</p>
                            <p className="text-xs text-gray-500">Click again to confirm</p>
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAgents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-dark-50 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No agents found</h3>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
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
