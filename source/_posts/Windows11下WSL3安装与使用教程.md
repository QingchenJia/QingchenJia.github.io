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

截至本文撰写日期（2026 年 10 月 6 日），微软已发布 **WSL 3.0.1 软件版本**。本文以 Windows 11 安装 WSL 3.x、运行 Ubuntu 为例，但需要区分以下三个版本：

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

在 Windows PowerShell 中打开用户目录的全局配置文件：

```powershell
notepad "$env:USERPROFILE\.wslconfig"
```

文件不存在时创建它，确保名称是 `.wslconfig`，而不是 `.wslconfig.txt`。已有配置时合并以下选项，不要覆盖其他设置，也不要重复创建 `[wsl2]` 节：

```ini
[wsl2]
networkingMode=mirrored
dnsTunneling=true
autoProxy=true
```

- `networkingMode=mirrored`：镜像 Windows 网络接口，使 Linux 能通过 `127.0.0.1` 访问宿主机服务。
- `dnsTunneling=true`：通过 Windows 处理 DNS 查询，改善 VPN 和复杂网络下的域名解析。
- `autoProxy=true`：将 Windows HTTP 代理信息提供给 Linux 中支持代理的应用。

保存工作后，在 PowerShell 重启 WSL：

```powershell
wsl --shutdown
wsl -d Ubuntu-24.04
```

`wsl --shutdown` 会终止所有运行中的发行版和 WSL 2 虚拟机，里面的服务也会停止。切换 Windows 代理或端口后，若 WSL 未同步，重新执行这一步。

#### 3.检查代理是否生效

在 Ubuntu 中执行：

```bash
env | grep -iE '^(http_proxy|https_proxy|all_proxy|no_proxy|WSL_PAC_URL)='
curl -I --connect-timeout 10 https://www.microsoft.com
curl -v --connect-timeout 10 -o /dev/null https://www.microsoft.com
```

自动代理通常会设置大小写形式的 `HTTP_PROXY`、`HTTPS_PROXY` 和 `NO_PROXY`。查看 `curl -v` 中使用的代理变量、连接地址和 `CONNECT` 信息，确认请求是否经过代理；不要只根据网页能否打开判断。

**自动代理不是全流量转发。** 它主要帮助遵循代理变量的 HTTP/HTTPS 工具；SSH、UDP、ICMP 及忽略这些变量的程序，需要各自配置或经过实际验证的 TUN/VPN 方案。

若 Windows 使用 PAC 脚本，WSL 可能只提供 `WSL_PAC_URL`。常见 Linux CLI 不会自动解释 PAC，不能把 PAC 地址直接当成代理服务器地址，应配置客户端实际提供的 HTTP/SOCKS 端口。

#### 4.镜像网络下手动设置代理

在 Ubuntu 中执行以下命令，可对当前终端生效：

```bash
export http_proxy="http://127.0.0.1:7890"
export https_proxy="$http_proxy"
export HTTP_PROXY="$http_proxy"
export HTTPS_PROXY="$https_proxy"
export no_proxy="localhost,127.0.0.1,::1"
export NO_PROXY="$no_proxy"
```

`https_proxy` 的值仍以 `http://` 开头，因为这里使用 HTTP 代理通过 `CONNECT` 转发 HTTPS 请求；目标网址仍然是 HTTPS。

希望每次打开 Bash 时生效，可将上述配置追加到 `~/.bashrc`，然后执行：

```bash
source ~/.bashrc
```

这适用于交互式 Bash，不会自动配置 systemd 服务、所有脚本或其他 Shell。手动配置会覆盖自动读取的值；希望随 Windows 设置变化时，优先使用 `autoProxy`，并移除旧的固定代理配置。

仅提供 SOCKS5 代理时，支持它的工具可改用以下设置，端口仍需替换为实际值：

```bash
export all_proxy="socks5h://127.0.0.1:7891"
export ALL_PROXY="$all_proxy"
```

`socks5h` 表示域名由代理端解析。测试该方案前清除旧 HTTP/HTTPS 代理变量，避免工具优先使用它们；不同应用对 SOCKS 和 `ALL_PROXY` 的支持并不一致。

#### 5.NAT模式下访问宿主机代理

镜像网络不兼容当前 VPN 或网络环境时，将 `.wslconfig` 的 `networkingMode` 改为 `nat`，重启 WSL，再使用宿主机在 WSL 虚拟网络中的地址：

```bash
WIN_HOST=$(ip route show default | awk '{print $3; exit}')
printf 'Windows host: %s\n' "$WIN_HOST"
export http_proxy="http://${WIN_HOST}:7890"
export https_proxy="$http_proxy"
export HTTP_PROXY="$http_proxy"
export HTTPS_PROXY="$https_proxy"
export no_proxy="localhost,127.0.0.1,::1"
export NO_PROXY="$no_proxy"
curl -I --proxy "$http_proxy" --connect-timeout 10 https://www.microsoft.com
```

在默认 NAT 模式下，WSL 的 `127.0.0.1` 指向 Linux 自己，不能直接访问仅监听 Windows 回环地址的代理。需要让 Windows 代理客户端允许来自 WSL 的连接，例如启用“允许局域网连接”，并确认监听地址包含 WSL 可访问的宿主机地址。

同时仅允许所需端口和 WSL 网段通过 Windows 防火墙，避免把代理开放给不可信网络。宿主机地址可能在重启后变化，因此写入 `~/.bashrc` 时保留动态查询，不要固定复制某次得到的 IP。

不要直接把 `/etc/resolv.conf` 的 `nameserver` 当作宿主机代理地址：开启 DNS 隧道后，它可能是虚拟 DNS 地址。上述默认网关方式用于 NAT 模式。

#### 6.APT代理与取消代理

`sudo` 通常会过滤环境变量。如果 `curl` 能访问网络，而 `sudo apt update` 失败，可显式传入 HTTP 代理：

```bash
sudo apt-get -o Acquire::http::Proxy="$http_proxy" \
  -o Acquire::https::Proxy="$https_proxy" update
sudo apt-get -o Acquire::http::Proxy="$http_proxy" \
  -o Acquire::https::Proxy="$https_proxy" install -y curl git ca-certificates
```

这些命令用于前面已设置 HTTP/HTTPS 代理的场景，不要直接套用于只有 SOCKS 的配置。如果 `curl` 尚未安装，可先使用这组命令安装，再进行代理测试。

取消当前终端中的代理变量：

```bash
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY
unset all_proxy ALL_PROXY no_proxy NO_PROXY WSL_PAC_URL
```

还需要删除 `~/.bashrc` 中手动添加的配置；若要停止自动导入，将 `.wslconfig` 中的 `autoProxy` 改为 `false`，再重启 WSL。

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

### 六、迁移发行版、备份与恢复

#### 1.新版WSL直接迁移到D盘

新版 WSL 支持 `--manage ... --move`。先用 `wsl --help` 确认本机支持；若不支持，更新 WSL 或使用下一节的导出导入方式。

迁移前关闭相关终端、停止数据库等写入程序，保存工作并做好备份。确保目标磁盘有足够空间，使用新的专用目录，不要与另一发行版共用：

```powershell
New-Item -ItemType Directory -Path "D:\WSL-Backup" -Force
wsl --shutdown
wsl --export Ubuntu-24.04 "D:\WSL-Backup\Ubuntu-24.04.tar"
wsl --manage Ubuntu-24.04 --move "D:\WSL\Ubuntu-24.04"
wsl -l -v
wsl -d Ubuntu-24.04
```

成功后发行版名称保持不变。重新启动并检查用户文件、开发工具和服务，保留备份直到确认运行正常。

#### 2.导出后导入为新发行版

这种方式适合旧版本 WSL，或把环境迁移到另一台已安装 WSL 的电脑。以下示例先导出原发行版，再以新名称导入到 D 盘：

```powershell
New-Item -ItemType Directory -Path "D:\WSL-Backup" -Force
wsl --shutdown
wsl --export Ubuntu-24.04 "D:\WSL-Backup\Ubuntu-24.04.tar"
Get-Item "D:\WSL-Backup\Ubuntu-24.04.tar"
wsl --import Ubuntu-Migrated "D:\WSL\Ubuntu-Migrated" "D:\WSL-Backup\Ubuntu-24.04.tar" --version 2
wsl -l -v
wsl -d Ubuntu-Migrated
```

这里的 `--version 2` 指运行架构。跨电脑时复制 TAR 文件到目标电脑，再执行导入命令，并使用兼容的 CPU 架构。原发行版保留，直到新发行版通过检查。

导入的发行版可能默认以 `root` 启动。若想恢复已有普通用户，在新发行版中执行 `sudo nano /etc/wsl.conf`，将以下内容合并到文件；`qingchen` 必须是已经存在的 Linux 用户：

```ini
[user]
default=qingchen
```

退出后在 PowerShell 中重新启动，并检查默认用户：

```powershell
wsl --terminate Ubuntu-Migrated
wsl -d Ubuntu-Migrated -- whoami
wsl --set-default Ubuntu-Migrated
```

`/etc/wsl.conf` 属于单个发行版；Windows 用户目录的 `.wslconfig` 是 WSL 2 全局配置。导出备份不包含 Windows 侧全局配置，也不包含 `/mnt/c`、`/mnt/d` 中的 Windows 文件，需要另行备份。

#### 3.确认恢复成功后再删除旧发行版

**`wsl --unregister` 会永久删除指定发行版的 Linux 文件、配置和软件。** 只有确认新环境完整可用、重要文件及数据库可恢复后，才考虑执行：

```powershell
wsl --unregister Ubuntu-24.04
```

检查 TAR 文件存在或大小正常，不等于备份可恢复；完成导入并验证数据才更可靠。

### 七、常见问题与配置检查

| 问题                                    | 排查方向                                                                                 |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `wsl --version` 不可用或版本很旧        | 更新 WSL，必要时使用官方 MSI；不要只更新 Ubuntu 软件包                                   |
| 安装提示虚拟化相关错误，如 `0x80370102` | 检查 BIOS/UEFI 虚拟化、虚拟机平台组件和是否已重启                                        |
| 修改 `.wslconfig` 后没变化              | 检查文件位置、扩展名和 INI 节名，再执行 `wsl --shutdown`                                 |
| NAT 模式提示无法使用 localhost 代理     | 改用镜像网络，或使用 NAT 宿主机地址并检查代理监听地址                                    |
| `curl` 提示连接拒绝                     | 检查 Windows 代理客户端是否运行、端口是否正确及是否允许 WSL 连接                         |
| 域名解析失败                            | 检查 DNS 隧道及 `/etc/wsl.conf`，不要禁用 `generateResolvConf` 后仍期待 DNS 隧道正常工作 |
| `curl` 正常但 `apt` 失败                | 检查 `sudo` 过滤环境变量，使用 APT 显式代理选项                                          |
| 切换代理后仍使用旧端口                  | 清理 Shell 中固定变量及工具专有配置，必要时重启 WSL                                      |
| 导入后默认进入 root                     | 合并 `/etc/wsl.conf` 的 `[user]` 设置并重新启动发行版                                    |

如需限制 WSL 2 的资源占用，可在现有 `.wslconfig` 的 `[wsl2]` 节中按电脑实际配置添加以下选项，再重启 WSL；示例值不是所有电脑的推荐值：

```ini
memory=8GB
processors=4
swap=2GB
```

### 八、参考资料

- [微软：安装 WSL](https://learn.microsoft.com/zh-cn/windows/wsl/install)
- [微软：WSL 基本命令](https://learn.microsoft.com/zh-cn/windows/wsl/basic-commands)
- [微软：WSL 网络功能与自动代理](https://learn.microsoft.com/zh-cn/windows/wsl/networking)
- [微软：`.wslconfig` 与 `wsl.conf`](https://learn.microsoft.com/zh-cn/windows/wsl/wsl-config)
- [微软：WSL 故障排查](https://learn.microsoft.com/zh-cn/windows/wsl/troubleshooting)
- [微软：WSL 3.0.1 发布说明](https://github.com/microsoft/WSL/releases/tag/3.0.1)
- [微软：WSL 3.0.1 命令行帮助源文件（含安装位置与迁移参数）](https://github.com/microsoft/WSL/blob/3.0.1/localization/strings/en-US/Resources.resw)
