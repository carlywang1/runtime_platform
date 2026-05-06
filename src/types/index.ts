export type AgentStatus = 'active' | 'inactive' | 'config_required' | 'error';
export type AgentSource = 'marketplace' | 'ide_build';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  source: AgentSource;
  avatar: string;
  tasksCompleted: number;
  successRate: number;
  costThisMonth: number;
  lastActive: string;
  category: string;
  capabilities: string[];
  requiredConfig?: string[];
  version: string;
}

export interface ApprovalTask {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  taskDescription: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  context: string;
  proposedAction: string;
  status: 'pending' | 'approved' | 'rejected';
  actionType: 'quote' | 'email' | 'stage_change';
}

export interface Connector {
  id: string;
  name: string;
  type: 'communication' | 'productivity' | 'enterprise' | 'storage' | 'custom';
  icon: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  description: string;
}

export interface OntologyItem {
  id: string;
  name: string;
  type: 'knowledge_base' | 'business_rule' | 'process' | 'terminology';
  description: string;
  lastUpdated: string;
  assignedAgents: string[];
  entries: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'steward';
  content: string;
  timestamp: string;
}

export interface TraceEntry {
  id: string;
  agentId: string;
  taskId: string;
  timestamp: string;
  action: string;
  tool?: string;
  status: 'success' | 'error' | 'pending';
  duration: number;
  details?: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
}

// Session types
export type SessionType = 'build_agent' | 'run_task' | 'run_chat';
export type SessionStatus = 'active' | 'completed' | 'stopped' | 'failed';

export interface Session {
  id: string;
  title: string;
  session_type: SessionType;
  status: SessionStatus;
  parent_session_id: string | null;
  agent_id: string | null;
  agent_name: string | null;
  agent_emoji: string | null;
  created_at: number;
  updated_at: number;
  messages: ChatMessage[];
  run_agent_state: RunAgentSessionState | null;
}

export interface RunAgentSessionState {
  runAgentMode: boolean;
  chatflowMode: boolean;
  configPhase: boolean;
  visibleScenarioCount: number;
  visibleConfigCount: number;
  visibleChatflowCount: number;
  confirmedCardId: string | null;
  skippedIds: string[];
  currentA2UI: string | null;
  runAgentInfo: { name: string; emoji: string; version: string; status?: string } | null;
}

export interface SessionReferenceMessage {
  type: 'session-reference';
  child_session_id: string;
  agent_name: string;
  agent_emoji: string;
  status: SessionStatus;
  summary?: string;
}
