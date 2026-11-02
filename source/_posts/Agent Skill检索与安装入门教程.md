---
title: Agent Skill检索与安装入门教程
typora-root-url: Agent Skill检索与安装入门教程
date: 2026-11-02 22:50:03
categories:
    - 开发工具
tags:
    - Codex
    - AI编程工具
    - Skill
---

### 一、Skill是什么，去哪里找

Skill 可以理解为给 AI Agent 准备的“操作指南”。Agent 是能够读取文件、调用工具并完成任务的 AI 助手；安装 Skill 后，它可以按已有流程处理特定任务，例如审查代码、生成文档或整理工作交接记录。

一个 Skill 通常是一个文件夹，入口是 `SKILL.md`，里面写着名称、用途和操作步骤，也可能附带脚本、模板及参考资料。

寻找 Skill，可以按下面的顺序操作：

1. 打开 [skills.sh](https://skills.sh/)，用任务关键词搜索，例如 `handoff`（工作交接）、`code review`（代码审查）。
2. 进入结果对应的 GitHub 仓库，阅读 README，确认用途、支持的 Agent 和安装说明。
3. 打开目标 Skill 的 `SKILL.md`，看看它具体会做什么、是否需要额外工具，再决定是否安装。

也可以在 GitHub 搜索 `agent skills`，选择仓库结果并按星标数排序。**星标适合帮助发现项目，是否适用还要看具体 Skill 的说明。**

装好下文需要的 Node.js 后，还能在终端搜索：

```powershell
npx skills@latest find handoff
```

### 二、两个值得收藏的高星标仓库

| 仓库                                                      | 主要内容                                                                                         | 适合谁                                    |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| [anthropics/skills](https://github.com/anthropics/skills) | Anthropic 官方 Skill 集，包含文档处理、设计、开发和办公流程等示例，星标超过 18 万                | 想找通用能力，或学习 Skill 写法的用户     |
| [mattpocock/skills](https://github.com/mattpocock/skills) | Matt Pocock 整理的工程与效率技能，包含需求梳理、测试驱动开发、代码审查和工作交接，星标超过 30 万 | 经常用 Agent 编程、希望改进工作流程的用户 |

Anthropic 的仓库可以从 `docx`、`pdf`、`pptx`、`xlsx` 等文档技能入手，进入仓库中的 `skills` 文件夹即可浏览。

![Anthropic Skills的GitHub仓库首页](<../Agent Skill检索与安装入门教程/anthropics-skills-repo.png>)

_图 1：Anthropic Skills 仓库首页，包含技能目录、规范和模板。_

Matt Pocock 的技能集可以先看 `grill-me`、`tdd` 和 `handoff`。首次安装挑一个用得上的即可。

![Matt Pocock技能集介绍页面与安装入口](<../Agent Skill检索与安装入门教程/mattpocock-skills-website.png>)

_图 2：Matt Pocock 的技能集介绍页面，右侧提供 npx 安装命令。_

本文以第二个仓库的 [handoff](https://github.com/mattpocock/skills/tree/main/skills/productivity/handoff) 为例。它会把当前对话整理成交接文档，让另一个 Agent 或新会话接着工作，并引用已有文件、计划等资料，避免重复抄写。

### 三、安装前准备

下面以 **Windows PowerShell + Codex** 为例。Codex官方skill—— `skill-installer` 使用的技能目录是 `C:\Users\当前用户名\.codex\skills`；请将“当前用户名”替换为自己的 Windows 用户名。三种方式任选一种即可。

| 方式                       | 需要准备                                                                              | 适合的情况                      |
| -------------------------- | ------------------------------------------------------------------------------------- | ------------------------------- |
| npx 安装                   | [Node.js](https://nodejs.org/) 22.20 或以上版本、[Git](https://git-scm.com/downloads) | 希望通过安装向导完成安装        |
| Agent 调用 skill-installer | 已能使用 Codex，且启用了内置 skill-installer                                          | 希望直接用自然语言让 Agent 安装 |
| git clone 后复制           | Git                                                                                   | 希望自己管理 Skill 文件         |

安装相关工具后，重新打开终端即可使用。Windows 如果提示禁止运行 `npx.ps1`，将本文命令中的 `npx` 换成 `npx.cmd` 即可。

### 四、方式一：通过npx安装

直接在 PowerShell 中运行：

```powershell
npx skills add mattpocock/skills --skill handoff
```

1. 首次运行若询问是否下载 `skills`，输入 `y`。
2. 按提示选择 `Codex`，安装范围选择 `Global`（个人全局）。
3. 确认安装，等待完成即可。

`mattpocock/skills` 是仓库名，`--skill handoff` 表示只安装这个技能。安装其他 Skill 时，替换仓库名和技能名即可。

该工具为 Codex 默认选择的全局目录是 `C:\Users\当前用户名\.agents\skills`，与skill-installer的 `.codex\skills` 不同；若安装后本机 Codex 没有识别到，用资源管理器将其中的完整 `handoff` 文件夹移到 `.codex\skills` 即可。

### 五、方式二：让Agent调用skill-installer安装

Codex 内置了 `skill-installer`，可以根据技能名称或 GitHub 路径安装 Skill。下面的内容要发到 **Codex 对话框**，不要粘贴到 PowerShell。

1. 按“仓库名 + Skill 名称”描述需求：

    ```text
    请使用 $skill-installer，从 GitHub 的 mattpocock/skills 仓库安装 handoff。
    请安装到我用户主目录下的 .codex/skills，并告诉我最终的 SKILL.md 路径。
    ```

2. 或者直接提供目标 Skill 的目录链接，定位更准确：

    ```text
    请使用 $skill-installer 安装这个 Skill：
    https://github.com/mattpocock/skills/tree/main/skills/productivity/handoff
    请把安装目标目录指定为我用户主目录下的 .codex/skills。
    如果已有 handoff，请先说明，不要直接覆盖。
    ```

3. 等待 Agent 下载并报告结果；出现联网或目录写入权限提示时，核对操作后按客户端提示处理。

上面两段提示词任选一段。第三方技能最好带上仓库名或完整链接：只说 `handoff`，安装器可能会从默认的 `openai/skills` 精选列表中查找。

`skill-installer` 默认安装到 `$CODEX_HOME/skills`；未自定义 `CODEX_HOME` 时，就是 `C:\Users\当前用户名\.codex\skills`。其他 Agent 是否带有同名安装器，需要查看其技能列表，不能直接照搬 Codex 的内置能力。

### 六、方式三：通过git clone下载并复制

`git clone` 下载的是整个仓库。要安装其中一个 Skill，还需要把它的**完整文件夹**复制到 Agent 的技能目录。

1. 在准备存放下载文件的目录打开终端，运行：

    ```powershell
    git clone https://github.com/mattpocock/skills.git
    ```

2. 用资源管理器打开下载得到的 `skills` 文件夹，再进入其中的 `skills → productivity`，复制整个 `handoff` 文件夹。
3. 打开 `C:\Users\当前用户名\.codex\skills`，没有这个目录就手动新建，然后粘贴。

完成后，入口文件的位置应是 `C:\Users\当前用户名\.codex\skills\handoff\SKILL.md`。如果已有同名文件夹，先备份自己修改过的内容。安装其他 Skill 时，同样复制它的完整文件夹即可。

### 七、确认Agent能够使用

文件存在后，还要让 Agent 实际识别并调用一次：

1. 回到 Codex，在下一轮对话尝试调用；若没有识别到新技能，重启 Codex 后再试。Codex CLI 或 IDE 扩展中可以输入 `/skills` 查看，或输入 `$` 选择技能。
2. 在一段已经讨论过任务的对话里，发送下面的提示词：

    ```text
    请使用 $handoff，将当前任务的目标、已完成工作、待办事项和关键文件整理成交接文档。
    下一轮会话主要继续完成剩余实现和验证，请告诉我交接文件的完整路径。
    ```

3. 查看生成的文档。`handoff` 默认要求保存到系统临时目录，Windows 对应 `%TEMP%`，因此不要只在项目目录里寻找。
4. 开启新会话，把交接文件的完整路径交给 Agent，请它先读取文件，再继续任务。换电脑时，需要同时提供交接文档及其中引用的项目资料。

如果 Agent 仍然找不到技能，优先检查目录是否多套了一层、`SKILL.md` 是否存在，以及安装位置是否属于当前运行环境。Windows 与 WSL 的用户目录不同，应安装到实际运行 Agent 的那一侧。

### 八、参考资料

- [Anthropic Skills 仓库](https://github.com/anthropics/skills)
- [Matt Pocock Skills 仓库](https://github.com/mattpocock/skills)
- [handoff 的完整说明](https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md)
- [skills 命令行工具与参数](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)
- [OpenAI 官方技能文档](https://developers.openai.com/codex/skills)
- [skill-installer 官方说明](https://github.com/openai/skills/blob/main/skills/.system/skill-installer/SKILL.md)
