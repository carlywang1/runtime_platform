import type { ScenarioMessage } from './runAgentScenarios';

// OMS chatflow — 5-round multi-turn conversation
export const omsChatflowMessages: ScenarioMessage[] = [
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

export const omsChatflowChipSets: Record<number, string[]> = {
  0: ['Pull all orders from the last 48 hours', 'Check express shipping status', 'Show me today\'s fulfillment queue'],
  1: ['Check what SKUs are out of stock and find alternatives', 'Skip the delayed ones for now', 'Escalate to warehouse team'],
  2: ['Reroute those 3 and hold the other 2, upgrade rerouted to express', 'Just reroute, no upgrade needed', 'Cancel the delayed orders instead'],
  3: ['Send them updates — shipped for rerouted, apology + ETA for held', 'Only notify the delayed ones', 'I\'ll handle notifications manually'],
  4: ['Process the rest and sync inventory across all channels', 'Just sync inventory, I\'ll process orders later', 'Show me a dry run first'],
};
