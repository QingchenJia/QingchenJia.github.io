---
title: Windows11下WSL3安装与使用教程
typora-root-url: Windows11下WSL3安装与使用教程
date: 2026-10-06 19:28:09
categories:
    - 开发工具
tags:
    - WSL
    - Windows11
    - Linux
---

### 一、WSL是什么：先区分软件版本与运行架构

`WSL`（Windows Subsystem for Linux）允许在 Windows 中运行 Linux 发行版，适合使用 Bash、Git、Python、Node.js 等开发工具，也能在同一台电脑上同时使用 Windows 软件和 Linux 环境。

本文以 Windows 11 安装 WSL 3.x、运行 Ubuntu 为例，但需要区分以下三个版本：

| 版本类型         | 查询方式              | 含义                               |
| ---------------- | --------------------- | ---------------------------------- |
| WSL 软件版本     | `wsl --version`       | WSL 应用及其组件的版本，例如 3.0.1 |
| WSL 运行架构     | `wsl -l -v`           | 每个发行版使用 WSL 1 或 WSL 2      |
| Linux 发行版版本 | `cat /etc/os-release` | Ubuntu、Debian 等操作系统的版本    |

**安装 WSL 3.x 软件后，普通发行版仍可运行在 WSL 2 架构上。** 因此，本文使用 `wsl --set-default-version 2`，配置文件使用 `[wsl2]`，不能把这些数字直接改成 `3`。

WSL 2 使用真实的 Linux 内核，兼容性通常优于 WSL 1，是本文采用的运行架构。下文 `powershell` 代码块在 Windows PowerShell 中执行，`bash` 代码块在 Ubuntu 中执行；`ini` 是配置文件内容。

### 二、安装WSL 3.x与Ubuntu

#### 1.准备Windows环境

推荐 Windows 11 **22H2 或更新版本**，并更新系统。后文镜像网络和 DNS 隧道需要这一条件；仅安装 WSL 并不要求这些网络功能。

使用 `Win + R` 输入 `winver` 查看 Windows 版本。在任务管理器的“性能 → CPU”页面确认“虚拟化”已启用；未启用时，到 BIOS/UEFI 开启 Intel VT-x 或 AMD-V/SVM。若 Windows 本身运行在虚拟机中，还需要宿主平台支持嵌套虚拟化。

首次安装时，右键开始菜单，打开“终端（管理员）”，执行：

```powershell
wsl --install
```

该命令会安装所需组件和默认 Ubuntu 发行版。按提示重启 Windows，再启动 Ubuntu。如果 WSL 已经安装，不必重复执行，直接更新软件并按需安装发行版。

#### 2.更新WSL并确认版本

```powershell
wsl --update
wsl --version
wsl --status
```

`wsl --version` 中的 WSL 软件版本应为 `3.x` 或你实际安装的更新版本。`wsl --update` 获取当前可用更新，并不是固定安装某个版本的命令。

如果商店更新不可用，可改用：

```powershell
wsl --update --web-download
```

如果仍未获得 3.x，可从 [微软 WSL 官方发布页](https://github.com/microsoft/WSL/releases) 下载对应版本的 MSI 安装包，按设备选择 `x64` 或 `ARM64`，安装后重新检查。本文核对的版本为 [WSL 3.0.1](https://github.com/microsoft/WSL/releases/tag/3.0.1)。

#### 3.选择并安装Linux发行版

先查询可安装列表，再使用列表中的准确名称：

```powershell
wsl --list --online
wsl --set-default-version 2
wsl --install -d Ubuntu-24.04
```

本文后续命令统一使用 `Ubuntu-24.04`。如果你通过 `wsl --install` 安装的名称是 `Ubuntu`，请替换示例中的发行版名称，具体以 `wsl -l -v` 为准。

安装下载停在 `0.0%` 时，可以尝试：

```powershell
wsl --install --web-download -d Ubuntu-24.04
```

新版 WSL 也支持在安装时指定存储位置，适合希望一开始就把发行版放到 D 盘的用户；这与上面的安装方式二选一：

```powershell
wsl --install -d Ubuntu-24.04 --location "D:\WSL\Ubuntu-24.04"
```

#### 4.创建Linux用户

首次启动 Ubuntu 时，按提示创建普通用户，例如 `qingchen`，并设置密码。Linux 输入密码时不会显示字符或星号，这是正常现象；该密码与 Windows 登录密码相互独立。

```powershell
wsl -l -v
wsl --set-default Ubuntu-24.04
wsl -d Ubuntu-24.04
```

`wsl -l -v` 中 `VERSION` 显示 `2` 是预期结果。如果显示 `1`，先备份重要数据，再执行 `wsl --set-version Ubuntu-24.04 2` 转换架构。

### 三、让WSL使用Windows宿主机代理

Windows 浏览器能使用代理，并不表示 Linux 命令自动使用了它。推荐先配置 **镜像网络 + 自动代理**；自动读取失败、使用 PAC 或个别工具不遵循代理变量时，再进行手动配置。

以下示例假设 Windows 代理客户端提供 **HTTP 或混合代理端口 `7890`**。请以客户端实际端口为准，不能把 SOCKS 专用端口当作 HTTP 代理使用。

#### 1.确认Windows系统代理已开启

在代理客户端开启“系统代理”，或在 Windows“设置 → 网络和 Internet → 代理”中配置代理地址与端口。Windows 本机代理通常为 `127.0.0.1:7890`。

`autoProxy` 读取 Windows 的 HTTP 代理信息。仅启动客户端、只给浏览器设置代理，或者只配置 WinHTTP，并不能保证它读取到预期设置。TUN 模式是否覆盖 WSL 流量，取决于客户端实现和路由规则，需要单独验证。

#### 2.启用镜像网络、DNS隧道与自动代理

![](../Windows11下WSL3安装与使用教程/WSL-network-setting.png)

_如上图所示， WSL3 现支持直接通过 GUI 进行网络配置，将网络模式设置为 mirror ，并启用自动代理和 DNS 代理。_

#### 3.进行WSL环境配置

使用 vim 命令编辑 /etc/environment 文件内容，在环境变量中添加如下配置项，其中代理端口号以 7897 为例：

```properties
http_proxy="http://127.0.0.1:7897"
https_proxy="http://127.0.0.1:7897"
HTTP_PROXY="http://127.0.0.1:7897"
HTTPS_PROXY="http://127.0.0.1:7897"
```

#### 4.测试规则模式下代理网络连通性

以 www.google.com 为例进行测试连通性，在 shell 中输入命令脚本如下：

```bash
curl -sS -o /dev/null \
  -w '状态码: %{http_code}\n耗时: %{time_total}s\n远端IP: %{remote_ip}\n' \
  --max-time 10 \
  https://www.google.com
```

若响应结果中状态码显示为 200 则表示能够正常访问目标 url 的网络，也就代表网络代理配置正确完成。

### 四、常用命令与Linux系统信息查询

#### 1.Windows侧管理命令

以下命令在 PowerShell 中执行，发行版名称以本机列表为准：

| 需求                         | 命令                             |
| ---------------------------- | -------------------------------- |
| 查看 WSL 软件及组件版本      | `wsl --version`                  |
| 查看默认发行版与内核等状态   | `wsl --status`                   |
| 查看可安装发行版             | `wsl -l -o`                      |
| 查看已安装发行版、状态及架构 | `wsl -l -v`                      |
| 查看正在运行的发行版         | `wsl --list --running`           |
| 进入默认发行版               | `wsl`                            |
| 从 Linux 用户主目录启动      | `wsl ~`                          |
| 进入指定发行版               | `wsl -d Ubuntu-24.04`            |
| 以 root 身份进入             | `wsl -d Ubuntu-24.04 -u root`    |
| 设置默认发行版               | `wsl --set-default Ubuntu-24.04` |
| 设置新发行版默认使用 WSL 2   | `wsl --set-default-version 2`    |
| 停止指定发行版               | `wsl --terminate Ubuntu-24.04`   |
| 停止全部 WSL 环境            | `wsl --shutdown`                 |
| 更新 WSL 软件                | `wsl --update`                   |
| 查看完整命令帮助             | `wsl --help`                     |

也可以直接从 Windows 调用 Linux 命令：

```powershell
wsl -d Ubuntu-24.04 -- cat /etc/os-release
wsl -d Ubuntu-24.04 -- uname -r
wsl -d Ubuntu-24.04 -- hostname -I
```

在 Linux 中调用 WSL 管理命令时，要使用 `wsl.exe`，例如 `wsl.exe -l -v`。

#### 2.Linux侧信息查询与基础操作

```bash
cat /etc/os-release    # 发行版名称、版本、ID
uname -r              # Linux 内核版本，不是发行版版本
uname -m              # CPU 架构，例如 x86_64、aarch64
whoami                # 当前 Linux 用户
pwd                   # 当前目录
df -h /               # 根文件系统磁盘使用情况
free -h               # 内存使用情况
ip addr               # 网络接口与地址
ip route              # 路由信息
exit                  # 退出当前 Shell
```

`lsb_release -a` 也能查询部分发行版信息，但不保证默认安装；`/etc/os-release` 通常更通用。退出 Shell 不等于强制停止发行版，后台服务可能继续运行。

联网正常后，在 Ubuntu 中更新系统软件并安装基础工具：

```bash
sudo apt update
sudo apt upgrade
sudo apt install -y curl git ca-certificates
```

这是更新 Ubuntu 软件包，与 Windows 中的 `wsl --update` 更新 WSL 本身不同。若依赖手动代理且 `sudo` 未保留变量，使用上一节的 APT 显式代理方式。

### 五、Windows与Linux之间访问文件

Windows 磁盘默认挂载到 `/mnt` 下，例如 C 盘对应 `/mnt/c`，D 盘对应 `/mnt/d`：

```bash
cd /mnt/d
explorer.exe .
mkdir -p ~/projects
cd ~/projects
```

在 Windows 文件资源管理器地址栏输入 `\\wsl.localhost\Ubuntu-24.04\home`，即可访问 Linux 用户目录；也可使用 `\\wsl$\Ubuntu-24.04\home`。

经常由 Linux 工具读写的项目，建议放在 `~/projects` 等 Linux 文件系统目录，通常能获得更好的性能和权限兼容性。不要从 Windows 直接修改发行版内部存储文件或随意移动正在使用的 `ext4.vhdx`。

### 六、参考资料

- [微软：安装 WSL](https://learn.microsoft.com/zh-cn/windows/wsl/install)
- [微软：WSL 网络功能与自动代理](https://learn.microsoft.com/zh-cn/windows/wsl/networking)
- [微软：WSL 故障排查](https://learn.microsoft.com/zh-cn/windows/wsl/troubleshooting)
- [微软：WSL 3.0.1 发布说明](https://github.com/microsoft/WSL/releases/tag/3.0.1)
