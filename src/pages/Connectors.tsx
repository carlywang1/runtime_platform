import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  MessageSquare,
  Users,
  Cloud,
  GitBranch,
  CheckSquare,
  HardDrive,
  Database,
  ExternalLink,
  Activity,
  Shield,
  Globe,
  Server,
  Wrench,
} from 'lucide-react';
import Header from '../components/layout/Header';
import CustomSelect from '../components/CustomSelect';
import { connectors } from '../data/mockData';

type ConnectorTab = 'external' | 'internal';

const iconMap: Record<string, typeof Mail> = {
  Mail, MessageSquare, Users, Cloud, GitBranch, CheckSquare, HardDrive, Database,
};

const statusConfig = {
  connected: { label: 'Connected', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', icon: CheckCircle },
  disconnected: { label: 'Disconnected', color: 'text-gray-400', bgColor: 'bg-gray-500/20', icon: XCircle },
  error: { label: 'Error', color: 'text-rose-400', bgColor: 'bg-rose-500/20', icon: AlertCircle },
};

const categoryLabels: Record<string, string> = {
  communication: 'Communication',
  productivity: 'Productivity',
  enterprise: 'Enterprise Systems',
  storage: 'Storage',
  custom: 'Custom APIs',
};

interface InternalApi {
  id: string;
  name: string;
  baseUrl: string;
  version: string;
  authType: 'Bearer Token' | 'API Key' | 'mTLS' | 'OAuth2';
  health: 'healthy' | 'unreachable';
  avgLatency: string;
  usedBy: string[];
  lastChecked: string;
  description: string;
}

const internalApis: InternalApi[] = [
  {
    id: 'int-1',
    name: 'WMS Core API',
    baseUrl: 'https://internal.item.com/wms/api/v2',
    version: 'v2.4.0',
    authType: 'Bearer Token',
    health: 'healthy',
    avgLatency: '45ms',
    usedBy: ['WMS Inbound Team', 'Storage Allocator'],
    lastChecked: '30s ago',
    description: 'Warehouse management system core operations',
  },
  {
    id: 'int-2',
    name: 'HR System API',
    baseUrl: 'https://internal.item.com/hr/api/v1',
    version: 'v1.8.0',
    authType: 'OAuth2',
    health: 'healthy',
    avgLatency: '120ms',
    usedBy: ['Recruiting Team', 'New Employee Onboarding Team'],
    lastChecked: '1 min ago',
    description: 'Human resources and employee management',
  },
  {
    id: 'int-3',
    name: 'Finance Ledger API',
    baseUrl: 'https://internal.item.com/finance/api/v3',
    version: 'v3.1.0',
    authType: 'mTLS',
    health: 'healthy',
    avgLatency: '340ms',
    usedBy: ['Financial Reconciliation Bot'],
    lastChecked: '2 min ago',
    description: 'General ledger and financial transaction processing',
  },
  {
    id: 'int-4',
    name: 'Inventory Service',
    baseUrl: 'https://internal.item.com/inventory/api/v2',
    version: 'v2.0.1',
    authType: 'API Key',
    health: 'healthy',
    avgLatency: '28ms',
    usedBy: ['WMS Inbound Team'],
    lastChecked: '15s ago',
    description: 'Real-time inventory tracking and stock levels',
  },
  {
    id: 'int-5',
    name: 'CRM Internal Gateway',
    baseUrl: 'https://internal.item.com/crm/gateway/v1',
    version: 'v1.3.0',
    authType: 'Bearer Token',
    health: 'unreachable',
    avgLatency: '—',
    usedBy: ['Sales Intelligence Team', 'Customer Success Pipeline'],
    lastChecked: '5 min ago',
    description: 'Internal CRM data gateway for agent access',
  },
  {
    id: 'int-6',
    name: 'Notification Service',
    baseUrl: 'https://internal.item.com/notify/api/v1',
    version: 'v1.1.0',
    authType: 'API Key',
    health: 'healthy',
    avgLatency: '15ms',
    usedBy: ['Customer Support Agent'],
    lastChecked: '45s ago',
    description: 'Internal push notification and alert dispatch',
  },
];

const healthConfig = {
  healthy: { label: 'Healthy', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  unreachable: { label: 'Unreachable', color: 'text-rose-400', dot: 'bg-rose-400' },
};

const authColors: Record<string, string> = {
  'Bearer Token': 'bg-indigo/20 text-indigo-300',
  'API Key': 'bg-purple-500/20 text-purple-300',
  'mTLS': 'bg-emerald-500/20 text-emerald-300',
  'OAuth2': 'bg-cyan-500/20 text-cyan-300',
};

export default function Connectors() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ConnectorTab>('external');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [internalSearch, setInternalSearch] = useState('');
  const [internalHealthFilter, setInternalHealthFilter] = useState('all');

  // External connectors
  const filteredConnectors = connectors.filter((connector) => {
    const matchesSearch = connector.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || connector.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const groupedConnectors = filteredConnectors.reduce((acc, connector) => {
    const category = connector.type;
    if (!acc[category]) acc[category] = [];
    acc[category].push(connector);
    return acc;
  }, {} as Record<string, typeof connectors>);

  const connectedCount = connectors.filter((c) => c.status === 'connected').length;
  const errorCount = connectors.filter((c) => c.status === 'error').length;

  // Internal APIs
  const filteredInternalApis = internalApis.filter((api) => {
    const matchesSearch = api.name.toLowerCase().includes(internalSearch.toLowerCase()) ||
      api.description.toLowerCase().includes(internalSearch.toLowerCase());
    const matchesHealth = internalHealthFilter === 'all' || api.health === internalHealthFilter;
    return matchesSearch && matchesHealth;
  });

  const internalHealthy = internalApis.filter((a) => a.health === 'healthy').length;
  const internalUnreachable = internalApis.filter((a) => a.health === 'unreachable').length;

  return (
    <div className="min-h-screen">
      <Header title="Connectors" subtitle="Manage service integrations" />

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-white/10">
          <button
            onClick={() => setTab('external')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative ${
              tab === 'external' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            External
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-gray-400">{connectors.length}</span>
            {tab === 'external' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo" />}
          </button>
          <button
            onClick={() => setTab('internal')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative ${
              tab === 'internal' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Server className="w-4 h-4" />
            Internal APIs
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-gray-400">{internalApis.length}</span>
            {tab === 'internal' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo" />}
          </button>
        </div>

        {/* ===== External Tab ===== */}
        {tab === 'external' && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-dark-50 rounded-2xl p-5 border border-white/5">
                <p className="text-sm text-gray-400 mb-1">Total</p>
                <p className="text-3xl font-semibold text-white">{connectors.length}</p>
              </div>
              <div className="bg-dark-50 rounded-2xl p-5 border border-emerald-500/20">
                <p className="text-sm text-gray-400 mb-1">Connected</p>
                <p className="text-3xl font-semibold text-emerald-400">{connectedCount}</p>
              </div>
              <div className="bg-dark-50 rounded-2xl p-5 border border-rose-500/20">
                <p className="text-sm text-gray-400 mb-1">Errors</p>
                <p className="text-3xl font-semibold text-rose-400">{errorCount}</p>
              </div>
              <div className="bg-dark-50 rounded-2xl p-5 border border-white/5">
                <p className="text-sm text-gray-400 mb-1">Last Sync</p>
                <p className="text-3xl font-semibold text-white">30s</p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search connectors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 h-10 pl-10 pr-4 bg-dark-50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo/50 transition-colors"
                />
              </div>
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'connected', label: 'Connected' },
                  { value: 'disconnected', label: 'Disconnected' },
                  { value: 'error', label: 'Error' },
                ]}
              />
              <button className="flex items-center gap-2 h-10 px-4 bg-indigo hover:bg-indigo-600 rounded-lg text-sm font-medium text-white transition-colors ml-auto">
                <Plus className="w-4 h-4" />
                Add Connector
              </button>
            </div>

            {/* Grouped connector cards */}
            {Object.entries(groupedConnectors).map(([category, categoryConnectors]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-400 mb-4">
                  {categoryLabels[category] || category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {categoryConnectors.map((connector) => {
                    const status = statusConfig[connector.status];
                    const StatusIcon = status.icon;
                    const ConnectorIcon = iconMap[connector.icon] || Database;
                    return (
                      <div key={connector.id} className="bg-dark-50 rounded-2xl border border-white/5 p-5 hover:border-indigo/30 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-black/60 flex items-center justify-center">
                              <ConnectorIcon className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{connector.name}</h4>
                              <div className="flex items-center gap-1.5 mt-1">
                                <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                                <span className={`text-xs ${status.color}`}>{status.label}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                              <RefreshCw className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                              <Settings className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{connector.description}</p>
                        {connector.lastSync && <p className="text-xs text-gray-600">Last sync: {connector.lastSync}</p>}
                        {connector.status === 'disconnected' && (
                          <button className="w-full mt-4 py-2 rounded-lg bg-indigo/20 text-indigo-300 text-sm font-medium hover:bg-indigo/30 transition-colors">Connect</button>
                        )}
                        {connector.status === 'error' && (
                          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs text-rose-400">Connection failed. Check credentials and try again.</p>
                              <button className="mt-2 text-xs text-rose-300 hover:text-rose-200 flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                View error details
                              </button>
                            </div>
                            <button
                              onClick={() => navigate('/steward', { state: { message: `Help me fix the connection error for ${connector.name}. The connector is currently in error state.`, agentName: connector.name } })}
                              className="p-2 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors flex-shrink-0"
                              data-tip="Fix in Steward"
                            >
                              <Wrench className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredConnectors.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-dark-50 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No connectors found</h3>
                <p className="text-sm text-gray-500">Try adjusting your search or filter</p>
              </div>
            )}
          </>
        )}

        {/* ===== Internal APIs Tab ===== */}
        {tab === 'internal' && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-dark-50 rounded-2xl p-5 border border-white/5">
                <p className="text-sm text-gray-400 mb-1">Registered</p>
                <p className="text-3xl font-semibold text-white">{internalApis.length}</p>
              </div>
              <div className="bg-dark-50 rounded-2xl p-5 border border-emerald-500/20">
                <p className="text-sm text-gray-400 mb-1">Healthy</p>
                <p className="text-3xl font-semibold text-emerald-400">{internalHealthy}</p>
              </div>
              <div className="bg-dark-50 rounded-2xl p-5 border border-rose-500/20">
                <p className="text-sm text-gray-400 mb-1">Unreachable</p>
                <p className="text-3xl font-semibold text-rose-400">{internalUnreachable}</p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search internal APIs..."
                  value={internalSearch}
                  onChange={(e) => setInternalSearch(e.target.value)}
                  className="w-64 h-10 pl-10 pr-4 bg-dark-50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo/50 transition-colors"
                />
              </div>
              <CustomSelect
                value={internalHealthFilter}
                onChange={setInternalHealthFilter}
                options={[
                  { value: 'all', label: 'All Health' },
                  { value: 'healthy', label: 'Healthy' },
                  { value: 'unreachable', label: 'Unreachable' },
                ]}
              />
              <button className="flex items-center gap-2 h-10 px-4 bg-indigo hover:bg-indigo-600 rounded-lg text-sm font-medium text-white transition-colors ml-auto">
                <Plus className="w-4 h-4" />
                Register API
              </button>
            </div>

            {/* Internal API cards */}
            <div className="space-y-3">
              {filteredInternalApis.map((api) => {
                const health = healthConfig[api.health];
                return (
                  <div key={api.id} className="bg-dark-50 rounded-2xl border border-white/5 p-5 hover:border-indigo/30 transition-all group">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-indigo/10 flex items-center justify-center flex-shrink-0">
                        <Server className="w-5 h-5 text-indigo-400" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-white">{api.name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-gray-400">{api.version}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${authColors[api.authType]}`}>{api.authType}</span>
                          <div className="flex items-center gap-1.5 ml-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${health.dot} ${api.health === 'healthy' ? 'animate-pulse' : ''}`} />
                            <span className={`text-xs ${health.color}`}>{health.label}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-2">{api.description}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="font-mono text-gray-400">{api.baseUrl}</span>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {api.avgLatency}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {api.authType}
                          </span>
                          <span>Checked {api.lastChecked}</span>
                          <span className="flex items-center gap-1">
                            Used by: {api.usedBy.map((name) => (
                              <span key={name} className="px-1.5 py-0.5 rounded bg-white/5 text-gray-400 text-[10px]">
                                {name}
                              </span>
                            ))}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors" data-tip="Test Connection">
                          <RefreshCw className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors" data-tip="Settings">
                          <Settings className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {api.health === 'unreachable' && (
                      <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-rose-400">Service unreachable. Last successful connection was over 5 minutes ago.</p>
                          <button className="mt-2 text-xs text-rose-300 hover:text-rose-200 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            View diagnostics
                          </button>
                        </div>
                        <button
                          onClick={() => navigate('/steward', { state: { message: `Help me fix the connection issue for internal API "${api.name}" (${api.baseUrl}). The service is currently unreachable.`, agentName: api.name } })}
                          className="p-2 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors flex-shrink-0"
                          data-tip="Fix in Steward"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredInternalApis.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-dark-50 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No internal APIs found</h3>
                <p className="text-sm text-gray-500">Try adjusting your search or filter</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
