---
title: 教育网联合镜像站介绍与Conda换源安装PyTorch教程
typora-root-url: 教育网联合镜像站介绍与Conda换源安装PyTorch教程
date: 2026-10-29 18:54:54
categories:
    - 开发工具
tags:
    - 镜像源
    - Conda
    - PyTorch
---

### 一、教育网联合镜像站是什么

安装 Python 环境、下载深度学习框架时，如果默认仓库连接慢，可以尝试使用国内镜像。镜像站会同步上游仓库的文件，让我们从另一条网络路径下载软件。

[教育网联合镜像站](https://mirrors.cernet.edu.cn/) 基于 [MirrorZ 开源项目](https://github.com/mirrorz-org/mirrorz) 提供服务，将多个高校及教育科研机构的镜像资源汇集到统一入口。它既方便查询哪些站点提供某个仓库，也能通过统一下载地址将请求重定向到具体镜像站。

这里的“重定向”，可以理解为入口告诉下载工具：“这个文件请到另一个站点获取。” 实际文件由选中的镜像节点提供。其 [302 后端](https://github.com/mirrorz-org/mirrorz-302) 会结合访问者的 IP、运营商、地理位置和镜像监测信息选择节点，并不等于对每个用户实时测速后选出最快站点。

常用入口如下：

| 入口                                                          | 用途                                 |
| ------------------------------------------------------------- | ------------------------------------ |
| [教育网联合镜像站首页](https://mirrors.cernet.edu.cn/)        | 浏览镜像服务                         |
| [镜像列表](https://mirrors.cernet.edu.cn/list)                | 查找仓库、提供该仓库的站点及相关状态 |
| [MirrorZ Help](https://help.mirrors.cernet.edu.cn/)           | 查看软件对应的换源说明               |
| [MirrorZ GitHub 仓库](https://github.com/mirrorz-org/mirrorz) | 查看项目介绍、实现和贡献方式         |

它适合下载系统镜像、配置软件仓库以及查找开发工具的安装源。能否访问某个节点、下载是否更快，要看自己的网络；“教育网”这个名称也不意味着每个节点都只允许校园网访问，具体访问范围由站点决定。

### 二、先找对仓库，再选择使用方式

#### 1.按软件查帮助，不要只复制首页网址

1. 打开镜像列表，搜索需要的仓库，例如 `anaconda`、`pypi` 或 `pytorch`。
2. 查看有哪些站点提供该仓库，留意同步状态和站点说明。
3. 进入对应帮助页，选择镜像、HTTPS 和相关平台选项，复制生成的配置。
4. 用一次小规模的查询或安装确认可用，再决定是否长期使用。

**`https://mirrors.cernet.edu.cn/` 是入口，不能直接当成所有包管理器的安装源。** Conda 需要 channel 路径，pip 需要包索引路径，PyTorch 的不同计算平台还使用不同索引。

| 要完成的操作           | 应查看的帮助                                                  | 示例仓库路径                  |
| ---------------------- | ------------------------------------------------------------- | ----------------------------- |
| Conda 安装 Python、pip | [Anaconda 帮助](https://help.mirrors.cernet.edu.cn/anaconda/) | `/anaconda/cloud/conda-forge` |
| pip 安装普通 Python 包 | [PyPI 帮助](https://help.mirrors.cernet.edu.cn/pypi/)         | `/pypi/web/simple`            |
| pip 安装 CPU 版 torch  | [PyTorch 帮助](https://help.mirrors.cernet.edu.cn/pytorch/)   | `/pytorch/whl/cpu`            |

#### 2.统一入口与固定节点怎样选择

| 方式     | 示例                                                       | 适合的情况                                   |
| -------- | ---------------------------------------------------------- | -------------------------------------------- |
| 统一入口 | `https://mirrors.cernet.edu.cn/anaconda/cloud/conda-forge` | 希望由服务选择镜像节点                       |
| 固定节点 | `https://mirror.nju.edu.cn/anaconda/cloud/conda-forge`     | 已找到适合本机网络的站点，或需要排查跳转问题 |

统一入口使用方便，但最终节点可能变化。遇到跳转后的站点返回 403、超时或缺少某个子目录时，可以回到列表选择另一个提供该仓库的节点，按它的帮助页替换完整地址。不同站点的目录结构未必相同，不要只替换域名后就认定路径有效。

### 三、示例准备：Conda环境与torch安装源的分工

下面以 **Python 3.12、独立 Conda 环境** 为例，第四章分别说明 Windows PowerShell 和 Linux 终端中的长期换源操作，其余示例主要使用 PowerShell。先安装并初始化 Miniconda 或 Miniforge，确认终端能使用 `conda`；基础操作可参考本站的《Miniconda安装和简单使用教程》。Python 3.12 是示例选择，维护已有项目时应使用项目支持的版本。

1. 检查 Conda 和已有配置。

```powershell
conda --version
conda config --show-sources
conda config --show channels
```

2. 理解后续安装顺序。

```text
Conda 镜像 → 创建环境，安装 Python 和 pip
激活环境 → 使用环境内的 python -m pip
PyTorch wheel 镜像 → 下载并安装所需计算平台的 torch
```

channel 是 Conda 的包渠道；wheel 是 Python 的预编译安装包。Conda 与 pip 使用不同的配置，**修改 `.condarc` 不会改变 pip 的下载源**。

另外，[PyTorch 2.6 发布说明](https://pytorch.org/blog/pytorch2-6/)明确指出，从该版本开始不再发布官方 Conda 包。因此，这里用 Conda 管理环境，再用 pip 安装 PyTorch。旧的 `pytorch` Conda channel 中仍可能保留历史版本，社区渠道也可能提供自己的构建，不能把它们等同于官方继续发布的新版本。

### 四、为Conda换源并创建环境

本节按照官方帮助中的[“使用方法：包含 Anaconda 官方仓库”](https://help.mirrors.cernet.edu.cn/anaconda/#使用方法包含-anaconda-官方仓库)配置长期镜像，将默认渠道指向镜像站，并保留常用第三方渠道的映射。所选镜像需提供 `pkgs/main`、`pkgs/r` 和 `pkgs/msys2`，并支持自己的系统平台；使用官方仓库仍需遵守 Anaconda 服务条款。

#### 1.打开Conda配置文件

Windows 和 Linux 都通过用户目录下的 `.condarc` 换源，修改前可备份原文件，已有的环境目录、缓存目录等设置按需保留。

1. **Windows**：配置文件位于 `C:\Users\用户名\.condarc`。在已初始化 Conda 的 PowerShell 中执行以下命令，生成或更新配置文件，再用记事本打开：

```powershell
conda config --set show_channel_urls yes
notepad.exe "$env:USERPROFILE\.condarc"
```

2. **Linux**：配置文件位于 `~/.condarc`。在终端中使用文本编辑器打开，不存在时创建：

```bash
nano ~/.condarc
```

也可以使用 `vi ~/.condarc`。编辑当前用户的配置无需使用 `sudo`。

#### 2.写入包含Anaconda官方仓库的镜像配置

两类系统使用相同的 YAML 配置，以下以教育网联合入口为例：

```yaml
channels:
    - defaults
show_channel_urls: true
default_channels:
    - https://mirrors.cernet.edu.cn/anaconda/pkgs/main
    - https://mirrors.cernet.edu.cn/anaconda/pkgs/r
    - https://mirrors.cernet.edu.cn/anaconda/pkgs/msys2
custom_channels:
    conda-forge: https://mirrors.cernet.edu.cn/anaconda/cloud
    pytorch: https://mirrors.cernet.edu.cn/anaconda/cloud
```

`channels` 中的 `defaults` 使用 `default_channels` 指定的镜像地址；`show_channel_urls` 用于显示包来源。`custom_channels` 则为 `conda-forge` 和 `pytorch` 等第三方渠道设置镜像映射，地址写到 `/cloud` 即可，Conda 会自动拼接渠道名。配置映射不代表这些第三方渠道会自动参与默认安装，需要时再通过 `-c 渠道名` 指定。

将原文件中的同名配置项替换或合并，不要重复追加整段内容，也不要与“仅使用社区频道”的配置混用。保存文件后，后续 Conda 操作即可读取这套配置。

如果统一入口跳转后的节点不可用，可在帮助页选择一个提供所需仓库的固定镜像站，并将上述五处地址统一替换为该站点生成的地址。

#### 3.清理索引并创建环境

1. 在 Windows PowerShell 或 Linux 终端中执行以下命令，查看配置并清理旧索引：

```bash
conda config --show-sources
conda config --show channels default_channels custom_channels
conda clean -i
```

`conda clean -i` 只清理索引缓存，不会删除已有环境。检查输出中的镜像地址，若仍有旧渠道，结合 `--show-sources` 检查其他配置文件。

2. 创建后续安装 torch 使用的环境，并安装 Python、pip 和 NumPy：

```bash
conda create -n torch-demo python=3.12 pip numpy
conda activate torch-demo
python -c "import sys, numpy; print(sys.executable); print(numpy.__version__)"
python -m pip --version
```

`torch-demo` 是示例环境名，已有同名环境时请换一个名称。核对安装计划和渠道地址后，输入 `y` 确认；创建成功、能够导入 NumPy 且 Python 与 pip 的路径都属于该环境后，即可继续下一章安装 torch。

### 五、在环境内通过镜像安装torch

#### 1.先选择CPU或GPU构建

打开 [PyTorch 官方安装选择器](https://pytorch.org/get-started/locally/)，选择系统、Pip、Python 和计算平台，再与 [MirrorZ PyTorch 帮助](https://help.mirrors.cernet.edu.cn/pytorch/)中的平台选项对照。

| 使用需求                     | 选择方式                                      |
| ---------------------------- | --------------------------------------------- |
| 学习张量运算、暂时不使用显卡 | 选择 CPU，先验证安装流程                      |
| 使用 NVIDIA 显卡训练         | 按显卡、驱动和 PyTorch 支持情况选择 CUDA 构建 |
| 使用 AMD 或 Intel GPU        | 查看对应 ROCm 或 XPU 的系统与硬件支持要求     |

下面的 CPU 与 CUDA 安装示例是两种方案，不要在同一个环境中依次执行。macOS 用户应按照官方选择器提供的命令安装，不要照搬 Windows/Linux 的 CUDA 命令。

#### 2.安装CPU版torch

1. 确认处于目标环境，然后安装。

```powershell
conda activate torch-demo
python -m pip install torch --index-url https://mirrors.cernet.edu.cn/pytorch/whl/cpu
```

`--index-url` 只为本次命令指定索引，不会修改长期 pip 配置。需要图像或音频工具时，可以在同一条安装命令中使用 `torch torchvision torchaudio`，让安装器解析匹配版本；有固定版本要求的项目应遵循项目依赖和官方版本组合。

2. 检查版本、依赖和基本运算。

```powershell
python -m pip show torch
python -m pip check
python -c "import torch; print('torch:', torch.__version__); print('CUDA build:', torch.version.cuda); print('CUDA available:', torch.cuda.is_available()); print(torch.rand(2, 3))"
```

能导入 `torch` 并生成张量，说明基本安装可用。CPU 构建的 `torch.version.cuda` 应为 `None`，`torch.cuda.is_available()` 为 `False` 是正常结果。

#### 3.需要NVIDIA GPU时，按官方选择器选CUDA版本

1. 在终端查看显卡与驱动信息。

```powershell
nvidia-smi
```

其中的 `CUDA Version` 表示驱动支持的 CUDA 版本信息，不等于本机已经安装了同版本 CUDA Toolkit。使用预编译 PyTorch 包通常不需要另装完整 Toolkit，但仍需要兼容的显卡驱动；编译 CUDA 扩展时再按扩展要求准备工具链。

2. 根据官方选择器确定构建。例如，**确认应使用 CUDA 12.8 构建后**，可以在新的目标环境中执行：

```powershell
python -m pip install torch --index-url https://mirrors.cernet.edu.cn/pytorch/whl/cu128
```

`cu128` 对应 CUDA 12.8，不是任意 NVIDIA 显卡的通用选择。选择其他构建时，按帮助页给出的完整索引地址替换；不同索引包含的 PyTorch 版本也可能不同。官方命令若包含版本限制或其他参数，应一并保留。

3. 安装完成后，先执行上一节的版本检查，再验证 GPU 运算。

```powershell
python -c "import torch; assert torch.cuda.is_available(), 'CUDA unavailable'; print(torch.cuda.get_device_name(0)); print(torch.rand(2, 3, device='cuda'))"
```

如果 GPU 检查失败，先确认是否装成 CPU 构建、驱动是否兼容、当前进程能否访问显卡，再处理环境问题。更换下载源本身不会让不支持的硬件获得 CUDA 能力。

#### 4.只下载包，稍后再安装

如果希望把安装包保存下来，可在与目标机器具有相同系统、架构和 Python 版本的环境中执行下面的 CPU 示例：

```powershell
python -m pip download torch --index-url https://mirrors.cernet.edu.cn/pytorch/whl/cpu --dest .\torch-wheels
```

命令会尝试下载 torch 及其依赖到当前目录的 `torch-wheels` 文件夹，不会安装。确认所需依赖全部下载成功后，将文件夹复制到目标机器，在对应环境内安装：

```powershell
python -m pip install --no-index --find-links .\torch-wheels torch
```

这里的 `--no-index` 表示不访问在线索引。不要直接把 Windows 下载的 wheel 拿到 Linux 使用；跨平台下载需要另外指定目标平台等参数。

### 六、普通PyPI镜像与PyTorch专用索引怎样配合

普通 Python 包可以单独从 PyPI 镜像安装，例如：

```powershell
python -m pip install requests --index-url https://mirrors.cernet.edu.cn/pypi/web/simple
```

PyPI 镜像不等同于 PyTorch 的 CPU/CUDA 专用索引。只执行 `pip install torch`，或者只把 PyPI 换成国内镜像，并不能保证装到自己需要的计算平台构建。

1. 普通包使用 PyPI 镜像；torch 按选定平台使用 PyTorch 索引。
2. 优先临时传入 `--index-url`，避免为一次安装修改所有项目的 pip 行为。
3. PyTorch 索引主要提供相关包及部分依赖。如果提示缺少依赖，先核对平台、版本与官方安装命令，必要时换固定镜像节点或官方对应索引重试。
4. 不要把 `--extra-index-url` 当成自动故障切换。pip 会在多个索引的候选包中选择符合要求的版本，没有“主源缺包才查备用源”的优先级保证；混入普通 PyPI 后，可能选到其他计算平台的 torch 构建。

CPU 示例要换回官方索引时，可以使用：

```powershell
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
```

已经安装了满足要求的包时，pip 可能直接提示已满足依赖，不会重新下载。判断镜像是否生效，应结合实际下载日志查看地址，不要仅凭命令执行很快就认定加速成功。

### 七、常见问题与恢复方法

| 问题                     | 优先检查                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------ |
| Conda 仍访问原渠道       | 用 `conda config --show-sources` 查合并配置，或用 `--override-channels` 临时明确渠道 |
| 镜像返回 403、404 或超时 | 查看最终跳转节点、访问范围、仓库子目录和同步状态，换一个提供该仓库的固定节点         |
| pip 提示没有匹配的发行版 | 检查 Python、系统架构、包版本及 CPU/CUDA 索引是否匹配                                |
| torch 安装到了其他环境   | 对照 `sys.executable` 与 `python -m pip --version` 的路径                            |
| 安装成功但 CUDA 不可用   | 检查 torch 构建、显卡驱动、硬件支持和设备可见性                                      |
| 提示证书校验失败         | 检查系统时间、证书与代理配置，保留 HTTPS 校验                                        |

临时 `-c` 和 `--index-url` 参数只影响那次命令，不需要恢复配置。修改过 `.condarc` 时，可将前面备份的内容恢复到原文件；恢复会覆盖当前文件，先确认是否还有需要保留的新设置。不要为了恢复镜像设置而删除整个配置文件，以免丢失环境和缓存目录等配置。

如果之前自行设置过 pip 长期源，先查看设置来自哪里，再修改对应文件或配置项：

```powershell
python -m pip config debug
python -m pip config list
```

合理使用公共镜像，关键是选对仓库、确认同步与平台支持，再用少量实际下载判断网络表现。保留正常缓存，避免反复下载大包测速，也不要为提高速度堆叠大量并发请求。

### 八、参考资料

- [教育网联合镜像站](https://mirrors.cernet.edu.cn/)与 [MirrorZ 项目仓库](https://github.com/mirrorz-org/mirrorz)
- [MirrorZ 重定向后端说明](https://github.com/mirrorz-org/mirrorz-302)
- [MirrorZ Anaconda 帮助](https://help.mirrors.cernet.edu.cn/anaconda/)、[PyPI 帮助](https://help.mirrors.cernet.edu.cn/pypi/)与 [PyTorch 帮助](https://help.mirrors.cernet.edu.cn/pytorch/)
- [Conda 配置项说明](https://docs.conda.io/projects/conda/en/stable/configuration.html)
- [PyTorch 官方安装选择器](https://pytorch.org/get-started/locally/)与 [PyTorch 2.6 发布说明](https://pytorch.org/blog/pytorch2-6/)
- [pip 索引选择与安装参数](https://pip.pypa.io/en/stable/cli/pip_install/)
