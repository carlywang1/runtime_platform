// Mock data for the Build Agent conversation flow

import type { ConfigField, ScenarioMessage } from './runAgentScenarios';

export const generatedAgentFiles: Record<string, string> = {
  'agents/customer-service-email-assistant.yaml': `name: customer-service-email-assistant
model: openai:gpt-4o
description: "Reads customer emails, classifies by type, drafts professional replies, and routes for manager approval"
instructions:
  - "Read incoming customer emails from Outlook inbox"
  - "Classify each email into categories: complaint, order-inquiry, delivery-status, returns"
  - "Draft a polite, professional reply addressing the customer's concern"
  - "If key details are missing, draft a follow-up question to the customer"
  - "Route all draft replies to manager for approval before sending"
  - "Maintain warm, professional tone in all communications"
  - "Log every interaction for audit trail"
output_schema:
  type: object
  properties:
    control:
      type: object
      required: [status]
      properties:
        status:
          type: string
          enum: [running, finished, failed]
        visible_reply:
          type: string
        reason:
          type: string
    final_output:
      type: object
      properties:
        email_classification:
          type: string
          enum: [complaint, order-inquiry, delivery-status, returns, general]
        draft_reply:
          type: string
        requires_followup:
          type: boolean
        followup_question:
          type: string
        confidence_score:
          type: number
  required: [control]
capabilities:
  - email_read
  - email_send
  - classification
  - template_rendering
model_settings:
  max_tokens: 4096
  temperature: 0.3
metadata:
  category: customer-service
  version: "1.0"
  author: steward`,

  'workflow.yaml': `name: email-assistant-workflow
description: "End-to-end customer email handling with approval gate"

triggers:
  - type: schedule
    cron: "*/5 * * * *"
    description: "Poll inbox every 5 minutes"
  - type: webhook
    path: /incoming-email
    description: "Real-time email notification"

steps:
  - id: fetch_emails
    agent: customer-service-email-assistant
    action: read_inbox
    config:
      provider: outlook
      folder: inbox
      unread_only: true
      max_batch: 20

  - id: classify
    agent: customer-service-email-assistant
    action: classify_email
    input: "{{ fetch_emails.output }}"
    config:
      categories:
        - complaint
        - order-inquiry
        - delivery-status
        - returns
        - general

  - id: draft_reply
    agent: customer-service-email-assistant
    action: generate_reply
    input: "{{ classify.output }}"
    config:
      tone: professional
      max_length: 500
      include_greeting: true
      include_signature: true

  - id: check_missing_info
    condition: "{{ draft_reply.output.requires_followup == true }}"
    agent: customer-service-email-assistant
    action: generate_followup
    input: "{{ draft_reply.output }}"

  - id: approval_gate
    type: human_approval
    assignee: manager
    timeout: 4h
    input: "{{ draft_reply.output.draft_reply }}"
    on_timeout: escalate

  - id: send_reply
    agent: customer-service-email-assistant
    action: send_email
    input: "{{ approval_gate.approved_content }}"
    condition: "{{ approval_gate.status == 'approved' }}"

error_handling:
  retry:
    max_attempts: 3
    backoff: exponential
  on_failure: notify_admin`,

  'skills/email-reader/SKILL.md': `---
name: email-reader
description: "Connects to Outlook via Microsoft Graph API and reads incoming customer emails with filtering and batching support"
---

# email-reader

Reads customer emails from a configured Outlook inbox.

## Capabilities
- Connect to Outlook via Microsoft Graph API
- Filter unread emails from inbox
- Batch processing (configurable batch size)
- Extract sender, subject, body, attachments metadata
- Mark emails as read after processing

## Configuration
- \`provider\`: Email provider (outlook)
- \`folder\`: Target folder (default: inbox)
- \`unread_only\`: Only fetch unread emails (default: true)
- \`max_batch\`: Maximum emails per batch (default: 20)

## Output
Returns array of email objects with: id, sender, subject, body, received_at, has_attachments`,

  'skills/reply-drafter/SKILL.md': `---
name: reply-drafter
description: "Drafts professional email replies based on email classification and customer context"
---

# reply-drafter

Generates contextual email replies based on classification results.

## Capabilities
- Draft replies matching email category (complaint, order, delivery, returns)
- Maintain consistent professional-warm tone
- Detect missing information and generate follow-up questions
- Apply email templates with dynamic content
- Include proper greeting and signature

## Configuration
- \`tone\`: Reply tone (default: professional)
- \`max_length\`: Maximum reply length in words (default: 500)
- \`include_greeting\`: Add greeting line (default: true)
- \`include_signature\`: Add signature block (default: true)

## Output
Returns: draft_reply, requires_followup, followup_question, confidence_score`,
};

export const buildAgentChips = {
  step1: 'Create an email assistant that reads customer emails, drafts replies, and handles follow-ups',
  step2: 'An email assistant that reads customer emails, drafts polite replies, asks follow-up questions when details are missing, and sends only after manager approval.',
  step3: 'Outlook, classify by complaint/order/delivery/returns, ask customer directly, professional and warm, approval required for every email.',
  step4: '我想测试一下效果',
  step5: 'Tenant 8a2f3b1c-e9d4-4a7b-b5f1-3c8e6d2a9f0b, Client e4d7a9f0-1b3c-4d5e-a6f7-8g9h0i1j2k3l, 邮箱 support@acme.com, 审批人 sarah@acme.com',
  step6: '就叫测试环境吧',
  step7: '我想进行 debug run，测试邮箱 complaint-test@example.com，发给 support@acme.com',
  step9: '分类不够准确，需要增加 general 类别并调整回复模板',
  step10_reuse: '继续测试，使用之前的「测试环境」配置',
  step10_debugRun: '我想进行 debug run，测试邮箱 order-inquiry@example.com，发给 support@acme.com',
  step12: '当前测试没有问题了',
  step13: 'Tenant prod-a1b2c3d4-e5f6-7890-abcd-ef1234567890, Client prod-x9y8z7w6-v5u4-3210-mnop-qr9876543210, 邮箱 cs@acme-prod.com, 审批人 manager@acme-prod.com',
  step14: '就叫正式环境吧',
  step15: '确认发布，我们正式跑一次',
  step4_options: [
    'Increase batch size to 50 and add auto-escalation for complaints',
    'Change approval to complaints only, auto-send the rest',
    'Add delivery tracking integration',
  ],
};

// ── Email Assistant Config & Run Data ──

export const emailConfigFields: ConfigField[] = [
  { name: 'outlook_tenant_id', label: 'Outlook Tenant ID', description: 'Microsoft 365 tenant ID for Graph API access.', placeholder: '--session-param outlook_tenant_id=xxxxxxxx-xxxx-...', required: true, value: '' },
  { name: 'outlook_client_id', label: 'Client ID', description: 'Azure AD app registration client ID.', placeholder: '--session-param outlook_client_id=xxxxxxxx-xxxx-...', required: true, value: '' },
  { name: 'mailbox', label: 'Mailbox', description: 'Target mailbox to monitor for incoming customer emails.', placeholder: '--session-param mailbox=support@acme.com', required: true, value: '' },
  { name: 'approval_email', label: 'Manager Email', description: 'Manager email for reply approval routing.', placeholder: '--session-param approval_email=manager@acme.com', required: true, value: '' },
];

// Test environment config — one round (steward asks -> user answers all -> typing -> confirm card)
export const emailConfigScenarioMessages: ScenarioMessage[] = [
  {
    id: 'c1-0',
    role: 'steward',
    content: '在开始 debug run 之前，需要先配置测试环境。请提供以下信息：\n\n**Outlook Tenant ID**、**Client ID**、**目标邮箱**、**审批人邮箱**。',
    timestamp: '14:30',
    chips: [],
    card: {
      type: 'param-confirm',
      partial: true,
      headerLabel: '测试环境配置',
      agentLabel: 'Email Assistant',
      rows: [
        ['Outlook Tenant ID', '', true],
        ['Client ID', '', true],
        ['Mailbox', '', true],
        ['Manager Email', '', true],
      ],
    },
  },
  {
    id: 'c1-1',
    role: 'user',
    content: 'Tenant 8a2f3b1c-e9d4-4a7b-b5f1-3c8e6d2a9f0b, Client e4d7a9f0-1b3c-4d5e-a6f7-8g9h0i1j2k3l, 邮箱 support@acme.com, 审批人 sarah@acme.com',
    timestamp: '14:30',
  },
  {
    id: 'c1-2',
    role: 'steward',
    content: '',
    timestamp: '14:30',
    card: { type: 'typing', typingText: '保存配置中...' },
  },
  {
    id: 'c1-3',
    role: 'steward',
    content: '测试环境配置完成！',
    timestamp: '14:31',
    chips: [],
    card: {
      type: 'param-confirm',
      headerLabel: '测试环境配置',
      agentLabel: 'Email Assistant',
      rows: [
        ['Outlook Tenant ID', '8a2f3b1c-e9d4-...', true],
        ['Client ID', 'e4d7a9f0-1b3c-...', true],
        ['Mailbox', 'support@acme.com', true],
        ['Manager Email', 'sarah@acme.com', true],
      ],
    },
  },
];

// Production environment config — one round (different param values)
export const prodConfigScenarioMessages: ScenarioMessage[] = [
  {
    id: 'pc-0',
    role: 'steward',
    content: '发布前需要为 runtime 配置正式环境。请提供正式环境的参数：\n\n**Outlook Tenant ID**、**Client ID**、**目标邮箱**、**审批人邮箱**。',
    timestamp: '14:40',
    chips: [],
    card: {
      type: 'param-confirm',
      partial: true,
      headerLabel: '正式环境配置',
      agentLabel: 'Email Assistant',
      rows: [
        ['Outlook Tenant ID', '', true],
        ['Client ID', '', true],
        ['Mailbox', '', true],
        ['Manager Email', '', true],
      ],
    },
  },
  {
    id: 'pc-1',
    role: 'user',
    content: 'Tenant prod-a1b2c3d4-e5f6-7890-abcd-ef1234567890, Client prod-x9y8z7w6-v5u4-3210-mnop-qr9876543210, 邮箱 cs@acme-prod.com, 审批人 manager@acme-prod.com',
    timestamp: '14:40',
  },
  {
    id: 'pc-2',
    role: 'steward',
    content: '',
    timestamp: '14:40',
    card: { type: 'typing', typingText: '保存配置中...' },
  },
  {
    id: 'pc-3',
    role: 'steward',
    content: '正式环境配置完成！',
    timestamp: '14:41',
    chips: [],
    card: {
      type: 'param-confirm',
      headerLabel: '正式环境配置',
      agentLabel: 'Email Assistant',
      rows: [
        ['Outlook Tenant ID', 'prod-a1b2c3d4-...', true],
        ['Client ID', 'prod-x9y8z7w6-...', true],
        ['Mailbox', 'cs@acme-prod.com', true],
        ['Manager Email', 'manager@acme-prod.com', true],
      ],
    },
  },
];

// Debug run #1 — simplified (skip param collection, direct exec-log + result)
export const debugRunScenarioMessages: ScenarioMessage[] = [
  {
    id: 'dr-0',
    role: 'user',
    content: '我想进行 debug run，测试邮箱 complaint-test@example.com，发给 support@acme.com',
    timestamp: '14:33',
  },
  {
    id: 'dr-1',
    role: 'steward',
    content: '',
    timestamp: '14:33',
    card: { type: 'typing', typingText: 'Executing debug run...' },
  },
  {
    id: 'dr-2',
    role: 'steward',
    content: '',
    timestamp: '14:33',
    chips: [],
    card: {
      type: 'exec-log',
      done: true,
      progress: 100,
      lines: [
        { time: '14:33:01', text: 'Initializing Email Assistant (debug mode)...', status: 'info' },
        { time: '14:33:03', text: 'Connected to Outlook Graph API (test env)', status: 'ok' },
        { time: '14:33:05', text: 'Fetching test email: complaint-test@example.com', status: '' },
        { time: '14:33:07', text: 'Classifying email... category: complaint', status: 'info' },
        { time: '14:33:10', text: 'Drafting reply for complaint: "Product quality issue"', status: '' },
        { time: '14:33:13', text: 'Draft reply sent to sarah@acme.com for approval', status: 'ok' },
        { time: '14:33:14', text: 'Debug run completed', status: 'ok' },
      ],
    },
  },
  {
    id: 'dr-3',
    role: 'steward',
    content: 'Debug run 完成！结果如下：',
    timestamp: '14:34',
    chips: [],
    card: {
      type: 'result-card',
      title: 'Debug Run — Email Assistant',
      body: '处理了 <strong>1 封测试邮件</strong>（complaint-test@example.com）。分类为 <strong>complaint</strong>，已生成回复草稿并发送给审批人。',
      stats: [
        ['1', 'Email Processed'],
        ['1', 'Reply Drafted'],
        ['complaint', 'Classification'],
      ],
      buttons: [],
    },
  },
];

// Debug run #2 — after agent update (different test email, updated classification)
export const debugRun2ScenarioMessages: ScenarioMessage[] = [
  {
    id: 'dr2-0',
    role: 'user',
    content: '我想进行 debug run，测试邮箱 order-inquiry@example.com，发给 support@acme.com',
    timestamp: '14:38',
  },
  {
    id: 'dr2-1',
    role: 'steward',
    content: '',
    timestamp: '14:38',
    card: { type: 'typing', typingText: 'Executing debug run...' },
  },
  {
    id: 'dr2-2',
    role: 'steward',
    content: '',
    timestamp: '14:38',
    chips: [],
    card: {
      type: 'exec-log',
      done: true,
      progress: 100,
      lines: [
        { time: '14:38:01', text: 'Initializing Email Assistant (debug mode, updated spec)...', status: 'info' },
        { time: '14:38:03', text: 'Connected to Outlook Graph API (test env: 测试环境)', status: 'ok' },
        { time: '14:38:05', text: 'Fetching test email: order-inquiry@example.com', status: '' },
        { time: '14:38:07', text: 'Classifying email... category: order-inquiry', status: 'info' },
        { time: '14:38:09', text: 'Applied updated reply template (with general category support)', status: 'ok' },
        { time: '14:38:12', text: 'Drafting reply for order inquiry: "Order status check"', status: '' },
        { time: '14:38:15', text: 'Draft reply sent to sarah@acme.com for approval', status: 'ok' },
        { time: '14:38:16', text: 'Debug run completed', status: 'ok' },
      ],
    },
  },
  {
    id: 'dr2-3',
    role: 'steward',
    content: 'Debug run 完成！结果如下：',
    timestamp: '14:39',
    chips: [],
    card: {
      type: 'result-card',
      title: 'Debug Run #2 — Email Assistant (Updated)',
      body: '处理了 <strong>1 封测试邮件</strong>（order-inquiry@example.com）。分类为 <strong>order-inquiry</strong>，使用更新后的模板生成回复草稿。新增的 general 类别已生效。',
      stats: [
        ['1', 'Email Processed'],
        ['1', 'Reply Drafted'],
        ['order-inquiry', 'Classification'],
      ],
      buttons: [],
    },
  },
];

// Full run scenario (kept for Teams run flow — not used in build flow)
export const emailScenarioMessages: ScenarioMessage[] = [
  {
    id: 's1-0',
    role: 'steward',
    content: 'You\'re running **Customer Service Email Assistant**.\n\nI need a few details to get started. Which emails should I process? For example: time range, categories, and any special handling rules?',
    timestamp: '14:31',
    chips: [],
    card: {
      type: 'param-confirm',
      partial: true,
      headerLabel: 'Execution Parameters',
      agentLabel: 'Email Assistant',
      rows: [
        ['Time Range', '', true],
        ['Categories', '', true],
        ['Reply Tone', '', true],
        ['Approval Rule', '', true],
        ['Max Batch Size', '', false],
      ],
    },
  },
  {
    id: 's1-1',
    role: 'user',
    content: 'Process unread emails from the last 6 hours, handle complaints and order inquiries',
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
    content: 'Got it — **time range** and **categories** are set. A couple more details:',
    timestamp: '14:31',
    chips: [],
    card: {
      type: 'param-confirm',
      partial: true,
      headerLabel: 'Execution Parameters',
      agentLabel: 'Email Assistant',
      rows: [
        ['Time Range', 'Last 6 hours', true],
        ['Categories', 'Complaints, Order inquiries', true],
        ['Reply Tone', '', true],
        ['Approval Rule', '', true],
        ['Max Batch Size', '', false],
      ],
    },
  },
  {
    id: 's1-4',
    role: 'user',
    content: 'Professional and warm tone, require approval for every reply',
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
    content: 'All parameters collected. Here\'s what I\'ll run with — if anything looks off, just let me know.',
    timestamp: '14:32',
    chips: [],
    card: {
      type: 'param-confirm',
      headerLabel: 'Execution Parameters',
      agentLabel: 'Email Assistant',
      rows: [
        ['Time Range', 'Last 6 hours', true],
        ['Categories', 'Complaints, Order inquiries', true],
        ['Reply Tone', 'Professional & warm', true],
        ['Approval Rule', 'Every reply', true],
        ['Max Batch Size', '20 (default)', false],
      ],
    },
  },
  {
    id: 's1-7',
    role: 'user',
    content: 'Actually, include delivery-status emails too',
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
    content: 'Updated! **Categories** now include delivery-status. Here\'s the revised config:',
    timestamp: '14:33',
    chips: [],
    card: {
      type: 'param-confirm',
      headerLabel: 'Execution Parameters',
      agentLabel: 'Email Assistant',
      rows: [
        ['Time Range', 'Last 6 hours', true],
        ['Categories', 'Complaints, Order inquiries, Delivery status', true],
        ['Reply Tone', 'Professional & warm', true],
        ['Approval Rule', 'Every reply', true],
        ['Max Batch Size', '20 (default)', false],
      ],
    },
  },
  {
    id: 's1-10',
    role: 'user',
    content: 'Starting **Email Assistant** with: **last 6 hours**, complaints + orders + delivery, **professional & warm** tone, approval required for every reply.',
    timestamp: '14:33',
  },
  {
    id: 's1-11',
    role: 'steward',
    content: '',
    timestamp: '14:33',
    card: { type: 'typing', typingText: 'Executing Email Assistant...' },
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
        { time: '14:33:01', text: 'Initializing Email Assistant...', status: 'info' },
        { time: '14:33:03', text: 'Connected to Outlook Graph API', status: 'ok' },
        { time: '14:33:05', text: 'Fetching unread emails (last 6h)... 17 emails found', status: '' },
        { time: '14:33:07', text: 'Classifying emails... 5 complaints, 8 order inquiries, 4 delivery status', status: 'info' },
        { time: '14:33:12', text: 'Drafting reply for complaint #1: "Order arrived damaged"', status: '' },
        { time: '14:33:15', text: 'Drafting reply for complaint #2: "Wrong item received"', status: '' },
        { time: '14:33:18', text: 'Drafting replies for 8 order inquiries...', status: '' },
        { time: '14:33:25', text: 'Drafting replies for 4 delivery status requests...', status: '' },
        { time: '14:33:30', text: '2 emails flagged — missing order numbers, follow-up questions drafted', status: 'warn' },
        { time: '14:33:32', text: '17 draft replies sent to sarah@acme.com for approval', status: 'ok' },
        { time: '14:33:33', text: 'All emails processed successfully', status: 'ok' },
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
      title: 'Email Assistant Completed Successfully',
      body: 'Processed <strong>17 customer emails</strong> from the last 6 hours. <strong>5 complaints</strong>, <strong>8 order inquiries</strong>, and <strong>4 delivery status</strong> requests handled. <strong>2 follow-up questions</strong> drafted for missing info. All replies sent to manager for approval.',
      stats: [
        ['17', 'Emails Processed'],
        ['15', 'Replies Drafted'],
        ['2', 'Follow-ups Sent'],
      ],
      buttons: [],
    },
  },
];
