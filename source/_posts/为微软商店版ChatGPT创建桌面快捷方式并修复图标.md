---
title: 为微软商店版ChatGPT创建桌面快捷方式并修复图标
typora-root-url: 为微软商店版ChatGPT创建桌面快捷方式并修复图标
date: 2026-10-16 13:59:55
categories:
    - 系统维护
tags:
    - Windows
    - ChatGPT
---

### 一、让ChatGPT也能从桌面双击打开

通过微软应用商店安装 ChatGPT 桌面版后，如果桌面上没有快捷方式，每次使用都要从开始菜单寻找。其实，商店应用也能像通过独立安装包安装的软件一样，在桌面放置一个可以双击启动的入口。

整个过程不需要查找安装目录：**按 `Win + R`，运行 `shell:AppsFolder`，找到 ChatGPT，右键创建快捷方式，再按自己的习惯修改名称即可。**

另外，应用更新后，桌面快捷方式的 Logo 有时会变成白纸或默认图标。遇到这种情况，可以下载 Logo、转换为 `.ico`，再通过快捷方式属性指定图标。下面分别介绍这两部分操作。

### 二、通过AppsFolder创建桌面快捷方式

#### 1.打开Windows应用列表

先确认已经从 Microsoft Store 安装 ChatGPT，并且能够从开始菜单正常打开它。

1. 按下键盘上的 `Win + R`，打开“运行”窗口。
2. 在“打开”输入框中填写下面的内容，不需要添加引号。
3. 按回车，或点击“确定”。

```text
shell:AppsFolder
```

`AppsFolder` 是 Windows 提供的应用列表入口，打开后可以看到当前用户的应用。它不是普通的磁盘目录，也不需要手动进入受保护的 `WindowsApps` 安装文件夹。

#### 2.找到ChatGPT并创建快捷方式

在应用列表中找到 ChatGPT。下图中灰色背景的项目就是已经选中的 ChatGPT，后续右键操作应针对这个项目。

![AppsFolder应用列表中选中的ChatGPT](../为微软商店版ChatGPT创建桌面快捷方式并修复图标/appsfolder-chatgpt.png)

_图 1：运行 `shell:AppsFolder` 后打开的 Applications 窗口，图中已选中 ChatGPT。_

接着创建桌面快捷方式：

1. 右键点击 ChatGPT，选择“创建快捷方式”；如果菜单折叠了所需选项，再查看“显示更多选项”。
2. 如果 Windows 提示无法在当前位置创建快捷方式，并询问是否将快捷方式放在桌面上，点击“是”。
3. 返回桌面，确认出现 ChatGPT 的快捷方式。

这个提示只是让你选择把快捷方式放到桌面，按提示确认即可。

#### 3.修改名称并检查启动

1. 选中桌面上的新快捷方式，按 `F2`，或右键选择“重命名”。
2. 将名称改为 `ChatGPT`，也可以使用自己喜欢的名字，然后按回车。
3. 双击快捷方式，确认能够打开 ChatGPT 桌面版。

重命名只改变桌面上显示的文字，不会修改应用名称或账号信息。以后就可以直接从桌面打开 ChatGPT，无需每次到开始菜单寻找。

### 三、更新后图标变白了怎么办

ChatGPT 更新后，已有快捷方式的图标**可能**变成白纸、空白或默认图标；这并非每次更新都必然发生。

先双击快捷方式，区分两种情况：

| 现象                        | 处理方式                                                                   |
| --------------------------- | -------------------------------------------------------------------------- |
| 图标异常，但ChatGPT仍能打开 | 按下文指定一个独立保存的ICO图标                                            |
| 双击也无法打开ChatGPT       | 先从开始菜单确认应用能否启动；能够启动时，再通过AppsFolder重新创建快捷方式 |

图标显示和应用启动是两回事。更新后出现图标异常，可能与应用图标资源的引用或 Windows 图标缓存有关，不能仅凭白色图标认定应用损坏。

为快捷方式指定一个放在固定目录中的 `.ico` 文件，可以让它使用自己保存的图标，减少对应用安装目录内图标资源的依赖。

### 四、下载Logo并转换为ICO

#### 1.从LobeHub获取图标

可以使用 [LobeHub 的 OpenAI 图标页面](https://lobehub.com/zh/icons/openai)。它提供 OpenAI（ChatGPT）图标的预览与下载，相关图标项目也在 [GitHub](https://github.com/lobehub/lobe-icons) 上开源。

1. 打开图标页面，找到想使用的 Logo 样式。
2. 优先选择只有图形标志的版本，避免带有长文字的组合图标缩小后看不清。
3. 使用下载入口保存图标。按照下文的在线转换示例操作时，选择 SVG 格式；准备使用后面的本地命令时，选择 PNG 格式。

![LobeHub的OpenAI图标页面与下载图标入口](../为微软商店版ChatGPT创建桌面快捷方式并修复图标/lobehub-openai-icons.png)

_图 2：LobeHub 的 OpenAI（ChatGPT）图标页面，左下方是“下载图标”入口，可从这里获取后续转换所需的素材。_

也可以从类似的开源图标站点获取素材。建议使用正方形、边缘清晰的图片，优先选择透明背景；深色桌面可以搭配浅色 Logo 或带底色的版本，避免图案与背景混在一起。

#### 2.使用在线转换器

Windows 快捷方式的“更改图标”窗口不能直接把普通 PNG、SVG 当作 ICO 图标使用，需要先进行格式转换。

下面以 [PicEditLab 的 SVG 转 ICO 页面](https://www.piceditlab.com/zh-cn/img/convert-svg-to-ico)为例，将上一步下载的 SVG Logo 转换为 Windows 图标。

![PicEditLab在线SVG转ICO页面](../为微软商店版ChatGPT创建桌面快捷方式并修复图标/piceditlab-svg-to-ico.png)

_图 3：PicEditLab 的 SVG 转 ICO 页面顶部，橙色标识和面包屑均标明“SVG → ICO”。向下滚动到文件上传区域后，再执行转换。_

1. 在页面的上传区域点击“选择文件”，选择刚下载的 SVG Logo。
2. 确认目标格式为 `ICO`，点击“开始转换”。
3. 转换完成后下载结果。如果得到的是 ZIP 压缩包，先解压，再取出其中的 `.ico` 文件。
4. 将得到的图标文件命名为 `ChatGPT.ico`，后面会把它放到固定目录并用于快捷方式。

如果已经下载了 PNG，也可以使用 [Convertio 的 PNG 转 ICO 页面](https://convertio.co/zh/png-ico/)，选择 PNG 文件、将输出格式设为 ICO，再转换并下载。两种方式任选一种，按原始图片格式选择对应入口即可。

**直接把文件后缀从 `.png` 或 `.svg` 改成 `.ico` 不属于格式转换，不能代替这一步。**

#### 3.也可以使用本地转换工具

不想上传图片时，可以使用支持 ICO 导出的本地图像工具。下面的命令以 **PNG 文件**为输入：先在 LobeHub 下载 PNG 版本，保存为 `ChatGPT.png`；如果手头只有 SVG，可以回到图标页面重新选择 PNG 格式下载。

已经安装 [ImageMagick](https://imagemagick.org/) 的用户，可以在 PowerShell 中执行：

```powershell
magick "D:\Icons\ChatGPT.png" -background none -gravity center -resize 256x256 -extent 256x256 -define icon:auto-resize=256,128,64,48,32,16 "D:\Icons\ChatGPT.ico"
```

执行前先创建 `D:\Icons` 文件夹，并把 PNG 放进去；没有 D 盘时，将命令中的输入、输出路径都替换为自己的实际路径。命令会将图片居中放入透明的正方形画布，并生成包含多种尺寸的 ICO；输出目录中已有同名文件时会被覆盖。

在线转换和本地转换任选一种即可，使用在线方式不需要安装 ImageMagick。

### 五、在快捷方式属性中更改图标

#### 1.先把ICO放到固定位置

把生成的 `ChatGPT.ico` 放到一个准备长期保留的目录，例如：

```text
D:\Icons\ChatGPT.ico
```

这个路径只是示例，也可以在自己的用户文件夹中创建 `Icons` 目录。**设置完成后不要随意移动、重命名或删除 ICO 文件**，因为快捷方式会引用它的保存位置。下载目录如果经常清理，就不适合作为最终存放位置。

#### 2.选择图标并保存

1. 右键点击**桌面上的 ChatGPT 快捷方式**，选择“属性”。
2. 切换到“快捷方式”选项卡，点击“更改图标”。
3. 如果提示原来的图标文件无法找到，先确认提示，再点击“浏览”。
4. 找到刚保存的 `ChatGPT.ico`，选中并打开。
5. 在图标列表中选中图标，点击“确定”，再点击属性窗口的“应用”和“确定”。
6. 返回桌面检查新图标，并再次双击确认 ChatGPT 能够启动。

如果图标没有立即刷新，可以先在桌面按 `F5`；仍未变化时，重新打开属性确认 ICO 路径是否正确，必要时注销后重新登录 Windows。更改这里的图标只针对这个桌面快捷方式，不会统一替换开始菜单、任务栏或应用内部的 Logo。

以后如果重新创建了快捷方式，需要为新快捷方式重新指定图标；原来的 ICO 文件仍可继续使用。

### 六、参考资料

- [Microsoft Learn：查找已安装应用的应用程序用户模型 ID](https://learn.microsoft.com/en-us/windows/configuration/store/find-aumid)（说明通过 `shell:AppsFolder` 打开应用列表的入口）
- [LobeHub：OpenAI（ChatGPT）图标下载](https://lobehub.com/zh/icons/openai)
- [Lobe Icons：开源图标项目](https://github.com/lobehub/lobe-icons)
- [PicEditLab：SVG转ICO](https://www.piceditlab.com/zh-cn/img/convert-svg-to-ico)
- [Convertio：PNG转ICO](https://convertio.co/zh/png-ico/)
- [ImageMagick：支持的图像格式](https://imagemagick.org/script/formats.php)
