export interface ExecLogLine {
  time: string;
  text: string;
  status: '' | 'ok' | 'info' | 'warn';
}

export interface ScenarioCard {
  type: 'param-confirm' | 'exec-log' | 'result-card' | 'typing';
  agentLabel?: string;
  headerLabel?: string;
  rows?: [string, string, boolean?][];
  partial?: boolean;
  lines?: ExecLogLine[];
  progress?: number;
  done?: boolean;
  title?: string;
  body?: string;
  stats?: [string, string][];
  buttons?: { label: string; primary: boolean }[];
  typingText?: string;
}

export interface ScenarioMessage {
  id: string;
  role: 'user' | 'steward';
  content: string;
  timestamp: string;
  card?: ScenarioCard;
  chips?: string[];
}

// Right panel parameter fields (all filled after parameter collection)
export interface PanelParam {
  name: string;
  value: string;
  status: 'filled' | 'required' | 'optional';
}

// Right panel parameter fields — initial state: all empty
export const scenario1PanelParams: PanelParam[] = [
  { name: 'source_platform', value: '', status: 'required' },
  { name: 'time_range', value: '', status: 'required' },
  { name: 'sync_inventory', value: '', status: 'required' },
  { name: 'priority_filter', value: '', status: 'required' },
  { name: 'fulfillment_mode', value: '', status: 'optional' },
];

// Filled state: after steward extracts parameters from conversation
export const scenario1PanelParamsFilled: PanelParam[] = [
  { name: 'source_platform', value: 'Shopify', status: 'filled' },
  { name: 'time_range', value: 'Last 24 hours', status: 'filled' },
  { name: 'sync_inventory', value: 'true', status: 'filled' },
  { name: 'priority_filter', value: 'Express shipping', status: 'filled' },
  { name: 'fulfillment_mode', value: 'Auto (default)', status: 'filled' },
];

// Partial state: after first round of collection (only source_platform + sync_inventory)
export const scenario1PanelParamsPartial: PanelParam[] = [
  { name: 'source_platform', value: 'Shopify', status: 'filled' },
  { name: 'time_range', value: '', status: 'required' },
  { name: 'sync_inventory', value: 'true', status: 'filled' },
  { name: 'priority_filter', value: '', status: 'required' },
  { name: 'fulfillment_mode', value: '', status: 'optional' },
];

// Corrected state: after user corrects time_range to 48 hours
export const scenario1PanelParamsCorrected: PanelParam[] = [
  { name: 'source_platform', value: 'Shopify', status: 'filled' },
  { name: 'time_range', value: 'Last 48 hours', status: 'filled' },
  { name: 'sync_inventory', value: 'true', status: 'filled' },
  { name: 'priority_filter', value: 'Express shipping', status: 'filled' },
  { name: 'fulfillment_mode', value: 'Auto (default)', status: 'filled' },
];

// Agent files shown in the right panel
export const scenario1AgentFiles: { name: string; type: 'file' | 'folder' }[] = [
  { name: 'agent.yaml', type: 'file' },
  { name: 'README.md', type: 'file' },
  { name: 'src/', type: 'folder' },
  { name: 'src/index.ts', type: 'file' },
  { name: 'src/shopify-connector.ts', type: 'file' },
  { name: 'src/inventory-sync.ts', type: 'file' },
  { name: 'src/order-processor.ts', type: 'file' },
  { name: 'src/fulfillment-router.ts', type: 'file' },
  { name: 'src/utils.ts', type: 'file' },
  { name: 'config/', type: 'folder' },
  { name: 'config/default.json', type: 'file' },
  { name: 'config/shopify.json', type: 'file' },
  { name: 'tests/', type: 'folder' },
  { name: 'tests/order-processor.test.ts', type: 'file' },
];

// Mock file contents for agent files preview
export const agentFileContents: Record<string, string> = {
  'agent.yaml': `name: oms-multichannel-orders
version: 7.2.1
runtime: node-20
description: Multichannel order processing with inventory sync

triggers:
  - type: schedule
    cron: "*/30 * * * *"
  - type: webhook
    path: /orders/incoming

inputs:
  source_platform:
    type: string
    required: true
  time_range:
    type: string
    required: true
  sync_inventory:
    type: boolean
    required: true
  priority_filter:
    type: string
    required: true
  fulfillment_mode:
    type: string
    default: "auto"

permissions:
  - shopify:read_orders
  - shopify:write_inventory
  - warehouse:fulfillment`,
  'src/index.ts': `import { ShopifyConnector } from './shopify-connector';
import { InventorySync } from './inventory-sync';
import { OrderProcessor } from './order-processor';
import { FulfillmentRouter } from './fulfillment-router';

export async function handler(params: AgentParams) {
  const connector = new ShopifyConnector(params.source_platform);
  const orders = await connector.fetchOrders(params.time_range);

  const processor = new OrderProcessor(params.priority_filter);
  const processed = await processor.process(orders);

  if (params.sync_inventory) {
    const sync = new InventorySync();
    await sync.syncAll(processed.skuChanges);
  }

  const router = new FulfillmentRouter(params.fulfillment_mode);
  await router.route(processed.orders);

  return { processed: orders.length, synced: processed.skuChanges.length };
}`,
  'src/order-processor.ts': `export class OrderProcessor {
  constructor(private priorityFilter: string) {}

  async process(orders: Order[]) {
    const prioritized = orders.filter(
      (o) => o.shipping === this.priorityFilter
    );
    const remaining = orders.filter(
      (o) => o.shipping !== this.priorityFilter
    );

    const sorted = [...prioritized, ...remaining];
    const skuChanges = this.computeSkuDeltas(sorted);

    return { orders: sorted, skuChanges };
  }

  private computeSkuDeltas(orders: Order[]) {
    const deltas = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.items) {
        deltas.set(item.sku, (deltas.get(item.sku) || 0) - item.qty);
      }
    }
    return [...deltas.entries()].map(([sku, delta]) => ({ sku, delta }));
  }
}`,
  'config/default.json': `{
  "batchSize": 25,
  "retryAttempts": 3,
  "retryDelayMs": 1000,
  "timeoutMs": 30000,
  "logging": {
    "level": "info",
    "destination": "stdout"
  }
}`,
};

// Multi-round conversation — steward collects params in two rounds + correction
export const scenario1Messages: ScenarioMessage[] = [
  {
    id: 's1-0',
    role: 'steward',
    content: 'You\'ve selected to run **OMS Agent for Multichannel Orders and Inventory and Fulfillment v1**.\n\nI need a few details to get started. What orders should I process? For example: which platform, time range, and any priority filters?',
    timestamp: '14:31',
    chips: [],
    card: {
      type: 'param-confirm',
      partial: true,
      headerLabel: 'Execution Parameters',
      agentLabel: 'OMS Agent v7',
      rows: [
        ['Source Platform', '', true],
        ['Time Range', '', true],
        ['Sync Inventory', '', true],
        ['Priority Filter', '', true],
        ['Fulfillment Mode', '', false],
      ],
    },
  },
  {
    id: 's1-1',
    role: 'user',
    content: 'Process Shopify orders and sync inventory',
    timestamp: '14:31',
  },
  {
    id: 's1-2',
    role: 'steward',
    content: '',
    timestamp: '14:31',
    card: { type: 'typing', typingText: 'Extracting parameters...' },
  },
  {
    id: 's1-3',
    role: 'steward',
    content: 'Got it — I\'ve captured the **source platform** (Shopify) and **inventory sync** (enabled). I still need a couple more details:',
    timestamp: '14:31',
    chips: [],
    card: {
      type: 'param-confirm',
      partial: true,
      headerLabel: 'Execution Parameters',
      agentLabel: 'OMS Agent v7',
      rows: [
        ['Source Platform', 'Shopify', true],
        ['Time Range', '', true],
        ['Sync Inventory', 'Yes', true],
        ['Priority Filter', '', true],
        ['Fulfillment Mode', '', false],
      ],
    },
  },
  {
    id: 's1-4',
    role: 'user',
    content: 'Last 24 hours, prioritize express shipping',
    timestamp: '14:32',
  },
  {
    id: 's1-5',
    role: 'steward',
    content: '',
    timestamp: '14:32',
    card: { type: 'typing', typingText: 'Updating parameters...' },
  },
  {
    id: 's1-6',
    role: 'steward',
    content: 'All parameters collected. Here\'s what I\'ll run with — if anything looks off, just let me know and I\'ll update it, or click **Edit** to adjust directly.',
    timestamp: '14:32',
    chips: [],
    card: {
      type: 'param-confirm',
      headerLabel: 'Execution Parameters',
      agentLabel: 'OMS Agent v7',
      rows: [
        ['Source Platform', 'Shopify', true],
        ['Time Range', 'Last 24 hours', true],
        ['Sync Inventory', 'Yes', true],
        ['Priority Filter', 'Express shipping', true],
        ['Fulfillment Mode', 'Auto (default)', false],
      ],
    },
  },
  {
    id: 's1-7',
    role: 'user',
    content: 'Actually, change the time range to last 48 hours',
    timestamp: '14:32',
  },
  {
    id: 's1-8',
    role: 'steward',
    content: '',
    timestamp: '14:32',
    card: { type: 'typing', typingText: 'Updating parameters...' },
  },
  {
    id: 's1-9',
    role: 'steward',
    content: 'Updated! **Time range** changed to last 48 hours. Here\'s the revised config:',
    timestamp: '14:33',
    chips: [],
    card: {
      type: 'param-confirm',
      headerLabel: 'Execution Parameters',
      agentLabel: 'OMS Agent v7',
      rows: [
        ['Source Platform', 'Shopify', true],
        ['Time Range', 'Last 48 hours', true],
        ['Sync Inventory', 'Yes', true],
        ['Priority Filter', 'Express shipping', true],
        ['Fulfillment Mode', 'Auto (default)', false],
      ],
    },
  },
  {
    id: 's1-10',
    role: 'user',
    content: 'Starting **OMS Agent v7** with: **Shopify** orders, **last 48 hours**, **express shipping** priority, inventory sync enabled.',
    timestamp: '14:33',
  },
  {
    id: 's1-11',
    role: 'steward',
    content: '',
    timestamp: '14:33',
    card: { type: 'typing', typingText: 'Executing OMS Agent...' },
  },
  {
    id: 's1-12',
    role: 'steward',
    content: '',
    timestamp: '14:33',
    chips: [],
    card: {
      type: 'exec-log',
      done: true,
      progress: 100,
      lines: [
        { time: '14:33:01', text: 'Initializing OMS Agent v7...', status: 'info' },
        { time: '14:33:03', text: 'Connected to Shopify API', status: 'ok' },
        { time: '14:33:05', text: 'Fetching orders (last 48h)... 93 orders found', status: '' },
        { time: '14:33:08', text: 'Filtering express shipping... 24 priority orders', status: 'info' },
        { time: '14:33:15', text: 'Processing batch 1/4... 24 orders', status: '' },
        { time: '14:33:28', text: 'Processing batch 2/4... 24 orders', status: '' },
        { time: '14:33:41', text: 'Processing batch 3/4... 24 orders', status: '' },
        { time: '14:33:52', text: 'Processing batch 4/4... 21 orders', status: '' },
        { time: '14:33:58', text: 'Syncing inventory across channels...', status: 'info' },
        { time: '14:34:05', text: 'Inventory sync complete. 7 SKUs updated', status: 'ok' },
        { time: '14:34:07', text: 'All 93 orders processed successfully', status: 'ok' },
      ],
    },
  },
  {
    id: 's1-13',
    role: 'steward',
    content: 'All done! Here are the results:',
    timestamp: '14:34',
    chips: ['Run again with same parameters', 'Run again with different parameters', 'Run a different agent'],
    card: {
      type: 'result-card',
      title: 'OMS Agent Completed Successfully',
      body: 'Processed <strong>93 Shopify orders</strong> from the last 48 hours. <strong>24 express orders</strong> were prioritized. Inventory synced across all channels with <strong>7 SKU adjustments</strong>.',
      stats: [
        ['93', 'Orders Processed'],
        ['24', 'Express Priority'],
        ['7', 'SKUs Updated'],
      ],
      buttons: [],
    },
  },
];

// ── Config phase data (for unconfigured agents) ──

export interface ConfigField {
  name: string;
  label: string;
  description: string;
  placeholder: string;
  required: boolean;
  value: string;
}

export const configFields: ConfigField[] = [
  { name: 'base_url', label: 'Base URL', description: 'Backend base URL for WCS/WES APIs.', placeholder: '--session-param base_url=https://example-wcs', required: true, value: '' },
  { name: 'device_id', label: 'Device ID', description: 'Stable manual-station device identity used to resolve or bind the chosen station.', placeholder: '--session-param device_id=<device-id>', required: true, value: '' },
  { name: 'target_station_id', label: 'Target Station ID', description: 'Optional explicit station id. If omitted, the agent auto-selects only when exactly one safe candidate station exists.', placeholder: '--session-param target_station_id=123', required: false, value: '' },
  { name: 'auth_token', label: 'Auth Token', description: 'OMRON API authentication token for shelf-to-person system access.', placeholder: '--session-param auth_token=omr_sk_...', required: true, value: '' },
];

export const configFieldsPartial: ConfigField[] = [
  { name: 'base_url', label: 'Base URL', description: 'Backend base URL for WCS/WES APIs.', placeholder: '--session-param base_url=https://example-wcs', required: true, value: 'https://wes.acme.io/api/v2' },
  { name: 'device_id', label: 'Device ID', description: 'Stable manual-station device identity used to resolve or bind the chosen station.', placeholder: '--session-param device_id=<device-id>', required: true, value: 'S-14' },
  { name: 'target_station_id', label: 'Target Station ID', description: 'Optional explicit station id. If omitted, the agent auto-selects only when exactly one safe candidate station exists.', placeholder: '--session-param target_station_id=123', required: false, value: '' },
  { name: 'auth_token', label: 'Auth Token', description: 'OMRON API authentication token for shelf-to-person system access.', placeholder: '--session-param auth_token=omr_sk_...', required: true, value: '' },
];

export const configFieldsFilled: ConfigField[] = [
  { name: 'base_url', label: 'Base URL', description: 'Backend base URL for WCS/WES APIs.', placeholder: '--session-param base_url=https://example-wcs', required: true, value: 'https://wes.acme.io/api/v2' },
  { name: 'device_id', label: 'Device ID', description: 'Stable manual-station device identity used to resolve or bind the chosen station.', placeholder: '--session-param device_id=<device-id>', required: true, value: 'S-14' },
  { name: 'target_station_id', label: 'Target Station ID', description: 'Optional explicit station id. If omitted, the agent auto-selects only when exactly one safe candidate station exists.', placeholder: '--session-param target_station_id=123', required: false, value: 'Station-123' },
  { name: 'auth_token', label: 'Auth Token', description: 'OMRON API authentication token for shelf-to-person system access.', placeholder: '--session-param auth_token=omr_sk_...', required: true, value: 'omr_sk_a8f3...x9d1' },
];

export const configAgentFiles: { name: string; type: 'file' | 'folder' }[] = [
  { name: 'agent.yaml', type: 'file' },
  { name: 'README.md', type: 'file' },
  { name: 'src/', type: 'folder' },
  { name: 'src/index.ts', type: 'file' },
  { name: 'src/pick-executor.ts', type: 'file' },
  { name: 'src/omron-connector.ts', type: 'file' },
  { name: 'src/station-manager.ts', type: 'file' },
  { name: 'config/', type: 'folder' },
  { name: 'config/default.json', type: 'file' },
  { name: 'tests/', type: 'folder' },
  { name: 'tests/pick-executor.test.ts', type: 'file' },
];

export const configScenarioMessages: ScenarioMessage[] = [
  {
    id: 'c1-0',
    role: 'steward',
    content: 'Before we can run this agent, it needs some environment configuration first.\n\nI\'ll need a few details: your **WES API endpoint**, **station ID**, and **OMRON auth token**. What\'s your API endpoint and station?',
    timestamp: '14:30',
    chips: [],
    card: {
      type: 'param-confirm',
      partial: true,
      headerLabel: 'Environment Configuration',
      agentLabel: 'WES Agent',
      rows: [
        ['WES API Endpoint', '', true],
        ['Station ID', '', true],
        ['OMRON Auth Token', '', true],
        ['Pick Zone', '', false],
      ],
    },
  },
  {
    id: 'c1-1',
    role: 'user',
    content: 'Endpoint is https://wes.acme.io/api/v2, station S-14',
    timestamp: '14:30',
  },
  {
    id: 'c1-2',
    role: 'steward',
    content: '',
    timestamp: '14:30',
    card: { type: 'typing', typingText: 'Extracting configuration...' },
  },
  {
    id: 'c1-3',
    role: 'steward',
    content: 'Got it — **API endpoint** and **station ID** are captured. I still need a couple more:',
    timestamp: '14:30',
    chips: [],
    card: {
      type: 'param-confirm',
      partial: true,
      headerLabel: 'Environment Configuration',
      agentLabel: 'WES Agent',
      rows: [
        ['WES API Endpoint', 'https://wes.acme.io/api/v2', true],
        ['Station ID', 'S-14', true],
        ['OMRON Auth Token', '', true],
        ['Pick Zone', '', false],
      ],
    },
  },
  {
    id: 'c1-4',
    role: 'user',
    content: 'Token is omr_sk_a8f3...x9d1, use the default zone',
    timestamp: '14:31',
  },
  {
    id: 'c1-5',
    role: 'steward',
    content: '',
    timestamp: '14:31',
    card: { type: 'typing', typingText: 'Saving configuration...' },
  },
  {
    id: 'c1-6',
    role: 'steward',
    content: 'Configuration complete! Here\'s what I\'ve saved — you can update these anytime in agent settings.',
    timestamp: '14:31',
    chips: [],
    card: {
      type: 'param-confirm',
      headerLabel: 'Environment Configuration',
      agentLabel: 'WES Agent',
      rows: [
        ['WES API Endpoint', 'https://wes.acme.io/api/v2', true],
        ['Station ID', 'S-14', true],
        ['OMRON Auth Token', 'omr_sk_a8f3...x9d1', true],
        ['Pick Zone', 'Zone B (default)', false],
      ],
    },
  },
  {
    id: 'c1-7',
    role: 'user',
    content: 'Save configuration for **WES Agent** with: **WES API** https://wes.acme.io/api/v2, **Station** S-14, **Auth Token** omr_sk_a8f3...x9d1.',
    timestamp: '14:31',
  },
  {
    id: 'c1-8',
    role: 'steward',
    content: 'Now let\'s set up the run parameters. What task should I execute? For example: pick list, batch size, and priority.',
    timestamp: '14:31',
    chips: [],
  },
];