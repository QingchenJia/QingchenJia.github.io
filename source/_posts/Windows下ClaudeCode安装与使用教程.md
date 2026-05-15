---
title: Windows下Claude Code安装与使用教程
typora-root-url: Windows下ClaudeCode安装与使用教程
date: 2026-05-14 10:46:13
tags:
    - ClaudeCode
    - CLI
    - AI编程工具
---

# Windows下Claude Code安装与使用教程

Claude Code 是一个运行在终端里的 AI 编程助手。它的强项不是只会回答问题，而是可以直接进入你的项目，读取代码、理解目录结构、修改文件、运行命令，并且在长对话里持续保持上下文。

如果你在 Windows 上做开发，Claude Code 的最佳使用方式通常不是“临时问一句”，而是把它接进自己的工作流里：先完成安装，再把自定义模型接口和首次引导状态配置好，最后熟练使用 `/` 命令来切换模型、查看配置、管理权限和压缩上下文。

这篇文章就围绕这三件最重要的事情展开：安装 Claude Code、配置 `.claude/settings.json`、配置 `.claude.json`，然后系统介绍常用 `/` 命令。

## 一、先准备好基础环境

在 Windows 上使用 Claude Code，建议先确认下面几项已经就绪：

- 已安装 Node.js LTS 版本。
- 已安装 Git，方便 Claude Code 直接读取仓库。
- 已准备好 PowerShell 或 Windows Terminal。
- 你已经知道项目目录在哪里，并且能正常 `cd` 进去。

你可以先检查一下本机环境：

```powershell
node -v
npm -v
git --version
```

如果这些命令能正常输出版本号，说明基础条件基本没问题。

## 二、安装 Claude Code

Claude Code 的常见安装方式是通过 npm 全局安装。安装完成后，会得到一个可直接在终端里使用的 `claude` 命令。

```powershell
npm install -g @anthropic-ai/claude-code
```

安装后检查版本：

```powershell
claude --version
```

如果命令可以执行，说明 Claude Code 已经装好。接下来切换到你的项目目录，然后启动它：

```powershell
cd D:\Code\your-project
claude
```

进入交互式会话后，你就可以直接用自然语言描述需求，比如让它先总结项目结构、再帮你改代码、最后给你做一次检查。

## 三、第一步关键配置：`.claude/settings.json`

如果你希望 Claude Code 使用自定义的大模型接口，而不是默认的官方接入方式，就要配置 `.claude/settings.json`。这一步是整套方案里最核心的部分，因为它决定 Claude Code 到底连的是哪一套模型服务。

下面是一个完整示例：

```json
{
    "env": {
        "ANTHROPIC_BASE_URL": "https://token-plan-cn.xiaomimimo.com/anthropic",
        "ANTHROPIC_AUTH_TOKEN": "tp-xxx",
        "ANTHROPIC_MODEL": "mimo-v2.5-pro",
        "ANTHROPIC_DEFAULT_OPUS_MODEL": "mimo-v2.5-pro",
        "ANTHROPIC_DEFAULT_SONNET_MODEL": "mimo-v2.5-pro",
        "ANTHROPIC_DEFAULT_HAIKU_MODEL": "mimo-v2.5-pro",
        "CLAUDE_CODE_SUBAGENT_MODEL": "mimo-v2.5-pro",
        "CLAUDE_CODE_EFFORT_LEVEL": "max"
    },
    "enabledPlugins": {
        "superpowers@claude-plugins-official": true
    },
    "theme": "dark"
}
```

这份配置里最重要的是 `env` 这一段：

- `ANTHROPIC_BASE_URL` 用来指定自定义模型接口地址。
- `ANTHROPIC_AUTH_TOKEN` 用来提供认证令牌，示例里请替换成你自己的值。
- `ANTHROPIC_MODEL` 用来设置默认模型。
- `ANTHROPIC_DEFAULT_OPUS_MODEL`、`ANTHROPIC_DEFAULT_SONNET_MODEL`、`ANTHROPIC_DEFAULT_HAIKU_MODEL` 统一指向同一个模型，可以避免不同场景下模型行为不一致。
- `CLAUDE_CODE_SUBAGENT_MODEL` 负责子代理使用的模型。
- `CLAUDE_CODE_EFFORT_LEVEL` 设为 `max`，代表让 Claude Code 在推理、规划和修改时更愿意多思考一步。

`enabledPlugins` 和 `theme` 也很实用：

- `superpowers@claude-plugins-official` 开启后，可以给 Claude Code 增加额外能力。
- `theme: dark` 会把界面切到深色主题，终端里看起来更舒服。

如果你以后要替换模型，只需要改 `ANTHROPIC_BASE_URL` 和各个模型名即可。也就是说，这一步本质上是在给 Claude Code 换一套后端，并且把主模型、默认模型和子代理模型尽量统一起来。

## 四、第二步关键配置：`.claude.json`

如果你已经完成过首次登录或首次引导，但希望下次启动时不要重复进入欢迎页或验证流程，就可以在 `.claude.json` 里记录 onboarding 状态。

最常见的写法就是：

```json
{
    "hasCompletedOnboarding": true
}
```

这个配置的意义很简单：告诉 Claude Code 这个环境已经完成过初始化，不要每次启动都重新走第一遍引导流程。

这里要注意一点，它的作用是跳过重复的首次引导，不是绕过正常授权。你仍然需要先把接口配置好、把账号或 token 准备好，然后再保留这个状态标记，这样后续启动才会更顺畅。

如果你经常在 Windows 上反复打开终端，这个小配置能省掉不少重复操作。

## 五、第一次进入 Claude Code 怎么用

完成安装和配置后，最常见的工作方式就是进入项目目录，然后启动 Claude Code：

```powershell
cd D:\Code\your-project
claude
```

启动后，你可以直接让它先做一件最基础的事：理解项目。

```text
请先扫描当前仓库，告诉我这是一个什么项目，目录结构大致是怎样的，以及你建议我先看哪些文件。
```

接着，你还可以继续让它做这些事情：

- 总结某个模块的职责。
- 解释一段你看不懂的代码。
- 修改一个文件并说明改动原因。
- 根据报错信息帮你定位问题。
- 运行测试或构建命令并给出结果解释。

它真正有价值的地方在于：你不只是“问答”，而是在终端里直接把一个 AI 编程助手接进了你的项目工作流。

## 六、`/` 命令：Claude Code 的核心入口

在 Claude Code 的交互界面里，输入 `/` 通常就能看到它支持的命令列表。不同版本的命令可能会略有差异，所以最稳妥的原则是：先看 `/help`，再结合当前版本的实际输出使用。

下面这些命令是最值得优先掌握的。

| 命令           | 作用               | 适合场景                             |
| -------------- | ------------------ | ------------------------------------ |
| `/help`        | 查看帮助和命令列表 | 刚上手时先看它                       |
| `/model`       | 切换当前模型       | 需要更强推理或更快响应时             |
| `/config`      | 查看当前运行配置   | 排查环境、确认变量是否生效           |
| `/permissions` | 管理执行和修改权限 | 控制 Claude 是否能自动改文件或跑命令 |
| `/ide`         | 连接或切换 IDE     | 想和 VS Code 联动时                  |
| `/mcp`         | 管理 MCP 服务      | 接入浏览器、数据库、内部工具时       |
| `/compact`     | 压缩上下文         | 会话太长、上下文快满时               |
| `/clear`       | 清空当前会话       | 开启新任务，避免旧上下文干扰         |

### 1. `/help`

这是最应该先记住的命令。你不知道当前版本到底支持哪些 `/` 命令时，直接输入 `/help` 就行。

```text
/help
```

它适合两种场景：

- 刚安装完，想快速熟悉可用能力。
- 升级版本后，想确认命令有没有变化。

### 2. `/model`

当你觉得当前模型偏慢、偏保守，或者想在不同任务之间切换时，可以使用 `/model`。

```text
/model
```

实际使用里，你可能会在这些场景切换它：

- 写复杂代码时，希望模型更稳一点。
- 简单问答或轻量修改时，希望响应更快一点。

如果你的 `.claude/settings.json` 已经把多个模型都统一指向同一个后端，那么 `/model` 的意义更多是切换策略，而不是切换完全不同的服务。

### 3. `/config`

如果你想确认当前的环境变量、主题、插件、模型映射有没有生效，`/config` 很有用。

```text
/config
```

它适合在这些时候使用：

- 刚改完 `.claude/settings.json`。
- 怀疑模型没有走到自定义接口。
- 想检查插件和主题是否加载成功。

### 4. `/permissions`

Claude Code 能力很强，强到它可能会尝试修改文件、执行命令或调用工具。所以权限控制非常重要。

```text
/permissions
```

你可以把它理解成一个“安全闸门”：

- 需要它只读时，就限制它的写权限。
- 需要它改代码时，再明确放开对应权限。

这对日常开发很关键，因为你既想让它帮你干活，又不想让它在不该动的地方乱动。

### 5. `/ide`

如果你在 Windows 上主要用 VS Code 写代码，`/ide` 就很实用。

```text
/ide
```

它的作用是把 Claude Code 和你的编辑器连接起来，让你在终端里和 IDE 之间形成联动。这样做的好处是：

- 你可以在终端里驱动任务。
- 你也能在编辑器里更直观看到修改。

### 6. `/mcp`

如果你想让 Claude Code 接入更多外部能力，`/mcp` 是重点。

```text
/mcp
```

MCP 的价值在于扩展能力边界。比如你可以让 Claude Code 连接：

- 浏览器工具。
- 数据库工具。
- 项目内部服务。
- 你自己定义的辅助能力。

这也是 Claude Code 从“聊天助手”进化成“真正能干活的终端代理”的关键一步。

### 7. `/compact`

当你连续让 Claude Code 做很多事情，聊天记录会越来越长。这个时候最实用的命令之一就是 `/compact`。

```text
/compact
```

它适合这些情况：

- 你已经做了很多轮修改，想压缩上下文。
- 你担心后续对话因为太长而变慢。
- 你想保留重点任务，但不想带着太多冗余历史继续。

### 8. `/clear`

如果当前对话已经跑偏了，或者你要开一个全新的任务，直接清空会话最省事。

```text
/clear
```

这个命令适合：

- 上一个任务结束了。
- 你不想让旧上下文影响新任务。
- 你想重新开始一个干净的讨论。

## 七、一个更实用的 Claude Code 工作流程

如果你想把 Claude Code 真正用起来，可以按下面这个顺序操作：

1. 先进入项目目录并启动 `claude`。
2. 用 `/config` 确认自定义接口和主题是否加载正确。
3. 用自然语言让它扫描仓库，先理解项目。
4. 需要调整能力时，用 `/model` 切模型。
5. 需要它改文件时，用 `/permissions` 控制权限边界。
6. 需要接外部工具时，用 `/mcp` 扩展能力。
7. 会话变长后，用 `/compact` 维持上下文质量。
8. 新任务开始前，用 `/clear` 开启新会话。

这套流程跑顺之后，Claude Code 就不只是一个“回答问题的工具”，而是一个能跟着项目节奏持续工作的终端助手。

## 八、常见问题排查

### 1. `claude` 命令找不到

先检查 Node.js 和 npm 是否已经安装，并确认全局命令目录已经进了 PATH。

```powershell
node -v
npm -v
```

如果刚装完还找不到命令，先关闭终端，再重新打开一次。

### 2. 自定义模型接口没有生效

先用 `/config` 检查当前配置，再确认 `.claude/settings.json` 里的地址、token 和模型名有没有写错。

最常见的错误是：

- base URL 写错。
- token 过期或填错。
- 模型名和服务端实际支持的名称不一致。

### 3. 启动时还在重复出现引导页面

检查 `.claude.json` 里的 `hasCompletedOnboarding` 是否为 `true`。

如果你已经完成过首次初始化，但每次都重新提示，通常就是这个状态没有被正确保存。

### 4. `/` 命令列表和文章里不完全一致

这是正常现象，不同版本的 Claude Code 命令会有细微差异。遇到这种情况时，以当前版本的 `/help` 输出为准。

## 九、总结

Claude Code 在 Windows 上真正好用的关键，不是“装上就结束”，而是把环境和工作流配齐。

第一步，安装并能正常启动 `claude`。

第二步，把 `.claude/settings.json` 配好，特别是自定义模型接口、模型映射、插件和主题。

第三步，把 `.claude.json` 的 `hasCompletedOnboarding` 设好，让启动过程不再反复走首次引导。

最后，再熟练使用 `/help`、`/model`、`/config`、`/permissions`、`/ide`、`/mcp`、`/compact` 和 `/clear` 这些命令，你就能把 Claude Code 从“会话工具”真正变成自己的终端级 AI 编程助手。
