'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, TrendingUp, TrendingDown, Activity, CheckCircle, AlertTriangle, Zap, XCircle, Clock, AlertCircle, Settings, Paperclip, Smartphone, QrCode, Shield, RefreshCw, CheckCircle2, ExternalLink, Users, ChevronDown, ChevronUp, Rocket, Wrench, Play, Pause, Code, Trash2 } from 'lucide-react';
import StewardHeader from '../components/session/StewardHeader';
import SessionReferenceCard from '../components/session/SessionReferenceCard';
import { useSessionStore, useCurrentSession } from '../stores/useSessionStore';
import { detectIntentChange, AGENT_CATALOG, generateSessionTitle } from '../utils/sessionUtils';
import TeamCollaborationCanvas from '../components/TeamCollaborationCanvas';
import { ParamConfirmCard, ResultCard, TypingIndicator } from '../components/runAgent/ScenarioCards';
import ConfigPanel from '../components/runAgent/ConfigPanel';
import RunDetailsPanel from '../components/runAgent/RunDetailsPanel';
import RunLogPanel from '../components/runAgent/RunLogPanel';
import PanelCard from '../components/PanelCard';
import BuildAgentPanel from '../components/buildAgent/BuildAgentPanel';
import { generatedAgentFiles, buildAgentChips, emailConfigFields, emailConfigScenarioMessages, emailScenarioMessages, prodConfigScenarioMessages, debugRunScenarioMessages, debugRun2ScenarioMessages } from '../data/buildAgentScenarios';
import { scenario1Messages, scenario1PanelParams, scenario1PanelParamsFilled, scenario1AgentFiles, agentFileContents, configScenarioMessages, configFields, configFieldsFilled } from '../data/runAgentScenarios';
import { chatflowMessages } from '../data/chatflowScenarios';
import { omsChatflowMessages, omsChatflowChipSets } from '../data/omsChatflowScenarios';
import { debugSidebarRound1, debugSidebarRound2, debugSidebarRound3, debugLeftRound1, debugLeftRound2, debugLeftRound3, debugSidebarRun2, debugLeftRun2Start } from '../data/debugRunSidebarScenarios';
import type { DebugSidebarMessage } from '../data/debugRunSidebarScenarios';
import DebugRunPanel from '../components/debugRun/DebugRunPanel';
import type { ScenarioMessage, PanelParam, ConfigField } from '../data/runAgentScenarios';
import type { ChatMessage } from '../types';

interface ApprovalItem {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  agent: string;
  action: string;
  details: string[];
  recommendation: string;
  recommendationType: 'approve' | 'review' | 'flag';
}

interface HealthIssue {
  id: string;
  agent: string;
  status: 'error' | 'warning' | 'config';
  issue: string;
  details: string[];
  recommendation: string;
}

const pendingApprovals: ApprovalItem[] = [
  {
    id: '1',
    priority: 'CRITICAL',
    agent: 'Data Analyst Pro',
    action: 'Execute production database query',
    details: ['Impact: Blocks Q4 sales report generation', 'Risk: Low (read-only aggregation query)'],
    recommendation: 'Approve - Query is safe and report is time-sensitive',
    recommendationType: 'approve',
  },
  {
    id: '2',
    priority: 'HIGH',
    agent: 'Customer Support Agent',
    action: 'Process refund for Order #12847',
    details: ['Amount: $299.99', 'Reason: Damaged product (photos verified)'],
    recommendation: 'Approve - Evidence is clear, within policy limits',
    recommendationType: 'approve',
  },
  {
    id: '3',
    priority: 'HIGH',
    agent: 'Financial Reconciliation Bot',
    action: 'Adjust ledger entries',
    details: ['Discrepancy: $1,247.50', 'Source: Bank statement mismatch'],
    recommendation: 'Approve with flag - Create adjustment entry but mark for manual audit',
    recommendationType: 'flag',
  },
  {
    id: '4',
    priority: 'MEDIUM',
    agent: 'Code Review Assistant',
    action: 'Auto-merge PR #483',
    details: ['Branch: feature/user-auth -> main', 'Status: All tests passing, 2 approvals'],
    recommendation: 'Approve - Standard merge, no conflicts',
    recommendationType: 'approve',
  },
];

const healthIssues: HealthIssue[] = [
  {
    id: '1',
    agent: 'Financial Reconciliation Bot',
    status: 'error',
    issue: 'Banking API timeout — 8 failed attempts, 2h ago',
    details: ['Frequency: 8 failed connection attempts', 'Auto-recovery: Attempted twice, unsuccessful', 'Root cause: API credentials may have expired or rate limit exceeded'],
    recommendation: 'Rotate API credentials in Connectors settings',
  },
  {
    id: '2',
    agent: 'Invoice Processor',
    status: 'error',
    issue: 'PDF parsing failure — corrupted template, 1h ago',
    details: ['Frequency: 12 failures in 1 hour', 'Auto-recovery: No auto-recovery', 'Root cause: PDF template format changed upstream'],
    recommendation: 'Update PDF parser to handle new template version',
  },
  {
    id: '3',
    agent: 'Customer Support Agent',
    status: 'warning',
    issue: 'Response time +340% — CRM connector latency',
    details: ['Current avg: 12.3s (normal: 2.8s)', 'Cause: Salesforce CRM connector experiencing high latency'],
    recommendation: 'Temporarily disable CRM lookup for non-critical tickets',
  },
  {
    id: '4',
    agent: 'Email Campaign Bot',
    status: 'warning',
    issue: 'Bounce rate 12% — exceeds 5% threshold',
    details: ['Last 24h average', 'Auto-retry enabled', 'Root cause: Invalid email addresses in recent import batch'],
    recommendation: 'Run email validation on import batch and quarantine invalid entries',
  },
  {
    id: '5',
    agent: 'Data Sync Agent',
    status: 'warning',
    issue: 'Sync delay 45min — normally under 5min',
    details: ['Ongoing since 6:00 AM', 'Retry scheduled', 'Root cause: Source database under heavy load'],
    recommendation: 'Switch to off-peak sync window or use read replica',
  },
  {
    id: '6',
    agent: 'WMS Inventory Manager',
    status: 'config',
    issue: 'Missing: API Key, Warehouse ID, Notification Channel',
    details: ['Missing: WMS API Key, Warehouse ID, Notification Channel'],
    recommendation: 'Complete setup in agent configuration to activate',
  },
  {
    id: '7',
    agent: 'HR Onboarding Bot',
    status: 'config',
    issue: 'Missing: LDAP credentials, Slack webhook',
    details: ['Since deployment', 'N/A — not configured', 'Root cause: LDAP and Slack integration not set up'],
    recommendation: 'Provide LDAP credentials and create Slack webhook',
  },
];

const initialConversation: ChatMessage[] = [
  {
    id: '1',
    role: 'steward',
    content: 'WELCOME_VIEW',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const dashboardData = {
  summary: {
    activeAgents: 5,
    totalAgents: 7,
    tasksToday: 847,
    successRate: 96.2,
    monthlySpend: 1003.80,
    monthlyBudget: 2000,
    avgResponseTime: 2.4,
  },
  agents: [
    { name: 'Customer Support Agent', tasks: 312, success: 94.2, cost: 512.30, trend: 'up', status: 'warning' },
    { name: 'Data Analyst Pro', tasks: 89, success: 98.5, cost: 245.80, trend: 'up', status: 'healthy' },
    { name: 'Code Review Assistant', tasks: 156, success: 99.1, cost: 89.50, trend: 'stable', status: 'healthy' },
    { name: 'Financial Reconciliation Bot', tasks: 0, success: 0, cost: 156.20, trend: 'down', status: 'error' },
    { name: 'Marketing Content Creator', tasks: 0, success: 0, cost: 0, trend: 'stable', status: 'inactive' },
    { name: 'WMS Inventory Manager', tasks: 0, success: 0, cost: 0, trend: 'stable', status: 'config' },
  ],
  insights: [
    { type: 'positive', text: 'Task completion up 12.5% vs last week' },
    { type: 'positive', text: 'Cost efficiency improved 8.3% this month' },
    { type: 'warning', text: '1 agent in error state requires attention' },
    { type: 'info', text: '1 agent pending configuration to activate' },
  ],
};

const stewardTeamsData: Record<string, { id: string; name: string; type: string; agents: { id: string; name: string; emoji: string; role: string; status: string; currentTask: string | null }[] }> = {
  'wms-inbound-team': {
    id: 'team-1', name: 'WMS Inbound Team', type: 'workflow',
    agents: [
      { id: 'a1', name: 'Receipt Validator', emoji: '📦', role: 'Entry Point', status: 'assign_task', currentTask: 'Delegating validated PO-20260317-012 to Inventory Updater' },
      { id: 'a2', name: 'Inventory Updater', emoji: '🔄', role: 'Processing', status: 'working', currentTask: 'Updating stock levels for 247 SKUs in warehouse A' },
      { id: 'a3', name: 'Quality Inspector', emoji: '🔍', role: 'Validation', status: 'idle', currentTask: null },
      { id: 'a4', name: 'Label Generator', emoji: '🏷️', role: 'Output', status: 'idle', currentTask: null },
      { id: 'a5', name: 'Storage Allocator', emoji: '📍', role: 'Final', status: 'idle', currentTask: null },
    ],
  },
  'recruiting-team': {
    id: 'team-2', name: 'Recruiting Team', type: 'manager',
    agents: [
      { id: 'manager', name: 'Recruiting Manager', emoji: '👔', role: 'Manager', status: 'working', currentTask: 'Reviewing 12 candidate profiles and assigning tasks' },
      { id: 'b1', name: 'Resume Screener', emoji: '📄', role: 'Specialist', status: 'working', currentTask: 'Screening 45 resumes for Senior Developer position' },
      { id: 'b2', name: 'Interview Scheduler', emoji: '📅', role: 'Specialist', status: 'idle', currentTask: null },
      { id: 'b3', name: 'Candidate Evaluator', emoji: '⭐', role: 'Specialist', status: 'working', currentTask: 'Analyzing interview feedback for 8 candidates' },
      { id: 'b4', name: 'Offer Generator', emoji: '✉️', role: 'Specialist', status: 'assign_task', currentTask: 'Waiting for approval to send offer to candidate' },
    ],
  },
};

const stewardTeamApprovals: Record<string, { id: string; agent: string; action: string; priority: 'CRITICAL' | 'HIGH' | 'MEDIUM'; timestamp: string }[]> = {
  'wms-inbound-team': [
    { id: 'PA-001', agent: 'Storage Allocator', action: 'Allocate zone B3 for oversized shipment PO-20260317-012', priority: 'HIGH', timestamp: '3 min ago' },
    { id: 'PA-002', agent: 'Quality Inspector', action: 'Flag batch BT-2026-0315 for re-inspection (moisture detected)', priority: 'CRITICAL', timestamp: '12 min ago' },
    { id: 'PA-003', agent: 'Inventory Updater', action: 'Write-off 15 damaged units from SKU-44821', priority: 'MEDIUM', timestamp: '25 min ago' },
  ],
  'recruiting-team': [
    { id: 'PA-004', agent: 'Offer Generator', action: 'Send offer letter to candidate for Senior Developer role', priority: 'HIGH', timestamp: '5 min ago' },
    { id: 'PA-005', agent: 'Resume Screener', action: 'Bulk reject 23 unqualified applications', priority: 'MEDIUM', timestamp: '8 min ago' },
    { id: 'PA-006', agent: 'Recruiting Manager', action: 'Escalate hiring timeline for Q2 engineering positions', priority: 'CRITICAL', timestamp: '15 min ago' },
    { id: 'PA-007', agent: 'Interview Scheduler', action: 'Book external meeting room for panel interview', priority: 'MEDIUM', timestamp: '30 min ago' },
    { id: 'PA-008', agent: 'Candidate Evaluator', action: 'Override evaluation score for internal referral candidate', priority: 'HIGH', timestamp: '45 min ago' },
  ],
};

function TeamOverviewWidget({ teamKey }: { teamKey: string }) {
  const team = stewardTeamsData[teamKey];
  const approvals = stewardTeamApprovals[teamKey] || [];

  const approvalPriorityConfig: Record<string, { bg: string; text: string }> = {
    CRITICAL: { bg: 'bg-rose-500/20', text: 'text-rose-400' },
    HIGH: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    MEDIUM: { bg: 'bg-indigo/20', text: 'text-indigo-400' },
  };

  if (!team) return null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Team collaboration & pending approvals</p>

      <div className="bg-dark-50 rounded-2xl border border-white/5 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Agent Collaboration</h3>
        <TeamCollaborationCanvas team={team} />
      </div>

      <div className="bg-dark-50 rounded-2xl border border-white/5 p-5">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-semibold text-white">Pending Approvals</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
            {approvals.length}
          </span>
        </div>
        <div className="space-y-3">
          {approvals.map((item) => {
            const pCfg = approvalPriorityConfig[item.priority] || approvalPriorityConfig.MEDIUM;
            return (
              <div key={item.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-black/60 hover:bg-black/70 transition-colors">
                <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${pCfg.bg} ${pCfg.text}`}>
                  {item.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-white">{item.agent}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{item.action}</p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{item.timestamp}</span>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                    Approve
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">
                    Review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ApprovalsWidget({ onApprove, onProcessAll }: {
  onApprove?: (agent: string, action: string) => void;
  onProcessAll?: () => void;
}) {
  const [itemStates, setItemStates] = useState<Record<string, 'approved' | 'review'>>({});
  const [allProcessed, setAllProcessed] = useState(false);

  const priorityConfig = {
    CRITICAL: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
    HIGH: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    MEDIUM: { bg: 'bg-indigo/20', text: 'text-indigo-400', border: 'border-indigo/30' },
    LOW: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
  };

  const handleApprove = (item: ApprovalItem) => {
    setItemStates((prev) => ({ ...prev, [item.id]: 'approved' }));
    onApprove?.(item.agent, item.action);
  };

  const handleReview = (item: ApprovalItem) => {
    setItemStates((prev) => ({ ...prev, [item.id]: 'review' }));
  };

  const handleProcessAll = () => {
    setAllProcessed(true);
    const states: Record<string, 'approved' | 'review'> = {};
    pendingApprovals.forEach((i) => { states[i.id] = 'approved'; });
    setItemStates(states);
    onProcessAll?.();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Sorted by priority • {pendingApprovals.filter((i) => !itemStates[i.id]).length} items</p>

      {/* Pending items */}
      <div className="space-y-3">
        {pendingApprovals.filter((i) => !itemStates[i.id]).map((item) => {
          const priority = priorityConfig[item.priority];
          return (
            <div key={item.id} className="rounded-xl border border-white/5 p-3.5 hover:bg-black/20 transition-colors">
              {/* Row 1: priority + agent */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex-shrink-0 ${priority.bg} ${priority.text}`}>
                  {item.priority}
                </span>
                <span className="text-[13px] font-semibold text-white truncate">{item.agent}</span>
              </div>
              {/* Row 2: action */}
              <p className="text-xs text-gray-300 mb-1.5 leading-relaxed">{item.action}</p>
              {/* Row 3: details */}
              <div className="space-y-0.5 mb-2">
                {item.details.map((detail, i) => (
                  <p key={i} className="text-[11px] text-gray-500 leading-relaxed">{detail}</p>
                ))}
              </div>
              {/* Row 4: recommendation */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/40 mb-3">
                <span className={`text-[11px] font-medium ${
                  item.recommendationType === 'approve' ? 'text-emerald-400' :
                  item.recommendationType === 'flag' ? 'text-amber-400' : 'text-indigo-400'
                }`}>
                  💡 {item.recommendationType === 'approve' ? 'Recommended: Approve' :
                   item.recommendationType === 'flag' ? 'Recommended: Approve with flag' : 'Recommended: Review first'}
                </span>
              </div>
              {/* Row 5: buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(item)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReview(item)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                >
                  Review
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Processed items — compact rows */}
      {pendingApprovals.filter((i) => itemStates[i.id]).length > 0 && (
        <div>
          <p className="text-xs text-gray-600 mb-2">Processed ({pendingApprovals.filter((i) => itemStates[i.id]).length})</p>
          <div className="rounded-xl border border-white/5 overflow-hidden">
            {pendingApprovals.filter((i) => itemStates[i.id]).map((item, idx, arr) => {
              const priority = priorityConfig[item.priority];
              const state = itemStates[item.id];
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-2.5 bg-black/40 ${idx < arr.length - 1 ? 'border-b border-white/[0.03]' : ''}`}
                >
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${priority.bg} ${priority.text}`}>
                    {item.priority}
                  </span>
                  <span className="text-xs text-gray-400 flex-1 truncate">
                    {item.agent} • {item.action}
                  </span>
                  <span className={`text-xs font-medium flex-shrink-0 ${
                    state === 'approved' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {state === 'approved' ? 'Approved' : 'In Review'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pendingApprovals.filter((i) => !itemStates[i.id]).length > 0 && !allProcessed && (
        <button
          onClick={handleProcessAll}
          className="w-full py-3 rounded-xl text-sm font-semibold bg-indigo/20 text-indigo-400 hover:bg-indigo/30 transition-colors border border-indigo/30"
        >
          Process All Recommendations
        </button>
      )}
    </div>
  );
}

function HealthIssuesWidget({ onFixNow, onFixAll }: { onFixNow?: (agent: string, issue: string) => void; onFixAll?: () => void }) {
  const statusConfig = {
    error: { icon: XCircle, bg: 'bg-rose-500/20', text: 'text-rose-400', label: 'ERROR' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'WARNING' },
    config: { icon: Settings, bg: 'bg-indigo/20', text: 'text-indigo-400', label: 'CONFIG NEEDED' },
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Requires attention • {healthIssues.length} issues</p>

      <div className="space-y-4">
        {healthIssues.map((item) => {
          const status = statusConfig[item.status];
          const Icon = status.icon;
          return (
            <div key={item.id} className="bg-dark-50 rounded-2xl border border-white/5 p-5 hover:bg-black/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${status.bg}`}>
                  <Icon className={`w-6 h-6 ${status.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white text-base">{item.agent}</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3 leading-relaxed">{item.issue}</p>
                  <div className="space-y-1 mb-3">
                    {item.details.map((detail, i) => (
                      <p key={i} className="text-sm text-gray-400">{detail}</p>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-black/60">
                    <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm text-indigo-300">{item.recommendation}</span>
                  </div>
                </div>
                <button
                  onClick={() => onFixNow?.(item.agent, item.issue)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo/20 text-indigo-400 hover:bg-indigo/30 transition-colors flex-shrink-0"
                >
                  Fix Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onFixAll?.()}
        className="w-full py-4 rounded-xl text-base font-semibold bg-indigo/20 text-indigo-400 hover:bg-indigo/30 transition-colors border border-indigo/30"
      >
        Apply All Recommended Fixes
      </button>
    </div>
  );
}

function DashboardWidget() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Real-time performance overview</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-50 rounded-2xl p-6 border border-white/5">
          <div className="text-5xl font-bold text-white mb-2">{dashboardData.summary.activeAgents}<span className="text-2xl text-gray-500">/{dashboardData.summary.totalAgents}</span></div>
          <p className="text-sm text-gray-400">Active Agents</p>
        </div>
        <div className="bg-dark-50 rounded-2xl p-6 border border-white/5">
          <div className="text-5xl font-bold text-emerald-400 mb-2">{dashboardData.summary.tasksToday}</div>
          <p className="text-sm text-gray-400">Tasks Today</p>
        </div>
        <div className="bg-dark-50 rounded-2xl p-6 border border-white/5">
          <div className="text-5xl font-bold text-indigo-400 mb-2">{dashboardData.summary.successRate}%</div>
          <p className="text-sm text-gray-400">Success Rate</p>
        </div>
        <div className="bg-dark-50 rounded-2xl p-6 border border-white/5">
          <div className="text-5xl font-bold text-cyan-400 mb-2">${dashboardData.summary.monthlySpend.toFixed(0)}</div>
          <p className="text-sm text-gray-400">Monthly Spend</p>
        </div>
      </div>

      <div className="bg-dark-50 rounded-2xl p-5 border border-white/5">
        <h3 className="text-lg font-semibold text-white mb-4">Agent Performance</h3>
        <div className="space-y-3">
          {dashboardData.agents.map((agent) => (
            <div key={agent.name} className="flex items-center gap-4 p-4 rounded-xl bg-black/60 hover:bg-black/60 transition-colors">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                agent.status === 'healthy' ? 'bg-emerald-400' :
                agent.status === 'warning' ? 'bg-amber-400' :
                agent.status === 'error' ? 'bg-rose-400' :
                agent.status === 'inactive' ? 'bg-gray-500' : 'bg-indigo-400'
              }`} />
              <span className="text-sm text-white flex-1 truncate font-medium">{agent.name}</span>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-gray-400 w-20 text-right">{agent.tasks} tasks</span>
                <span className={`w-14 text-right font-medium ${agent.success >= 95 ? 'text-emerald-400' : agent.success >= 90 ? 'text-amber-400' : 'text-gray-500'}`}>
                  {agent.success > 0 ? `${agent.success}%` : '-'}
                </span>
                <span className="text-gray-400 w-16 text-right">${agent.cost.toFixed(0)}</span>
                {agent.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                {agent.trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-400" />}
                {agent.trend === 'stable' && <span className="w-4 h-4 flex items-center justify-center text-gray-500">-</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-50 rounded-2xl p-5 border border-white/5">
        <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
        <div className="space-y-3">
          {dashboardData.insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-black/60">
              {insight.type === 'positive' && <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />}
              {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />}
              {insight.type === 'info' && <Zap className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />}
              <span className="text-sm text-gray-300">{insight.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WhatsAppOAuthWidget({ stage }: { stage: 'qr' | 'verifying' | 'connected' }) {
  const [currentStage, setCurrentStage] = useState(stage);

  useEffect(() => {
    if (stage === 'qr') {
      const timer1 = setTimeout(() => setCurrentStage('verifying'), 6000);
      const timer2 = setTimeout(() => setCurrentStage('connected'), 9000);
      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }
    setCurrentStage(stage);
  }, [stage]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">OAuth Configuration • WhatsApp Business API</p>

      {/* Progress Steps */}
      <div className="flex items-center gap-3">
        {[
          { label: 'Scan QR', step: 1 },
          { label: 'Verify', step: 2 },
          { label: 'Connected', step: 3 },
        ].map((s) => {
          const stepNum = s.step;
          const isActive = (currentStage === 'qr' && stepNum === 1) ||
                          (currentStage === 'verifying' && stepNum === 2) ||
                          (currentStage === 'connected' && stepNum === 3);
          const isCompleted = (currentStage === 'verifying' && stepNum === 1) ||
                             (currentStage === 'connected' && stepNum <= 2);
          return (
            <div key={s.label} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isCompleted ? 'bg-emerald-500 text-white' :
                isActive ? 'bg-indigo text-white ring-2 ring-indigo/40' :
                'bg-white/5 text-gray-500'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
              </div>
              <span className={`text-xs font-medium ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                {s.label}
              </span>
              {stepNum < 3 && <div className={`flex-1 h-px ${isCompleted ? 'bg-emerald-500' : 'bg-white/10'}`} />}
            </div>
          );
        })}
      </div>

      {/* QR Code Stage */}
      {currentStage === 'qr' && (
        <div className="space-y-5">
          <div className="bg-dark-50 rounded-2xl border border-white/5 p-6 flex flex-col items-center">
            {/* Mock QR Code */}
            <div className="w-56 h-56 bg-white rounded-2xl p-3 mb-4 relative">
              <div className="w-full h-full relative">
                <QrCode className="w-full h-full text-gray-800" strokeWidth={0.8} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400 text-center mb-1">Scan this QR code with your phone</p>
            <p className="text-xs text-gray-500 text-center">QR code expires in <span className="text-amber-400 font-medium">4:32</span></p>
          </div>

          <div className="bg-dark-50 rounded-2xl border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-base">📱</span> How to connect
            </h3>
            <div className="space-y-3">
              {[
                'Open WhatsApp on your phone',
                'Go to Settings → Linked Devices',
                'Tap "Link a Device"',
                'Point your phone camera at the QR code above',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-indigo-400">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-50 rounded-2xl border border-emerald-500/20 p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-400 mb-1">End-to-end encrypted</p>
                <p className="text-xs text-gray-400">Your messages and data are secured with WhatsApp's encryption protocol. Agent Factory only accesses authorized business channels.</p>
              </div>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Regenerate QR Code
          </button>
        </div>
      )}

      {/* Verifying Stage */}
      {currentStage === 'verifying' && (
        <div className="space-y-5">
          <div className="bg-dark-50 rounded-2xl border border-indigo/20 p-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-indigo/20 flex items-center justify-center mb-4 animate-pulse">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
            <p className="text-lg font-semibold text-white mb-2">Verifying Connection...</p>
            <p className="text-sm text-gray-400 text-center">Establishing secure OAuth handshake with WhatsApp Business API</p>
          </div>

          <div className="bg-dark-50 rounded-2xl border border-white/5 p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-gray-300">QR code scanned successfully</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-gray-300">Device authenticated</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                <span className="text-sm text-gray-300">Requesting OAuth token...</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/5" />
                <span className="text-sm text-gray-500">Configuring message permissions</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connected Stage */}
      {currentStage === 'connected' && (
        <div className="space-y-5">
          <div className="bg-dark-50 rounded-2xl border border-emerald-500/20 p-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-lg font-semibold text-white mb-2">WhatsApp Connected!</p>
            <p className="text-sm text-gray-400 text-center">OAuth authorization completed successfully</p>
          </div>

          <div className="bg-dark-50 rounded-2xl border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Connection Details</h3>
            <div className="space-y-3">
              {[
                { label: 'Account', value: 'AgentFactory Business' },
                { label: 'Phone', value: '+1 (555) ***-**89' },
                { label: 'API Version', value: 'WhatsApp Business API v18.0' },
                { label: 'OAuth Token', value: 'wba_****...x7f2' },
                { label: 'Permissions', value: 'messages.read, messages.send, media.upload' },
                { label: 'Webhook', value: 'https://api.agentfactory.io/wh/wa' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span className="text-xs text-gray-300 font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-50 rounded-2xl border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Available for Agents</h3>
            <p className="text-xs text-gray-400 mb-3">These agents can now use WhatsApp as a communication channel:</p>
            <div className="space-y-2">
              {['Customer Support Agent', 'Recruiting Manager', 'Offer Generator'].map((agent) => (
                <div key={agent} className="flex items-center gap-2 p-2.5 rounded-lg bg-black/40">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-sm text-gray-300">{agent}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-indigo/20 text-indigo-400 hover:bg-indigo/30 transition-colors">
              <Settings className="w-4 h-4" />
              Configure Permissions
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">
              <ExternalLink className="w-4 h-4" />
              Test Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const runAgentTeams: Array<{
  id: string;
  name: string;
  description: string;
  status: 'running' | 'inactive' | 'config_required' | 'error';
  mode: 'task' | 'chatflow';
  tasksToday: number;
  accuracy: number;
  tokens: number;
  agents: Array<{ name: string; emoji: string }>;
  version: string;
}> = [
  {
    id: 'team-1',
    name: 'OMS Agent for Multichannel Orders and Inventory and Fulfillment v1',
    description: 'Unified single-agent OMS/DI operator for Shopify-first multichannel orders, inventory sync, and fulfillment orchestration',
    status: 'inactive' as const,
    mode: 'task' as const,
    tasksToday: 10,
    accuracy: 100.0,
    tokens: 0,
    agents: [{ name: 'OMS Agent for Multichannel Orders and Inventory and Fulfillment v2', emoji: '🛒' }],
    version: 'v7',
  },
  {
    id: 'team-2',
    name: 'Email Draft Confirmation Assistant',
    description: 'Drafts an email subject and body from user input, requires explicit manual approval before sending',
    status: 'inactive' as const,
    mode: 'chatflow' as const,
    tasksToday: 0,
    accuracy: 0,
    tokens: 0,
    agents: [{ name: 'Email Draft & Send Assistant Agent', emoji: '✉️' }],
    version: 'v7',
  },
  {
    id: 'team-3',
    name: 'Warehouse Network Design Agent',
    description: 'Single-agent registry package for US warehouse network design, grounded in real geospatial and logistics data',
    status: 'inactive' as const,
    mode: 'task' as const,
    tasksToday: 3,
    accuracy: 26.7,
    tokens: 0,
    agents: [{ name: 'Warehouse Network Design Agent', emoji: '🏭' }],
    version: 'v5',
  },
  {
    id: 'team-4',
    name: 'WES Pick Task Execution Agent',
    description: 'Reusable API-first manual-station WES pick execution agent for OMRON shelf-to-person systems',
    status: 'config_required' as const,
    mode: 'task' as const,
    tasksToday: 0,
    accuracy: 0,
    tokens: 0,
    agents: [{ name: 'WES Pick Task Execution Agent', emoji: '📦' }],
    version: 'v22',
  },
];

const runAgentStatusConfig: Record<string, { label: string; color: string; bgColor: string; dotColor: string }> = {
  running: { label: 'Running', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', dotColor: 'bg-emerald-400' },
  inactive: { label: 'Inactive', color: 'text-rose-400', bgColor: 'bg-rose-500/20', dotColor: 'bg-rose-400' },
  config_required: { label: 'Config Required', color: 'text-amber-400', bgColor: 'bg-amber-500/20', dotColor: 'bg-amber-400' },
  error: { label: 'Error', color: 'text-rose-400', bgColor: 'bg-rose-500/20', dotColor: 'bg-rose-400' },
};

function ExecLogDetailPanel({ scenarioParams }: { scenarioParams: PanelParam[] }) {
  const execLogMsg = scenario1Messages.find((m) => m.card?.type === 'exec-log');
  const resultMsg = scenario1Messages.find((m) => m.card?.type === 'result-card');
  const logLines = execLogMsg?.card?.lines || [];
  const resultStats = resultMsg?.card?.stats || [];
  const [visibleCount, setVisibleCount] = useState(0);
  const logScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount < logLines.length) {
      const timer = setTimeout(() => setVisibleCount((c) => c + 1), 300);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, logLines.length]);

  useEffect(() => {
    if (logScrollRef.current) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
    }
  }, [visibleCount]);

  const statusColor = (s: string) => {
    if (s === 'ok') return 'text-emerald-400';
    if (s === 'info') return 'text-blue-400';
    if (s === 'warn') return 'text-amber-400';
    return 'text-gray-500';
  };
  const statusIcon = (s: string) => {
    if (s === 'ok') return '✓';
    if (s === 'info') return '●';
    if (s === 'warn') return '⚠';
    return '·';
  };

  const allDone = visibleCount >= logLines.length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {resultStats.map(([num, label], i) => (
          <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
            <div className="text-lg font-bold text-white">{num}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {allDone ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/12 text-emerald-400">COMPLETED</span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo/20 text-indigo-300">RUNNING</span>
        )}
        <span className="text-[11px] text-gray-500">Duration: 1m 06s</span>
      </div>

      <div className="rounded-xl bg-[#08080e] border border-white/[0.06] overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-300">Execution Log</span>
          <span className="text-[10px] text-gray-600">{visibleCount}/{logLines.length} entries</span>
        </div>
        <div ref={logScrollRef} className="p-3.5 font-mono text-[11px] leading-[2] space-y-0 max-h-[280px] overflow-y-auto">
          {logLines.slice(0, visibleCount).map((line, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <span className="text-gray-600 flex-shrink-0 w-[60px]">{line.time}</span>
              <span className={`flex-shrink-0 w-3 text-center ${statusColor(line.status)}`}>{statusIcon(line.status)}</span>
              <span className={statusColor(line.status)}>{line.text}</span>
            </div>
          ))}
          {!allDone && (
            <div className="flex items-center gap-2 py-1">
              <div className="w-3 h-3 rounded-full border-2 border-indigo border-t-transparent animate-spin" />
              <span className="text-[10px] text-gray-600">Loading...</span>
            </div>
          )}
        </div>
        {allDone && (
          <div className="px-3.5 py-2 border-t border-white/[0.04]">
            <div className="h-[3px] rounded-sm bg-gradient-to-r from-indigo to-[#7F43AD]" />
          </div>
        )}
      </div>

      <div className="rounded-xl bg-black/40 border border-white/[0.04] overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-white/[0.04]">
          <span className="text-[11px] font-semibold text-gray-300">Parameters Used</span>
        </div>
        <div className="p-3.5 space-y-1.5">
          {scenarioParams.filter((p) => p.value.trim()).map((p, i) => (
            <div key={i} className="flex justify-between items-center py-1">
              <span className="text-[11px] text-gray-500">{p.name}</span>
              <span className="text-[11px] text-gray-300 font-medium">{p.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RunAgentWidget({ onRun }: { onRun?: (teamId: string, teamName: string, emoji: string, version: string, status: string, mode: string) => void }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Select a team to run or manage</p>

      <div className="space-y-4">
        {runAgentTeams.map((team) => {
          const status = runAgentStatusConfig[team.status];
          return (
            <div key={team.id} className="bg-dark-50 rounded-2xl border border-white/5 p-5 hover:border-indigo/30 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-indigo-300 leading-snug">{team.name}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bgColor} ${status.color} shrink-0`}>
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
                  <p className="text-xs text-gray-500 line-clamp-2">{team.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-3 pl-[52px]">
                <div>
                  <p className="text-base font-semibold text-white">{team.tasksToday}</p>
                  <p className="text-[10px] text-gray-500">Tasks (today)</p>
                </div>
                <div>
                  <p className={`text-base font-semibold ${team.accuracy > 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {team.accuracy > 0 ? `${team.accuracy}%` : '—'}
                  </p>
                  <p className="text-[10px] text-gray-500">Accuracy</p>
                </div>
              <div>
                  <p className="text-base font-semibold text-white">{team.tokens > 0 ? team.tokens.toLocaleString() : '0'}</p>
                  <p className="text-[10px] text-gray-500">Tokens</p>
                </div>
              </div>

              <div className="pl-[52px] mb-3">
                <p className="text-[10px] text-gray-500 mb-1.5">Team Agents</p>
                <div className="flex flex-wrap gap-1.5">
                  {team.agents.map((agent, idx) => (
                    <div key={idx} className="h-6 px-2.5 rounded-full bg-black/60 flex items-center gap-1.5">
                      <span className="text-xs">{agent.emoji}</span>
                      <span className="text-[11px] text-gray-300">{agent.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 pt-3 border-t border-white/5">
                <button
                  onClick={() => onRun?.(team.id, team.name, team.agents[0]?.emoji || '🤖', team.version, team.status, team.mode)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {team.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  <Clock className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg text-gray-400 hover:text-indigo-300 hover:bg-indigo/10 transition-colors">
                  <Code className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


const HEALTH_DISPLAY_LIMIT = 3;

function WelcomeWidget({ onQuickAction, onFixNow, onViewAllIssues }: {
  onQuickAction: (action: string) => void;
  onFixNow: (agent: string, issue: string) => void;
  onViewAllIssues: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [healthOpen, setHealthOpen] = useState(false);
  const [sentItems, setSentItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setSentItems(new Set());
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleFixNow = (id: string, agent: string, issue: string) => {
    setSentItems(prev => new Set(prev).add(id));
    onFixNow(agent, issue);
  };

  const displayedIssues = healthIssues.slice(0, HEALTH_DISPLAY_LIMIT);

  return (
    <div className="w-full max-w-[660px]">
      {/* Greeting */}
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        <span className="text-gray-200 font-semibold">Hi, I'm your Agent Steward.</span><br />
        I manage your AI workforce — handling issues, running agents, and processing approvals.
      </p>

      {/* Overview Card */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Overview</span>
          <button
            onClick={handleRefresh}
            className="text-gray-500 hover:text-indigo-400 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-4 divide-x divide-white/[0.04]">
          {[
            { label: 'Active', value: `${dashboardData.summary.activeAgents}/${dashboardData.summary.totalAgents}`, sub: 'agents online' },
            { label: 'Tasks Today', value: String(dashboardData.summary.tasksToday), sub: '+12.5% vs last week', good: false },
            { label: 'Success Rate', value: `${dashboardData.summary.successRate}%`, sub: 'target: 95%', good: true },
            { label: 'Spend', value: `$${dashboardData.summary.monthlySpend.toFixed(0)}`, sub: `of $${dashboardData.summary.monthlyBudget.toLocaleString()} budget` },
          ].map((cell) => (
            <div key={cell.label} className="text-center py-2 px-1">
              <div className="text-[10px] text-gray-500 uppercase tracking-tight mb-1">{cell.label}</div>
              {isLoading ? (
                <>
                  <div className="h-[18px] w-10 mx-auto mb-1 rounded bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] bg-[length:200%_100%] animate-pulse" />
                  <div className="h-2 w-14 mx-auto rounded bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] bg-[length:200%_100%] animate-pulse" />
                </>
              ) : (
                <>
                  <div className={`text-lg font-bold ${cell.good ? 'text-emerald-400' : 'text-white'}`}>{cell.value}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">{cell.sub}</div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Needs Attention */}
        <div className="border-t border-white/[0.06] mt-3 pt-3">
          <button
            onClick={() => setHealthOpen(!healthOpen)}
            className="w-full flex items-center justify-between group"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Needs Attention
              {!isLoading && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400">
                  {healthIssues.length}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-600 group-hover:text-gray-400 flex items-center gap-1 transition-colors">
              {healthOpen ? 'Hide' : 'Show'}
              {healthOpen ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
            </span>
          </button>

          {healthOpen && (
            <div className="mt-2.5 space-y-0">
              {displayedIssues.map((item) => {
                const isSent = sentItems.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 py-2 border-b border-white/[0.03] last:border-0 transition-opacity ${isSent ? 'opacity-40' : ''}`}
                  >
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                      isSent ? 'bg-indigo-500/15 text-indigo-400' :
                      item.status === 'error' ? 'bg-rose-500/10 text-rose-400' :
                      item.status === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {isSent ? 'SENT' : item.status === 'error' ? 'ERROR' : item.status === 'warning' ? 'WARN' : 'CONFIG'}
                    </span>
                    <span className="text-xs font-medium text-gray-300 flex-shrink-0 min-w-[140px]">{item.agent}</span>
                    <span className="text-[11px] text-gray-500 flex-1 truncate">{item.issue}</span>
                    {isSent ? (
                      <span className="text-[10px] font-medium text-indigo-400 flex items-center gap-1 flex-shrink-0">✓ Sent</span>
                    ) : (
                      <button
                        onClick={() => handleFixNow(item.id, item.agent, item.issue)}
                        className="text-[10px] font-medium px-2.5 py-1 rounded bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors flex-shrink-0"
                      >
                        Fix Now
                      </button>
                    )}
                  </div>
                );
              })}

              {healthIssues.length > HEALTH_DISPLAY_LIMIT && (
                <div className="pt-2 mt-2 border-t border-white/[0.03]">
                  <button
                    onClick={onViewAllIssues}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View all issues
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <p className="text-[11px] text-gray-600 mb-2">What would you like to do?</p>
      <div className="grid grid-cols-2 gap-1">
        {[
          { key: 'overview', icon: Rocket, iconClass: 'bg-indigo-500/10 text-indigo-400', label: 'AI Workforce Overview', desc: 'Real-time performance dashboard' },
          { key: 'approvals', icon: CheckCircle, iconClass: 'bg-emerald-500/10 text-emerald-400', label: 'Approval Decisions', desc: 'Review pending approvals' },
          { key: 'health', icon: AlertTriangle, iconClass: 'bg-amber-500/10 text-amber-400', label: 'Workforce Health Monitor', desc: 'Check agent health status' },
          { key: 'run-agent', icon: Wrench, iconClass: 'bg-blue-500/10 text-blue-400', label: 'Run Agent', desc: 'Configure and execute agents' },
          { key: 'build-agent', icon: Code, iconClass: 'bg-purple-500/10 text-purple-400', label: 'Build Agent', desc: 'Create a new agent from scratch' },
        ].map((action) => (
          <button
            key={action.key}
            onClick={() => onQuickAction(action.key)}
            className="group flex items-center gap-2 p-2.5 rounded-lg hover:bg-white/[0.05] transition-colors text-left"
          >
            <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${action.iconClass} group-hover:brightness-125 transition-all`}>
              <action.icon className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">{action.label}</div>
              <div className="text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors">{action.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StewardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>(initialConversation);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState('');
  const [currentA2UI, setCurrentA2UI] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [runAgentMode, setRunAgentMode] = useState(false);
  const [postMessages, setPostMessages] = useState<ChatMessage[]>([]);
  const [runAgentInfo, setRunAgentInfo] = useState<{ name: string; emoji: string; version: string; status?: string } | null>(null);
  const [scenarioParams, setScenarioParams] = useState<PanelParam[]>(scenario1PanelParams);
  const [highlightFields, setHighlightFields] = useState<string[]>([]);
  const [panelEditing, setPanelEditing] = useState(false);
  const [paramsSnapshot, setParamsSnapshot] = useState<PanelParam[]>([]);
  const [visibleScenarioCount, setVisibleScenarioCount] = useState(1); // show only s1-0 initially
  // Config phase state
  const [configPhase, setConfigPhase] = useState(false);
  const [configParams, setConfigParams] = useState<ConfigField[]>(configFields.map((f) => ({ ...f })));
  const [configHighlightFields, setConfigHighlightFields] = useState<string[]>([]);
  const [visibleConfigCount, setVisibleConfigCount] = useState(0);
  // Active scenario data (swappable for different agents)
  const [activeConfigMessages, setActiveConfigMessages] = useState<ScenarioMessage[]>(configScenarioMessages);
  const [activeScenarioMessages, setActiveScenarioMessages] = useState<ScenarioMessage[]>(scenario1Messages);
  const [activeConfigFields, setActiveConfigFields] = useState<ConfigField[]>(configFields);
  // Chip-driven flow state
  const [runFlowChipStep, setRunFlowChipStep] = useState<'idle' | 'waiting-describe' | 'in-run'>('idle');
  const [scenarioChipStep, setScenarioChipStep] = useState<number>(0);
  // Run log sidebar state
  const [runLogLines, setRunLogLines] = useState<import('../data/runAgentScenarios').ExecLogLine[]>([]);
  const [runLogStatus, setRunLogStatus] = useState<'running' | 'completed' | 'failed'>('running');
  // Build Agent flow state
  const [buildFlowChipStep, setBuildFlowChipStep] = useState<number>(0); // 0-16 state machine for build flow
  const [buildSaveClicked, setBuildSaveClicked] = useState(false);
  const [configNamed, setConfigNamed] = useState<string | null>(null);
  const [buildUpdateText, setBuildUpdateText] = useState<string | null>(null);
  const [buildTestRunClicked, setBuildTestRunClicked] = useState(false);
  const [buildPublished, setBuildPublished] = useState(false);
  const [buildPublishing, setBuildPublishing] = useState(false);
  const [pendingOmsRun, setPendingOmsRun] = useState(false);
  const [configName, setConfigName] = useState<string | null>(null);
  const [debugRunCount, setDebugRunCount] = useState(0); // 0, 1, or 2
  const [debugSidebarMessages, setDebugSidebarMessages] = useState<DebugSidebarMessage[]>([]);
  const [debugSidebarRound, setDebugSidebarRound] = useState(0);
  const [rightPanelWidth, setRightPanelWidth] = useState(35);
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Chatflow phase state
  const [chatflowMode, setChatflowMode] = useState(false);
  const [chatflowChipStep, setChatflowChipStep] = useState<number>(0);
  const [visibleChatflowCount, setVisibleChatflowCount] = useState(0);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [confirmedCardId, setConfirmedCardId] = useState<string | null>(null);

  const [agentPanelKey, setAgentPanelKey] = useState(0);
  const [preRunMessages, setPreRunMessages] = useState<ChatMessage[] | null>(null);
  const [savedRunSnapshot, setSavedRunSnapshot] = useState<{
    messages: ChatMessage[];
    scenarioMessages: import('../data/runAgentScenarios').ScenarioMessage[];
    scenarioCount: number;
    agentInfo: typeof runAgentInfo;
    chatflowMode: boolean;
    chatflowCount: number;
    chatflowChipStep: number;
  } | null>(null);
  const [postUpdateRunSnapshot, setPostUpdateRunSnapshot] = useState<typeof savedRunSnapshot>(null);
  const [omsRunSnapshot, setOmsRunSnapshot] = useState<typeof savedRunSnapshot>(null);
  const [runtimeRunSnapshot, setRuntimeRunSnapshot] = useState<typeof savedRunSnapshot>(null);
  const runtimeRunSnapshotRef = useRef(runtimeRunSnapshot);
  runtimeRunSnapshotRef.current = runtimeRunSnapshot;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSession = useCurrentSession();
  const { currentSessionId, sessions, createSession, switchSession, deleteSession, addReferenceToParent, autoGenerateTitle, updateSessionTitle, setMessages: persistMessages } = useSessionStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  };

  const handleParamChange = useCallback((name: string, value: string) => {
    setScenarioParams((prev) =>
      prev.map((p) =>
        p.name === name
          ? { ...p, value, status: value.trim() ? 'filled' : (p.status === 'optional' ? 'optional' : 'required') }
          : p
      )
    );
  }, []);

  const handleConfigParamChange = useCallback((name: string, value: string) => {
    setConfigParams((prev) =>
      prev.map((f) =>
        f.name === name ? { ...f, value } : f
      )
    );
  }, []);

  const handleEditStart = useCallback(() => {
    setParamsSnapshot(scenarioParams.map((p) => ({ ...p })));
    setPanelEditing(true);
  }, [scenarioParams]);

  const handleEditCancel = useCallback(() => {
    setScenarioParams(paramsSnapshot);
    setPanelEditing(false);
  }, [paramsSnapshot]);

  const handleConfirm = useCallback(() => {
    setPanelEditing(false);
  }, []);

  const handleClearParamTimers = useCallback(() => {
    runAgentFlowTimers.current.forEach(clearTimeout);
    runAgentFlowTimers.current = [];
    // Reset to only show the first message (the card being edited)
    if (configPhase) {
      setVisibleConfigCount(1); // only c1-0
    } else {
      setVisibleScenarioCount(1); // only s1-0
    }
    // Skip intermediate natural language messages for when we advance later
    setSkippedIds(new Set(['s1-1', 's1-2', 's1-3', 's1-4', 's1-5', 's1-6', 's1-7', 's1-8', 's1-9', 'c1-1', 'c1-2', 'c1-3', 'c1-4', 'c1-5', 'c1-6']));
  }, [configPhase]);

  const handleRun = useCallback(() => {
    // Clear any pending collection timers (but don't set skippedIds —
    // that's only for the card-edit path, handled by onEdit callback)
    runAgentFlowTimers.current.forEach(clearTimeout);
    runAgentFlowTimers.current = [];
    // s1-10: user message "Starting OMS Agent v7..."
    setVisibleScenarioCount(11);
    // s1-11: typing "Executing OMS Agent..." — pause so user reads the confirm message
    setTimeout(() => setVisibleScenarioCount(12), 2000);
    // s1-12: exec-log card — open sidebar log panel
    setTimeout(() => {
      setVisibleScenarioCount(13);
      const execMsg = activeScenarioMessages.find(m => m.card?.type === 'exec-log');
      if (execMsg?.card?.lines) {
        setRunLogLines(execMsg.card.lines);
        setRunLogStatus('running');
        setCurrentA2UI('RUN_LOG_VIEW');
      }
    }, 3500);
    // s1-13: result card — mark log as completed
    setTimeout(() => {
      setVisibleScenarioCount(14);
      setRunLogStatus('completed');
    }, 7500);
  }, [activeScenarioMessages]);

  // Save partial edits — send a user message with filled params, steward continues collecting
  const handleSavePartial = useCallback((cardId: string, currentRows: [string, string, boolean?][]) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const filledParams = currentRows
      .filter(([, v]) => v.trim())
      .map(([k, v]) => `**${k}**: ${v}`)
      .join(', ');
    const isConfig = cardId.startsWith('c1');
    const content = isConfig
      ? `Update configuration: ${filledParams}`
      : `Update parameters: ${filledParams}`;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMsg]);
  }, []);

  // Config complete → transition to next step
  const handleConfigComplete = useCallback(() => {
    if (buildFlowChipStep === 5) {
      // Test env config complete → show inline confirm + steward asks for name
      setScenarioChipStep(-1);
      setConfigPhase(false);
      setBuildSaveClicked(true); // triggers inline user confirm message
      setIsTyping(true);
      setTypingStatus('Saving configuration...');
      const t = setTimeout(() => {
        setIsTyping(false);
        setBuildFlowChipStep(6);
      }, 1500);
      runAgentFlowTimers.current.push(t);
    } else if (buildFlowChipStep === 13) {
      // Prod env config complete → show inline confirm + steward asks for name
      setScenarioChipStep(-1);
      setConfigPhase(false);
      setBuildSaveClicked(true);
      setIsTyping(true);
      setTypingStatus('Saving configuration...');
      const t = setTimeout(() => {
        setIsTyping(false);
        setBuildFlowChipStep(14);
      }, 1500);
      runAgentFlowTimers.current.push(t);
    } else {
      setConfigPhase(false);
      setVisibleConfigCount(activeConfigMessages.length);
      setCurrentA2UI(null);
      setVisibleScenarioCount(1);
      setScenarioChipStep(0);
    }
  }, [buildFlowChipStep]);

  const startRunAgentFlow = useCallback(() => {
    // Reset any active build agent flow
    setBuildFlowChipStep(0);
    const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Step 0: user message "Run an agent"
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Run an agent',
      timestamp: now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTypingStatus('Thinking...');
    setIsTyping(true);

    // Step 1 (1.5s): steward asks about scenario + open RunAgentWidget — then STOP, wait for chip
    const t = setTimeout(() => {
      const stewardMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'steward',
        content: 'RUN_AGENT_INQUIRY',
        timestamp: now(),
      };
      setMessages((prev) => [...prev, stewardMsg]);
      setIsTyping(false);
      setCurrentA2UI('RUN_AGENT_VIEW');
      setRunFlowChipStep('waiting-describe');
    }, 1500);
    runAgentFlowTimers.current = [t];
  }, []);

  // Chip click handler for the main pre-run conversation
  const handleRunFlowChip = useCallback((chipText: string) => {
    const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (runFlowChipStep === 'waiting-describe') {
      // User describes their need → steward recommends agent
      setRunFlowChipStep('idle');
      const userDesc: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: chipText,
        timestamp: now(),
      };
      setMessages((prev) => [...prev, userDesc]);
      setTypingStatus('Matching your request to available agents...');
      setIsTyping(true);

      const t = setTimeout(() => {
        const recommendMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'steward',
          content: 'RUN_AGENT_RECOMMEND',
          timestamp: now(),
        };
        setMessages((prev) => [...prev, recommendMsg]);
        setIsTyping(false);
        setRunFlowChipStep('idle');
      }, 1500);
      runAgentFlowTimers.current.push(t);
    }
  }, [runFlowChipStep, updateSessionTitle, currentSessionId]);

  // Chip click handler for config/param scenario phases
  const handleScenarioChip = useCallback((chipText: string) => {
    const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (configPhase) {
      // Config phase chips
      if (scenarioChipStep === 0) {
        // After c1-0: advance to c1-1~c1-3
        setScenarioChipStep(-1); // hide chip while animating
        setVisibleConfigCount(2); // show c1-1 (user message) immediately
        const t1 = setTimeout(() => setVisibleConfigCount(3), 800); // c1-2 typing
        const t2 = setTimeout(() => {
          setVisibleConfigCount(4); // -3 steward response
          setScenarioChipStep(1);
        }, 2000);
        runAgentFlowTimers.current.push(t1, t2);
      } else if (scenarioChipStep === 1) {
        // After c1-3: advance to c1-4~c1-6
        setScenarioChipStep(-1);
        setVisibleConfigCount(5); // c1-4 user message
        const t1 = setTimeout(() => setVisibleConfigCount(6), 800); // c1-5 typing
        const t2 = setTimeout(() => {
          setVisibleConfigCount(7); // c1-6 steward response
          setScenarioChipStep(2);
        }, 2000);
        runAgentFlowTimers.current.push(t1, t2);
      } else if (scenarioChipStep === 2) {
        setScenarioChipStep(-1);
        setConfirmedCardId('c1-6');
        if (buildFlowChipStep === 5) {
          // Build flow: show user "Save configuration" inline, then "Environment configured"
          setBuildSaveClicked(true);
          setConfigPhase(false);
          setIsTyping(true);
          setTypingStatus('Saving configuration...');
          const t1 = setTimeout(() => {
            setIsTyping(false);
            setBuildFlowChipStep(6);
          }, 1500);
          runAgentFlowTimers.current.push(t1);
        } else {
          // Normal run flow: show c1-7, c1-8, then start param phase
          setVisibleConfigCount(8); // c1-7 user confirm message
          const t1 = setTimeout(() => {
            setVisibleConfigCount(activeConfigMessages.length);
            setConfigPhase(false);
            setCurrentA2UI(null);
            setVisibleScenarioCount(1);
            setScenarioChipStep(0);
          }, 2000);
          runAgentFlowTimers.current.push(t1);
        }
      }
    } else {
      // Param phase chips
      if (scenarioChipStep === 0) {
        // After s1-0: advance to s1-1~s1-3
        setScenarioChipStep(-1);
        setVisibleScenarioCount(2); // s1-1 user message
        const t1 = setTimeout(() => setVisibleScenarioCount(3), 800); // s1-2 typing
        const t2 = setTimeout(() => {
          setVisibleScenarioCount(4); // s1-3 steward response
          setScenarioChipStep(1);
        }, 2000);
        runAgentFlowTimers.current.push(t1, t2);
      } else if (scenarioChipStep === 1) {
        // After s1-3: advance to s1-4~s1-6
        setScenarioChipStep(-1);
        setVisibleScenarioCount(5); // s1-4 user message
        const t1 = setTimeout(() => setVisibleScenarioCount(6), 800); // s1-5 typing
        const t2 = setTimeout(() => {
          setVisibleScenarioCount(7); // s1-6 steward response
          setScenarioChipStep(2);
        }, 2000);
        runAgentFlowTimers.current.push(t1, t2);
      } else if (scenarioChipStep === 2) {
        // After s1-6: advance to s1-7~s1-9 (correction)
        setScenarioChipStep(-1);
        setVisibleScenarioCount(8); // s1-7 user message
        const t1 = setTimeout(() => setVisibleScenarioCount(9), 800); // s1-8 typing
        const t2 = setTimeout(() => {
          setVisibleScenarioCount(10); // s1-9 steward response (final — Confirm & Run button takes over)
          setScenarioChipStep(3); // done, no more chips
        }, 2000);
        runAgentFlowTimers.current.push(t1, t2);
      }
    }
  }, [configPhase, scenarioChipStep, buildFlowChipStep]);

  // Chatflow chip handler (OMS multi-turn conversation)
  const handleChatflowChip = useCallback(() => {
    const base = visibleChatflowCount;
    setChatflowChipStep(-1);
    setVisibleChatflowCount(base + 1);
    const t1 = setTimeout(() => setVisibleChatflowCount(base + 2), 800);
    const t2 = setTimeout(() => {
      setVisibleChatflowCount(base + 3);
      const nextStep = chatflowChipStep + 1;
      if (nextStep >= 5) {
        setChatflowChipStep(-1);
      } else {
        setChatflowChipStep(nextStep);
      }
    }, 3000);
    runAgentFlowTimers.current.push(t1, t2);
  }, [chatflowChipStep, visibleChatflowCount]);

  // Auto-open sidebar when chatflow advances to an exec-log message, accumulate all log lines
  useEffect(() => {
    if (!chatflowMode || visibleChatflowCount === 0) return;
    const activeMsgs = runAgentInfo?.name?.includes('OMS') ? omsChatflowMessages : chatflowMessages;
    const visibleMsgs = activeMsgs.slice(0, visibleChatflowCount);
    const allLines = visibleMsgs
      .filter(m => m.card?.type === 'exec-log' && m.card.lines)
      .flatMap(m => m.card!.lines!);
    if (allLines.length > 0) {
      setRunLogLines(allLines);
      const lastExec = [...visibleMsgs].reverse().find(m => m.card?.type === 'exec-log');
      setRunLogStatus(lastExec?.card?.done ? 'completed' : 'running');
      if (currentA2UI !== 'RUN_LOG_VIEW') {
        setCurrentA2UI('RUN_LOG_VIEW');
      }
    }
  }, [chatflowMode, visibleChatflowCount, runAgentInfo]);

  // Build Agent flow
  const startBuildAgentFlow = useCallback(() => {
    // Reset any active run agent flow
    setRunFlowChipStep('idle');
    setCurrentA2UI(null);
    const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: 'Build an agent', timestamp: now() };
    setMessages((prev) => [...prev, userMsg]);
    setTypingStatus('Thinking...');
    setIsTyping(true);
    const t = setTimeout(() => {
      const stewardMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'steward', content: 'BUILD_AGENT_INQUIRY', timestamp: now() };
      setMessages((prev) => [...prev, stewardMsg]);
      setIsTyping(false);
      setBuildFlowChipStep(1);
    }, 1500);
    runAgentFlowTimers.current = [t];
  }, []);

  const handleBuildFlowChip = useCallback((chipText: string) => {
    const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Step 1: User describes requirements
    if (buildFlowChipStep === 1) {
      setBuildFlowChipStep(-1);
      setSavedRunSnapshot(null);
      setPostUpdateRunSnapshot(null);
      setOmsRunSnapshot(null);
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chipText, timestamp: now() };
      setMessages((prev) => [...prev, userMsg]);
      setTypingStatus('Analyzing your requirements...');
      setIsTyping(true);
      const t = setTimeout(() => {
        const stewardMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'steward', content: 'BUILD_AGENT_QUESTIONS', timestamp: now() };
        setMessages((prev) => [...prev, stewardMsg]);
        setIsTyping(false);
        setBuildFlowChipStep(2);
      }, 1500);
      runAgentFlowTimers.current.push(t);

    // Step 2: User refines requirements
    } else if (buildFlowChipStep === 2) {
      setBuildFlowChipStep(-1);
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chipText, timestamp: now() };
      setMessages((prev) => [...prev, userMsg]);
      setTypingStatus('Refining agent specification...');
      setIsTyping(true);
      const t = setTimeout(() => {
        const stewardMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'steward', content: 'BUILD_AGENT_REFINE', timestamp: now() };
        setMessages((prev) => [...prev, stewardMsg]);
        setIsTyping(false);
        setBuildFlowChipStep(3);
      }, 1500);
      runAgentFlowTimers.current.push(t);

    // Step 3: User provides config details → generate agent spec
    } else if (buildFlowChipStep === 3) {
      setBuildFlowChipStep(-1);
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chipText, timestamp: now() };
      setMessages((prev) => [...prev, userMsg]);
      setTypingStatus('Building agent spec...');
      setIsTyping(true);
      const t1 = setTimeout(() => {
        setIsTyping(false);
        const completeMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'steward', content: 'BUILD_AGENT_COMPLETE', timestamp: now() };
        setMessages((prev) => [...prev, completeMsg]);
        updateSessionTitle(currentSessionId, 'Customer Service Email Assistant');
        setCurrentA2UI('BUILD_AGENT_VIEW');
        setBuildFlowChipStep(4);
      }, 2000);
      runAgentFlowTimers.current.push(t1);

    // Step 4: Agent spec done → user clicks "开始配置测试环境并进行 Debug Run"
    } else if (buildFlowChipStep === 4) {
      setBuildFlowChipStep(-1);
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chipText, timestamp: now() };
      setMessages((prev) => [...prev, userMsg]);
      setTypingStatus('Preparing test environment...');
      setIsTyping(true);
      const t = setTimeout(() => {
        setIsTyping(false);
        const introMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'steward', content: 'BUILD_DEBUG_INTRO', timestamp: now() };
        setMessages((prev) => [...prev, introMsg]);
        setBuildFlowChipStep(5);
        setActiveConfigMessages(emailConfigScenarioMessages);
        setActiveConfigFields(emailConfigFields);
        setConfigPhase(true);
        setConfigParams(emailConfigFields.map((f) => ({ ...f })));
        setVisibleConfigCount(1);
        setScenarioChipStep(0);
      }, 1500);
      runAgentFlowTimers.current.push(t);

    // Step 6: Config naming → user says "就叫测试环境吧"
    } else if (buildFlowChipStep === 6) {
      setBuildFlowChipStep(-1);
      setConfigName(chipText.replace('就叫', '').replace('吧', '').trim() || '测试环境');
      setConfigNamed(chipText);
      setTypingStatus('Saving configuration...');
      setIsTyping(true);
      const t = setTimeout(() => {
        setIsTyping(false);
        setBuildFlowChipStep(7);
      }, 1200);
      runAgentFlowTimers.current.push(t);

    // Step 7: User clicks debug run intent chip → bake config flow into messages, then send message + steward confirms
    } else if (buildFlowChipStep === 7) {
      setBuildFlowChipStep(-1);
      // Bake config flow history into messages before cleaning up inline states
      const ts = now();
      const bakeMessages: ChatMessage[] = [
        { id: `bk-${Date.now()}-0r`, role: 'steward', content: 'BUILD_TEST_CONFIG_REQUEST', timestamp: ts },
        { id: `bk-${Date.now()}-1`, role: 'user', content: buildAgentChips.step5, timestamp: ts },
        { id: `bk-${Date.now()}-1c`, role: 'steward', content: 'BUILD_TEST_CONFIG_CARD', timestamp: ts },
        { id: `bk-${Date.now()}-2`, role: 'steward', content: `BUILD_CONFIG_NAMED:${configName || '测试环境'}`, timestamp: ts },
      ];
      // Clean up config inline states
      setVisibleConfigCount(0);
      setConfigPhase(false);
      setBuildSaveClicked(false);
      setConfigNamed(null);
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chipText, timestamp: ts };
      setMessages((prev) => [...prev, ...bakeMessages, userMsg]);
      setTypingStatus('Preparing debug run...');
      setIsTyping(true);
      const tConfirm = setTimeout(() => {
        setIsTyping(false);
        const readyMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'steward', content: 'BUILD_DEBUG_START_CONFIRM', timestamp: now() };
        setMessages((prev) => [...prev, readyMsg]);

        // Automatically open debug sidebar and start test (no button needed)
        setBuildFlowChipStep(-1);
        setDebugRunCount(1);
        setDebugSidebarRound(1);
        setDebugSidebarMessages([]);
        setCurrentA2UI('DEBUG_RUN_VIEW');

        const nowTs = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const t0 = setTimeout(() => {
          setMessages((prev) => [...prev, { id: `dl-auto-${Date.now()}`, role: 'steward', content: debugLeftRound1[0].content, timestamp: nowTs() }]);
        }, 500);
        const t1 = setTimeout(() => setDebugSidebarMessages([debugSidebarRound1[0]]), 800);
        const t2 = setTimeout(() => setDebugSidebarMessages([...debugSidebarRound1]), 2500);
        const t3 = setTimeout(() => {
          setMessages((prev) => [...prev, { id: `dl-auto-${Date.now()}`, role: 'steward', content: debugLeftRound1[1].content, timestamp: nowTs() }]);
          setBuildFlowChipStep(711);
        }, 4000);
        runAgentFlowTimers.current.push(t0, t1, t2, t3);
      }, 1200);
      runAgentFlowTimers.current.push(tConfirm);

    // Step 711: User provides SMTP credentials → round 2
    } else if (buildFlowChipStep === 711) {
      setBuildFlowChipStep(-1);
      setDebugSidebarRound(2);

      // Left: user message
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chipText, timestamp: now() };
      setMessages((prev) => [...prev, userMsg]);

      const nowTs = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Left: Steward acknowledges
      const t0 = setTimeout(() => {
        setMessages((prev) => [...prev, { id: `dl-auto-${Date.now()}`, role: 'steward', content: debugLeftRound2[1].content, timestamp: nowTs() }]);
      }, 500);

      // Right: round 2 agent messages (clear previous round)
      const t1 = setTimeout(() => setDebugSidebarMessages([debugSidebarRound2[0]]), 800);
      const t2 = setTimeout(() => setDebugSidebarMessages([...debugSidebarRound2]), 2500);

      // Left: Steward summary
      const t3 = setTimeout(() => {
        setMessages((prev) => [...prev, { id: `dl-auto-${Date.now()}`, role: 'steward', content: debugLeftRound2[2].content, timestamp: nowTs() }]);
        setBuildFlowChipStep(712);
      }, 4000);

      runAgentFlowTimers.current.push(t0, t1, t2, t3);

    // Step 712: User provides new credentials → round 3 (success)
    } else if (buildFlowChipStep === 712) {
      setBuildFlowChipStep(-1);
      setDebugSidebarRound(3);

      // Left: user message
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chipText, timestamp: now() };
      setMessages((prev) => [...prev, userMsg]);

      const nowTs = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Left: Steward acknowledges
      const t0 = setTimeout(() => {
        setMessages((prev) => [...prev, { id: `dl-auto-${Date.now()}`, role: 'steward', content: debugLeftRound3[1].content, timestamp: nowTs() }]);
      }, 500);

      // Right: round 3 agent messages (clear previous round)
      const t1 = setTimeout(() => setDebugSidebarMessages([debugSidebarRound3[0]]), 800);
      const t2 = setTimeout(() => setDebugSidebarMessages([...debugSidebarRound3]), 2500);

      // Left: Steward success summary
      const t3 = setTimeout(() => {
        setMessages((prev) => [...prev, { id: `dl-auto-${Date.now()}`, role: 'steward', content: debugLeftRound3[2].content, timestamp: nowTs() }]);
      }, 4000);

      // Left: auto-save credentials notification + show step 9 chip
      const t4 = setTimeout(() => {
        setMessages((prev) => [...prev, { id: `dl-auto-${Date.now()}`, role: 'steward', content: 'BUILD_DEBUG_CREDENTIALS_SAVED', timestamp: nowTs() }]);
        setBuildFlowChipStep(9);
      }, 5500);

      runAgentFlowTimers.current.push(t0, t1, t2, t3, t4);

    // Step 9: User provides feedback → clean up config inline, update agent spec
    } else if (buildFlowChipStep === 9) {
      setBuildFlowChipStep(-1);
      setBuildUpdateText(chipText);
      // Clean up config inline states so messages render in correct order
      setVisibleConfigCount(0);
      setConfigPhase(false);
      setBuildSaveClicked(false);
      setConfigNamed(null);
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chipText, timestamp: now() };
      setMessages((prev) => [...prev, userMsg]);
      setTypingStatus('Updating agent...');
      setIsTyping(true);
      const t = setTimeout(() => {
        setIsTyping(false);
        setAgentPanelKey((k) => k + 1);
        setCurrentA2UI('BUILD_AGENT_VIEW');
        const updateMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'steward', content: 'BUILD_UPDATE_DONE', timestamp: now() };
        setMessages((prev) => [...prev, updateMsg]);
        setBuildFlowChipStep(10);
      }, 1500);
      runAgentFlowTimers.current.push(t);

    // Step 10: Choose config for second debug run → auto-open sidebar
    } else if (buildFlowChipStep === 10 && chipText.includes('测试环境')) {
      setBuildFlowChipStep(-1);
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chipText, timestamp: now() };
      setMessages((prev) => [...prev, userMsg]);
      setTypingStatus('Preparing debug run...');
      setIsTyping(true);
      const tConfirm = setTimeout(() => {
        setIsTyping(false);
        const readyMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'steward', content: 'BUILD_DEBUG_START_CONFIRM', timestamp: now() };
        setMessages((prev) => [...prev, readyMsg]);

        // Automatically open debug sidebar for run #2
        setDebugRunCount(2);
        setDebugSidebarMessages([]);
        setCurrentA2UI('DEBUG_RUN_VIEW');

        const nowTs = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const t0 = setTimeout(() => {
          setMessages((prev) => [...prev, { id: `dl-auto-${Date.now()}`, role: 'steward', content: debugLeftRun2Start[0].content, timestamp: nowTs() }]);
        }, 500);
        const t1 = setTimeout(() => setDebugSidebarMessages([debugSidebarRun2[0]]), 800);
        const t2 = setTimeout(() => setDebugSidebarMessages([...debugSidebarRun2]), 2500);
        const t3 = setTimeout(() => {
          setMessages((prev) => [...prev, { id: `dl-auto-${Date.now()}`, role: 'steward', content: debugLeftRun2Start[1].content, timestamp: nowTs() }]);
          setBuildFlowChipStep(12);
        }, 4000);
        runAgentFlowTimers.current.push(t0, t1, t2, t3);
      }, 1200);
      runAgentFlowTimers.current.push(tConfirm);

    // Step 12: User confirms tests pass → "当前测试没有问题了"
    } else if (buildFlowChipStep === 12) {
      setBuildFlowChipStep(-1);
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chipText, timestamp: now() };
      setMessages((prev) => [...prev, userMsg]);
      setTypingStatus('Preparing for publish...');
      setIsTyping(true);
      const t = setTimeout(() => {
        setIsTyping(false);
        const chooseMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'steward', content: 'BUILD_CHOOSE_PROD_CONFIG', timestamp: now() };
        setMessages((prev) => [...prev, chooseMsg]);
        setBuildFlowChipStep(1200); // sub-step: waiting for config choice
      }, 1200);
      runAgentFlowTimers.current.push(t);

    // Step 12 sub: User chooses to create new prod config
    } else if (buildFlowChipStep === 1200 && chipText.includes('创建新的')) {
      setBuildFlowChipStep(-1);
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chipText, timestamp: now() };
      setMessages((prev) => [...prev, userMsg]);
      // Enter prod config collection
      setBuildFlowChipStep(13);
      setActiveConfigMessages(prodConfigScenarioMessages);
      setActiveConfigFields(emailConfigFields);
      setConfigPhase(true);
      setConfigParams(emailConfigFields.map((f) => ({ ...f })));
      setVisibleConfigCount(1);
      setScenarioChipStep(0);

    // Step 12 sub: User chooses to reuse test env config
    } else if (buildFlowChipStep === 1200 && chipText.includes('测试环境')) {
      setBuildFlowChipStep(-1);
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chipText, timestamp: now() };
      setMessages((prev) => [...prev, userMsg]);
      setTypingStatus('Applying configuration...');
      setIsTyping(true);
      const t = setTimeout(() => {
        setIsTyping(false);
        setBuildFlowChipStep(15);
        const confirmMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'steward', content: 'BUILD_PUBLISH_CONFIRM', timestamp: now() };
        setMessages((prev) => [...prev, confirmMsg]);
      }, 1200);
      runAgentFlowTimers.current.push(t);

    // Step 14: Prod config naming → "就叫正式环境吧"
    } else if (buildFlowChipStep === 14) {
      setBuildFlowChipStep(-1);
      setConfigNamed(chipText);
      setTypingStatus('Saving configuration...');
      setIsTyping(true);
      const t = setTimeout(() => {
        setIsTyping(false);
        setConfigName('正式环境');
        setBuildFlowChipStep(15);
      }, 1200);
      runAgentFlowTimers.current.push(t);

    // Step 15: User confirms publish → "确认发布，我们正式跑一次"
    } else if (buildFlowChipStep === 15) {
      setBuildFlowChipStep(-1);
      // Bake full prod config flow history into messages before cleaning up inline states
      const ts = now();
      const bakeMessages: ChatMessage[] = [
        { id: `bk-${Date.now()}-p0`, role: 'steward', content: 'BUILD_CHOOSE_PROD_CONFIG', timestamp: ts },
        { id: `bk-${Date.now()}-p0u`, role: 'user', content: '创建新的环境配置', timestamp: ts },
        { id: `bk-${Date.now()}-p0r`, role: 'steward', content: 'BUILD_PROD_CONFIG_REQUEST', timestamp: ts },
        { id: `bk-${Date.now()}-p1`, role: 'user', content: buildAgentChips.step13, timestamp: ts },
        { id: `bk-${Date.now()}-p1c`, role: 'steward', content: 'BUILD_PROD_CONFIG_CARD', timestamp: ts },
        { id: `bk-${Date.now()}-p2`, role: 'steward', content: `BUILD_CONFIG_NAMED:${configName || '正式环境'}`, timestamp: ts },
      ];
      // Clean up config section and inline blocks before adding to messages
      setVisibleConfigCount(0);
      setConfigPhase(false);
      setBuildSaveClicked(false);
      setConfigNamed(null);
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chipText, timestamp: ts };
      // Remove any existing copies of these messages to avoid duplicates, then append bake + confirm
      setMessages((prev) => {
        const filtered = prev.filter(m => m.content !== 'BUILD_CHOOSE_PROD_CONFIG' && !(m.role === 'user' && m.content === '创建新的环境配置'));
        return [...filtered, ...bakeMessages, userMsg];
      });
      setBuildPublishing(true);
      setTypingStatus('Publishing to Teams...');
      setIsTyping(true);
      const t = setTimeout(() => {
        setIsTyping(false);
        setBuildPublishing(false);
        setBuildPublished(true);
        setAgentPanelKey((k) => k + 1);
        const publishedMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'steward', content: 'BUILD_AGENT_PUBLISHED', timestamp: now() };
        setMessages((prev) => [...prev, publishedMsg]);
        const t2 = setTimeout(() => {
          const runtimeMsg: ChatMessage = { id: (Date.now() + 2).toString(), role: 'steward', content: 'BUILD_RUNTIME_READY', timestamp: now() };
          setMessages((prev) => [...prev, runtimeMsg]);
          setBuildFlowChipStep(16);
        }, 1000);
        runAgentFlowTimers.current.push(t2);
      }, 2000);
      runAgentFlowTimers.current.push(t);

    // Step 16: "Go to Runtime" → enter run mode (same pattern as debug runs)
    } else if (buildFlowChipStep === 16) {
      setBuildFlowChipStep(-1);
      setDebugRunCount(3);
      setPreRunMessages([...messages]);
      setMessages([]);
      setRunAgentMode(true);
      setRunAgentInfo({ name: 'Customer Service Email Assistant', emoji: '✉️', version: 'v1', status: 'running' });
      setActiveScenarioMessages(debugRunScenarioMessages);
      setVisibleScenarioCount(1);
      setScenarioChipStep(-1);
      setConfigPhase(false);
      setVisibleConfigCount(0);
      setConfigNamed(null);
      setBuildSaveClicked(false);
      setCurrentA2UI(null);
      const t1 = setTimeout(() => setVisibleScenarioCount(2), 1500);
      const t2 = setTimeout(() => {
        setVisibleScenarioCount(3);
        const execMsg = debugRunScenarioMessages.find(m => m.card?.type === 'exec-log');
        if (execMsg?.card?.lines) {
          setRunLogLines(execMsg.card.lines);
          setRunLogStatus('running');
          setCurrentA2UI('RUN_LOG_VIEW');
        }
      }, 3000);
      const t3 = setTimeout(() => {
        setVisibleScenarioCount(4);
        setRunLogStatus('completed');
      }, 6500);
      runAgentFlowTimers.current.push(t1, t2, t3);
    }
  }, [buildFlowChipStep, messages]);

  const runAgentFlowTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => runAgentFlowTimers.current.forEach(clearTimeout);
  }, []);

  // Fix #1: Reset local state when session changes (New button / session switch)
  useEffect(() => {
    runAgentFlowTimers.current.forEach(clearTimeout);
    runAgentFlowTimers.current = [];
    setPostMessages([]);
    setCurrentA2UI(null);
    setIsTyping(false);
    setInput('');
    setAttachedFiles([]);
    setConfigPhase(false);
    setVisibleConfigCount(0);
    setVisibleScenarioCount(1);
    setChatflowMode(false);
    setVisibleChatflowCount(0);
    setSkippedIds(new Set());
    setConfirmedCardId(null);
    setScenarioParams(scenario1PanelParams);
    setConfigParams(configFields.map((f) => ({ ...f })));
    setRunFlowChipStep('idle');
    setScenarioChipStep(0);
    setBuildFlowChipStep(0);
    setBuildSaveClicked(false);
    setBuildUpdateText(null);
    setBuildTestRunClicked(false);
    setBuildPublished(false);
    setBuildPublishing(false);
    setConfigName(null);
    setDebugRunCount(0);
    setConfigNamed(null);

    // Run Agent session: skip welcome, enter run mode directly
    const newSession = sessions.find(s => s.id === currentSessionId);
    if (newSession && (newSession.session_type === 'run_task' || newSession.session_type === 'run_chat')) {
      setMessages([]);
      setRunAgentMode(true);
      setRunAgentInfo(newSession.agent_name ? {
        name: newSession.agent_name,
        emoji: newSession.agent_emoji || '🤖',
        version: '1.0',
      } : null);
    } else if (newSession && newSession.messages.some(m => m.role === 'user')) {
      // Returning to a session with real conversation (user has chatted)
      setMessages(newSession.messages);
      setRunAgentMode(false);
      setRunAgentInfo(null);
    } else if (newSession && newSession.title) {
      // Newly created session with title but no user messages — show empty, content will be injected shortly
      setMessages([]);
      setRunAgentMode(false);
      setRunAgentInfo(null);
    } else if (newSession && newSession.messages.some(m => m.content.startsWith('SESSION_REF:'))) {
      // Session has reference cards (e.g. from a completed run) — show them with welcome
      setMessages([...initialConversation, ...newSession.messages.filter(m => m.content.startsWith('SESSION_REF:'))]);
      setRunAgentMode(false);
      setRunAgentInfo(null);
    } else if (pendingOmsRun) {
      // Coming from build session, auto-enter OMS chatflow run
      const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setPendingOmsRun(false);
      updateSessionTitle(currentSessionId, 'OMS Agent v7');
      setMessages([{
        id: Date.now().toString(),
        role: 'user',
        content: 'Run OMS Agent v7',
        timestamp: now(),
      }]);
      setRunAgentMode(true);
      setRunAgentInfo({ name: 'OMS Agent v7', emoji: '🛒', version: 'v7', status: 'running' });
      setChatflowMode(true);
      setVisibleChatflowCount(1);
      setChatflowChipStep(0);
      setPreRunMessages([{
        id: (Date.now() + 1).toString(),
        role: 'steward',
        content: 'WELCOME_VIEW',
        timestamp: now(),
      }]);
    } else {
      // Fresh session or only has system messages — show welcome
      setMessages(initialConversation);
      setRunAgentMode(false);
      setRunAgentInfo(null);
    }
  }, [currentSessionId]);

  // Sync local messages to session context for persistence (only if user has chatted)
  useEffect(() => {
    if (messages.some(m => m.role === 'user')) {
      persistMessages(messages);
    }
  }, [messages, persistMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, visibleScenarioCount, visibleChatflowCount, visibleConfigCount, buildFlowChipStep]);

  // Draggable divider between left chat and right panel
  useEffect(() => {
    if (!isDraggingDivider) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((rect.right - e.clientX) / rect.width) * 100;
      setRightPanelWidth(Math.min(60, Math.max(20, pct)));
    };
    const handleMouseUp = () => setIsDraggingDivider(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingDivider]);

  // Reset panel width to default when switching panels
  useEffect(() => {
    if (currentA2UI === 'BUILD_AGENT_VIEW') {
      setRightPanelWidth(55);
    } else if (currentA2UI) {
      setRightPanelWidth(35);
    }
  }, [currentA2UI]);

  // Handle incoming message from navigation searchParams
  useEffect(() => {
    const messageParam = searchParams?.get('message');
    const agentNameParam = searchParams?.get('agentName');
    const runAgentParam = searchParams?.get('runAgent');

    if (messageParam && agentNameParam) {
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: messageParam,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setTypingStatus('Diagnosing agent issue...');
      setIsTyping(true);
      setTimeout(() => {
        const stewardResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'steward',
          content: `I'll help you fix the error for **${agentNameParam}**.

Based on the agent's status, here are the common issues and solutions:

**Possible Issues:**
1. **API Connection Timeout** - The agent may have lost connection to external services
2. **Authentication Failure** - API credentials might have expired
3. **Rate Limiting** - The service may be throttling requests

**Recommended Actions:**
1. Check the agent's configuration and verify all API credentials are up to date
2. Review recent error logs in the Activity tab
3. Restart the agent to re-establish connections
4. If the issue persists, consider temporarily reducing the agent's task load

Would you like me to guide you through any of these steps, or would you prefer to see the detailed error logs?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, stewardResponse]);
        setIsTyping(false);
      }, 1500);

      // Clear the navigation searchParams
      window.history.replaceState({}, document.title, '/steward');
    }

    // Handle Run Agent navigation from Teams page
    if (runAgentParam) {
      const agentName = agentNameParam || 'Agent';
      const agentEmoji = searchParams?.get('agentEmoji') || '🤖';
      const agentVersion = searchParams?.get('agentVersion') || '1.0';
      const agentMode = searchParams?.get('agentMode') || undefined;
      setRunAgentMode(true);
      setRunAgentInfo({ name: agentName, emoji: agentEmoji, version: agentVersion });

      if (agentMode === 'chatflow') {
        // Chatflow mode from Teams page
        setChatflowMode(true);
        setVisibleScenarioCount(0);
        setVisibleConfigCount(0);
        setVisibleChatflowCount(1);

        const cfTimers: ReturnType<typeof setTimeout>[] = [];
        cfTimers.push(setTimeout(() => setVisibleChatflowCount(4), 3000));
        cfTimers.push(setTimeout(() => setVisibleChatflowCount(7), 9000));
        cfTimers.push(setTimeout(() => setVisibleChatflowCount(10), 15000));
        runAgentFlowTimers.current.push(...cfTimers);

        window.history.replaceState({}, document.title, '/steward');
        return () => cfTimers.forEach(clearTimeout);
      }

      setScenarioParams(scenario1PanelParams.map((p) => ({ ...p })));
      setScenarioChipStep(0); // chip-driven — wait for user click

      window.history.replaceState({}, document.title, '/steward');
    }
  }, [searchParams]);

  // Update A2UI when messages change
  const currentA2UIRef = useRef(currentA2UI);
  currentA2UIRef.current = currentA2UI;

  const lastProcessedMsgId = useRef<string | null>(null);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.id === lastProcessedMsgId.current) return;
    lastProcessedMsgId.current = lastMessage.id;

    if (lastMessage.role === 'steward') {
      const content = lastMessage.content;
      if (content === 'DASHBOARD_VIEW' || content === 'APPROVALS_VIEW' || content === 'HEALTH_VIEW' || content === 'WHATSAPP_OAUTH_VIEW' || content === 'RUN_AGENT_VIEW' || content.startsWith('TEAM_VIEW:')) {
        setCurrentA2UI(content);
      } else if (content === 'CONFIGURATION_OPTIONS') {
        setCurrentA2UI(null);
      } else if (!content.includes('VIEW') && !content.startsWith('BUILD_AGENT_') && !content.startsWith('RUN_AGENT_') && currentA2UIRef.current !== 'APPROVALS_VIEW' && currentA2UIRef.current !== 'HEALTH_VIEW' && currentA2UIRef.current !== 'BUILD_AGENT_VIEW' && currentA2UIRef.current !== 'RUN_AGENT_VIEW' && currentA2UIRef.current !== 'DEBUG_RUN_VIEW') {
        setCurrentA2UI(null);
      }
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() && attachedFiles.length === 0) return;

    let messageContent = input;
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map(f => f.name).join(', ');
      messageContent = `${input}\n\n📎 Attached: ${fileNames}`;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);

    // If in debug run sidebar mode, user input triggers next round
    if (currentA2UI === 'DEBUG_RUN_VIEW' && (buildFlowChipStep === 711 || buildFlowChipStep === 712)) {
      handleBuildFlowChip(messageContent);
      return;
    }

    // Intent detection — check before auto-title so we can skip title for run intents
    const intentResult = detectIntentChange(currentSession, messageContent);
    const isRunIntent = intentResult.changed && (intentResult.suggestedType === 'run_task' || intentResult.suggestedType === 'run_chat');
    const isBuildIntent = intentResult.changed && intentResult.suggestedType === 'build_agent';

    // Auto-generate session title from first user message (skip for run-only intents)
    if (messages.length <= 1 && !isRunIntent) {
      autoGenerateTitle(messageContent);
    }

    if (intentResult.changed && intentResult.suggestedType && intentResult.reason) {
      setTypingStatus('Analyzing your intent...');
      setIsTyping(true);

      // Specific build intent — start build flow directly in this session
      if (isBuildIntent && !intentResult.vague) {
        if (messages.length <= 1) {
          updateSessionTitle(currentSessionId, generateSessionTitle(messageContent, 'build_agent'));
        }
        setRunFlowChipStep('idle');
        setTimeout(() => {
          const stewardMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'steward',
            content: 'BUILD_AGENT_INQUIRY',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, stewardMsg]);
          setIsTyping(false);
          setBuildFlowChipStep(1);
        }, 1000);
        return;
      }

      // Specific run/chat intent — enter run mode directly in this session
      if (isRunIntent && !intentResult.vague) {
        const agentName = intentResult.agentName || 'Agent';
        const catalogEmoji = AGENT_CATALOG.find(a => a.name === agentName)?.emoji || '🤖';
        const isOmsAgent = agentName?.includes('OMS');
        setTimeout(() => {
          setPreRunMessages([...messages]);
          setMessages((prev) => [...prev.slice(-1)]);
          setRunAgentMode(true);
          setRunAgentInfo({ name: agentName, emoji: catalogEmoji, version: 'v1', status: 'running' });
          if (isOmsAgent) {
            setChatflowMode(true);
            setVisibleChatflowCount(1);
            setChatflowChipStep(0);
            setVisibleScenarioCount(0);
          } else {
            setChatflowMode(false);
            setActiveScenarioMessages(emailScenarioMessages);
            setActiveConfigMessages(emailConfigScenarioMessages);
            setActiveConfigFields(emailConfigFields);
            setConfigPhase(true);
            setConfigParams(emailConfigFields.map((f) => ({ ...f })));
            setVisibleConfigCount(1);
            setVisibleScenarioCount(1);
            setScenarioChipStep(0);
          }
          setCurrentA2UI(null);
          setBuildFlowChipStep(0);
          setIsTyping(false);
        }, 1000);
        return;
      }

      if (intentResult.vague) {
        // Vague run intent — open agent list panel
        if (intentResult.suggestedType === 'run_task') {
          setTimeout(() => {
            const inquiryMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'steward',
              content: 'RUN_AGENT_INQUIRY',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, inquiryMsg]);
            setIsTyping(false);
            setCurrentA2UI('RUN_AGENT_VIEW');
          }, 1000);
        } else {
          // Vague build/chat intent — ask clarifying question
          setTimeout(() => {
            const clarifyMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'steward',
              content: intentResult.suggestedType === 'build_agent'
                ? 'What kind of agent would you like to create?'
                : 'Which agent would you like to chat with?',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, clarifyMsg]);
            setIsTyping(false);
          }, 1000);
        }
      }
      return;
    }

    setTypingStatus(getTypingStatus(input));
    setIsTyping(true);

    setTimeout(() => {
      const stewardResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'steward',
        content: generateResponse(input),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, stewardResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getTypingStatus = (input: string): string => {
    const lower = input.toLowerCase();
    if (lower.includes('overview') || lower.includes('dashboard') || lower.includes('fleet') || lower.includes('workforce overview')) return 'Analyzing fleet data...';
    if (lower.includes('approval') || lower.includes('pending')) return 'Reviewing pending approvals...';
    if (lower.includes('health') || lower.includes('issue') || lower.includes('fix') || lower.includes('error')) return 'Scanning agent health...';
    if (lower.includes('run agent') || lower.includes('run an agent')) return 'Loading available agents...';
    if (lower.includes('whatsapp')) return 'Initializing WhatsApp OAuth...';
    if (lower.includes('configuration') || lower.includes('configure')) return 'Loading configuration options...';
    if (lower.includes('cost') || lower.includes('budget') || lower.includes('spend')) return 'Calculating cost metrics...';
    if (lower.includes('team') || lower.includes('wms') || lower.includes('recruiting')) return 'Loading team overview...';
    return 'Thinking...';
  };

  const handleQuickAction = (action: string) => {
    // Exit runAgentMode so messages render in the normal chat flow
    if (runAgentMode) {
      setRunAgentMode(false);
      setVisibleScenarioCount(1);
      setConfigPhase(false);
      setVisibleConfigCount(0);
      setChatflowMode(false);
      setVisibleChatflowCount(0);
      setConfigParams(configFields.map((f) => ({ ...f })));
      setConfigHighlightFields([]);
      setCurrentA2UI(null);
      setPanelEditing(false);
      setSkippedIds(new Set());
      // Restore pre-run messages if saved
      if (preRunMessages) {
        setMessages(preRunMessages);
        setPreRunMessages(null);
      }
    }

    let userMessage = '';
    switch (action) {
      case 'overview':
        userMessage = 'AI Workforce Overview';
        break;
      case 'approvals':
        userMessage = 'Approval Decisions';
        break;
      case 'health':
        userMessage = 'Workforce Health Monitor';
        break;
      case 'configuration':
        userMessage = 'Configuration';
        break;
      case 'run-agent':
        startRunAgentFlow();
        return;
      case 'build-agent':
        startBuildAgentFlow();
        return;
      case 'whatsapp':
        userMessage = 'Configure WhatsApp';
        break;
      case 'config-slack':
        userMessage = 'Configure Slack';
        break;
      case 'config-email':
        userMessage = 'Configure Email SMTP';
        break;
      case 'config-api':
        userMessage = 'Configure API Keys';
        break;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setTypingStatus(getTypingStatus(userMessage));
    setIsTyping(true);

    setTimeout(() => {
      const stewardResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'steward',
        content: generateResponse(userMessage),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, stewardResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFixNowFromWelcome = (agent: string, issue: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Fix ${agent}: ${issue}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTypingStatus('Diagnosing agent issue...');
    setIsTyping(true);
    setTimeout(() => {
      const stewardResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'steward',
        content: generateFixNowResponse(agent, issue),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, stewardResponse]);
      setIsTyping(false);
    }, 400);
  };

  const handleApproveFromPanel = (agent: string, action: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Approve ${agent}: ${action}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTypingStatus('Processing approval...');
    setIsTyping(true);
    setTimeout(() => {
      const stewardResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'steward',
        content: `Approved. **${agent}** is now authorized to proceed with: ${action}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, stewardResponse]);
      setIsTyping(false);
    }, 400);
  };

  const handleProcessAllApprovals = () => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Process all pending approval recommendations',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTypingStatus('Processing all approvals...');
    setIsTyping(true);
    setTimeout(() => {
      const stewardResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'steward',
        content: `All **${pendingApprovals.length} pending approvals** have been processed based on recommendations:\n\n- **3 approved** directly\n- **1 approved with flag** for manual audit\n\nAll agents have been notified and can proceed with their tasks.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, stewardResponse]);
      setIsTyping(false);
    }, 800);
  };

  const handleFixAllFromPanel = () => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Apply all recommended fixes',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTypingStatus('Applying all recommended fixes...');
    setIsTyping(true);
    setTimeout(() => {
      const agents = healthIssues.map((i) => i.agent).join(', ');
      const stewardResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'steward',
        content: `All **${healthIssues.length} recommended fixes** have been applied:\n\n${healthIssues.map((i) => `- **${i.agent}**: ${i.recommendation}`).join('\n')}\n\nI'll monitor these agents and notify you if any issues persist.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, stewardResponse]);
      setIsTyping(false);
    }, 800);
  };

  const handleViewAllIssues = () => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Check workforce health',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTypingStatus('Scanning agent health...');
    setIsTyping(true);
    setTimeout(() => {
      const stewardResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'steward',
        content: 'HEALTH_VIEW',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, stewardResponse]);
      setIsTyping(false);
    }, 400);
  };

  const renderMessageContent = (message: ChatMessage) => {

    // Welcome view — new first-screen
    if (message.content === 'WELCOME_VIEW') {
      return (
        <WelcomeWidget
          onQuickAction={handleQuickAction}
          onFixNow={handleFixNowFromWelcome}
          onViewAllIssues={handleViewAllIssues}
        />
      );
    }

    // For A2UI views, only show the text description in chat
    if (message.content === 'DASHBOARD_VIEW') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300">Here's a comprehensive overview of your agent fleet performance.</p>
          <PanelCard
            icon={Activity}
            iconClass="bg-indigo-500/10 text-indigo-400"
            title="Agent Fleet Dashboard"
            onClick={() => setCurrentA2UI('DASHBOARD_VIEW')}
            isActive={currentA2UI === 'DASHBOARD_VIEW'}
          />
          {false && <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>}
        </div>
      );
    }

    if (message.content === 'APPROVALS_VIEW') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300">I've analyzed all pending tasks and prioritized them by urgency and business impact.</p>
          <PanelCard
            icon={Clock}
            iconClass="bg-amber-500/10 text-amber-400"
            title="Pending Approvals"
            onClick={() => setCurrentA2UI('APPROVALS_VIEW')}
            isActive={currentA2UI === 'APPROVALS_VIEW'}
          />
          {false && <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>}
        </div>
      );
    }

    if (message.content === 'HEALTH_VIEW') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300">I've detected some anomalies in your agent fleet that require attention.</p>
          <PanelCard
            icon={AlertCircle}
            iconClass="bg-rose-500/10 text-rose-400"
            title="Agent Health Issues"
            onClick={() => setCurrentA2UI('HEALTH_VIEW')}
            isActive={currentA2UI === 'HEALTH_VIEW'}
          />
          {false && <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>}
        </div>
      );
    }

    if (message.content === 'WHATSAPP_OAUTH_VIEW') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300">好的，我来帮你配置 WhatsApp Business API。请在右侧面板完成 OAuth 授权流程。</p>
          <PanelCard
            icon={Smartphone}
            iconClass="bg-emerald-500/10 text-emerald-400"
            title="Connect WhatsApp"
            onClick={() => setCurrentA2UI('WHATSAPP_OAUTH_VIEW')}
            isActive={currentA2UI === 'WHATSAPP_OAUTH_VIEW'}
          />
          {false && <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>}
        </div>
      );
    }

    if (message.content === 'RUN_AGENT_INQUIRY') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300 leading-relaxed">What kind of task are you looking to run? For example: order processing, email drafting, warehouse design, or anything else — just describe what you need.</p>
          <PanelCard
            icon={Rocket}
            iconClass="bg-indigo-500/10 text-indigo-400"
            title="Available Agents"
            onClick={() => setCurrentA2UI('RUN_AGENT_VIEW')}
            isActive={currentA2UI === 'RUN_AGENT_VIEW'}
          />
          {false && <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>}
        </div>
      );
    }

    if (message.content === 'RUN_AGENT_RECOMMEND') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300 leading-relaxed">Based on your description, I'd recommend this agent:</p>
          <div className="mt-2.5 p-3.5 rounded-xl bg-[#0d0d12] border border-indigo/20">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-semibold text-white">OMS Agent for Multichannel Orders</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-500 bg-white/5">v7</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-400">RECOMMENDED</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">Unified single-agent OMS/DI operator for Shopify-first multichannel orders, inventory sync, and fulfillment orchestration.</p>
          </div>
          <button
            onClick={() => {
              const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              // Consume: exclude user message + this recommendation from preRunMessages
              const recIdx = messages.findIndex(m => m.content === 'RUN_AGENT_RECOMMEND');
              const consumeFrom = recIdx > 0 && messages[recIdx - 1].role === 'user' ? recIdx - 1 : recIdx;
              setPreRunMessages(messages.slice(0, consumeFrom));
              setMessages([{
                id: Date.now().toString(),
                role: 'user',
                content: 'I need to process Shopify orders and sync inventory',
                timestamp: now(),
              }]);
              setRunAgentMode(true);
              setRunAgentInfo({ name: 'OMS Agent for Multichannel Orders', emoji: '🛒', version: 'v7', status: 'running' });
              setChatflowMode(true);
              setChatflowChipStep(0);
              setConfigPhase(false);
              setVisibleConfigCount(0);
              setVisibleScenarioCount(0);
              setVisibleChatflowCount(1);
              setScenarioChipStep(0);
              setBuildFlowChipStep(0);
              setCurrentA2UI(null);
            }}
            className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            <Play size={14} />
            Go to Runtime
          </button>
          {false && <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>}
        </div>
      );
    }

    if (message.content === 'BUILD_AGENT_INQUIRY') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300 leading-relaxed">What kind of agent would you like to create? Describe the main goal, and I'll help you spec it out.</p>
        </div>
      );
    }

    if (message.content === 'BUILD_AGENT_QUESTIONS') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300 leading-relaxed mb-3">Great idea! To build the right spec, I need a few details:</p>
          <div className="space-y-2 mb-3">
            {[
              "1. What's the scope — should it handle all emails or only specific types?",
              '2. What email categories matter most (complaints, orders, returns, etc.)?',
              '3. Should replies go out automatically, or require manager approval first?',
              '4. Which email system are you using (Outlook, Gmail, etc.)?',
              '5. When details are missing from a customer email, how should the agent handle it?',
            ].map((q, i) => (
              <p key={i} className="text-sm text-gray-400 leading-relaxed">{q}</p>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-indigo/5 border border-indigo/15">
            <p className="text-[11px] text-gray-500 mb-1">Or try a quick version:</p>
            <p className="text-xs text-gray-300 italic">"{buildAgentChips.step2}"</p>
          </div>
        </div>
      );
    }

    if (message.content === 'BUILD_AGENT_REFINE') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300 leading-relaxed mb-3">Got it — an email assistant with drafting, follow-ups, and approval gating. A few more details to nail the spec:</p>
          <div className="space-y-2 mb-3">
            {[
              '1. Email system — Outlook via Graph API, or Gmail?',
              '2. Classification categories — complaint, order-inquiry, delivery-status, returns — anything else?',
              '3. Missing info — ask the customer directly, or flag for a human?',
              '4. Tone — professional and warm, or strictly formal?',
              '5. Approval rule — every email, or only complaints and returns?',
            ].map((q, i) => (
              <p key={i} className="text-sm text-gray-400 leading-relaxed">{q}</p>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-indigo/5 border border-indigo/15">
            <p className="text-[11px] text-gray-500 mb-1">One-line answer:</p>
            <p className="text-xs text-gray-300 italic">"{buildAgentChips.step3}"</p>
          </div>
        </div>
      );
    }

    if (message.content === 'BUILD_AGENT_COMPLETE') {
      return (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-[11px]">✅</div>
            <span className="text-sm font-medium text-emerald-400">Agent ready</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-1">
            I've generated the full spec for <strong className="text-white font-medium">Customer Service Email Assistant</strong> — including the agent definition, workflow, and two skills (email-reader, reply-drafter).
          </p>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">You can review and edit in the editor. When ready, we'll configure a test environment and do a debug run.</p>
          <PanelCard
            icon={Code}
            iconClass="bg-indigo-500/10 text-indigo-400"
            title="Agent Editor"
            onClick={() => setCurrentA2UI(currentA2UI === 'BUILD_AGENT_VIEW' ? null : 'BUILD_AGENT_VIEW')}
            isActive={currentA2UI === 'BUILD_AGENT_VIEW'}
          />
        </div>
      );
    }

    if (message.content === 'BUILD_AGENT_PUBLISHED') {
      return (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-[11px]">🚀</div>
            <span className="text-sm font-medium text-emerald-400">Published to Teams</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-1">
            <strong className="text-white font-medium">Customer Service Email Assistant</strong> is now live on your Teams page.
          </p>
        </div>
      );
    }

    if (message.content === 'BUILD_DEBUG_INTRO') {
      return (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center text-[11px]">🧪</div>
            <span className="text-sm font-medium text-indigo-300">Debug Run Setup</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-1">
            Agent spec 已就绪，在发布前需要先 debug run 测试效果。
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">当前没有已配置的环境，需要先创建一套测试环境。</p>
        </div>
      );
    }

    if (message.content === 'BUILD_TEST_CONFIG_REQUEST') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300 leading-relaxed mb-1">
            在开始 debug run 之前，需要先配置测试环境。请提供以下信息：
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">
            <strong className="text-white font-medium">Outlook Tenant ID</strong>、<strong className="text-white font-medium">Client ID</strong>、<strong className="text-white font-medium">目标邮箱</strong>、<strong className="text-white font-medium">审批人邮箱</strong>。
          </p>
          <ParamConfirmCard
            agentLabel="Email Assistant"
            headerLabel="测试环境配置"
            rows={[
              ['Outlook Tenant ID', '', true],
              ['Client ID', '', true],
              ['Mailbox', '', true],
              ['Manager Email', '', true],
            ]}
            confirmed
            partial
            isLatest={false}
          />
        </div>
      );
    }

    if (message.content === 'BUILD_TEST_CONFIG_CARD') {
      return (
        <div className="w-full">
          <div className="text-sm text-gray-300 leading-relaxed mb-1">测试环境配置完成！</div>
          <ParamConfirmCard
            agentLabel="Email Assistant"
            headerLabel="测试环境配置"
            rows={[
              ['Outlook Tenant ID', '8a2f3b1c-e9d4-...', true],
              ['Client ID', 'e4d7a9f0-1b3c-...', true],
              ['Mailbox', 'support@acme.com', true],
              ['Manager Email', 'sarah@acme.com', true],
            ]}
            confirmed
            isLatest={false}
          />
        </div>
      );
    }

    if (message.content === 'BUILD_PROD_CONFIG_REQUEST') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300 leading-relaxed mb-1">
            好的，让我们来配置正式环境。请提供以下信息：
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">
            <strong className="text-white font-medium">Outlook Tenant ID</strong>、<strong className="text-white font-medium">Client ID</strong>、<strong className="text-white font-medium">目标邮箱</strong>、<strong className="text-white font-medium">审批人邮箱</strong>。
          </p>
          <ParamConfirmCard
            agentLabel="Email Assistant"
            headerLabel="正式环境配置"
            rows={[
              ['Outlook Tenant ID', '', true],
              ['Client ID', '', true],
              ['Mailbox', '', true],
              ['Manager Email', '', true],
            ]}
            confirmed
            partial
            isLatest={false}
          />
        </div>
      );
    }

    if (message.content === 'BUILD_PROD_CONFIG_CARD') {
      return (
        <div className="w-full">
          <div className="text-sm text-gray-300 leading-relaxed mb-1">正式环境配置完成！</div>
          <ParamConfirmCard
            agentLabel="Email Assistant"
            headerLabel="正式环境配置"
            rows={[
              ['Outlook Tenant ID', 'prod-a1b2c3d4-...', true],
              ['Client ID', 'prod-x9y8z7w6-...', true],
              ['Mailbox', 'cs@acme-prod.com', true],
              ['Manager Email', 'manager@acme-prod.com', true],
            ]}
            confirmed
            isLatest={false}
          />
        </div>
      );
    }

    if (message.content.startsWith('BUILD_CONFIG_NAMED:')) {
      const name = message.content.replace('BUILD_CONFIG_NAMED:', '');
      const isProd = name.includes('正式');
      return (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-[11px]">💾</div>
            <span className="text-sm font-medium text-emerald-400">配置已保存</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            环境配置「<strong className="text-white font-medium">{name}</strong>」已保存。{isProd ? '一切准备就绪了，是否确认发布呢？' : '现在可以开始 debug run 了。'}
          </p>
        </div>
      );
    }

    if (message.content === 'BUILD_DEBUG_CREDENTIALS_SAVED') {
      return (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-[11px]">💾</div>
            <span className="text-sm font-medium text-emerald-400">凭证已保存</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            刚才 debug 过程中用到的连接凭证我帮你存好了，下次可以直接用。如果不需要，回复「不用保留」就好。
          </p>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
                <span className="text-xs font-medium text-gray-300">SMTP 连接凭证</span>
              </div>
              <span className="text-[10px] text-emerald-400/50 bg-emerald-400/[0.08] px-2 py-0.5 rounded-full">Email Assistant</span>
            </div>
            <div className="space-y-2 pl-4 border-l border-emerald-500/10">
              {[
                ['SMTP Host', 'smtp.acme.com'],
                ['Username', 'support@acme.com'],
                ['Password', '••••••••'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-200 font-mono text-[11px]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (message.content.startsWith('DEBUG_RUN_SUMMARY:')) {
      const runNum = message.content.split(':')[1];
      const snapshot = runNum === '2' ? postUpdateRunSnapshot : savedRunSnapshot;
      return (
        <div className="w-full max-w-3xl">
          <div
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0d0d12] border border-white/[0.06] cursor-pointer hover:border-white/[0.12] hover:bg-[#0d0d16] transition-colors"
            onClick={() => {
              if (!snapshot) return;
              setPreRunMessages(messages);
              setMessages(snapshot.messages);
              setActiveScenarioMessages(snapshot.scenarioMessages);
              setVisibleScenarioCount(snapshot.scenarioCount);
              setRunAgentMode(true);
              setRunAgentInfo(snapshot.agentInfo);
              setChatflowMode(snapshot.chatflowMode);
              setVisibleChatflowCount(snapshot.chatflowCount);
              setChatflowChipStep(snapshot.chatflowChipStep);
              setScenarioChipStep(-1);
              setCurrentA2UI(null);
              setBuildFlowChipStep(0);
              setVisibleConfigCount(0);
              setConfigPhase(false);
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-sm">✉️</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">Customer Service Email Assistant</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/15 text-indigo-400">Debug Run #{runNum}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-500/15 text-gray-400">Stopped</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Click to view run session</p>
            </div>
            <ChevronDown size={14} className="text-gray-600 flex-shrink-0" />
          </div>
        </div>
      );
    }

    if (message.content === 'RUNTIME_RUN_SUMMARY') {
      return (
        <div className="w-full max-w-3xl">
          <div
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0d0d12] border border-white/[0.06] cursor-pointer hover:border-white/[0.12] hover:bg-[#0d0d16] transition-colors"
            onClick={() => {
              const snap = runtimeRunSnapshotRef.current;
              if (!snap) return;
              setPreRunMessages(messages);
              setMessages(snap.messages);
              setActiveScenarioMessages(snap.scenarioMessages);
              setVisibleScenarioCount(snap.scenarioCount);
              setRunAgentMode(true);
              setRunAgentInfo(snap.agentInfo);
              setChatflowMode(snap.chatflowMode);
              setVisibleChatflowCount(snap.chatflowCount);
              setChatflowChipStep(snap.chatflowChipStep);
              setScenarioChipStep(-1);
              setCurrentA2UI(null);
              setBuildFlowChipStep(0);
              setVisibleConfigCount(0);
              setConfigPhase(false);
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm">✉️</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">Customer Service Email Assistant</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400">Runtime</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-500/15 text-gray-400">Stopped</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Click to view run session</p>
            </div>
            <ChevronDown size={14} className="text-gray-600 flex-shrink-0" />
          </div>
        </div>
      );
    }

    if (message.content === 'BUILD_UPDATE_DONE') {
      return (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center text-[11px]">🔄</div>
            <span className="text-sm font-medium text-indigo-300">Agent updated</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-1">
            Applied: <strong className="text-white font-medium">{buildUpdateText}</strong>
          </p>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">Agent 定义和工作流已更新。是否继续测试？</p>
          <PanelCard
            icon={Code}
            iconClass="bg-indigo-500/10 text-indigo-400"
            title="Agent Editor"
            onClick={() => setCurrentA2UI(currentA2UI === 'BUILD_AGENT_VIEW' ? null : 'BUILD_AGENT_VIEW')}
            isActive={currentA2UI === 'BUILD_AGENT_VIEW'}
          />
        </div>
      );
    }

    if (message.content === 'BUILD_CHOOSE_PROD_CONFIG') {
      return (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-[11px]">⚙️</div>
            <span className="text-sm font-medium text-amber-400">配置正式环境</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            测试通过！发布前需要为 runtime 配置正式环境。是否基于之前的配置，还是要用新的配置？
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleBuildFlowChip('使用之前的「测试环境」配置')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-300 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] hover:text-white transition-all text-left"
            >
              <span>使用之前的「测试环境」配置</span>
            </button>
            <button
              onClick={() => handleBuildFlowChip('创建新的环境配置')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white bg-indigo-600/20 border border-indigo-500/30 hover:border-indigo-500/50 hover:bg-indigo-600/30 transition-all text-left"
            >
              <span>创建新的环境配置（推荐）</span>
            </button>
          </div>
        </div>
      );
    }

    if (message.content === 'BUILD_DEBUG_READY') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300 leading-relaxed">
            好的，使用「<strong className="text-white font-medium">测试环境</strong>」配置。请输入本次 debug run 的测试意图。
          </p>
        </div>
      );
    }

    if (message.content === 'BUILD_DEBUG_START_CONFIRM') {
      const isLatestMsg = messages[messages.length - 1]?.id === message.id;
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300 leading-relaxed">
            好的，已收到你的测试意图。将使用「<strong className="text-white font-medium">{configName || '测试环境'}</strong>」配置来执行本次 debug run，运行过程中你可以在右侧面板实时查看日志。
          </p>
          <div className="mt-2.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <p className="text-xs text-gray-400">💡 右侧是 Agent 的调试环境，有问题随时回来跟我说。</p>
          </div>
        </div>
      );
    }

    if (message.content === 'BUILD_PUBLISH_CONFIRM') {
      return (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-[11px]">✅</div>
            <span className="text-sm font-medium text-emerald-400">Ready to Publish</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            环境配置完成，点击下方确认。
          </p>
        </div>
      );
    }

    if (message.content === 'BUILD_RUNTIME_READY') {
      return (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-[11px]">🎉</div>
            <span className="text-sm font-medium text-emerald-400">Runtime Ready</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            已基于「<strong className="text-white font-medium">{configName || '正式环境'}</strong>」配置为您设置好环境，点击下方按钮开始 Runtime。
          </p>
          <button
            onClick={() => handleBuildFlowChip('Go to Runtime')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            <Play size={14} />
            Go to Runtime
          </button>
        </div>
      );
    }

    if (message.content.startsWith('BUILD_AGENT_UPDATED:')) {
      const changeDesc = message.content.replace('BUILD_AGENT_UPDATED:', '');
      return (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center text-[11px]">🔄</div>
            <span className="text-sm font-medium text-indigo-300">Agent updated</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-1">
            Applied: <strong className="text-white font-medium">{changeDesc}</strong>
          </p>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">The agent definition and workflow have been updated. You can review the changes in the editor.</p>
          <PanelCard
            icon={Code}
            iconClass="bg-indigo-500/10 text-indigo-400"
            title="Agent Editor"
            onClick={() => setCurrentA2UI(currentA2UI === 'BUILD_AGENT_VIEW' ? null : 'BUILD_AGENT_VIEW')}
            isActive={currentA2UI === 'BUILD_AGENT_VIEW'}
          />
        </div>
      );
    }

    if (message.content.startsWith('RUN_SUMMARY:')) {
      const agentName = message.content.replace('RUN_SUMMARY:', '');
      const canReopen = !!savedRunSnapshot;
      return (
        <div className="w-full">
          <div
            className={`flex items-center gap-3 p-3.5 rounded-xl bg-[#0d0d12] border border-white/[0.06] ${canReopen ? 'cursor-pointer hover:border-white/[0.12] hover:bg-[#0d0d16] transition-colors' : ''}`}
            onClick={canReopen ? () => {
              setPreRunMessages(messages.filter(m => !m.content.startsWith('RUN_SUMMARY:')));
              setMessages(savedRunSnapshot.messages);
              setActiveScenarioMessages(savedRunSnapshot.scenarioMessages);
              setVisibleScenarioCount(savedRunSnapshot.scenarioCount);
              setRunAgentMode(true);
              setRunAgentInfo(savedRunSnapshot.agentInfo);
              setChatflowMode(savedRunSnapshot.chatflowMode);
              setVisibleChatflowCount(savedRunSnapshot.chatflowCount);
              setChatflowChipStep(savedRunSnapshot.chatflowChipStep);
              setScenarioChipStep(-1);
              setCurrentA2UI(null);
              setBuildFlowChipStep(0);
              setVisibleConfigCount(0);
              setConfigPhase(false);
            } : undefined}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-sm">✉️</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">{agentName}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/15 text-indigo-400">Task Running</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-500/15 text-gray-400">Stopped</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{canReopen ? 'Click to view run session' : 'Run ended by user'}</p>
            </div>
            {canReopen && <ChevronDown size={14} className="text-gray-600 flex-shrink-0" />}
          </div>
        </div>
      );
    }

    if (message.content === 'RUN_AGENT_VIEW') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300">Here are your available agent teams. You can start, pause, or manage them.</p>
          <PanelCard
            icon={Rocket}
            iconClass="bg-indigo-500/10 text-indigo-400"
            title="Run Agent"
            onClick={() => setCurrentA2UI('RUN_AGENT_VIEW')}
            isActive={currentA2UI === 'RUN_AGENT_VIEW'}
          />
          {false && <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>}
        </div>
      );
    }

    if (message.content.startsWith('TEAM_VIEW:')) {
      const teamKey = message.content.replace('TEAM_VIEW:', '');
      const team = stewardTeamsData[teamKey];
      const approvals = stewardTeamApprovals[teamKey] || [];
      const teamName = team?.name || teamKey;

      if (team) {
        const workingAgents = team.agents.filter(a => a.status === 'working');
        const idleAgents = team.agents.filter(a => a.status === 'idle');
        const assignTaskAgents = team.agents.filter(a => a.status === 'assign_task');
        const criticalApprovals = approvals.filter(a => a.priority === 'CRITICAL');
        const highApprovals = approvals.filter(a => a.priority === 'HIGH');

        // Build failed/attention items from agents with issues
        const attentionItems = [
          ...assignTaskAgents.map(a => ({ agent: a.name, issue: a.currentTask || 'Waiting for task assignment' })),
          ...idleAgents.map(a => ({ agent: a.name, issue: 'Currently idle with no active task' })),
        ];

        return (
          <div className="w-full">
            <div className="text-sm leading-relaxed text-gray-300 space-y-3">
              <p>Here's the current status for <strong className="text-white font-medium">{teamName}</strong>:</p>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <p className="text-xs text-gray-500 uppercase mb-2">Team Status</p>
                <p className="text-sm text-gray-300">
                  <strong className="text-white">{workingAgents.length}</strong> of {team.agents.length} agents actively working.
                  {idleAgents.length > 0 && <> <strong className="text-gray-400">{idleAgents.length}</strong> idle.</>}
                  {assignTaskAgents.length > 0 && <> <strong className="text-amber-400">{assignTaskAgents.length}</strong> awaiting task assignment.</>}
                </p>
                {workingAgents.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {workingAgents.map(a => (
                      <p key={a.id} className="text-xs text-gray-400">• <span className="text-emerald-400">{a.name}</span>: {a.currentTask}</p>
                    ))}
                  </div>
                )}
              </div>

              {approvals.length > 0 && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-xs text-gray-500 uppercase mb-2">Pending Approvals ({approvals.length})</p>
                  {criticalApprovals.length > 0 && (
                    <div className="mb-2">
                      {criticalApprovals.map(a => (
                        <div key={a.id} className="flex items-start gap-2 mb-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 flex-shrink-0 mt-0.5">CRITICAL</span>
                          <p className="text-xs text-gray-300"><strong className="text-white">{a.agent}</strong>: {a.action} — <span className="text-rose-400">Recommend immediate review</span></p>
                        </div>
                      ))}
                    </div>
                  )}
                  {highApprovals.length > 0 && (
                    <div className="mb-2">
                      {highApprovals.map(a => (
                        <div key={a.id} className="flex items-start gap-2 mb-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">HIGH</span>
                          <p className="text-xs text-gray-300"><strong className="text-white">{a.agent}</strong>: {a.action} — <span className="text-amber-400">Recommend approval</span></p>
                        </div>
                      ))}
                    </div>
                  )}
                  {approvals.filter(a => a.priority === 'MEDIUM').length > 0 && (
                    <p className="text-xs text-gray-400">{approvals.filter(a => a.priority === 'MEDIUM').length} medium-priority items can be batch-processed. See the right panel for details.</p>
                  )}
                </div>
              )}

              {attentionItems.length > 0 && (
                <div className="p-3 rounded-xl bg-black/40 border border-amber-500/10">
                  <p className="text-xs text-gray-500 uppercase mb-2">⚠️ Needs Attention</p>
                  {attentionItems.map((item, i) => (
                    <p key={i} className="text-xs text-gray-300 mb-1">• <strong className="text-amber-400">{item.agent}</strong>: {item.issue}</p>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-400">I've loaded the full collaboration graph and approval details in the right panel. You can review and take action from there.</p>
            </div>
            <PanelCard
              icon={Users}
              iconClass="bg-indigo-500/10 text-indigo-400"
              title={teamName}
              onClick={() => setCurrentA2UI(message.content)}
              isActive={currentA2UI === message.content}
            />
            {false && <p className="text-xs text-gray-500 mt-3">{message.timestamp}</p>}
          </div>
        );
      }

      return (
        <div className="w-full">
          <p className="text-sm text-gray-300">Here's the overview for <strong className="text-white font-medium">{teamName}</strong>.</p>
          <PanelCard
            icon={Users}
            iconClass="bg-indigo-500/10 text-indigo-400"
            title={teamName}

            onClick={() => setCurrentA2UI(message.content)}
            isActive={currentA2UI === message.content}
          />
          {false && <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>}
        </div>
      );
    }

    // Show quick action buttons for the initial welcome message
    if (message.role === 'steward' && message.content.includes('What would you like to explore first?')) {
      return (
        <div className="w-full">
          <div className={`text-sm whitespace-pre-wrap leading-relaxed text-gray-300`}>
            {formatMessage(message.content)}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => handleQuickAction('overview')}
              className="px-6 py-3 rounded-full border border-white/20 text-sm text-gray-300 hover:text-white hover:border-white/40 transition-all"
            >
              AI Workforce Overview
            </button>
            <button
              onClick={() => handleQuickAction('approvals')}
              className="px-6 py-3 rounded-full border border-white/20 text-sm text-gray-300 hover:text-white hover:border-white/40 transition-all"
            >
              Approval Decisions
            </button>
            <button
              onClick={() => handleQuickAction('health')}
              className="px-6 py-3 rounded-full border border-white/20 text-sm text-gray-300 hover:text-white hover:border-white/40 transition-all"
            >
              Workforce Health Monitor
            </button>
            <button
              onClick={() => handleQuickAction('configuration')}
              className="px-6 py-3 rounded-full border border-white/20 text-sm text-gray-300 hover:text-white hover:border-white/40 transition-all"
            >
              Configuration
            </button>
          </div>
          {false && <p className="text-xs text-gray-500 mt-3">{message.timestamp}</p>}
        </div>
      );
    }

    // Show configuration sub-options
    if (message.role === 'steward' && message.content === 'CONFIGURATION_OPTIONS') {
      return (
        <div className="w-full">
          <div className="text-sm whitespace-pre-wrap leading-relaxed text-gray-300">
            Sure! Here are the available configuration options. Which one would you like to set up?
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => handleQuickAction('whatsapp')}
              className="px-6 py-3 rounded-full border border-emerald-500/30 text-sm text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50 transition-all"
            >
              📱 WhatsApp Business
            </button>
            <button
              onClick={() => handleQuickAction('config-slack')}
              className="px-6 py-3 rounded-full border border-white/20 text-sm text-gray-300 hover:text-white hover:border-white/40 transition-all"
            >
              💬 Slack Integration
            </button>
            <button
              onClick={() => handleQuickAction('config-email')}
              className="px-6 py-3 rounded-full border border-white/20 text-sm text-gray-300 hover:text-white hover:border-white/40 transition-all"
            >
              📧 Email SMTP
            </button>
            <button
              onClick={() => handleQuickAction('config-api')}
              className="px-6 py-3 rounded-full border border-white/20 text-sm text-gray-300 hover:text-white hover:border-white/40 transition-all"
            >
              🔑 API Keys
            </button>
          </div>
          {false && <p className="text-xs text-gray-500 mt-3">{message.timestamp}</p>}
        </div>
      );
    }

    return (
      <div
        className={`${
          message.role === 'user'
            ? 'text-white text-sm'
            : 'bg-transparent'
        }`}
      >
        <div className={`${currentA2UI === 'DEBUG_RUN_VIEW' ? 'text-xs' : 'text-sm'} whitespace-pre-wrap leading-relaxed ${
          message.role === 'user' ? 'text-white' : 'text-gray-300'
        }`}>
          {formatMessage(message.content)}
        </div>
      </div>
    );
  };

  const renderScenarioMessage = (msg: ScenarioMessage, isLatestCard: boolean) => {
    const card = msg.card;
    const showPanelCard = false; // panel card removed — all param/config collection happens in chat cards
    return (
      <div>
        {msg.content && (
          <div className={`text-sm whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-gray-300'}`}>
            {formatMessage(msg.content)}
          </div>
        )}
        {card?.type === 'typing' && <TypingIndicator text={card.typingText || ''} />}
        {card?.type === 'param-confirm' && (
          <ParamConfirmCard
            agentLabel={card.agentLabel || ''}
            headerLabel={card.headerLabel}
            rows={card.rows || []}
            onConfirmRun={() => {
              setConfirmedCardId(msg.id);
              if (msg.id.startsWith('c1') || msg.id.startsWith('pc')) handleConfigComplete();
              else handleRun();
            }}
            onSavePartial={() => handleSavePartial(msg.id, card.rows || [])}
            panelOpen={false}
            confirmed={confirmedCardId === msg.id}
            partial={card.partial}
            onEdit={card.partial ? handleClearParamTimers : undefined}
            isLatest={isLatestCard}
          />
        )}
        {card?.type === 'exec-log' && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#08080e] border border-indigo/10">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${card.done ? 'bg-emerald-400' : 'bg-indigo-400 animate-pulse'}`} />
            <span className="text-xs text-gray-400">
              {card.done ? `Execution completed — ${card.lines?.length || 0} steps` : 'Executing...'}
            </span>
            <button
              onClick={() => {
                if (runLogLines.length === 0 && card.lines) {
                  setRunLogLines(card.lines);
                  setRunLogStatus(card.done ? 'completed' : 'running');
                }
                setCurrentA2UI('RUN_LOG_VIEW');
              }}
              className="ml-auto text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View Logs
            </button>
          </div>
        )}
        {card?.type === 'result-card' && (
          <ResultCard
            title={card.title || ''}
            body={card.body || ''}
            stats={card.stats || []}
            buttons={card.buttons || []}
          />
        )}
        {showPanelCard && (
          <PanelCard
            icon={Settings}
            iconClass="bg-amber-500/10 text-amber-400"
            title="Agent Configuration"
            onClick={() => { setCurrentA2UI('RUN_AGENT_CONFIG_VIEW'); setPanelEditing(false); }}
            isActive={currentA2UI === 'RUN_AGENT_CONFIG_VIEW'}
          />
        )}
      </div>
    );
  };

  const renderA2UIPanel = () => {
    if (!currentA2UI) return null;

    if (currentA2UI.startsWith('TEAM_VIEW:')) {
      const teamKey = currentA2UI.replace('TEAM_VIEW:', '');
      return <TeamOverviewWidget teamKey={teamKey} />;
    }

    switch (currentA2UI) {
      case 'DASHBOARD_VIEW':
        return <DashboardWidget />;
      case 'APPROVALS_VIEW':
        return <ApprovalsWidget onApprove={handleApproveFromPanel} onProcessAll={handleProcessAllApprovals} />;
      case 'HEALTH_VIEW':
        return <HealthIssuesWidget onFixNow={handleFixNowFromWelcome} onFixAll={handleFixAllFromPanel} />;
      case 'WHATSAPP_OAUTH_VIEW':
        return <WhatsAppOAuthWidget stage="qr" />;
      case 'BUILD_AGENT_VIEW':
        return <BuildAgentPanel key={agentPanelKey} agentName="Customer Service Email Assistant" initialFiles={generatedAgentFiles} onClose={() => setCurrentA2UI(null)} updated={!!buildUpdateText} publishing={buildPublishing} published={buildPublished} onPublish={() => {}} />;
      case 'RUN_AGENT_VIEW':
        return <RunAgentWidget onRun={(teamId) => {
          router.push(`/teams/${teamId}/run`);
        }} />;
      case 'EXEC_LOG_VIEW':
        return <ExecLogDetailPanel scenarioParams={scenarioParams} />;
      case 'RUN_DETAILS_VIEW':
        return (
          <RunDetailsPanel
            agentName={runAgentInfo?.name || 'Agent'}
            agentDescription="Multichannel order processing with inventory sync and fulfillment routing"
            params={scenario1PanelParamsFilled}
            agentFiles={scenario1AgentFiles}
            fileContents={agentFileContents}
          />
        );
      case 'RUN_LOG_VIEW':
        return (
          <RunLogPanel
            lines={runLogLines}
            status={runLogStatus}
            agentName={runAgentInfo?.name || 'Agent'}
            startedAt="14:33"
            onClose={() => setCurrentA2UI(null)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <StewardHeader runAgentMode={runAgentMode} runAgentName={runAgentInfo?.name} runAgentEmoji={runAgentInfo?.emoji} runLabel={preRunMessages ? (buildUpdateText ? 'Runtime' : 'Task Running') : undefined} onNewSession={preRunMessages ? () => {
        // Save current run as summary card into preRunMessages
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const summaryMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'steward',
          content: `RUN_SUMMARY:${runAgentInfo?.name || 'Agent'}`,
          timestamp: now,
        };
        setPreRunMessages(prev => [...(prev || []), summaryMsg]);
        // Clear all pending timers first
        runAgentFlowTimers.current.forEach(clearTimeout);
        runAgentFlowTimers.current = [];
        // Reset run state for a fresh conversation
        const nowFn = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages([{
          id: (Date.now() + 1).toString(),
          role: 'user',
          content: 'I need to process Shopify orders and sync inventory',
          timestamp: nowFn(),
        }]);
        setChatflowMode(true);
        setVisibleChatflowCount(1);
        setVisibleScenarioCount(0);
        setVisibleConfigCount(0);
        setConfigPhase(false);
        setScenarioChipStep(0);
        setBuildFlowChipStep(0);
        setBuildSaveClicked(false);
        setBuildUpdateText(null);
        setBuildTestRunClicked(false);
        setSkippedIds(new Set());
        setConfirmedCardId(null);
        setSavedRunSnapshot(null);
        setPostUpdateRunSnapshot(null);
        setOmsRunSnapshot(null);
        setIsTyping(false);
        // Reset chatflowChipStep last via setTimeout to avoid race with pending timer closures
        setTimeout(() => setChatflowChipStep(0), 0);
      } : undefined} onStopBack={preRunMessages ? () => {
        // Clear all pending timers first to prevent stale callbacks
        runAgentFlowTimers.current.forEach(clearTimeout);
        runAgentFlowTimers.current = [];
        // Save run conversation snapshot before leaving
        const snapshot = {
          messages: [...messages],
          scenarioMessages: [...activeScenarioMessages],
          scenarioCount: visibleScenarioCount,
          agentInfo: runAgentInfo ? { ...runAgentInfo } : null,
          chatflowMode,
          chatflowCount: visibleChatflowCount,
          chatflowChipStep,
        };
        // Save snapshot based on debug run count
        if (debugRunCount === 3) {
          setRuntimeRunSnapshot(snapshot);
        } else if (debugRunCount === 2) {
          setPostUpdateRunSnapshot(snapshot);
        } else if (debugRunCount === 1) {
          setSavedRunSnapshot(snapshot);
        } else {
          const isOmsRun = runAgentInfo?.name?.includes('OMS');
          if (isOmsRun) {
            setOmsRunSnapshot(snapshot);
          } else if (buildUpdateText) {
            setPostUpdateRunSnapshot(snapshot);
          } else {
            setSavedRunSnapshot(snapshot);
          }
        }
        // Restore pre-run conversation
        const fromBuildFlow = preRunMessages.some(m => m.content === 'BUILD_AGENT_COMPLETE' || m.content.startsWith('BUILD_AGENT_UPDATED:') || m.content === 'BUILD_DEBUG_INTRO' || m.content.startsWith('BUILD_CONFIG_NAMED:') || m.content === 'BUILD_UPDATE_DONE' || m.content === 'BUILD_DEBUG_READY' || m.content === 'BUILD_DEBUG_START_CONFIRM' || m.content === 'BUILD_RUNTIME_READY');
        if (fromBuildFlow) {
          const nowTs = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const summaryContent = debugRunCount === 3 ? 'RUNTIME_RUN_SUMMARY' : `DEBUG_RUN_SUMMARY:${debugRunCount}`;
          const debugSummaryMsg: ChatMessage = {
            id: (Date.now() + 2).toString(),
            role: 'steward',
            content: summaryContent,
            timestamp: nowTs,
          };
          setMessages([...preRunMessages, debugSummaryMsg]);
        } else {
          const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const summaryMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'steward',
            content: `RUN_SUMMARY:${runAgentInfo?.name || 'Agent'}`,
            timestamp: now,
          };
          setMessages([...preRunMessages, summaryMsg]);
        }
        setPreRunMessages(null);
        setRunAgentMode(false);
        setRunFlowChipStep('idle');
        setVisibleScenarioCount(1);
        setConfigPhase(false);
        setChatflowMode(false);
        setVisibleChatflowCount(0);
        setConfigParams(configFields.map((f) => ({ ...f })));
        setConfigHighlightFields([]);
        setPanelEditing(false);
        setSkippedIds(new Set());
        setRunLogLines([]);
        setRunLogStatus('running');
        // Restore context based on where we came from
        if (fromBuildFlow) {
          if (debugRunCount === 3) {
            // Runtime run return → flow is complete, no next step
            setBuildFlowChipStep(0);
          } else if (debugRunCount === 2) {
            // Second debug run return → auto-advance to step 12
            setBuildFlowChipStep(12);
          } else if (debugRunCount === 1) {
            // First debug run return → auto-advance to step 9
            setBuildFlowChipStep(9);
          } else {
            setBuildFlowChipStep(7);
          }
          setVisibleConfigCount(0);
          setCurrentA2UI('BUILD_AGENT_VIEW');
          setBuildSaveClicked(false);
          setConfigNamed(null);
        } else {
          setBuildFlowChipStep(0);
          setBuildSaveClicked(false);
          setBuildUpdateText(null);
          setBuildTestRunClicked(false);
          setVisibleConfigCount(0);
          setCurrentA2UI(null);
        }
      } : undefined} onDeleteSession={() => {
        const oldId = currentSessionId;
        runAgentFlowTimers.current.forEach(clearTimeout);
        runAgentFlowTimers.current = [];
        createSession('build_agent');
        deleteSession(oldId);
      }} />

      <div ref={containerRef} className={`flex-1 flex overflow-hidden min-h-0${isDraggingDivider ? ' select-none' : ''}`}>
        {/* Left: Chat Area */}
        <div className={`flex flex-col overflow-hidden min-h-0 ${runAgentMode ? 'bg-indigo-950/20' : ''}`} style={{ width: currentA2UI ? `${100 - rightPanelWidth}%` : '100%' }}>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className={`max-w-4xl mx-auto ${currentA2UI === 'DEBUG_RUN_VIEW' ? 'space-y-3' : 'space-y-6'}`}>
              {runAgentMode ? (
                <>
                  {/* Render chat messages in run mode */}
                  {messages.length > 0 ? (
                    messages.filter(m => m.content !== 'WELCOME_VIEW').map((message) => (
                      <div
                        key={message.id}
                        className={`${message.role === 'user' ? 'flex justify-end' : ''}`}
                      >
                        <div className={`${message.role === 'user' ? 'max-w-2xl rounded-2xl px-4 py-2.5' : 'max-w-3xl'}`} style={message.role === 'user' ? { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' } : undefined}>
                          {renderMessageContent(message)}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Fallback: Teams page navigation — show hardcoded initial message */
                    <div className="flex justify-end">
                      <div className="max-w-2xl rounded-2xl px-4 py-2.5" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="text-sm text-white">Run {runAgentInfo?.name || 'Agent'}</div>
                        <p className="text-xs mt-2 text-gray-500">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  )}
                  {/* Config phase messages (if any) */}
                  {!chatflowMode && visibleConfigCount > 0 && (() => {
                    const visibleMsgs = activeConfigMessages.slice(0, visibleConfigCount).filter((m) => !skippedIds.has(m.id));
                    const lastMsg = visibleMsgs[visibleMsgs.length - 1];
                    const stillCollecting = lastMsg?.card?.type === 'param-confirm' || lastMsg?.card?.type === 'typing';
                    const lastCardId = stillCollecting ? [...visibleMsgs].reverse().find((m) => m.card?.type === 'param-confirm')?.id : undefined;
                    const configChips: Record<number, string> = {
                      0: 'Endpoint is https://wes.acme.io/api/v2, station S-14',
                      1: 'Token is omr_sk_a8f3...x9d1, use the default zone',
                      2: 'Save configuration',
                    };
                    return visibleMsgs.map((msg) => (
                      <div
                        key={msg.id}
                        className={`${msg.role === 'user' ? 'flex justify-end' : ''}`}
                      >
                        <div className={`${msg.role === 'user' ? 'max-w-2xl rounded-2xl px-4 py-2.5' : 'max-w-3xl'}`} style={msg.role === 'user' ? { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' } : undefined}>
                          {renderScenarioMessage(msg, msg.id === lastCardId)}
                        </div>
                      </div>
                    ));
                  })()}
                  {/* Param collection messages (after config phase) */}
                  {!chatflowMode && !configPhase && (() => {
                    const visibleMsgs = activeScenarioMessages.slice(0, visibleScenarioCount).filter((m) => !skippedIds.has(m.id));
                    const lastMsg = visibleMsgs[visibleMsgs.length - 1];
                    const stillCollecting = lastMsg?.card?.type === 'param-confirm' || lastMsg?.card?.type === 'typing';
                    const lastCardId = stillCollecting ? [...visibleMsgs].reverse().find((m) => m.card?.type === 'param-confirm')?.id : undefined;
                    return visibleMsgs.map((msg) => (
                      <div
                        key={msg.id}
                        className={`${msg.role === 'user' ? 'flex justify-end' : ''}`}
                      >
                        <div className={`${msg.role === 'user' ? 'max-w-2xl rounded-2xl px-4 py-2.5' : 'max-w-3xl'}`} style={msg.role === 'user' ? { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' } : undefined}>
                          {renderScenarioMessage(msg, msg.id === lastCardId)}
                        </div>
                      </div>
                    ));
                  })()}
                  {/* Chatflow messages (multi-turn conversation) */}
                  {chatflowMode && visibleChatflowCount > 0 && (() => {
                    const activeChatflowMsgs = runAgentInfo?.name?.includes('OMS') ? omsChatflowMessages : chatflowMessages;
                    const visibleMsgs = activeChatflowMsgs.slice(0, visibleChatflowCount);
                    return visibleMsgs.map((msg) => (
                      <div
                        key={msg.id}
                        className={`${msg.role === 'user' ? 'flex justify-end' : ''}`}
                      >
                        <div className={`${msg.role === 'user' ? 'max-w-2xl rounded-2xl px-4 py-2.5' : 'max-w-3xl'}`} style={msg.role === 'user' ? { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' } : undefined}>
                          {renderScenarioMessage(msg, false)}
                        </div>
                      </div>
                    ));
                  })()}
                  {/* Post-scenario messages (chip clicks, etc.) */}
                  {postMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`${message.role === 'user' ? 'flex justify-end' : ''}`}
                    >
                      <div className={`${message.role === 'user' ? 'max-w-2xl rounded-2xl px-4 py-2.5' : 'max-w-3xl'}`} style={message.role === 'user' ? { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' } : undefined}>
                        {renderMessageContent(message)}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`${message.role === 'user' ? 'flex justify-end' : ''}`}
                    >
                      {message.content.startsWith('SESSION_REF:') ? (
                        (() => {
                          const parts = message.content.split(':');
                          const childId = parts[1];
                          const emoji = parts[2];
                          const name = parts[3];
                          const status = (parts[4] || 'active') as import('../types').SessionStatus;
                          const summary = parts[5];
                          const childSession = sessions.find(s => s.id === childId);
                          return (
                            <div className="max-w-3xl">
                              <SessionReferenceCard
                                agentName={name}
                                agentEmoji={emoji}
                                sessionTitle={childSession?.title}
                                status={status}
                                summary={summary}
                                onNavigate={() => switchSession(childId)}
                              />
                            </div>
                          );
                        })()
                      ) : (
                        <div className={`${message.role === 'user' ? 'max-w-2xl rounded-2xl px-4 py-2.5' : 'max-w-3xl'}`} style={message.role === 'user' ? { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' } : undefined}>
                          {renderMessageContent(message)}
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Config messages during build flow (buildFlowChipStep >= 5, or during naming flow typing when step is -1) */}
                  {(buildFlowChipStep >= 5 || buildSaveClicked || configNamed) && visibleConfigCount > 0 && (() => {
                    const visibleMsgs = activeConfigMessages.slice(0, visibleConfigCount).filter((m) => !skippedIds.has(m.id));
                    const lastMsg = visibleMsgs[visibleMsgs.length - 1];
                    const stillCollecting = lastMsg?.card?.type === 'param-confirm' || lastMsg?.card?.type === 'typing';
                    const lastCardId = stillCollecting ? [...visibleMsgs].reverse().find((m) => m.card?.type === 'param-confirm')?.id : undefined;
                    return visibleMsgs.map((msg) => (
                      <div
                        key={msg.id}
                        className={`${msg.role === 'user' ? 'flex justify-end' : ''}`}
                      >
                        <div className={`${msg.role === 'user' ? 'max-w-2xl rounded-2xl px-4 py-2.5' : 'max-w-3xl'}`} style={msg.role === 'user' ? { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' } : undefined}>
                          {renderScenarioMessage(msg, msg.id === lastCardId)}
                        </div>
                      </div>
                    ));
                  })()}
                  {/* Inline: user confirms save + steward asks for config name */}
                  {buildSaveClicked && (
                    <>
                      <div className="flex justify-end">
                        <div className="max-w-2xl rounded-2xl px-4 py-2.5" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div className="text-sm text-white">保存这套配置</div>
                        </div>
                      </div>
                      <div className="max-w-3xl">
                        <p className="text-sm text-gray-300 leading-relaxed">
                          配置已保存好了，我先叫它「测试环境」，你也可以改个别的名字。
                        </p>
                      </div>
                    </>
                  )}
                  {/* Inline: user names config + steward confirms saved */}
                  {configNamed && (
                    <>
                      <div className="flex justify-end">
                        <div className="max-w-2xl rounded-2xl px-4 py-2.5" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div className="text-sm text-white">{configNamed}</div>
                        </div>
                      </div>
                      {buildFlowChipStep >= 7 && configName && (
                        <div className="max-w-3xl">
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-[11px]">💾</div>
                            <span className="text-sm font-medium text-emerald-400">配置已保存</span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            环境配置「<strong className="text-white font-medium">{configName}</strong>」已保存。{buildFlowChipStep === 15 ? '一切准备就绪了，是否确认发布呢？' : '现在是否要开始进行 debug run 呢？'}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  {/* Debug run summary cards are now rendered as messages (DEBUG_RUN_SUMMARY:N) */}
                </>
              )}

              {isTyping && (
                <div className="flex items-center gap-2.5 px-4 py-3">
                  <div className="w-4 h-4 rounded-full border-2 border-indigo border-t-transparent animate-spin" />
                  <span className="text-sm text-gray-400">{typingStatus || 'Thinking...'}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="flex-shrink-0 px-6 py-4 border-t border-white/5">
            <div className="max-w-4xl mx-auto">
              {/* Chip-driven flow chips + Quick Actions Bar */}
              {(() => {
                const chipStyle = "px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-400 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:text-gray-200 transition-all";

                // Hide all chips while steward is typing
                if (isTyping) return null;


                // Pre-run flow chips (above input)
                if (runFlowChipStep === 'waiting-describe') {
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      <button onClick={() => handleRunFlowChip('I need to process Shopify orders and sync inventory')} className={chipStyle}>
                        Process Shopify orders and sync inventory
                      </button>
                    </div></div>
                  );
                }

                // Build Agent flow chips
                if (buildFlowChipStep === 1) {
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      <button onClick={() => handleBuildFlowChip(buildAgentChips.step1)} className={chipStyle}>
                        {buildAgentChips.step1}
                      </button>
                    </div></div>
                  );
                }
                if (buildFlowChipStep === 2) {
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      <button onClick={() => handleBuildFlowChip(buildAgentChips.step2)} className={chipStyle}>
                        {buildAgentChips.step2}
                      </button>
                    </div></div>
                  );
                }
                if (buildFlowChipStep === 3) {
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      <button onClick={() => handleBuildFlowChip(buildAgentChips.step3)} className={chipStyle}>
                        {buildAgentChips.step3}
                      </button>
                    </div></div>
                  );
                }
                if (buildFlowChipStep === 4) {
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      <button onClick={() => handleBuildFlowChip(buildAgentChips.step4)} className={chipStyle}>
                        {buildAgentChips.step4}
                      </button>
                    </div></div>
                  );
                }
                if (buildFlowChipStep === 6) {
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      <button onClick={() => handleBuildFlowChip(buildAgentChips.step6)} className={chipStyle}>
                        {buildAgentChips.step6}
                      </button>
                    </div></div>
                  );
                }
                if (buildFlowChipStep === 7) {
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      <button onClick={() => handleBuildFlowChip(buildAgentChips.step7)} className={chipStyle}>
                        {buildAgentChips.step7}
                      </button>
                    </div></div>
                  );
                }
                if (buildFlowChipStep === 9) {
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      <button onClick={() => handleBuildFlowChip(buildAgentChips.step9)} className={chipStyle}>
                        {buildAgentChips.step9}
                      </button>
                    </div></div>
                  );
                }
                if (buildFlowChipStep === 10) {
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      <button onClick={() => handleBuildFlowChip(buildAgentChips.step10_reuse)} className={chipStyle}>
                        {buildAgentChips.step10_reuse}
                      </button>
                    </div></div>
                  );
                }
                if (buildFlowChipStep === 12) {
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      <button onClick={() => handleBuildFlowChip(buildAgentChips.step12)} className={chipStyle}>
                        {buildAgentChips.step12}
                      </button>
                    </div></div>
                  );
                }
                if (buildFlowChipStep === 14) {
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      <button onClick={() => handleBuildFlowChip(buildAgentChips.step14)} className={chipStyle}>
                        {buildAgentChips.step14}
                      </button>
                    </div></div>
                  );
                }
                if (buildFlowChipStep === 15) {
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      <button onClick={() => handleBuildFlowChip(buildAgentChips.step15)} className={chipStyle}>
                        {buildAgentChips.step15}
                      </button>
                    </div></div>
                  );
                }
                if (buildFlowChipStep === 711) {
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      <button onClick={() => handleBuildFlowChip('smtp.acme.com; username cs-bot@acme.com; password: Acme2024!')} className={chipStyle}>
                        smtp.acme.com; username cs-bot@acme.com; password: Acme2024!
                      </button>
                    </div></div>
                  );
                }
                if (buildFlowChipStep === 712) {
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      <button onClick={() => handleBuildFlowChip('用这个：username support@acme.com password SupportBot#2024')} className={chipStyle}>
                        用这个：username support@acme.com password SupportBot#2024
                      </button>
                    </div></div>
                  );
                }

                // Chatflow chips (OMS multi-turn conversation)
                if (runAgentMode && chatflowMode) {
                  const activeChatflowChips = runAgentInfo?.name?.includes('OMS') ? omsChatflowChipSets : {};
                  const currentChips = activeChatflowChips[chatflowChipStep];
                  if (chatflowChipStep >= 0 && currentChips) {
                    return (
                      <div className="mb-3"><div className="flex flex-wrap gap-2">
                        {currentChips.map((chip, i) => (
                          <button key={i} onClick={i === 0 ? () => handleChatflowChip() : undefined} className={`${chipStyle}${i > 0 ? ' opacity-60 cursor-default' : ''}`}>
                            {chip}
                          </button>
                        ))}
                      </div></div>
                    );
                  }
                  return null;
                }

                // Config/Param phase chips
                if ((runAgentMode && !chatflowMode) || ((buildFlowChipStep === 5 || buildFlowChipStep === 13) && configPhase)) {
                  const buildConfigChipSets: Record<number, string[]> = {
                    0: [buildFlowChipStep === 13 ? buildAgentChips.step13 : buildAgentChips.step5],
                  };
                  const configChipSets: Record<number, string[]> = {
                    0: [
                      'Tenant 8a2f3b1c-..., client e4d7a9f0-..., mailbox support@acme.com, approvals to sarah@acme.com',
                      'Use my existing Outlook credentials',
                      'I need to set up a new Azure AD app first',
                    ],
                    1: [
                      'Mailbox support@acme.com, approvals to sarah@acme.com',
                      'Let me double-check the tenant ID',
                      'Switch to Gmail instead',
                    ],
                    2: [
                      'Save configuration',
                      'Change the mailbox address',
                      'Add another approver',
                    ],
                  };
                  const paramChipSets: Record<number, string[]> = {
                    0: [
                      'Process unread emails from the last 6 hours, handle complaints and order inquiries',
                      'Just check for new complaints',
                      'Run a full inbox scan',
                    ],
                    1: [
                      'Professional and warm tone, require approval for every reply',
                      'Formal tone, auto-send for order inquiries only',
                      'Skip tone settings, use defaults',
                    ],
                    2: [
                      'Actually, include delivery-status emails too',
                      'Looks good, run it',
                      'Change time range to last 24 hours',
                    ],
                  };
                  const isBuildConfig = (buildFlowChipStep === 5 || buildFlowChipStep === 13) && configPhase;
                  const chipSets = isBuildConfig ? buildConfigChipSets : (configPhase ? configChipSets : paramChipSets);
                  const currentChips = chipSets[scenarioChipStep];
                  if (scenarioChipStep >= 0 && currentChips) {
                    return (
                      <div className="mb-3"><div className="flex flex-wrap gap-2">
                        {currentChips.map((chip, i) => (
                          <button key={i} onClick={i === 0 ? () => handleScenarioChip(chip) : undefined} className={`${chipStyle}${i > 0 ? ' opacity-60 cursor-default' : ''}`}>
                            {chip}
                          </button>
                        ))}
                      </div></div>
                    );
                  }
                  return null;
                }

                // Default quick actions
                if (messages.length > 1 || runAgentMode) {
                  if (runAgentMode) {
                    return (
                      <div className="mb-3"><div className="flex flex-wrap gap-2">
                        <button onClick={() => handleQuickAction('run-agent')} className={chipStyle}>Run Agent</button>
                      </div></div>
                    );
                  }
                  return (
                    <div className="mb-3"><div className="flex flex-wrap gap-2">
                      {[
                        { key: 'overview', label: 'AI Workforce Overview' },
                        { key: 'approvals', label: 'Approval Decisions' },
                        { key: 'health', label: 'Workforce Health Monitor' },
                        { key: 'run-agent', label: 'Run Agent' },
                        { key: 'build-agent', label: 'Build Agent' },
                      ].map((action) => (
                        <button key={action.key} onClick={() => handleQuickAction(action.key)} className={chipStyle}>
                          {action.label}
                        </button>
                      ))}
                    </div></div>
                  );
                }

                return null;
              })()}
              {/* File attachments preview */}
              {attachedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-50 border border-white/10 text-xs text-gray-300">
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className={`relative rounded-2xl border transition-colors ${runAgentMode ? 'bg-indigo-950/40 border-indigo-500/20 focus-within:border-indigo-500/40' : 'bg-dark-50 border-white/10 focus-within:border-white/20'}`}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={runAgentMode ? `Chat with ${runAgentInfo?.name || 'Agent'}...` : "Ask a question"}
                  rows={3}
                  className="w-full px-4 pt-4 pb-12 bg-transparent text-white placeholder-gray-600 focus:outline-none resize-none text-sm"
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <button
                    onClick={handleFileAttach}
                    className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
                    data-tip="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() && attachedFiles.length === 0}
                    className="p-2 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    data-tip="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Draggable divider */}
        {currentA2UI && (
          <div
            onMouseDown={() => setIsDraggingDivider(true)}
            className={`w-1 flex-shrink-0 cursor-col-resize group relative ${isDraggingDivider ? 'bg-indigo-500/40' : 'bg-white/5 hover:bg-indigo-500/30'} transition-colors`}
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>
        )}

        {/* Right: A2UI Panel (conditionally rendered) */}
        {currentA2UI && (
          <div className="bg-dark-100 flex flex-col overflow-hidden" style={{ width: `${rightPanelWidth}%` }}>
            {currentA2UI === 'DEBUG_RUN_VIEW' ? (
              <DebugRunPanel
                agentName="Customer Service Email Assistant"
                agentEmoji="✉️"
                messages={debugSidebarMessages}
                onClose={() => setCurrentA2UI(null)}
              />
            ) : currentA2UI === 'BUILD_AGENT_VIEW' || currentA2UI === 'RUN_LOG_VIEW' ? (
              <div className="flex-1 overflow-hidden flex flex-col">
                {renderA2UIPanel()}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
                  <h2 className="text-base font-semibold text-white">
                    {currentA2UI === 'DASHBOARD_VIEW' ? 'Agent Fleet Dashboard' :
                     currentA2UI === 'APPROVALS_VIEW' ? 'Pending Approvals' :
                     currentA2UI === 'HEALTH_VIEW' ? 'Agent Health Issues' :
                     currentA2UI === 'WHATSAPP_OAUTH_VIEW' ? 'Connect WhatsApp' :
                     currentA2UI === 'RUN_AGENT_VIEW' ? 'Run Agent' :
                     currentA2UI === 'RUN_AGENT_CONFIG_VIEW' ? 'Agent Configuration' :
                     currentA2UI === 'EXEC_LOG_VIEW' ? 'Execution Details' :
                     currentA2UI === 'RUN_DETAILS_VIEW' ? 'Run Details' :
                     currentA2UI.startsWith('TEAM_VIEW:') ? (stewardTeamsData[currentA2UI.replace('TEAM_VIEW:', '')]?.name || 'Team Overview') :
                     'Panel'}
                  </h2>
                  <button
                    onClick={() => setCurrentA2UI(null)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                    title="Collapse panel"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {renderA2UIPanel()}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Steward() {
  return (
    <StewardInner />
  );
}

function formatMessage(content: string) {
  const lines = content.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('**[') && line.includes(']**')) {
      const match = line.match(/\*\*\[([^\]]+)\]\*\*\s*(.+)/);
      if (match) {
        const priority = match[1];
        const rest = match[2];
        const priorityColor =
          priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
          priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
          'bg-indigo/20 text-indigo-300';
        return (
          <span key={i} className="block">
            <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mr-2 ${priorityColor}`}>
              {priority}
            </span>
            <span className="font-medium text-white">{rest}</span>
            {i < lines.length - 1 && '\n'}
          </span>
        );
      }
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <span key={i} className="block font-semibold text-white">
          {line.replace(/\*\*/g, '')}
          {i < lines.length - 1 && '\n'}
        </span>
      );
    }
    if (line.includes('**')) {
      const parts = line.split(/(\*\*[^*]+\*\*)/);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j} className="text-white font-medium">{part.replace(/\*\*/g, '')}</strong>
            ) : (
              part
            )
          )}
          {i < lines.length - 1 && '\n'}
        </span>
      );
    }
    if (line.startsWith('   - ')) {
      return (
        <span key={i} className="block pl-6 text-gray-400">
          {line}
          {i < lines.length - 1 && '\n'}
        </span>
      );
    }
    if (line.startsWith('- ')) {
      return (
        <span key={i} className="block pl-2">
          {line}
          {i < lines.length - 1 && '\n'}
        </span>
      );
    }
    if (line.startsWith('---')) {
      return <span key={i} className="block h-px bg-white/10 my-3" />;
    }
    if (/^\d+\.\s/.test(line)) {
      return (
        <span key={i} className="block">
          {line}
          {i < lines.length - 1 && '\n'}
        </span>
      );
    }
    return (
      <span key={i}>
        {line}
        {i < lines.length - 1 && '\n'}
      </span>
    );
  });
}

function generateResponse(input: string): string {
  const lowerInput = input.toLowerCase();

  // Check for team name mentions
  if (lowerInput.includes('wms inbound') || lowerInput.includes('wms team') || lowerInput.includes('inbound team')) {
    return 'TEAM_VIEW:wms-inbound-team';
  }
  if (lowerInput.includes('recruiting') || lowerInput.includes('recruitment')) {
    return 'TEAM_VIEW:recruiting-team';
  }

  // Check for configuration menu request
  if (lowerInput.includes('i need help with configuration') || 
      (lowerInput.includes('configuration') && !lowerInput.includes('configure'))) {
    return 'CONFIGURATION_OPTIONS';
  }

  // Check for run agent requests
  if (lowerInput.includes('run an agent') || lowerInput.includes('run agent') ||
      lowerInput.includes('execute agent') || lowerInput.includes('start agent')) {
    return 'RUN_AGENT_VIEW';
  }

  // Check for overview/dashboard requests
  if (lowerInput.includes('overview') || lowerInput.includes('dashboard') || 
      lowerInput.includes('fleet') || lowerInput.includes('performance') ||
      lowerInput.includes('status') || lowerInput.includes('metrics') ||
      lowerInput.includes('workforce overview')) {
    return 'DASHBOARD_VIEW';
  }

  // Check for approval requests
  if (lowerInput.includes('approval') || lowerInput.includes('pending') ||
      lowerInput.includes('review') || lowerInput.includes('decision')) {
    return 'APPROVALS_VIEW';
  }

  // Check for health/issue requests
  if (lowerInput.includes('health') || lowerInput.includes('issue') || 
      lowerInput.includes('error') || lowerInput.includes('fix') ||
      lowerInput.includes('problem') || lowerInput.includes('monitoring')) {
    return 'HEALTH_VIEW';
  }

  // Check for WhatsApp / connector configuration requests
  if (lowerInput.includes('whatsapp') || lowerInput.includes('connect whatsapp') ||
      lowerInput.includes('configure whatsapp') ||
      lowerInput.includes('配置whatsapp') || lowerInput.includes('连接whatsapp') ||
      (lowerInput.includes('connect') && lowerInput.includes('oauth')) ||
      (lowerInput.includes('configure') && (lowerInput.includes('messaging') || lowerInput.includes('channel')))) {
    return 'WHATSAPP_OAUTH_VIEW';
  }

  // Check for Slack configuration
  if (lowerInput.includes('slack') || lowerInput.includes('configure slack')) {
    return `**Slack Integration Setup**

Slack integration is available for configuration. Here's what you'll need:

1. **Slack Workspace Admin** access
2. **Bot Token** from your Slack App settings
3. **Signing Secret** for webhook verification

Currently supported features:
- Send notifications to channels
- Receive and respond to direct messages
- Slash command integration

Would you like me to start the Slack OAuth flow, or do you need help setting up a Slack App first?`;
  }

  // Check for Email SMTP configuration
  if (lowerInput.includes('email') || lowerInput.includes('smtp') || lowerInput.includes('configure email')) {
    return `**Email SMTP Configuration**

To set up email notifications for your agents, I'll need the following:

1. **SMTP Server** - e.g., smtp.gmail.com
2. **Port** - typically 587 (TLS) or 465 (SSL)
3. **Authentication** - username and password or OAuth2
4. **Sender Address** - the "from" email address

Would you like to proceed with the SMTP setup wizard?`;
  }

  // Check for API Keys configuration
  if (lowerInput.includes('api key') || lowerInput.includes('configure api')) {
    return `**API Keys Management**

Here are the API keys currently configured for your agents:

- **OpenAI** - ✅ Active (expires in 45 days)
- **Salesforce CRM** - ✅ Active
- **Banking API** - ⚠️ Needs rotation
- **WMS API** - ❌ Not configured

Would you like to rotate an existing key, or add a new API integration?`;
  }

  // Check for cost-related queries
  if (lowerInput.includes('cost') || lowerInput.includes('spending') || 
      lowerInput.includes('budget') || lowerInput.includes('expense')) {
    return `**Monthly Cost Analysis:**

Current month spend: **$1,003.80** of $2,000 budget (50.2%)

**Top 3 Cost Drivers:**
1. Customer Support Agent - $512.30 (51% of total)
2. Data Analyst Pro - $245.80 (24.5%)
3. Financial Reconciliation Bot - $156.20 (15.5%)

**Efficiency Metrics:**
- Cost per task: $1.18 (down 8% from last month)
- ROI estimate: 340% based on manual labor equivalent

Recommendation: Customer Support Agent costs are high but justified by volume (3,892 tasks). Consider reviewing if all ticket types need AI processing.`;
  }

  // Default response
  return `I understand you're asking about "${input}".

I can help you with:
- **AI Workforce Overview** - View comprehensive performance metrics
- **Approval Decisions** - Review and process pending tasks
- **Workforce Health Monitor** - Check and fix agent issues
- **Configuration** - Set up connectors and integrations

What would you like me to focus on?`;
}

function generateFixNowResponse(agent: string, issue: string): string {
  const lowerAgent = agent.toLowerCase();
  const lowerIssue = issue.toLowerCase();

  if (lowerAgent.includes('financial') || lowerIssue.includes('banking api') || lowerIssue.includes('timeout')) {
    return `I've checked **${agent}** and found the Banking API credentials expired 2 hours ago. Here's what I need to fix this:

1. **Rotate API credentials** — I can generate a new key pair from the Banking API portal. Should I proceed?
2. **Update rate limit config** — Current limit is 100 req/min, but the agent was hitting 150. I recommend increasing to 200.

Please confirm and I'll apply the changes. Alternatively, paste your new API key here and I'll update the connector settings directly.`;
  }

  if (lowerAgent.includes('invoice') || lowerIssue.includes('pdf')) {
    return `I've analyzed the **${agent}** failure logs. The upstream PDF template changed from v2.1 to v3.0 format, which broke the parser.

To fix this, I need to:
1. **Update the PDF parser module** to support the new template schema
2. **Re-process the 12 failed invoices** from the last hour

Should I deploy the parser update now? The fix will take about 2 minutes to propagate.`;
  }

  if (lowerAgent.includes('customer support') || lowerIssue.includes('response time') || lowerIssue.includes('crm')) {
    return `I've traced the latency spike in **${agent}** to the Salesforce CRM connector. The CRM API is responding in 8.5s instead of the usual 0.3s.

Recommended actions:
1. **Enable response caching** for non-critical ticket lookups (reduces CRM calls by ~60%)
2. **Increase timeout threshold** from 5s to 15s to prevent cascading failures

Want me to enable caching now? I can also temporarily route low-priority tickets to skip CRM lookup entirely.`;
  }

  if (lowerAgent.includes('email campaign') || lowerIssue.includes('bounce')) {
    return `I've reviewed the **${agent}** bounce report. Found 847 invalid email addresses in the batch imported yesterday from the marketing CSV.

To resolve this:
1. **Quarantine invalid entries** — I'll move them to a review queue
2. **Run email validation** on the remaining 3,200 addresses before next send

Should I start the cleanup now? I can also set up automatic validation for future imports.`;
  }

  if (lowerAgent.includes('data sync') || lowerIssue.includes('sync delay')) {
    return `The **${agent}** sync delay is caused by heavy load on the source database (CPU at 94%).

I can fix this by:
1. **Switch to read replica** — Route sync queries to the secondary DB instance
2. **Reschedule to off-peak** — Move the sync window to 2:00-4:00 AM

Which approach do you prefer? Switching to the read replica can be done immediately with zero downtime.`;
  }

  if (lowerAgent.includes('wms') || lowerIssue.includes('missing') || lowerIssue.includes('config')) {
    return `**${agent}** needs the following configuration to activate:

1. **WMS API Key** — You can find this in your WMS provider dashboard under Settings > API Access
2. **Warehouse ID** — The unique identifier for your primary warehouse (e.g., WH-001)
3. **Notification Channel** — Select Slack, Email, or WhatsApp for alerts

Would you like to enter these now, or should I open the configuration wizard?`;
  }

  if (lowerAgent.includes('hr') || lowerAgent.includes('onboarding') || lowerIssue.includes('ldap')) {
    return `**${agent}** requires two integrations to get started:

1. **LDAP Credentials** — Server URL, bind DN, and password for your Active Directory
2. **Slack Webhook** — Create an incoming webhook in your Slack workspace for onboarding notifications

I can guide you through each step. Which one would you like to set up first?`;
  }

  return `I'm looking into **${agent}** now. The issue appears to be: ${issue}

I'll need a few details to proceed with the fix. Could you confirm which environment this agent is running in (production/staging)?`;
}
