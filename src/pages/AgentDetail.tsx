import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Settings2,
  Zap,
  ListTodo,
  Save,
  BookOpen,
  Github,
  Mail,
  MessageSquare,
  Database,
  TrendingUp,
  Calendar,
  Activity,
  BarChart3,
  Coins,
  CalendarDays,
  ShieldCheck,
  Users,
  Plus,
  Bot,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { agents, traces } from '../data/mockData';
import type { AgentStatus } from '../types';

const statusConfig: Record<AgentStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  active: { label: 'Running', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', dotColor: 'bg-emerald-400' },
  inactive: { label: 'Inactive', color: 'text-gray-400', bgColor: 'bg-gray-500/20', dotColor: 'bg-gray-400' },
  config_required: { label: 'Config Required', color: 'text-amber-400', bgColor: 'bg-amber-500/20', dotColor: 'bg-amber-400' },
  error: { label: 'Error', color: 'text-rose-400', bgColor: 'bg-rose-500/20', dotColor: 'bg-rose-400' },
};

type TabId = 'overview' | 'approval_policy' | 'config' | 'skills' | 'team' | 'tasks' | 'metrics';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Eye;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'approval_policy', label: 'Approval Policy', icon: ShieldCheck },
  { id: 'config', label: 'Config', icon: Settings2 },
  { id: 'skills', label: 'Skills', icon: Zap },
  { id: 'team', label: 'Team Collaboration', icon: Users },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
];

const mockTasks = [
  { id: 'JOB-001', agent: 'DataAnalyzer Pro', name: 'Process quarterly sales data', status: 'completed', duration: '2m 34s', timestamp: '2026-03-14 09:15:42', credits: 125 },
  { id: 'JOB-002', agent: 'TaskScheduler', name: 'Schedule backup processes', status: 'in_progress', duration: '1m 12s', timestamp: '2026-03-14 09:14:30', credits: 420 },
  { id: 'JOB-003', agent: 'NotificationBot', name: 'Send daily summary emails', status: 'completed', duration: '45s', timestamp: '2026-03-14 09:13:15', credits: 180 },
  { id: 'JOB-004', agent: 'DataAnalyzer Pro', name: 'Generate customer insights', status: 'failed', duration: '5m 22s', timestamp: '2026-03-14 09:12:03', credits: 284 },
  { id: 'JOB-005', agent: 'TaskScheduler', name: 'Clean temporary files', status: 'pending_approval', duration: '--', timestamp: '2026-03-14 09:11:47', credits: 0 },
  { id: 'JOB-006', agent: 'NotificationBot', name: 'Alert system administrators', status: 'completed', duration: '12s', timestamp: '2026-03-14 09:10:35', credits: 150 },
  { id: 'JOB-007', agent: 'DataAnalyzer Pro', name: 'Process inventory updates', status: 'in_progress', duration: '3m 45s', timestamp: '2026-03-14 09:09:18', credits: 152 },
  { id: 'JOB-008', agent: 'TaskScheduler', name: 'Update database indexes', status: 'completed', duration: '8m 15s', timestamp: '2026-03-14 09:08:22', credits: 321 },
  { id: 'JOB-009', agent: 'NotificationBot', name: 'Process webhook notifications', status: 'failed', duration: '1m 5s', timestamp: '2026-03-14 09:07:55', credits: 370 },
  { id: 'JOB-010', agent: 'DataAnalyzer Pro', name: 'Generate monthly reports', status: 'pending_approval', duration: '--', timestamp: '2026-03-14 09:07:12', credits: 0 },
];

const mockSkills = [
  { name: 'Ticket Classification', description: 'Automatically classify incoming tickets by priority, type, and department' },
  { name: 'Sentiment Analysis', description: 'Analyze customer sentiment in messages and interactions' },
  { name: 'Auto Response', description: 'Generate contextual, personalized responses to customer inquiries' },
  { name: 'Knowledge Search', description: 'Search and retrieve relevant information from knowledge bases' },
  { name: 'Escalation Detection', description: 'Identify when issues need to be escalated to human agents' },
];

const mockKnowledgeBases = [
  { name: 'Customer Support KB', status: 'connected', entries: 1250 },
  { name: 'Product Documentation', status: 'connected', entries: 890 },
  { name: 'FAQ Database', status: 'connected', entries: 450 },
];

const mockDataConnections = [
  { name: 'Gmail', icon: Mail, status: 'connected', account: 'support@company.com' },
  { name: 'Slack', icon: MessageSquare, status: 'connected', account: '#support-channel' },
  { name: 'Database', icon: Database, status: 'connected', account: 'PostgreSQL - Production' },
];

const mockGitHubRepos = [
  { name: 'company/support-agent', branch: 'main', lastSync: '2 hours ago' },
];

const mockApprovalPolicies = [
  { id: '1', action: 'Execute Database Query', requiresApproval: true, approvers: ['Admin', 'DBA'], riskLevel: 'high' },
  { id: '2', action: 'Process Refunds', requiresApproval: true, approvers: ['Finance Team'], riskLevel: 'high', threshold: '$100+' },
  { id: '3', action: 'Send Customer Emails', requiresApproval: false, approvers: [], riskLevel: 'low' },
  { id: '4', action: 'Update CRM Records', requiresApproval: false, approvers: [], riskLevel: 'medium' },
  { id: '5', action: 'Create Support Tickets', requiresApproval: false, approvers: [], riskLevel: 'low' },
  { id: '6', action: 'Access Sensitive Data', requiresApproval: true, approvers: ['Security Team', 'Admin'], riskLevel: 'critical' },
  { id: '7', action: 'Modify System Settings', requiresApproval: true, approvers: ['Admin'], riskLevel: 'critical' },
  { id: '8', action: 'Generate Reports', requiresApproval: false, approvers: [], riskLevel: 'low' },
];

const mockTeamCollaborations = [
  {
    id: 'team-1',
    name: 'Customer Success Pipeline',
    description: 'End-to-end customer support workflow',
    type: 'workflow',
    agents: [
      { id: 'a1', name: 'Ticket Router', role: 'Entry Point', color: 'bg-cyan-500' },
      { id: 'current', name: 'Customer Support Agent', role: 'Primary Handler', color: 'bg-indigo' },
      { id: 'a3', name: 'Sentiment Analyzer', role: 'Analysis', color: 'bg-emerald-500' },
      { id: 'a4', name: 'Knowledge Bot', role: 'Information', color: 'bg-amber-500' },
    ],
    connections: [
      { from: 'a1', to: 'current' },
      { from: 'current', to: 'a3' },
      { from: 'a3', to: 'a4' },
    ],
  },
  {
    id: 'team-2',
    name: 'Sales Intelligence Team',
    description: 'Manager-orchestrated sales support',
    type: 'manager',
    agents: [
      { id: 'current', name: 'Sales Manager', role: 'Manager', color: 'bg-indigo' },
      { id: 'b1', name: 'Lead Scorer', role: 'Specialist', color: 'bg-emerald-500' },
      { id: 'b2', name: 'Data Enrichment', role: 'Specialist', color: 'bg-cyan-500' },
      { id: 'b3', name: 'CRM Sync', role: 'Specialist', color: 'bg-amber-500' },
    ],
    connections: [
      { from: 'current', to: 'b1' },
      { from: 'current', to: 'b2' },
      { from: 'current', to: 'b3' },
    ],
  },
];

const taskStatusConfig = {
  completed: { label: 'Completed', bgColor: 'bg-emerald-500/20', color: 'text-emerald-400' },
  in_progress: { label: 'Running', bgColor: 'bg-indigo/20', color: 'text-indigo-400' },
  failed: { label: 'Failed', bgColor: 'bg-rose-500/20', color: 'text-rose-400' },
  pending: { label: 'Queued', bgColor: 'bg-amber-500/20', color: 'text-amber-400' },
  pending_approval: { label: 'Pending Approval', bgColor: 'bg-purple-500/20', color: 'text-purple-400' },
};

type DateRange = '7d' | '30d' | 'custom';

const mockCreditsData = {
  '7d': {
    total: 245.80,
    daily: [
      { date: 'Mar 10', credits: 32.5 },
      { date: 'Mar 11', credits: 41.2 },
      { date: 'Mar 12', credits: 28.9 },
      { date: 'Mar 13', credits: 35.7 },
      { date: 'Mar 14', credits: 45.3 },
      { date: 'Mar 15', credits: 38.1 },
      { date: 'Mar 16', credits: 24.1 },
    ],
    byCategory: [
      { name: 'Data Processing', credits: 98.2, percentage: 40 },
      { name: 'API Calls', credits: 61.5, percentage: 25 },
      { name: 'Model Inference', credits: 49.2, percentage: 20 },
      { name: 'Storage Operations', credits: 36.9, percentage: 15 },
    ],
  },
  '30d': {
    total: 1003.80,
    daily: [
      { date: 'Feb 15', credits: 28.5 },
      { date: 'Feb 20', credits: 35.2 },
      { date: 'Feb 25', credits: 42.9 },
      { date: 'Mar 1', credits: 38.7 },
      { date: 'Mar 5', credits: 51.3 },
      { date: 'Mar 10', credits: 45.1 },
      { date: 'Mar 15', credits: 39.8 },
    ],
    byCategory: [
      { name: 'Data Processing', credits: 401.5, percentage: 40 },
      { name: 'API Calls', credits: 251.0, percentage: 25 },
      { name: 'Model Inference', credits: 200.8, percentage: 20 },
      { name: 'Storage Operations', credits: 150.5, percentage: 15 },
    ],
  },
  custom: {
    total: 512.40,
    daily: [
      { date: 'Mar 1', credits: 45.2 },
      { date: 'Mar 3', credits: 52.8 },
      { date: 'Mar 5', credits: 38.1 },
      { date: 'Mar 7', credits: 61.4 },
      { date: 'Mar 9', credits: 47.9 },
      { date: 'Mar 11', credits: 55.3 },
      { date: 'Mar 13', credits: 42.7 },
    ],
    byCategory: [
      { name: 'Data Processing', credits: 204.9, percentage: 40 },
      { name: 'API Calls', credits: 128.1, percentage: 25 },
      { name: 'Model Inference', credits: 102.5, percentage: 20 },
      { name: 'Storage Operations', credits: 76.9, percentage: 15 },
    ],
  },
};

function TeamGraphVisualization({ team }: { team: typeof mockTeamCollaborations[0] }) {
  const [zoom, setZoom] = useState(0.85);
  const isManager = team.type === 'manager';

  const zoomIn = () => setZoom(z => Math.min(1.5, z + 0.15));
  const zoomOut = () => setZoom(z => Math.max(0.4, z - 0.15));
  const zoomReset = () => setZoom(0.85);

  if (isManager) {
    const manager = team.agents.find(a => a.id === 'current');
    const subordinates = team.agents.filter(a => a.id !== 'current');

    return (
      <div className="relative w-full h-[240px] bg-black/20 rounded-xl overflow-hidden">
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
          <button onClick={zoomIn} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white text-xs flex items-center justify-center transition-colors">+</button>
          <button onClick={zoomReset} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white text-[9px] flex items-center justify-center transition-colors">⟳</button>
          <button onClick={zoomOut} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white text-xs flex items-center justify-center transition-colors">−</button>
        </div>
        <div className="w-full h-full flex items-center justify-center" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}>
          <div className="relative" style={{ width: '360px', height: '200px' }}>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/20">
                <p className="text-xs font-medium text-white whitespace-nowrap">{manager?.name}</p>
                <p className="text-[10px] text-gray-400 text-center">Manager</p>
              </div>
            </div>

            {subordinates.map((agent, index) => {
              const angle = (index * 2 * Math.PI) / subordinates.length - Math.PI / 2;
              const rx = 140;
              const ry = 70;
              const cx = 180 + rx * Math.cos(angle);
              const cy = 100 + ry * Math.sin(angle);

              return (
                <div key={agent.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${cx}px`, top: `${cy}px` }}>
                  <div className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10">
                    <p className="text-[10px] font-medium text-gray-300 whitespace-nowrap">{agent.name}</p>
                  </div>
                </div>
              );
            })}

            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {subordinates.map((agent, index) => {
                const angle = (index * 2 * Math.PI) / subordinates.length - Math.PI / 2;
                const rx = 140;
                const ry = 70;
                const cx = 180 + rx * Math.cos(angle);
                const cy = 100 + ry * Math.sin(angle);
                return (
                  <line key={agent.id} x1="180" y1="100" x2={cx} y2={cy} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[240px] bg-black/20 rounded-xl overflow-hidden">
      <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
        <button onClick={zoomIn} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white text-xs flex items-center justify-center transition-colors">+</button>
        <button onClick={zoomReset} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white text-[9px] flex items-center justify-center transition-colors">⟳</button>
        <button onClick={zoomOut} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white text-xs flex items-center justify-center transition-colors">−</button>
      </div>
      <div className="w-full h-full flex items-center justify-center" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}>
        <div className="flex items-center gap-2">
          {team.agents.map((agent, index) => {
            const isCurrent = agent.id === 'current';
            return (
              <div key={agent.id} className="flex items-center">
                <div className={`px-3 py-2 rounded-lg ${isCurrent ? 'bg-white/10 border-2 border-white/30' : 'bg-black/60 border border-white/10'}`}>
                  <p className={`text-xs font-medium whitespace-nowrap ${isCurrent ? 'text-white' : 'text-gray-300'}`}>{agent.name}</p>
                  <p className="text-[10px] text-gray-500 text-center">{agent.role}</p>
                </div>
                {index < team.agents.length - 1 && (
                  <div className="mx-1.5 flex items-center">
                    <div className="w-5 h-px bg-white/10" />
                    <div className="w-1 h-1 rounded-full bg-white/20 -ml-0.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AgentDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const agent = agents.find((a) => a.id === id);

  const tabParam = searchParams.get('tab');
  const isConfigRequired = agent?.status === 'config_required';
  const initialTab = tabParam === 'config' ? 'config' : (tabParam as TabId) || 'overview';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [customStartDate, setCustomStartDate] = useState('2026-03-01');
  const [customEndDate, setCustomEndDate] = useState('2026-03-16');
  const [approvalPolicies, setApprovalPolicies] = useState(mockApprovalPolicies);
  const [approvalPage, setApprovalPage] = useState(0);
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);
  const [skillStates, setSkillStates] = useState<Record<string, boolean>>(
    Object.fromEntries(mockSkills.map(s => [s.name, true]))
  );

  useEffect(() => {
    if (tabParam === 'config') {
      setActiveTab('config');
    }
  }, [tabParam]);

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Agent not found</h2>
          <Link to="/agents" className="text-indigo-400 hover:text-indigo-300">
            Return to Agents
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[agent.status];
  const creditsData = mockCreditsData[dateRange];

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchParams({});
    setSelectedTask(null);
  };

  const toggleApprovalPolicy = (policyId: string) => {
    setApprovalPolicies(prev =>
      prev.map(p =>
        p.id === policyId ? { ...p, requiresApproval: !p.requiresApproval } : p
      )
    );
  };

  const selectedTaskData = mockTasks.find(t => t.id === selectedTask);
  const maxCredits = Math.max(...creditsData.daily.map(d => d.credits));

  const riskLevelConfig = {
    low: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    high: { bg: 'bg-rose-500/20', text: 'text-rose-400' },
    critical: { bg: 'bg-rose-600/30', text: 'text-rose-300' },
  };

  return (
    <div className="min-h-screen">
      <Header title={agent.name} subtitle={agent.category} />

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link
            to="/agents"
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>

          <div className="flex items-center gap-3 flex-1">
            <img
              src={agent.avatar}
              alt={agent.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-white">{agent.name}</h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} ${agent.status === 'active' ? 'animate-pulse' : ''}`} />
                  {status.label}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-500 bg-white/5">{agent.version}</span>
              </div>
              <p className="text-sm text-gray-500">{agent.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {agent.status === 'active' ? (
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors">
                <Pause className="w-4 h-4" />
                <span className="text-sm font-medium">Pause</span>
              </button>
            ) : agent.status !== 'config_required' ? (
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Activate</span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const showWarning = tab.id === 'config' && isConfigRequired;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {showWarning && (
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && (
          <div className="bg-dark-50 rounded-2xl border border-white/5 p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-black/60">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs text-gray-500">Uptime</span>
                </div>
                <p className="text-2xl font-semibold text-white">14d 8h</p>
                <p className="text-xs text-gray-500 mt-1">Since last restart</p>
              </div>
              <div className="p-4 rounded-xl bg-black/60">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-gray-500">Tasks Completed</span>
                </div>
                <p className="text-2xl font-semibold text-white">{agent.tasksCompleted.toLocaleString()}</p>
                <p className="text-xs text-emerald-400 mt-1">+127 today</p>
              </div>
              <div className="p-4 rounded-xl bg-black/60">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-gray-500">Success Rate</span>
                </div>
                <p className="text-2xl font-semibold text-white">{agent.successRate}%</p>
                <p className="text-xs text-cyan-400 mt-1">+2.3% this week</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">About This Agent</h3>
              <p className="text-gray-400 mb-4">{agent.description}</p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">What This Agent Does</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">Automatically classifies and routes incoming requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">Generates context-aware responses using knowledge base</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">Escalates complex issues to human operators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">Analyzes sentiment and prioritizes urgent requests</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6">
              <h4 className="text-sm font-medium text-gray-400 mb-4">Pending Approvals</h4>
              {(() => {
                const approvals = [
                  { id: 'pa-1', action: 'Execute Database Query', detail: 'SELECT * FROM customers WHERE region = "APAC"', requestedAt: '2 min ago', requestedBy: 'Data Analyst Pro', risk: 'medium' as const, actionType: 'QUERY', actionColor: 'text-rose-400', context: 'Monthly sales report generation requires querying production customer database. Query targets APAC region records for Q1 2026 business review.', fields: [{ label: 'Database', value: 'Production (us-east-1)' }, { label: 'Table', value: 'customers' }, { label: 'Estimated Rows', value: '~12,400' }, { label: 'Query Type', value: 'SELECT (read-only)' }, { label: 'Requester', value: 'Data Analyst Pro' }, { label: 'Scheduled', value: '2026-03-17 09:00 UTC' }] },
                  { id: 'pa-2', action: 'Process Refund', detail: 'Refund $245.00 to order #ORD-8842', requestedAt: '8 min ago', requestedBy: 'Customer Support Agent', risk: 'high' as const, actionType: 'REFUND', actionColor: 'text-amber-400', context: 'Customer reported receiving damaged goods. Photos verified by support team. Original payment via credit card.', fields: [{ label: 'Order ID', value: '#ORD-8842' }, { label: 'Amount', value: '$245.00' }, { label: 'Payment Method', value: 'Visa ending 4821' }, { label: 'Customer', value: 'James Wilson' }, { label: 'Reason', value: 'Damaged product' }, { label: 'Refund Type', value: 'Full refund' }] },
                  { id: 'pa-3', action: 'Access Sensitive Data', detail: 'Read PII records for compliance audit', requestedAt: '15 min ago', requestedBy: 'Compliance Bot', risk: 'critical' as const, actionType: 'DATA ACCESS', actionColor: 'text-rose-400', context: 'Annual compliance audit requires access to personally identifiable information. Audit scope covers records from Jan–Dec 2025.', fields: [{ label: 'Data Type', value: 'PII Records' }, { label: 'Scope', value: 'Jan–Dec 2025' }, { label: 'Records', value: '~45,000' }, { label: 'Purpose', value: 'Compliance audit' }, { label: 'Retention', value: '90 days' }, { label: 'Auditor', value: 'Internal Compliance' }] },
                  { id: 'pa-4', action: 'Send Bulk Email', detail: 'Notify 1,200 users about policy update', requestedAt: '22 min ago', requestedBy: 'Marketing Content Creator', risk: 'medium' as const, actionType: 'EMAIL', actionColor: 'text-amber-400', context: 'Privacy policy update notification. Email template reviewed and approved by legal team.', fields: [{ label: 'Recipients', value: '1,200 users' }, { label: 'Template', value: 'Policy Update v2' }, { label: 'Subject', value: 'Updated Privacy Policy' }, { label: 'Approved By', value: 'Legal Team' }, { label: 'Send Time', value: 'Immediate' }, { label: 'Unsubscribe', value: 'Included' }] },
                  { id: 'pa-5', action: 'Delete Records', detail: 'Remove 38 expired accounts from database', requestedAt: '30 min ago', requestedBy: 'Data Cleanup Job', risk: 'high' as const, actionType: 'DELETE', actionColor: 'text-rose-400', context: 'Accounts inactive for 24+ months flagged for deletion per data retention policy. Backup snapshot created.', fields: [{ label: 'Records', value: '38 accounts' }, { label: 'Criteria', value: 'Inactive 24+ months' }, { label: 'Backup', value: 'Snapshot created' }, { label: 'Policy', value: 'Data Retention v3' }, { label: 'Reversible', value: '30-day recovery' }, { label: 'Approved By', value: 'DBA Team' }] },
                  { id: 'pa-6', action: 'Update Pricing Table', detail: 'Adjust tier-2 pricing from $49 to $59', requestedAt: '45 min ago', requestedBy: 'Revenue Optimizer', risk: 'high' as const, actionType: 'CONFIG', actionColor: 'text-amber-400', context: 'Pricing adjustment based on market analysis. Affects 340 active tier-2 subscribers.', fields: [{ label: 'Plan', value: 'Tier-2 Professional' }, { label: 'Current Price', value: '$49/month' }, { label: 'New Price', value: '$59/month' }, { label: 'Affected Users', value: '340 subscribers' }, { label: 'Grandfathering', value: '30 days' }, { label: 'Effective Date', value: '2026-04-01' }] },
                  { id: 'pa-7', action: 'Export Customer Data', detail: 'CSV export of 5,000 customer records', requestedAt: '1 hr ago', requestedBy: 'Data Analyst Pro', risk: 'medium' as const, actionType: 'EXPORT', actionColor: 'text-amber-400', context: 'Export requested for partner integration data sync. PII fields will be masked.', fields: [{ label: 'Format', value: 'CSV' }, { label: 'Records', value: '5,000' }, { label: 'Fields', value: 'Name, Email, History' }, { label: 'PII Masking', value: 'Enabled' }, { label: 'Destination', value: 'Partner SFTP' }, { label: 'Expires', value: '24 hours' }] },
                  { id: 'pa-8', action: 'Modify API Rate Limits', detail: 'Increase rate limit to 500 req/min for partner key', requestedAt: '1.5 hr ago', requestedBy: 'API Gateway Manager', risk: 'low' as const, actionType: 'CONFIG', actionColor: 'text-gray-400', context: 'Partner requested higher rate limit for production integration. No cost impact expected.', fields: [{ label: 'API Key', value: 'partner-prod-***' }, { label: 'Current Limit', value: '200 req/min' }, { label: 'New Limit', value: '500 req/min' }, { label: 'Partner', value: 'Acme Corp' }, { label: 'Cost Impact', value: 'None' }, { label: 'Valid Until', value: '2026-06-30' }] },
                  { id: 'pa-9', action: 'Create Admin Account', detail: 'New admin user for operations team', requestedAt: '2 hr ago', requestedBy: 'HR Onboarding Bot', risk: 'critical' as const, actionType: 'ACCESS', actionColor: 'text-rose-400', context: 'New operations manager starting next week. Requires admin-level access to monitoring and deployment tools.', fields: [{ label: 'User', value: 'M. Rodriguez' }, { label: 'Role', value: 'Admin' }, { label: 'Department', value: 'Operations' }, { label: 'Start Date', value: '2026-03-24' }, { label: 'Access Scope', value: 'Monitoring, Deploy' }, { label: 'Sponsor', value: 'VP Engineering' }] },
                  { id: 'pa-10', action: 'Deploy Config Change', detail: 'Update feature flags for canary release', requestedAt: '2.5 hr ago', requestedBy: 'Release Manager', risk: 'medium' as const, actionType: 'DEPLOY', actionColor: 'text-amber-400', context: 'Enable new checkout flow for 5% of users. Rollback plan in place.', fields: [{ label: 'Feature', value: 'New Checkout Flow' }, { label: 'Rollout', value: '5% canary' }, { label: 'Rollback', value: 'Automated' }, { label: 'Monitoring', value: 'Alerts configured' }, { label: 'Region', value: 'us-east-1' }, { label: 'Owner', value: 'Checkout Team' }] },
                  { id: 'pa-11', action: 'Revoke Access Token', detail: 'Invalidate token for deactivated service', requestedAt: '3 hr ago', requestedBy: 'Security Scanner', risk: 'low' as const, actionType: 'SECURITY', actionColor: 'text-gray-400', context: 'Service "legacy-payments-v1" decommissioned. Token still active and should be revoked.', fields: [{ label: 'Service', value: 'legacy-payments-v1' }, { label: 'Token Type', value: 'Service Account' }, { label: 'Created', value: '2024-08-12' }, { label: 'Last Used', value: '2025-11-30' }, { label: 'Scope', value: 'payments:read' }, { label: 'Impact', value: 'None (decommissioned)' }] },
                  { id: 'pa-12', action: 'Archive Project Data', detail: 'Move Q4-2025 project files to cold storage', requestedAt: '4 hr ago', requestedBy: 'Storage Optimizer', risk: 'low' as const, actionType: 'ARCHIVE', actionColor: 'text-gray-400', context: 'Project completed and closed. 12.4 GB of files to be moved to cold storage.', fields: [{ label: 'Project', value: 'Q4-2025 Campaign' }, { label: 'Size', value: '12.4 GB' }, { label: 'Storage', value: 'S3 Glacier' }, { label: 'Retrieval Time', value: '3–5 hours' }, { label: 'Retention', value: '7 years' }, { label: 'Owner', value: 'Marketing Ops' }] },
                ];
                const pageSize = 5;
                const totalPages = Math.ceil(approvals.length / pageSize);
                const paged = approvals.slice(approvalPage * pageSize, (approvalPage + 1) * pageSize);
                const start = approvalPage * pageSize + 1;
                const end = Math.min((approvalPage + 1) * pageSize, approvals.length);
                const activeApproval = approvals.find(a => a.id === selectedApproval);
                return (
                  <>
                    <div className="space-y-2">
                      {paged.map((approval) => (
                        <div
                          key={approval.id}
                          onClick={() => setSelectedApproval(approval.id)}
                          className="flex items-center gap-3 p-3 rounded-lg bg-black/40 cursor-pointer hover:bg-black/60 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{approval.action}</p>
                            <p className="text-xs text-gray-600 truncate">{approval.detail}</p>
                          </div>
                          <span className="text-xs text-gray-600 flex-shrink-0">{approval.requestedAt}</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="w-7 h-7 rounded-md bg-white/5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors border border-white/5 flex items-center justify-center"
                              data-tip="Approve"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="w-7 h-7 rounded-md bg-white/5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-white/5 flex items-center justify-center"
                              data-tip="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-3">
                      <span className="text-xs text-gray-500">{start}–{end} of {approvals.length}</span>
                      <div className="flex gap-1">
                        <button onClick={() => setApprovalPage(p => Math.max(0, p - 1))} disabled={approvalPage === 0} className="w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:bg-white/5 text-xs disabled:opacity-30 disabled:cursor-not-allowed">&lt;</button>
                        <button onClick={() => setApprovalPage(p => Math.min(totalPages - 1, p + 1))} disabled={approvalPage >= totalPages - 1} className="w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:bg-white/5 text-xs disabled:opacity-30 disabled:cursor-not-allowed">&gt;</button>
                      </div>
                    </div>

                    {activeApproval && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedApproval(null)}>
                        <div className="bg-dark-50 border border-white/5 rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                          <div className="p-6 border-b border-white/5">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <span className={`text-[10px] font-semibold ${activeApproval.actionColor}`}>{activeApproval.actionType}</span>
                                <h2 className="text-lg font-semibold text-white mt-1">{activeApproval.action}</h2>
                                <p className="text-sm text-gray-500">from {activeApproval.requestedBy}</p>
                              </div>
                              <button onClick={() => setSelectedApproval(null)} className="p-2 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0">
                                <X className="w-5 h-5 text-gray-400" />
                              </button>
                            </div>
                          </div>

                          <div className="p-6 space-y-6">
                            <p className="text-sm text-gray-400 leading-relaxed">{activeApproval.context}</p>
                            <div className="space-y-3">
                              {activeApproval.fields.map((field: { label: string; value: string }, idx: number) => (
                                <div key={idx} className="flex items-center justify-between py-2">
                                  <span className="text-sm text-gray-500">{field.label}</span>
                                  <span className="text-sm text-white">{field.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-6 border-t border-white/5 flex gap-3">
                            <button
                              onClick={() => setSelectedApproval(null)}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                            >
                              <Check className="w-5 h-5" />
                              <span className="font-medium">Approve</span>
                            </button>
                            <button
                              onClick={() => setSelectedApproval(null)}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <X className="w-5 h-5" />
                              <span className="font-medium">Reject</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="border-t border-white/5 pt-6">
              <h4 className="text-sm font-medium text-gray-400 mb-4">Recent Activity</h4>
              <div className="space-y-3">
                {mockTasks.slice(0, 3).map((task) => {
                  const taskStatus = taskStatusConfig[task.status as keyof typeof taskStatusConfig];
                  return (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-black/60">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${taskStatus.bgColor}`}>
                        {task.status === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                        {task.status === 'failed' && <XCircle className="w-4 h-4 text-rose-400" />}
                        {task.status === 'in_progress' && <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />}
                        {task.status === 'pending' && <Clock className="w-4 h-4 text-amber-400" />}
                        {task.status === 'pending_approval' && <ShieldCheck className="w-4 h-4 text-purple-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{task.name}</p>
                        <p className="text-xs text-gray-500">{task.timestamp}</p>
                      </div>
                      <span className="text-xs text-gray-400">{task.duration}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'approval_policy' && (
          <div className="bg-dark-50 rounded-2xl border border-white/5 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Approval Policy</h3>
                <p className="text-sm text-gray-500 mt-1">Configure which actions require human approval before execution</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setApprovalPolicies(prev => prev.map(p => ({ ...p, requiresApproval: true })))} className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors">
                  <span className="text-sm font-medium">Use All</span>
                </button>
                <button onClick={() => setApprovalPolicies(prev => prev.map(p => ({ ...p, requiresApproval: false })))} className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors">
                  <span className="text-sm font-medium">Disable All</span>
                </button>
                <button className="px-4 py-2 rounded-lg bg-indigo text-white hover:bg-indigo-600 transition-colors">
                  <span className="text-sm font-medium">Save</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {approvalPolicies.map((policy) => {
                const risk = riskLevelConfig[policy.riskLevel as keyof typeof riskLevelConfig];
                return (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-black/60 hover:bg-black/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${policy.requiresApproval ? 'bg-amber-500/20' : 'bg-gray-500/20'}`}>
                        <ShieldCheck className={`w-5 h-5 ${policy.requiresApproval ? 'text-amber-400' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{policy.action}</p>
                        {policy.requiresApproval && policy.approvers.length > 0 && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Approvers: {policy.approvers.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleApprovalPolicy(policy.id)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          policy.requiresApproval ? 'bg-amber-500' : 'bg-gray-600'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            policy.requiresApproval ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/5 pt-6">
              <div className="flex items-center gap-2 p-4 rounded-xl bg-indigo/10 border border-indigo/20">
                <AlertTriangle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-indigo-300">Approval Workflow</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    When an action requires approval, the agent will pause and wait for a designated approver to review and approve the action before proceeding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="bg-dark-50 rounded-2xl border border-white/5 p-6 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Configuration</h3>
              <button className="px-4 py-2 rounded-lg bg-indigo text-white hover:bg-indigo-600 transition-colors">
                <span className="text-sm font-medium">Save</span>
              </button>
            </div>

            {isConfigRequired && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-400">Configuration Required</span>
                </div>
                <p className="text-sm text-gray-400">
                  Complete the configuration below to activate this agent.
                </p>
              </div>
            )}

            {/* Knowledge Bases Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">Knowledge Bases</h3>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group">
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </button>
              </div>
              <div className="space-y-2">
                {mockKnowledgeBases.map((kb) => (
                  <div key={kb.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-black/20 transition-colors border border-white/5">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{kb.name}</p>
                        <p className="text-xs text-gray-500">{kb.entries.toLocaleString()} entries</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-400">
                      {kb.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* GitHub Repository Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-white">GitHub Repository</h3>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group">
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </button>
              </div>
              <div className="space-y-2">
                {mockGitHubRepos.map((repo) => (
                  <div key={repo.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-black/20 transition-colors border border-white/5">
                    <div className="flex items-center gap-3">
                      <Github className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{repo.name}</p>
                        <p className="text-xs text-gray-500">Branch: {repo.branch} - Last sync: {repo.lastSync}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-xs text-indigo-400 hover:bg-indigo/10 transition-colors">
                      Sync Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Connections Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">Data Connections</h3>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group">
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </button>
              </div>
              <div className="space-y-2">
                {mockDataConnections.map((conn) => {
                  const Icon = conn.icon;
                  return (
                    <div key={conn.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-black/20 transition-colors border border-white/5">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <div>
                          <p className="text-sm font-medium text-white">{conn.name}</p>
                          <p className="text-xs text-gray-500">{conn.account}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-xs text-gray-400">{conn.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="bg-dark-50 rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Skills</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => setSkillStates(Object.fromEntries(mockSkills.map(s => [s.name, true])))} className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors">
                  <span className="text-sm font-medium">Use All</span>
                </button>
                <button onClick={() => setSkillStates(Object.fromEntries(mockSkills.map(s => [s.name, false])))} className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors">
                  <span className="text-sm font-medium">Disable All</span>
                </button>
                <button className="px-4 py-2 rounded-lg bg-indigo text-white hover:bg-indigo-600 transition-colors">
                  <span className="text-sm font-medium">Save</span>
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {mockSkills.map((skill) => {
                const enabled = skillStates[skill.name] ?? true;
                return (
                  <div
                    key={skill.name}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${enabled ? 'bg-black/60' : 'bg-black/30 opacity-60'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{skill.name}</p>
                        <p className="text-xs text-gray-500">{skill.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSkillStates(prev => ({ ...prev, [skill.name]: !prev[skill.name] }))}
                      className={`w-9 h-5 rounded-full transition-colors relative ${enabled ? 'bg-emerald-500' : 'bg-gray-600'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'left-[18px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="bg-dark-50 rounded-2xl border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">Team Collaboration</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                This agent participates in {mockTeamCollaborations.length} team workflows. The highlighted node represents the current agent.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockTeamCollaborations.map((team) => (
                  <div key={team.id} className="rounded-xl bg-black/60 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{team.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{team.description}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {team.agents.length} agents
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <TeamGraphVisualization team={team} />
                    </div>
                    <div className="px-4 py-3 border-t border-white/5 bg-black/20">
                      <button className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                        View Team
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="flex gap-6">
            <div className="flex-1 bg-dark-50 rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">Recent Tasks</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Task ID</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Description</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Duration</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Credits</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTasks.map((task) => {
                      const taskStatus = taskStatusConfig[task.status as keyof typeof taskStatusConfig];
                      return (
                        <tr
                          key={task.id}
                          onClick={() => setSelectedTask(task.id)}
                          className={`border-b border-white/5 cursor-pointer transition-colors bg-black/10 ${
                            selectedTask === task.id ? 'bg-indigo/10' : 'hover:bg-black/20'
                          }`}
                        >
                          <td className="px-4 py-3 text-sm text-gray-400">{task.id}</td>
                          <td className="px-4 py-3 text-sm text-white">{task.name}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${taskStatus.bgColor} ${taskStatus.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'in_progress' ? 'bg-indigo-400 animate-pulse' : task.status === 'completed' ? 'bg-emerald-400' : task.status === 'failed' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                              {taskStatus.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">{task.duration}</td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-cyan-400 flex items-center gap-1">
                              <Coins className="w-3 h-3" />
                              {task.credits > 0 ? task.credits : '--'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{task.timestamp}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedTask && selectedTaskData && (
              <div className="w-80 bg-dark-50 rounded-2xl border border-white/5 overflow-hidden flex-shrink-0">
                <div className="p-4 border-b border-white/5">
                  <h4 className="text-sm font-semibold text-white">Execution Traces</h4>
                  <p className="text-xs text-gray-500 mt-1">{selectedTaskData.id}</p>
                </div>
                <div className="p-4 space-y-4">
                  {traces.slice(0, 5).map((trace, index) => (
                    <div key={trace.id} className="flex gap-3">
                      <div className="relative flex flex-col items-center">
                        <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                          trace.status === 'success' ? 'bg-emerald-500/20' :
                          trace.status === 'error' ? 'bg-rose-500/20' : 'bg-amber-500/20'
                        }`}>
                          {trace.status === 'success' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                          {trace.status === 'error' && <XCircle className="w-3 h-3 text-rose-400" />}
                          {trace.status === 'pending' && <Clock className="w-3 h-3 text-amber-400" />}
                        </div>
                        {index < 4 && (
                          <div className="w-px flex-1 bg-white/10 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-4">
                        <p className="text-xs font-medium text-white">{trace.action}</p>
                        {trace.tool && (
                          <span className="text-[10px] text-indigo-300">{trace.tool}</span>
                        )}
                        <p className="text-[10px] text-gray-500 mt-1">{trace.timestamp} - {trace.duration}ms</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="bg-dark-50 rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">
                    {agent.source === 'marketplace' ? 'Credits Consumption' : 'Token Consumption'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDateRange('7d')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      dateRange === '7d' ? 'bg-indigo text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setDateRange('30d')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      dateRange === '30d' ? 'bg-indigo text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    30 Days
                  </button>
                  <button
                    onClick={() => setDateRange('custom')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                      dateRange === 'custom' ? 'bg-indigo text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <CalendarDays className="w-3 h-3" />
                    Custom
                  </button>
                </div>
              </div>

              {dateRange === 'custom' && (
                <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-black/60">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">From:</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo/50"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">To:</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo/50"
                    />
                  </div>
                  <button className="px-4 py-1.5 rounded-lg bg-indigo text-white text-xs font-medium hover:bg-indigo-600 transition-colors">
                    Apply
                  </button>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-black/60">
                  <p className="text-xs text-gray-500 mb-1">
                    {agent.source === 'marketplace' ? 'Total Credits Used' : 'Total Tokens Used'}
                  </p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {agent.source === 'marketplace' 
                      ? creditsData.total.toFixed(2)
                      : `${(creditsData.total * 1000).toFixed(0)}K`
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {dateRange === '7d' ? 'Last 7 days' : dateRange === '30d' ? 'Last 30 days' : 'Custom range'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-black/60">
                  <p className="text-xs text-gray-500 mb-1">Daily Average</p>
                  <p className="text-3xl font-bold text-white">
                    {agent.source === 'marketplace'
                      ? (creditsData.total / creditsData.daily.length).toFixed(2)
                      : `${((creditsData.total * 1000) / creditsData.daily.length).toFixed(0)}K`
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {agent.source === 'marketplace' ? 'Credits per day' : 'Tokens per day'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-black/60">
                  <p className="text-xs text-gray-500 mb-1">Estimated Monthly</p>
                  <p className="text-3xl font-bold text-white">
                    {agent.source === 'marketplace'
                      ? ((creditsData.total / creditsData.daily.length) * 30).toFixed(2)
                      : `${(((creditsData.total * 1000) / creditsData.daily.length) * 30 / 1000).toFixed(0)}M`
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Based on current usage</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-4">Daily Usage</h4>
                <div className="relative h-48 bg-black/20 rounded-xl p-4">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-4 bottom-8 flex flex-col justify-between text-xs text-gray-600">
                    <span>{maxCredits.toFixed(0)}</span>
                    <span>{(maxCredits * 0.75).toFixed(0)}</span>
                    <span>{(maxCredits * 0.5).toFixed(0)}</span>
                    <span>{(maxCredits * 0.25).toFixed(0)}</span>
                    <span>0</span>
                  </div>

                  {/* Chart area */}
                  <div className="ml-8 h-full relative">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      {/* Grid lines */}
                      <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                      <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                      <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                      <line x1="0" y1="100" x2="100" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

                      {/* Gradient fill */}
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Area under curve */}
                      <path
                        d={`M 0 100 ${creditsData.daily.map((day, i) => {
                          const x = (i / (creditsData.daily.length - 1)) * 100;
                          const y = 100 - (day.credits / maxCredits) * 100;
                          return `L ${x} ${y}`;
                        }).join(' ')} L 100 100 Z`}
                        fill="url(#chartGradient)"
                      />

                      {/* Line */}
                      <path
                        d={creditsData.daily.map((day, i) => {
                          const x = (i / (creditsData.daily.length - 1)) * 100;
                          const y = 100 - (day.credits / maxCredits) * 100;
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="rgb(6, 182, 212)"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />

                      {/* Data points */}
                      {creditsData.daily.map((day, i) => {
                        const x = (i / (creditsData.daily.length - 1)) * 100;
                        const y = 100 - (day.credits / maxCredits) * 100;
                        return (
                          <g key={i}>
                            <circle
                              cx={x}
                              cy={y}
                              r="1.5"
                              fill="rgb(6, 182, 212)"
                              vectorEffect="non-scaling-stroke"
                              className="hover:r-2 transition-all"
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Hover tooltips */}
                    <div className="absolute inset-0 flex">
                      {creditsData.daily.map((day, index) => (
                        <div
                          key={index}
                          className="flex-1 relative group cursor-pointer"
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/90 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {agent.source === 'marketplace'
                              ? `${day.credits.toFixed(1)} credits`
                              : `${(day.credits * 1000).toFixed(0)}K tokens`
                            }
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* X-axis labels */}
                    <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-600">
                      {creditsData.daily.map((day, index) => (
                        <span key={index} className={index % 2 === 0 ? '' : 'opacity-0'}>
                          {day.date}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-4">Usage by Category</h4>
                <div className="space-y-3">
                  {creditsData.byCategory.map((category) => (
                    <div key={category.name} className="flex items-center gap-4">
                      <div className="w-32 text-sm text-gray-300">{category.name}</div>
                      <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                      <div className="w-20 text-right text-sm text-cyan-400">
                        {agent.source === 'marketplace'
                          ? category.credits.toFixed(1)
                          : `${(category.credits * 1000).toFixed(0)}K`
                        }
                      </div>
                      <div className="w-12 text-right text-xs text-gray-500">{category.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
