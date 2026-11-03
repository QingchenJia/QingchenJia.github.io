---
title: Typora自定义主题设置教程
typora-root-url: Typora自定义主题设置教程
date: 2026-11-03 16:28:19
categories:
    - 效率工具
tags:
    - Typora
    - Windows
---

Markdown 是一种用简单符号标记排版的纯文本格式，文件通常以 `.md` 为扩展名，例如用 `# 标题` 表示一级标题，用 `**文字**` 表示加粗。Typora 则是一款 Markdown 编辑器，输入这些语法时，就能在编辑区直接看到对应的排版效果，适合用来写笔记、技术文档和博客文章。

### 一、默认主题与Claude主题对比

Typora 的主题可以改变编辑区和侧边栏的外观，包括字体、背景、标题、表格和代码块样式。想换一种阅读和写作体验，不需要自己编写 CSS 样式，安装现成主题就能完成。

先看同一份 Markdown 文档在默认主题和 Claude 主题下的效果。

**默认主题：** 白色背景，标题醒目，表格使用完整的网格线，整体风格简洁。

![Typora默认主题下的文档与大纲侧边栏](../Typora自定义主题设置教程/typora-default-theme.png)

_图 1：默认主题下的文档，左侧为大纲，右侧展示标题、引用和带网格线的表格。_

**Claude 主题：** 背景偏暖，正文采用衬线字体，表格和侧边栏也换成了更柔和的样式，适合喜欢纸张阅读感的用户。

![同一份文档切换到Claude浅色主题后的效果](../Typora自定义主题设置教程/typora-claude-theme.png)

_图 2：同一份文档切换到 Claude 浅色主题后的效果，背景、字体、表格线和大纲侧边栏的样式均发生变化。_

下面以 Windows 为例，从 Typora 内的“更多主题”入口出发，完成 Claude 主题的下载、安装和切换。

### 二、找到并下载Claude主题

#### 1.打开Typora主题网站

1. 打开 Typora，点击顶部菜单栏的“帮助”。
2. 选择“更多主题…”，浏览器会打开 Typora 主题网站。
3. 也可以直接访问 [Typora 主题网站](https://theme.typora.io/)。

![Typora帮助菜单中的更多主题入口](../Typora自定义主题设置教程/help-more-theme.png)

_图 3：Typora 顶部“帮助”菜单中的“更多主题…”入口。_

网站以卡片形式展示各个主题的预览图和名称，可以先浏览效果，再进入感兴趣的主题页面。

![Typora主题网站中的主题预览列表](../Typora自定义主题设置教程/typora-theme-website.png)

_图 4：Typora 主题网站的预览列表，每张卡片展示对应主题的外观和名称。_

#### 2.找到对应主题并下载

1. 在主题网站按 `Ctrl + F`，输入 `Claude`，找到 **Claude Typora Theme**。
2. 打开[主题详情页](https://theme.typora.io/theme/Claude/)，确认作者为 **Tsumugii24**，对应仓库为 [Tsumugii24/claude-typora-theme](https://github.com/Tsumugii24/claude-typora-theme)。
3. 点击页面中的 `Download` 下载主题压缩包；也可以进入仓库的 [Releases 页面](https://github.com/Tsumugii24/claude-typora-theme/releases)，下载发布附件中的主题 ZIP 包。
4. 将压缩包解压到方便操作的位置。

这个主题同时提供浅色和深色版本，前面的效果图使用的是浅色版。主题站上还有其他名称包含 Claude 的主题，按上面的作者和仓库即可找到本文使用的这一款。

### 三、阅读README，确认需要安装的文件

解压后，先打开 `README_zh.md` 阅读中文安装说明，也可以查看英文版 `README.md`。在线文档见[仓库中文 README](https://github.com/Tsumugii24/claude-typora-theme/blob/main/README_zh.md)。

![Claude主题压缩包中的CSS文件、字体目录和README文档](../Typora自定义主题设置教程/claude-theme-file.png)

_图 5：Claude 主题包中的两个 CSS 文件、`claude_fonts` 字体目录，以及中英文 README 文档。_

按照这个主题的说明，需要放入 Typora 主题文件夹的内容有三项：

| 文件或文件夹      | 用途                       |
| ----------------- | -------------------------- |
| `claude.css`      | Claude 浅色主题的样式文件  |
| `claude-dark.css` | Claude 深色主题的样式文件  |
| `claude_fonts/`   | 两个主题使用的本地字体资源 |

**两个 CSS 文件和 `claude_fonts` 文件夹要放在同一层目录中。** 字体文件已经随主题打包，保留文件夹名称和内部结构即可，不需要另外安装到 Windows 字体库。

`docs`、`LICENSE` 和 README 文档可以留在解压目录，不需要一起放进主题文件夹。安装其他主题时，也先读它自己的 README，按作者说明取出相应的样式文件和资源目录。

### 四、将主题文件放入Typora配置目录

#### 1.打开主题文件夹

1. 回到 Typora，进入“文件 → 偏好设置”。
2. 选择“外观”，点击“打开主题文件夹”。
3. 在弹出的文件资源管理器窗口中，保留这个目录，准备放入主题文件。

Windows 的默认主题目录是：

```text
%APPDATA%\Typora\themes
```

也可以按 `Win + R`，粘贴上面的路径并回车。`%APPDATA%` 会指向当前用户的 `AppData\Roaming` 目录，无需手动替换用户名；从 Typora 内点击“打开主题文件夹”，则可以直接定位正在使用的目录。

#### 2.移动样式文件和字体目录

1. 在解压后的主题目录中，选中 `claude.css`、`claude-dark.css` 和 `claude_fonts` 文件夹。
2. 按 `Ctrl + X` 剪切，再到刚才打开的 Typora 主题文件夹中按 `Ctrl + V` 粘贴。
3. 确认这三项直接位于 `themes` 目录下，与已有的 `github.css`、`night.css` 等主题文件处于同一层级。

放置后的结构如下，原有主题文件继续保留：

```text
themes/
├── claude.css
├── claude-dark.css
├── claude_fonts/
├── github.css
├── night.css
└── ...
```

![Typora的themes目录中已放入Claude主题文件与字体文件夹](../Typora自定义主题设置教程/typora-theme-config-path.png)

_图 6：安装后的 `themes` 目录，Claude 的两个 CSS 文件和字体文件夹与已有主题处于同一层级。_

不要把解压得到的整个项目文件夹直接塞进 `themes`，导致 CSS 文件又多套了一层目录；也不要只移动 CSS 而漏掉 `claude_fonts`，否则主题的字体效果会不完整。

### 五、重启Typora并切换主题

1. 关闭并重新打开 Typora。
2. 点击顶部菜单栏的“主题”。
3. 选择 **Claude**，应用前面展示的浅色主题；喜欢深色背景则选择 **Claude Dark**。
4. 打开自己的 Markdown 文档，查看正文、表格和侧边栏的效果。

如果重启后菜单里没有出现 Claude，检查两个 `.css` 文件是否直接放在当前的主题文件夹内；如果主题能够切换，但字体与预览不同，检查 `claude_fonts` 是否完整放在 CSS 文件旁边。想换回默认外观时，从“主题”菜单中重新选择原来的主题即可。

### 六、参考资料

- [Typora 官方主题安装说明](https://support.typora.io/About-Themes/)
- [Typora 主题网站](https://theme.typora.io/)
- [Claude Typora Theme 详情页](https://theme.typora.io/theme/Claude/)
- [Claude 主题中文 README](https://github.com/Tsumugii24/claude-typora-theme/blob/main/README_zh.md)
- [Claude 主题下载页面](https://github.com/Tsumugii24/claude-typora-theme/releases)
