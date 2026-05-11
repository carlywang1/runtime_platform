# Test Cases 验证环节 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Agent 构建流程的 debug run 通过之后、publish 之前，插入"测试用例验证"环节，支持批量/逐个运行测试用例并展示执行过程。

**Architecture:** 新增 TestCasesPanel 右侧面板组件 + testCasesScenarios mock 数据 + Steward.tsx 状态机扩展（step12 之后插入 test cases 阶段）。运行过程复用现有对话区 exec-log 模式，右侧面板同步更新状态。

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Zustand, TypeScript

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/data/testCasesScenarios.ts` | Create | TestCase 类型定义 + mock 测试用例数据 + 执行场景消息 |
| `src/components/testCases/TestCasesPanel.tsx` | Create | 右侧面板：统计栏 + 操作栏 + 用例列表 + 编辑态 + 状态更新 |
| `src/views/Steward.tsx` | Modify | 状态机扩展：step12 后插入 test cases 阶段，对话区展示执行过程 |
| `src/data/buildAgentScenarios.ts` | Modify | 新增 step12 之后的 chips 定义 |

---

### Task 1: 创建 TestCase 类型定义和 Mock 数据

**Files:**
- Create: `src/data/testCasesScenarios.ts`

- [ ] **Step 1: 创建类型定义和 mock 数据文件**

```typescript
// src/data/testCasesScenarios.ts

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

// Mock actual results (filled after running)
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
```

---

### Task 2: 创建 TestCasesPanel 组件

**Files:**
- Create: `src/components/testCases/TestCasesPanel.tsx`

- [ ] **Step 1: 创建 TestCasesPanel 组件**

组件包含：
- Header（标题 + case 数量 badge）
- 统计栏（Total / Passed / Failed / Running）
- 操作栏（全选 checkbox + Run All 按钮 + 添加用例按钮）
- 用例列表（每个 case：checkbox、序号、名称、状态标签、Edit 按钮、Run 按钮、展开箭头）
- 展开详情（Input / Expected / Actual 三栏）
- 编辑态（Input / Expected 可编辑，Save / Cancel 按钮）

Props:
```typescript
interface TestCasesPanelProps {
  cases: TestCase[];
  onRunAll: () => void;
  onRunSingle: (caseId: string) => void;
  onUpdateCase: (caseId: string, updates: Partial<TestCase>) => void;
  onToggleSelect: (caseId: string) => void;
  onToggleSelectAll: () => void;
  onClose: () => void;
}
```

组件内部状态：
- `expandedId: string | null` — 当前展开的 case
- `editingId: string | null` — 当前编辑中的 case
- `editDraft: { input: TestCaseInput; expected: TestCaseExpected } | null` — 编辑草稿

样式参考现有 DebugRunPanel 和 BuildAgentPanel 的深色主题风格（bg-[#0a0a0f]、border-white/[0.06] 等）。

---

### Task 3: 扩展 buildAgentScenarios chips

**Files:**
- Modify: `src/data/buildAgentScenarios.ts`

- [ ] **Step 1: 在 buildAgentChips 中新增测试阶段的 chips**

在 `buildAgentChips` 对象中添加：
```typescript
// 在 step12 之后，新增测试阶段 chips
step12_testCases: '生成测试用例',
step12_skipTest: '跳过测试，直接发布',
step12_runAll: 'Run All Test Cases',
step12_addCase: '添加自定义用例',
step12_skipPublish: '跳过，直接发布',
step12_allPass: '进入发布流程',
step12_rerun: '再跑一轮',
step12_fixAndRerun: '修复并重跑失败用例',
step12_ignoreAndPublish: '忽略失败，继续发布',
```

---

### Task 4: 扩展 Steward.tsx 状态机

**Files:**
- Modify: `src/views/Steward.tsx`

- [ ] **Step 1: 添加 import 和状态变量**

在文件顶部添加 import：
```typescript
import TestCasesPanel from '../components/testCases/TestCasesPanel';
import { mockTestCases, testCaseExecLogs, mockTestCaseResults } from '../data/testCasesScenarios';
import type { TestCase, TestCaseStatus } from '../data/testCasesScenarios';
```

在组件内添加状态：
```typescript
const [testCases, setTestCases] = useState<TestCase[]>([]);
const [testRunningIndex, setTestRunningIndex] = useState(-1);
const [testPhaseActive, setTestPhaseActive] = useState(false);
```

- [ ] **Step 2: 修改 step12 处理逻辑**

当前 step12 的逻辑（约 line 1826）：用户说"当前测试没有问题了"后直接进入 publish 流程。

修改为：用户说"当前测试没有问题了"后，Steward 提示生成测试用例，展示两个 chips：[生成测试用例] [跳过测试，直接发布]。

```typescript
} else if (buildFlowChipStep === 12) {
  setBuildFlowChipStep(-1);
  const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chipText, timestamp: now() };
  setMessages((prev) => [...prev, userMsg]);
  setTypingStatus('Analyzing agent capabilities...');
  setIsTyping(true);
  const t = setTimeout(() => {
    setIsTyping(false);
    const testIntroMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'steward', content: 'BUILD_TEST_CASES_INTRO', timestamp: now() };
    setMessages((prev) => [...prev, testIntroMsg]);
    setBuildFlowChipStep(1201); // test cases phase
  }, 1200);
  runAgentFlowTimers.current.push(t);
}
```

- [ ] **Step 3: 添加 test cases 阶段的 chip 处理**

新增 buildFlowChipStep === 1201（生成测试用例）：
- 用户点击"生成测试用例" → Steward 显示 typing → 生成完成消息 → 右侧面板切换为 TestCasesPanel → 展示 chips [Run All Test Cases] [跳过，直接发布]
- 用户点击"跳过测试，直接发布" → 跳转到现有的 step 1200（配置正式环境）

新增 buildFlowChipStep === 1202（运行测试用例）：
- 用户点击"Run All Test Cases" → 开始按顺序执行测试
- 左侧对话区显示执行过程（已完成的折叠为一行，当前正在跑的展示 exec-log）
- 右侧面板同步更新每个 case 的状态

新增 buildFlowChipStep === 1203（测试完成）：
- 全部 PASS → 展示 chips [进入发布流程] [再跑一轮]
- 有 FAIL → 展示 chips [修复并重跑失败用例] [忽略失败，继续发布]

- [ ] **Step 4: 添加对话区消息渲染**

在消息渲染逻辑中添加 `BUILD_TEST_CASES_INTRO` 和 `BUILD_TEST_CASES_RUNNING` 和 `BUILD_TEST_CASES_DONE` 的渲染：

`BUILD_TEST_CASES_INTRO`：
> Debug 测试通过了！接下来我为你生成一组测试用例，覆盖主要场景，确保 Agent 在各种输入下都能正确工作。

`BUILD_TEST_CASES_GENERATED`：
> ✅ 已生成 8 个测试用例，覆盖邮件分类、缺失信息检测、审批路由、边界情况等场景。你可以在右侧面板查看、编辑用例，然后全选或逐个运行。

`BUILD_TEST_CASES_RUNNING`：
> 动态内容：已完成的 case 折叠为一行（✓ #1 PASS），当前正在跑的展示 exec-log

`BUILD_TEST_CASES_ALL_PASS`：
> 🎉 全部 8 个测试用例通过！Agent 在各种场景下都能正确工作，可以进入发布流程了。

`BUILD_TEST_CASES_HAS_FAIL`：
> ⚠️ 7/8 通过，1 个失败（#7 Edge case - empty email body）。建议处理空邮件的边界情况。

- [ ] **Step 5: 添加右侧面板切换逻辑**

在 `currentA2UI` 的条件渲染中添加 `TEST_CASES_VIEW`：
```typescript
{currentA2UI === 'TEST_CASES_VIEW' && (
  <TestCasesPanel
    cases={testCases}
    onRunAll={handleTestRunAll}
    onRunSingle={handleTestRunSingle}
    onUpdateCase={handleTestCaseUpdate}
    onToggleSelect={handleTestToggleSelect}
    onToggleSelectAll={handleTestToggleSelectAll}
    onClose={() => setCurrentA2UI(null)}
  />
)}
```

- [ ] **Step 6: 实现测试执行逻辑**

```typescript
const handleTestRunAll = useCallback(() => {
  const selectedCases = testCases.filter(c => c.selected);
  if (selectedCases.length === 0) return;
  setBuildFlowChipStep(-1);
  setTestRunningIndex(0);
  // 开始按顺序执行，每个 case 间隔 2-3 秒
  runTestCaseSequence(selectedCases, 0);
}, [testCases]);

const runTestCaseSequence = useCallback((cases: TestCase[], index: number) => {
  if (index >= cases.length) {
    // 全部完成
    finishTestRun();
    return;
  }
  const currentCase = cases[index];
  // 更新状态为 running
  setTestCases(prev => prev.map(c => c.id === currentCase.id ? { ...c, status: 'running' as TestCaseStatus } : c));
  // 左侧对话区显示当前 case 的 exec-log
  // ... (添加消息到对话区)
  
  // 模拟执行完成
  const execTime = (testCaseExecLogs[currentCase.id]?.lines.length || 5) * 400;
  const t = setTimeout(() => {
    const result = mockTestCaseResults[currentCase.id];
    const passed = result && !result.error && result.classification === currentCase.expected.classification;
    setTestCases(prev => prev.map(c => c.id === currentCase.id ? { ...c, status: (passed ? 'pass' : 'fail') as TestCaseStatus, actual: result } : c));
    // 继续下一个
    runTestCaseSequence(cases, index + 1);
  }, execTime);
  runAgentFlowTimers.current.push(t);
}, []);
```

---

### Task 5: 验证和调试

- [ ] **Step 1: 启动开发服务器验证**

Run: `pnpm dev`

验证流程：
1. 进入 Steward → Build Agent → 走完 debug run 流程
2. 点击"当前测试没有问题了"
3. 确认出现 [生成测试用例] [跳过测试，直接发布] chips
4. 点击"生成测试用例" → 确认右侧面板切换为 TestCasesPanel
5. 确认 8 个 test cases 显示正确
6. 点击 Edit → 确认字段可编辑
7. 点击 Run All → 确认左侧对话区按顺序展示执行过程
8. 确认右侧面板状态同步更新
9. 全部完成后确认出现正确的 chips

- [ ] **Step 2: TypeScript 类型检查**

Run: `pnpm typecheck`
Expected: 无错误
