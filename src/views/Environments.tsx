'use client';
import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Copy, Check, Server, Plus } from 'lucide-react';
import Header from '../components/layout/Header';

interface EnvVariable {
  key: string;
  value: string;
  required: boolean;
}

interface Environment {
  id: string;
  name: string;
  agent: { name: string; emoji: string };
  status: 'active' | 'inactive' | 'draft';
  type: 'production' | 'staging' | 'development';
  variables: EnvVariable[];
  createdAt: string;
  updatedAt: string;
}

const mockEnvironments: Environment[] = [
  {
    id: 'env-prod-email',
    name: 'Production',
    agent: { name: 'Customer Service Email Assistant', emoji: '📧' },
    status: 'active',
    type: 'production',
    variables: [
      { key: 'OUTLOOK_TENANT_ID', value: 'prod-a1b2c3d4-e5f6-7890-abcd-ef1234567890', required: true },
      { key: 'CLIENT_ID', value: 'prod-x9y8z7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4', required: true },
      { key: 'MAILBOX', value: 'cs@acme-prod.com', required: true },
      { key: 'MANAGER_EMAIL', value: 'manager@acme-prod.com', required: true },
    ],
    createdAt: '2026-04-28',
    updatedAt: '2026-04-28',
  },
  {
    id: 'env-test-email',
    name: 'Staging',
    agent: { name: 'Customer Service Email Assistant', emoji: '📧' },
    status: 'active',
    type: 'staging',
    variables: [
      { key: 'OUTLOOK_TENANT_ID', value: '8a2f3b1c-e9d4-4a7b-b5f1-3c8e6d2a9f0b', required: true },
      { key: 'CLIENT_ID', value: 'e4d7a9f0-1b3c-4d5e-a6f7-8g9h0i1j2k3l', required: true },
      { key: 'MAILBOX', value: 'support@acme.com', required: true },
      { key: 'MANAGER_EMAIL', value: 'sarah@acme.com', required: true },
    ],
    createdAt: '2026-04-28',
    updatedAt: '2026-04-28',
  },
  {
    id: 'env-prod-oms',
    name: 'Production',
    agent: { name: 'OMS Agent', emoji: '🛒' },
    status: 'active',
    type: 'production',
    variables: [
      { key: 'WMS_API_KEY', value: 'wms-k8s-prod-29f1a3b7c4d5', required: true },
      { key: 'WAREHOUSE_ID', value: 'WH-EAST-001', required: true },
      { key: 'NOTIFICATION_CHANNEL', value: '#ops-alerts', required: true },
    ],
    createdAt: '2026-04-25',
    updatedAt: '2026-04-27',
  },
  {
    id: 'env-dev-oms',
    name: 'Development',
    agent: { name: 'OMS Agent', emoji: '🛒' },
    status: 'inactive',
    type: 'development',
    variables: [
      { key: 'WMS_API_KEY', value: 'wms-dev-test-00000000', required: true },
      { key: 'WAREHOUSE_ID', value: 'WH-DEV-999', required: true },
      { key: 'NOTIFICATION_CHANNEL', value: '#dev-test', required: true },
    ],
    createdAt: '2026-04-20',
    updatedAt: '2026-04-22',
  },
];

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400',
  inactive: 'bg-gray-500/15 text-gray-400',
  draft: 'bg-amber-500/15 text-amber-400',
};

const TYPE_STYLES: Record<string, string> = {
  production: 'bg-rose-500/10 text-rose-400',
  staging: 'bg-amber-500/10 text-amber-400',
  development: 'bg-blue-500/10 text-blue-400',
};

function maskValue(val: string) {
  if (val.length <= 8) return '••••••••';
  return val.slice(0, 4) + '••••' + val.slice(-4);
}

export default function Environments() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const filtered = mockEnvironments.filter((env) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      env.name.toLowerCase().includes(q) ||
      env.agent.name.toLowerCase().includes(q) ||
      env.id.toLowerCase().includes(q) ||
      env.type.toLowerCase().includes(q)
    );
  });

  const handleCopy = (envId: string, key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(`${envId}-${key}`);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const toggleReveal = (envId: string, key: string) => {
    const k = `${envId}-${key}`;
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <Header title="Environments" />
      <div className="px-8 py-6 max-w-6xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">All Environments</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-400">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search environments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 h-9 pl-9 pr-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo/40"
              />
            </div>
            <button className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white bg-indigo hover:bg-indigo/80 transition-colors">
              <Plus className="w-4 h-4" />
              New Environment
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1.2fr_100px_110px_100px] gap-4 px-5 py-3 bg-white/[0.02] border-b border-white/[0.06]">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Name</span>
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Agent</span>
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</span>
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Type</span>
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Updated</span>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Server className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No environments found</p>
            </div>
          ) : (
            filtered.map((env) => {
              const isExpanded = expandedId === env.id;
              return (
                <div key={env.id} className="border-b border-white/[0.04] last:border-0">
                  <div
                    className="grid grid-cols-[1fr_1.2fr_100px_110px_100px] gap-4 px-5 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors items-center"
                    onClick={() => setExpandedId(isExpanded ? null : env.id)}
                  >
                    <div className="flex items-center gap-2.5">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-white truncate">{env.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{env.agent.emoji}</span>
                      <span className="text-sm text-gray-300 truncate">{env.agent.name}</span>
                    </div>
                    <span className={`inline-flex w-fit px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${STATUS_STYLES[env.status]}`}>
                      {env.status}
                    </span>
                    <span className={`inline-flex w-fit px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${TYPE_STYLES[env.type]}`}>
                      {env.type}
                    </span>
                    <span className="text-xs text-gray-500">{env.updatedAt}</span>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1">
                      <div className="ml-6 rounded-lg border border-white/[0.06] overflow-hidden">
                        <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06]">
                          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Variables</span>
                        </div>
                        <div className="divide-y divide-white/[0.04]">
                          {env.variables.map((v) => {
                            const fullKey = `${env.id}-${v.key}`;
                            const revealed = revealedKeys.has(fullKey);
                            const copied = copiedKey === fullKey;
                            return (
                              <div key={v.key} className="flex items-center gap-4 px-4 py-2.5">
                                <span className="text-xs font-mono text-gray-300 w-44 flex-shrink-0">{v.key}</span>
                                <span
                                  className="flex-1 text-xs font-mono text-gray-500 truncate cursor-pointer hover:text-gray-300 transition-colors"
                                  onClick={(e) => { e.stopPropagation(); toggleReveal(env.id, v.key); }}
                                  title="Click to reveal/hide"
                                >
                                  {revealed ? v.value : maskValue(v.value)}
                                </span>
                                {v.required && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 flex-shrink-0">REQ</span>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCopy(env.id, v.key, v.value); }}
                                  className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                                  title="Copy value"
                                >
                                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="ml-6 mt-2 flex items-center gap-4 text-[11px] text-gray-600">
                        <span>ID: {env.id}</span>
                        <span>Created: {env.createdAt}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
