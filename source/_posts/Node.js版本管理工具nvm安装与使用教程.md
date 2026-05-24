---
title: Node.js版本管理工具nvm安装与使用教程
typora-root-url: Node.js版本管理工具nvm安装与使用教程
date: 2026-05-24 16:18:36
categories:
    - 开发工具
tags:
    - nvm
    - Node.js
    - 前端开发
---

## 前言

在前端项目、Node.js 后端服务、Hexo 博客、各类 CLI 工具的使用过程中，经常会遇到 Node.js 版本不一致导致的问题。

例如：

- 某个旧项目只能在 Node.js 16 中正常安装依赖；
- 新项目要求 Node.js 20 或更高版本；
- Hexo、Vite、Vue、React、Next.js 等工具链对 Node.js 版本有最低要求；
- 全局安装的 CLI 工具在切换项目时出现依赖冲突。

如果每次都手动卸载旧版本 Node.js 再安装新版本，效率很低，也容易把 npm、全局包、环境变量弄乱。

`nvm` 的作用就是管理多套 Node.js 版本，并允许我们在不同版本之间快速切换。

需要注意的是，Windows 和 Linux/macOS 上常用的 nvm 并不是同一个项目：

- Windows 推荐使用 `nvm-windows`；
- Linux、macOS、WSL 推荐使用 `nvm-sh/nvm`。

本文将分别介绍两类环境中的安装方式，并整理 nvm 的常用命令。

## nvm适合解决什么问题

nvm 的核心价值不是安装 Node.js，而是管理多个 Node.js 版本。

典型使用场景如下：

- 本机同时维护多个前端项目；
- 不同项目要求的 Node.js 主版本不同；
- 需要测试项目在多个 Node.js 版本下的兼容性；
- 希望避免系统全局 Node.js 环境被频繁覆盖；
- 希望在重装或迁移环境时快速恢复 Node.js 版本。

例如一个开发者本机可能同时存在下面几类项目：

| 项目类型       | 推荐 Node.js 版本示例 |
| -------------- | --------------------- |
| 旧版 Vue2 项目 | Node.js 14/16         |
| 常规前端项目   | Node.js 18/20         |
| 新版工具链项目 | Node.js 20/22         |
| Hexo 博客      | 依赖 Hexo 和主题要求  |
| CLI Agent 工具 | 依赖工具官方要求      |

如果没有版本管理工具，只靠系统安装包维护 Node.js，版本切换会非常麻烦。

## Windows下安装nvm-windows

Windows 原生环境下推荐使用 `nvm-windows`，项目地址如下：

```text
https://github.com/coreybutler/nvm-windows
```

进入项目的 Releases 页面，下载最新版安装包：

```text
https://github.com/coreybutler/nvm-windows/releases
```

通常选择 `nvm-setup.exe` 即可。

### 安装前清理旧版Node.js

如果电脑之前已经通过 Node.js 官网安装包安装过 Node.js，建议先卸载旧版本。

可以在 Windows 设置中进入：

```text
设置 -> 应用 -> 已安装的应用
```

找到 `Node.js` 并卸载。

卸载后重新打开 PowerShell，检查命令是否还存在：

```powershell
node -v
npm -v
```

如果命令仍然存在，说明系统环境变量中可能还残留旧路径。可以检查并清理以下常见路径：

```text
C:\Program Files\nodejs
C:\Users\用户名\AppData\Roaming\npm
C:\Users\用户名\AppData\Roaming\npm-cache
```

这里不强制删除 npm 全局包目录，但如果之前的全局包已经比较混乱，可以在备份后清理。

### 安装路径建议

安装 `nvm-windows` 时会让用户选择两个路径：

- nvm 安装目录；
- Node.js 软链接目录。

推荐使用不含中文、不含空格、权限简单的路径，例如：

```text
D:\Environment\nvm
D:\Environment\nodejs
```

也可以使用默认路径，但不建议把它安装到需要复杂权限控制的系统目录中。

安装完成后，重新打开 PowerShell 或 CMD，执行：

```powershell
nvm version
```

如果能输出版本号，说明 `nvm-windows` 已经安装成功。

## nvm-windows常用命令

### 查看可安装的Node.js版本

```powershell
nvm list available
```

该命令会列出当前可安装的 Node.js 版本，包括 LTS 版本和 Current 版本。

日常开发建议优先选择 LTS 版本，因为 LTS 版本稳定性更好，也更适合长期项目。

### 安装指定Node.js版本

安装指定版本：

```powershell
nvm install 20.11.1
```

安装最新 LTS 版本：

```powershell
nvm install lts
```

安装最新版本：

```powershell
nvm install latest
```

通常更推荐安装明确的版本号，例如：

```powershell
nvm install 20.11.1
```

这样在团队协作或环境迁移时更容易保持一致。

### 查看已安装版本

```powershell
nvm list
```

也可以使用简写：

```powershell
nvm ls
```

当前正在使用的版本前面通常会带有 `*` 标记。

### 切换Node.js版本

```powershell
nvm use 20.11.1
```

切换完成后检查：

```powershell
node -v
npm -v
```

如果输出的 Node.js 版本已经变成目标版本，说明切换成功。

### 卸载Node.js版本

```powershell
nvm uninstall 18.19.0
```

如果某个版本已经不再使用，可以通过该命令删除。

## Linux/macOS/WSL下安装nvm

Linux、macOS、WSL 环境下推荐使用 `nvm-sh/nvm`，项目地址如下：

```text
https://github.com/nvm-sh/nvm
```

官方 README 中提供了安装脚本。由于版本号会更新，建议安装前进入官方仓库确认最新命令。

安装命令形如：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

如果系统没有 `curl`，也可以使用 `wget`：

```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

执行完成后，安装脚本通常会把 nvm 初始化配置写入当前用户的 shell 配置文件中，例如：

- `~/.bashrc`
- `~/.zshrc`
- `~/.profile`
- `~/.bash_profile`

安装完成后可以重新打开终端，或者手动加载配置：

```bash
source ~/.bashrc
```

如果使用 zsh：

```bash
source ~/.zshrc
```

验证安装结果：

```bash
nvm --version
```

能够输出版本号即可。

## Linux和macOS下的常用命令

### 查看远程版本

```bash
nvm ls-remote
```

如果只想看 LTS 版本，可以执行：

```bash
nvm ls-remote --lts
```

### 安装Node.js

安装最新 LTS 版本：

```bash
nvm install --lts
```

安装指定版本：

```bash
nvm install 20.11.1
```

安装最新版本：

```bash
nvm install node
```

### 查看本机已安装版本

```bash
nvm ls
```

### 切换版本

```bash
nvm use 20.11.1
```

切换到最新 LTS：

```bash
nvm use --lts
```

### 设置默认版本

Linux/macOS 版 nvm 支持设置默认版本：

```bash
nvm alias default 20.11.1
```

设置完成后，新开终端会默认使用该版本。

也可以把默认版本设置为 LTS：

```bash
nvm alias default lts/*
```

### 卸载版本

```bash
nvm uninstall 18.19.0
```

## 项目级版本管理：使用.nvmrc

在团队项目中，最好不要只在文档里写“请使用 Node.js 20”，因为开发者很容易忽略。

更推荐在项目根目录添加 `.nvmrc` 文件。

例如：

```text
20.11.1
```

Linux/macOS/WSL 用户进入项目目录后，可以执行：

```bash
nvm use
```

nvm 会自动读取 `.nvmrc` 中声明的版本。

如果本机还没有安装该版本，可以执行：

```bash
nvm install
```

这会根据 `.nvmrc` 安装对应 Node.js 版本。

Windows 的 `nvm-windows` 对 `.nvmrc` 的自动支持并不像 `nvm-sh/nvm` 那样完整，因此在 Windows 中更常见的做法是手动读取 `.nvmrc`，然后执行：

```powershell
nvm install 20.11.1
nvm use 20.11.1
```

对于长期维护的项目，建议在 README 中同时写明 Node.js 版本要求。

## npm镜像源配置

通过 nvm 安装 Node.js 后，通常会自带 npm。

检查版本：

```bash
node -v
npm -v
```

如果 npm 下载依赖速度较慢，可以配置国内镜像源。

查看当前 npm registry：

```bash
npm config get registry
```

切换到 npmmirror：

```bash
npm config set registry https://registry.npmmirror.com
```

恢复官方源：

```bash
npm config set registry https://registry.npmjs.org
```

也可以只在单次安装时临时使用镜像源：

```bash
npm install --registry=https://registry.npmmirror.com
```

如果已经安装了 `nrm`，也可以通过 `nrm` 管理镜像源：

```bash
npm install -g nrm
nrm ls
nrm use npm
nrm use taobao
```

需要注意的是，镜像源影响的是 npm 包下载，不影响 nvm 下载 Node.js 本体。

## 全局包和Node版本的关系

使用 nvm 后，每个 Node.js 版本通常都有自己独立的 npm 全局包环境。

例如在 Node.js 18 中安装的全局包：

```bash
npm install -g hexo-cli
```

切换到 Node.js 20 后，可能就找不到 `hexo` 命令了。

这是正常现象，因为不同 Node.js 版本之间的全局包并不一定共享。

因此切换 Node.js 版本后，如果需要继续使用某些 CLI 工具，需要重新安装：

```bash
npm install -g hexo-cli
npm install -g pnpm
npm install -g yarn
```

如果不想把包管理工具直接装成全局 npm 包，也可以使用 Node.js 自带的 `corepack`：

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

这对于 pnpm、yarn 等包管理器比较方便。

## 在Hexo博客项目中的使用建议

对于 Hexo 博客项目，推荐固定一个稳定的 Node.js LTS 版本。

例如在项目根目录添加 `.nvmrc`：

```text
20.11.1
```

然后在 README 或文章中说明：

```bash
nvm install
nvm use
npm install
npm run build
```

如果是在 Windows 环境中，则可以写成：

```powershell
nvm install 20.11.1
nvm use 20.11.1
npm install
npm run build
```

这样新设备拉取项目后，就可以快速准备一致的 Node.js 环境。

## 常见问题

### nvm命令不可用

如果安装后执行：

```bash
nvm --version
```

提示命令不存在，通常是环境变量或 shell 配置没有生效。

Windows 下可以尝试：

- 关闭并重新打开 PowerShell 或 CMD；
- 检查环境变量中是否存在 `NVM_HOME` 和 `NVM_SYMLINK`；
- 确认 `nvm.exe` 所在目录已经加入 `Path`；
- 避免安装路径包含中文或特殊字符。

Linux/macOS 下可以检查 shell 配置文件中是否存在 nvm 初始化脚本：

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

如果没有，可以参考官方 README 手动补充。

### node命令仍然指向旧路径

如果执行：

```bash
node -v
where node
```

或在 Linux/macOS 中执行：

```bash
which node
```

发现 node 仍然指向旧的系统安装路径，说明环境变量优先级有问题。

Windows 下重点检查：

```text
C:\Program Files\nodejs
D:\Environment\nodejs
```

确保 nvm 管理的 Node.js 软链接路径在环境变量中生效。

Linux/macOS 下则要确认 nvm 初始化脚本已经在 shell 启动时加载。

### nvm use后版本没有变化

Windows 下如果 `nvm use` 提示权限不足，可以尝试以管理员身份运行 PowerShell。

原因是 `nvm-windows` 需要切换 Node.js 软链接目录，如果该目录权限不足，切换会失败。

建议把 nvm 和 nodejs 目录放在普通用户可写的位置，或者在安装时使用权限更清晰的目录，例如：

```text
D:\Environment\nvm
D:\Environment\nodejs
```

### 安装依赖时提示Node版本不满足要求

如果执行：

```bash
npm install
```

出现类似下面的提示：

```text
The engine "node" is incompatible with this module
```

说明项目依赖声明了 Node.js 版本要求。

可以查看项目的 `package.json`：

```json
{
    "engines": {
        "node": ">=20"
    }
}
```

然后切换到对应版本：

```bash
nvm install 20
nvm use 20
```

切换后建议重新安装依赖：

```bash
rm -rf node_modules package-lock.json
npm install
```

Windows PowerShell 可以使用：

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

如果项目使用的是 pnpm 或 yarn，则删除对应的锁文件时要谨慎，最好按项目规范处理。

### 切换版本后全局命令消失

例如原本可以使用：

```bash
hexo -v
```

切换 Node.js 版本后提示 `hexo` 命令不存在。

这是因为全局 npm 包通常跟随当前 Node.js 版本。

解决方式是重新安装对应全局包：

```bash
npm install -g hexo-cli
```

或者在项目中使用局部依赖命令：

```bash
npx hexo -v
```

对于项目构建命令，更推荐写入 `package.json`：

```json
{
    "scripts": {
        "build": "hexo clean && hexo generate",
        "server": "hexo server"
    }
}
```

然后通过 npm scripts 执行：

```bash
npm run build
npm run server
```

这样可以减少对全局包的依赖。

## 常用命令汇总

Windows `nvm-windows` 常用命令：

| 命令                    | 说明                      |
| ----------------------- | ------------------------- |
| `nvm version`           | 查看 nvm-windows 版本     |
| `nvm list available`    | 查看可安装的 Node.js 版本 |
| `nvm install 20.11.1`   | 安装指定 Node.js 版本     |
| `nvm install lts`       | 安装 LTS 版本             |
| `nvm list`              | 查看本机已安装版本        |
| `nvm use 20.11.1`       | 切换到指定版本            |
| `nvm uninstall 18.19.0` | 卸载指定版本              |

Linux/macOS/WSL `nvm-sh/nvm` 常用命令：

| 命令                        | 说明               |
| --------------------------- | ------------------ |
| `nvm --version`             | 查看 nvm 版本      |
| `nvm ls-remote`             | 查看远程可安装版本 |
| `nvm ls-remote --lts`       | 查看远程 LTS 版本  |
| `nvm install --lts`         | 安装最新 LTS 版本  |
| `nvm install 20.11.1`       | 安装指定版本       |
| `nvm ls`                    | 查看本机已安装版本 |
| `nvm use 20.11.1`           | 切换版本           |
| `nvm alias default 20.11.1` | 设置默认版本       |
| `nvm uninstall 18.19.0`     | 卸载版本           |

npm 常用配置命令：

| 命令                                                     | 说明             |
| -------------------------------------------------------- | ---------------- |
| `npm config get registry`                                | 查看当前镜像源   |
| `npm config set registry https://registry.npmmirror.com` | 切换到 npmmirror |
| `npm config set registry https://registry.npmjs.org`     | 恢复官方源       |
| `npm install -g pnpm`                                    | 全局安装 pnpm    |
| `npm install -g yarn`                                    | 全局安装 yarn    |
| `corepack enable`                                        | 启用 Corepack    |

## 总结

nvm 解决的是 Node.js 多版本共存和快速切换的问题。

在 Windows 原生环境中，推荐使用 `nvm-windows`；在 Linux、macOS 和 WSL 中，推荐使用 `nvm-sh/nvm`。两者都能管理 Node.js 版本，但安装方式、命令细节和环境变量机制并不完全相同。

对于个人开发，nvm 可以避免频繁卸载和重装 Node.js；对于团队项目，配合 `.nvmrc`、`package.json` 的 `engines` 字段以及清晰的 README，可以显著降低环境不一致带来的问题。

如果项目长期维护，建议固定一个稳定的 LTS 版本，并把 Node.js 版本要求写入项目文档。这样无论是前端项目、Hexo 博客，还是各种 Node.js CLI 工具，都能拥有更加可控的运行环境。
