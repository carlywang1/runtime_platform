import type { ScenarioMessage } from './runAgentScenarios';

// Chatflow scenario: Email Draft Confirmation Assistant
// Multi-turn conversational agent — user describes email, agent drafts, user refines, agent sends

export const chatflowMessages: ScenarioMessage[] = [
  {
    id: 'cf-0',
    role: 'steward',
    content: '**Email Draft & Send Assistant** is ready. Tell me what email you\'d like to send — who\'s the recipient, what\'s the topic, and any key points to include.',
    timestamp: '15:01',
  },
  {
    id: 'cf-1',
    role: 'user',
    content: 'I need to follow up with John from Acme Corp. We sent him a proposal last week and he hasn\'t responded yet. Remind him the pricing is valid until end of month.',
    timestamp: '15:01',
  },
  {
    id: 'cf-2',
    role: 'steward',
    content: '',
    timestamp: '15:01',
    card: {
      type: 'exec-log',
      done: true,
      progress: 100,
      lines: [
        { time: '15:01:12', text: 'Parsing email intent...', status: 'info' },
        { time: '15:01:13', text: 'Recipient: John @ Acme Corp', status: 'ok' },
        { time: '15:01:14', text: 'Context: proposal follow-up, pricing deadline', status: 'ok' },
        { time: '15:01:16', text: 'Generating draft...', status: 'info' },
        { time: '15:01:19', text: 'Draft ready', status: 'ok' },
      ],
    },
  },
  {
    id: 'cf-3',
    role: 'steward',
    content: 'Here\'s a draft:\n\n**Subject:** Following Up on Our Proposal\n\n---\n\nHi John,\n\nHope you\'re doing well! I wanted to circle back on the proposal we shared last week. We\'d love to hear your thoughts or answer any questions you might have.\n\nJust a heads-up — the pricing in the proposal is valid through the end of this month, so it\'d be great to connect before then.\n\nLooking forward to hearing from you!\n\nBest,\nTaylor\n\n---\n\nWant me to adjust the tone, add more details, or send it as-is?',
    timestamp: '15:01',
  },
  {
    id: 'cf-4',
    role: 'user',
    content: 'Make it more formal. And add that we can schedule a call this week to walk through the proposal.',
    timestamp: '15:02',
  },
  {
    id: 'cf-5',
    role: 'steward',
    content: '',
    timestamp: '15:02',
    card: {
      type: 'exec-log',
      done: true,
      progress: 100,
      lines: [
        { time: '15:02:05', text: 'Processing revision request...', status: 'info' },
        { time: '15:02:06', text: 'Adjustments: formal tone + add call scheduling', status: 'ok' },
        { time: '15:02:09', text: 'Revising draft...', status: 'info' },
        { time: '15:02:12', text: 'Revised draft ready', status: 'ok' },
      ],
    },
  },
  {
    id: 'cf-6',
    role: 'steward',
    content: 'Updated draft:\n\n**Subject:** Follow-Up: Proposal for Acme Corp Partnership\n\n---\n\nDear Mr. Johnson,\n\nI hope this message finds you well. I am writing to follow up on the proposal we submitted last week regarding our partnership opportunity.\n\nWe would greatly appreciate your feedback and are happy to address any questions or concerns you may have. Please note that the pricing outlined in the proposal remains valid through **April 30, 2026**.\n\nAdditionally, I would be glad to schedule a call at your convenience this week to walk through the proposal in detail.\n\nThank you for your time and consideration. I look forward to your response.\n\nBest regards,\nTaylor Zhang\n\n---\n\nTwo changes: formal tone throughout + added call scheduling offer. Ready to  or any other tweaks?',
    timestamp: '15:02',
  },
  {
    id: 'cf-7',
    role: 'user',
    content: 'Looks good, send it',
    timestamp: '15:03',
  },
  {
    id: 'cf-8',
    role: 'steward',
    content: '',
    timestamp: '15:03',
    card: {
      type: 'exec-log',
      done: true,
      progress: 100,
      lines: [
        { time: '15:03:01', text: 'Preparing to send email...', status: 'info' },
        { time: '15:03:02', text: 'Connecting to Gmail API...', status: 'info' },
        { time: '15:03:04', text: 'Authenticated as taylor@agentfactory.io', status: 'ok' },
        { time: '15:03:06', text: 'Sending to john.johnson@acmecorp.com...', status: 'info' },
        { time: '15:03:08', text: 'Email delivered successfully', status: 'ok' },
      ],
    },
  },
  {
    id: 'cf-9',
    role: 'steward',
    content: 'Done! Here\'s the summary:',
    timestamp: '15:03',
    chips: ['Draft another email', 'Run a different agent'],
    card: {
      type: 'result-card',
      title: 'Email Sent Successfully',
      body: 'Follow-up email sent to <strong>john.johnson@acmecorp.com</strong> regarding the Acme Corp proposal. Formal tone with call scheduling offer included. Pricing deadline: <strong>April 30, 2026</strong>.',
      stats: [
        ['1', 'Email Sent'],
        ['2', 'Revisions Made'],
        ['3m 08s', 'Total Time'],
      ],
      buttons: [],
    },
  },
];
