---
title: LinuxMirrors系统软件源与Docker换源教程
typora-root-url: LinuxMirrors系统软件源与Docker换源教程
date: 2026-10-11 20:08:11
categories:
    - 系统维护
tags:
    - Linux
    - Docker
    - 镜像源
---

### 一、LinuxMirrors是什么

Linux 软件下载慢，通常可以先试试换一个下载源。[LinuxMirrors](https://github.com/SuperManito/LinuxMirrors) 就是一个帮你换源的开源工具：运行脚本，选择镜像站，剩下的配置交给它完成。

它支持 Ubuntu、Debian、Rocky Linux 等常见发行版，还能安装 Docker、配置镜像加速器。相比手动修改配置文件，它用起来更省事，也会备份原来的配置，方便出问题时恢复。

本文主要讲三件事，按自己的需要选择即可：

| 你遇到的问题                  | 看哪一节                 |
| ----------------------------- | ------------------------ |
| `apt`、`dnf` 安装软件下载慢   | 给系统软件源换源         |
| 还没装 Docker，想用国内源安装 | 安装 Docker 并配置源     |
| 已经装了 Docker，但拉取镜像慢 | 只更换 Docker 镜像加速器 |

Docker 的安装源负责下载 Docker 软件，加速器负责下载容器镜像，两者需要分别配置。

### 二、开始前的准备

下面以 Ubuntu／Debian、Rocky Linux／AlmaLinux 为例。先在 Linux 终端切换到 root，后面的命令都在这个终端里执行：

```bash
sudo -i
```

已经是 root 就跳过这一步。没有 sudo 的系统，可以用 `su -` 切换。

脚本需要用 curl 下载。如果提示 `curl: command not found`，按系统选择对应命令安装：

```bash
# Ubuntu / Debian
apt-get update
apt-get install -y curl ca-certificates
```

```bash
# Rocky Linux / AlmaLinux
dnf install -y curl ca-certificates
```

Docker 部分适用于普通 Linux 服务器上的 Docker Engine，使用 systemd 管理服务。Docker Desktop、定制 NAS 等环境请参考各自的配置说明。

### 三、给系统软件源换源

#### 1.下载并运行脚本

先下载：

```bash
curl -fL https://linuxmirrors.cn/main.sh -o linuxmirrors-main.sh
```

下载成功后运行：

```bash
bash linuxmirrors-main.sh --backup true --upgrade-software false
```

这两个参数表示：备份原配置，换源后暂不升级已安装的软件。

#### 2.按提示选择镜像站

脚本会识别系统并显示可选的镜像站。用方向键选择，按回车确认：

1. 选择支持当前系统的镜像站，例如阿里云、中科大或清华。
2. 询问协议时，优先选 HTTPS。
3. 询问是否使用内网源时，普通电脑选否；对应云厂商的服务器再按需选择。
4. 如果提示已有备份，希望保留最初的配置就不要覆盖。

等待脚本执行完成即可。如果不确定某个镜像站是否支持自己的系统，可以查看[官方软件源列表](https://linuxmirrors.cn/mirrors/)。

#### 3.检查换源结果

Ubuntu／Debian 执行：

```bash
apt-get update
```

Rocky Linux／AlmaLinux 执行：

```bash
dnf makecache --refresh
```

旧系统使用 YUM 的话，执行 `yum makecache`。

看看输出中的下载地址是否已经改变，并留意有没有报错。正常完成后，就可以照常安装软件了。例如 Ubuntu 上安装 htop：

```bash
apt-get install -y htop
```

这里的 `apt-get update` 只是刷新可安装软件的列表，不会升级已安装的软件。

### 四、安装Docker并配置源

**已经安装 Docker、只想更换镜像加速器的用户，直接跳到下一节。** 本节会执行安装流程，可能更换已有的 Docker 组件或版本。

#### 1.下载并运行安装脚本

```bash
curl -fL https://linuxmirrors.cn/docker.sh -o linuxmirrors-docker.sh
```

下载成功后执行：

```bash
bash linuxmirrors-docker.sh --close-firewall false
```

`--close-firewall false` 表示保持防火墙开启。

#### 2.选择安装源和加速器

按屏幕提示完成选择：

1. **Docker CE 软件源**：选择用来下载 Docker 安装包的镜像站。
2. **Docker 镜像加速器**：选择当前网络可用、自己信任的服务。
3. **下载协议**：优先选 HTTPS。
4. **Docker 版本**：新环境一般可以选最新可用版本，有版本要求则按需选择。

选完后等待安装完成。脚本会一并安装 Compose 插件，之后使用 `docker compose` 命令即可。

#### 3.确认Docker能正常运行

```bash
systemctl is-active docker
docker version
docker compose version
docker run --rm hello-world
```

服务状态显示 `active`，能看到版本信息，并运行出 hello-world 的欢迎提示，就说明基本安装和运行正常。

### 五、只更换Docker镜像加速器

如果 Docker 已经能正常运行，只是 `docker pull` 很慢，用这一节的方法。

**换加速器时，脚本会重启正在运行的 Docker 服务，可能中断容器。正在提供服务的机器，请安排好时间再操作。**

#### 1.下载脚本

上一节已经下载过的话，可以跳过：

```bash
curl -fL https://linuxmirrors.cn/docker.sh -o linuxmirrors-docker.sh
```

#### 2.只运行换加速器功能

下载成功后执行：

```bash
bash linuxmirrors-docker.sh --only-registry
```

从列表里选择一个可用的加速器，按提示完成即可。`--only-registry` 会跳过 Docker 安装流程。

当前脚本会备份已有的 `/etc/docker/daemon.json`，只修改其中的加速器设置。出现覆盖备份的提示时，按需保留旧备份；如果之前改过 Docker 的数据目录等设置，建议另存一份配置。

#### 3.检查是否生效

```bash
docker info --format '{{json .RegistryConfig.Mirrors}}'
docker pull hello-world:latest
docker ps -a
```

第一条查看生效的加速器地址，第二条尝试拉取镜像，第三条检查容器状态。

如果依旧超时，可以重新运行脚本换一个加速器。公共服务可能限流或失效，没有哪个地址能保证一直可用。已有缓存的镜像也不适合用来比较下载速度。

这些加速器主要用于 Docker Hub，通常不能加速 `ghcr.io` 等其他仓库。

### 六、想换回原来的源怎么办

#### 1.恢复系统软件源

脚本的备份通常是在原文件名后加 `.bak`。例如，使用传统 APT 配置的系统可以这样恢复：

```bash
cp -a /etc/apt/sources.list.bak /etc/apt/sources.list
apt-get update
```

执行前先确认备份存在。新版 Ubuntu 可能使用 `/etc/apt/sources.list.d/ubuntu.sources`，对应备份是 `ubuntu.sources.bak`；Debian 常见名称为 `debian.sources`，要按实际文件恢复。

Red Hat 系的备份通常在 `/etc/yum.repos.d.bak`，将需要的 `.repo` 文件放回 `/etc/yum.repos.d/`，再刷新缓存。

如果只是想改回官方源，也可以运行：

```bash
bash linuxmirrors-main.sh --use-official-source true --upgrade-software false
```

这会重新生成源配置，不会恢复你曾经手动添加的全部内容。少数没有对应官方源的系统，脚本会改用兼容的镜像站。

#### 2.取消Docker镜像加速器

重新运行下面的命令，在列表中选择 Docker Hub 官方源：

```bash
bash linuxmirrors-docker.sh --only-registry
```

脚本会移除加速器设置。完成后再检查一次 Docker 和容器的运行状态。

### 七、遇到问题先看这里

| 问题                              | 可以怎么处理                                             |
| --------------------------------- | -------------------------------------------------------- |
| 下载脚本失败                      | 检查网络和网址，下载成功后再运行                         |
| 缺少 curl，而且原来的软件源也坏了 | 用已有的 wget 下载，或在另一台电脑下载后上传             |
| 软件源提示 404                    | 检查镜像站是否支持当前系统版本，必要时换一个站点         |
| 软件源提示签名错误                | 检查系统时间、仓库密钥和源配置，不要直接关闭签名校验     |
| Docker 拉取镜像超时               | 换一个可用的加速器，并检查网络和 DNS                     |
| Docker 无法启动                   | 用 `journalctl -u docker -n 100 --no-pager` 查看错误日志 |

更多选项可以查看 [LinuxMirrors 项目主页](https://github.com/SuperManito/LinuxMirrors)、[系统换源文档](https://linuxmirrors.cn/use/)和 [Docker 使用文档](https://linuxmirrors.cn/other/)。
