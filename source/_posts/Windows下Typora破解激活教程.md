---
title: Windows下Typora破解激活教程
typora-root-url: Windows下Typora破解激活教程
date: 2026-11-07 11:49:25
categories:
    - 效率工具
tags:
    - Typora
    - Windows
---

Typora 是一款支持实时预览的 Markdown 编辑器，适合写笔记、技术文档和博客。本文介绍 GitHub 仓库中的第三方破解激活方法，按“阅读教程 → 下载工具 → 放入安装目录 → 生成序列号 → 填写激活”的顺序操作。

在介绍破解方法之前，还是希望软件使用者能够在力所能及的范围内，尽量支持正版软件。当正版因盗版猖獗而无法获得收益以维持持续更新优化时，将会反过来影响到盗版使用者的使用体验。因此，在介绍盗版的同时，我们仍不忘提醒支持正版。

**以 Windows 版 Typora 1.9.5为例。** 仓库说明建议使用该版本，并明确记录官方 1.10.6、1.10.8 无法通过这套方法激活。

### 一、找到GitHub仓库并阅读教程

1. 打开 [743859910/Typora 仓库](https://github.com/743859910/Typora)。
2. 浏览首页 README，再打开文件列表中的[使用方法.md](https://github.com/743859910/Typora/blob/master/使用方法.md)，确认适用版本和操作顺序。
3. 在 Typora 的“文件 → 偏好设置 → 通用 → 更新”中，按仓库说明取消“自动检查更新”和“更新至开发版”，避免更新后与工具不兼容。
4. 保存正在编辑的文档，并完全退出 Typora。

![Typora第三方工具仓库主页](../Windows下Typora破解激活教程/typora-activate-github-page.png)

_图 1：仓库首页，文件列表中有使用方法，右侧 Releases 提供下载入口。_

![仓库中的使用方法说明](../Windows下Typora破解激活教程/activate-use-method.png)

_图 2：先阅读使用说明，了解文件放置位置、执行顺序和序列号填写方法。_

### 二、从网盘下载并解压工具

1. 点击仓库右侧的 **Releases**，进入 [Latest Version 发布页](https://github.com/743859910/Typora/releases/tag/Latest-Version)。
2. 阅读发布页顶部的链接修正提示，再打开下方的蓝奏云地址。页面要求将原链接末尾的 `b00rnjxib` 替换为 `b0fqcnlxg`，域名部分保持不变。
3. 在网盘中输入提取密码 `1234`，找到 Windows 版序列号生成工具，选择“普通下载”。
4. 解压下载的压缩包，打开 `Serial_number_generation_Windows` 文件夹，找到下表中的两个文件。

![发布页中的网盘入口与地址后缀提示](../Windows下Typora破解激活教程/activate-script-download.png)

_图 3：发布页同时列出网盘地址和后缀替换提示，打开前需要一起查看。_

| 文件              | 用途                       |
| ----------------- | -------------------------- |
| `node_inject.exe` | 对 Typora 程序进行补丁处理 |
| `license-gen.exe` | 生成后续填写的序列号       |

![解压后的两个可执行文件](../Windows下Typora破解激活教程/activate-script-file.png)

_图 4：解压后的工具目录，需要使用其中的两个 `.exe` 文件。_

这两个文件是 Windows 可执行程序，日常也有人统称为“激活脚本”。其中的补丁程序会修改 Typora 安装文件，操作前可备份安装目录。

### 三、将工具放入Typora安装目录

1. 右键 Typora 快捷方式，选择“打开文件所在的位置”；如果打开的仍是快捷方式目录，继续定位到实际程序目录。
2. 确认目录内能看到 `Typora.exe`。
3. 将 `node_inject.exe` 和 `license-gen.exe` 两个文件剪切、粘贴到这里，与 `Typora.exe` 放在同一层。

配图中的安装路径为 `D:\Program Files\Typora`。自己的路径可能不同，以实际找到的目录为准；不要放到主题文件夹或 Markdown 文档目录。

### 四、运行工具并复制激活码

#### 1.在安装目录打开终端

1. 在 Typora 安装目录的文件资源管理器地址栏输入 `powershell`，按回车。
2. 确认终端提示符显示的是刚才的安装目录。
3. 输入以下命令并回车，先执行补丁处理：

```powershell
.\node_inject.exe
```

如果提示拒绝访问，使用管理员身份打开 PowerShell，再通过 `Set-Location 'D:\Program Files\Typora'` 切换目录后执行；命令中的路径需替换为自己的安装路径。

#### 2.生成并复制序列号

补丁处理完成后，在同一个窗口执行：

```powershell
.\license-gen.exe
```

找到输出中的 `License for you:`，选中冒号后面的完整序列号并复制，保留中间的连字符。后续使用本机生成的结果即可。

![PowerShell中执行工具并生成序列号](../Windows下Typora破解激活教程/activate-code-get.png)

_图 5：先运行补丁程序，再运行序列号生成器；激活码位于 `License for you:` 后面。_

图中的 `You may have already installed the hook.Please check manually.` 表示程序判断可能已经安装过补丁。是否完成激活，还要看下一步的 Typora 界面。

### 五、填写序列号并确认激活

1. 重新打开 Typora，进入“输入序列号”的激活窗口。
2. 按仓库说明填写邮箱；界面要求确认邮箱时，两次输入保持一致。
3. 在序列号栏粘贴刚才生成的激活码，确认没有多余空格或 `License for you:` 前缀。
4. 点击“激活”，查看返回结果。

![Typora激活窗口中的邮箱与序列号表单](../Windows下Typora破解激活教程/activate-typora-form-page.png)

_图 6：填写邮箱和生成的序列号，然后点击“激活”。_

成功后，界面会显示“您的序列号”和“已使用以下序列号激活”，并出现“取消激活”按钮，如下图所示。

![Typora显示已使用序列号激活](../Windows下Typora破解激活教程/success-activate-page.png)

_图 7：激活后的序列号页面。确认状态后，点击“关闭”返回编辑器。_

如果没有出现上述状态，先核对 Typora 版本、两个工具的放置位置和补丁执行结果，再检查序列号是否复制完整。仓库还建议遇到激活或更新错误时，在“文件 → 偏好设置 → 通用”中启用“Typora 服务使用国内服务器”，重启后重试。

### 六、参考资料

- [第三方工具仓库](https://github.com/743859910/Typora)
- [仓库使用方法](https://github.com/743859910/Typora/blob/master/使用方法.md)
- [工具下载发布页](https://github.com/743859910/Typora/releases/tag/Latest-Version)
