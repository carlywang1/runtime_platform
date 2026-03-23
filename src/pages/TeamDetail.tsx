import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pause,
  Eye,
  Settings2,
  Zap,
  ListTodo,
  BarChart3,
  ShieldCheck,
  Users,
  Activity,
  TrendingUp,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  Gamepad2,
  LayoutList,
} from 'lucide-react';
import Header from '../components/layout/Header';
import TeamCollaborationCanvas from '../components/TeamCollaborationCanvas';
import StructureView from '../components/StructureView';
import type { TeamStructureData } from '../components/StructureView';

type TabId = 'team_overview' | 'tasks' | 'members' | 'config' | 'approval_policy' | 'skills' | 'metrics';
type ViewMode = 'live' | 'structure';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Eye;
}

const tabs: Tab[] = [
  { id: 'team_overview', label: 'Team Overview', icon: Eye },
  { id: 'members', label: 'Members', icon: Bot },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'config', label: 'Config', icon: Settings2 },
  { id: 'approval_policy', label: 'Approval Policy', icon: ShieldCheck },
  { id: 'skills', label: 'Skills', icon: Zap },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
];

/* ═══════════════════════════════════════════════
   Mock data – 3 teams × 3 structure types
   ═══════════════════════════════════════════════ */

const mockTeamsData: Record<string, {
  id: string; name: string; description: string; status: string;
  type: 'workflow' | 'manager' | 'handoffs'; version: string;
  tasksToday: number; successRate: number; pendingApprovals: number;
  agents: { id: string; name: string; emoji: string; role: string; status: string; currentTask: string | null }[];
}> = {
  'team-1': {
    id: 'team-1',
    name: 'WMS Inbound Team',
    description: 'Warehouse management system inbound processing',
    status: 'active',
    type: 'workflow',
    version: 'v1.3.0',
    tasksToday: 127,
    successRate: 98.5,
    pendingApprovals: 3,
    agents: [
      { id: 'a1', name: 'Receipt Validator', emoji: '📦', role: 'Entry Point', status: 'assign_task', currentTask: 'Delegating validated PO-20260317-012 to Inventory Updater' },
      { id: 'a2', name: 'Inventory Updater', emoji: '🔄', role: 'Processing', status: 'working', currentTask: 'Updating stock levels for 247 SKUs in warehouse A' },
      { id: 'a3', name: 'Quality Inspector', emoji: '🔍', role: 'Validation', status: 'idle', currentTask: null },
      { id: 'a4', name: 'Label Generator', emoji: '🏷️', role: 'Output', status: 'idle', currentTask: null },
      { id: 'a5', name: 'Storage Allocator', emoji: '📍', role: 'Final', status: 'idle', currentTask: null },
    ],
  },
  'team-2': {
    id: 'team-2',
    name: 'Recruiting Team',
    description: 'End-to-end recruitment and candidate management',
    status: 'active',
    type: 'manager',
    version: 'v2.0.1',
    tasksToday: 89,
    successRate: 96.2,
    pendingApprovals: 5,
    agents: [
      { id: 'manager', name: 'Recruiting Manager', emoji: '👔', role: 'Manager', status: 'working', currentTask: 'Reviewing 12 candidate profiles and assigning tasks' },
      { id: 'b1', name: 'Resume Screener', emoji: '📄', role: 'Specialist', status: 'working', currentTask: 'Screening 45 resumes for Senior Developer position' },
      { id: 'b2', name: 'Interview Scheduler', emoji: '📅', role: 'Specialist', status: 'idle', currentTask: null },
      { id: 'b3', name: 'Candidate Evaluator', emoji: '⭐', role: 'Specialist', status: 'working', currentTask: 'Analyzing interview feedback for 8 candidates' },
      { id: 'b4', name: 'Offer Generator', emoji: '✉️', role: 'Specialist', status: 'assign_task', currentTask: 'Waiting for approval to send offer to candidate' },
    ],
  },
  'team-3': {
    id: 'team-3',
    name: 'Customer Service Team',
    description: 'Intelligent customer support with dynamic agent routing and handoffs',
    status: 'active',
    type: 'handoffs',
    version: 'v1.5.0',
    tasksToday: 342,
    successRate: 97.3,
    pendingApprovals: 4,
    agents: [
      { id: 'c1', name: 'Triage Agent', emoji: '🎯', role: 'Entry', status: 'working', currentTask: 'Classifying incoming ticket #4821 — billing intent detected' },
      { id: 'c2', name: 'Billing Agent', emoji: '📄', role: 'Specialist', status: 'working', currentTask: 'Resolving invoice discrepancy for customer #1092' },
      { id: 'c3', name: 'Refund Agent', emoji: '💰', role: 'Specialist', status: 'idle', currentTask: null },
      { id: 'c4', name: 'Technical Support', emoji: '🔧', role: 'Specialist', status: 'working', currentTask: 'Debugging API integration issue for enterprise client' },
    ],
  },
};

/* ── Structure data for each team ── */
const structureData: Record<string, TeamStructureData> = {
  'team-1': {
    id: 'team-1',
    name: 'WMS Inbound Team',
    type: 'workflow',
    version: 'v1.3.0',
    description: 'A sequential pipeline that processes warehouse inbound shipments. Each agent handles one stage — from PO validation through inventory update, quality inspection, label generation, to final storage allocation. Tasks flow strictly left-to-right; an agent only activates when the previous stage completes.',
    agents: [
      {
        id: 'a1', name: 'Receipt Validator', emoji: '📦', role: 'Entry Point', roleLabel: 'ENTRY',
        description: 'Validates purchase orders against supplier contracts and checks document completeness',
        inputFrom: 'ERP System (PO Document)',
        outputTo: 'Inventory Updater (Validated PO)',
        tools: ['PO Parser', 'Compliance Checker', 'Supplier DB Lookup'],
        approvalRule: 'PO amount > $50,000 requires human approval',
      },
      {
        id: 'a2', name: 'Inventory Updater', emoji: '🔄', role: 'Processing', roleLabel: 'PROCESS',
        description: 'Updates warehouse inventory records based on validated purchase orders',
        inputFrom: 'Receipt Validator (Validated PO)',
        outputTo: 'Quality Inspector (Updated Records)',
        tools: ['Inventory DB Writer', 'SKU Resolver', 'Stock Level Calculator'],
      },
      {
        id: 'a3', name: 'Quality Inspector', emoji: '🔍', role: 'Validation', roleLabel: 'VALIDATE',
        description: 'Performs quality checks on received goods and flags items that fail inspection',
        inputFrom: 'Inventory Updater (Updated Records)',
        outputTo: 'Label Generator (Inspection Report)',
        tools: ['QC Checklist Engine', 'Defect Classifier', 'Photo Analyzer'],
        approvalRule: 'Batch rejection requires warehouse manager sign-off',
      },
      {
        id: 'a4', name: 'Label Generator', emoji: '🏷️', role: 'Output', roleLabel: 'OUTPUT',
        description: 'Generates barcode labels and shipping documents for inspected goods',
        inputFrom: 'Quality Inspector (Inspection Report)',
        outputTo: 'Storage Allocator (Labeled Items)',
        tools: ['Barcode Generator', 'Label Printer API', 'Document Template Engine'],
      },
      {
        id: 'a5', name: 'Storage Allocator', emoji: '📍', role: 'Final', roleLabel: 'FINAL',
        description: 'Assigns optimal storage locations based on item type, size, and warehouse capacity',
        inputFrom: 'Label Generator (Labeled Items)',
        tools: ['Warehouse Map Engine', 'Slot Optimizer', 'Forklift Task Dispatcher'],
        approvalRule: 'Hazardous material zone allocation requires safety officer approval',
      },
    ],
  },
  'team-2': {
    id: 'team-2',
    name: 'Recruiting Team',
    type: 'manager',
    version: 'v2.0.1',
    description: 'A manager-delegation structure where the Recruiting Manager receives all hiring requests, analyzes requirements, and dispatches tasks to specialized agents. The manager monitors progress and reassigns work if needed. Specialists report results back to the manager.',
    agents: [
      {
        id: 'manager', name: 'Recruiting Manager', emoji: '👔', role: 'Manager', roleLabel: 'MANAGER',
        description: 'Central coordinator that receives hiring requests, breaks them into tasks, and delegates to the right specialist',
        tools: ['Task Planner', 'Candidate Pipeline Tracker', 'Hiring Analytics Dashboard'],
        dispatchRules: [
          { targetName: 'Resume Screener', targetEmoji: '📄', condition: 'New applications received or bulk screening needed' },
          { targetName: 'Interview Scheduler', targetEmoji: '📅', condition: 'Candidates pass screening and need interview slots' },
          { targetName: 'Candidate Evaluator', targetEmoji: '⭐', condition: 'Interview completed, feedback needs consolidation' },
          { targetName: 'Offer Generator', targetEmoji: '✉️', condition: 'Candidate approved, offer package needs preparation' },
        ],
      },
      {
        id: 'b1', name: 'Resume Screener', emoji: '📄', role: 'Specialist', roleLabel: 'SPECIALIST',
        description: 'Screens resumes against job requirements using NLP matching and scoring',
        tools: ['Resume Parser', 'Skill Matcher', 'ATS Integration'],
      },
      {
        id: 'b2', name: 'Interview Scheduler', emoji: '📅', role: 'Specialist', roleLabel: 'SPECIALIST',
        description: 'Coordinates interview schedules between candidates and hiring panels',
        tools: ['Calendar API', 'Availability Matcher', 'Meeting Room Booker', 'Email Notifier'],
      },
      {
        id: 'b3', name: 'Candidate Evaluator', emoji: '⭐', role: 'Specialist', roleLabel: 'SPECIALIST',
        description: 'Aggregates interview feedback, scores candidates, and generates evaluation reports',
        tools: ['Feedback Aggregator', 'Scoring Model', 'Comparison Matrix Builder'],
      },
      {
        id: 'b4', name: 'Offer Generator', emoji: '✉️', role: 'Specialist', roleLabel: 'SPECIALIST',
        description: 'Prepares offer letters with compensation packages based on role level and market data',
        tools: ['Compensation Calculator', 'Offer Template Engine', 'DocuSign API'],
        approvalRule: 'All offers require hiring manager approval before sending',
      },
    ],
  },
  'team-3': {
    id: 'team-3',
    name: 'Customer Service Team',
    type: 'handoffs',
    version: 'v1.5.0',
    description: 'A dynamic handoff system where the Triage Agent receives all customer requests and routes them to the appropriate specialist. Unlike a fixed pipeline, any agent can transfer the conversation to another agent at any time based on context — for example, a Billing Agent can hand off to the Refund Agent mid-conversation if the customer requests a refund.',
    agents: [
      {
        id: 'c1', name: 'Triage Agent', emoji: '🎯', role: 'Entry', roleLabel: 'ENTRY',
        description: 'First point of contact — classifies customer intent and routes to the right specialist',
        tools: ['Intent Classifier', 'Customer History Lookup', 'Sentiment Analyzer'],
        handoffTargets: [
          { targetName: 'Billing Agent', targetEmoji: '📄', condition: 'Customer issue involves invoices, payments, or subscription changes' },
          { targetName: 'Refund Agent', targetEmoji: '💰', condition: 'Customer requests a refund or order cancellation' },
          { targetName: 'Technical Support', targetEmoji: '🔧', condition: 'Customer reports a bug, outage, or integration issue' },
        ],
      },
      {
        id: 'c2', name: 'Billing Agent', emoji: '📄', role: 'Specialist', roleLabel: 'SPECIALIST',
        description: 'Handles billing inquiries, invoice disputes, and payment method updates',
        tools: ['Invoice Lookup', 'Payment Gateway API', 'Subscription Manager'],
        handoffTargets: [
          { targetName: 'Triage Agent', targetEmoji: '🎯', condition: 'Issue falls outside billing scope' },
          { targetName: 'Refund Agent', targetEmoji: '💰', condition: 'Billing dispute requires a refund' },
        ],
      },
      {
        id: 'c3', name: 'Refund Agent', emoji: '💰', role: 'Specialist', roleLabel: 'SPECIALIST',
        description: 'Processes refund requests, validates eligibility, and executes refund transactions',
        tools: ['Refund Processor', 'Order Lookup', 'Eligibility Checker'],
        approvalRule: 'Refund amount > $200 requires supervisor approval',
        handoffTargets: [
          { targetName: 'Triage Agent', targetEmoji: '🎯', condition: 'Refund completed and customer has a new question' },
          { targetName: 'Billing Agent', targetEmoji: '📄', condition: 'Refund requires billing adjustment or credit note' },
        ],
      },
      {
        id: 'c4', name: 'Technical Support', emoji: '🔧', role: 'Specialist', roleLabel: 'SPECIALIST',
        description: 'Diagnoses and resolves technical issues including API errors, integration failures, and platform bugs',
        tools: ['Log Analyzer', 'API Health Checker', 'Debug Console', 'Knowledge Base Search'],
        handoffTargets: [
          { targetName: 'Triage Agent', targetEmoji: '🎯', condition: 'Technical issue resolved, customer has unrelated follow-up' },
          { targetName: 'Billing Agent', targetEmoji: '📄', condition: 'Technical issue caused incorrect billing' },
        ],
      },
    ],
  },
};

/* ── Shared mock data ── */
const mockTasks = [
  { id: 'T-001', name: 'Process PO-20260313-007', status: 'completed', duration: '5m 02s', timestamp: '2 min ago', credits: 125 },
  { id: 'T-002', name: 'Validate incoming shipment', status: 'in_progress', duration: '2m 15s', timestamp: '5 min ago', credits: 0 },
  { id: 'T-003', name: 'Update inventory records', status: 'completed', duration: '1m 45s', timestamp: '12 min ago', credits: 180 },
];

const taskStatusConfig: Record<string, { label: string; bgColor: string; color: string; icon: typeof CheckCircle }> = {
  completed: { label: 'Completed', bgColor: 'bg-emerald-500/20', color: 'text-emerald-400', icon: CheckCircle },
  in_progress: { label: 'Running', bgColor: 'bg-indigo/20', color: 'text-indigo-400', icon: Clock },
  failed: { label: 'Failed', bgColor: 'bg-rose-500/20', color: 'text-rose-400', icon: XCircle },
  pending: { label: 'Queued', bgColor: 'bg-amber-500/20', color: 'text-amber-400', icon: Clock },
};

const mockPendingApprovals: Record<string, { id: string; agent: string; action: string; priority: 'CRITICAL' | 'HIGH' | 'MEDIUM'; timestamp: string }[]> = {
  'team-1': [
    { id: 'PA-001', agent: 'Storage Allocator', action: 'Allocate zone B3 for oversized shipment PO-20260317-012', priority: 'HIGH', timestamp: '3 min ago' },
    { id: 'PA-002', agent: 'Quality Inspector', action: 'Flag batch BT-2026-0315 for re-inspection (moisture detected)', priority: 'CRITICAL', timestamp: '12 min ago' },
    { id: 'PA-003', agent: 'Inventory Updater', action: 'Write-off 15 damaged units from SKU-44821', priority: 'MEDIUM', timestamp: '25 min ago' },
  ],
  'team-2': [
    { id: 'PA-004', agent: 'Offer Generator', action: 'Send offer letter to candidate for Senior Developer role', priority: 'HIGH', timestamp: '5 min ago' },
    { id: 'PA-005', agent: 'Resume Screener', action: 'Bulk reject 23 unqualified applications', priority: 'MEDIUM', timestamp: '8 min ago' },
    { id: 'PA-006', agent: 'Recruiting Manager', action: 'Escalate hiring timeline for Q2 engineering positions', priority: 'CRITICAL', timestamp: '15 min ago' },
  ],
  'team-3': [
    { id: 'PA-007', agent: 'Refund Agent', action: 'Process $450 refund for enterprise customer — exceeds auto-approval limit', priority: 'HIGH', timestamp: '2 min ago' },
    { id: 'PA-008', agent: 'Technical Support', action: 'Escalate P1 outage affecting 12 enterprise accounts', priority: 'CRITICAL', timestamp: '8 min ago' },
    { id: 'PA-009', agent: 'Billing Agent', action: 'Apply $2,400 credit to account #8821 per negotiated SLA', priority: 'HIGH', timestamp: '20 min ago' },
    { id: 'PA-010', agent: 'Triage Agent', action: 'Route VIP customer directly to Technical Support (bypass queue)', priority: 'MEDIUM', timestamp: '35 min ago' },
  ],
};

const priorityConfig = {
  CRITICAL: { bg: 'bg-rose-500/20', text: 'text-rose-400' },
  HIGH: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  MEDIUM: { bg: 'bg-indigo/20', text: 'text-indigo-400' },
};

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */

export default function TeamDetail() {
  const { id } = useParams();
  const team = mockTeamsData[id as keyof typeof mockTeamsData];
  const structure = structureData[id as keyof typeof structureData];
  const [activeTab, setActiveTab] = useState<TabId>('team_overview');
  const [viewMode, setViewMode] = useState<ViewMode>('live');

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Team not found</h2>
          <Link to="/teams" className="text-indigo-400 hover:text-indigo-300">Return to Teams</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title={team.name} subtitle={team.description} />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/teams" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-xl bg-indigo/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-white">{team.name}</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-500 bg-white/5">{team.version}</span>
              </div>
              <p className="text-sm text-gray-500">{team.description}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors">
            <Pause className="w-4 h-4" />
            <span className="text-sm font-medium">Pause Team</span>
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-dark-50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-gray-500">Tasks Today</span>
            </div>
            <p className="text-2xl font-semibold text-white">{team.tasksToday}</p>
          </div>
          <div className="bg-dark-50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-gray-500">Success Rate</span>
            </div>
            <p className="text-2xl font-semibold text-white">{team.successRate}%</p>
          </div>
          <div className="bg-dark-50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-gray-500">Pending Approvals</span>
            </div>
            <p className="text-2xl font-semibold text-white">{team.pendingApprovals}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive ? 'bg-indigo text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'team_overview' && (
          <div className="space-y-6">
            {/* Team Collaboration card with inline view switcher */}
            <div className="bg-dark-50 rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Team Collaboration</h3>
                <div className="flex items-center gap-1 p-0.5 bg-black/40 rounded-lg">
                  <button
                    onClick={() => setViewMode('live')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      viewMode === 'live' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Gamepad2 className="w-3 h-3" />
                    Live
                  </button>
                  <button
                    onClick={() => setViewMode('structure')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      viewMode === 'structure' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <LayoutList className="w-3 h-3" />
                    Structure
                  </button>
                </div>
              </div>
              {viewMode === 'live' && <TeamCollaborationCanvas team={team} />}
              {viewMode === 'structure' && structure && <StructureView team={structure} />}
            </div>

            {/* Pending Approvals */}
            <div className="bg-dark-50 rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">Pending Approvals</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                    {(mockPendingApprovals[team.id] || []).length}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {(mockPendingApprovals[team.id] || []).map((approval) => {
                  const pConfig = priorityConfig[approval.priority];
                  return (
                    <div key={approval.id} className="flex items-center gap-4 p-4 rounded-xl bg-black/60 hover:bg-black/70 transition-colors">
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${pConfig.bg} ${pConfig.text}`}>
                        {approval.priority}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{approval.agent}</span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{approval.action}</p>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{approval.timestamp}</span>
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">Approve</button>
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">Review</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-dark-50 rounded-2xl border border-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Tasks</h3>
              <div className="space-y-3">
                {mockTasks.map((task) => {
                  const status = taskStatusConfig[task.status];
                  const StatusIcon = status.icon;
                  return (
                    <div key={task.id} className="flex items-center gap-3 p-4 rounded-xl bg-black/60 hover:bg-black/70 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.bgColor}`}>
                        <StatusIcon className={`w-5 h-5 ${status.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{task.name}</p>
                        <p className="text-xs text-gray-500">{task.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">{task.duration}</p>
                        {task.credits > 0 && <p className="text-xs text-gray-500">{task.credits} Credits</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-dark-50 rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
            <div className="grid grid-cols-2 gap-4">
              {team.agents.map((agent) => (
                <div key={agent.id} className="p-4 rounded-xl bg-black/60 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{agent.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">Active</span>
                    <Link to={`/agents/${agent.id}`} className="text-xs text-indigo-400 hover:text-indigo-300">View Details →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'tasks' || activeTab === 'config' || activeTab === 'approval_policy' || activeTab === 'skills' || activeTab === 'metrics') && (
          <div className="bg-dark-50 rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white capitalize mb-4">{activeTab.replace(/_/g, ' ')}</h3>
            <p className="text-gray-400">Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
