# AgentFactory Platform — 产品需求文档（PRD）

## 更新记录

| 更新日志 | 更新者 | 更新时间 |
|---------|--------|---------|
| 首次创建（基于现有代码库现状） | Carly Wang | 27 Apr 2026 |

---

## 一、设计背景

AgentFactory Platform 是一个 AI Agent 全生命周期管理平台，为企业提供从 Agent 构建、调试、发布到运行的一站式体验。

在传统的 Agent 开发模式中，开发者需要在 IDE 中编写代码、手动配置参数、逐一测试场景，整个过程碎片化且门槛高。AgentFactory 的设计理念是：**让非技术用户也能通过自然对话完成 Agent 的构建与运行**，将复杂的技术流程转化为直觉式的交互体验。

平台的核心交互入口是 **Steward（AI管家）**——一个始终在线的 AI 助手，它不是一个被动的工具，而是一个主动引导用户完成任务的"数字同事"。用户不需要理解 Agent 的技术架构，只需要告诉 Steward "我想做什么"，Steward 会引导完成从构建到运行的全部流程。

---

## 二、核心设计哲学

AgentFactory 的设计遵循以下核心哲学，确保每一项功能和交互都不偏离初衷：

| 设计哲学 | 阐述 |
|---------|------|
| **对话即操作** | 用户不需要在复杂的表单和配置页面中迷路。通过与 Steward 的自然对话，所有操作——构建 Agent、配置参数、运行任务——都在对话流中完成。对话框就是控制台。 |
| **引导优于自助** | 平台不会把所有功能平铺给用户让他们自己找。Steward 通过 Chips（引导按钮）一步步带用户走完流程，每一步只展示当前最需要的选择，降低认知负荷。 |
| **构建与运行分离** | Agent 的"构建调试"和"正式运行"是两个截然不同的场景。构建时需要反复修改、查看日志、调整参数；运行时只需要确认输入、等待结果。两种模式有各自独立的页面和交互逻辑。 |
| **日志内嵌于对话** | 执行日志不是藏在某个独立面板里的技术细节，而是作为对话流的一部分自然呈现。用户在对话中就能看到 Agent 正在做什么、做到哪一步了，完成后日志自动折叠，不干扰后续交互。 |
| **团队即产品** | 一个 Team 就是一个可发布的 Agent 产品。Team 封装了 Agent 的能力、版本、配置和运行模式，是用户理解和管理 Agent 的基本单位。 |

---

## 三、核心业务对象

### A. Agent 相关

**Team（团队/Agent 产品）**
- 平台中 Agent 的最小发布单位
- 包含一个或多个 Agent 实例
- 具有版本号、运行模式（Task / Chatflow）、状态（Running / Inactive / Config Required）
- 来源标记（IDE Build / Marketplace）

**Agent（智能体）**
- Team 内的具体执行单元
- 具有名称、Emoji 标识、能力列表（Capabilities）
- 运行指标：任务完成数、成功率、月度费用

**Session（会话）**
- 用户与 Steward 或 Agent 交互的容器
- 类型：`build_agent`（构建会话）、`run_task`（任务运行）、`run_chat`（对话运行）
- 状态：`active` → `completed` / `stopped` / `failed`
- 支持父子会话关联（构建会话可派生调试运行会话）

### B. 运维相关

**Connector（连接器）**
- 平台与外部系统的集成通道
- 类别：Communication（Gmail、Slack、Teams）、Enterprise（Salesforce、SAP）、Productivity（GitHub、Jira）、Storage（Google Drive）
- 状态：Connected / Disconnected / Error

**Approval（审批）**
- Agent 执行过程中需要人工确认的节点
- 包含请求内容、审批人、截止时间、优先级

**Ontology（本体/知识库）**
- Agent 运行所依赖的业务知识
- 类型：Knowledge Base（知识库）、Business Rule（业务规则）、Process（流程）、Terminology（术语）

---

## 四、业务对象之间的核心关系

```
Team 1 → N Agent
Team 1 → 1 运行模式（Task 或 Chatflow）
Session 1 → N ChatMessage
Session 0..1 → 1 RunAgentSessionState（运行态）
Session（parent）1 → N Session（child）（构建会话派生调试会话）
Agent 1 → N Connector（通过配置关联）
Agent 运行 → 0..N Approval（执行中触发审批）
Agent 运行 → 0..N TraceEntry（执行日志）
```

---

## 五、平台功能模块

### 模块一：Dashboard（仪表盘）

平台的全局概览入口，展示关键运营指标：
- Active Agents 数量与趋势
- 任务完成量与成功率
- 月度费用统计
- 近期活动时间线

### 模块二：Steward（AI 管家）

Steward 是平台的核心交互枢纽，所有关键操作都可以通过与 Steward 对话完成。

**Quick Actions（快捷操作）**
- Build an Agent：启动 Agent 构建流程
- Run an Agent：选择已发布的 Agent 并运行
- Manage Connectors：管理外部集成
- Review Approvals：处理待审批项

**会话管理**
- 左侧面板展示历史会话列表
- 支持会话切换、删除、重命名
- 会话按类型分组（构建 / 运行）

### 模块三：Agent 构建流程（Build Agent）

这是 Steward 最核心的能力之一。用户通过对话描述需求，Steward 引导完成 Agent 的构建。

**用户旅程：从零构建一个 Agent**

阶段 1：需求描述
```
User: "我想建一个处理客户邮件的 Agent"
Steward: "好的！我来帮你构建。这个 Agent 需要处理哪些类型的邮件？
比如：客户投诉、订单查询、退换货请求？"
```

阶段 2：能力配置
```
Steward: "明白了。我为你规划了以下能力：
- 邮件分类（按类型自动归类）
- 智能回复（根据模板生成回复草稿）
- 升级路由（复杂问题转人工）

[确认这个方案] [调整能力] [添加更多能力]"
```

阶段 3：参数调试
```
Steward: "Agent 已创建！现在我们来调试一下。
我准备了一封测试邮件，点击下方按钮开始调试运行：

[开始调试运行]"
```

阶段 4：调试运行（Debug Session）
- Header 显示 "Debug Running" 状态
- 对话流中内嵌执行日志（ExecLogCard）
- 日志完成后自动折叠
- 调试结束后展示结果卡片（ResultCard）

阶段 5：迭代优化
```
Steward: "调试完成！结果如下：
✓ 邮件分类准确率 95%
✓ 回复生成耗时 2.3s
△ 升级路由规则需要细化

[增大批处理量并添加自动升级] [仅修改投诉路由规则] [添加物流追踪集成]"
```

阶段 6：发布
```
Steward: "优化完成！Agent 已准备好发布。
版本：v1.0
模式：Task

[发布到 Teams] [继续调试]"
```

**A2UI 说明：**
- 构建过程中，Steward 的对话区域会渲染专用卡片组件：
  - `ParamConfirmCard`：参数确认卡片，展示 Agent 配置供用户确认
  - `ExecLogCard`：执行日志卡片，实时展示调试过程，完成后自动折叠
  - `ResultCard`：结果卡片，展示运行结果和关键指标
  - `TypingIndicator`：打字指示器，展示 Steward 正在处理的状态

### 模块四：Agent 运行流程（Run Agent）

已发布的 Agent 通过独立的 Run 页面执行，与构建流程完全分离。

**运行模式一：Task 模式**

适用于一次性任务执行的 Agent（如 OMS 订单处理、仓库设计）。

用户旅程：
1. 用户从 Teams 页面或 Steward Quick Action 选择 Agent
2. 跳转到独立 Run 页面（`/teams/[id]/run`）
3. Header 显示 Agent 名称 + "Task Running" 状态
4. 通过 Chips 引导确认运行参数
5. 参数确认后 Agent 开始执行
6. 执行日志内嵌在对话流中
7. 完成后 Header 变为 "Task Completed"
8. 展示结果卡片 + 后续操作 Chips（再次运行 / 返回）

**运行模式二：Chatflow 模式**

适用于多轮对话式 Agent（如邮件助手）。

用户旅程：
1. 进入 Run 页面后，Agent 发送初始问候
2. 用户通过自然对话与 Agent 交互
3. Agent 在对话中执行操作并反馈结果
4. 支持多轮来回，直到用户结束会话

**A2UI 说明：**
```
┌─────────────────────────────────┐
│ 🛒 OMS Agent        Task Running │  ← Header
│                    [Stop & Back] │
├─────────────────────────────────┤
│                                 │
│  Steward: "请确认以下运行参数"    │  ← 对话流
│  ┌─ ParamConfirmCard ─────────┐ │
│  │ 渠道: Shopify            │ │
│  │ 批次大小: 25               │ │
│  └────────────────────────────┘ │
│                                 │
│  User: "确认，开始运行"          │
│                                 │
│  ┌─ ExecLogCard (折叠) ───────┐ │
│  │ ✓ 已处理 25 笔订单         │ │
│  └────────────────────────────┘ │
│                                 │
│  ┌─ ResultCard ───────────────┐ │
│  │ 成功: 23  失败: 2          │ │
│  └────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│ [再次运行] [查看详情] [返回]     │  ← Chips
│ ┌─────────────────────────┐     │
│ │ 输入消息...               │     │
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

### 模块五：Teams（团队管理）

Teams 是 Agent 的组织和发布单位。

**当前已注册的 Teams：**

| Team 名称 | 模式 | 状态 | 版本 | Agent |
|-----------|------|------|------|-------|
| OMS Agent for Multichannel Orders | Task | Inactive | v7 | 🛒 OMS Agent |
| Email Draft Confirmation Assistant | Chatflow | Running | v7 | ✉️ Email Draft & Send Assistant |
| Warehouse Network Design Agent | Task | Running | v5 | 🏭 Warehouse Network Design Agent |
| WES Pick Task Execution Agent | Task | Config Required | v22 | 📦 WES Pick Task Execution Agent |
|r Service Email Assistant | Task | Config Required | v1 | 📧 Customer Service Email Assistant |

**Team 详情页（`/teams/[id]`）**
- Agent 信息概览（名称、描述、能力列表）
- 版本历史
- 运行统计
- 配置管理
- 操作按钮：Run（跳转到独立运行页面）、Edit、Delete

### 模块六：Agents（Agent 市场与管理）

独立于 Teams 的 Agent 浏览和管理视图。

**Agent 列表：**

| Agent 名称 | 状态 | 来源 | 版本 | 任务数 | 成功率 |
|-----------|------|------|------|--------|--------|
| Data Analyst Pro | Active | Marketplace | v2.4.1 | 1,247 | 98.5% |
| Customer Support Agent | Active | IDE Build | v1.8.0 | 3,892 | 94.2% |
| WMS Inventory Manager | Config Required | Marketplace | v3.0.0 | — | — |
| Code Review Assistant | Active | IDE Build | v1.2.3 | 567 | 99.1% |
| Marketing Content Creator | Inactive | Marketplace | v2.1.0 | 234 | 91.3% |
| Financial Reconciliation Bot | Error | IDE Build | v0.9.7 | 892 | 87.4% |

**Agent 详情页（`/agents/[id]`）**
- 基本信息与能力标签
- 运行指标（任务数、成功率、月度费用）
- 配置状态（已配置 / 需要配置）
- 执行历史

### 模块七：Connectors（连接器）

管理平台与外部系统的集成。

| 类别 | 连接器 | 状态 | 说明 |
|------|--------|------|------|
| Communication | Gmail | Connected | 收发邮件、管理收件箱 |
| Communication | Slack | Connected | 团队消息与通知 |
| Communication | Microsoft Teams | Disconnected | 企业协作 |
| Enterprise | Salesforce CRM | Connected | 客户关系管理 |
| Enterprise | SAP ERP | Error | 企业资源规划 |
| Productivity | GitHub | Connected | 代码仓库与版本控制 |
| Productivity | Jira | Connected | 项目管理与问题追踪 |
| Storage | Google Drive | Connected | 云端文件存储 |

### 模块八：Approvals（审批中心）

Agent 执行过程中需要人工介入的审批节点集中管理。

- 审批列表：展示所有待处理、已通过、已拒绝的审批项
- 每个审批项包含：请求内容、来源 Agent、优先级、截止时间
- 支持批量操作

### 模块九：Ontology（本体/知识库）

Agent 运行所依赖的业务知识管理。

| 类型 | 说明 | 示例 |
|------|------|------|
| Knowledge Base | 领域知识文档 | 产品手册、FAQ |
| Business Rule | 业务规则定义 | 退货政策、审批阈值 |
| Process | 业务流程描述 | 订单处理流程、客服升级流程 |
| Terminology | 术语定义 | 行业专有名词解释 |

### 模块十：Security（安全策略）

平台安全管理，包含三个子模块：

**安全策略（Security Policies）**
- Agent 执行策略规则管理（当前 12 条规n- 规则启用/禁用控制

**API 密钥管理（API Keys）**
- Production / Staging / Legacy 环境密钥
- 密钥轮换与撤销

**审计日志（Audit Log）**
- 策略变更记录
- 密钥操作记录
- 访问异常记录

### 模块十一：Settings（平台设置）

| 设置项 | 说明 |
|--------|------|
| Schedule (Cron) | 定时任务配置，设置 Agent 的自动运行计划 |
| Webhooks | Webhook 端点管理，接收外部事件触发 |
| API Invocation | API 调用能力配置 |
| Data Exchange | 数据转换规则，定义输入输出格式映射 |
| Secrets & Tokens | API 密钥与凭证的安全存储 |

### 模块十二：User Management（用户管理）

平台用户的访问控制与权限管理。

### 模块十三：Activity（活动日志）

全平台操作的时间线记录，追踪所有关键事件。

### 模块十四：Version Control（版本控制）

Agent 版本的管理与对比，支持版本回退和历史查看。

---

## 六、Steward 交互状态机

Steward 是平台的交互中枢，其内部通过状态机驱动不同的交互流程：

### 构建流程（Build Flow）状态机

```
Step 1: 用户描述需求
  ↓ [Steward 生成方案]
Step 2: 用户确认方案
  ↓ [Steward 创建 Agent]
Step 3: Agent 创建完成，展示配置
  ↓ [用户选择调试或修改]
Step 5: 进入配置阶段（Config Phase）
  ↓ [配置提取完成]
Step 6: 展示 "Go to Run" 入口
  ↓ [用户点击运行]
Step 7: 调试运行完成，展示后续选项
  ↓ [用户选择优化方向]
Step 8: Agent 更新完成
```

### 运行流程（Run Flow）状态机

```
idle → waiting-describe → waiting-confirm → 跳转独立 Run 页面
```

- `idle`：初始状态
- `waiting-describe`：Steward 询问用户想运行哪个 Agent
- `waiting-confirm`：用户选择后，Steward 确认并跳转

### Chip 驱动机制

Chips 是 Steward 引导用户操作的核心 UI 元素：
- 每个流程阶段对应一组 Chips
- 只有第一个 Chip 可点击（引导用户按推荐路径操作）
- 点击 Chip 后推进状态机到下一阶段
- Chips 出现在输入框上方，视觉上与对话流分离

---

## 七、页面路由结构

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | Dashboard | 平台首页仪表盘 |
| `/dashboard` | Dashboard | 同上（别名） |
| `/steward` | Steward | AI 管家交互主界面 |
| `/teams` | Teams | 团队列表 |
| `/teams/[id]` | TeamDetail | 团队详情 |
| `/teams/[id]/run` | AgentRun | Agent 独立运行页面 |
| `/agents` | Agents | Agent 市场与管理（注：当前路由结构中未独立存在，Agent 详情通过 Steward 内嵌展示） |
| `/connectors` | Connectors | 连接器管理 |
| `/approvals` | Approvals | 审批中心 |
| `/ontology` | Ontology | 知识库管理 |
| `/security` | Security | 安全策略 |
| `/settings` | Settings | 平台设置 |
| `/user-management` | UserManagement | 用户管理 |
| `/activity` | Activity | 活动日志 |
| `/version-control` | VersionControl | 版本控制 |

所有页面共享侧边栏导航布局（`(with-sidebar)` 路由组）。

---

## 八、技术架构概览

| 维度 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js 16 + React 19 | App Router 模式 |
| 状态管理 | Zustand | 轻量级状态管理，LocalStorage 持久化 |
| 样式 | Tailwind CSS | 原子化 CSS |
| 图标 | Lucide React | 统一图标库 |
| 图形可视化 | XYFlow | Agent 协作关系图 |
| 后端服务 | Supabase | 认证与数据存储（当前为 Mock 数据阶段） |

---

## 九、当前状态与后续规划

### 当前状态（MVP 原型阶段）

- 所有数据为 Mock 数据，尚未接入真实后端 API
- Steward 的对话流程基于预设 Scenario 脚本驱动
- Agent 构建流程完整可演示（需求描述 → 方案确认 → 配置 → 调试 → 优化 → 发布）
- Agent 运行流程完整可演示（Task 模式 + Chatflow 模式）
- 5 个 Team、6 个 Agent 的 Mo覆盖主要业务场景

### 后续规划方向

1. **接入真实 API**：将 Mock 数据替换为真实后端服务，Steward 对话接入 LLM
2. **Agent Marketplace**：支持从市场安装第三方 Agent
3. **多 Agent 协作**：Team 内多个 Agent 的编排与协作（Team Visualization 已有原型）
4. **实时监控**：Agent 运行的实时状态监控与告警
5. **权限体系**：基于角色的细粒度权限控制
6. **审计合规**：完整的操作审计与合规报告
