# QingchenJia Blog

这是一个基于 [Hexo](https://hexo.io/) 搭建的个人技术博客源码仓库，使用 `hexo-theme-redefine` 主题，并通过 GitHub Pages 自动构建发布。

站点地址：<https://qingchenjia.github.io/>

## 项目内容

博客内容主要记录后端开发、服务部署和个人建站实践，当前文章覆盖：

- Hexo 博客搭建与 GitHub Pages 部署
- Spring Boot、MyBatis-Plus、Knife4j、JWT、HTTPS、Redis 等后端实践
- Nacos、OpenFeign、RabbitMQ 等微服务组件使用
- Nginx、Docker、CentOS 基础环境配置

## 技术栈

- Hexo `8.x`
- Node.js `20`（GitHub Actions 构建环境）
- 主题：`hexo-theme-redefine`
- 部署：GitHub Pages / GitHub Actions
- 主要插件：
  - `hexo-asset-image`
  - `hexo-deployer-git`
  - `hexo-generator-archive`
  - `hexo-generator-category`
  - `hexo-generator-index`
  - `hexo-generator-tag`
  - `hexo-renderer-marked`
  - `hexo-renderer-stylus`

## 目录结构

```text
.
├── .github/
│   ├── dependabot.yml
│   └── workflows/pages.yml
├── scaffolds/              # Hexo 文章、页面、草稿模板
├── source/
│   ├── _posts/             # 博客文章与文章资源
│   └── assets/images/      # 站点头像、首页背景等公共资源
├── themes/                 # 本地主题目录
├── _config.yml             # Hexo 主配置
├── _config.redefine.yml    # Redefine 主题配置
├── package.json
└── package-lock.json
```

## 本地开发

建议使用 Node.js 20 或兼容版本。

```bash
npm install
npm run server
```

默认本地预览地址：

```text
http://localhost:4000
```

## 常用命令

```bash
# 清理生成文件
npm run clean

# 生成静态文件到 public/
npm run build

# 启动本地预览服务
npm run server

# 使用 Hexo git deployer 部署到 _config.yml 中配置的 deploy.repo
npm run deploy
```

## 写作说明

新建文章：

```bash
npx hexo new "文章标题"
```

文章源文件存放在 `source/_posts/`。本项目已启用 `post_asset_folder: true`，如果文章需要配图，可将图片放在与文章同名的资源目录中，例如：

```text
source/_posts/文章标题.md
source/_posts/文章标题/example.png
```

公共图片资源放在 `source/assets/images/`，例如站点头像和首页背景图。

## 配置说明

- `_config.yml`：Hexo 主配置，包括站点 URL、永久链接、文章渲染、主题选择和 `hexo deploy` 目标仓库。
- `_config.redefine.yml`：Redefine 主题配置，包括站点标题、作者、头像、首页横幅、颜色、导航栏和社交链接。
- `.github/workflows/pages.yml`：推送到 `master` 分支后，GitHub Actions 会安装依赖、执行 `npm run build`，并将 `public/` 发布到 GitHub Pages。

## 发布流程

推荐发布源码变更到当前仓库后，由 GitHub Actions 自动构建 GitHub Pages：

```bash
git add .
git commit -m "docs: update README"
git push origin master
```

也可以使用 Hexo 的部署命令，将生成结果推送到 `_config.yml` 中配置的 `deploy.repo`：

```bash
npm run clean
npm run build
npm run deploy
```

## 维护备注

- `public/` 是 Hexo 构建产物，不建议手动维护。
- `db.json` 是 Hexo 生成缓存文件，可在需要完整重建时配合 `npm run clean` 重新生成。
- Dependabot 已配置为每日检查 npm 依赖更新。
