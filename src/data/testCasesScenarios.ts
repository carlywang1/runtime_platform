export interface TestCaseInput {
  from: string;
  subject: string;
  body: string;
}

export interface TestCaseExpected {
  classification: string;
  draft_reply_contains?: string;
  requires_followup: boolean;
  followup_question?: string;
  routed_to?: string;
}

export interface TestCaseActual {
  classification?: string;
  draft_reply?: string;
  requires_followup?: boolean;
  followup_question?: string;
  routed_to?: string;
  error?: string;
}

export type TestCaseStatus = 'pending' | 'running' | 'pass' | 'fail';

export interface TestCase {
  id: string;
  name: string;
  input: TestCaseInput;
  expected: TestCaseExpected;
  actual?: TestCaseActual;
  status: TestCaseStatus;
  selected: boolean;
}

export interface TestCaseExecLog {
  caseId: string;
  lines: { time: string; text: string; status: '' | 'ok' | 'info' | 'warn' }[];
}

export const mockTestCases: TestCase[] = [
  {
    id: 'tc-1',
    name: 'Complaint email - product quality issue',
    input: { from: 'angry-customer@example.com', subject: 'Broken product received', body: 'I received my order #12345 yesterday and the screen is cracked. This is unacceptable.' },
    expected: { classification: 'complaint', draft_reply_contains: 'apologize', requires_followup: false, routed_to: 'sarah@acme.com' },
    actual: undefined,
    status: 'pending',
    selected: true,
  },
  {
    id: 'tc-2',
    name: 'Order inquiry - standard status check',
    input: { from: 'buyer@example.com', subject: 'Order #67890 status', body: 'Hi, I placed order #67890 three days ago. Can you tell me when it will arrive?' },
    expected: { classification: 'order-inquiry', draft_reply_contains: 'order #67890', requires_followup: false, routed_to: 'sarah@acme.com' },
    actual: undefined,
    status: 'pending',
    selected: true,
  },
  {
    id: 'tc-3',
    name: 'Order inquiry - missing order number',
    input: { from: 'forgetful@example.com', subject: 'Where is my order?', body: 'Hi, I placed an order last week but have not received any updates. Can you help?' },
    expected: { classification: 'order-inquiry', requires_followup: true, followup_question: 'order number', routed_to: 'sarah@acme.com' },
    actual: undefined,
    status: 'pending',
    selected: true,
  },
  {
    id: 'tc-4',
    name: 'Delivery status - tracking request',
    input: { from: 'waiting@example.com', subject: 'Tracking info needed', body: 'Order #11111 was shipped 5 days ago but I have no tracking number. Please provide.' },
    expected: { classification: 'delivery-status', draft_reply_contains: 'tracking', requires_followup: false, routed_to: 'sarah@acme.com' },
    actual: undefined,
    status: 'pending',
    selected: true,
  },
  {
    id: 'tc-5',
    name: 'Returns - within policy window',
    input: { from: 'returner@example.com', subject: 'Return request for order #22222', body: 'I want to return the item from order #22222. I received it 3 days ago and it does not fit.' },
    expected: { classification: 'returns', draft_reply_contains: 'return', requires_followup: false, routed_to: 'sarah@acme.com' },
    actual: undefined,
    status: 'pending',
    selected: true,
  },
  {
    id: 'tc-6',
    name: 'General inquiry - not categorizable',
    input: { from: 'curious@example.com', subject: 'Question about your company', body: 'Hi, I was wondering what your company hours are and if you have a physical store location.' },
    expected: { classification: 'general', requires_followup: false, routed_to: 'sarah@acme.com' },
    actual: undefined,
    status: 'pending',
    selected: true,
  },
  {
    id: 'tc-7',
    name: 'Edge case - empty email body',
    input: { from: 'empty@example.com', subject: '', body: '' },
    expected: { classification: 'general', requires_followup: true, followup_question: 'more details' },
    actual: undefined,
    status: 'pending',
    selected: true,
  },
  {
    id: 'tc-8',
    name: 'Edge case - extremely long email (5000+ words)',
    input: { from: 'verbose@example.com', subject: 'Multiple issues with recent orders', body: 'I have been a loyal customer for 5 years and I need to address several problems with my recent orders #33333, #44444, and #55555...' },
    expected: { classification: 'complaint', draft_reply_contains: 'apologize', requires_followup: false, routed_to: 'sarah@acme.com' },
    actual: undefined,
    status: 'pending',
    selected: true,
  },
];

export const testCaseExecLogs: Record<string, TestCaseExecLog> = {
  'tc-1': { caseId: 'tc-1', lines: [
    { time: '14:42:01', text: 'Initializing test case #1...', status: 'info' },
    { time: '14:42:03', text: 'Sending test email: angry-customer@example.com', status: '' },
    { time: '14:42:05', text: 'Classifying email... category: complaint', status: 'info' },
    { time: '14:42:07', text: 'Drafting reply with apology + replacement offer', status: '' },
    { time: '14:42:09', text: 'Routing to sarah@acme.com for approval', status: 'ok' },
    { time: '14:42:10', text: 'Test case #1 completed', status: 'ok' },
  ]},
  'tc-2': { caseId: 'tc-2', lines: [
    { time: '14:42:12', text: 'Initializing test case #2...', status: 'info' },
    { time: '14:42:14', text: 'Sending test email: buyer@example.com', status: '' },
    { time: '14:42:16', text: 'Classifying email... category: order-inquiry', status: 'info' },
    { time: '14:42:18', text: 'Drafting reply with order #67890 status info', status: '' },
    { time: '14:42:20', text: 'Routing to sarah@acme.com for approval', status: 'ok' },
    { time: '14:42:21', text: 'Test case #2 completed', status: 'ok' },
  ]},
  'tc-3': { caseId: 'tc-3', lines: [
    { time: '14:42:23', text: 'Initializing test case #3...', status: 'info' },
    { time: '14:42:25', text: 'Sending test email: forgetful@example.com', status: '' },
    { time: '14:42:27', text: 'Classifying email... category: order-inquiry', status: 'info' },
    { time: '14:42:29', text: 'Detecting missing info... order number not found', status: 'warn' },
    { time: '14:42:31', text: 'Generating follow-up question for order number', status: '' },
    { time: '14:42:33', text: 'Routing to sarah@acme.com for approval', status: 'ok' },
    { time: '14:42:34', text: 'Test case #3 completed', status: 'ok' },
  ]},
  'tc-4': { caseId: 'tc-4', lines: [
    { time: '14:42:36', text: 'Initializing test case #4...', status: 'info' },
    { time: '14:42:38', text: 'Sending test email: waiting@example.com', status: '' },
    { time: '14:42:40', text: 'Classifying email... category: delivery-status', status: 'info' },
    { time: '14:42:42', text: 'Drafting reply with tracking information', status: '' },
    { time: '14:42:44', text: 'Test case #4 completed', status: 'ok' },
  ]},
  'tc-5': { caseId: 'tc-5', lines: [
    { time: '14:42:46', text: 'Initializing test case #5...', status: 'info' },
    { time: '14:42:48', text: 'Sending test email: returner@example.com', status: '' },
    { time: '14:42:50', text: 'Classifying email... category: returns', status: 'info' },
    { time: '14:42:52', text: 'Drafting return instructions reply', status: '' },
    { time: '14:42:54', text: 'Test case #5 completed', status: 'ok' },
  ]},
  'tc-6': { caseId: 'tc-6', lines: [
    { time: '14:42:56', text: 'Initializing test case #6...', status: 'info' },
    { time: '14:42:58', text: 'Sending test email: curious@example.com', status: '' },
    { time: '14:43:00', text: 'Classifying email... category: general', status: 'info' },
    { time: '14:43:02', text: 'Drafting general inquiry reply', status: '' },
    { time: '14:43:04', text: 'Test case #6 completed', status: 'ok' },
  ]},
  'tc-7': { caseId: 'tc-7', lines: [
    { time: '14:43:06', text: 'Initializing test case #7...', status: 'info' },
    { time: '14:43:08', text: 'Sending test email: empty@example.com', status: '' },
    { time: '14:43:10', text: 'Classifying email... ERROR: empty content', status: 'warn' },
    { time: '14:43:12', text: 'Classification failed: Unable to classify empty content', status: 'warn' },
    { time: '14:43:13', text: 'Test case #7 FAILED', status: 'warn' },
  ]},
  'tc-8': { caseId: 'tc-8', lines: [
    { time: '14:43:15', text: 'Initializing test case #8...', status: 'info' },
    { time: '14:43:17', text: 'Sending test email: verbose@example.com', status: '' },
    { time: '14:43:20', text: 'Classifying email... category: complaint', status: 'info' },
    { time: '14:43:23', text: 'Drafting reply for multi-issue complaint', status: '' },
    { time: '14:43:26', text: 'Routing to sarah@acme.com for approval', status: 'ok' },
    { time: '14:43:27', text: 'Test case #8 completed', status: 'ok' },
  ]},
};

export const mockTestCaseResults: Record<string, TestCaseActual> = {
  'tc-1': { classification: 'complaint', draft_reply: 'We sincerely apologize for the damaged product. We will send a replacement immediately.', requires_followup: false, routed_to: 'sarah@acme.com' },
  'tc-2': { classification: 'order-inquiry', draft_reply: 'Your order #67890 is currently being processed and should ship within 24 hours.', requires_followup: false, routed_to: 'sarah@acme.com' },
  'tc-3': { classification: 'order-inquiry', draft_reply: 'I would be happy to help check your order status.', requires_followup: true, followup_question: 'Could you please provide your order number so I can look it up?', routed_to: 'sarah@acme.com' },
  'tc-4': { classification: 'delivery-status', draft_reply: 'Your order #11111 tracking number is TRK-98765. You can track it at...', requires_followup: false, routed_to: 'sarah@acme.com' },
  'tc-5': { classification: 'returns', draft_reply: 'We are happy to process your return for order #22222. Please follow these steps...', requires_followup: false, routed_to: 'sarah@acme.com' },
  'tc-6': { classification: 'general', draft_reply: 'Thank you for your interest! Our business hours are Mon-Fri 9am-6pm...', requires_followup: false, routed_to: 'sarah@acme.com' },
  'tc-7': { classification: undefined, error: 'Unable to classify empty content', requires_followup: undefined },
  'tc-8': { classification: 'complaint', draft_reply: 'We sincerely apologize for the issues with your recent orders. Let me address each one...', requires_followup: false, routed_to: 'sarah@acme.com' },
};
