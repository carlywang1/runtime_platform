import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, TrendingUp, TrendingDown, Activity, CheckCircle, AlertTriangle, Zap, XCircle, Clock, AlertCircle, Settings, Paperclip, Smartphone, QrCode, Shield, RefreshCw, CheckCircle2, ExternalLink, Users } from 'lucide-react';
import Header from '../components/layout/Header';
import TeamCollaborationCanvas from '../components/TeamCollaborationCanvas';
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
    issue: 'Banking API connection timeout (started 2 hours ago)',
    details: ['Frequency: 8 failed connection attempts', 'Auto-recovery: Attempted twice, unsuccessful', 'Root cause: API credentials may have expired or rate limit exceeded'],
    recommendation: 'Rotate API credentials in Connectors settings',
  },
  {
    id: '2',
    agent: 'Customer Support Agent',
    status: 'warning',
    issue: 'Response time increased 340% in last hour',
    details: ['Current avg: 12.3s (normal: 2.8s)', 'Cause: Salesforce CRM connector experiencing high latency'],
    recommendation: 'Temporarily disable CRM lookup for non-critical tickets',
  },
  {
    id: '3',
    agent: 'WMS Inventory Manager',
    status: 'config',
    issue: 'Cannot activate - missing required configuration',
    details: ['Missing: WMS API Key, Warehouse ID, Notification Channel'],
    recommendation: 'Complete setup in agent configuration to activate',
  },
];

const initialConversation: ChatMessage[] = [
  {
    id: '1',
    role: 'steward',
    content: `Hello! I'm your Agent Steward, here to help you manage and optimize your AI agent fleet.

I can assist you with:

**📊 AI Workforce Overview** - Get a comprehensive dashboard of your team's performance, costs, and key metrics

**✅ Approval Decisions** - Review and process pending tasks that require your approval, with intelligent recommendations

**🔧 Workforce Health Monitor** - Identify and fix issues affecting your agents' performance

**⚙️ Configuration** - I can help you set up OAuth connections, channel integrations, and more

What would you like to explore first?`,
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{team.name}</h2>
          <p className="text-sm text-gray-500">Team collaboration & pending approvals</p>
        </div>
        <Users className="w-8 h-8 text-indigo-400" />
      </div>

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

function ApprovalsWidget() {
  const priorityConfig = {
    CRITICAL: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
    HIGH: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    MEDIUM: { bg: 'bg-indigo/20', text: 'text-indigo-400', border: 'border-indigo/30' },
    LOW: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Pending Approvals</h2>
          <p className="text-sm text-gray-500">Sorted by priority • {pendingApprovals.length} items</p>
        </div>
        <Clock className="w-8 h-8 text-amber-400" />
      </div>

      <div className="space-y-4">
        {pendingApprovals.map((item) => {
          const priority = priorityConfig[item.priority];
          return (
            <div key={item.id} className="bg-dark-50 rounded-2xl border border-white/5 p-5 hover:bg-black/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${priority.bg} ${priority.text}`}>
                  {item.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white text-base">{item.agent}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-300">{item.action}</span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {item.details.map((detail, i) => (
                      <p key={i} className="text-sm text-gray-400">{detail}</p>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-black/60">
                    <span className={`text-sm font-medium ${
                      item.recommendationType === 'approve' ? 'text-emerald-400' :
                      item.recommendationType === 'flag' ? 'text-amber-400' : 'text-indigo-400'
                    }`}>
                      💡 {item.recommendationType === 'approve' ? 'Recommended: Approve' :
                       item.recommendationType === 'flag' ? 'Recommended: Approve with flag' : 'Recommended: Review first'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                    Approve
                  </button>
                  <button className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">
                    Review
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full py-4 rounded-xl text-base font-semibold bg-indigo/20 text-indigo-400 hover:bg-indigo/30 transition-colors border border-indigo/30">
        Process All Recommendations
      </button>
    </div>
  );
}

function HealthIssuesWidget() {
  const statusConfig = {
    error: { icon: XCircle, bg: 'bg-rose-500/20', text: 'text-rose-400', label: 'ERROR' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'WARNING' },
    config: { icon: Settings, bg: 'bg-indigo/20', text: 'text-indigo-400', label: 'CONFIG NEEDED' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Agent Health Issues</h2>
          <p className="text-sm text-gray-500">Requires attention • {healthIssues.length} issues</p>
        </div>
        <AlertCircle className="w-8 h-8 text-rose-400" />
      </div>

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
                <button className="px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo/20 text-indigo-400 hover:bg-indigo/30 transition-colors flex-shrink-0">
                  Fix Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full py-4 rounded-xl text-base font-semibold bg-indigo/20 text-indigo-400 hover:bg-indigo/30 transition-colors border border-indigo/30">
        Apply All Recommended Fixes
      </button>
    </div>
  );
}

function DashboardWidget() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Agent Fleet Dashboard</h2>
          <p className="text-sm text-gray-500">Real-time performance overview</p>
        </div>
        <Activity className="w-8 h-8 text-indigo-400" />
      </div>

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Connect WhatsApp</h2>
          <p className="text-sm text-gray-500">OAuth Configuration • WhatsApp Business API</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

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

export default function Steward() {
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>(initialConversation);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentA2UI, setCurrentA2UI] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      setIsTyping(true);

      // Generate Steward response after a delay
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
  }, [location.state]);

  // Update A2UI when messages change
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'steward') {
      const content = lastMessage.content;
      if (content === 'DASHBOARD_VIEW' || content === 'APPROVALS_VIEW' || content === 'HEALTH_VIEW' || content === 'WHATSAPP_OAUTH_VIEW' || content.startsWith('TEAM_VIEW:')) {
        setCurrentA2UI(content);
      } else if (content === 'CONFIGURATION_OPTIONS') {
        setCurrentA2UI(null);
      } else if (!content.includes('VIEW')) {
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

  const handleQuickAction = (action: string) => {
    let userMessage = '';
    switch (action) {
      case 'overview':
        userMessage = 'Show me the AI workforce overview';
        break;
      case 'approvals':
        userMessage = 'Show me pending approvals';
        break;
      case 'health':
        userMessage = 'Check workforce health';
        break;
      case 'configuration':
        userMessage = 'I need help with configuration';
        break;
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

  const renderMessageContent = (message: ChatMessage) => {
    // For A2UI views, only show the text description in chat
    if (message.content === 'DASHBOARD_VIEW') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300">Here's a comprehensive overview of your agent fleet performance. Check the right panel for details.</p>
          <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>
        </div>
      );
    }

    if (message.content === 'APPROVALS_VIEW') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300">I've analyzed all pending tasks and prioritized them by urgency and business impact. Review them in the right panel.</p>
          <p className="text-sm text-gray-300 mt-2">Would you like me to process these approvals based on my recommendations?</p>
          <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>
        </div>
      );
    }

    if (message.content === 'HEALTH_VIEW') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300">I've detected some anomalies in your agent fleet that require attention. See the details in the right panel.</p>
          <p className="text-sm text-gray-300 mt-2">Should I proceed with the recommended fixes?</p>
          <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>
        </div>
      );
    }

    if (message.content === 'WHATSAPP_OAUTH_VIEW') {
      return (
        <div className="w-full">
          <p className="text-sm text-gray-300">好的，我来帮你配置 WhatsApp Business API。我已经在右侧面板启动了 OAuth 授权流程，请用手机扫描二维码完成连接。</p>
          <p className="text-sm text-gray-300 mt-2">连接成功后，你的 Agent 就可以通过 WhatsApp 发送和接收消息了。</p>
          <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>
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
            <p className="text-xs text-gray-500 mt-3">{message.timestamp}</p>
          </div>
        );
      }

      return (
        <div className="w-full">
          <p className="text-sm text-gray-300">Here's the overview for <strong className="text-white font-medium">{teamName}</strong>. Check the right panel for details.</p>
          <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>
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
          <p className="text-xs text-gray-500 mt-3">{message.timestamp}</p>
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
          <p className="text-xs text-gray-500 mt-3">{message.timestamp}</p>
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
        <p
          className={`text-xs mt-2 ${
            message.role === 'user' ? 'text-gray-500' : 'text-gray-600'
          }`}
        >
          {message.timestamp}
        </p>
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
        return <ApprovalsWidget />;
      case 'HEALTH_VIEW':
        return <HealthIssuesWidget />;
      case 'WHATSAPP_OAUTH_VIEW':
        return <WhatsAppOAuthWidget stage="qr" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Agent Steward"/>

      <div className="flex-1 flex">
        {/* Left: Chat Area */}
        <div className={`flex flex-col transition-all duration-300 ${currentA2UI ? 'w-[45%]' : 'w-full'}`}>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${message.role === 'user' ? 'flex justify-end' : ''}`}
                >
                  <div className={`${message.role === 'user' ? 'max-w-2xl' : 'max-w-3xl'}`}>
                    {renderMessageContent(message)}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1 px-4 py-3">
                  <span className="w-2 h-2 bg-indigo rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-indigo rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-indigo rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-white/5">
            <div className="max-w-4xl mx-auto">
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
          <div className="w-[55%] border-l border-white/5 bg-dark-100 overflow-y-auto">
            <div className="p-6">
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
