import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Session, SessionType, SessionStatus, ChatMessage, RunAgentSessionState } from '../types';
import { generateId, generateSessionTitle } from '../utils/sessionUtils';

function createDefaultSession(): Session {
  return {
    id: generateId(),
    title: '',
    session_type: 'build_agent',
    status: 'active',
    parent_session_id: null,
    agent_id: null,
    agent_name: null,
    agent_emoji: null,
    created_at: Date.now(),
    updated_at: Date.now(),
    messages: [],
    run_agent_state: null,
  };
}

const SEED_CRM_SESSION_ID = 'seed_crm_build';
const SEED_CRM_REPORT_ID = 'seed_crm_report';

function createSeedSessions(): Session[] {
  const defaultSession = createDefaultSession();
  const crmSession: Session = {
    id: SEED_CRM_SESSION_ID,
    title: 'CRM Agent',
    session_type: 'build_agent',
    status: 'active',
    parent_session_id: null,
    agent_id: null,
    agent_name: null,
    agent_emoji: null,
    created_at: Date.now() - 86400000 * 2,
    updated_at: Date.now() - 86400000 * 2 + 3600000,
    messages: [
      { id: 'crm-msg-1', role: 'user', content: 'I want to build a CRM agent that can help manage customer relationships, track leads, and automate follow-ups.', timestamp: '10:30' },
      { id: 'crm-msg-2', role: 'steward', content: 'Great idea! A CRM Agent can really streamline your customer management workflow. Let me help you set this up.\n\nFirst, let\'s define the core capabilities:\n1. **Lead tracking** — monitor new leads and their status\n2. **Follow-up automation** — schedule and send reminders\n3. **Customer data lookup** — query customer info on demand\n\nWhich of these should we prioritize first?', timestamp: '10:31' },
      { id: 'crm-msg-3', role: 'user', content: 'Let\'s start with lead tracking and customer data lookup. Follow-up automation can come later.', timestamp: '10:33' },
      { id: 'crm-msg-4', role: 'steward', content: 'Got it. For lead tracking, I\'ll need to know:\n- Where do your leads come from? (e.g., website forms, email, manual entry)\n- What stages does a lead go through? (e.g., New → Contacted → Qualified → Won/Lost)\n\nFor customer data lookup, what systems should the agent connect to? (e.g., Salesforce, HubSpot, a custom database)', timestamp: '10:34' },
      { id: 'crm-msg-5', role: 'user', content: 'Leads come from website forms and email. Stages are: New, Contacted, Demo Scheduled, Proposal Sent, Won, Lost. For data, we use HubSpot.', timestamp: '10:36' },
      { id: 'crm-msg-6', role: 'steward', content: 'Perfect, here\'s what I have so far:\n\n**CRM Agent v1 — Draft**\n- Lead sources: Website forms, Email\n- Pipeline stages: New → Contacted → Demo Scheduled → Proposal Sent → Won / Lost\n- Data integration: HubSpot\n- Capabilities: Lead tracking, Customer data lookup\n\nNext steps: I need to configure the HubSpot connection and define the trigger rules for stage transitions. Want to continue with that?', timestamp: '10:38' },
    ],
    run_agent_state: null,
  };
  const crmReportSession: Session = {
    id: SEED_CRM_REPORT_ID,
    title: 'CRM Report Agent',
    session_type: 'build_agent',
    status: 'active',
    parent_session_id: null,
    agent_id: null,
    agent_name: null,
    agent_emoji: null,
    created_at: Date.now() - 86400000 * 5,
    updated_at: Date.now() - 86400000 * 5 + 1800000,
    messages: [
      { id: 'crm-rpt-1', role: 'user', content: 'I want to build a CRM reporting agent that generates weekly pipeline reports and tracks conversion rates.', timestamp: '14:10' },
      { id: 'crm-rpt-2', role: 'steward', content: 'A CRM Report Agent is a great idea for automating your pipeline visibility. Let me help define the report templates.\n\nWhat metrics matter most?\n1. **Pipeline value** by stage\n2. **Conversion rates** between stages\n3. **Lead source performance**\n4. **Rep activity summary**', timestamp: '14:12' },
      { id: 'crm-rpt-3', role: 'user', content: 'All four, but pipeline value and conversion rates are the priority. Reports should go to Slack every Monday.', timestamp: '14:15' },
      { id: 'crm-rpt-4', role: 'steward', content: 'Got it. Here\'s the draft:\n\n**CRM Report Agent — Draft**\n- Reports: Pipeline value by stage, Conversion rates, Lead source performance, Rep activity\n- Delivery: Slack, every Monday 9am\n- Data source: HubSpot\n\nNext: I\'ll need the Slack channel and HubSpot API access. Ready to configure?', timestamp: '14:17' },
    ],
    run_agent_state: null,
  };
  return [defaultSession, crmSession, crmReportSession];
}

function initSessions(): Session[] {
  if (typeof window === 'undefined') return createSeedSessions();
  try {
    const raw = localStorage.getItem('af_sessions');
    const loaded: Session[] = raw ? JSON.parse(raw) : [];
    if (loaded.length > 0) {
      const cleaned = loaded.filter(s =>
        s.title || s.messages.some(m => m.role === 'user') || s.id === SEED_CRM_SESSION_ID || s.id === SEED_CRM_REPORT_ID
      );
      const emptySession = cleaned.find(s => !s.title && s.session_type === 'build_agent' && s.status === 'active');
      if (emptySession) return cleaned;
      const freshSession = createDefaultSession();
      return [freshSession, ...cleaned];
    }
  } catch { /* ignore */ }
  return createSeedSessions();
}

function initCurrentId(sessions: Session[]): string {
  const empty = sessions.find(s => !s.title && s.session_type === 'build_agent' && s.status === 'active');
  return empty ? empty.id : sessions[0].id;
}

interface SessionState {
  sessions: Session[];
  currentSessionId: string;

  createSession: (type: SessionType, opts?: {
    parentId?: string;
    agentId?: string;
    agentName?: string;
    agentEmoji?: string;
    initialMessage?: string;
  }) => string;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  updateSessionStatus: (sessionId: string, status: SessionStatus) => void;
  stopRunSession: () => void;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  updateRunAgentState: (partial: Partial<RunAgentSessionState>) => void;
  autoGenerateTitle: (firstMessage: string) => void;
  addReferenceToParent: (parentId: string, childSessionId: string, agentName: string, agentEmoji: string) => void;
  updateParentReference: (parentId: string, childSessionId: string, status: SessionStatus, summary?: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => {
      const initialSessions = initSessions();
      const initialCurrentId = initCurrentId(initialSessions);

      const updateSession = (id: string, updater: (s: Session) => Session) => {
        set(state => ({
          sessions: state.sessions.map(s => s.id === id ? updater(s) : s),
        }));
      };

      return {
        sessions: initialSessions,
        currentSessionId: initialCurrentId,

        createSession: (type, opts) => {
          const { sessions } = get();
          let title = opts?.agentName || '';
          if (title) {
            const existingCount = sessions.filter(s => s.title.startsWith(title)).length;
            if (existingCount > 0) {
              title = `${title} #${existingCount + 1}`;
            }
          }
          const newSession: Session = {
            id: generateId(),
            title,
            session_type: type,
            status: 'active',
            parent_session_id: opts?.parentId || null,
            agent_id: opts?.agentId || null,
            agent_name: opts?.agentName || null,
            agent_emoji: opts?.agentEmoji || null,
            created_at: Date.now(),
            updated_at: Date.now(),
            messages: [],
            run_agent_state: (type === 'run_task' || type === 'run_chat') ? {
              runAgentMode: true,
              chatflowMode: type === 'run_chat',
              configPhase: false,
              visibleScenarioCount: 0,
              visibleConfigCount: 0,
              visibleChatflowCount: 0,
              confirmedCardId: null,
              skippedIds: [],
              currentA2UI: null,
              runAgentInfo: opts?.agentName ? {
                name: opts.agentName,
                emoji: opts.agentEmoji || '🤖',
                version: '1.0',
              } : null,
            } : null,
          };
          set(state => ({
            sessions: [newSession, ...state.sessions],
            currentSessionId: newSession.id,
          }));
          return newSession.id;
        },

        switchSession: (sessionId) => {
          const { sessions } = get();
          if (sessions.some(s => s.id === sessionId)) {
            set({ currentSessionId: sessionId });
          }
        },

        deleteSession: (sessionId) => {
          const { currentSessionId } = get();
          set(state => {
            const filtered = state.sessions.filter(s => s.id !== sessionId);
            if (filtered.length === 0) {
              const newDefault = createDefaultSession();
              return { sessions: [newDefault], currentSessionId: newDefault.id };
            }
            if (sessionId === currentSessionId) {
              const nextSession = filtered.find(s => s.session_type === 'build_agent') || filtered[0];
              return { sessions: filtered, currentSessionId: nextSession.id };
            }
            return { sessions: filtered };
          });
        },

        updateSessionTitle: (sessionId, title) => {
          updateSession(sessionId, s => ({ ...s, title, updated_at: Date.now() }));
        },

        updateSessionStatus: (sessionId, status) => {
          updateSession(sessionId, s => ({ ...s, status, updated_at: Date.now() }));
        },

        addMessage: (msg) => {
          const { currentSessionId } = get();
          updateSession(currentSessionId, s => ({
            ...s,
            messages: [...s.messages, msg],
            updated_at: Date.now(),
          }));
        },

        setMessages: (msgs) => {
          const { currentSessionId } = get();
          updateSession(currentSessionId, s => ({
            ...s,
            messages: msgs,
            updated_at: Date.now(),
          }));
        },

        updateRunAgentState: (partial) => {
          const { currentSessionId } = get();
          updateSession(currentSessionId, s => ({
            ...s,
            run_agent_state: s.run_agent_state ? { ...s.run_agent_state, ...partial } : null,
            updated_at: Date.now(),
          }));
        },

        autoGenerateTitle: (firstMessage) => {
          const { currentSessionId, sessions } = get();
          const currentSession = sessions.find(s => s.id === currentSessionId);
          if (currentSession && !currentSession.title) {
            const title = generateSessionTitle(firstMessage, currentSession.session_type);
            updateSession(currentSessionId, s => ({ ...s, title, updated_at: Date.now() }));
          }
        },

        addReferenceToParent: (parentId, childSessionId, agentName, agentEmoji) => {
          const refMsg: ChatMessage = {
            id: generateId(),
            role: 'steward',
            content: `SESSION_REF:${childSessionId}:${agentEmoji}:${agentName}:running`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          updateSession(parentId, s => ({
            ...s,
            messages: [...s.messages, refMsg],
            updated_at: Date.now(),
          }));
        },

        updateParentReference: (parentId, childSessionId, status, summary) => {
          updateSession(parentId, s => ({
            ...s,
            messages: s.messages.map(m => {
              if (m.content.startsWith(`SESSION_REF:${childSessionId}:`)) {
                const parts = m.content.split(':');
                parts[4] = status;
                if (summary) parts[5] = summary;
                return { ...m, content: parts.join(':') };
              }
              return m;
            }),
            updated_at: Date.now(),
          }));
        },

        stopRunSession: () => {
          const { currentSessionId, sessions } = get();
          const currentSession = sessions.find(s => s.id === currentSessionId);
          if (!currentSession) return;

          const agentLabel = currentSession.agent_name || 'Agent';
          updateSession(currentSessionId, s => ({ ...s, status: 'stopped', updated_at: Date.now() }));

          const transitionMsg: ChatMessage = {
            id: generateId(),
            role: 'steward',
            content: `SESSION_ENDED:${agentLabel}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          updateSession(currentSessionId, s => ({
            ...s,
            messages: [...s.messages, transitionMsg],
            updated_at: Date.now(),
          }));

          const parentId = currentSession.parent_session_id;
          if (parentId && sessions.some(s => s.id === parentId)) {
            get().updateParentReference(parentId, currentSessionId, 'stopped', `Ran ${agentLabel} — processed 12 tasks, 11 succeeded, 1 needs review. Total duration: 3m 42s.`);
            setTimeout(() => set({ currentSessionId: parentId }), 800);
          } else {
        const otherSession = sessions.find(s => s.id !== currentSessionId && s.status === 'active');
            if (otherSession) {
              setTimeout(() => set({ currentSessionId: otherSession.id }), 800);
            } else {
              const newDefault = createDefaultSession();
              set(state => ({
                sessions: [newDefault, ...state.sessions],
              }));
              setTimeout(() => set({ currentSessionId: newDefault.id }), 800);
            }
          }
        },
      };
    },
    {
      name: 'af_sessions',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);

// Derived selectors
export function useCurrentSession() {
  return useSessionStore(state => {
    return state.sessions.find(s => s.id === state.currentSessionId) || state.sessions[0];
  });
}

export function useIsRunAgentSession() {
  const session = useCurrentSession();
  return session.session_type === 'run_task' || session.session_type === 'run_chat';
}

export function useMessages() {
  const session = useCurrentSession();
  return session.messages;
}

export function useRunAgentState() {
  const session = useCurrentSession();
  return session.run_agent_state;
}
