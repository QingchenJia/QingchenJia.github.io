---
title: Windows下PowerShell终端美化教程
typora-root-url: Windows下PowerShell终端美化教程
date: 2026-05-13 12:41:56
categories:
    - 开发工具
tags:
    - PowerShell
    - OhMyPosh
    - Terminal-Icons
---

# Windows下PowerShell终端美化教程

在 Windows 上使用 PowerShell 时，如果只是默认样式，终端界面通常比较朴素，路径、Git 分支、文件图标和提示符信息都不够直观。借助 Oh My Posh 和 Terminal-Icons，可以把 PowerShell 的交互体验提升到一个很实用的水平：前者负责美化提示符，后者负责给目录和文件列表增加图标。

本文会围绕你已经在使用的这两条配置展开，完整说明它们应该放在哪里、为什么这样写，以及如何让它们在每次打开 PowerShell 时自动生效。

## 一、先看最终效果

这套配置完成后，PowerShell 一般会得到两个变化：

- 提示符会显示更丰富的信息，例如当前目录、Git 状态、执行环境等。
- 执行 `Get-ChildItem`、`dir`、`ls` 时，文件和文件夹会带上更友好的图标。

如果你经常在 Windows 上使用 PowerShell 做开发、运维或者日常脚本管理，这种美化不是单纯为了好看，而是能明显提高信息识别效率。

## 二、准备工作

在开始配置之前，建议先确认你使用的是 PowerShell 7，也就是 `pwsh`。因为你给出的初始化命令就是针对 `pwsh` 的：

```powershell
$PSVersionTable.PSVersion
$PSVersionTable.PSEdition
```

如果 `PSEdition` 显示的是 `Core`，通常就代表你用的是 PowerShell 7。若你还在使用 Windows PowerShell 5.1，建议先升级到 PowerShell 7，再继续下面的配置。

另外，Oh My Posh 的部分主题会使用 Nerd Font 字形。如果字体没设置好，提示符可能会出现方块、问号或者图标缺失。因此，后面配置完成后，记得把终端字体也一起改掉。

## 三、安装 Oh My Posh

Oh My Posh 是负责提示符美化的核心组件。你可以先用包管理器安装它，然后再调用 `oh-my-posh init pwsh` 初始化当前会话。

如果系统里已经有 `winget`，可以直接安装：

```powershell
winget install JanDeDobbeleer.OhMyPosh
```

安装完成后，先检查命令是否可用：

```powershell
oh-my-posh version
```

如果能正常输出版本号，说明 Oh My Posh 已经装好了。

## 四、安装 Terminal-Icons

Terminal-Icons 的作用是增强文件列表显示，让目录、脚本、压缩包、图片等文件类型看起来更直观。

先安装模块，建议通过管理员方式运行：

```powershell
Install-Module -Name Terminal-Icons -Repository PSGallery
```

安装后再导入模块：

```powershell
Import-Module Terminal-Icons
```

如果第一次安装时提示你确认 `NuGet` 提供程序或者信任 PSGallery，按提示选择继续即可。模块安装到当前用户范围后，后续每次打开 PowerShell 都可以直接导入。

## 五、把配置写入 PowerShell Profile

如果你希望每次打开 PowerShell 都自动生效，就不能只在当前窗口里手动执行命令，而是要把它们写进 `$PROFILE`。

先打开配置文件。如果文件不存在，就先创建：

```powershell
if (!(Test-Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force
}

notepad $PROFILE
```

然后把下面两条配置写进去，路径为主题 `json` 文件所在位置：

```powershell
# 导入提示符主题
oh-my-posh init pwsh --config "${your-theme-path}/theme-name.json" | Invoke-Expression

# 导入文件图标
Import-Module Terminal-Icons
```

这两行的含义很简单：

- 第一行会把指定的 Oh My Posh 主题注入当前 PowerShell 会话。
- 第二行会给 PowerShell 的目录和文件输出补上图标样式。

你给出的 `cloud-native-azure.omp.json` 是一个适合 Windows 终端的主题示例。如果你以后想换主题，只需要把 `--config` 后面的路径替换成另一个 `.omp.json` 文件即可。

如果你想挑选更符合自己审美的 UI 主题，可以直接前往 Oh My Posh 的官方主题文档浏览和选择：https://ohmyposh.dev/docs/themes

## 六、让配置立即生效

保存 `$PROFILE` 后，不需要重启电脑，直接重新加载配置即可：

```powershell
. $PROFILE
```

如果配置没有报错，提示符样式通常会立刻变化。此时你可以再执行一次：

```powershell
Get-ChildItem
```

如果 Terminal-Icons 生效了，文件和目录图标会更清晰地显示出来。

## 七、推荐的完整配置

如果你想直接使用一个最简洁、可落地的方案，可以把 `$PROFILE` 写成下面这样：

```powershell
# PowerShell prompt theme
oh-my-posh init pwsh --config "D:\ApplicationData\OhMyPosh\theme\cloud-native-azure.omp.json" | Invoke-Expression

# Directory and file icons
Import-Module Terminal-Icons
```

这份配置的优点是简单、稳定、容易维护。你只需要记住：

- Oh My Posh 管提示符。
- Terminal-Icons 管列表图标。
- `$PROFILE` 管自动加载。

## 八、终端字体也要一起设置

如果你的主题已经加载，但图标显示不完整，最常见的原因就是字体没换成 Nerd Font。

建议在 Windows Terminal 或 VS Code 的终端配置里，把字体设成支持 Nerd Font 的字体，例如：

```json
"font.face": "JetBrainsMono Nerd Font"
```

如果你使用的是其他 Nerd Font，比如 `MesloLGS NF` 或 `FiraCode Nerd Font`，也可以直接替换成对应字体名。

## 九、常见问题排查

### 1. `oh-my-posh` 不是内部或外部命令

这通常说明 Oh My Posh 没装好，或者可执行文件没有加入 PATH。先执行：

```powershell
oh-my-posh version
```

如果报错，重新安装一次，再检查终端是否已经刷新环境变量。

### 2. `Import-Module Terminal-Icons` 失败

先确认模块是否真的安装成功：

```powershell
Get-Module -ListAvailable Terminal-Icons
```

如果查不到结果，重新执行安装命令：

```powershell
Install-Module Terminal-Icons -Scope CurrentUser
```

### 3. 打开终端后样式没有自动生效

先确认你改的是当前用户的 PowerShell 配置文件：

```powershell
$PROFILE
```

再手动加载一次配置：

```powershell
. $PROFILE
```

如果这一步仍然没有变化，通常就是配置文件内容写错了，或者命令顺序有问题。

### 4. 图标或特殊符号显示成方块

这几乎都是字体问题。优先检查当前终端是否使用了 Nerd Font，而不是默认的 Consolas、Cascadia Mono 等普通字体。

## 十、总结

这套 PowerShell 美化方案的核心其实只有两步：把 Oh My Posh 的初始化命令写进 `$PROFILE`，再导入 Terminal-Icons 模块。完成后，你的 PowerShell 会在每次打开时自动加载主题，并且让目录列表更易读。

如果你希望终端既实用又有辨识度，这种组合已经足够覆盖大多数日常使用场景。后续你还可以继续替换 Oh My Posh 主题、调整字体、扩展自己的 PowerShell Profile，让终端更贴合自己的工作流。
