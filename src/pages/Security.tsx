import { Shield, Key, FileText, AlertTriangle, Lock, Eye } from 'lucide-react';
import Header from '../components/layout/Header';

const policies = [
  { id: '1', name: 'Agent Execution Policy', scope: 'All Agents', status: 'active', rules: 12, lastUpdated: '2 days ago' },
  { id: '2', name: 'Data Access Control', scope: 'Data Analyst Pro', status: 'active', rules: 8, lastUpdated: '1 week ago' },
  { id: '3', name: 'External API Policy', scope: 'Customer Support', status: 'warning', rules: 5, lastUpdated: '3 weeks ago' },
];

const apiKeys = [
  { id: '1', name: 'Production API Key', prefix: 'af_prod_****x7f2', created: 'Jan 15, 2026', lastUsed: '2 min ago', status: 'active' },
  { id: '2', name: 'Staging API Key', prefix: 'af_stg_****m3k9', created: 'Feb 20, 2026', lastUsed: '3 days ago', status: 'active' },
  { id: '3', name: 'Legacy Key (deprecated)', prefix: 'af_v1_****p2w1', created: 'Oct 5, 2025', lastUsed: '45 days ago', status: 'expired' },
];

const auditLog = [
  { id: '1', action: 'Policy Updated', user: 'Taylor Zhang', target: 'Agent Execution Policy', time: '2 hours ago', icon: FileText },
  { id: '2', action: 'API Key Rotated', user: 'System', target: 'Production API Key', time: '1 day ago', icon: Key },
  { id: '3', action: 'Access Revoked', user: 'Taylor Zhang', target: 'Legacy Key', time: '3 days ago', icon: Lock },
  { id: '4', action: 'Suspicious Activity', user: 'System', target: 'Financial Reconciliation Bot', time: '5 days ago', icon: AlertTriangle },
];

export default function Security() {
  return (
    <div className="min-h-screen">
      <Header title="Security" subtitle="Manage policies, API keys, and audit logs" />
      <div className="p-6 space-y-6">
        {/* Security Policies */}
        <div className="bg-dark-50 rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Security Policies</h3>
            </div>
            <button className="px-4 py-2 rounded-lg bg-indigo text-white text-sm font-medium hover:bg-indigo-600 transition-colors">
              + New Policy
            </button>
          </div>
          <div className="space-y-3">
            {policies.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-black/40 hover:bg-black/60 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.status === 'active' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                  <Shield className={`w-5 h-5 ${p.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  <p className="text-xs text-gray-500">Scope: {p.scope} · {p.rules} rules</p>
                </div>
                <span className="text-xs text-gray-500">{p.lastUpdated}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${p.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {p.status === 'active' ? 'Active' : 'Needs Review'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-dark-50 rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">API Keys</h3>
            </div>
            <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors">
              Generate Key
            </button>
          </div>
          <div className="space-y-3">
            {apiKeys.map((k) => (
              <div key={k.id} className="flex items-center gap-4 p-4 rounded-xl bg-black/40">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{k.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{k.prefix}</p>
                </div>
                <span className="text-xs text-gray-500">Created {k.created}</span>
                <span className="text-xs text-gray-500">Last used {k.lastUsed}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${k.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {k.status === 'active' ? 'Active' : 'Expired'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-dark-50 rounded-2xl border border-white/5 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Eye className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Audit Log</h3>
          </div>
          <div className="space-y-2">
            {auditLog.map((entry) => {
              const Icon = entry.icon;
              return (
                <div key={entry.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-black/30 transition-colors">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-white">{entry.action}</span>
                  <span className="text-xs text-gray-500">by {entry.user}</span>
                  <span className="text-xs text-gray-500">→ {entry.target}</span>
                  <span className="ml-auto text-xs text-gray-600">{entry.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
