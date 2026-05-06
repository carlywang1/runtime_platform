export interface DebugSidebarMessage {
  id: string;
  role: 'steward' | 'agent' | 'system';
  content: string;
  timestamp: string;
}

export interface DebugLeftMessage {
  id: string;
  role: 'user' | 'steward';
  content: string;
  timestamp: string;
}

// Right sidebar: agent execution messages (3 rounds, each merged into a single natural-language reply)
export const debugSidebarRound1: DebugSidebarMessage[] = [
  {
    id: 'ds-r1-0',
    role: 'steward',
    content: 'Run a debug test with complaint-test@example.com → support@acme.com',
    timestamp: '14:33',
  },
  {
    id: 'ds-r1-1',
    role: 'agent',
    content: 'I initialized the Customer Service Email Assistant in debug mode and tried to connect to the mail server, but the connection failed — the following required credentials are missing:\n\n`SMTP_HOST`\n`SMTP_USERNAME`\n`SMTP_PASSWORD`\n\nI can\'t proceed without the mail server configuration. Debug run aborted.',
    timestamp: '14:34',
  },
];

export const debugSidebarRound2: DebugSidebarMessage[] = [
  {
    id: 'ds-r2-0',
    role: 'steward',
    content: 'Run a debug test with complaint-test@example.com → support@acme.com\nSMTP_HOST=smtp.acme.com\nSMTP_USERNAME=cs-bot@acme.com',
    timestamp: '14:36',
  },
  {
    id: 'ds-r2-1',
    role: 'agent',
    content: 'I initialized the Customer Service Email Assistant in debug mode and connected to smtp.acme.com, but SMTP authentication failed:\n\n❌ 535 Authentication credentials invalid\n\nThis usually means the password is wrong, or the account requires an app-specific password or OAuth instead of a plain password.',
    timestamp: '14:37',
  },
];

export const debugSidebarRound3: DebugSidebarMessage[] = [
  {
    id: 'ds-r3-0',
    role: 'steward',
    content: 'Run a debug test with complaint-test@example.com → support@acme.com\nSMTP_HOST=smtp.acme.com\nSMTP_USERNAME=support@acme.com',
    timestamp: '14:39',
  },
  {
    id: 'ds-r3-1',
    role: 'agent',
    content: '✅ Connected to smtp.acme.com via TLS.\n\nFetched the test inbox — 3 unread emails found:\n\n• Email #1 from john@example.com — classified as "billing dispute"\n• Email #2 from sarah@corp.io — classified as "product question"\n• Email #3 from mike@startup.co — classified as "positive feedback"\n\n3 draft replies generated. 1 escalation flagged (billing dispute → billing team).\n\n✅ Debug run complete.',
    timestamp: '14:40',
  },
];

// Left side: Steward conversation with user (3 rounds)
export const debugLeftRound1: DebugLeftMessage[] = [
  {
    id: 'dl-r1-0',
    role: 'steward',
    content: '好的，我来帮你测试一轮。正在启动 debug run...',
    timestamp: '14:33',
  },
  {
    id: 'dl-r1-1',
    role: 'steward',
    content: `这轮测试结果

Agent 没有真正进入邮件处理流程，原因是缺少邮件服务器凭证。

它返回的是：
> 当前无法开始处理
> 缺少必填环境变量：
> SMTP_HOST
> SMTP_USERNAME
> SMTP_PASSWORD

**说明**
这表示 agent 本身已经启动了，也知道该怎么走流程；现在卡在"连接邮件服务器"这一步。

**下一步**
如果你愿意，我可以继续帮你把凭证配好，然后马上再测一轮。

你只要发我：
- SMTP 服务器地址
- 用户名
- 密码`,
    timestamp: '14:34',
  },
];

export const debugLeftRound2: DebugLeftMessage[] = [
  {
    id: 'dl-r2-0',
    role: 'user',
    content: 'smtp.acme.com; username cs-bot@acme.com; password: Acme2024!',
    timestamp: '14:35',
  },
  {
    id: 'dl-r2-1',
    role: 'steward',
    content: '好的，已配置凭证，马上再测一轮...',
    timestamp: '14:36',
  },
  {
    id: 'dl-r2-2',
    role: 'steward',
    content: `我又帮你测了一轮，结果是：

还是没进入正式邮件处理，但这次已经走到 SMTP 认证接口了。

系统返回：
> 535 Authentication credentials invalid

这通常说明：
- 密码不对，或者
- 这个邮箱需要应用专用密码（App Password），或者
- 需要 OAuth 授权而不是普通密码

建议你确认一下这个邮箱的登录方式，或者换一组凭证给我。`,
    timestamp: '14:37',
  },
];

export const debugLeftRound3: DebugLeftMessage[] = [
  {
    id: 'dl-r3-0',
    role: 'user',
    content: '用这个：username support@acme.com password SupportBot#2024',
    timestamp: '14:38',
  },
  {
    id: 'dl-r3-1',
    role: 'steward',
    content: '好的，更新凭证再测...',
    timestamp: '14:39',
  },
  {
    id: 'dl-r3-2',
    role: 'steward',
    content: `✅ 这次成功了！

Agent 已完成测试邮件处理：
- 读取了 3 封测试邮件
- 生成了 3 封回复草稿
- 其中 1 封被标记为需要升级处理（billing dispute）

整体流程跑通了，你可以在右侧面板查看详细执行日志。`,
    timestamp: '14:40',
  },
];

// ── Debug Run #2 (after agent update, success) ──

export const debugSidebarRun2: DebugSidebarMessage[] = [
  {
    id: 'ds2-0',
    role: 'steward',
    content: 'Run debug test with order-inquiry@example.com → support@acme.com (updated spec)',
    timestamp: '14:42',
  },
  {
    id: 'ds2-1',
    role: 'agent',
    content: '✅ Connected to smtp.acme.com via TLS.\n\nFetched test inbox — 1 email from order-inquiry@example.com.\n\n• Classified as "order-inquiry" (new general category applied)\n• Draft reply generated. Tone: professional and warm.\n• Sent to sarah@acme.com for approval.\n\n✅ Debug run complete. Classification accurate, updated template applied.',
    timestamp: '14:43',
  },
];

export const debugLeftRun2Start: DebugLeftMessage[] = [
  {
    id: 'dl2-0',
    role: 'steward',
    content: '好的，使用之前的「测试环境」配置，马上再测一轮...',
    timestamp: '14:42',
  },
  {
    id: 'dl2-1',
    role: 'steward',
    content: `✅ 第二轮测试通过！

Agent 使用更新后的 spec 处理了测试邮件：
- 分类为 order-inquiry（新增的 general 类别生效了）
- 回复模板已更新，语气和格式都符合预期
- 草稿已发送给审批人

看起来没问题了，你可以选择继续测试或者准备发布。`,
    timestamp: '14:43',
  },
];
