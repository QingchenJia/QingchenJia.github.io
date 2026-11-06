---
title: Zotero安装PDF翻译插件与配置自定义AI接口教程
typora-root-url: Zotero安装PDF翻译插件与配置自定义AI接口教程
date: 2026-11-06 14:51:21
categories:
    - 学术写作
tags:
    - Zotero
    - AI工具
---

阅读英文论文时，普通机翻遇到专业术语和复杂长句，常会出现译文生硬、逻辑关系不清的问题。把原文复制到 AI 对话框里又会打断阅读，不如直接在 Zotero 中接入大模型，选中段落就能查看译文。

本文使用 **Translate for Zotero（Zotero PDF Translate）插件 + 硅基流动 API**，从安装插件、创建密钥到配置接口，完成 PDF 内的 AI 划词翻译。

### 一、认识PDF翻译插件

[Translate for Zotero](https://github.com/windingwind/zotero-pdf-translate) 是由 windingwind 开发的开源免费插件，支持 PDF 划词翻译，以及文献标题、摘要和批注翻译。它负责提取文本、调用翻译服务并展示结果，具体翻译质量取决于所选服务和模型。

![Translate for Zotero的中文介绍与主要功能](../Zotero安装PDF翻译插件与配置自定义AI接口教程/zotero-pdf-translate-document.png)

_图 1：中文社区的插件介绍页，可查看兼容版本、主要功能和下载入口。_

插件既能使用传统翻译引擎，也能通过“自定义 GPT”连接兼容接口。这里的“GPT”是配置入口的名称，实际可以调用硅基流动提供的 GLM 等模型。

### 二、下载并安装插件

以下以 Windows 桌面版 Zotero 为例。先在“帮助 → 关于 Zotero”中查看版本，再选择兼容的插件版本；可结合[中文社区插件说明](https://zotero-chinese.com/user-guide/plugins/translate)和发布页确认兼容性。

1. 打开[插件 GitHub 仓库](https://github.com/windingwind/zotero-pdf-translate)，点击右侧的 **Releases**，或直接进入[下载页面](https://github.com/windingwind/zotero-pdf-translate/releases/latest)。
2. 展开 **Assets**，下载后缀为 `.xpi` 的插件文件，不要下载 `Source code` 源码压缩包，也不需要解压 `.xpi`。
3. 在 Zotero 中打开“工具 → 插件”，点击右上角齿轮，选择“从文件安装插件”，选中下载的 `.xpi`。
4. 确认安装；若出现重启提示，按提示重启 Zotero。
5. 打开“编辑 → 设置”，确认左侧出现“翻译”设置项。

![Zotero PDF Translate仓库及右侧Releases入口](../Zotero安装PDF翻译插件与配置自定义AI接口教程/zotero-pdf-translate-github-repo.png)

_图 2：插件 GitHub 仓库，右侧 Releases 区域可进入发布页下载 `.xpi` 文件。_

GitHub 下载不便时，可以打开 [Zotero 中文社区](https://zotero-chinese.com/)，点击首页的“插件商店”，搜索 **Translate for Zotero**；也可以[直接进入插件商店](https://zotero-chinese.com/plugins/)。

![Zotero中文社区首页与插件商店入口](../Zotero安装PDF翻译插件与配置自定义AI接口教程/zotero-chinese-community.png)

_图 3：Zotero 中文社区首页，点击“插件商店”可查找插件及国内镜像下载地址。_

Firefox 用户若点击 `.xpi` 后被当成浏览器扩展处理，右键链接选择“另存为”，再回到 Zotero 安装。

### 三、在硅基流动创建API密钥

#### 1.认识硅基流动并选择模型

要让插件调用 AI，需要提供接口地址、模型名称和 API Key。[硅基流动（SiliconFlow）](https://www.siliconflow.cn/)是提供多种模型 API 的云服务平台，可以用同一套接口调用不同模型，无需在自己的电脑上部署大模型。

1. 打开[硅基流动控制台](https://cloud.siliconflow.cn/)，注册并登录。
2. 进入“模型广场”，选择支持文本对话的模型，查看模型详情、价格和调用限制；按账户页面提示完成所需认证。
3. 复制模型的完整 API 名称。本文配图使用 `THUDM/GLM-4-32B-0414`；也可以选择账户中可用的其他对话模型，后续填写对应名称即可。

![硅基流动模型广场](../Zotero安装PDF翻译插件与配置自定义AI接口教程/siliconflow-model-page.png)

_图 4：硅基流动模型广场，可搜索对话模型，并进入详情页查看调用名称和价格。_

**插件免费不等于模型调用免费。** 选择模型时查看输入、输出 Token 的单价和账户余额；Token 是模型处理文本的计量单位。翻译通常既产生输入用量，也产生输出用量。

#### 2.新建并复制Key

1. 在控制台左侧点击“API 密钥”。
2. 点击“新建 API 密钥”，填写用途描述，例如 `Zotero Translate Plugin`。
3. 点击“新建密钥”，创建后复制完整 Key，稍后填入 Zotero。

![硅基流动新建API密钥窗口](../Zotero安装PDF翻译插件与配置自定义AI接口教程/create-api-key.png)

_图 5：新建 API 密钥时填写用途描述，便于在密钥列表中识别 Zotero 使用的 Key。_

API Key 是调用平台接口的凭证，插件需要的是这串密钥，不是硅基流动的登录密码。完整 Key 不要放进公开笔记或截图中。

### 四、配置自定义AI翻译接口

#### 1.填写服务、密钥和模型

1. 回到 Zotero，进入“编辑 → 设置 → 翻译”。
2. 在“服务”区域，将“翻译服务”切换为 **自定义 GPT1**。
3. 在旁边的“密钥”栏粘贴刚复制的完整 Key，直接填写密钥本身，不加引号，也不用加 `Bearer ` 前缀。
4. 将源语言设为 **English (United States)**，目标语言设为 **Chinese (S)**，即简体中文。
5. 点击“配置”，按下表填写，然后点击“保存”。

| 配置项   | 填写内容                                                |
| -------- | ------------------------------------------------------- |
| 接口     | `https://api.siliconflow.cn/v1/chat/completions`        |
| 模型     | 从模型详情页复制完整名称，配图为 `THUDM/GLM-4-32B-0414` |
| 温度     | `0`，降低措辞的随机性                                   |
| 接口格式 | `OpenAI (chat/completions)`                             |
| 提示词   | 使用下节的翻译提示词                                    |
| 流式输出 | 可先不勾选，等待完整译文返回                            |
| 思考等级 | 保持“默认”                                              |

![Zotero自定义GPT1服务、密钥与接口配置](../Zotero安装PDF翻译插件与配置自定义AI接口教程/translate-custom-api-setting.png)

_图 6：左侧选择自定义 GPT1 并填写密钥，右侧配置硅基流动接口、模型及翻译提示词。_

接口栏可直接复制上面的**完整请求地址**。模型名称则要保留组织前缀、斜杠和版本后缀，不能只填写 `GLM` 等简称。若换用其他服务商，需要一起替换接口地址、模型名称和对应密钥。

#### 2.设置学术翻译提示词

将下面内容粘贴到“提示词”栏，再保存配置：

```text
你是一名学术文献翻译助手。请将以下文本从 ${langFrom} 翻译为 ${langTo}。
忠实保留原文含义和逻辑关系，使用准确、自然的学术表达。
保留公式、变量、引文编号和必要的英文缩写，同一术语保持译法一致。
只输出译文，不添加解释、总结或原文没有的信息。

待翻译文本：
${sourceText}
```

`${langFrom}`、`${langTo}` 和 `${sourceText}` 由插件自动替换，分别代表源语言、目标语言和选中的原文。**这些变量应原样保留，尤其不能漏掉 `${sourceText}`。** 如需统一领域术语，可在提示词中补充，例如“将 deep unrolling 统一译为深度展开”。

### 五、选中PDF段落查看翻译

1. 在 Zotero 内打开一篇可以选中文字的英文 PDF。
2. 用鼠标选中一整句或一段文字。开启自动翻译时，插件会调用所选服务，并在弹窗或侧栏展示译文。
3. 若关闭了自动翻译，点击翻译按钮，或在选中文字后按 `Ctrl + T`。
4. 对照原文查看术语、数值和逻辑关系，确认结果符合阅读需要。

下面展示对论文 **SAR IMAGE CHANGE DETECTION VIA UR-ISTA** 摘要段落的翻译，选区旁直接显示中文结果，无需切换到外部聊天页面。

![在Zotero中选中英文论文摘要后显示中文译文](../Zotero安装PDF翻译插件与配置自定义AI接口教程/pdf-translate-example.png)

_图 7：选中论文摘要后，插件在选区旁显示中文译文，便于对照原文阅读。_

这段示例涉及合成孔径雷达（SAR）、深度展开和迭代收缩阈值算法（ISTA），适合结合原文检查专业术语。AI 译文用于辅助阅读，涉及论文结论和关键术语时仍应以原文为依据。

如果勾选了“使用字典服务翻译词语”，只选一个单词可能会调用独立词典服务。**验证 AI 配置时选一整句或一段文字**；希望单词也交给 AI，可取消该选项。

遇到调用失败，优先按报错检查对应设置：

| 现象                | 检查位置                                           |
| ------------------- | -------------------------------------------------- |
| `401` 或密钥无效    | 重新复制完整 Key，确认它属于当前接口服务商         |
| 模型不存在或无权限  | 核对模型完整名称，以及账户是否可以调用该模型       |
| 余额不足或额度耗尽  | 查看硅基流动余额、额度和模型价格                   |
| `429`、请求过于频繁 | 降低连续划词频率，必要时关闭自动翻译，改为手动触发 |
| 无法选中 PDF 文字   | 先通过 OCR 识别扫描页，使其具备可选中的文本层      |

### 六、参考资料

- [Translate for Zotero 官方仓库与安装说明](https://github.com/windingwind/zotero-pdf-translate)
- [Zotero 中文社区：翻译插件介绍](https://zotero-chinese.com/user-guide/plugins/translate)
- [硅基流动：快速上手与创建 API Key](https://docs.siliconflow.cn/cn/userguide/quickstart)
- [硅基流动：Chat Completions 接口文档](https://docs.siliconflow.cn/cn/api-reference/chat-completions/chat-completions)
