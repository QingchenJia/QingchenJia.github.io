---
title: OpenCode安装与基础使用教程
typora-root-url: OpenCode安装与基础使用教程
date: 2026-07-10 22:17:33
categories:
    - 开发工具
tags:
    - OpenCode
    - DeepSeek
    - AI编程工具
---

# OpenCode安装与基础使用教程

OpenCode 是一个开源的 AI 编码 Agent。它可以在终端中读取项目、搜索代码、修改文件、执行命令、运行测试，并通过不同模型提供商完成推理。与只能绑定单一模型的工具相比，OpenCode 的突出特点是模型选择灵活。你可以在同一个客户端中连接 DeepSeek、OpenAI、Anthropic、OpenRouter、本地模型等不同后端。本文从零开始完成下面几件事：

1. 在 Windows、macOS 或 Linux 上安装 OpenCode；
2. 初始化一个本地项目并掌握基础交互；
3. 接入 DeepSeek 官方 API；
4. 通过一段提示词，让 OpenCode 自行安装 Superpowers；
5. 学会常用工作流、权限控制和故障排查。

## 一、先理解 OpenCode 的工作方式

OpenCode 不是一个大模型，也不是模型代理商。它更像是运行在本地的 Agent 外壳：

```text
你的需求
  ↓
OpenCode
  ├─ 读取和搜索项目
  ├─ 调用 Shell、编辑器、LSP 等工具
  ├─ 管理上下文、权限和会话
  └─ 向模型提供商发送请求
       └─ DeepSeek、OpenAI、Anthropic、本地模型等
```

因此，使用成本通常由两部分组成：

- OpenCode 客户端本身开源免费；
- 实际推理费用由所连接的模型提供商收取。

本文使用 DeepSeek 官方 API，也就是直接在 DeepSeek 开放平台创建 Key、充值，并由 DeepSeek 官方计费。这种方式没有中转服务，配置关系也比较清晰。

## 二、安装前准备

### 1. 准备一个现代终端

macOS 可以使用系统终端、iTerm2、WezTerm 等。Linux 可以使用发行版自带终端、WezTerm、Alacritty 等。Windows 建议使用 Windows Terminal，并优先在 WSL 中运行 OpenCode。官方推荐 WSL 的原因是：

- 命令行工具链与 Linux 项目更一致；
- Git、Shell、软链接和权限行为更可预测；
- OpenCode 的全部功能兼容性更好；
- 很多 Agent 生成的命令可以直接执行。

如果只处理普通 Windows 项目，也可以通过 npm、Scoop 或 Chocolatey 原生安装。

### 2. 准备 Git

编码 Agent 会直接修改文件，所以项目最好先使用 Git 管理。检查 Git：

```bash
git --version
```

如果项目尚未初始化，可以在项目目录执行：

```bash
git init
git add .
git commit -m "chore: initial snapshot"
```

开始任务前有一个干净的提交，能够显著降低误修改后的恢复成本。

### 3. 通过 npm 安装时准备 Node.js

如果准备使用 npm 安装，需要先安装 Node.js LTS。检查版本：

```bash
node -v
npm -v
```

使用安装脚本、Homebrew、Scoop 或 Chocolatey 时，不要求你提前全局安装 npm 包。

## 三、安装 OpenCode

### 1. macOS 与 Linux：官方安装脚本

最直接的方式是运行官方脚本：

```bash
curl -fsSL https://opencode.ai/install | bash
```

完成后重新打开终端，再检查版本：

```bash
opencode --version
```

如果提示找不到命令，先查看安装脚本输出的 PATH 提示，再重新加载 Shell 配置：

```bash
source ~/.bashrc
```

使用 Zsh 时执行：

```bash
source ~/.zshrc
```

### 2. 使用 npm 安装

npm 方式适合已经配置好 Node.js 的环境：

```bash
npm install -g opencode-ai
```

安装后检查：

```bash
opencode --version
```

注意，npm 包名是 `opencode-ai`，启动命令是 `opencode`。不要把这两个名字写反。

### 3. macOS 与 Linux：Homebrew

可以使用 OpenCode 官方 tap：

```bash
brew install anomalyco/tap/opencode
```

官方 tap 通常比 Homebrew 团队维护的通用 formula 更新更快。升级时执行：

```bash
brew update
brew upgrade anomalyco/tap/opencode
```

### 4. Windows：WSL 安装

先在管理员 PowerShell 中安装 WSL：

```bash
wsl --install
```

按照系统提示重启后进入 Ubuntu，再执行：

```bash
curl -fsSL https://opencode.ai/install | bash
```

检查版本：

```bash
opencode --version
```

WSL 中访问 Windows 磁盘时，`D:\Code\demo` 对应：

```text
/mnt/d/Code/demo
```

对于依赖大量小文件的 Node.js 项目，把仓库放在 WSL 自己的 Linux 文件系统中通常性能更好。例如：

```text
~/code/demo
```

### 5. Windows：原生安装

Chocolatey：

```bash
choco install opencode
```

Scoop：

```bash
scoop install opencode
```

npm：

```bash
npm install -g opencode-ai
```

任选一种即可，不要重复安装多个来源的版本，否则 PATH 中可能出现多个 `opencode`。检查命令实际来自哪里：

```powershell
Get-Command opencode
```

### 6. 升级与确认版本

npm 安装的升级命令：

```bash
npm install -g opencode-ai@latest
```

升级后确认：

```bash
opencode --version
opencode --help
```

如果文中命令与本机行为不一致，以当前版本的 `--help` 和 TUI 中的命令列表为准。

## 四、第一次启动与项目初始化

### 1. 从项目目录启动

先进入一个已经使用 Git 管理的项目：

```bash
cd /path/to/your-project
opencode
```

Windows PowerShell 示例：

```powershell
cd D:\Code\your-project
opencode
```

OpenCode 会把启动目录视为当前工作区。不要在包含大量无关文件的主目录或磁盘根目录直接启动。

### 2. 初始化项目规则

进入 TUI 后执行：

```text
/init
```

OpenCode 会分析项目，并在仓库根目录创建或更新 `AGENTS.md`。这个文件用于记录：

- 项目结构和核心模块；
- 安装、测试、构建命令；
- 代码风格和工程约束；
- Agent 修改代码时必须遵守的规则。

初始化后不要直接相信生成结果。先阅读 `AGENTS.md`，删除错误内容，再补充项目特有的约束。确认准确后可以提交到 Git，让后续会话和团队成员共同使用。

### 3. Plan 与 Build 模式

OpenCode 的常见主 Agent 包括 Plan 和 Build。可以使用 `Tab` 键切换。Plan 模式侧重分析和规划，不应直接修改项目。Build 模式可以在权限允许时修改文件和执行命令。处理较大任务时推荐下面的节奏：

```text
Plan：探索仓库 → 澄清需求 → 输出计划
  ↓ 人工确认
Build：按计划修改 → 运行验证 → 汇报结果
```

一个实用的 Plan 提示词：

```text
先阅读当前仓库和 AGENTS.md，只做分析，不修改文件。
找出实现登录失败次数限制涉及的模块、数据流和现有测试，
然后给出最小改动方案、风险与可验证的验收条件。
```

计划确认后切换到 Build：

```text
按刚才确认的方案实现。只修改相关文件，复用现有模式，
完成后运行对应测试和构建，并总结修改文件与验证结果。
```

### 4. 引用具体文件

在提示词中输入 `@`，可以搜索并引用仓库里的文件。例如：

```text
解释 @src/auth/service.ts 的登录流程，并指出令牌在哪里生成和校验。
```

提供明确入口文件，比让 Agent 无目标扫描整个仓库更快，也更节省 Token。

### 5. 撤销与恢复

如果当前会话的修改不符合预期，可以执行：

```text
/undo
```

需要恢复刚才撤销的内容时执行：

```text
/redo
```

这适合撤销 OpenCode 当前会话产生的修改。重要任务仍然应该依赖 Git 查看差异和创建提交，不要把会话撤销当成唯一备份。

## 五、接入 DeepSeek 官方 API

### 1. 创建 DeepSeek API Key

打开 DeepSeek 开放平台：

```text
https://platform.deepseek.com/
```

登录后完成下面几步：

1. 在账户中充值或确认存在可用余额；
2. 进入 API Keys 页面；
3. 点击创建新的 API Key；
4. 立即把 Key 保存到可靠的密码管理器。

API Key 通常只在创建时完整显示一次。不要把真实 Key 发到聊天记录、截图、Issue 或 Git 仓库。

### 2. 在 OpenCode 中保存凭据

启动 OpenCode：

```bash
opencode
```

在 TUI 中输入：

```text
/connect
```

接着完成交互：

1. 搜索并选择 `DeepSeek`；
2. 粘贴刚才创建的 DeepSeek API Key；
3. 按回车保存。

通过 `/connect` 保存的凭据位于用户数据目录：

```text
~/.local/share/opencode/auth.json
```

它不在当前项目的 `opencode.json` 中，因此不会因为提交项目配置而直接进入 Git。仍然要保护本机账户和该文件的读取权限。可以在终端检查已连接的提供商：

```bash
opencode auth list
```

不要把 `auth.json` 内容粘贴到公开场合排错。

### 3. 选择 DeepSeek 模型

回到 OpenCode TUI，输入：

```text
/models
```

搜索 `DeepSeek`，再选择需要的模型。截至本文核验时间，DeepSeek 官方主要模型包括：

| 模型              | 特点               | 适合场景                          |
| ----------------- | ------------------ | --------------------------------- |
| DeepSeek V4 Flash | 更快、价格更低     | 阅读代码、文档、小修改、常规问答  |
| DeepSeek V4 Pro   | 推理和编码能力更强 | 复杂调试、重构、长时间 Agent 任务 |

日常使用可以先选 `DeepSeek V4 Flash`。遇到复杂架构分析、跨模块修改或疑难 Bug，再切换 `DeepSeek V4 Pro`。DeepSeek 已公告旧模型名 `deepseek-chat` 和 `deepseek-reasoner` 将于 **2026 年 7 月 24 日 15:59 UTC** 弃用。新配置优先使用 V4 模型，不要继续依赖旧名称。

### 4. 发起第一次测试

选择模型后发送一个只读任务：

```text
请只读分析当前仓库，不要修改文件。
告诉我项目使用了什么技术栈、如何启动、如何运行测试，
并为每个结论给出对应的文件依据。
```

一次成功的响应应该体现：

- OpenCode 能列出或搜索仓库文件；
- 模型能返回正常中文内容；
- 结论与 `package.json`、构建文件或 README 一致；
- DeepSeek 控制台出现对应 API 用量。

完成只读验证后，再尝试一个低风险修改：

```text
在 README 中修正一个明确的错别字，只修改这一处。
修改后展示 diff，不要提交 Git。
```

### 5. 设置默认模型

如果希望项目默认使用 DeepSeek V4 Pro，可以在仓库根目录创建 `opencode.json`：

```json
{
    "$schema": "https://opencode.ai/config.json",
    "model": "deepseek/deepseek-v4-pro"
}
```

如果希望所有项目默认生效，把配置放到全局位置：

```text
~/.config/opencode/opencode.json
```

项目级配置适合团队共享。全局配置适合个人偏好。项目配置中只写模型 ID，不要写真实 API Key。

### 6. 控制 API 成本

Agent 的一次任务通常会产生多轮模型调用。成本不只取决于你输入的那句话，还取决于：

- OpenCode 读取了多少文件；
- 每轮是否重复携带上下文；
- 模型输出了多少推理与代码；
- 任务失败后是否反复重试；
- 提示词是否给出了清晰边界。

降低成本的有效方法：

- 小任务使用 V4 Flash，复杂任务再用 V4 Pro；
- 用 `@文件` 指定入口，减少无关搜索；
- 一个会话只处理一个相关目标；
- 明确允许修改的目录和文件；
- 要求运行必要验证，但不要无目的运行全部测试；
- 定期查看 DeepSeek 控制台账单和 Token 用量。

## 六、让 OpenCode 自行安装 Superpowers

### 1. Superpowers 是什么

Superpowers 是一组面向编码 Agent 的可组合 Skills 和工作方法。它强调需求澄清、计划、测试驱动开发、系统化调试、代码审查和完成前验证。安装后，OpenCode 可以通过原生 `skill` 工具按需发现并加载这些能力。它不是新的大模型，也不会替代 DeepSeek。两者的分工是：

```text
DeepSeek：负责理解、推理和生成
OpenCode：负责会话、工具调用和文件操作
Superpowers：为 Agent 提供可复用的工程工作流
```

### 2. 安装前的安全检查

让 Agent 执行网络上的安装说明，本质上是在授权它读取远程内容并修改本机配置。执行前至少确认：

- URL 属于官方仓库 `obra/superpowers`；
- 当前是 Build 模式，而不是只读 Plan 模式；
- 允许 OpenCode 访问网络和修改用户配置目录；
- 已经备份现有 `opencode.json`；
- 提示词要求先展示计划和最终差异。

不要把“读取任意网页并执行所有命令”作为日常习惯。只对可信、固定且可审查的安装说明这样做。

### 3. 官方最简提示词

Superpowers README 给 OpenCode 的官方安装提示词是：

```text
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md
```

在 OpenCode 中直接发送这句话即可。OpenCode 会读取专用安装说明，并把 Superpowers 注册为插件。

### 4. 更稳妥的中文提示词

为了避免覆盖原有配置，推荐使用约束更完整的版本：

```text
请获取并严格遵循下面这份 OpenCode 官方适配安装说明：
https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md
要求：
1. 先读取说明和我现有的 OpenCode 配置，只说明计划，不立即修改；
2. 确认来源是 obra/superpowers，并概括将执行的命令与修改的文件；
3. 保留 opencode.json 中已有的 provider、model、plugin 和其他设置；
4. 获得我确认后再安装，不执行说明之外的清理或删除操作；
5. 安装后验证插件是否加载，并使用 skill 工具列出 Superpowers Skills；
6. 最后汇报实际修改、验证结果和失败时的错误信息，不要声称未验证的成功。
```

第一轮先让 OpenCode 给出计划。确认它将修改的路径和配置无误后，再回复：

```text
确认，按计划安装并完成验证。
```

### 5. 安装后应出现的配置

当前官方安装方式是在全局或项目级 `opencode.json` 的 `plugin` 数组中加入：

```json
{
    "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]
}
```

如果文件原来已有内容，最终配置可能类似：

```json
{
    "$schema": "https://opencode.ai/config.json",
    "model": "deepseek/deepseek-v4-pro",
    "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]
}
```

如果原来已经有其他插件，应该追加到数组，而不是覆盖整个数组。配置完成后退出并重新启动 OpenCode，让插件管理器完成安装和注册。

### 6. 验证 Superpowers

重启 OpenCode 后输入：

```text
Tell me about your superpowers
```

还可以要求使用原生 Skill 工具：

```text
use skill tool to list skills
```

加载一个具体 Skill：

```text
use skill tool to load brainstorming
```

如果能列出 `brainstorming`、`test-driven-development`、`systematic-debugging` 等 Skills，说明插件已经被发现。再发起一个小型需求，观察 Agent 是否会先加载相关 Skill，而不是立即写代码。

### 7. 新安装方式与旧教程的区别

旧版教程通常要求：

- `git clone` Superpowers 仓库；
- 在 `~/.config/opencode/plugins` 中创建软链接；
- 在 `~/.config/opencode/skills` 中创建软链接；
- 手动配置 `skills.paths`。

这些步骤已不是当前官方首选方案。现在应优先使用 git-backed plugin：

```text
superpowers@git+https://github.com/obra/superpowers.git
```

除非正在迁移旧安装或官方文档再次变化，不要混合两种方案。混用可能造成 Skill 重复、版本不一致或插件加载顺序混乱。

### 8. Windows 安装失败的备用方案

部分 Windows OpenCode 和 Bun 版本处理 `git+https` 包时可能失败。常见现象包括缓存路径错误，或者插件管理器找不到 `git.exe`。先确认：

```powershell
git --version
Get-Command git
```

如果重启 OpenCode 后仍失败，Superpowers 官方给出的备用方式是使用系统 npm：

```bash
npm install superpowers@git+https://github.com/obra/superpowers.git --prefix "$HOME\.config\opencode"
```

然后把插件路径改为：

```json
{
    "plugin": ["~/.config/opencode/node_modules/superpowers"]
}
```

Windows 上优先尝试 WSL，通常比原生环境更省事。

### 9. 卸载 Superpowers

卸载时从 `opencode.json` 的 `plugin` 数组删除 Superpowers 条目。保存后重启 OpenCode。如果使用过 Windows npm 备用方案，再根据 npm 安装位置清理对应本地包。如果是旧软链接方案，应参考官方迁移章节移除旧链接和旧 clone。执行删除前先确认绝对路径，避免误删其他 Skills 或配置。

## 七、基础开发工作流

### 1. 阅读陌生项目

```text
先阅读 AGENTS.md、README 和构建文件，只做只读分析。
总结技术栈、目录职责、启动方式、测试命令和主要数据流。
每个结论都引用具体文件，不要猜测。
```

### 2. 实现一个小功能

```text
在不增加新依赖的前提下，为用户列表增加按用户名筛选。
先查找现有列表查询和测试模式，给出最小方案。
确认后再修改，补充必要测试，并运行相关测试与构建。
```

### 3. 修复 Bug

```text
复现这个错误：<粘贴错误信息>。
先定位根因，不要用 try/catch 隐藏异常。
找到根因后先补一个会失败的回归测试，再做最小修复，
最后运行相关测试并展示关键结果。
```

### 4. 审查当前改动

```text
审查当前未提交 diff，重点找行为回归、安全问题、边界条件和缺失测试。
发现项按严重程度排序，并引用文件和行号。
不要修改代码，除非我确认修复。
```

### 5. 限定修改范围

提示词应明确允许和禁止的范围：

```text
只修改 src/auth 和对应测试。
不要升级依赖，不要改公共 API，不要格式化无关文件。
完成后运行 auth 模块测试和类型检查。
```

这种约束比“帮我优化项目”更容易得到可审查的结果。

### 6. 验收 Agent 的结果

不要只看 OpenCode 最后一段自然语言总结。至少检查：

```bash
git status --short
git diff --stat
git diff
```

再运行项目自己的验证命令，例如：

```bash
npm test
npm run build
```

最后确认没有 API Key、日志、缓存或临时文件进入待提交列表。

## 八、常用命令速查

| 命令或按键           | 作用                        |
| -------------------- | --------------------------- |
| `opencode`           | 在当前目录启动 TUI          |
| `opencode --version` | 查看版本                    |
| `opencode --help`    | 查看 CLI 帮助               |
| `opencode auth list` | 查看已保存的提供商凭据      |
| `/connect`           | 添加模型提供商凭据          |
| `/models`            | 搜索并切换模型              |
| `/init`              | 分析项目并生成 `AGENTS.md`  |
| `Tab`                | 切换 Plan、Build 等主 Agent |
| `@`                  | 搜索并引用文件              |
| `/undo`              | 撤销当前会话修改            |
| `/redo`              | 恢复刚撤销的修改            |
| `/share`             | 主动生成当前会话分享链接    |

对话默认不会被分享。只有主动执行 `/share` 后才会生成链接，因此分享前应检查会话中是否包含源码、路径、日志或敏感信息。

## 九、常见问题排查

### 1. 找不到 `opencode` 命令

先确认安装来源和全局目录：

```bash
npm config get prefix
npm list -g --depth=0
```

Windows 再执行：

```powershell
Get-Command opencode -All
```

安装后重新打开终端，避免旧进程没有加载新的 PATH。

### 2. `/connect` 后仍无法调用 DeepSeek

依次检查：

1. `opencode auth list` 中是否有 DeepSeek；
2. Key 是否复制完整、是否已被删除或重置；
3. DeepSeek 账户是否有可用余额；
4. `/models` 中选择的是否是 DeepSeek 官方模型；
5. 网络是否能访问 `https://api.deepseek.com`；
6. OpenCode 日志中是否有 401、402、429 或超时。

常见状态含义：

- `401`：Key 无效或认证失败；
- `402`：余额或计费状态异常；
- `429`：达到速率或并发限制；
- 超时：网络、代理或模型响应时间问题。

### 3. 模型列表中仍只有旧模型名

先升级 OpenCode，再重新打开 `/models`。OpenCode 的标准提供商元数据来自 Models.dev，旧缓存可能需要在新进程中刷新。不要在不了解字段的情况下手工伪造模型限制。

### 4. Superpowers 没有加载

检查 `opencode.json` 中是否存在正确的 `plugin` 项。然后重启 OpenCode，并要求：

```text
use skill tool to list skills
```

还可以在 macOS、Linux 或 WSL 中查看日志：

```bash
opencode run --print-logs "hello" 2>&1 | grep -i superpowers
```

Windows 原生 PowerShell 可以使用：

```powershell
opencode run --print-logs "hello" 2>&1 | Select-String -Pattern superpowers
```

如果配置正确但安装失败，再检查 Git、网络和包缓存错误。

### 5. OpenCode 修改范围过大

先执行 `/undo`，或者使用 Git 检查并恢复确定不需要的修改。下一次提示中增加明确边界：

```text
只修改这个文件；不增加依赖；不做重构；先给计划；
修改后只运行相关测试，并展示 diff。
```

不要在工作区存在重要未提交修改时，让 Agent 执行大范围自动化任务。

### 6. Token 消耗异常

结束混合了多个目标的长会话，为新任务创建新会话。检查提示词是否要求无差别扫描整个仓库、运行全部测试或生成过长解释。先用 V4 Flash 做探索，再把已经定位清楚的复杂问题交给 V4 Pro。最终应按“完成一个真实任务的成本和成功率”评估模型，而不是只看每百万 Token 单价。

## 十、安全与使用建议

1. 在 Git 仓库中启动 OpenCode，并在任务前保留可恢复的基线；
2. API Key 只放在凭据文件、环境变量或密码管理器中；
3. 安装远程插件前阅读来源、安装脚本和预期修改；
4. 高风险命令保持询问权限，不要无条件允许删除和系统级操作；
5. 提交前检查 `git diff`、测试结果和敏感信息；
6. 不要把生产数据库凭据和线上服务器权限直接暴露给日常 Agent 会话；
7. `/share` 前清理会话中的内部代码、日志、账号和路径信息；
8. 团队项目固定 OpenCode 与插件版本，避免环境随上游更新突然变化。

OpenCode 的价值来自“能执行”，风险也同样来自“能执行”。好的工作方式不是彻底禁止工具，而是把权限、范围、验证和回滚都放进任务流程。

## 十一、总结

完成本文后，一套可用的 OpenCode 环境应该满足以下条件：

- `opencode --version` 能正常输出版本；
- 能从具体 Git 项目目录启动 TUI；
- `/init` 已生成并校对 `AGENTS.md`；
- `/connect` 已保存 DeepSeek 官方 API 凭据；
- `/models` 能选择 DeepSeek V4 Flash 或 V4 Pro；
- 只读分析和小范围修改都已实际验证；
- Superpowers 已通过官方提示词安装并能列出 Skills；
- 知道如何用 Plan、Build、`@`、`/undo` 和 Git 控制任务。

推荐的日常顺序是：

```text
进入项目
  → 检查 Git 状态
  → 启动 OpenCode
  → 选择合适的 DeepSeek 模型
  → Plan 中明确方案和边界
  → Build 中实施
  → 运行测试与构建
  → 人工检查 diff
  → 再提交 Git
```

模型可以更换，插件也会更新，但“明确目标、限制范围、验证结果、保留回滚”这套方法不会过时。

## 十二、参考链接

- OpenCode 官方文档：`https://opencode.ai/docs/`
- OpenCode 中文文档：`https://opencode.ai/docs/zh-cn/`
- OpenCode 提供商配置：`https://opencode.ai/docs/providers/`
- OpenCode Skills 文档：`https://opencode.ai/docs/skills/`
- OpenCode GitHub：`https://github.com/anomalyco/opencode`
- Models.dev 模型目录：`https://models.dev/`
- DeepSeek 开放平台：`https://platform.deepseek.com/`
- DeepSeek API 文档：`https://api-docs.deepseek.com/`
- DeepSeek 模型与价格：`https://api-docs.deepseek.com/quick_start/pricing`
- Superpowers GitHub：`https://github.com/obra/superpowers`
- Superpowers 的 OpenCode 安装说明：`https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md`
