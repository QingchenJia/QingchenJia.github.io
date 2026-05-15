---
title: Zotero从安装到进阶使用
typora-root-url: Zotero从安装到进阶使用
date: 2026-05-15 22:48:35
tags:
    - Zotero
    - 文献管理
    - 论文写作
---

### 一、Zotero 能解决什么问题

`Zotero` 是一款开源文献管理工具，适合在论文写作中完成文献收集、PDF 管理、元数据整理、正文引用插入和参考文献表生成。对毕业论文、期刊论文、综述写作来说，它最大的价值是把“正文引用”和“文末参考文献”绑定起来：正文新增、删除或调整引用后，参考文献目录可以自动刷新，减少手工编号和格式错误。

本文从安装开始，介绍如何配置浏览器插件、Word 插件、茉莉花插件，并重点说明论文写作中常用的三类进阶操作：

- 通过 Word 的 Zotero 插件插入正文文献引用；
- 在文章末尾一键生成参考文献目录；
- 通过 Python 脚本为正文引用添加跳转到参考文献表的超链接。

### 二、安装 Zotero 与浏览器插件

#### 1. 下载 Zotero

打开 Zotero 官方下载页面：

```text
https://www.zotero.org/download/
```

根据操作系统选择安装包。Windows 用户下载后直接运行安装程序即可；macOS 用户将应用拖入 `Applications`；Linux 用户可以使用官方压缩包或发行版对应的安装方式。

安装完成后，建议先打开一次 Zotero，让它完成初始化配置。

#### 2. 安装 Zotero Connector

`Zotero Connector` 是浏览器插件，用来从网页、数据库、出版社页面、Google Scholar、知网等网页中抓取文献条目信息。

安装方式：

1. 在 Zotero 下载页选择对应浏览器的 Connector。
2. 安装完成后，浏览器右上角会出现 Zotero 图标。
3. 打开 Zotero 客户端，再访问论文网页。
4. 点击浏览器中的 Zotero 图标，将当前网页识别到的文献保存到 Zotero 文库。

如果浏览器插件无法保存条目，先确认 Zotero 客户端是否正在运行。

#### 3. 登录与同步

建议注册 Zotero 账号并开启同步：

1. 打开 Zotero。
2. 进入 `编辑` -> `设置` -> `同步`。
3. 登录 Zotero 账号。
4. 勾选同步文库数据。

需要注意，Zotero 免费空间主要用于附件同步，文献条目的元数据同步通常占用很小。如果 PDF 附件很多，可以只同步文献信息，PDF 使用本地硬盘、网盘或 WebDAV 管理。

### 三、安装 Word 插件

Zotero 的 Word 插件一般会随 Zotero 自动安装。安装成功后，打开 Microsoft Word，顶部功能区会出现 `Zotero` 选项卡。

如果没有出现：

1. 关闭 Word。
2. 打开 Zotero。
3. 进入 `编辑` -> `设置` -> `引用` -> `文字处理软件`。
4. 点击 `安装 Microsoft Word 插件` 或 `重新安装 Microsoft Word 插件`。
5. 重新打开 Word。

Word 插件中最常用的按钮包括：

- `Add/Edit Citation`：在正文光标位置插入或编辑引用；
- `Add/Edit Bibliography`：在光标位置插入或编辑参考文献表；
- `Document Preferences`：设置当前文档的引用样式和语言；
- `Refresh`：刷新正文引用和参考文献表；
- `Unlink Citations`：将 Zotero 字段转为普通文本，通常只在最终定稿副本中使用。

写作时不要直接手改 Zotero 插入的引用字段。如果引用内容不对，应回到 Zotero 条目中修改元数据，然后在 Word 中点击 `Refresh`。

### 四、安装茉莉花插件并检索国内文献元数据

#### 1. 为什么需要茉莉花

Zotero 对英文文献、DOI、ISBN、PubMed 等标识符支持较好，但国内中文文献经常出现标题、作者、期刊、年份、页码等元数据抓取不完整的问题。茉莉花 `Jasminum` 是常用的 Zotero 中文增强插件，主要用于识别中文文献元数据，尤其适合处理中文 PDF 或 CAJ 附件。

茉莉花的基础能力包括：

- 中文 PDF 元数据抓取；
- 中文转换器下载；
- 中文引用格式下载；
- 中文姓名拆分与合并；
- 本地附件匹配；
- PDF 大纲相关工具。

截至 2026-05-15，茉莉花 GitHub 项目显示的最新发布版本为 `v1.1.37`，发布时间为 2026-05-11。安装时建议以项目 Release 页面中的最新版为准。

#### 2. 下载茉莉花插件

打开茉莉花 GitHub 项目：

```text
https://github.com/l0o0/jasminum
```

进入 `Releases` 页面，下载后缀为 `.xpi` 的插件文件。

#### 3. 在 Zotero 中安装插件

1. 打开 Zotero。
2. 点击 `工具` -> `插件`。
3. 将下载好的 `.xpi` 文件拖入插件窗口。
4. 按提示安装并重启 Zotero。

插件安装完成后，可以在右键菜单中看到与 `茉莉花抓取` 或 `小工具` 相关的功能。

#### 4. 使用茉莉花抓取中文文献元数据

如果已经有中文论文附件：

1. 将中文 PDF 或 CAJ 文件拖入 Zotero 文库。
2. 右键附件。
3. 选择 `茉莉花抓取` -> `抓取期刊元数据`。
4. 在弹出的结果窗口中查看匹配项。
5. 如果有多个结果，选择标题、作者、期刊、年份最匹配的一项。
6. 点击确认，Zotero 会生成或更新对应文献条目。

如果先通过浏览器抓取了知网页面的元数据，但附件没有自动下载：

1. 手动下载 PDF 或 CAJ 到系统下载目录。
2. 在 Zotero 中右键对应期刊条目。
3. 选择 `小工具` -> `在下载文件夹中查找附件`。
4. 茉莉花会根据题名与文件名相似度查找附件并关联到条目。

使用茉莉花抓取后，建议逐条检查以下字段：

- 标题是否有多余空格或乱码；
- 作者姓名是否拆分正确；
- 期刊名是否完整；
- 年、卷、期、页码是否齐全；
- DOI、CNKI ID 等标识符是否准确。

这些字段会直接影响 Word 中的引用格式和文末参考文献目录。

### 五、整理 Zotero 文库

正式写论文前，建议先做一次文库整理。

#### 1. 建立分类集合

可以按论文结构建立集合，例如：

- `01-理论基础`
- `02-研究方法`
- `03-实验数据`
- `04-对比研究`
- `05-待阅读`

同一篇文献可以出现在多个集合中，Zotero 不会复制附件，只是建立分类关系。

#### 2. 统一标签

标签适合标记文献状态，例如：

- `已读`
- `待精读`
- `核心文献`
- `可引用`
- `方法参考`

不要给每篇文献创建过多标签，否则后期很难维护。

#### 3. 补全关键元数据

论文写作前至少检查：

- 题名；
- 作者；
- 年份；
- 期刊或会议名称；
- 卷、期、页码；
- DOI 或 URL；
- 文献类型。

对于 GB/T 7714 等中文论文常用格式，文献类型、作者、年份和页码尤其重要。

### 六、在 Word 中插入正文文献引用

#### 1. 设置文档引用样式

第一次在 Word 文档中使用 Zotero 时：

1. 打开 Word 文档。
2. 点击顶部 `Zotero` 选项卡。
3. 点击 `Document Preferences`。
4. 选择引用样式，例如 `China National Standard GB/T 7714-2015 (numeric, Chinese)`。
5. 选择语言。
6. 点击确定。

如果没有想要的样式，可以在 Zotero 中进入 `设置` -> `引用` -> `样式`，点击 `获取更多样式`，搜索并安装。

#### 2. 插入单篇文献引用

1. 将光标放到需要引用的位置。
2. 点击 `Add/Edit Citation`。
3. 在搜索框中输入作者、标题关键词或年份。
4. 选中文献条目。
5. 按回车插入引用。

数字型样式通常会显示为类似 `[1]` 的编号。作者-年份样式通常会显示为类似 `(张三, 2024)` 的格式。

#### 3. 插入多篇文献引用

如果同一处需要引用多篇文献：

1. 点击 `Add/Edit Citation`。
2. 搜索并选择第一篇文献。
3. 不要立即按回车结束。
4. 继续输入第二篇文献的关键词并选择。
5. 所有文献都选好后，再按回车。

Zotero 会根据当前引用样式自动处理排序和分隔符，例如 `[1-3]` 或 `[1, 4, 7]`。

#### 4. 添加页码或补充说明

插入引用时，点击已选中的文献气泡，可以添加页码、前缀或后缀。

例如：

- 页码：`23-25`
- 前缀：`参见`
- 后缀：`，该研究提出了相似模型`

建议通过 Zotero 引用窗口添加这些信息，不要在 Word 正文中直接修改引用字段。

### 七、在文章末尾一键生成参考文献目录

完成正文引用后，在文末生成参考文献表：

1. 将光标放到论文最后的参考文献位置。
2. 输入标题，例如 `参考文献`。
3. 换行后点击 `Zotero` 选项卡中的 `Add/Edit Bibliography`。
4. Zotero 会根据正文中已经插入的引用自动生成文献目录。

后续如果新增、删除或调整正文引用：

1. 保持 Zotero 客户端打开。
2. 在 Word 中点击 `Refresh`。
3. Zotero 会更新正文编号和文末参考文献表。

需要注意：

- 不要手工调整参考文献编号；
- 不要直接删除参考文献表中的单个条目；
- 如果某条文献格式错误，优先回 Zotero 条目中修改元数据；
- 修改后点击 Word 插件中的 `Refresh`。

### 八、通过 Python 为正文引用添加超链接跳转

#### 1. 功能说明

Zotero 的 Word 插件可以自动插入正文引用和文末参考文献表，但默认情况下，正文中的 `[1]`、`[2]` 等引用编号通常不会自动跳转到文末对应文献。

如果希望实现类似 EndNote 的“点击正文引用跳转到参考文献表”的效果，可以使用 Python 包 `noterools` 为 Word 文档中的 Zotero 引用添加单向超链接。

该方法适合在论文排版后期使用。建议先保留一份原始 Word 文档，再对副本运行脚本。

#### 2. 前置条件

需要满足：

- Windows 环境；
- 已安装 Python；
- Word 文档中的引用和参考文献表由 Zotero 插件生成；
- 文档已经完成主要引用调整；
- 运行脚本前已经备份原文档。

#### 3. 安装 noterools

打开命令行，执行：

```bash
pip install -U noterools
```

如果本机有多个 Python 版本，也可以使用：

```bash
python -m pip install -U noterools
```

#### 4. 编写脚本

新建一个 Python 文件，例如 `link_zotero_citations.py`：

```python
from noterools import Word, add_citation_cross_ref_hook


if __name__ == "__main__":
    # 原始 Word 文档路径
    word_file_path = r"E:\Documents\论文\论文正文.docx"

    # 添加超链接后的新文档路径
    new_file_path = r"E:\Documents\论文\论文正文_带引用跳转.docx"

    with Word(word_file_path, save_path=new_file_path) as word:
        # 顺序编码制引用格式，例如 [1]、[2]、[3-5]
        add_citation_cross_ref_hook(word, is_numbered=True)
```

运行：

```bash
python link_zotero_citations.py
```

运行完成后，打开 `论文正文_带引用跳转.docx`，按住 `Ctrl` 并点击正文引用编号，检查是否能跳转到文末对应参考文献。

#### 5. 作者-年份格式示例

如果使用的是作者-年份格式，例如 `(张三, 2024)`，可以改为：

```python
from noterools import Word, add_citation_cross_ref_hook


if __name__ == "__main__":
    word_file_path = r"E:\Documents\论文\论文正文.docx"
    new_file_path = r"E:\Documents\论文\论文正文_带引用跳转.docx"

    with Word(word_file_path, save_path=new_file_path) as word:
        add_citation_cross_ref_hook(
            word,
            is_numbered=False,
            full_citation_hyperlink=True,
        )
```

其中 `full_citation_hyperlink=True` 表示让整个作者-年份引用都添加超链接。如果不设置，部分工具默认可能只给年份部分添加超链接。

#### 6. 使用注意事项

使用 Python 添加引用跳转时，要注意：

- 先备份文档，再运行脚本；
- 尽量在论文引用基本定稿后运行；
- 如果后续又用 Zotero `Refresh` 更新了引用，可能需要重新运行脚本；
- 如果点击 `Unlink Citations` 将 Zotero 字段转成普通文本，已有超链接可能失效；
- 该方式一般只能实现“正文引用跳转到文末参考文献”，不能反向从参考文献跳回正文引用；
- 同一处引用包含多篇文献时，建议运行后人工抽查跳转结果。

### 九、推荐写作流程

比较稳妥的流程如下：

1. 用 Zotero Connector 或手动导入收集文献；
2. 对中文文献使用茉莉花抓取或补全文献元数据；
3. 检查题名、作者、年份、期刊、卷期页码等字段；
4. 在 Word 中通过 Zotero 插件插入正文引用；
5. 在文末使用 `Add/Edit Bibliography` 生成参考文献表；
6. 写作过程中反复使用 `Refresh` 更新引用和参考文献表；
7. 定稿前另存一份 Word 文档；
8. 对副本运行 Python 脚本，为正文引用添加跳转超链接；
9. 抽查正文引用、参考文献编号、中文文献格式和超链接跳转效果；
10. 最终提交前如需转普通文本，再对最终副本执行 `Unlink Citations`。

### 十、常见问题

#### 1. Word 中没有 Zotero 选项卡怎么办

先关闭 Word，然后在 Zotero 中进入 `设置` -> `引用` -> `文字处理软件`，重新安装 Word 插件。重新打开 Word 后再检查功能区。

如果仍然没有，检查 Word 是否禁用了 `Zotero.dotm` 加载项，或者安全软件是否拦截了插件文件。

#### 2. 参考文献格式不符合学校要求怎么办

优先确认学校要求的引用格式名称，例如 GB/T 7714-2015 数字型、作者-年份型，或者学校自定义 CSL。然后在 Zotero 的样式管理中搜索安装。

如果学校提供了 `.csl` 文件，可以在 Zotero 的 `样式` 设置中手动添加。

#### 3. 中文文献作者显示异常怎么办

先检查 Zotero 条目中的作者字段。中文作者通常应拆成独立作者项，不要把多个作者写在同一个作者框中。

如果姓名拆分不正确，可以使用茉莉花的中文姓名拆分与合并工具辅助处理。

#### 4. 正文引用编号错乱怎么办

不要手动改编号。先确认正文引用都是通过 Zotero 插件插入的，然后点击 `Refresh`。如果仍然异常，检查是否有复制粘贴导致的损坏字段，必要时删除问题引用并重新插入。

#### 5. 什么时候使用 Unlink Citations

`Unlink Citations` 会移除 Zotero 字段，将引用和参考文献表转换为普通文本。这个操作不可逆，通常只在最终提交副本中使用。

建议保留两个文件：

- `论文正文_Zotero可编辑版.docx`
- `论文正文_最终提交版.docx`

前者保留 Zotero 字段，方便继续更新；后者用于提交或打印。

### 参考资料

- Zotero 官方安装文档：https://www.zotero.org/support/installation
- Zotero 官方插件安装文档：https://www.zotero.org/support/plugins
- Zotero Word 插件使用文档：https://www.zotero.org/support/word_processor_plugin_usage
- Zotero 文字处理器插件说明：https://www.zotero.org/support/word_processor_integration
- 茉莉花 Jasminum GitHub 项目：https://github.com/l0o0/jasminum
- Zotero 中文社区：在 Word 中把引注链接到参考文献表：https://zotero-chinese.com/user-guide/misc/link-citation-to-bibliography
