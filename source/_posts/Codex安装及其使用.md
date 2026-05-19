---
title: Codex安装及其使用
typora-root-url: Codex安装及其使用
date: 2026-05-16 14:13:07
categories:
    - 开发工具
tags:
    - Codex
    - OpenAI
    - AI编程
---

### 一、Codex 是什么

`Codex CLI` 是 OpenAI 提供的本地编码智能体。它运行在终端中，可以读取当前项目、修改文件、执行命令、解释代码、修复问题、做代码审查，也可以在需要时配合 IDE 插件或 Codex Cloud 使用。

它适合处理这几类任务：

- 阅读陌生项目，快速梳理目录结构、启动方式和核心模块；
- 根据需求新增功能、修改文档、补测试、修复构建错误；
- 在提交前做代码审查，找出风险、遗漏测试和潜在回归；
- 用非交互命令把重复任务脚本化，例如批量检查、生成说明、自动修复格式问题。

使用 Codex 前建议确认两件事：项目已经纳入 Git 管理，避免修改后难以对比；同时清楚当前目录是否就是要让 Codex 操作的工作区，因为 Codex 会围绕当前目录读取、编辑和运行命令。

### 二、安装 Codex CLI

#### 1. 准备环境

如果通过 `npm` 安装，需要先安装 Node.js 和 npm。安装后在终端中检查：

```bash
node -v
npm -v
```

Windows 用户可以直接在 PowerShell 中使用 Codex。若项目依赖 Linux 工具链，也可以在 WSL2 中安装和运行 Codex。

#### 2. 使用 npm 安装

官方推荐的 npm 安装命令如下：

```bash
npm i -g @openai/codex
```

安装完成后检查版本：

```bash
codex --version
```

本文写作时，本机检查到的版本为：

```text
codex-cli 0.130.0
```

版本号会持续更新，实际使用时以本机命令输出为准。

#### 3. 使用 Homebrew 安装

macOS 用户也可以使用 Homebrew：

```bash
brew install --cask codex
```

#### 4. 升级 Codex

npm 安装方式可以直接升级到最新版本：

```bash
npm i -g @openai/codex@latest
```

新版 CLI 也提供了更新子命令：

```bash
codex update
```

如果命令不可用，优先使用 npm 的 `@latest` 安装方式。

### 三、登录与账号认证

安装后，进入项目根目录并运行：

```bash
codex
```

首次启动时，Codex 会引导登录。通常可以选择使用 ChatGPT 账号登录；如果你使用 API Key，也可以通过命令行登录：

```bash
codex login
```

使用 API Key 时，可以把密钥从标准输入传给 Codex：

```bash
printenv OPENAI_API_KEY | codex login --with-api-key
```

Windows PowerShell 中可以使用：

```powershell
$env:OPENAI_API_KEY | codex login --with-api-key
```

查看登录状态：

```bash
codex login status
```

退出登录：

```bash
codex logout
```

Codex 的登录缓存可能保存在系统凭据管理器中，也可能保存在 `~/.codex/auth.json`。如果使用文件方式保存，必须把 `auth.json` 当作密码文件处理，不要提交到 Git，不要发给别人，也不要贴到工单或聊天窗口中。

### 四、在 Windows 上使用 Codex

Codex 当前可以在 Windows 上以两种常见方式运行：

- 原生 PowerShell：适合 Windows 项目、前端项目、常规脚本和日常文档修改；
- WSL2：适合强依赖 Linux 工具链、shell 脚本、容器或 Linux 原生命令的项目。

原生 Windows 运行时，Codex 会使用 Windows 沙箱来限制文件写入范围，并阻止未经批准的网络访问。Windows 11 是更推荐的运行环境；Windows 10 需要保持较新的系统版本。

如果 Codex 在沙箱内无法读取某个工作区之外的目录，可以在交互会话中临时授权只读目录：

```text
/sandbox-add-read-dir C:\absolute\directory\path
```

这类授权应该只给确实需要读取的目录，不要把无关的个人目录一次性暴露给当前会话。

### 五、启动 Codex 的常用方式

#### 1. 在当前目录启动交互会话

```bash
codex
```

启动后可以直接输入需求，例如：

```text
解释这个项目的目录结构，并告诉我本地如何启动
```

#### 2. 启动时直接带上任务

```bash
codex "检查当前仓库有哪些未提交改动，并总结改动内容"
```

#### 3. 指定工作目录

```bash
codex -C D:\Code\demo-project "阅读项目并说明启动方式"
```

`-C` 或 `--cd` 用来指定 Codex 的工作根目录，适合从任意终端位置启动目标项目。

#### 4. 指定模型

```bash
codex -m gpt-5.4
```

也可以在交互会话里用 `/model` 切换模型和推理强度。

#### 5. 指定沙箱和审批策略

Codex 的两个核心安全参数是：

- `--sandbox`：控制 Codex 能读写和执行命令的范围；
- `--ask-for-approval`：控制什么时候需要人工批准。

常见组合如下：

```bash
codex --sandbox read-only --ask-for-approval on-request
```

适合只读分析项目，不希望 Codex 修改文件。

```bash
codex --sandbox workspace-write --ask-for-approval on-request
```

适合日常开发，允许 Codex 在当前工作区内写文件，遇到网络访问或越界操作时再请求确认。

```bash
codex --sandbox workspace-write --ask-for-approval never
```

适合明确可自动执行的非交互任务。使用前要确认工作区干净，并且任务风险可控。

不要在普通项目里随意使用下面的选项：

```bash
codex --dangerously-bypass-approvals-and-sandbox
```

它会跳过审批和沙箱，只适合已经由外部容器、虚拟机或隔离环境保护好的场景。

#### 6. 启用联网搜索

当任务需要实时资料时，可以启用搜索：

```bash
codex --search "查找当前框架最新迁移说明，并给出项目改造建议"
```

对于依赖版本、官方 API、政策、价格、插件状态等可能变化的信息，建议明确要求 Codex 查证来源。

#### 7. 附加图片

如果要让 Codex 阅读截图、界面草图或报错图片，可以传入图片：

```bash
codex -i screenshot.png "根据截图分析这个页面的布局问题"
```

### 六、交互会话中的常用斜杠命令

在 Codex 交互会话中输入 `/` 可以打开命令提示。常用命令如下：

| 命令 | 用途 |
| --- | --- |
| `/status` | 查看当前会话状态、模型、审批策略、上下文和 token 使用情况 |
| `/model` | 切换模型和推理强度 |
| `/permissions` | 调整当前会话的权限和审批策略 |
| `/init` | 为当前项目生成 `AGENTS.md`，写入长期项目约定 |
| `/mention` | 把指定文件或目录加入对话上下文 |
| `/diff` | 查看 Codex 当前产生的 Git diff，包括未跟踪文件 |
| `/review` | 对当前工作区改动做代码审查 |
| `/plan` | 进入计划模式，先让 Codex 给出执行方案 |
| `/compact` | 压缩长对话，释放上下文空间 |
| `/clear` | 清屏并开始新的可见对话 |
| `/new` | 在当前 CLI 会话中开启新对话 |
| `/resume` | 恢复历史会话 |
| `/mcp` | 查看当前可用的 MCP 工具 |
| `/plugins` | 查看、安装或管理 Codex 插件 |
| `/quit` 或 `/exit` | 退出 Codex |

日常使用中，最常用的是 `/status`、`/model`、`/diff`、`/review` 和 `/compact`。长任务建议先用 `/plan` 让 Codex 拆解步骤，再确认是否执行。

### 七、非交互命令与自动化

如果不想进入交互界面，可以使用 `codex exec`：

```bash
codex exec "总结当前项目的 README，并指出缺失的启动说明"
```

`exec` 适合脚本化任务、CI 检查、批量生成报告。常用参数包括：

| 命令 | 用途 |
| --- | --- |
| `codex exec "任务"` | 非交互执行一次任务 |
| `codex exec -C <目录> "任务"` | 在指定目录执行任务 |
| `codex exec --json "任务"` | 以 JSONL 事件流输出，便于脚本消费 |
| `codex exec -o result.md "任务"` | 把最后一条回复写入文件 |
| `codex exec --output-schema schema.json "任务"` | 约束最终输出结构 |
| `codex exec review` | 对当前仓库运行非交互代码审查 |

例如把分析结果写入文件：

```bash
codex exec -o repo-summary.md "阅读当前仓库，生成一份项目结构说明"
```

提交前也可以使用：

```bash
codex review
```

它会以非交互方式审查当前仓库改动，适合在提交前补一轮风险检查。

### 八、配额与状态查询

#### 1. 使用 `/status` 查看当前会话状态

在交互会话中输入：

```text
/status
```

它适合快速确认当前会话的模型、审批策略、沙箱模式、工作目录、上下文容量和 token 使用情况。对于一次任务是否已经接近上下文上限，`/status` 是最直接的入口。

需要注意的是，`/status` 更偏向“当前会话状态”。如果你想看账号维度的 5 小时配额、每周配额、Code Review 配额、剩余重置时间和多个账号的配额对比，使用 VS Code 插件会更直观。

#### 2. 使用 Codex Accounts Manager 查看配额

`Codex Accounts Manager` 是第三方 VS Code 扩展，项目地址为：

```text
https://github.com/wannanbigpig/codex-accounts-manager
```

它的核心用途是：在 VS Code 中统一管理多个 Codex 账号、切换当前生效的全局 `auth.json`、查看配额总览，并通过状态栏快速监控使用情况。

它能查看的配额信息包括：

- 5 小时配额百分比；
- 每周配额百分比；
- Code Review 配额百分比；
- 剩余重置时间；
- 最近刷新时间；
- 当前账号、团队或组织信息。

插件适合这几种场景：

- 你经常在多个 Codex 账号之间切换；
- 你希望在 VS Code 状态栏看到当前账号配额；
- 你想集中查看所有已保存账号的配额；
- 你希望低配额时收到提醒，或在配额不足时自动切换备用账号。

#### 3. 安装 Codex Accounts Manager

方式一：从 VS Code 扩展市场安装。

1. 打开 VS Code 扩展面板；
2. 搜索 `Codex Accounts Manager`；
3. 找到发布者为 `wannanbigpig` 的扩展并安装。

也可以使用命令行安装市场版本：

```bash
code --install-extension wannanbigpig.codex-accounts-manager
```

方式二：从 GitHub Releases 下载 `.vsix` 后安装。

```bash
code --install-extension codex-accounts-manager-x.y.z.vsix
```

方式三：从源码运行，适合开发和调试插件：

```bash
git clone https://github.com/wannanbigpig/codex-accounts-manager.git
cd codex-accounts-manager
npm install
npm run compile
```

然后在 VS Code 中按 `F5` 启动 Extension Development Host。

#### 4. 使用插件查看配额

安装后打开 VS Code 命令面板，常用命令如下：

| 命令 | 用途 |
| --- | --- |
| `Codex Accounts: Show Quota Summary` | 打开配额总览面板 |
| `Codex Accounts: Refresh Quota` | 刷新当前账号配额 |
| `Codex Accounts: Refresh All Quotas` | 批量刷新所有账号配额 |
| `Codex Accounts: Add Account via OAuth` | 通过 OAuth 添加账号 |
| `Codex Accounts: Import Current auth.json` | 导入当前本机正在使用的 Codex 账号 |
| `Codex Accounts: Switch Account` | 切换当前生效账号 |
| `Codex Accounts: Toggle StatusBar Account` | 控制账号配额是否显示在状态栏 |
| `Codex Accounts: Open Details` | 查看账号详情和原始配额信息 |

首次启动时，如果本机已经存在 Codex 的 `auth.json`，插件会提示是否绑定本地账号并刷新配额。也可以手动执行 `Codex Accounts: Import Current auth.json` 导入当前账号。

插件切换账号时会更新当前机器全局生效的 Codex `auth.json`。这很方便，但也意味着 CLI、Codex App、VS Code 插件可能会共享同一个登录状态。切换前要确认当前正在使用哪个账号，避免在错误账号下消耗配额。

#### 5. 配额查询建议

日常可以这样搭配使用：

- 在 Codex CLI 内用 `/status` 看当前会话状态和上下文使用情况；
- 在 VS Code 中用 `Codex Accounts: Show Quota Summary` 看账号级配额；
- 需要持续关注时，把当前账号加入状态栏；
- 多账号用户开启低配额提醒，但不要把 `auth.json` 或导出的账号 JSON 提交到项目仓库。

### 九、推荐工作流

#### 1. 开始前检查工作区

```bash
git status
```

确认当前是否有未提交改动。已有改动时，先判断哪些是自己的，哪些是别人或上一次任务留下的，避免让 Codex 覆盖不相关内容。

#### 2. 在项目根目录启动 Codex

```bash
codex
```

第一次进入新项目，可以先让 Codex 了解项目：

```text
阅读这个项目，说明技术栈、启动方式、构建命令和主要目录职责
```

#### 3. 为项目生成长期约定

```text
/init
```

`/init` 会生成 `AGENTS.md`。可以把项目约定写进去，例如包管理器、构建命令、测试命令、代码风格、禁止修改的目录等。后续 Codex 会读取这些约定。

#### 4. 把任务拆小

不要一次让 Codex “重构整个项目”。更稳妥的提问方式是：

```text
只修改登录页样式，不改接口逻辑。完成后运行现有前端构建，并告诉我改了哪些文件。
```

任务越具体，Codex 越容易给出可验证的结果。

#### 5. 修改后检查 diff

```text
/diff
```

重点检查：

- 是否改了预期之外的文件；
- 是否误删用户已有内容；
- 是否新增了不必要的依赖；
- 是否有硬编码密钥、token 或本地绝对路径；
- 是否补充了必要测试或构建验证。

#### 6. 提交前做审查

```text
/review
```

或者在终端中运行：

```bash
codex review
```

审查不是替代人工检查，而是帮助你补一轮风险扫描。

### 十、常见问题

#### 1. `codex` 命令不存在

先检查全局 npm 目录是否在 `PATH` 中：

```bash
npm bin -g
```

然后重新安装：

```bash
npm i -g @openai/codex
```

Windows 上如果刚改过环境变量，需要重启 PowerShell、Windows Terminal 或 VS Code。

#### 2. 登录后还是提示未认证

先查看登录状态：

```bash
codex login status
```

如果状态异常，执行：

```bash
codex logout
codex login
```

多账号用户还要检查是否被 VS Code 配额插件切换到了另一个 `auth.json`。

#### 3. Codex 无法读取某个目录

如果目录在当前项目外部，Codex 的沙箱可能会阻止访问。Windows 原生环境可以在会话中使用：

```text
/sandbox-add-read-dir C:\absolute\directory\path
```

更推荐的方式是把需要操作的项目作为 Codex 的工作目录启动：

```bash
codex -C C:\path\to\project
```

#### 4. Codex 改动太大怎么办

先停止当前任务，查看 diff：

```text
/diff
```

如果还没有提交，使用 Git 分块检查和恢复。不要把大任务继续叠加在已经失控的 diff 上。下次提问时限定范围，例如“只改这个文件”“不新增依赖”“先给计划，不要直接修改”。

#### 5. 如何减少配额消耗

- 让任务更小、更明确；
- 先用 `/mention` 指定关键文件，避免让 Codex 全仓库搜索；
- 长对话及时 `/compact`；
- 不需要深度推理时，使用更轻量的模型或较低推理强度；
- 通过 `Codex Accounts Manager` 观察 5 小时和每周配额，避免在配额紧张时启动大任务。

### 十一、参考链接

- OpenAI Codex CLI 文档：`https://developers.openai.com/codex/cli`
- OpenAI Codex CLI 命令行参数：`https://developers.openai.com/codex/cli/reference`
- OpenAI Codex CLI 斜杠命令：`https://developers.openai.com/codex/cli/slash-commands`
- OpenAI Codex 认证说明：`https://developers.openai.com/codex/auth`
- OpenAI Codex Windows 使用说明：`https://developers.openai.com/codex/windows`
- OpenAI Codex GitHub 仓库：`https://github.com/openai/codex`
- Codex Accounts Manager GitHub 仓库：`https://github.com/wannanbigpig/codex-accounts-manager`
- Codex Accounts Manager VS Code Marketplace：`https://marketplace.visualstudio.com/items?itemName=wannanbigpig.codex-accounts-manager`
