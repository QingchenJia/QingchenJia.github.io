---
title: 基于Hexo框架搭建博客
typora-root-url: 基于Hexo框架搭建博客
date: 2024-10-21 19:15:30
tags:
---

### 一、引言

为记录学习经验以及生活里的高光时刻，选择采用了`Hexo`框架进行个人博客的快速搭建，并将其部署到`GitHub`所提供的`page`中，使其能够被公共访问。

### 二、过程

#### 1.安装Git和node.js

访问`Git`官网页面，点击右下角`Download for Windows`下载安装包。下载完毕后，均按默认操作进行下一步，即可完成安装。

![](../基于Hexo框架搭建博客/Git.jpg)

推荐使用`nvm`进行`node.js`的管理，方便对不同版本的`node`进行切换，点击右下角`Releases`，可根据需求进行不同版本的安装，下载后默认操作即可完成安装。

![](../基于Hexo框架搭建博客/nvm.jpg)

打开终端，进行以下指令操作即可完成对应版本的`node.js`的安装。

```shell
nvm ls available	#检索当前可安装的node.js版本
nvm install v20.17.0	#安装合适版本，均以v20.17.0版本为示例
```

#### 2.安装Hexo博客框架

新建博客项目文件夹，通过目录打开终端，依次执行以下指令完成安装。

```shell
npm install hexo-cli -g	#全局安装Hexo框架
hexo init blog	#初始化博客项目，项目文件夹名称以blog为例
cd blog
npm install	#安装所需依赖
hexo server	#启动Hexo服务，即可进入本地初始化博客页面
```

#### 3.配置Redefine主题

`Hexo`默认初始化的博客页面稍显简陋，不足以满足个性化的需求，选择`Redefine`主题可以使页面得到充分的美化。可以通过`npm`和`git`两种方式进行安装，这里选择使用`npm`的方式。

```shell
npm install hexo-theme-redefine@latest
```

安装完成后，进入`blog`目录，找到`_config.yml`文件，对参数进行配置。

```yml
theme: redefine
```

创建`_config.redefine.yml`文件，内容粘贴自`https://github.com/EvanNotFound/hexo-theme-redefine/blob/main/_config.yml`即可完成默认配置。

具体细则可查看`Redefine`主题的官方文档，对基本、首页、文章和页脚均做了详细的配置说明。

![](../基于Hexo框架搭建博客/Redefine.jpg)

#### 4.进行个性化配置

配置网站的标题和作者，左上角标题将变为`title`对应值，底部页脚和侧边作者名将变为`author`对应值。

```yml
info:
  # Site title
  title: QingchenJia-Blog
  # Author name
  author: QingchenJia
  # Site URL
  url: https://qingchenjia.github.io/
```

开启字幕动画功能，并设置明亮主题的背景图片，`title`对应字幕标题，`text`对应字幕正文，为数组格式，添加多行正文需通过逗号隔开。填写个人社交账号链接，开启功能后，主页右下角会出现对应平台`logo`，点击即可跳转。


```yml
home_banner:
  # Whether to enable home banner
  enable: true
  # Home banner image
  image: 
    light: /images/background.webp # light mode
    dark: /images/background-dark.webp # dark mode
  # Home banner title
  title: The Blog of QingchenJia
  # Home banner subtitle
  subtitle:
    text: [Welcome to this blog which belongs to QingchenJia!] # subtitle text, array
  social_links:
    # Whether to enable
    enable: true
    # Social links
    links:
      github: https://github.com/QingchenJia # your GitHub URL
      email: 879484952@qq.com # your email
```

#### 5.部署至GitHub-Page

新建`github`仓库，仓库名为”`用户名.github.io`“，可见权限选择`public`，其余均为默认。

![](../基于Hexo框架搭建博客/repo.jpg)

推送至远程仓库之前，先在本地部署，浏览一下是否符合要求。

```shell
hexo g	#生成博客网站资源内容
hexo s 	#也可以写作hexo server，部署至本地浏览
```

接下来就是最基本的本地仓库初始化，添加至暂存区，提交然后挂载远程仓库，再推送至远程仓库。为保证自定义资源能够正确加载，建议将`public`目录一同推送。

为使GitHub-Page能够在推送完成后根据最新仓库内容即时重新部署后台服务，进入仓库`Settings-Pages-Source`选择`GitHub Actions`。

![](../基于Hexo框架搭建博客/Setting.jpg)

建立`.github/workflows/pages.yml`，内容如下，填写完毕后，项目仓库将会根据如下配置进行部署发布。

```yml
name: Pages

on:
  push:
    branches:
      - master  # default branch

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          # If your repository depends on submodule, please see: https://github.com/actions/checkout
          submodules: recursive
      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          # Examples: 20, 18.19, >=16.20.2, lts/Iron, lts/Hydrogen, *, latest, current, node
          # Ref: https://github.com/actions/setup-node#supported-version-syntax
          node-version: '20'
      - name: Cache NPM dependencies
        uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.OS }}-npm-cache
          restore-keys: |
            ${{ runner.OS }}-npm-cache
      - name: Install Dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public
  deploy:
    needs: build
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

完成上述操作后，访问`https://用户名.github.io/`即可浏览博客网站页面。

### 三、问题

#### 1.图片无法正常显示

下载插件`hexo-asset-image`和`hexo-renderer-marked`进行图片显示的修复。

```shell
npm install https://github.com/CodeFalling/hexo-asset-image
npm install hexo-renderer-marked
```

然后更改 `.config.yml` 中的，添加以下匹配值，功能是建立新文章的时候会添加一个同名的文件夹，该文件夹将作为本文章的图片存储目录。并在`post_asset_folder: true`下，新建配置项`marked`。

```yml
post_asset_folder: true
marked:
  prependRoot: true
  postAsset: true
```

然后修改`scaffolds`文件夹下的`post.md`，添加哈希值`typora-root-url: {{title}}`，这样我们在用`typora`的时候会使图片默认路径为同文件夹下的同名文件夹。

需要特别注意的一点是，图片格式应为`.jpg`。

#### 2.更新时间先于创建时间

进入`.config.yml` ，对`timezone`进行配置，修改为中国上海的时区即可正常展示。

```yml
timezone: 'Asia/Shanghai'
```

### 四、写在最后

虽然经历了不少坎坷，也踩了不少的坑，终于在最后成功搭建好了属于自己的博客网站，每次打开都还是会感觉到有种莫名的成就感。
