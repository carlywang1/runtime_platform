import type { Session, SessionType } from '../types';

export interface AgentCatalogItem {
  id: string;
  name: string;
  emoji: string;
  version: string;
  keywords: string[];
}

export const AGENT_CATALOG: AgentCatalogItem[] = [
  {
    id: 'oms-agent',
    name: 'OMS Agent for Multichannel Orders and Inventory and Fulfillment v1',
    emoji: '🛒',
    version: 'v1',
    keywords: ['oms', 'order', 'inventory', 'fulfillment'],
  },
  {
    id: 'crm-agent',
    name: 'CRM Agent for Customer Relationship Management v2',
    emoji: '👥',
    version: 'v2',
    keywords: ['crm', 'customer', 'relationship'],
  },
  {
    id: 'analytics-agent',
    name: 'Analytics Agent for Business Intelligence and Reporting v1',
    emoji: '📊',
    version: 'v1',
    keywords: ['analytics', 'bi', 'report', 'reporting', 'intelligence'],
  },
  {
    id: 'email-assistant',
    name: 'Customer Service Email Assistant',
    emoji: '📧',
    version: 'v1',
    keywords: ['email', 'mail', 'customer service', 'reply', 'draft'],
  },
];

export function matchAgentFromInput(input: string): AgentCatalogItem | null {
  const lower = input.toLowerCase().trim();
  return AGENT_CATALOG.find(agent =>
    agent.keywords.some(k => lower.includes(k))
  ) || null;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function generateSessionTitle(firstMessage: string, _sessionType: SessionType): string {
  const cleaned = firstMessage.replace(/\n/g, ' ').trim();
  return cleaned.length > 30 ? cleaned.slice(0, 30) + '...' : cleaned;
}

export function groupSessionsByTime(sessions: Session[]): {
  today: Session[];
  yesterday: Session[];
  earlier: Session[];
} {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  const sorted = [...sessions].sort((a, b) => b.updated_at - a.updated_at);

  return {
    today: sorted.filter(s => s.updated_at >= todayStart),
    yesterday: sorted.filter(s => s.updated_at >= yesterdayStart && s.updated_at < todayStart),
    earlier: sorted.filter(s => s.updated_at < yesterdayStart),
  };
}

export function detectIntentChange(
  currentSession: Session,
  message: string
): { changed: boolean; suggestedType?: SessionType; reason?: string; vague?: boolean; agentName?: string } {
  const lower = message.toLowerCase().trim();
  const runKeywords = ['run', 'debug', '跑', '运行', '执行', 'run agent'];
  const buildKeywords = ['build', '创建', '新建', '帮我建', 'create'];
  const chatKeywords = ['聊聊', '对话', 'chat with'];

  // Run intent (only from build_agent sessions)
  if (currentSession.session_type === 'build_agent') {
    if (runKeywords.some(k => lower.includes(k))) {
      const isVague = runKeywords.some(k => lower === k) || lower === 'run agent';
      let inputAgent = lower;
      for (const k of ['run agent', 'debug', 'run', '跑', '运行', '执行']) {
        inputAgent = inputAgent.replace(k, '').trim();
      }
      const matched = inputAgent ? matchAgentFromInput(inputAgent) : null;
      const displayName = matched ? matched.name : '';
      const reason = isVague
        ? 'Looks like you want to run an Agent'
        : `Looks like you want to run ${displayName || inputAgent}`;
      return { changed: true, suggestedType: 'run_task', reason, vague: isVague, agentName: displayName || undefined };
    }
  }

  // Build intent (from any session type)
  if (buildKeywords.some(k => lower.includes(k))) {
    const isVague = buildKeywords.some(k => lower === k);
    let inputAgent = lower;
    for (const k of ['build agent', 'build a', 'build an', 'build', 'create a', 'create an', 'create', '创建', '新建', '帮我建']) {
      inputAgent = inputAgent.replace(k, '').trim();
    }
    const agentName = inputAgent || undefined;
    const reason = agentName
      ? `Let's create a new ${agentName.charAt(0).toUpperCase() + agentName.slice(1)}.`
      : 'Looks like you want to create a new Agent';
    return { changed: true, suggestedType: 'build_agent', reason, vague: isVague, agentName };
  }

  // Chat intent
  if (currentSession.session_type !== 'run_chat') {
    if (chatKeywords.some(k => lower.includes(k))) {
      const isVague = chatKeywords.some(k => lower === k);
      return { changed: true, suggestedType: 'run_chat', reason: 'Looks like you want to chat with an Agent', vague: isVague };
    }
  }

  return { changed: false };
}

