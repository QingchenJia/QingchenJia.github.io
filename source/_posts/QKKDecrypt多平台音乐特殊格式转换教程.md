---
title: QKKDecrypt多平台音乐特殊格式转换教程
typora-root-url: QKKDecrypt多平台音乐特殊格式转换教程
date: 2026-07-15 12:37:23
categories:
    - 开发工具
tags:
    - QKKDecrypt
    - 音频格式转换
    - 开源工具
---

### 一、引言

从音乐平台下载歌曲后，有时会得到`.mflac`、`.mgg`、`.kwm`、`.kgm`或`.ncm`等文件。这些文件并不是常见播放器都能直接识别的标准音频文件，即使修改扩展名，也通常无法变成真正的`MP3`或`FLAC`。

[QKKDecrypt](https://github.com/Acooldog/QQKWKG-TriMusicDecrypt)是一款面向本地文件处理的开源工具，可以识别并处理QQ音乐、酷我音乐、酷狗音乐和网易云音乐的多种特殊格式，再输出为`FLAC`、`M4A`、`MP3`或`WAV`等常规格式。项目同时提供桌面UI版和控制台版，既适合少量文件的可视化操作，也可以用于目录批处理。

本文将介绍：

- 不同平台常见特殊格式及工具的处理方式；
- 如何下载并使用QKKDecrypt桌面版；
- 如何使用控制台命令批量转换；
- 转换失败时应当检查哪些问题。

### 二、使用前先理解两个概念

#### 1. 修改扩展名不等于格式转换

文件扩展名只是文件名的一部分。例如，把`music.ncm`直接改成`music.mp3`，只会改变名称，不会改变文件内部的数据结构。播放器仍然可能提示格式错误。

QKKDecrypt的处理流程可以概括为：

```text
平台特殊格式文件
    ↓
还原其中的音频数据
    ↓
识别实际音频容器
    ↓
按需转码为 FLAC / M4A / MP3 / WAV
```

其中“还原音频数据”和“转码”是两个不同步骤。如果原始内容本身已经是标准`FLAC`或`MP3`，选择`auto`通常可以保留原有格式；如果明确选择另一个目标格式，工具会调用随程序提供的`FFmpeg`完成转码。

#### 2. 转成FLAC不会凭空提升音质

把有损音频转换为`FLAC`，只能得到体积更大的无损封装文件，无法恢复下载时已经丢失的声音细节。因此目标格式建议按实际用途选择：

| 目标格式 | 特点                     | 适合场景                       |
| -------- | ------------------------ | ------------------------------ |
| `FLAC`   | 无损、体积较大           | 保存原本就是无损的音频         |
| `M4A`    | 体积和兼容性较均衡       | 手机、车机和日常播放           |
| `MP3`    | 兼容范围广               | 老设备或对格式要求明确的播放器 |
| `WAV`    | 未压缩、文件很大         | 剪辑软件、音频处理和临时交换   |
| `auto`   | 尽量沿用识别出的原始格式 | 不希望发生不必要的二次转码     |

### 三、支持的平台与格式

按照项目当前源码，QKKDecrypt支持范围如下：

| 音乐平台   | 可识别的特殊格式                  | 处理方式       | 是否需要客户端运行                 |
| ---------- | --------------------------------- | -------------- | ---------------------------------- |
| QQ音乐     | `.mflac`、`.mgg`、`.mmp4`         | 运行期处理     | 是，需要QQ音乐进程                 |
| 酷我音乐   | `.kwm`                            | 运行期处理     | 是，需要酷我音乐进程               |
| 酷狗音乐   | `.kgm`、`.kgma`、`.kgg`、`.vpr`等 | 本地文件级处理 | 否，但部分格式需要密钥或本地数据库 |
| 网易云音乐 | `.ncm`                            | 本地文件级处理 | 否                                 |

QQ音乐和酷我音乐并不是完全离线处理。工具会检测对应的Windows客户端进程，因此应先启动音乐客户端并保持登录状态，再运行转换工具。酷狗的`.kgg`文件还可能依赖本机的`KGMusicV3.db`，程序会优先从常见位置自动查找。

项目当前主要面向Windows环境，发行版也是`.exe`安装包或单文件程序。macOS和Linux用户不能直接照搬本文的桌面版步骤。

### 四、下载QKKDecrypt

打开项目主页：

```text
https://github.com/Acooldog/QQKWKG-TriMusicDecrypt
```

进入右侧的`Releases`页面，在最新版本的`Assets`中可以看到两种程序：

- `QKKDecrypt-UI-setup.exe`：带图形界面的安装程序，适合大多数用户；
- `QKKDecrypt.exe`：控制台单文件版本，适合批处理和脚本调用。

截至本文核验时，最新正式Release为`v1.4.3`。仓库代码可能比正式版更新，如果项目页面已经发布新版本，应优先阅读新版说明。

下载可执行文件时建议注意：

1. 只从项目GitHub Release页面下载，不使用来源不明的网盘二次打包版本；
2. 保留原始特殊格式文件，先复制少量歌曲进行测试；
3. 如果安全软件给出提示，先核对下载地址、数字签名或文件哈希，不要直接关闭系统安全防护；
4. 程序当前要求以管理员身份运行，未提升权限时会停止处理。

### 五、使用桌面UI版转换

#### 1. 安装与启动

运行下载的`QKKDecrypt-UI-setup.exe`并完成安装。启动前右键程序快捷方式，选择“以管理员身份运行”。

如果处理QQ音乐或酷我音乐文件，还需要先完成下面的准备：

1. 启动对应的官方音乐客户端；
2. 登录拥有这些本地文件合法访问权限的账号；
3. 保持客户端运行，不要在转换过程中退出；
4. 再以管理员身份启动QKKDecrypt。

#### 2. 选择平台和输入目录

在工具中选择文件所属的平台，然后设置：

- 输入文件或输入目录；
- 共享输出目录；
- 是否递归扫描子目录；
- 是否在解密后继续转码；
- 最终输出格式。

文件较多时，建议输入一个单独整理好的目录，并开启递归扫描。输出目录不要和原始下载目录设为同一个位置，便于对照和恢复。

#### 3. 选择输出格式

如果只是希望文件能够被常规播放器识别，可以优先选择`auto`。工具会先判断还原后的真实音频格式，避免不必要的二次编码。

如果使用场景有明确要求，可以选择：

- 音乐库无损归档：优先`FLAC`，但前提是原音频确实为无损；
- 手机或车机播放：优先`M4A`或`MP3`；
- 导入剪辑软件：可以选择`WAV`；
- 兼容较老设备：选择`MP3`通常更稳妥。

工具还提供自动补充封面和专辑信息的选项。补封面适用于`M4A`、`MP3`和`FLAC`，补充专辑信息主要面向`M4A`和`WAV`。这些操作可能需要额外读取本地或网络信息，也会延长处理时间；只关心音频转换时可以先关闭。

#### 4. 开始处理并检查结果

确认配置后开始转换。完成后不要只看扩展名，建议至少做下面几项检查：

1. 随机播放开头、中间和结尾，确认没有静音或截断；
2. 查看歌曲时长是否与原文件一致；
3. 检查标题、歌手、专辑和封面是否正确；
4. 确认输出目录中没有`.bin`或明显小于正常音频的异常文件；
5. 确认结果可用后，再决定是否清理原始文件。

### 六、使用控制台版批量转换

控制台版适合一次处理整个目录。将`QKKDecrypt.exe`放在固定目录，然后以管理员身份打开PowerShell并进入该目录：

```powershell
cd D:\Tools\QKKDecrypt
```

直接运行程序会进入交互模式：

```powershell
.\QKKDecrypt.exe
```

程序会依次询问是否使用已有配置、选择平台、输入和输出路径、是否递归、是否转码以及目标格式。第一次使用时，交互模式通常比手写参数更直观。

#### 1. 网易云音乐NCM批量转换

将目录中的`.ncm`文件按识别到的原格式输出：

```powershell
.\QKKDecrypt.exe netease decrypt `
    --input "D:\Music\Netease" `
    --output "D:\Music\Converted" `
    --format-ncm auto
```

统一转换成`MP3`：

```powershell
.\QKKDecrypt.exe netease decrypt `
    --input "D:\Music\Netease" `
    --output "D:\Music\Converted" `
    --format-ncm mp3
```

#### 2. QQ音乐文件批量转换

先启动QQ音乐客户端，再执行：

```powershell
.\QKKDecrypt.exe qq decrypt `
    --input "D:\Music\QQMusic" `
    --output "D:\Music\Converted" `
    --format-mflac flac `
    --format-mgg m4a `
    --format-mmp4 m4a
```

QQ音乐当前三类格式可以分别指定目标格式，目标值可选`flac`、`m4a`、`mp3`或`wav`。

#### 3. 酷我音乐KWM批量转换

启动酷我音乐客户端后执行：

```powershell
.\QKKDecrypt.exe kuwo decrypt `
    --input "D:\Music\Kuwo" `
    --output "D:\Music\Converted" `
    --format-kwm auto
```

如果工具无法自动定位酷我程序，可以显式指定客户端路径：

```powershell
.\QKKDecrypt.exe kuwo decrypt `
    --input "D:\Music\Kuwo" `
    --output "D:\Music\Converted" `
    --exe-path "C:\Program Files (x86)\Kuwo\KWMUSIC\KwMusic.exe" `
    --format-kwm flac
```

实际安装路径应以本机为准，可以在任务管理器中打开进程文件所在位置后复制路径。

#### 4. 酷狗音乐文件批量转换

```powershell
.\QKKDecrypt.exe kugou decrypt `
    --input "D:\Music\Kugou" `
    --output "D:\Music\Converted" `
    --format-kgma auto `
    --format-kgg auto
```

程序包中通常已经包含处理所需的`kugou_key.xz`。如果提示密钥不可用，可以尝试更新：

```powershell
.\QKKDecrypt.exe kugou refresh-key
```

处理`.kgg`时还可能需要酷狗客户端本地的`KGMusicV3.db`。自动查找失败时，可以指定路径：

```powershell
.\QKKDecrypt.exe kugou decrypt `
    --input "D:\Music\Kugou" `
    --output "D:\Music\Converted" `
    --kgg-db "C:\Users\你的用户名\AppData\Roaming\KuGou8\KGMusicV3.db" `
    --format-kgg flac
```

#### 5. 控制是否转码和补封面

如果只想输出还原后的原始音频容器，不进行二次转码，可以添加：

```text
--no-transcode
```

不需要自动补封面时添加：

```text
--no-embed-cover
```

不扫描子目录时添加：

```text
--no-recursive
```

完整参数以当前版本帮助为准：

```powershell
.\QKKDecrypt.exe --help
.\QKKDecrypt.exe qq decrypt --help
```

### 七、从源码运行

QKKDecrypt源码按`GPLv3`发布。希望检查代码、参与开发或使用尚未进入正式Release的功能时，可以从源码运行控制台版本：

```powershell
git clone https://github.com/Acooldog/QQKWKG-TriMusicDecrypt.git
cd QQKWKG-TriMusicDecrypt
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r re.txt
python -m pip install ncmdump-py
python main.py
```

当前仓库的打包脚本会自动检查并安装`ncmdump-py`，但`re.txt`中没有列出它，因此手动从源码运行时需要额外执行上面的安装命令。

仓库的`main`分支是控制台版，`main-ui`分支是基于`PySide6`和`QFluentWidgets`的桌面UI版。源码依赖包含`Frida`、`FFmpeg`相关资源以及平台处理组件，安装体积较大；普通用户直接使用Release中的程序更省事。

项目使用`npm`脚本编排打包流程。如果需要自行构建发行程序，还要准备Node.js环境：

```powershell
npm install
npm run package
```

这会构建控制台程序和UI安装包。二次分发、修改或集成时，应同时检查`LICENSE`与`THIRD_PARTY_LICENSES.md`，遵守GPLv3和第三方组件的许可证要求。

### 八、常见问题排查

#### 1. 提示没有管理员权限

当前版本会在开始处理前检查权限。关闭程序后，右键选择“以管理员身份运行”；在终端中使用时，也要先以管理员身份打开PowerShell。

#### 2. 提示没有检测到QQ音乐或酷我音乐

依次确认：

- 对应客户端已经启动，而不只是托盘中残留了一个更新程序；
- 客户端和QKKDecrypt处于相同用户会话；
- QKKDecrypt以管理员身份运行；
- 酷我客户端路径可被正常访问；
- 客户端更新后，项目是否已经发布兼容修复。

运行期处理依赖客户端版本，平台升级可能导致旧版工具暂时失效。遇到这种情况应先查看项目`Issues`，不要反复覆盖原文件。

#### 3. 扫描不到文件

首先确认选择的平台和文件扩展名对应。QQ音乐页面不会处理`.ncm`，网易云页面也不会处理`.mflac`。另外检查：

- 文件扩展名是否被系统隐藏；
- 是否选择了错误的上级目录；
- 文件位于子目录时是否开启递归扫描；
- 路径是否仍在移动硬盘、网盘占位符或无权限目录中。

#### 4. 酷狗KGG提示找不到数据库

`.kgg`处理可能需要`KGMusicV3.db`。先正常启动一次酷狗客户端，再检查下面的常见目录：

```text
C:\Users\用户名\AppData\Roaming\KuGou8\KGMusicV3.db
```

如果本机没有这个数据库，工具就无法完成依赖它的处理。不要从不可信来源下载包含账号数据的数据库文件。

#### 5. 输出文件能生成但无法播放

可以先把目标格式设置为`auto`，并关闭补封面、补专辑信息等附加操作后重新测试。如果仍然失败，再检查：

- 原文件是否完整，文件大小是否正常；
- 当前工具版本是否支持该文件变体；
- 输出目录中是否有日志或失败报告；
- 是否只有某一首歌失败，还是同平台文件全部失败；
- 客户端或文件格式是否刚刚发生更新。

提交Issue时可以提供工具版本、平台客户端版本、文件扩展名和错误日志，但不要上传受版权保护的完整音乐文件，也不要公开账号数据库或其他隐私数据。

### 九、合法使用与数据安全

这类工具适合处理自己已经合法下载并拥有访问权限的本地文件，例如把个人音乐库迁移到其他播放器或设备。使用前应自行确认所在地法律、版权规则、音乐平台协议和组织政策。

不要将工具用于：

- 获取自己没有合法访问权限的内容；
- 规避付费授权、会员限制或平台访问控制；
- 批量传播、出售或公开分享转换后的音乐；
- 未经授权处理他人的账号数据和本地数据库。

开源只表示源代码许可证允许在相应条件下查看、修改和分发软件，并不意味着音乐内容本身也变成了自由授权内容。

### 十、总结

QKKDecrypt把四个平台的多种特殊音乐格式集中到了同一个工具中。普通用户可以使用UI版选择平台、目录和目标格式；需要处理大量文件时，可以使用控制台版编写批处理命令。

实际使用时可以遵循一个稳妥的流程：

1. 从GitHub Release下载官方程序；
2. 备份原文件，并用少量样本先测试；
3. QQ音乐和酷我音乐先启动对应客户端；
4. 优先选择`auto`，避免无意义的二次转码；
5. 检查音频时长、播放完整性和元数据；
6. 只处理自己拥有合法访问权限的本地文件。

### 十一、参考资料

- [QKKDecrypt GitHub仓库](https://github.com/Acooldog/QQKWKG-TriMusicDecrypt)
- [QKKDecrypt Releases](https://github.com/Acooldog/QQKWKG-TriMusicDecrypt/releases)
- [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html)
- [FFmpeg官方网站](https://ffmpeg.org/)
