import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, TrendingUp, TrendingDown, Activity, CheckCircle, AlertTriangle, Zap, XCircle, Clock, AlertCircle, Settings, Paperclip, Smartphone, QrCode, Shield, RefreshCw, CheckCircle2, ExternalLink, Users, ChevronDown, ChevronUp, Rocket, Wrench, Play, Pause, Code, Trash2 } from 'lucide-react';
import Header from '../components/layout/Header';
import TeamCollaborationCanvas from '../components/TeamCollaborationCanvas';
import { ParamConfirmCard, ExecLogCard, ResultCard, TypingIndicator } from '../components/runAgent/ScenarioCards';
import ConfigPanel from '../components/runAgent/ConfigPanel';
import RunDetailsPanel from '../components/runAgent/RunDetailsPanel';
import PanelCard from '../components/PanelCard';
import { scenario1Messages, scenario1PanelParams, scenario1PanelParamsFilled, scenario1AgentFiles, agentFileContents, configScenarioMessages, configFields, configFieldsFilled } from '../data/runAgentScenarios';
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

const runAgentTeams = [
  {
    id: 'team-1',
    name: 'OMS Agent for Multichannel Orders and Inventory and Fulfillment v1',
    description: 'Unified single-agent OMS/DI operator for Shopify-first multichannel orders, inventory sync, and fulfillment orchestration',
    status: 'inactive' as const,
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

function RunAgentWidget({ onRun }: { onRun?: (teamName: string, emoji: string, version: string, status: string) => void }) {
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
                  onClick={() => onRun?.(team.name, team.agents[0]?.emoji || '🤖', team.version, team.status)}
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

export default function Steward() {
  const location = useLocation();
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
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [confirmedCardId, setConfirmedCardId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    // s1-12: exec-log card
    setTimeout(() => setVisibleScenarioCount(13), 3500);
    // s1-13: result card — wait for log animation to finish
    setTimeout(() => setVisibleScenarioCount(14), 7500);
  }, []);

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

  // Config complete → transition to param collection
  const handleConfigComplete = useCallback(() => {
    setConfigPhase(false);
    setVisibleConfigCount(configScenarioMessages.length); // freeze config messages
    setCurrentA2UI(null); // close config sidebar
    setVisibleScenarioCount(1);

    const paramTimers: ReturnType<typeof setTimeout>[] = [];
    // s1-1 ~ s1-3 (partial card) — 6s delay so user can click Edit on s1-0
    paramTimers.push(setTimeout(() => setVisibleScenarioCount(4), 6000));
    // s1-4 ~ s1-6 (complete card)
    paramTimers.push(setTimeout(() => setVisibleScenarioCount(7), 9000));
    // s1-7 ~ s1-9 (correction card)
    paramTimers.push(setTimeout(() => setVisibleScenarioCount(10), 12000));
    runAgentFlowTimers.current.push(...paramTimers);
  }, []);

  const startRunAgentFlow = useCallback(() => {
    const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timers: ReturnType<typeof setTimeout>[] = [];

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

    // Step 1 (1.5s): steward asks about scenario + open RunAgentWidget
    timers.push(setTimeout(() => {
      const stewardMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'steward',
        content: 'RUN_AGENT_INQUIRY',
        timestamp: now(),
      };
      setMessages((prev) => [...prev, stewardMsg]);
      setIsTyping(false);
      setCurrentA2UI('RUN_AGENT_VIEW');
    }, 1500));

    // Step 2 (4s): user describes their need
    timers.push(setTimeout(() => {
      const userDesc: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'user',
        content: 'I need to process Shopify orders and sync inventory',
        timestamp: now(),
      };
      setMessages((prev) => [...prev, userDesc]);
      setTypingStatus('Matching your request to available agents...');
      setIsTyping(true);
    }, 4000));

    // Step 3 (6.5s): steward recommends agent
    timers.push(setTimeout(() => {
      const recommendMsg: ChatMessage = {
        id: (Date.now() + 3).toString(),
        role: 'steward',
        content: 'RUN_AGENT_RECOMMEND',
        timestamp: now(),
      };
      setMessages((prev) => [...prev, recommendMsg]);
      setIsTyping(false);
    }, 6500));

    // Step 4 (9s): user confirms "Yes, let's set it up"
    timers.push(setTimeout(() => {
      const userConfirm: ChatMessage = {
        id: (Date.now() + 4).toString(),
        role: 'user',
        content: 'Yes, let\'s set it up',
        timestamp: now(),
      };
      setMessages((prev) => [...prev, userConfirm]);
      setTypingStatus('Setting up agent...');
      setIsTyping(true);
    }, 9000));

    // Step 5 (11s): enter runAgentMode → config phase first, then param collection
    timers.push(setTimeout(() => {
      setIsTyping(false);
      setRunAgentMode(true);
      setRunAgentInfo({ name: 'OMS Agent for Multichannel Orders and Inventory and Fulfillment v1', emoji: '🛒', version: 'v7', status: 'config_required' });

      // Start with config phase
      setConfigPhase(true);
      setConfigParams(configFields.map((f) => ({ ...f })));
      setVisibleConfigCount(1);
      setVisibleScenarioCount(0);
      // No sidebar during collection

      const allTimers: ReturnType<typeof setTimeout>[] = [];

      // Config Round 1: show c1-1 ~ c1-3
      allTimers.push(setTimeout(() => setVisibleConfigCount(4), 1500));

      // Config Round 2: show c1-4 ~ c1-6 (confirm card) → open sidebar with filled config
      allTimers.push(setTimeout(() => setVisibleConfigCount(7), 4500));

      // Config confirm → set confirmed on c1-6, show user message c1-7
      allTimers.push(setTimeout(() => {
        setConfirmedCardId('c1-6');
        setVisibleConfigCount(8); // c1-0 ~ c1-7 (user confirm message)
      }, 8000));

      // Config done → show c1-8 transition message → switch to param phase
      allTimers.push(setTimeout(() => {
        setVisibleConfigCount(configScenarioMessages.length);
        setConfigPhase(false);
        setCurrentA2UI(null); // close config sidebar
        setVisibleScenarioCount(1);
      }, 10000));

      // Param Round 1: show s1-1 ~ s1-3 (partial card) — 6s delay so user can click Edit on s1-0
      allTimers.push(setTimeout(() => setVisibleScenarioCount(4), 16000));

      // Param Round 2: show s1-4 ~ s1-6 (complete card)
      allTimers.push(setTimeout(() => setVisibleScenarioCount(7), 19000));

      // Param Round 3 (correction): show s1-7 ~ s1-9
      allTimers.push(setTimeout(() => setVisibleScenarioCount(10), 22000));

      runAgentFlowTimers.current.push(...allTimers);
    }, 11000));

    runAgentFlowTimers.current = timers;
  }, []);

  const runAgentFlowTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => runAgentFlowTimers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, visibleScenarioCount]);

  // Handle incoming message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      const { message, agentName } = location.state as { message: string; agentName: string };
      
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setTypingStatus('Diagnosing agent issue...');
      setIsTyping(true);
      setTimeout(() => {
        const stewardResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'steward',
          content: `I'll help you fix the error for **${agentName}**.

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

      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }

    // Handle Run Agent navigation from Teams page
    if (location.state?.runAgent) {
      const { agentName, agentEmoji, agentVersion } = location.state as {
        runAgent: boolean;
        agentName: string;
        agentEmoji: string;
        agentVersion: string;
      };
      setRunAgentMode(true);
      setRunAgentInfo({ name: agentName, emoji: agentEmoji, version: agentVersion });
      setScenarioParams(scenario1PanelParams.map((p) => ({ ...p })));
      // Auto-advance conversation in three rounds
      const timers: ReturnType<typeof setTimeout>[] = [];

      // Round 1: show s1-1 ~ s1-3 (partial card)
      timers.push(setTimeout(() => setVisibleScenarioCount(4), 1500));

      // Round 2: show s1-4 ~ s1-6 (complete card)
      timers.push(setTimeout(() => setVisibleScenarioCount(7), 4500));

      // Round 3 (correction): show s1-7 ~ s1-9
      timers.push(setTimeout(() => setVisibleScenarioCount(10), 7500));

      window.history.replaceState({}, document.title);
      return () => timers.forEach(clearTimeout);
    }
  }, [location.state]);

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
      } else if (!content.includes('VIEW') && currentA2UIRef.current !== 'APPROVALS_VIEW' && currentA2UIRef.current !== 'HEALTH_VIEW') {
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
      setConfigParams(configFields.map((f) => ({ ...f })));
      setConfigHighlightFields([]);
      setCurrentA2UI(null);
      setPanelEditing(false);
      setSkippedIds(new Set());
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
          <p className="text-sm text-gray-300 mt-2.5 leading-relaxed">Want me to set it up?</p>
          {false && <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>}
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
        <div className={`text-sm whitespace-pre-wrap leading-relaxed ${
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
              if (msg.id.startsWith('c1')) handleConfigComplete();
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
        {card?.type === 'exec-log' && <ExecLogCard lines={card.lines || []} progress={card.progress || 0} done={card.done || false} onViewDetails={() => {
          setCurrentA2UI('RUN_DETAILS_VIEW');
        }} />}
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
      case 'RUN_AGENT_VIEW':
        return <RunAgentWidget onRun={(name, emoji, version, status) => {
          setRunAgentMode(true);
          setRunAgentInfo({ name, emoji, version, status });

          if (status === 'config_required') {
            // Config phase first — no sidebar during collection
            setConfigPhase(true);
            setConfigParams(configFields.map((f) => ({ ...f })));
            setVisibleConfigCount(1);
            setVisibleScenarioCount(0);

            const cfgTimers: ReturnType<typeof setTimeout>[] = [];
            cfgTimers.push(setTimeout(() => setVisibleConfigCount(4), 1500));
            cfgTimers.push(setTimeout(() => setVisibleConfigCount(7), 4500));
            // Config confirm → set confirmed on c1-6, show user message c1-7
            cfgTimers.push(setTimeout(() => {
              setConfirmedCardId('c1-6');
              setVisibleConfigCount(8);
            }, 8000));
            // Config done → show c1-8 transition message → switch to param phase
            cfgTimers.push(setTimeout(() => {
              setVisibleConfigCount(configScenarioMessages.length);
              setConfigPhase(false);
              setCurrentA2UI(null);
              setVisibleScenarioCount(1);

              const paramTimers: ReturnType<typeof setTimeout>[] = [];
              paramTimers.push(setTimeout(() => setVisibleScenarioCount(4), 6000));
              paramTimers.push(setTimeout(() => setVisibleScenarioCount(7), 9000));
              paramTimers.push(setTimeout(() => setVisibleScenarioCount(10), 12000));
              runAgentFlowTimers.current.push(...paramTimers);
            }, 10000));
            runAgentFlowTimers.current.push(...cfgTimers);
          } else {
            // Already configured — param collection only, no sidebar
            setVisibleScenarioCount(1);

            const paramTimers: ReturnType<typeof setTimeout>[] = [];
            paramTimers.push(setTimeout(() => setVisibleScenarioCount(4), 6000));
            paramTimers.push(setTimeout(() => setVisibleScenarioCount(7), 9000));
            paramTimers.push(setTimeout(() => setVisibleScenarioCount(10), 12000));
            runAgentFlowTimers.current.push(...paramTimers);
          }
        }} />;
      case 'EXEC_LOG_VIEW':
        return <ExecLogDetailPanel scenarioParams={scenarioParams} />;
      case 'RUN_DETAILS_VIEW':
        return (
          <RunDetailsPanel
            agentName={runAgentInfo?.name || 'OMS Agent v7'}
            agentDescription="Multichannel order processing with inventory sync and fulfillment routing"
            params={scenario1PanelParamsFilled}
            agentFiles={scenario1AgentFiles}
            fileContents={agentFileContents}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header title="Agent Steward"/>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Chat Area */}
        <div className={`flex flex-col overflow-hidden min-h-0 transition-all duration-300 ${currentA2UI ? 'w-[65%]' : 'w-full'}`}>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {runAgentMode ? (
                <>
                  {/* Render prior chat history (e.g. scene inquiry from Quick Action flow) */}
                  {messages.length > 1 ? (
                    messages.map((message) => (
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
                        <div className="text-sm text-white">Run {runAgentInfo?.name || 'OMS Agent'}</div>
                        <p className="text-xs mt-2 text-gray-500">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  )}
                  {/* Config phase messages (if any) */}
                  {visibleConfigCount > 0 && (() => {
                    const visibleMsgs = configScenarioMessages.slice(0, visibleConfigCount).filter((m) => !skippedIds.has(m.id));
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
                  {/* Param collection messages (after config phase) */}
                  {!configPhase && (() => {
                    const visibleMsgs = scenario1Messages.slice(0, visibleScenarioCount).filter((m) => !skippedIds.has(m.id));
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
                      <div className={`${message.role === 'user' ? 'max-w-2xl rounded-2xl px-4 py-2.5' : 'max-w-3xl'}`} style={message.role === 'user' ? { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' } : undefined}>
                        {renderMessageContent(message)}
                      </div>
                    </div>
                  ))}
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

          <div className="px-6 py-4 border-t border-white/5">
            <div className="max-w-4xl mx-auto">
              {/* Quick Actions Bar */}
              {(messages.length > 1 || runAgentMode) && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      // In runAgentMode: show chips from the last visible steward message
                      if (runAgentMode) {
                        const visibleScenario = !configPhase
                          ? scenario1Messages.slice(0, visibleScenarioCount).filter((m) => !skippedIds.has(m.id))
                          : [];
                        const visibleConfig = visibleConfigCount > 0
                          ? configScenarioMessages.slice(0, visibleConfigCount).filter((m) => !skippedIds.has(m.id))
                          : [];
                        const allVisible = [...visibleConfig, ...visibleScenario];
                        const lastSteward = [...allVisible].reverse().find((m) => m.role === 'steward' && m.chips !== undefined);
                        const chips = lastSteward?.chips || [];
                        return chips.map((chip) => (
                          <button
                            key={chip}
                            onClick={() => {
                              const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chip, timestamp: now };
                              setPostMessages((prev) => [...prev, userMsg]);
                              // Handle special chip actions
                              if (chip === 'View run details') setCurrentA2UI('RUN_DETAILS_VIEW');
                              // Mock steward replies for result chips
                              const mockReplies: Record<string, string> = {
                                'Run again with same parameters': 'Got it! Starting **OMS Agent v7** with the same parameters. Initializing execution environment...',
                                'Run again with different parameters': 'Sure! Which parameters would you like to change for **OMS Agent v7**? You can tell me the specific values or I can show you the full parameter list.',
                                'Run a different agent': 'Of course! Which agent would you like to run? Here are some available agents:\n\n• **OMS Agent v7** — Order management\n• **Inventory Sync Agent** — Stock synchronization\n• **Payment Reconciler** — Transaction matching\n\nJust let me know which one you\'d like to start.',
                              };
                              if (mockReplies[chip]) {
                                setTimeout(() => {
                                  const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                  setPostMessages((prev) => [...prev, { id: Date.now().toString(), role: 'steward', content: mockReplies[chip], timestamp: replyTime }]);
                                }, 1200);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-400 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:text-gray-200 transition-all"
                          >
                            {chip}
                          </button>
                        ));
                      }
                      // Default: static chips
                      return [
                        { key: 'overview', label: 'AI Workforce Overview' },
                        { key: 'approvals', label: 'Approval Decisions' },
                        { key: 'health', label: 'Workforce Health Monitor' },
                        { key: 'run-agent', label: 'Run Agent' },
                      ].map((action) => (
                        <button
                          key={action.key}
                          onClick={() => handleQuickAction(action.key)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-400 bg-white/[0.03] border border-white/[0.06] hoer-white/[0.12] hover:text-gray-200 transition-all"
                        >
                          {action.label}
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              )}
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
              
              <div className="relative bg-dark-50 rounded-2xl border border-white/10 focus-within:border-white/20 transition-colors">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask a question"
                  rows={3}
                  className="w-full px-4 pt-4 pb-12 bg-transparent text-white placeholder-gray-600 focus:outline-none resize-none"
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

        {/* Right: A2UI Panel (conditionally rendered) */}
        {currentA2UI && (
          <div className="w-[35%] border-l border-white/5 bg-dark-100 flex flex-col overflow-hidden">
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
            <div className={`flex-1 overflow-y-auto p-6`}>
              {renderA2UIPanel()}
            </div>
          </div>
        )}
      </div>
    </div>
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
