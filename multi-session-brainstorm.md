# 多 Session 意图切换机制 — 脑暴文档

## 大背景

Steward 对话框需要同时承载 Run Agent 和 Build Agent 两种核心场景。通过意图识别 + 用户确认的方式管理 Session 切换，避免不同任务混在同一对话中。

由于 Steward 的意图判断能力尚未成熟，后端不希望每轮都做意图识别，因此需要前端提供明确的 Stop 信号，告知后端用户已结束当前 agent 对话。

### 为什么选择多 Session 而非单对话

曾考虑过"Steward 常驻单对话 + 右侧活动面板"的方案（不做 Session 切分），但前提是 Steward 的 memory 能力足够强大，能在一个长对话里持续保持上下文质量。当前后端的 memory 技术尚未成熟，单对话越聊越长会导致上下文质量下降。多 Session 切分本质上是在 memory 能力不足时，用"分段"来保证每段对话的上下文质量。

### 为什么需要意图识别主动引导，而非纯手动切换

曾考虑过不做意图识别，完全由用户手动切换 Session（点按钮新建/选择）。问题是用户不会主动切换，会在一个 Session 里聊到天荒地老，导致上下文同样崩溃。意图识别 + 系统主动引导切换不是锦上添花，而是保证对话质量的兜底机制。

## 已确认的决策

### Session 模型

Session 分为三种类型：

| Session 类型 | 说明 | 典型场景 |
|---|---|---|
| Build Agent | 跟 Steward 对话来创建/编辑 agent | "帮我建一个 CRM Agent" |
| Run Agent (Task) | 配参数 → 执行 → 看结果，单次任务 | "跑一下数据清洗 Agent" |
| Run Agent (Chat) | 进入跟 agent 的持续对话 | "跟客服 Agent 聊聊" |

### 历史 Session 操作

三种类型统一为 Resume / Start new，用户操作层面不做区分，区别在于 Resume 进去后看到的内容：

| Session 类型 | Resume 进去后 | Start new |
|---|---|---|
| Build Agent | 继续未完成的创建流程 | 从头开始创建 |
| Run Agent (Task) | 看到上次的参数和结果，可以改参数重新跑 | 空白参数重新开始 |
| Run Agent (Chat) | 看到之前的对话记录，接着聊 | 开一轮新对话 |

### Run Agent 的定位

~~Run Agent 是独立 Session，不是 Steward Session 的子活动。~~ （4.22 会议已推翻）

**✅ 4.22 更新：Run Agent 改为子活动模式，不再作为独立 Session。**

- Run Agent 不出现在 Session 列表中，所有 Run 过程只以卡片形式保留在触发它的对话流里
- 每次 Run 点击 Stop & Back 后，当前对话流中生成一个 summary 卡片
- Run 过程中只保留一个"Run Agent"按钮，不需要其他操作按钮
- Run Agent 流程中需要支持 Edit Config 入口，允许用户修改已有配置

**⚠️ 后端对接注意：Run 的 summary 卡片内容（摘要文本、状态）由后端通过 API 推送更新。Run 不再有独立 session_id，而是作为 parent session 内的一段活动记录。**

后端 Session 元数据：
- `session_type`：build / run_task / run_chat
- ~~`parent_session_id`：从哪个 Session 触发的（可为空）~~ （Run 不再独立，无需 parent 关联）
- `agent_id`：关联的 agent

### Run Agent 展示位置

留在左侧对话流里，不拆到右侧面板。理由：
- 用户心智模型是"跟 Steward 对话"，拆到右侧会变成 IDE 双栏结构
- Run Agent 的输出用不同于普通对话气泡的 UI 卡片承载（可展开/收起）

### Config 处理方式

**✅ 4.22 更新：Config 纳入 Build 流程，不单独拆出来。** Run Agent 流程中需要支持 Edit Config 入口。

### Session 入口位置

集成在 Header 栏内（与页面标题并列，不额外增加一行）：
- 显示当前 Session 标题（可点击展开历史 Session 列表）
- 提供新建 Session 按钮
- 进入 agent 对话时，同一位置切换为"正在与 xxx Agent 对话" + Stop 按钮

### Stop 机制

- 进入 Chat Agent 或 Task Agent 对话时，UI 要有明显的"进入"感
- 提供明确的 Stop 按钮，点击后前端回传信号给 Steward，表示用户结束了 agent 对话
- Stop 后显示过渡态（如系统消息"已结束与 xxx Agent 的对话"），回到 Steward 上下文

**⚠️ 后端对接注意：用户点击 Stop 时，前端会发送一个 `stop_session` 信号（包含 session_id），后端需要：1) 终止当前 agent 的执行/对话；2) 生成本次 Run 的摘要回写到 parent session 上下文；3) 将 session 状态标记为 stopped。**

### Session 切换流程

每次识别到用户在当前对话中出现新意图，引导用户进行 Session 切换。交互要足够显眼。

三种选项：

| 选项 | 行为 |
|---|---|
| Create new session / Start New / Go to Build | 创建新对话，整合用户当前意图发送一条新消息给 Steward，自动生成 Session 标题 |
| Resume 历史 session | 回到历史对话的最后一轮，整合用户当前意图发送一条新消息给 Steward，使用历史 Session 标题 |
| ~~Not Now / Maybe Later（留在当前对话）~~ | ~~用户的原始消息作为普通消息发给当前 Session 的 Steward，不切换 Session~~ |

**✅ 4.22 更新：Build 场景去掉 Not Now 按钮。** 用户无需点击任何东西，直接在当前界面继续输入对话即可，等于默认留在当前对话。Run 场景只保留一个"Run Agent"按钮。

**⚠️ 后端对接注意：Not Now 路径下，前端会在消息上附加 `skip_intent_detection: true` 标记，后端收到带此标记的消息时不要再做意图识别，直接当普通对话处理。否则会出现"识别 → 提示切换 → 用户拒绝 → 再识别 → 再提示"的死循环。**

**✅ 4.22 更新：Build 场景已去掉 Not Now 按钮，用户忽略提示继续打字即为留在当前对话。此标记机制仍可保留作为后端兜底逻辑——当用户在意图引导出现后直接输入新消息（而非点击按钮），前端自动附加 `skip_intent_detection: true`，避免重复触发意图识别。**
![1776824691951](image/multi-session-brainstorm/1776824691951.png)

触发逻辑：
- 如果新意图在历史 Session 中出现过 → 优先引导 Resume
- 如果是全新意图 → 引导 Create new session
- 始终提供"留在当前对话"作为容错退路（防止意图识别误判）

用户主动切换：
- 用户可以直接点击 Header 里的 Session 列表选择历史 Session 跳转，不依赖意图识别

意图上下文补全：
- 切换 Session 时，如果用户的意图表达依赖当前对话上下文（如"那个配置帮我改一下"），系统需要对这条消息做改写/补全，使其在新 Session 里也能被理解

**⚠️ 后端对接注意：意图上下文补全需要后端 LLM 参与。前端切换 Session 时会把用户原始消息 + 当前 session 的最近 N 条上下文一起发给后端，后端负责改写成独立可理解的消息后再投递到目标 Session。**

### Session 标题

- 系统基于当前对话中的用户意图自动生成，格式如 `[Build] CRM Agent` 或 `[Run] 邮件助手 #3`
- 用户可以手动编辑标题
- 用户可以删除 Session

### Session 管理

- 不引入标签/分类筛选概念
- 支持用户删除 Session
- 支持用户编辑 Session 标题
- Session 列表按时间排序，超过一定时间未活跃的 Session 折叠到"更早"区域，默认展示近期活跃的 Session

### Stop 后的状态

Stop 后的状态（完成/已停止/失败）保留在当前 Run Session 内，用户可以追溯查看，不需要额外的终态管理 UI。



## 用户旅程

### 旅程 1：首次使用

```
用户打开 Steward
  → 看到默认首页状态（无 Session 标题，空对话）
  → 用户输入第一句话（如"帮我建一个 CRM Agent"）
  → 系统自动生成 Session 标题（如 [Build] CRM Agent）
  → Header 显示该标题
  → 进入正常对话
```

### 旅程 2：Build Agent（创建 agent）

```
用户在首页或新 Session 中说"帮我建一个邮件助手"
  → 系统生成标题 [Build] 邮件助手
  → Steward 引导用户描述需求、配置能力、设置参数...
  → 对话持续，直到 agent 创建完成或用户意图切换
```

### 旅程 3：从 Build Session 中触发 Run Agent

**✅ 4.22 更新：Run Agent 不再创建独立 Session，改为当前对话内的子活动。**

```
用户在 [Build] CRM Agent 的 Session 中说"跑一下这个 agent 试试"
  → Steward 识别到 Run 意图
  → 对话流中出现 Run Agent 按钮
  → 用户点击 Run Agent
  → Header 切换为"正在与 CRM Agent 对话" + Stop 按钮
  → （进入旅程 4 或旅程 5 的交互流程）
  → 用户点 Stop & Back
  → 对话流中生成 summary 卡片（参数 + 结果概要 + 状态）
  → 回到当前 Session 的 Steward 上下文
  → 用户可以继续跟 Steward 讨论结果
```

### 旅程 4：Run Agent — Task 类型

**✅ 4.22 更新：Run 在当前对话内进行，只保留 Run Agent 按钮，支持 Edit Config。**

```
在当前对话中触发 Run 后
  → Steward/Agent 引导用户输入运行参数（Config）
  → 用户确认参数 → 点击 Run Agent 按钮 → 开始执行
  → 界面显示运行状态（Running...）
  → 执行完成 → 对话流中生成 summary 卡片
  → 用户可以：
    a. 点击 Edit Config 修改参数再跑一次
    b. 点 Stop & Back → 回到 Steward 对话上下文
    c. 说出新意图 → 触发 Session 切换流程
```

### 旅程 5：Run Agent — Chat 类型

**✅ 4.22 更新：Chat 类型同样在当前对话内进行，不创建独立 Session。**

```
在当前对话中触发 Run 后
  → Header 显示"正在与客服 Agent 对话" + Stop 按钮
  → 用户跟 agent 持续对话（多轮）
  → 用户想结束时点 Stop & Back
  → 对话流中生成 summary 卡片
  → 回到 Steward 对话上下文
```

### 旅程 6：意图切换 → 系统引导创建新 Session

```
用户在 [Build] CRM Agent 的 Session 中说"帮我建一个新的邮件助手"
  → Steward 识别到新意图（Build 另一个 agent）
  → 系统弹出引导（显眼）：
    "检测到你想创建邮件助手，要开一个新对话吗？"
    [Create new session]  [继续当前对话]
  → 用户选择 Create new session
  → 系统对用户意图做补全/改写（确保脱离原上下文也能理解）
  → 创建新 Session，标题 [Build] 邮件助手
  → 补全后的消息作为新 Session 的第一条发送给 Steward
```

### 旅程 7：意图切换 → 系统引导 Resume 历史 Session

```
用户在 [Build] 邮件助手 的 Session 中说"看一下我之前的 CRM Agent"
  → Steward 识别到意图匹配历史 Session [Build] CRM Agent
  → 系统弹出引导：
    "你之前有一个 CRM Agent 的对话还没完成，要继续吗？"
    [Resume: CRM Agent]  [Create new session]  [继续当前对话]
  → 用户选择 Resume
  → 回到 [Build] CRM Agent 的最后一轮对话
  → 补全后的消息作为新一ward
```

### 旅程 8：意图切换 → 用户选择继续当前对话

**✅ 4.22 更新：Build 场景去掉 Not Now 按钮，用户直接继续打字即为留在当前对话。**

```
用户在 [Build] CRM Agent 的 Session 中说"我想看看配置"
  → Steward 误判为意图切换，弹出引导
  → 用户忽略引导，直接继续输入下一句话
  → 回到当前对话，消息正常发送给 Steward 处理
  → 无任何 Session 变化
```

### 旅程 9：用户主动从 Session 列表切换

```
用户点击 Header 中的 Session 标题
  → 展开 Session 列表（近期活跃 + 折叠的更早 Session）
  → 用户点击某个历史 Session（如 [Run] CRM Agent #1）
  → 直接跳转到该 Session，看到历史对话内容
  → 可以继续操作（改参数再跑 / 接着聊 / 继续 Build）
```

### 旅程 10：Stop 后在当前对话讨论结果

**✅ 4.22 更新：Run 不再是独立 Session，Stop 后直接在当前对话继续。**

```
用户在当前对话中跑完 CRM Agent 后点了 Stop & Back
  → 对话流中生成 summary 卡片（Run 的参数和结果概要）
  → 用户说"结果不太对，参数好像配错了"
  → Steward 基于 summary 卡片理解上下文，继续对话
```

### 旅程 11：直接从首页发起 Run

**✅ 4.22 更新：Run 不再创建独立 Session，在当前对话内完成。**

```
用户在首页空白对话中说"跑一下数据清洗 Agent"
  → 系统生成 Session 标题
  → 对话流中出现 Run Agent 按钮
  → 用户点击 Run Agent → 进入 Run 流程
  → Stop & Back 后，对话流中生成 summary 卡片
  → 用户可以继续在当前对话中操作
```


---

## Taylor 遗留问题回复

### Q1: Run Agent 是否独立在右侧展示，与左侧对话隔离？

**结论：不独立，留在左侧对话流里。**

理由：
1. 用户的核心心智模型是"跟 Steward 对话"，所有操作（Build / Run）都是在同一个对话界面里完成的。拆到右侧会把界面变成类似 IDE 的双栏结构，增加认知负担。
2. Run Agent 的输入（参数配置）和输出（执行结果）通过区别于普通对话气泡的 UI 卡片承载（可展开/收起），在视觉上已经能跟普通对话区分开。
3. 进入 Run Agent 时，Header 区域会切换为"正在与 xxx Agent 对话" + Stop 按钮，给用户明确的状态感知，不需要靠空间隔离来传达"你在跑 agent"。
4. 保持单栏也降低了前端复杂度，不需要处理左右面板的联动和状态同步。

### Q2: Run Agent 是"Session 内的子活动"还是"独立 Session"？

**分析维度：**

| 维度 | 子活动 | 独立 Session |
|---|---|---|
| 用户心智模型 | "Steward 帮我跑了一个 agent"，agent 是 Steward 的工具 | "我在跟 CRM Agent 直接对话"，离开了 Steward 进入另一个空间 |
| Run 结束后讨论结果 | 自然衔接，还在 Steward Session 里直接说 | 需要切回 Steward Session 才能讨论 |
| Session 列表信噪比 | 列表干净，Run 历史嵌在对话里 | 每次 Run 都是一条记录，高频使用会膨胀 |
| Chat 类型长对话 | 50 轮 agent 对话嵌在 Steward Session 里，上下文被撑爆且跟 Steward 无关 | 独立隔离，Steward Session 只记录"启动了对话" |
| 技术侧上下文管理 | Steward 上下文要包含 Run 全部信息，context window 压力大 | 各自独立，互不干扰 |
| Resume 路径 | 需要先找到 Steward Session，再翻到那次 Run 的位置，路径长 | 从列表直接点进去，路径短 |

**~~结论：独立 Session，配合引用卡片机制。~~**

~~理由：维度四（Chat 类型长对话）和维度六（Resume 路径）基本决定了 Run Agent 不适合作为子活动嵌入。但维度二（讨论结果）的需求通过"引用卡片 + 摘要回写"解决。~~

**✅ 4.22 会议推翻：改为子活动模式。** Run Agent 不再作为独立 Session，所有 Run 过程以卡片形式保留在触发它的对话流里。Stop & Back 后生成 summary 卡片。

### Q3: 是否允许用户查看和 Resume 之前的 Run Agent Session？

**~~结论：允许，且 Run Agent Session 和其他 Session 统一管理。~~**

**✅ 4.22 更新：Run Agent 不再有独立 Session，无需在 Session 列表中管理。** 历史 Run 记录以 summary 卡片形式保留在触发它的对话流中，用户翻阅对话即可查看。


## 待讨论 / 待细化

- [ ] 进入 agent 对话时的 UI 视觉区分方案（顶部横条？背景色？竖线？）
- [ ] 每种 Session 的进入/退出/Resume 完整交互流程
- [ ] 首次使用 / 空状态的具体交互细化（方向待确认：首页默认状态，用户有输入后自动生成标题）
- [ ] 用户没有显式 Stop 就离开的处理（关浏览器、跳转页面等场景，Session 状态如何处理）
- [ ] （低优先级）并发场景：同一时间只能在一个 Session 里；后续如果要支持，Task 类型可后台运行 + Session 列表加运行状态标记
- [ ] （4.22 新增）确认 Task 任务在 Agent 页面上的具体情况 — Taylor / Torin
- [ ] （4.22 新增）Agent 页面入口的 Run 和 Log 查看交互设计
- [ ] （4.22 新增）Edit Config 入口的具体交互形式

---

## 原型演示流程（Demo Script）

### 前置条件

原型预埋了以下 mock 数据：
- Agent 库（AGENT_CATALOG）：OMS Agent、CRM Agent、Analytics Agent
- 一个历史 build session："CRM Agent"（有几轮对话记录，模拟创建到一半没完成）

### 演示路径 A：Run Agent 完整流程

**✅ 4.22 更新：Run 不再创建独立 Session，在当前对话内完成。**

```
1. 打开首页 → 看到 New Conversation + greeting
2. 输入 "run oms"
   → 意图识别匹配到 OMS Agent（完整名称）
   → 对话流中出现意图卡片：
     "Looks like you want to run OMS Agent for Multichannel Orders and Inventory and Fulfillment v1"
     [Run Agent]
3. 点击 Run Agent
   → Header 变为紫色渐变：[Session Title] [● Running] ... [← Stop & Back]
   → 聊天区背景变为 indigo 色调
4. 在当前对话中与 Agent 交互（消息会保存）
5. 点击 Stop & Back
   → 对话流中生成 summary 卡片（参数 + 结果概要 + 状态）
   → Header 恢复正常状态
```

### 演示路径 B：模糊 Run 意图

```
1. 在首页输入 "run"（不指定 agent）
   → 识别为模糊意图
   → 弹出 agent 列表面板，用户可以预览可用 agent
2. 从列表中选择一个 agent → 在当前对话内进入 Run 流程
```

### 演示路径 C：Build Agent — 全新 agent

```
1. 在任意 session 中输入 "build email assistant"
   → 意图识别：没有匹配的历史 build session
   → 对话流中出现卡片：
     "Let's create a new Email Assistant."
     [Go to Build]  [Maybe Later]
2. 点击 Go to Build
   → 创建新 build_agent session
   → 用户意图 "build email assistant" 作为第一条消息自动发送
   → 自动生成 session 标题
   → 无 welcome 页，直接进入对话
3. Steward 回复引导用户描述需求（mock 回复）
```

### 演示路径 D：Build Agent — 恢复历史

```
1. 在任意 session 中输入 "build crm agent"
   → 意图识别：匹配到历史 build session "CRM Agent"
   → 对话流中出现卡片：
     "I see we started building CRM Agent before but didn't finish. Want to continue?"
     [Resume CRM Agent]  [Start New]
2a. 点击 Resume CRM Agent
   → 跳转到历史 CRM Agent session 的最后一轮
   → 用户意图作为新消息发送
   → 保持历史 session 标题
2b. 点击 Start New
   → 创建全新 build session
   → 同路径 C 的流程
```

### 演示路径 E：多次 Run 同一 Agent

**✅ 4.22 更新：Run 不再创建独立 Session，每次 Run 以 summary 卡片形式保留在对话流中。**

```
1. 第一次 "run oms" → 对话流中生成第一个 summary 卡片
2. 第二次 "run oms" → 对话流中生成第二个 summary 卡片
3. 用户翻阅对话即可查看历史 Run 记录
```

### 演示路径 F：Stop 后回到不同状态

**✅ 4.22 更新：Run 是子活动，Stop 后直接回到当前对话上下文。**

```
场景 1：用户上来就 run agent（没聊过天）
  → Stop & Back 后 → 对话流中显示 summary 卡片 + welcome 首页内容

场景 2：用户聊了几句再 run agent
  → Stop & Back 后 → 对话流中显示之前的对话记录 + summary 卡片
```

### 快捷入口（Welcome 页 Chips）

首页 greeting 下方可放置快捷 chips：
- "Build an email assistant" → 触发路径 C
- "Continue CRM Agent" → 触发路径 D
- "Run OMS Agent" → 触发路径 A

点击 chip = 帮用户输入这句话，走同样的意图识别流程。