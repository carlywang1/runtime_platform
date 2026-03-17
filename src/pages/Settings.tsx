import { useState } from 'react';
import {
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  Clock,
  Plug,
  Zap,
  Database,
  Code2,
  FileText,
  Copy,
} from 'lucide-react';
import Header from '../components/layout/Header';

type SectionId = 'schedule' | 'hooks' | 'api_invocation' | 'data_exchange' | 'api';
type ViewMode = 'form' | 'json';

interface CronRule {
  id: string;
  name: string;
  schedule: string;
  sessionTarget: 'main' | 'isolated';
  payloadKind: 'systemEvent' | 'agentTurn';
  wakeMode: 'now' | 'next-heartbeat';
  deliveryMode: 'announce' | 'webhook' | 'none';
  enabled: boolean;
}

interface HookEndpoint {
  id: string;
  url: string;
  apiVersion: string;
  secret: string;
  events: string[];
  created: string;
  enabled: boolean;
}

interface ApiCapability {
  id: string;
  name: string;
  target: string;
  authScope: string;
  rateLimit: string;
  timeoutSeconds: number;
  enabled: boolean;
}

interface DataExchangeRule {
  id: string;
  name: string;
  source: string;
  trigger: string;
  transform: string;
  retryPolicy: string;
  enabled: boolean;
}

interface SecretItem {
  id: string;
  name: string;
  category: 'api_key' | 'webhook_token' | 'credential';
  provider?: string;
  lastUsed: string;
  created: string;
}

const settingsSections = [
  { id: 'schedule' as SectionId, label: 'Schedule (Cron)', icon: Clock },
  { id: 'hooks' as SectionId, label: 'Webhooks', icon: Plug },
  { id: 'api_invocation' as SectionId, label: 'API Invocation', icon: Zap },
  { id: 'data_exchange' as SectionId, label: 'Data Exchange', icon: Database },
  { id: 'api' as SectionId, label: 'Secrets & Tokens', icon: Key },
];

const initialCronRules: CronRule[] = [
  { id: 'cron-1', name: 'Daily Inventory Brief', schedule: '0 9 * * * (Asia/Shanghai)', sessionTarget: 'isolated', payloadKind: 'agentTurn', wakeMode: 'next-heartbeat', deliveryMode: 'announce', enabled: true },
  { id: 'cron-2', name: 'Weekly Risk Scan', schedule: '0 8 * * 1 (Asia/Shanghai)', sessionTarget: 'isolated', payloadKind: 'agentTurn', wakeMode: 'now', deliveryMode: 'webhook', enabled: true },
  { id: 'cron-3', name: 'One-shot Follow-up Reminder', schedule: 'at: 2026-03-20T10:30:00+08:00', sessionTarget: 'main', payloadKind: 'systemEvent', wakeMode: 'now', deliveryMode: 'none', enabled: false },
];

const initialHookEndpoints: HookEndpoint[] = [];

const initialApiCapabilities: ApiCapability[] = [
  { id: 'api-1', name: 'generate-followup-draft', target: 'Customer Support Agent', authScope: 'internal-service-token', rateLimit: '60 rpm', timeoutSeconds: 90, enabled: true },
  { id: 'api-2', name: 'run-team-risk-triage', target: 'Sales Intelligence Team', authScope: 'partner-api-key', rateLimit: '20 rpm', timeoutSeconds: 180, enabled: true },
];

const initialDataExchangeRules: DataExchangeRule[] = [
  { id: 'dx-1', name: 'S3 Contract Arrival Trigger', source: 'AWS S3 /contracts/inbound', trigger: 'object.created', transform: 'contract_ingest_v2', retryPolicy: 'exp-backoff (3 attempts)', enabled: true },
  { id: 'dx-2', name: 'CRM Deal Stage Change', source: 'Salesforce Event', trigger: 'deal.stage.changed', transform: 'deal_signal_to_prompt', retryPolicy: 'retry + DLQ', enabled: false },
];

const secretItems: SecretItem[] = [
  { id: '1', name: 'OpenAI API Key', category: 'api_key', provider: 'OpenAI', lastUsed: '2 hours ago', created: 'Jan 15, 2024' },
  { id: '2', name: 'Anthropic API Key', category: 'api_key', provider: 'Anthropic', lastUsed: '30 min ago', created: 'Feb 20, 2026' },
  { id: '3', name: 'Webhook Secret Token', category: 'webhook_token', lastUsed: '5 minutes ago', created: 'Mar 11, 2026' },
  { id: '4', name: 'Partner Invocation Token', category: 'webhook_token', lastUsed: '1 day ago', created: 'Mar 1, 2026' },
  { id: '5', name: 'Salesforce OAuth Credential', category: 'credential', provider: 'Salesforce', lastUsed: '3 hours ago', created: 'Dec 5, 2025' },
  { id: '6', name: 'AWS Access Key', category: 'credential', provider: 'AWS', lastUsed: '10 min ago', created: 'Jan 8, 2026' },
];

const categoryConfig: Record<string, { label: string; color: string; bg: string }> = {
  api_key: { label: 'API Key', color: 'text-purple-300', bg: 'bg-purple-500/20' },
  webhook_token: { label: 'Webhook Token', color: 'text-cyan-300', bg: 'bg-cyan-500/20' },
  credential: { label: 'Credential', color: 'text-amber-300', bg: 'bg-amber-500/20' },
};

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/5">
      <button
        onClick={() => onChange('form')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          mode === 'form' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <FileText className="w-3 h-3" />
        Form
      </button>
      <button
        onClick={() => onChange('json')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          mode === 'json' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <Code2 className="w-3 h-3" />
        JSON
      </button>
    </div>
  );
}

function JsonView({ data, onCopy }: { data: unknown; onCopy: () => void }) {
  const json = JSON.stringify(data, null, 2);
  return (
    <div className="relative rounded-xl bg-black/60 border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <span className="text-xs text-gray-500 font-mono">config.json</span>
        <button onClick={onCopy} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
          <Copy className="w-3 h-3" />
          Copy
        </button>
      </div>
      <pre className="p-4 text-xs text-gray-300 font-mono overflow-x-auto max-h-96 overflow-y-auto leading-relaxed">{json}</pre>
    </div>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SectionId>('schedule');
  const [showKey, setShowKey] = useState<string | null>(null);
  const [cronRules, setCronRules] = useState<CronRule[]>(initialCronRules);
  const [hookEndpoints] = useState<HookEndpoint[]>(initialHookEndpoints);
  const [apiCapabilities, setApiCapabilities] = useState<ApiCapability[]>(initialApiCapabilities);
  const [dataExchangeRules, setDataExchangeRules] = useState<DataExchangeRule[]>(initialDataExchangeRules);
  const [viewModes, setViewModes] = useState<Record<SectionId, ViewMode>>({
    schedule: 'form', hooks: 'form', api_invocation: 'form', data_exchange: 'form', api: 'form',
  });
  const [copyToast, setCopyToast] = useState(false);

  const setViewMode = (section: SectionId, mode: ViewMode) => {
    setViewModes((prev) => ({ ...prev, [section]: mode }));
  };

  const handleCopy = (data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 1500);
  };

  const toggleCronRule = (id: string) => {
    setCronRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };
  const toggleApiCapability = (id: string) => {
    setApiCapabilities((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  };
  const toggleDataExchangeRule = (id: string) => {
    setDataExchangeRules((prev) => prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d)));
  };

  const renderSwitch = (enabled: boolean, onClick: () => void) => (
    <button onClick={onClick} className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-indigo' : 'bg-gray-700'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'left-7' : 'left-1'}`} />
    </button>
  );

  const vm = viewModes[activeSection];

  return (
    <div className="min-h-screen">
      <Header title="Settings" subtitle="Configure runtime platform settings" />

      <div className="p-6">
        <div className="flex gap-6">
          <nav className="w-72 flex-shrink-0 space-y-1">
            {settingsSections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive ? 'bg-indigo text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex-1 bg-dark-50 rounded-2xl border border-white/5 p-6">
            {activeSection === 'schedule' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Schedule (Cron)</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage scheduled jobs using Cron, Every, or At expressions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ViewToggle mode={vm} onChange={(m) => setViewMode('schedule', m)} />
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo hover:bg-indigo-600 rounded-lg text-sm font-medium text-white transition-colors">
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
                {vm === 'json' ? (
                  <JsonView data={cronRules} onCopy={() => handleCopy(cronRules)} />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">Scheduler jobs (Cron / Every / At)</p>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo/20 text-indigo-300 hover:bg-indigo/30 transition-colors text-sm">
                        <Plus className="w-4 h-4" />
                        Add Schedule
                      </button>
                    </div>
                    {cronRules.map((rule) => (
                      <div key={rule.id} className="p-4 rounded-xl bg-black/60 border border-white/5 hover:border-indigo/20 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-medium text-white">{rule.name}</h4>
                              <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-gray-300">{rule.schedule}</span>
                            </div>
                            <p className="text-xs text-gray-500 font-mono">
                              sessionTarget={rule.sessionTarget} · payload.kind={rule.payloadKind} · wakeMode={rule.wakeMode} · delivery.mode={rule.deliveryMode}
                            </p>
                          </div>
                          {renderSwitch(rule.enabled, () => toggleCronRule(rule.id))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'hooks' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Webhooks</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Send data and events to third-party platforms.{' '}
                      <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer">Docs</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ViewToggle mode={vm} onChange={(m) => setViewMode('hooks', m)} />
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo hover:bg-indigo-600 rounded-lg text-sm font-medium text-white transition-colors">
                      <Plus className="w-4 h-4" />
                      Create webhook
                    </button>
                  </div>
                </div>
                {vm === 'json' ? (
                  <JsonView data={hookEndpoints} onCopy={() => handleCopy(hookEndpoints)} />
                ) : (
                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr_auto] gap-4 px-5 py-3 bg-white/[0.03] border-b border-white/10">
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">URL</span>
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">API version</span>
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Secret</span>
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Events</span>
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Created</span>
                      <span className="w-8" />
                    </div>
                    {hookEndpoints.length > 0 ? (
                      hookEndpoints.map((endpoint) => (
                        <div key={endpoint.id} className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr_auto] gap-4 px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                          <span className="text-sm text-gray-300 font-mono truncate">{endpoint.url}</span>
                          <span className="text-sm text-gray-400">{endpoint.apiVersion}</span>
                          <span className="text-sm text-gray-400 font-mono">{endpoint.secret}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {endpoint.events.map((ev, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-gray-300">{ev}</span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">{endpoint.created}</span>
                          <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-rose-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
                          <Plug className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-500">No webhooks yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'api_invocation' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">API Invocation</h2>
                    <p className="text-sm text-gray-500 mt-1">Publish and manage capabilities for internal and external invocation</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ViewToggle mode={vm} onChange={(m) => setViewMode('api_invocation', m)} />
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo hover:bg-indigo-600 rounded-lg text-sm font-medium text-white transition-colors">
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
                {vm === 'json' ? (
                  <JsonView data={apiCapabilities} onCopy={() => handleCopy(apiCapabilities)} />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">Published capabilities for internal/external invocation</p>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo/20 text-indigo-300 hover:bg-indigo/30 transition-colors text-sm">
                        <Plus className="w-4 h-4" />
                        Publish Capability
                      </button>
                    </div>
                    {apiCapabilities.map((capability) => (
                      <div key={capability.id} className="p-4 rounded-xl bg-black/60 border border-white/5 hover:border-indigo/20 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-medium text-white">{capability.name}</h4>
                              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300">{capability.target}</span>
                            </div>
                            <p className="text-xs text-gray-500 font-mono">
                              authScope={capability.authScope} · rateLimit={capability.rateLimit} · timeoutSeconds={capability.timeoutSeconds}
                            </p>
                          </div>
                          {renderSwitch(capability.enabled, () => toggleApiCapability(capability.id))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'data_exchange' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Data Exchange</h2>
                    <p className="text-sm text-gray-500 mt-1">Configure data and event exchange rules with transform and retry policies</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ViewToggle mode={vm} onChange={(m) => setViewMode('data_exchange', m)} />
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo hover:bg-indigo-600 rounded-lg text-sm font-medium text-white transition-colors">
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
                {vm === 'json' ? (
                  <JsonView data={dataExchangeRules} onCopy={() => handleCopy(dataExchangeRules)} />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">Data/event exchange rules with transform and retry policy</p>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo/20 text-indigo-300 hover:bg-indigo/30 transition-colors text-sm">
                        <Plus className="w-4 h-4" />
                        Add Exchange Rule
                      </button>
                    </div>
                    {dataExchangeRules.map((rule) => (
                      <div key={rule.id} className="p-4 rounded-xl bg-black/60 border border-white/5 hover:border-indigo/20 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-medium text-white">{rule.name}</h4>
                              <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300">{rule.source}</span>
                            </div>
                            <p className="text-xs text-gray-500 font-mono">
                              trigger={rule.trigger} · transform={rule.transform} · retry={rule.retryPolicy}
                            </p>
                          </div>
                          {renderSwitch(rule.enabled, () => toggleDataExchangeRule(rule.id))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'api' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Secrets & Tokens</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage API keys, webhook tokens, account credentials, and other sensitive information</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ViewToggle mode={vm} onChange={(m) => setViewMode('api', m)} />
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo hover:bg-indigo-600 rounded-lg text-sm font-medium text-white transition-colors">
                      <Plus className="w-4 h-4" />
                      Add Secret
                    </button>
                  </div>
                </div>
                {vm === 'json' ? (
                  <JsonView data={secretItems.map(({ id, name, category, provider, created }) => ({ id, name, category, provider, created, value: '••••••••' }))} onCopy={() => handleCopy(secretItems.map(({ id, name, category, provider, created }) => ({ id, name, category, provider, created })))} />
                ) : (
                  <div className="space-y-3">
                    {secretItems.map((item) => {
                      const cat = categoryConfig[item.category];
                      return (
                        <div key={item.id} className="p-4 rounded-xl bg-black/60 border border-white/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-indigo/20 flex items-center justify-center">
                                <Key className="w-5 h-5 text-indigo-400" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-white">{item.name}</h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cat.bg} ${cat.color}`}>{cat.label}</span>
                                  {item.provider && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-gray-400">{item.provider}</span>}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                  <span>Created: {item.created}</span>
                                  <span>·</span>
                                  <span>Last used: {item.lastUsed}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60">
                                <span className="text-sm text-gray-400 font-mono">{showKey === item.id ? 'sk-xxxx...xxxx' : '••••••••'}</span>
                                <button onClick={() => setShowKey(showKey === item.id ? null : item.id)} className="p-1 hover:bg-white/5 rounded transition-colors">
                                  {showKey === item.id ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                                </button>
                              </div>
                              <button className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-300 font-medium">Security Notice</p>
                      <p className="text-sm text-amber-400/80 mt-1">
                        All secrets are encrypted at rest. Rotate API keys and webhook tokens regularly for best security practices.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {copyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-medium shadow-lg whitespace-nowrap z-[60] flex items-center gap-2">
          <Copy className="w-3.5 h-3.5" />
          Copied to clipboard
        </div>
      )}
    </div>
  );
}
