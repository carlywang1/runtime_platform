'use client';
import { useState, useEffect, useRef, useCallback, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, Plus } from 'lucide-react';
import { TypingIndicator, ParamConfirmCard, ResultCard } from '../components/runAgent/ScenarioCards';
import { scenario1Messages, configScenarioMessages } from '../data/runAgentScenarios';
import { chatflowMessages } from '../data/chatflowScenarios';
import type { ScenarioMessage, ExecLogLine } from '../data/runAgentScenarios';
import RunLogPanel from '../components/runAgent/RunLogPanel';

interface AgentInfo {
  id: string;
  name: string;
  emoji: string;
  version: string;
  status: string;
  mode: 'task' | 'chatflow';
}

const mockTeamLookup: Record<string, AgentInfo> = {
  'team-1': { id: 'team-1', name: 'OMS Agent v7', emoji: '🛒', version: 'v7', status: 'inactive', mode: 'chatflow' },
  'team-2': { id: 'team-2', name: 'Email Draft Assistant', emoji: '✉️', version: 'v7', status: 'running', mode: 'chatflow' },
  'team-3': { id: 'team-3', name: 'Warehouse Network Agent', emoji: '🏭', version: 'v5', status: 'running', mode: 'task' },
  'team-4': { id: 'team-4', name: 'WES Pick Agent', emoji: '📦', version: 'v22', status: 'config_required', mode: 'task' },
};

// OMS chatflow — 5-round multi-turn conversation
const omsChatflowMessages: ScenarioMessage[] = [
  // ── Opening ──
  {
    id: 'oms-0',
    role: 'steward',
    content: '**OMS Agent v7** is online and connected to your Shopify store. What can I help you with today?',
    timestamp: '14:30',
  },

  // ── Round 1: Pull orders ──
  {
    id: 'oms-1',
    role: 'user',
    content: 'Pull all orders from the last 48 hours, I want to see what\'s going on',
    timestamp: '14:30',
  },
  {
    id: 'oms-2',
    role: 'steward',
    content: '',
    timestamp: '14:30',
    card: {
      type: 'exec-log',
      done: true,
      progress: 100,
      lines: [
        { time: '14:30:12', text: 'Connecting to Shopify API...', status: 'info' },
        { time: '14:30:14', text: 'Authenticated successfully', status: 'ok' },
        { time: '14:30:16', text: 'Fetching orders (last 48h)...', status: 'info' },
        { time: '14:30:20', text: '93 orders found', status: 'ok' },
      ],
    },
  },
  {
    id: 'oms-3',
    role: 'steward',
    content: 'Here\'s the breakdown for the last 48 hours:\n\n- **93** total orders\n- **24** express shipping\n- **69** standard shipping\n- **3** orders flagged — payment pending\n- **5** orders delayed — awaiting stock\n\nAnything you want me to dig into?',
    timestamp: '14:31',
  },

  // ── Round 2: Handle delayed orders ──
  {
    id: 'oms-4',
    role: 'user',
    content: 'Those 5 delayed orders — can you check what SKUs are out of stock and find alternatives?',
    timestamp: '14:31',
  },
  {
    id: 'oms-5',
    role: 'steward',
    content: '',
    timestamp: '14:31',
    card: {
      type: 'exec-log',
      done: true,
      progress: 100,
      lines: [
        { time: '14:31:05', text: 'Analyzing 5 delayed orders...', status: 'info' },
        { time: '14:31:08', text: 'SKU-4821 (Blue Hoodie M): 0 in stock, 12 on order', status: 'warn' },
        { time: '14:31:10', text: 'SKU-4822 (Blue Hoodie L): 0 in stock, 8 on order', status: 'warn' },
        { time: '14:31:12', text: 'Checking warehouse B for alternatives...', status: 'info' },
        { time: '14:31:15', text: 'Found: SKU-4821 available at Warehouse B (qty: 6)', status: 'ok' },
        { time: '14:31:17', text: 'SKU-4822 — no alternatives, ETA restock: Apr 25', status: 'warn' },
      ],
    },
  },
  {
    id: 'oms-6',
    role: 'steward',
    content: 'Found the issue — two SKUs are out of stock:\n\n- **SKU-4821** (Blue Hoodie M): available at Warehouse B, I can reroute **3 orders** there\n- **SKU-4822** (Blue Hoodie L): no alternatives, restock ETA is **Apr 25** — affects **2 orders**\n\nWant me to reroute the 3 orders from Warehouse B and hold the other 2 until restock?',
    timestamp: '14:31',
  },

  // ── Round 3: Reroute + hold ──
  {
    id: 'oms-7',
    role: 'user',
    content: 'Yes, reroute those 3 and hold the other 2. Also upgrade the 3 rerouted ones to express since they\'re already delayed',
    timestamp: '14:32',
  },
  {
    id: 'oms-8',
    role: 'steward',
    content: '',
    timestamp: '14:32',
    card: {
      type: 'exec-log',
      done: true,
      progress: 100,
      lines: [
        { time: '14:32:02', text: 'Rerouting 3 orders to Warehouse B...', status: 'info' },
        { time: '14:32:05', text: 'Order #8847 rerouted + upgraded to express', status: 'ok' },
        { time: '14:32:07', text: 'Order #8851 rerouted + upgraded to express', status: 'ok' },
        { time: '14:32:09', text: 'Order #8856 rerouted + upgraded to express', status: 'ok' },
        { time: '14:32:11', text: 'Placing hold on 2 orders (#8849, #8853)...', status: 'info' },
        { time: '14:32:13', text: 'Hold placed — auto-release on restock', status: 'ok' },
      ],
    },
  },
  {
    id: 'oms-9',
    role: 'steward',
    content: 'Done:\n- **3 orders** rerouted to Warehouse B with express upgrade\n- **2 orders** on hold, will auto-release when SKU-4822 restocks (ETA Apr 25)\n\nShould I notify the affected customers about the status?',
    timestamp: '14:32',
  },

  // ── Round 4: Customer notifications ──
  {
    id: 'oms-10',
    role: 'user',
    content: 'Yes, send them updates. For the rerouted ones say it\'s on the way, for the held ones apologize and give the ETA',
    timestamp: '14:33',
  },
  {
    id: 'oms-11',
    role: 'steward',
    content: '',
    timestamp: '14:33',
    card: {
      type: 'exec-log',
      done: true,
      progress: 100,
      lines: [
        { time: '14:33:01', text: 'Generating notification templates...', status: 'info' },
        { time: '14:33:04', text: 'Sending "shipped with express" to 3 customers...', status: 'info' },
        { time: '14:33:07', text: '3/3 shipping notifications sent', status: 'ok' },
        { time: '14:33:09', text: 'Sending "delay apology + ETA" to 2 customers...', status: 'info' },
        { time: '14:33:12', text: '2/2 delay notifications sent', status: 'ok' },
      ],
    },
  },
  {
    id: 'oms-12',
    role: 'steward',
    content: 'All **5 customers** notified:\n- **3** received "your order has shipped (express)" with tracking links\n- **2** received an apology with restock ETA (Apr 25)\n\nNow — want me to process the remaining **88 normal orders** and sync inventory, or anything else first?',
    timestamp: '14:33',
  },

  // ── Round 5: Process remaining + final result ──
  {
    id: 'oms-13',
    role: 'user',
    content: 'Go ahead, process the rest and sync inventory across all channels',
    timestamp: '14:34',
  },
  {
    id: 'oms-14',
    role: 'steward',
    content: '',
    timestamp: '14:34',
    card: {
      type: 'exec-log',
      done: true,
      progress: 100,
      lines: [
        { time: '14:34:01', text: 'Processing 88 orders (24 express + 64 standard)...', status: 'info' },
        { time: '14:34:08', text: 'Batch 1/4 complete — 24 express orders routed', status: '' },
        { time: '14:34:15', text: 'Batch 2/4 complete — 22 standard orders routed', status: '' },
        { time: '14:34:22', text: 'Batch 3/4 complete — 22 standard orders routed', status: '' },
        { time: '14:34:28', text: 'Batch 4/4 complete — 20 standard orders routed', status: '' },
        { time: '14:34:32', text: 'Syncing inventory: Shopify ↔ Amazon ↔ Warehouse...', status: 'info' },
        { time: '14:34:38', text: 'Inventory sync complete — 7 SKUs adjusted', status: 'ok' },
        { time: '14:34:40', text: 'All orders processed successfully', status: 'ok' },
      ],
    },
  },
  {
    id: 'oms-15',
    role: 'steward',
    content: 'All done! Here\'s the full session summary:',
    timestamp: '14:35',
    card: {
      type: 'result-card',
      title: 'OMS Session Complete',
      body: 'Processed <strong>93 Shopify orders</strong> from the last 48 hours. <strong>3 delayed orders</strong> rerouted with express upgrade, <strong>2 orders</strong> on hold until restock. <strong>5 customers</strong> notified. Inventory synced across <strong>3 channels</strong> with <strong>7 SKU adjustments</strong>.',
      stats: [
        ['93', 'Orders Handled'],
        ['5', 'Issues Resolved'],
        ['7', 'SKUs Synced'],
      ],
      buttons: [],
    },
  },
];

function getScenarioConfig(teamId: string, mode: 'task' | 'chatflow') {
  if (mode === 'chatflow') {
    const messages = teamId === 'team-1' ? omsChatflowMessages : chatflowMessages;
    return { mode: 'chatflow' as const, chatflowMessages: messages, configMessages: [] as ScenarioMessage[], paramMessages: [] as ScenarioMessage[], needsConfig: false };
  }
  if (teamId === 'team-4') {
    return { mode: 'task' as const, chatflowMessages: [] as ScenarioMessage[], configMessages: configScenarioMessages, paramMessages: scenario1Messages, needsConfig: true };
  }
  return { mode: 'task' as const, chatflowMessages: [] as ScenarioMessage[], configMessages: [] as ScenarioMessage[], paramMessages: scenario1Messages, needsConfig: false };
}

export default function AgentRun({ params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMsg = searchParams.get('msg');
  const agent = mockTeamLookup[teamId];
  const scenario = getScenarioConfig(teamId, agent?.mode || 'task');
  const isChatflow = scenario.mode === 'chatflow';

  // Chatflow state
  const [visibleChatflowCount, setVisibleChatflowCount] = useState(isChatflow ? 1 : 0);
  const [chatflowChipStep, setChatflowChipStep] = useState(0);

  // Task state
  const [configPhase, setConfigPhase] = useState(scenario.needsConfig);
  const [visibleConfigCount, setVisibleConfigCount] = useState(scenario.needsConfig ? 1 : 0);
  const [visibleScenarioCount, setVisibleScenarioCount] = useState(!isChatflow && !scenario.needsConfig ? 1 : 0);
  const [scenarioChipStep, setScenarioChipStep] = useState(0);
  const [confirmedCardId, setConfirmedCardId] = useState<string | null>(null);

  // Shared state
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [runDone, setRunDone] = useState(false);

  // Sidebar log state
  const [runLogLines, setRunLogLines] = useState<ExecLogLine[]>([]);
  const [runLogStatus, setRunLogStatus] = useState<'running' | 'completed' | 'failed'>('running');
  const [showLogPanel, setShowLogPanel] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleChatflowCount, visibleConfigCount, visibleScenarioCount, isTyping, runDone]);

  // Auto-open sidebar and accumulate log lines when exec-log messages appear
  useEffect(() => {
    if (isChatflow && visibleChatflowCount > 0) {
      const visibleMsgs = scenario.chatflowMessages.slice(0, visibleChatflowCount);
      const allLines = visibleMsgs
        .filter(m => m.card?.type === 'exec-log' && m.card.lines)
        .flatMap(m => m.card!.lines!);
      if (allLines.length > 0) {
        setRunLogLines(allLines);
        const lastExec = [...visibleMsgs].reverse().find(m => m.card?.type === 'exec-log');
        setRunLogStatus(lastExec?.card?.done ? 'completed' : 'running');
        setShowLogPanel(true);
      }
    }
  }, [isChatflow, visibleChatflowCount, scenario.chatflowMessages]);

  useEffect(() => {
    if (!isChatflow && visibleScenarioCount > 0) {
      const visibleMsgs = scenario.paramMessages.slice(0, visibleScenarioCount);
      const allLines = visibleMsgs
        .filter(m => m.card?.type === 'exec-log' && m.card.lines)
        .flatMap(m => m.card!.lines!);
      if (allLines.length > 0) {
        setRunLogLines(allLines);
        const lastExec = [...visibleMsgs].reverse().find(m => m.card?.type === 'exec-log');
        setRunLogStatus(lastExec?.card?.done ? 'completed' : 'running');
        setShowLogPanel(true);
      }
    }
  }, [isChatflow, visibleScenarioCount, scenario.paramMessages]);

  // ── Chatflow chip handler ──
  // Each round: user(+1) → exec-log(+1) → steward(+1) = 3 messages per round
  // Messages: oms-0(opening), oms-1~3(R1), oms-4~6(R2), oms-7~9(R3), oms-10~12(R4), oms-13~15(R5)
  const handleChatflowChip = useCallback(() => {
    const base = visibleChatflowCount;
    setChatflowChipStep(-1);
    setVisibleChatflowCount(base + 1); // user message
    const t1 = setTimeout(() => setVisibleChatflowCount(base + 2), 800); // exec-log
    const t2 = setTimeout(() => {
      setVisibleChatflowCount(base + 3); // steward response
      const nextStep = chatflowChipStep + 1;
      if (nextStep >= 5) {
        setRunDone(true);
      } else {
        setChatflowChipStep(nextStep);
      }
    }, 3000);
    timersRef.current.push(t1, t2);
  }, [chatflowChipStep, visibleChatflowCount]);

  // ── Task chip handler ──
  const handleScenarioChip = useCallback((chipText: string) => {
    if (configPhase) {
      if (scenarioChipStep === 0) {
        setScenarioChipStep(-1);
        setVisibleConfigCount(2);
        const t1 = setTimeout(() => setVisibleConfigCount(3), 800);
        const t2 = setTimeout(() => { setVisibleConfigCount(4); setScenarioChipStep(1); }, 2000);
        timersRef.current.push(t1, t2);
      } else if (scenarioChipStep === 1) {
        setScenarioChipStep(-1);
        setVisibleConfigCount(5);
        const t1 = setTimeout(() => setVisibleConfigCount(6), 800);
        const t2 = setTimeout(() => { setVisibleConfigCount(7); setScenarioChipStep(2); }, 2000);
        timersRef.current.push(t1, t2);
      } else if (scenarioChipStep === 2) {
        setScenarioChipStep(-1);
        setConfirmedCardId('c1-6');
        setVisibleConfigCount(8);
        const t1 = setTimeout(() => {
          setVisibleConfigCount(scenario.configMessages.length);
          setConfigPhase(false);
          setVisibleScenarioCount(1);
          setScenarioChipStep(0);
        }, 2000);
        timersRef.current.push(t1);
      }
    } else {
      if (scenarioChipStep === 0) {
        setScenarioChipStep(-1);
        setVisibleScenarioCount(2);
        const t1 = setTimeout(() => setVisibleScenarioCount(3), 800);
        const t2 = setTimeout(() => { setVisibleScenarioCount(4); setScenarioChipStep(1); }, 2000);
        timersRef.current.push(t1, t2);
      } else if (scenarioChipStep === 1) {
        setScenarioChipStep(-1);
        setVisibleScenarioCount(5);
        const t1 = setTimeout(() => setVisibleScenarioCount(6), 800);
        const t2 = setTimeout(() => { setVisibleScenarioCount(7); setScenarioChipStep(2); }, 2000);
        timersRef.current.push(t1, t2);
      } else if (scenarioChipStep === 2) {
        setScenarioChipStep(-1);
        setVisibleScenarioCount(8);
        const t1 = setTimeout(() => setVisibleScenarioCount(9), 800);
        const t2 = setTimeout(() => { setVisibleScenarioCount(10); setScenarioChipStep(3); }, 2000);
        timersRef.current.push(t1, t2);
      }
    }
  }, [configPhase, scenarioChipStep, scenario.configMessages.length]);

  const handleRun = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setVisibleScenarioCount(11);
    setTimeout(() => setVisibleScenarioCount(12), 2000);
    setTimeout(() => setVisibleScenarioCount(13), 3500);
    setTimeout(() => { setVisibleScenarioCount(14); setRunDone(true); }, 7500);
  }, []);

  const handleConfigComplete = useCallback(() => {
    setConfigPhase(false);
    setVisibleConfigCount(scenario.configMessages.length);
    setVisibleScenarioCount(1);
    setScenarioChipStep(0);
  }, [scenario.configMessages.length]);

  // ── Render message ──
  const renderScenarioMessage = (msg: ScenarioMessage, isLatestCard: boolean) => {
    const card = msg.card;
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
            panelOpen={false}
            confirmed={confirmedCardId === msg.id}
            partial={card.partial}
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
              onClick={() => setShowLogPanel(true)}
              className="ml-auto text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View Logs
            </button>
          </div>
        )}
        {card?.type === 'result-card' && (
          <ResultCard title={card.title || ''} body={card.body || ''} stats={card.stats || []} buttons={card.buttons || []} />
        )}
      </div>
    );
  };

  // ── Chips ──
  const chatflowChipSets: Record<number, string[]> = teamId === 'team-1' ? {
    0: ['Pull all orders from the last 48 hours', 'Check express shipping status', 'Show me today\'s fulfillment queue'],
    1: ['Check what SKUs are out of stock and find alternatives', 'Skip the delayed ones for now', 'Escalate to warehouse team'],
    2: ['Reroute those 3 and hold the other 2, upgrade rerouted to express', 'Just reroute, no upgrade needed', 'Cancel the delayed orders instead'],
    3: ['Send them updates — shipped for rerouted, apology + ETA for held', 'Only notify the delayed ones', 'I\'ll handle notifications manually'],
    4: ['Process the rest and sync inventory across all channels', 'Just sync inventory, I\'ll process orders later', 'Show me a dry run first'],
  } : {
    0: ['Follow up with John from Acme Corp about the proposal', 'Draft a meeting invite for the team', 'Send a status update to the client'],
    1: ['Make it more formal and add a call scheduling offer', 'Looks good, send it as-is', 'Change the subject line'],
  };

  const configChipSets: Record<number, string[]> = {
    0: ['Endpoint is https://wes.acme.io/api/v2, station S-14', 'Use my existing credentials', 'I need to set up access first'],
    1: ['Token is omr_sk_a8f3...x9d1, use the default zone', 'Let me check the token', 'Switch to a different auth method'],
    2: ['Save configuration', 'Change the endpoint', 'Add another station'],
  };
  const paramChipSets: Record<number, string[]> = {
    0: ['Process Shopify orders and sync inventory', 'Just check for new orders', 'Run a full inventory scan'],
    1: ['Last 24 hours, prioritize express shipping', 'Last 48 hours, all orders', 'Custom time range'],
    2: ['Actually, change the time range to last 48 hours', 'Looks good, run it', 'Change priority filter'],
  };

  const chipStyle = "px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-400 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:text-gray-200 transition-all";

  const renderChips = () => {
    if (isTyping) return null;

    if (runDone) {
      const postRunChips = ['Run again with same parameters', 'Run again with different parameters', 'Back to team'];
      return (
        <div className="mb-3"><div className="flex flex-wrap gap-2">
          {postRunChips.map((chip, i) => (
            <button key={i} onClick={i === 2 ? () => router.push(`/teams/${teamId}`) : undefined} className={`${chipStyle}${i < 2 ? ' opacity-60 cursor-default' : ''}`}>
              {chip}
            </button>
          ))}
        </div></div>
      );
    }

    if (isChatflow) {
      const currentChips = chatflowChipSets[chatflowChipStep];
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

    const chipSets = configPhase ? configChipSets : paramChipSets;
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
  };

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Agent not found
      </div>
    );
  }

  // Compute visible messages
  const visibleChatflow = scenario.chatflowMessages.slice(0, visibleChatflowCount);
  const visibleConfig = scenario.configMessages.slice(0, visibleConfigCount);
  const visibleParams = scenario.paramMessages.slice(0, visibleScenarioCount);
  const configLastCardId = (() => {
    const msgs = visibleConfig.filter(m => m.card?.type === 'param-confirm');
    const last = msgs[msgs.length - 1];
    return last ? last.id : undefined;
  })();
  const paramLastCardId = (() => {
    const msgs = visibleParams.filter(m => m.card?.type === 'param-confirm');
    const last = msgs[msgs.length - 1];
    return last ? last.id : undefined;
  })();

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 bg-gradient-to-r from-indigo-950/80 to-purple-950/60 border-b border-indigo-500/30 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{agent.emoji}</span>
          <span className="text-sm font-medium text-white">{agent.name}</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/25 flex-shrink-0">
            <div className={`w-1.5 h-1.5 rounded-full ${runDone ? 'bg-emerald-400' : 'bg-indigo-400 animate-pulse'}`} />
            <span className={`text-[10px] font-medium ${runDone ? 'text-emerald-200' : 'text-indigo-200'}`}>
              {runDone ? 'Task Completed' : 'Task Running'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              timersRef.current.forEach(clearTimeout);
              timersRef.current = [];
              setVisibleChatflowCount(isChatflow ? 1 : 0);
              setChatflowChipStep(0);
              setConfigPhase(scenario.needsConfig);
              setVisibleConfigCount(scenario.needsConfig ? 1 : 0);
              setVisibleScenarioCount(!isChatflow && !scenario.needsConfig ? 1 : 0);
              setScenarioChipStep(0);
              setConfirmedCardId(null);
              setIsTyping(false);
              setInputValue('');
              setRunDone(false);
              setRunLogLines([]);
              setRunLogStatus('running');
              setShowLogPanel(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-white/8 border border-white/12 hover:bg-white/15 transition-colors"
          >
            <Plus size={12} />
            New Session
          </button>
          <button
            onClick={() => router.push('/teams')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-gray-300 bg-white/8 border border-white/12 hover:bg-white/15 transition-colors"
          >
            <ArrowLeft size={12} />
            Stop & Back
          </button>
        </div>
      </header>

      {/* Main content: chat + sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Chat + Input column */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Chat area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
        <div className="max-w-4xl mx-auto space-y-6">
          {initialMsg && (
            <div className="flex justify-end">
              <div
                className="max-w-2xl rounded-2xl px-4 py-2.5"
                style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed text-white">{initialMsg}</div>
              </div>
            </div>
          )}
          {isChatflow ? (
            <>
              {visibleChatflow.map((msg) => (
                <div key={msg.id} className={msg.role === 'user' ? 'flex justify-end' : ''}>
                  <div
                    className={msg.role === 'user' ? 'max-w-2xl rounded-2xl px-4 py-2.5' : 'max-w-3xl'}
                    style={msg.role === 'user' ? { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' } : undefined}
                  >
                    {renderScenarioMessage(msg, false)}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {visibleConfig.map((msg) => (
                <div key={msg.id} className={msg.role === 'user' ? 'flex justify-end' : ''}>
                  <div
                    className={msg.role === 'user' ? 'max-w-2xl rounded-2xl px-4 py-2.5' : 'max-w-3xl'}
                    style={msg.role === 'user' ? { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' } : undefined}
                  >
                    {renderScenarioMessage(msg, msg.id === configLastCardId)}
                  </div>
                </div>
              ))}
              {!configPhase && visibleParams.map((msg) => (
                <div key={msg.id} className={msg.role === 'user' ? 'flex justify-end' : ''}>
                  <div
                    className={msg.role === 'user' ? 'max-w-2xl rounded-2xl px-4 py-2.5' : 'max-w-3xl'}
                    style={msg.role === 'user' ? { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' } : undefined}
                  >
                    {renderScenarioMessage(msg, msg.id === paramLastCardId)}
                  </div>
                </div>
              ))}
            </>
          )}

          {isTyping && (
            <div className="flex items-center gap-2.5 px-4 py-3">
              <div className="w-4 h-4 rounded-full border-2 border-indigo border-t-transparent animate-spin" />
              <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="px-6 py-4 border-t border-white/5 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          {renderChips()}
          <div className="relative rounded-2xl border transition-colors bg-indigo-950/40 border-indigo-500/20 focus-within:border-indigo-500/40">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                }
              }}
              placeholder={`Chat with ${agent.name}...`}
              rows={3}
              className="w-full px-4 pt-4 pb-12 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none resize-none"
            />
            <div className="absolute bottom-3 right-3">
              <button className="p-2 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
        </div>

        {/* Sidebar: Run Log Panel */}
        {showLogPanel && (
          <div className="w-[35%] border-l border-white/5 bg-dark-100 flex flex-col overflow-hidden">
            <RunLogPanel
              lines={runLogLines}
              status={runLogStatus}
              agentName={agent.name}
              startedAt="14:33"
              onClose={() => setShowLogPanel(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function formatMessage(content: string) {
  const lines = content.split('\n');
  return lines.map((line, i) => {
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
    if (line.startsWith('---')) {
      return <span key={i} className="block h-px bg-white/10 my-3" />;
    }
    if (line.startsWith('- ')) {
      return (
        <span key={i} className="block pl-2">
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
