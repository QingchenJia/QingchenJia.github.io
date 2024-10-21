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

![](/../基于Hexo框架搭建博客/Git.jpg)

推荐使用`nvm`进行`node.js`的管理，方便对不同版本的`node`进行切换，点击右下角`Releases`，可根据需求进行不同版本的安装，下载后默认操作即可完成安装。

![](/../基于Hexo框架搭建博客/nvm.jpg)

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

创建`_config.redefine.yml`文件，并填充下述内容以完成基础配置。

```yml
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# THEME REDEFINE CONFIGURATION FILE V2
# BY EVANNOTFOUND
# GITHUB: https://github.com/EvanNotFound/hexo-theme-redefine
# DOCUMENTATION: https://redefine-docs.ohevan.com
# DEMO: https://redefine.ohevan.com
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end


# BASIC INFORMATION >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/basic/info
info:
  # Site title
  title: Theme Redefine
  # Author name
  author: The Redefine Team
  # Site URL
  url: https://redefine.ohevan.com
# BASIC INFORMATION <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end


# IMAGE CONFIGURATION >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/basic/defaults
defaults:
  # Favicon
  favicon: /images/redefine-favicon.svg
  # Site logo
  logo: 
  # Site avatar
  avatar: /images/redefine-avatar.svg
# IMAGE CONFIGURATION <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end


# COLORS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/basic/colors
colors:
  #Primary color
  primary: "#A31F34"
  # Secondary color (TBD)
  secondary:
  # Default theme mode initial value (will be overwritten by prefer-color-scheme)
  default_mode: light # light, dark
# COLORS <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end


# SITE CUSTOMIZATION >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/basic/global
global:
  # Custom global fonts
  fonts:
    # Chinese fonts
    chinese: 
      enable: false # Whether to enable custom chinese fonts
      family:  # Font family
      url:  # Font URL to CSS file
    # English fonts
    english: 
      enable: false # Whether to enable custom english fonts
      family:  # Font family
      url:  # Font URL to CSS file
    # Custom title fonts (navbar, sidebar)
    title:
      enable: false # Whether to enable custom title fonts
      family:  # Font family
      url:  # Font URL to CSS file
  # Content max width
  content_max_width: 1000px
  # Sidebar width
  sidebar_width: 210px
  # Effects on mouse hover
  hover:
    shadow: true # shadow effect
    scale: false # scale effect
  # Scroll progress
  scroll_progress:
    bar: false # progress bar
    percentage: true # percentage
  # Website counter
  website_counter:
    url: https://cn.vercount.one/js # counter API URL (no need to change)
    enable: true # enable website counter or not
    site_pv: true # site page view
    site_uv: true # site unique visitor
    post_pv: true # post page view
  # Whether to enable single page experience (using swup). See https://swup.js.org/. similar to pjax
  single_page: true
  # Whether to enable Preloader.
  preloader:
    enable: false
    custom_message: # Custom message. If empty, the site title will be displayed
  # Whether to enable open graph
  open_graph: true
  # Google Analytics
  google_analytics:
    enable: false # Whether to enable Google Analytics
    id:  # Google Analytics Measurement ID
# SITE CUSTOMIZATION <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end
    

# FONTAWESOME >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/basic/fontawesome
fontawesome: # Pro v6.2.1
  # Thin version
  thin: false
  # Light version
  light: false
  # Duotone version
  duotone: false
  # Sharp Solid version
  sharp_solid: false
# FONTAWESOME <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end


# HOME BANNER >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/home/home_banner
home_banner:
  # Whether to enable home banner
  enable: true
  # style of home banner
  style: fixed # static or fixed
  # Home banner image
  image: 
    light: /images/wallhaven-wqery6-light.webp # light mode
    dark: /images/wallhaven-wqery6-dark.webp # dark mode
  # Home banner title
  title: Theme Redefine
  # Home banner subtitle
  subtitle:
    text: [] # subtitle text, array
    hitokoto:  # 一言配置
      enable: false # Whether to enable hitokoto
      show_author: false # Whether to show author
      api: https://v1.hitokoto.cn # API URL, can add types, see https://developer.hitokoto.cn/sentence/#%E5%8F%A5%E5%AD%90%E7%B1%BB%E5%9E%8B-%E5%8F%82%E6%95%B0
    typing_speed: 100 # Typing speed (ms)
    backing_speed: 80 # Backing speed (ms)
    starting_delay: 500 # Start delay (ms)
    backing_delay: 1500 # Backing delay (ms)
    loop: true # Whether to loop
    smart_backspace: true # Whether to smart backspace
  # Color of home banner text
  text_color: 
    light: "#fff" # light mode
    dark: "#d1d1b6" # dark mode
  # Specific style of the text
  text_style: 
    # Title font size
    title_size: 2.8rem
    # Subtitle font size
    subtitle_size: 1.5rem
    # Line height between title and subtitle
    line_height: 1.2
  # Home banner custom font
  custom_font: 
    # Whether to enable custom font
    enable: false
    # Font family
    family: 
    # URL to font CSS file
    url:
  # Home banner social links
  social_links:
    # Whether to enable
    enable: false
    # Social links style
    style: default # default, reverse, center
    # Social links
    links:
      github:  # your GitHub URL
      instagram: # your Instagram URL
      zhihu:  # your ZhiHu URL
      twitter:  # your twitter URL
      email:  # your email
      # ...... # you can add more
    # Social links with QRcode drawers
    qrs:
      weixin:  # your Wechat QRcode image URL
      # ...... # you can add more
# HOME BANNER <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end


# NAVIGATION BAR >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/home/navbar
navbar:
  # Auto hide navbar
  auto_hide: false
  # Navbar background color
  color:
    left: "#f78736" #left side 
    right: "#367df7"  #right side
    transparency: 35 #percent (10-99)
  # Navbar width (usually no need to modify)
  width:
    home: 1200px #home page
    pages: 1000px #other pages
  # Navbar links
  links:
    Home: 
      path: / 
      icon: fa-regular fa-house # can be empty
    # Archives: 
    #   path: /archives 
    #   icon: fa-regular fa-archive # can be empty
    # Status: 
    #   path: https://status.ohevan.com/
    #   icon: fa-regular fa-chart-bar
    # About: 
    #   icon: fa-regular fa-user
    #   submenus:
    #     Me: /about
    #     Github: https://github.com/EvanNotFound/hexo-theme-redefine
    #     Blog: https://ohevan.com
    #     Friends: /friends
    # Links: 
    #   icon: fa-regular fa-link
    #   submenus:
    #     Link1: /link1
    #     Link2: /link2
    #     Link3: /link3
    # ...... # you can add more
  # Navbar search (local search). Requires hexo-generator-searchdb (npm i hexo-generator-searchdb). See https://github.com/theme-next/hexo-generator-searchdb
  search:
    # Whether to enable
    enable: false
    # Preload search data when the page loads
    preload: true
# NAVIGATION BAR <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end


# HOME PAGE ARTICLE SETTINGS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/home/home
home:
  # Sidebar settings
  sidebar:
    enable: true # Whether to enable sidebar
    position: left # Sidebar position. left, right
    first_item: menu # First item in sidebar. menu, info
    announcement: # Announcement text
    show_on_mobile: true # Whether to show sidebar navigation on mobile sheet menu
    links:
      # Archives: 
      #   path: /archives 
      #   icon: fa-regular fa-archive # can be empty
      # Tags: 
      #   path: /tags 
      #   icon: fa-regular fa-tags # can be empty
      # Categories: 
      #   path: /categories 
      #   icon: fa-regular fa-folder # can be empty
      # ...... # you can add more
  # Article date format
  article_date_format: auto # auto, relative, YYYY-MM-DD, YYYY-MM-DD HH:mm:ss etc.
  # Article excerpt length
  excerpt_length: 200 # Max length of article excerpt
  # Article categories visibility
  categories:
    enable: true  # Whether to enable
    limit: 3 # Max number of categories to display
  # Article tags visibility
  tags:
    enable: true  # Whether to enable
    limit: 3  # Max number of tags to display
# HOME PAGE ARTICLE SETTINGS <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end


# ARTICLE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/posts/articles
articles:
  # Set the styles of the article
  style:
    font_size: 16px # Font size
    line_height: 1.5 # Line height
    image_border_radius: 14px # image border radius
    image_alignment: center # image alignment. left, center
    image_caption: false # Whether to display image caption
    link_icon: true # Whether to display link icon
    title_alignment: left # Title alignment. left, center
    headings_top_spacing: # Top spacing for headings from h1-h6
      h1: 3.2rem
      h2: 2.4rem
      h3: 1.9rem
      h4: 1.6rem
      h5: 1.4rem
      h6: 1.3rem
  # Word count. Requires hexo-wordcount (npm install hexo-wordcount). See https://github.com/willin/hexo-wordcount
  word_count:
    enable: true # Whether to enable
    count: true # Whether to display word count
    min2read: true # Whether to display reading time
  # Author label
  author_label: 
    enable: true # Whether to enable
    auto: false # Whether to automatically add author label, e.g. Lv1, Lv2, Lv3...
    list: []
  # Code block settings
  code_block:
    copy: true # Whether to enable code block copy button
    style: mac # mac | simple
    highlight_theme: # Color scheme for highlightjs code highlighting. For preview, see https://highlightjs.org/examples
      light: github # light mode theme, support: github, atom-one-light, default
      dark: vs2015 # dark mode theme, support: github-dark, monokai-sublime, vs2015, night-owl, atom-one-dark, nord, tokyo-night-dark, a11y-dark, agate
    font: # Custom font
      enable: false # Whether to enable
      family: # Font family
      url: # Font URL to CSS file
  # Table of contents settings
  toc:
    enable: true # Whether to enable TOC
    max_depth: 3 # TOC depth
    number: false # Whether to add number to TOC automatically
    expand: true # Whether to expand TOC
    init_open: true # Open toc by default
  # Whether to enable copyright notice
  copyright:
    enable: true # Whether to enable
    default: cc_by_nc_sa # Default license, can be cc_by_nc_sa, cc_by_nd, cc_by_nc, cc_by_sa, cc_by, all_rights_reserved, public_domain
  # Whether to enable lazyload for images
  lazyload: true
  # Article recommendation. Requires nodejieba (npm install nodejieba). Transplanted from hexo-theme-volantis.
  recommendation:
    # Whether to enable article recommendation
    enable: false
    # Article recommendation title
    title: 推荐阅读
    # Max number of articles to display
    limit: 3
    # Max number of articles to display mobile
    mobile_limit: 2
    # Placeholder image
    placeholder: /images/wallhaven-wqery6-light.webp
    # Skip directory
    skip_dirs: []
# ARTICLE <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end


# COMMENT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/posts/comment
comment:
  # Whether to enable comment
  enable: true
  # Comment system
  system: waline # waline, gitalk, twikoo, giscus
  # System configuration
  config:
    # Waline comment system. See https://waline.js.org/
    waline:
      serverUrl: https://example.example.com # Waline server URL. e.g. https://example.example.com
      lang: zh-CN # Waline language. e.g. zh-CN, en-US. See https://waline.js.org/guide/client/i18n.html
      emoji: [] # Waline emojis, see https://waline.js.org/guide/features/emoji.html
      recaptchaV3Key: wasd # Google reCAPTCHA v3 key. See https://waline.js.org/reference/client/props.html#recaptchav3key
      turnstileKey: # Turnstile key. See https://waline.js.org/reference/client/props.html#turnstilekey
      reaction: false # Waline reaction. See https://waline.js.org/reference/client/props.html#reaction
    # Gitalk comment system. See https://github.com/gitalk/gitalk
    gitalk:
      clientID: # GitHub Application Client ID
      clientSecret: # GitHub Application Client Secret
      repo: # GitHub repository
      owner: # GitHub repository owner
      proxy: # GitHub repository proxy
    # Twikoo comment system. See https://twikoo.js.org/
    twikoo:
      version: 1.6.10 # Twikoo version, do not modify if you dont know what it is
      server_url: # Twikoo server URL. e.g. https://example.example.com
      region: # Twikoo region. can be empty
    # Giscus comment system. See https://giscus.app/
    giscus:
      repo: # Github repository name e.g. EvanNotFound/hexo-theme-redefine
      repo_id: # Github repository id
      category: # Github discussion category
      category_id: # Github discussion category id
      mapping: pathname # Which value to use as the unique identifier for the page. e.g. pathname, url, title, og:title. DO NOT USE og:title WITH PJAX ENABLED since pjax will not update og:title when the page changes
      strict: 0 # Whether to enable strict mode. e.g. 0, 1
      reactions_enabled: 1 # Whether to enable reactions. e.g. 0, 1
      emit_metadata: 0 # Whether to emit metadata. e.g. 0, 1
      lang: en # Giscus language. e.g. en, zh-CN, zh-TW
      input_position: bottom # Place the comment box above/below the comments. e.g. top, bottom
      loading: lazy # Load the comments lazily
# COMMENT <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end


# FOOTER >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/footer
footer:
  # Show website running time
  runtime: true # show website running time or not
  # Icon in footer, write fontawesome icon code here
  icon: '<i class="fa-solid fa-heart fa-beat" style="--fa-animation-duration: 0.5s; color: #f54545"></i>'
  # The start time of the website, format: YYYY/MM/DD HH:mm:ss
  start: 2022/8/17 11:45:14
  # Site statistics
  statistics: true # show site statistics or not (total articles, total words)
  # Footer message
  customize:
  # ICP record number. See https://beian.miit.gov.cn/
  icp:
    enable: false # Whether to enable
    number: # ICP record number
    url: # ICP record url
# FOOTER <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end


# INJECT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/inject
inject:
  # Whether to enable inject
  enable: false
  # Inject custom head html code
  head: 
    -
    -
  # Inject custom footer html code
  footer:
    -
    -
# INJECT <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end


# PLUGINS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/plugins
plugins:
  # RSS feed. Requires hexo-generator-feed (npm i hexo-generator-feed). See https://github.com/hexojs/hexo-generator-feed
  feed:
    enable: false # Whether to enable
  # Aplayer. See https://github.com/DIYgod/APlayer
  aplayer:
    enable: false # Whether to enable
    type: fixed # fixed, mini
    audios:
      - name: # audio name
        artist: # audio artist
        url: # audio url
        cover: # audio cover url
        lrc: # audio cover lrc
#      - name: # audio name
#        artist: # audio artist
#        url: # audio url
#        cover: # audio cover url
#        lrc: # audio cover lrc
      # .... you can add more audios here
  # Mermaid JS. Requires hexo-filter-mermaid-diagrams (npm i hexo-filter-mermaid-diagrams). See https://mermaid.js.org/
  mermaid:
    enable: false # enable mermaid or not
    version: "9.3.0" # default v9.3.0
# PLUGINS <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end


# PAGE TEMPLATES >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/page_templates
page_templates:
  # Friend Links page column number
  friends_column: 2
  # Tags page style
  tags_style: blur # blur, cloud
# PAGE TEMPLATES <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end


# CDN >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/cdn
cdn:
  # Whether to enable CDN
  enable: false
  # CDN Provider
  provider: npmmirror # npmmirror, zstatic, sustech, cdnjs, jsdelivr, unpkg, custom
  # Custom CDN URL
  # format example: https://cdn.custom.com/hexo-theme-redefine/${version}/source/${path}
  # The ${path} must leads to the root of the "source" folder of the theme
  custom_url: 
# CDN <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end

# DEVELOPER MODE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start
# Docs: https://redefine-docs.ohevan.com/developer
developer:
  # Whether to enable developer mode (only for developers who want to modify the theme source code, not for ordinary users)
  enable: false
# DEVELOPER MODE <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end
```

具体细则可查看`Redefine`主题的官方文档，对基本、首页、文章和页脚均做了详细的配置说明。

![](/../基于Hexo框架搭建博客/Redefine.jpg)

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

![](/../基于Hexo框架搭建博客/repo.jpg)

推送至远程仓库之前，先在本地部署，浏览一下是否符合要求。

```shell
hexo g	#生成博客网站资源内容
hexo s 	#也可以写作hexo server，部署至本地浏览
```

接下来就是最基本的本地仓库初始化，添加至暂存区，提交然后挂载远程仓库，再推送至远程仓库。为保证自定义资源能够正确加载，建议将`public`目录一同推送。

为使GitHub-Page能够在推送完成后根据最新仓库内容即时重新部署后台服务，进入仓库`Settings-Pages-Source`选择`GitHub Actions`。

![](/../基于Hexo框架搭建博客/Setting.jpg)

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

下载插件`hexo-asset-image`进行图片显示的修复。

```shell
npm install https://github.com/CodeFalling/hexo-asset-image
```

然后更改 `.config.yml` 中的，添加以下匹配值，功能是建立新文章的时候会添加一个同名的文件夹，该文件夹将作为本文章的图片存储目录。

```yml
post_asset_folder: true
```

然后修改`scaffolds`文件夹下的`post.md`，添加哈希值`typora-root-url: {{title}}`，这样我们在用`typora`的时候会使图片默认路径为同文件夹下的同名文件夹。

需要特别注意的一点是，图片格式应为`.jpg`。

#### 2.新建文章无法同步更新

下载插件`hexo-renderer-marked`进行图片显示的修复。

```shell
npm install hexo-renderer-marked
```

然后在`.config.yml` 下找到`post_asset_folder: true`，在该配置项下新建配置项`marked`。

```yml
marked:
  prependRoot: true
  postAsset: true
```

#### 3.更新时间先于创建时间

进入`.config.yml` ，对`timezone`进行配置，修改为中国上海的时区即可正常展示。

```yml
timezone: 'Asia/Shanghai'
```

### 四、写在最后

虽然经历了不少坎坷，也踩了不少的坑，终于在最后成功搭建好了属于自己的博客网站，每次打开都还是会感觉到有种莫名的成就感。
