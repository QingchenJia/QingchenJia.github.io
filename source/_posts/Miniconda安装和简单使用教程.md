---
title: Miniconda安装和简单使用教程
typora-root-url: Miniconda安装和简单使用教程
date: 2026-05-23 11:20:41
categories:
    - 开发工具
tags:
    - Miniconda
    - Conda
    - Python
---

### 一、引言

在`Python`开发中，最容易遇到的问题之一就是环境混乱：不同项目依赖不同版本的`Python`，同一个包在不同项目中需要不同版本，机器上还可能同时存在系统自带`Python`、官网安装的`Python`、IDE内置解释器等多套环境。

`Conda`的核心价值就是把这些环境隔离开来。我们可以为每个项目创建独立的虚拟环境，并在环境中安装对应版本的`Python`和依赖包。这样一个项目的依赖升级、删除或损坏，不会影响其他项目。

`Miniconda`可以理解为一个轻量版的`Anaconda`。它只包含`conda`本体、`Python`和少量基础包，不会像完整`Anaconda`那样预装大量科学计算库。对于日常开发来说，先安装`Miniconda`，再按项目需要安装依赖，通常更加干净、可控。

本文主要介绍：

- 如何安装`Miniconda`；
- 如何创建、切换、删除虚拟环境；
- 如何安装和管理包；
- 如何配置虚拟环境目录和包缓存目录；
- 为什么在`Windows`下新建环境可能没有进入指定目录，而是落到了用户目录。

### 二、Miniconda与Anaconda的区别

#### 1. Anaconda

`Anaconda`是一个面向数据分析、机器学习和科学计算的完整发行版，安装后会自带大量常用包，例如`numpy`、`pandas`、`matplotlib`、`scikit-learn`、`jupyter`等。

它的优点是开箱即用，适合教学、实验和不想手动处理依赖的新手用户。缺点也比较明显：安装包体积大，默认环境比较重，很多预装包可能长期用不到。

#### 2. Miniconda

`Miniconda`只提供最小可用环境，安装后主要包含：

- `conda`包管理器；
- 一个基础`Python`解释器；
- 少量必要依赖。

后续需要什么包，就在对应环境中安装什么包。因此它更适合开发者长期使用，也更容易保持环境清晰。

如果只是想管理`Python`虚拟环境和依赖包，推荐优先选择`Miniconda`。

### 三、下载安装Miniconda

#### 1. 下载地址

可以从`Miniconda`官方页面下载对应系统的安装包：

```text
https://docs.conda.io/en/latest/miniconda.html
```

常见选择如下：

- `Windows`：选择`Miniconda3 Windows 64-bit`安装包；
- `macOS`：根据芯片选择`Intel`或`Apple Silicon`版本；
- `Linux`：选择对应架构的`shell`安装脚本。

本文主要以`Windows`系统为例说明，`Linux`和`macOS`中的常用命令基本一致。

#### 2. Windows安装建议

双击安装包后，按向导安装即可。安装过程中需要关注几个选项。

首先是安装范围：

- `Just Me`：只为当前用户安装；
- `All Users`：为所有用户安装。

如果没有管理员权限，建议选择`Just Me`，安装到当前用户目录下，例如：

```text
C:\Users\用户名\miniconda3
```

如果希望安装到自定义目录，例如：

```text
D:\Develop\Miniconda3
```

需要确保当前用户对这个目录有完整的读写权限。后面配置虚拟环境目录时，这一点非常关键。

其次是环境变量选项。安装器一般会提示是否将`Miniconda`加入`PATH`。保守做法是不勾选该选项，而是通过开始菜单中的`Anaconda Prompt`或`Miniconda Prompt`使用`conda`。如果确实希望在普通`PowerShell`或`CMD`中直接使用`conda`，可以安装完成后再执行初始化命令。

#### 3. Linux安装示例

在`Linux`中可以下载`shell`安装脚本后执行：

```bash
bash Miniconda3-latest-Linux-x86_64.sh
```

安装过程中按提示确认协议、选择安装目录即可。安装完成后重新打开终端，检查`conda`是否可用：

```bash
conda --version
```

### 四、初始化终端环境

#### 1. 检查conda版本

安装完成后，打开`Anaconda Prompt`或`Miniconda Prompt`，执行：

```bash
conda --version
```

如果能够输出版本号，说明`conda`已经可以正常使用，例如：

```text
conda 24.11.3
```

#### 2. 在PowerShell中使用conda

如果希望在`PowerShell`中直接使用`conda activate`命令，可以执行：

```bash
conda init powershell
```

执行完成后关闭当前`PowerShell`窗口，重新打开一个新的`PowerShell`。如果看到命令行前面出现`(base)`，说明初始化已经生效。

如果不希望终端每次打开都自动进入`base`环境，可以关闭自动激活：

```bash
conda config --set auto_activate_base false
```

之后需要使用`base`环境时再手动执行：

```bash
conda activate base
```

### 五、配置环境目录和包目录

#### 1. 为什么要配置目录

默认情况下，`conda`会把虚拟环境和包缓存放在用户目录或`Miniconda`安装目录中。随着项目增多，虚拟环境和缓存包会占用较多磁盘空间。

如果系统盘空间有限，或者希望把所有开发环境统一放到指定磁盘，可以提前配置：

- 虚拟环境目录：用于存放不同项目的独立环境；
- 包缓存目录：用于存放下载过的安装包和解压缓存。

例如希望统一放到`D`盘：

```text
D:\Conda\envs
D:\Conda\pkgs
```

#### 2. 查看当前配置

可以先查看当前`conda`配置：

```bash
conda config --show
```

重点关注两个配置项：

```yaml
envs_dirs:
    - D:\Conda\envs
pkgs_dirs:
    - D:\Conda\pkgs
```

如果没有配置过，可能会看到默认路径。

#### 3. 设置虚拟环境目录

设置虚拟环境存放目录：

```bash
conda config --add envs_dirs D:\Conda\envs
```

如果已经有旧目录，也可以继续追加多个目录。`conda`会按配置顺序寻找可用位置。

查看配置是否生效：

```bash
conda config --show envs_dirs
```

#### 4. 设置包缓存目录

设置包缓存目录：

```bash
conda config --add pkgs_dirs D:\Conda\pkgs
```

查看配置：

```bash
conda config --show pkgs_dirs
```

之后通过`conda install`下载的包会优先缓存到该目录。

#### 5. 直接编辑.condarc文件

`conda`的用户配置通常保存在用户目录下的`.condarc`文件中，例如：

```text
C:\Users\用户名\.condarc
```

也可以直接编辑该文件，写入类似配置：

```yaml
envs_dirs:
    - D:\Conda\envs
pkgs_dirs:
    - D:\Conda\pkgs
channels:
    - defaults
show_channel_urls: true
auto_activate_base: false
```

保存后重新打开终端即可。

### 六、创建和管理虚拟环境

#### 1. 创建指定Python版本的环境

创建一个名为`py310`的环境，并安装`Python 3.10`：

```bash
conda create -n py310 python=3.10
```

其中：

- `create`表示创建环境；
- `-n py310`表示环境名称为`py310`；
- `python=3.10`表示安装指定版本的`Python`。

创建过程中会显示需要安装的包列表，输入`y`确认即可。

#### 2. 激活环境

环境创建完成后，使用以下命令进入环境：

```bash
conda activate py310
```

进入后，终端前面会出现环境名称：

```text
(py310) PS D:\Code\demo>
```

此时执行：

```bash
python --version
```

应该能看到环境内的`Python`版本。

#### 3. 退出环境

退出当前环境：

```bash
conda deactivate
```

如果当前在`py310`环境中，执行后会回到`base`环境或普通终端状态。

#### 4. 查看已有环境

查看本机所有`conda`环境：

```bash
conda env list
```

也可以使用：

```bash
conda info --envs
```

输出中带有星号`*`的环境表示当前正在使用的环境。

#### 5. 删除环境

如果某个环境不再使用，可以删除：

```bash
conda remove -n py310 --all
```

删除前建议确认环境名称，避免误删仍在使用的项目环境。

### 七、在指定目录创建虚拟环境

#### 1. 使用环境名创建

最常见的方式是使用`-n`指定环境名称：

```bash
conda create -n demo python=3.11
```

如果已经配置了`envs_dirs`，这个环境通常会被创建到配置目录下，例如：

```text
D:\Conda\envs\demo
```

#### 2. 使用完整路径创建

如果希望某个项目的环境直接放在项目目录或其他固定目录中，可以使用`-p`指定完整路径：

```bash
conda create -p D:\Conda\envs\demo python=3.11
```

激活这种环境时，也需要使用路径：

```bash
conda activate D:\Conda\envs\demo
```

这种方式适合需要明确控制环境位置的场景。

#### 3. 检查环境实际位置

创建完成后，可以执行：

```bash
conda env list
```

查看环境实际创建到了哪里。如果期望它在`D:\Conda\envs`，但结果却在类似下面的目录：

```text
C:\Users\用户名\.conda\envs\demo
```

就需要检查目录权限和`conda`配置。

### 八、Windows下环境没有创建到指定目录的原因

#### 1. 常见现象

在`Windows`系统中，有时已经配置了：

```yaml
envs_dirs:
    - D:\Develop\Miniconda3\envs
```

但执行：

```bash
conda create -n demo python=3.11
```

之后发现环境没有出现在`D:\Develop\Miniconda3\envs`，而是被创建到了用户目录：

```text
C:\Users\用户名\.conda\envs\demo
```

这通常不是`conda`配置没有生效，而是目标目录没有足够的写入权限。

#### 2. 为什么会这样

`conda`创建虚拟环境时，需要在目标目录中创建文件夹、写入解释器、安装依赖包，并维护环境元数据。如果`Miniconda`所在文件夹或指定的`envs`目录权限不够，`conda`无法写入该位置。

在`Windows`下，这种情况尤其常见。例如：

- `Miniconda`安装在`C:\Program Files`等受保护目录；
- `Miniconda`安装目录是管理员创建的，当前普通用户没有完整控制权限；
- 指定的`envs`目录继承了上级目录的只读或受限权限；
- 公司电脑或校园电脑存在额外权限策略。

当目标目录不可写时，`conda`可能会退回到当前用户目录下创建环境，例如`C:\Users\用户名\.conda\envs`。

#### 3. 解决方式

推荐做法是把环境目录和包目录放到当前用户有完整权限的位置，例如：

```text
D:\Conda\envs
D:\Conda\pkgs
```

然后重新配置：

```bash
conda config --add envs_dirs D:\Conda\envs
conda config --add pkgs_dirs D:\Conda\pkgs
```

如果仍然想放在`Miniconda`安装目录下，需要确保当前用户对该目录有写入权限。可以在文件资源管理器中右键目录，进入：

```text
属性 -> 安全 -> 编辑
```

为当前用户添加修改或完全控制权限。

更稳妥的方式是安装`Miniconda`时就选择当前用户可写目录，例如：

```text
D:\Develop\Miniconda3
```

不要安装到需要管理员权限的系统保护目录中。

#### 4. 验证是否修复

修复权限或调整目录后，重新创建测试环境：

```bash
conda create -n test-env python=3.11
```

然后查看：

```bash
conda env list
```

如果看到环境路径已经位于指定目录，例如：

```text
D:\Conda\envs\test-env
```

说明配置和权限已经正常。

测试完成后可以删除该环境：

```bash
conda remove -n test-env --all
```

### 九、安装和管理Python包

#### 1. 使用conda安装包

进入目标环境后，可以通过`conda install`安装包：

```bash
conda activate py310
conda install numpy pandas matplotlib
```

`conda`会解析依赖关系，并尽量安装互相兼容的版本。

#### 2. 安装指定版本

如果项目要求固定版本，可以写明版本号：

```bash
conda install python=3.10 numpy=1.26
```

对于复现实验环境或老项目维护来说，固定版本很重要。

#### 3. 使用pip安装包

有些包不在`conda`默认源中，或者`conda`版本较旧，可以在当前环境中使用`pip`安装：

```bash
pip install requests
```

需要注意的是，使用`pip`前一定要先激活目标环境，并确认当前`pip`属于该环境：

```bash
where pip
where python
```

在`Linux`或`macOS`中可以使用：

```bash
which pip
which python
```

路径应该指向当前`conda`环境目录，而不是系统`Python`目录。

#### 4. conda与pip混用建议

一般建议优先使用`conda install`安装基础科学计算类依赖，例如：

- `numpy`
- `pandas`
- `scipy`
- `matplotlib`
- `scikit-learn`

如果`conda`中没有，再使用`pip install`补充。混用时尽量遵循一个原则：先用`conda`安装主要依赖，最后再用`pip`安装缺失依赖。这样可以减少依赖解析冲突。

#### 5. 查看已安装包

查看当前环境已安装包：

```bash
conda list
```

如果只想查某个包：

```bash
conda list numpy
```

使用`pip`安装的包也通常会出现在`conda list`中。

#### 6. 更新和卸载包

更新某个包：

```bash
conda update numpy
```

卸载某个包：

```bash
conda remove numpy
```

如果使用`pip`安装，则对应命令为：

```bash
pip uninstall requests
```

### 十、配置国内镜像源

#### 1. 为什么要切换镜像源

默认情况下，`conda`会从官方源下载包。国内网络环境下，下载速度可能较慢，甚至出现连接失败。此时可以配置国内镜像源。

以清华大学镜像源为例，可以执行：

```bash
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/msys2
conda config --set show_channel_urls true
```

如果使用`conda-forge`，也可以添加：

```bash
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge
```

配置后可以查看：

```bash
conda config --show channels
```

#### 2. 恢复默认源

如果镜像源临时不可用，可以删除自定义源或恢复默认配置：

```bash
conda config --remove-key channels
```

之后`conda`会回到默认源配置。

#### 3. pip镜像源

如果经常使用`pip`，也可以配置`pip`镜像。例如临时使用清华源：

```bash
pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple
```

设置全局源：

```bash
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

查看配置：

```bash
pip config list
```

### 十一、导出和迁移环境

#### 1. 导出环境

如果希望把当前环境迁移到另一台机器，可以导出环境配置：

```bash
conda env export > environment.yml
```

该文件会记录环境名称、依赖包和版本信息。

#### 2. 根据配置创建环境

在另一台机器上进入`environment.yml`所在目录，执行：

```bash
conda env create -f environment.yml
```

创建完成后激活环境：

```bash
conda activate 环境名称
```

#### 3. 更新已有环境

如果环境已经存在，可以根据`environment.yml`更新：

```bash
conda env update -f environment.yml --prune
```

其中`--prune`表示移除配置文件中已经不存在的依赖。

### 十二、常用命令汇总

#### 1. 环境管理

```bash
# 查看conda版本
conda --version

# 查看conda信息
conda info

# 查看所有环境
conda env list

# 创建环境
conda create -n py310 python=3.10

# 创建到指定路径
conda create -p D:\Conda\envs\demo python=3.11

# 激活环境
conda activate py310

# 退出环境
conda deactivate

# 删除环境
conda remove -n py310 --all
```

#### 2. 包管理

```bash
# 安装包
conda install numpy

# 安装多个包
conda install numpy pandas matplotlib

# 安装指定版本
conda install numpy=1.26

# 查看已安装包
conda list

# 更新包
conda update numpy

# 删除包
conda remove numpy
```

#### 3. 配置管理

```bash
# 查看全部配置
conda config --show

# 查看环境目录
conda config --show envs_dirs

# 查看包目录
conda config --show pkgs_dirs

# 添加环境目录
conda config --add envs_dirs D:\Conda\envs

# 添加包缓存目录
conda config --add pkgs_dirs D:\Conda\pkgs

# 关闭自动激活base环境
conda config --set auto_activate_base false
```

### 十三、使用建议

#### 1. 一个项目一个环境

不要把所有项目都放在`base`环境中。`base`环境更适合作为`conda`本身的管理环境，具体项目应单独创建环境：

```bash
conda create -n project-a python=3.11
conda activate project-a
```

这样项目之间依赖不会互相污染。

#### 2. 环境命名要清晰

环境名称建议和项目名称或用途对应，例如：

```text
blog-py311
data-analysis
pytorch-cu121
django-demo
```

不要长期使用`test`、`demo`、`new`这类难以识别的名称。

#### 3. 定期清理缓存

`conda`下载和解压包后会留下缓存，时间长了会占用较多空间。可以定期清理：

```bash
conda clean --all
```

执行前会提示将要删除的内容，确认后再继续。

#### 4. 记录项目环境

对于需要长期维护的项目，建议提交`environment.yml`：

```bash
conda env export > environment.yml
```

这样其他机器或团队成员可以快速复现环境。

### 十四、总结

`Miniconda`的优势在于轻量、干净、可控。安装完成后，真正重要的不是马上安装很多包，而是先把环境管理方式规划好：虚拟环境放在哪里、包缓存放在哪里、每个项目使用哪个独立环境。

在`Windows`系统中，如果已经配置了`envs_dirs`，但新建虚拟环境仍然出现在用户目录下，首先应该检查`Miniconda`安装目录或指定环境目录的权限。目标目录不可写时，`conda`可能会回退到`C:\Users\用户名\.conda\envs`之类的位置。解决思路也很明确：要么把环境目录放到当前用户有完整权限的路径，要么修复目标目录权限。

日常使用中，只要掌握`conda create`、`conda activate`、`conda install`、`conda env list`、`conda remove`这几类命令，就已经可以覆盖大多数项目开发场景。后续再结合镜像源配置、`environment.yml`导出和缓存清理，就能比较稳定地维护本机`Python`开发环境。
