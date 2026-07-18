# QingchenJia Blog

<p align="center">
  基于 Hexo 与 Redefine 构建的个人技术博客，记录开发实践、工具使用与服务部署经验。
</p>

<p align="center">
  <a href="https://qingchenjia.github.io/">在线访问</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#写作指南">写作指南</a> ·
  <a href="#部署说明">部署说明</a>
</p>

<p align="center">
  <img alt="Hexo 8" src="https://img.shields.io/badge/Hexo-8.1.2-0E83CD?logo=hexo">
  <img alt="Node.js 20" src="https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white">
  <img alt="Redefine 2" src="https://img.shields.io/badge/Theme-Redefine_2.9.0-A31F34">
  <img alt="GitHub Pages" src="https://img.shields.io/badge/Deploy-GitHub_Pages-222222?logo=github">
</p>

## 项目简介

本仓库保存 [QingchenJia Blog](https://qingchenjia.github.io/) 的文章、站点资源、Hexo 配置和自动部署流程。博客以可复现的实践教程为主，内容覆盖后端与前端开发、开发工具、服务器与中间件部署、个人建站以及 AI 编程工具等方向。

截至 2026 年 7 月，仓库已收录 37 篇文章，主要分类包括：

- **开发工具**：Git、Node.js、Conda、Zotero、PowerShell、Codex、Claude Code、OpenCode 等；
- **后端开发**：Spring Boot、MyBatis-Plus、Redis、JWT、Knife4j、OpenFeign 等；
- **服务部署**：Docker、Nginx、Nacos、RabbitMQ、CentOS、HTTPS 与内网穿透等；
- **前端与可视化**：Vue 3、Element Plus、ECharts、CesiumJS 等；
- **博客与效率实践**：Hexo 建站、GitHub Pages、AI 辅助写作与演示文稿制作等。

## 项目特性

- **静态站点**：Hexo 8 驱动，构建结果为纯静态文件，加载快且易于托管；
- **响应式主题**：使用 Redefine 2，支持亮色/暗色背景、移动端布局和单页切换体验；
- **阅读体验**：启用文章目录、代码复制、代码高亮、图片懒加载、阅读时间与文章版权声明；
- **内容导航**：提供首页分页、标签页和分类页，文章按日期生成永久链接；
- **站点增强**：启用访问量统计、运行时间统计、社交链接和固定 APlayer 音乐播放器；
- **资源共置**：开启 `post_asset_folder`，文章图片可与对应 Markdown 文件放在同名目录中；
- **自动发布**：推送到 `master` 后，由 GitHub Actions 构建并发布至 GitHub Pages；
- **依赖维护**：Dependabot 每日检查 npm 依赖更新。

## 技术栈

| 类型           | 方案                                                                             | 用途                     |
| -------------- | -------------------------------------------------------------------------------- | ------------------------ |
| 静态站点生成器 | [Hexo 8.1.2](https://hexo.io/)                                                   | 解析文章并生成静态页面   |
| 博客主题       | [hexo-theme-redefine 2.9.0](https://github.com/EvanNotFound/hexo-theme-redefine) | 页面布局、样式与交互功能 |
| 内容格式       | Markdown / YAML Front Matter                                                     | 编写文章及其元数据       |
| 代码高亮       | highlight.js                                                                     | 服务端生成带行号的代码块 |
| 自动化         | GitHub Actions                                                                   | 安装依赖、构建与发布站点 |
| 托管           | GitHub Pages                                                                     | 提供线上静态站点         |
| 依赖管理       | npm / Dependabot                                                                 | 锁定并持续更新依赖       |

## 目录结构

```text
QingchenJia.github.io/
├─ .github/
│  ├─ workflows/
│  │  └─ pages.yml              # Pages 工作流：Node.js 20 构建并部署 public/
│  └─ dependabot.yml            # npm 依赖的每日更新检查
├─ scaffolds/                   # `hexo new` 使用的内容脚手架
│  ├─ draft.md                  # 草稿模板
│  ├─ page.md                   # 独立页面模板
│  └─ post.md                   # 文章模板，预置分类、标签与 Typora 资源根路径
├─ scripts/                     # Hexo 启动时自动载入的站点级扩展脚本
│  └─ vue-codeblock-alias.js    # 将 Markdown 的 vue 代码块映射为 html 以正确高亮
├─ source/                      # Hexo 内容源目录
│  ├─ _posts/                   # 文章 Markdown 文件
│  │  ├─ <文章标题>.md           # 文章正文与 Front Matter
│  │  └─ <文章标题>/             # 可选的文章专属图片/附件目录
│  ├─ assets/                   # 跨文章复用的站点公共资源
│  │  ├─ images/                # 头像、亮色与暗色首页背景图
│  │  └─ music/                 # APlayer 使用的音频及 LRC 歌词
│  ├─ categories/index.md       # 分类聚合页入口
│  └─ tags/index.md             # 标签聚合页入口
├─ themes/
│  └─ .gitkeep                  # 目录占位；Redefine 实际由 npm 安装到 node_modules
├─ _config.yml                  # Hexo 核心配置：URL、文章规则、渲染、主题与部署目标
├─ _config.redefine.yml         # Redefine 配置：外观、导航、文章、页脚、播放器等
├─ deploy.ps1                   # Windows 快捷脚本：清理、构建并启动本地预览
├─ package.json                 # npm 命令、Hexo 版本及插件依赖
├─ package-lock.json            # 依赖锁文件，保证安装结果可复现
├─ .gitignore                   # 忽略依赖、缓存、日志和静态构建产物
└─ README.md                    # 项目说明文档
```

以下内容会在本地运行过程中生成，不纳入版本控制：

| 路径            | 说明                                     | 维护方式                            |
| --------------- | ---------------------------------------- | ----------------------------------- |
| `node_modules/` | npm 安装的 Hexo、主题和插件              | 通过 `npm install` 或 `npm ci` 重建 |
| `public/`       | Hexo 生成的静态站点，也是 Pages 上传目录 | 通过 `npm run build` 重建           |
| `db.json`       | Hexo 内容数据库缓存                      | 通过 `npm run clean` 清理后重建     |
| `.deploy_git/`  | `hexo deploy` 使用的临时部署仓库         | 由部署插件自动维护                  |

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 20.x（与线上构建环境保持一致）；
- npm（随 Node.js 安装）；
- Git。

### 本地运行

```bash
# 1. 克隆仓库
git clone https://github.com/QingchenJia/QingchenJia.github.io.git
cd QingchenJia.github.io

# 2. 按锁文件安装依赖
npm ci

# 3. 启动本地预览
npm run server
```

浏览器访问 <http://localhost:4000/> 即可预览。开发过程中修改文章或配置后，Hexo Server 会自动重新生成页面；若缓存导致内容异常，可先执行 `npm run clean`。

### 常用命令

| 命令                           | 作用                                                     |
| ------------------------------ | -------------------------------------------------------- |
| `npm run server`               | 启动本地开发服务器，默认端口为 `4000`                    |
| `npm run build`                | 生成静态站点到 `public/`                                 |
| `npm run clean`                | 删除 `public/` 和 `db.json` 等生成内容                   |
| `npm run deploy`               | 使用 `hexo-deployer-git` 发布到 `_config.yml` 指定的仓库 |
| `npx hexo new "文章标题"`      | 根据 `scaffolds/post.md` 创建文章                        |
| `npx hexo new page "页面名称"` | 创建独立页面                                             |

Windows 环境也可以执行 `./deploy.ps1`，它会依次清理缓存、构建站点并启动本地服务器。该脚本用于本地构建预览，不会执行远程部署。

## 写作指南

### 新建文章

```bash
npx hexo new "文章标题"
```

新文章生成于 `source/_posts/文章标题.md`。建议补全标题、日期、分类和标签，并保持一篇文章只有一个主要分类、标签能够准确描述技术主题：

```yaml
---
title: 文章标题
date: 2026-07-18 12:00:00
categories:
    - 开发工具
tags:
    - Hexo
    - GitHub Pages
---
```

### 管理文章资源

项目已启用文章资源目录。文章专属图片应放在与文章同名的目录中：

```text
source/_posts/文章标题.md
source/_posts/文章标题/
└─ example.png
```

在 Markdown 中使用相对路径引用：

```markdown
![示例图片](文章标题/example.png)
```

头像、首页背景等跨页面资源放在 `source/assets/images/`；播放器音频与歌词放在 `source/assets/music/`。不要直接修改 `public/` 中的文件，因为下次构建时会全部重新生成。

### 提交前检查

```bash
npm run clean
npm run build
```

构建成功后，建议再启动 `npm run server` 检查文章排版、图片路径、代码高亮、分类与标签页面是否符合预期。

## 配置说明

### Hexo 核心配置

[`_config.yml`](./_config.yml) 负责站点生成规则，当前关键设置包括：

- 站点地址：`https://qingchenjia.github.io/`；
- 时区：`Asia/Shanghai`；
- 永久链接：`:year/:month/:day/:title/`；
- 首页每页展示 10 篇文章，按发布日期倒序排列；
- 开启文章资源目录与 Markdown 资源路径处理；
- 使用 highlight.js 生成带行号的代码块；
- 使用 `redefine` 主题，并配置 Git 部署目标。

### Redefine 主题配置

[`_config.redefine.yml`](./_config.redefine.yml) 负责站点展示与交互，当前主要定制有：

- 站点名称、作者、头像以及 GitHub、邮箱等社交入口；
- 亮色/暗色首页背景和首页动态副标题；
- 首页、标签、分类导航及左侧边栏；
- 文章目录、代码块样式、图片懒加载和 CC BY-NC-SA 版权提示；
- 页面访问统计、运行时间和文章统计；
- 固定 APlayer 播放器及本地音乐/歌词列表。

主题搜索、评论、RSS、Mermaid 和 CDN 等能力目前未启用；若要开启，请先安装配置注释中标明的依赖，再修改对应开关。

## 部署说明

### GitHub Pages 自动部署（推荐）

推送至 `master` 分支后，[`.github/workflows/pages.yml`](./.github/workflows/pages.yml) 会自动执行：

```text
检出源码 → 配置 Node.js 20 → 安装依赖 → 构建 public/ → 上传制品 → 发布 Pages
```

首次使用或迁移仓库时，需要在 GitHub 仓库的 **Settings → Pages → Build and deployment** 中将 Source 设置为 **GitHub Actions**。随后可在仓库的 **Actions** 页面查看构建日志和部署状态。

### Hexo Git 手动部署

项目同时保留了 `hexo-deployer-git` 配置，可将生成结果发布到 `_config.yml` 中的目标仓库：

```bash
npm run clean
npm run build
npm run deploy
```

该方式需要本机 Git 凭据具有目标仓库写入权限。日常发布建议只使用一种部署链路，避免自动部署与手动部署产生内容覆盖或分支混淆。

## 参与维护

如果发现文章内容错误、失效链接或构建问题，欢迎通过 Issue 反馈；提交改动时建议：

1. 从最新的 `master` 分支创建独立分支；
2. 将单次提交聚焦于一个主题，并使用清晰的提交说明；
3. 提交前执行 `npm run build`，确认没有 Hexo 渲染错误；
4. 不提交 `public/`、`db.json`、`node_modules/` 等生成内容。

## 致谢

- [Hexo](https://hexo.io/)：快速、简洁且高效的静态博客框架；
- [Redefine](https://github.com/EvanNotFound/hexo-theme-redefine)：本项目使用的现代化 Hexo 主题；
- [GitHub Pages](https://pages.github.com/) 与 [GitHub Actions](https://github.com/features/actions)：为站点提供持续构建与托管能力；
- 所有 Hexo 插件及开源项目的维护者与贡献者。

## 版权说明

主题和第三方依赖遵循各自的开源许可证。博客文章页面默认展示 **CC BY-NC-SA** 版权声明；本仓库当前未单独提供源码级 `LICENSE` 文件，未经许可请勿将仓库内容整体用于商业用途。
