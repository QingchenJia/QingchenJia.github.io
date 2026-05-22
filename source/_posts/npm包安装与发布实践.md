---
title: npm包安装与发布实践
typora-root-url: npm包安装与发布实践
date: 2026-05-22 13:52:16
categories:
    - 开发工具
tags:
    - npm
    - Node.js
    - 包管理
---

### 一、引言

在`Node.js`生态中，`npm`既是默认的包管理工具，也是最常见的包发布平台。日常开发里，我们经常会通过`npm install`安装第三方依赖；当自己封装了工具库、组件库、脚手架或通用模块之后，也可以把它发布到`npm registry`，让其他项目直接通过包名安装使用。

本文围绕三个实践问题展开：

- 如何通过`npm`安装项目依赖和全局命令行工具；
- 如何从零准备并发布一个自己的`npm`包；
- 如何切换镜像源，并对照理解`pnpm`、`yarn`、`bun`等包管理器的常用命令。

文章默认已经安装`Node.js`和`npm`。如果还没有安装，可以先到`Node.js`官网下载安装`LTS`版本，安装完成后执行以下命令确认环境：

```bash
node -v
npm -v
```

### 二、npm的基本概念

#### 1. npm是什么

`npm`通常包含两层含义：

- `npm CLI`：本机终端中的命令行工具，例如`npm install`、`npm run build`、`npm publish`；
- `npm registry`：线上包仓库，用于托管和分发`JavaScript`包。

当我们执行：

```bash
npm install axios
```

本质上就是让`npm CLI`从配置的`registry`中下载`axios`包，并把它安装到当前项目的`node_modules`目录，同时更新`package.json`和`package-lock.json`。

#### 2. package.json的作用

`package.json`是一个`Node.js`项目的核心描述文件，常见字段如下：

```json
{
    "name": "my-utils",
    "version": "1.0.0",
    "description": "A small JavaScript utility library",
    "main": "dist/index.cjs",
    "module": "dist/index.js",
    "types": "dist/index.d.ts",
    "scripts": {
        "build": "tsup src/index.ts --format cjs,esm --dts",
        "test": "vitest",
        "prepublishOnly": "npm run build"
    },
    "keywords": ["utils", "javascript"],
    "author": "your-name",
    "license": "MIT",
    "files": ["dist", "README.md", "LICENSE"]
}
```

几个字段尤其重要：

- `name`：包名，发布后用户通过这个名称安装；
- `version`：版本号，每次发布都必须递增；
- `main`：`CommonJS`入口；
- `module`：`ES Module`入口；
- `types`：`TypeScript`类型声明入口；
- `scripts`：项目脚本，常用于构建、测试、发布前检查；
- `files`：声明发布到`npm`时包含哪些文件。

### 三、使用npm安装包

#### 1. 初始化项目

进入项目目录后，可以使用以下命令创建`package.json`：

```bash
npm init
```

如果希望快速生成默认配置，可以加上`-y`：

```bash
npm init -y
```

#### 2. 安装生产依赖

生产依赖指项目运行时需要使用的依赖，例如`axios`、`lodash`、`dayjs`：

```bash
npm install axios
```

简写形式：

```bash
npm i axios
```

安装完成后，依赖会被写入`package.json`中的`dependencies`：

```json
{
    "dependencies": {
        "axios": "^1.0.0"
    }
}
```

#### 3. 安装开发依赖

开发依赖只在开发、构建、测试阶段使用，例如`typescript`、`vite`、`eslint`、`vitest`：

```bash
npm install typescript -D
```

等价写法：

```bash
npm install typescript --save-dev
```

安装后会写入`devDependencies`：

```json
{
    "devDependencies": {
        "typescript": "^5.0.0"
    }
}
```

#### 4. 安装指定版本

有时为了兼容旧项目，需要安装指定版本：

```bash
npm install axios@1.6.8
```

也可以安装某个标签版本：

```bash
npm install react@latest
npm install react@next
```

#### 5. 全局安装命令行工具

全局安装适合命令行工具，例如`http-server`、`serve`、`typescript`：

```bash
npm install -g serve
```

安装后可以在终端中直接执行：

```bash
serve -v
```

全局包建议只安装真正需要作为命令使用的工具。普通项目依赖应优先安装在当前项目中，避免不同项目之间互相影响。

#### 6. 卸载和更新依赖

卸载依赖：

```bash
npm uninstall axios
```

更新依赖：

```bash
npm update axios
```

查看过期依赖：

```bash
npm outdated
```

查看某个包的已发布版本：

```bash
npm view axios versions
```

### 四、npm脚本的使用

`package.json`中的`scripts`可以把常用命令收束起来，避免每次输入一长串命令。

```json
{
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview",
        "lint": "eslint .",
        "test": "vitest"
    }
}
```

执行脚本：

```bash
npm run dev
npm run build
npm run test
```

其中`start`、`test`等少数脚本可以省略`run`：

```bash
npm start
npm test
```

如果要给脚本继续传递参数，可以使用`--`：

```bash
npm run test -- --watch
```

### 五、发布npm包前的准备

#### 1. 创建包项目

新建目录并初始化：

```bash
mkdir my-utils
cd my-utils
npm init -y
```

假设我们创建一个简单工具函数：

```bash
mkdir src
```

`src/index.js`内容示例：

```js
function isEmpty(value) {
    return value === null || value === undefined || value === "";
}

module.exports = {
    isEmpty,
};
```

对应的`package.json`可以简化为：

```json
{
    "name": "my-utils-demo",
    "version": "1.0.0",
    "description": "A simple npm package demo",
    "main": "src/index.js",
    "keywords": ["utils", "demo"],
    "author": "your-name",
    "license": "MIT"
}
```

包名需要全局唯一。如果普通包名已经被占用，可以使用作用域包名：

```json
{
    "name": "@your-scope/my-utils"
}
```

#### 2. 编写README

`README.md`会展示在`npm`包详情页中，建议至少包含安装方式和基本用法：

````markdown
# my-utils-demo

## Install

```bash
npm install my-utils-demo
```

## Usage

```js
const { isEmpty } = require("my-utils-demo");

console.log(isEmpty(""));
```
````

如果需要在文档示例里展示完整的`README.md`内容，可以像上面这样使用四个反引号包裹外层代码块，避免和内部代码块冲突。

#### 3. 控制发布文件

发布包时不要把所有源码、测试文件、临时文件都上传到`npm`。推荐在`package.json`中使用`files`白名单：

```json
{
    "files": ["src", "dist", "README.md", "LICENSE"]
}
```

也可以使用`.npmignore`排除文件：

```text
node_modules
coverage
.vscode
.idea
*.log
```

如果同时存在`files`和`.npmignore`，通常优先使用`files`让发布内容更可控。

#### 4. 发布前本地预检

发布前先查看最终会被打包进`npm`包的文件：

```bash
npm pack --dry-run
```

这个命令非常重要。它可以帮助你提前发现这些问题：

- 是否遗漏了`dist`目录；
- 是否错误包含了测试数据、截图、缓存文件；
- `main`、`module`、`types`等入口是否指向真实存在的文件；
- 包体积是否异常过大。

如果项目有构建和测试脚本，发布前建议执行：

```bash
npm run build
npm test
```

### 六、发布npm包

#### 1. 注册并登录npm账号

发布包前需要先注册`npm`账号，然后在终端登录：

```bash
npm login
```

登录后可以检查当前账号：

```bash
npm whoami
```

如果开启了双因素认证，发布时可能还需要输入一次性验证码。

#### 2. 确认当前registry

发布官方`npm`包时，应确保当前源是官方源：

```bash
npm config get registry
```

如果当前是国内镜像源，需要切回官方源：

```bash
npm config set registry https://registry.npmjs.org/
```

镜像源通常只用于加速安装，不负责发布包到官方`npm`仓库。

#### 3. 发布普通包

确认包名、版本号、发布文件都没有问题后执行：

```bash
npm publish
```

如果包名未被占用且账号权限正常，发布成功后就可以安装使用：

```bash
npm install my-utils-demo
```

#### 4. 发布作用域包

作用域包名类似`@scope/package-name`。如果要公开发布，需要加上`--access public`：

```bash
npm publish --access public
```

否则作用域包默认可能按私有包处理，而私有包通常需要对应的付费权限。

#### 5. 更新版本并再次发布

同一个版本号不能重复发布。修改代码后，需要先升级版本号：

```bash
npm version patch
```

常见版本升级命令：

```bash
npm version patch
npm version minor
npm version major
```

含义如下：

| 命令                | 示例变化           | 适用场景                 |
| ------------------- | ------------------ | ------------------------ |
| `npm version patch` | `1.0.0` -> `1.0.1` | 修复问题，兼容旧版本     |
| `npm version minor` | `1.0.0` -> `1.1.0` | 新增功能，兼容旧版本     |
| `npm version major` | `1.0.0` -> `2.0.0` | 破坏性变更，不兼容旧版本 |

版本更新后重新发布：

```bash
npm publish
```

#### 6. 撤销和废弃包

如果某个版本有问题，优先发布新版本修复。对于已经被使用的包，不建议频繁删除版本。

标记某个版本废弃：

```bash
npm deprecate my-utils-demo@1.0.0 "This version has a critical bug, please upgrade."
```

撤销发布需要谨慎：

```bash
npm unpublish my-utils-demo@1.0.0
```

`unpublish`存在时间和规则限制，而且会影响已经依赖该版本的用户。生产包更推荐使用`deprecate`提示用户升级。

### 七、切换npm镜像源

#### 1. 查看当前源

```bash
npm config get registry
```

#### 2. 切换到官方源

```bash
npm config set registry https://registry.npmjs.org/
```

#### 3. 切换到国内镜像源

常见国内镜像源示例：

```bash
npm config set registry https://registry.npmmirror.com/
```

切换后可以再次确认：

```bash
npm config get registry
```

也可以通过安装一个包来测试速度：

```bash
npm install lodash
```

#### 4. 临时使用指定源

如果不想修改全局配置，可以在单次安装时指定：

```bash
npm install axios --registry=https://registry.npmmirror.com/
```

这种方式适合临时处理某个网络环境下的安装问题。

#### 5. 使用nrm管理镜像源

`nrm`是一个常见的`npm registry`管理工具，可以快速切换源：

```bash
npm install -g nrm
```

查看可用源：

```bash
nrm ls
```

切换源：

```bash
nrm use npm
nrm use taobao
```

测试源速度：

```bash
nrm test
```

需要注意的是，发布包到官方`npm`前仍应切回官方源。

### 八、pnpm、yarn、bun的常用命令对照

除了`npm`，前端项目中还经常会遇到`pnpm`、`yarn`和`bun`。

它们的定位大致相同，都是包管理器，但实现方式和生态习惯不同：

- `npm`：`Node.js`默认包管理器，通用性最好；
- `pnpm`：通过内容寻址存储和硬链接节省磁盘空间，安装速度快，依赖结构更严格；
- `yarn`：历史上常用于大型前端项目，`Yarn Classic`和`Yarn Berry`配置方式存在差异；
- `bun`：同时提供运行时、打包器、测试工具和包管理能力，速度快，但项目兼容性需要按实际情况验证。

#### 1. 安装包管理器

安装`pnpm`：

```bash
npm install -g pnpm
```

安装`yarn`：

```bash
npm install -g yarn
```

安装`bun`可以参考其官方安装方式。不同系统安装命令不同，安装后通过以下命令确认：

```bash
bun -v
```

#### 2. 常用命令对照

| 操作         | npm                    | pnpm                | yarn                    | bun                     |
| ------------ | ---------------------- | ------------------- | ----------------------- | ----------------------- |
| 初始化项目   | `npm init`             | `pnpm init`         | `yarn init`             | `bun init`              |
| 安装全部依赖 | `npm install`          | `pnpm install`      | `yarn install`          | `bun install`           |
| 安装生产依赖 | `npm install axios`    | `pnpm add axios`    | `yarn add axios`        | `bun add axios`         |
| 安装开发依赖 | `npm install vite -D`  | `pnpm add vite -D`  | `yarn add vite -D`      | `bun add vite -d`       |
| 删除依赖     | `npm uninstall axios`  | `pnpm remove axios` | `yarn remove axios`     | `bun remove axios`      |
| 运行脚本     | `npm run build`        | `pnpm run build`    | `yarn build`            | `bun run build`         |
| 全局安装     | `npm install -g serve` | `pnpm add -g serve` | `yarn global add serve` | `bun add -g serve`      |
| 查看过期依赖 | `npm outdated`         | `pnpm outdated`     | `yarn outdated`         | `bun outdated`          |
| 更新依赖     | `npm update`           | `pnpm update`       | `yarn upgrade`          | `bun update`            |
| 发布包       | `npm publish`          | `pnpm publish`      | `yarn npm publish`      | 通常仍使用`npm publish` |

#### 3. 镜像源配置对照

`npm`配置：

```bash
npm config set registry https://registry.npmmirror.com/
```

`pnpm`配置：

```bash
pnpm config set registry https://registry.npmmirror.com/
```

`Yarn Classic`配置：

```bash
yarn config set registry https://registry.npmmirror.com/
```

`Yarn Berry`项目中更常见的是在`.yarnrc.yml`里配置：

```yaml
npmRegistryServer: "https://registry.npmmirror.com/"
```

`bun`可以通过环境变量或配置文件处理镜像源。简单场景下，也可以在项目中继续使用`npm`或`pnpm`负责依赖安装和发布。

#### 4. 不要混用锁文件

不同包管理器会生成不同的锁文件：

| 包管理器 | 锁文件              |
| -------- | ------------------- |
| npm      | `package-lock.json` |
| pnpm     | `pnpm-lock.yaml`    |
| yarn     | `yarn.lock`         |
| bun      | `bun.lock`          |

一个项目建议固定一种包管理器，不要今天用`npm install`、明天用`pnpm install`、后天又用`yarn install`。混用会导致锁文件不一致，进而出现本地和部署环境依赖版本不一致的问题。

如果项目已经明确使用`pnpm`，团队成员就应统一执行：

```bash
pnpm install
pnpm run dev
pnpm run build
```

### 九、发布包时的常见问题

#### 1. 包名已存在

发布时如果提示包名已存在，需要更换包名，或者使用作用域包：

```json
{
    "name": "@your-name/my-utils"
}
```

然后执行：

```bash
npm publish --access public
```

#### 2. 版本号重复

如果提示当前版本已经发布，需要升级版本号：

```bash
npm version patch
npm publish
```

#### 3. 登录状态异常

可以先检查当前账号：

```bash
npm whoami
```

如果未登录，重新执行：

```bash
npm login
```

#### 4. 发布到了错误的源

如果当前源不是官方源，发布可能失败。发布前确认：

```bash
npm config get registry
```

切回官方源：

```bash
npm config set registry https://registry.npmjs.org/
```

#### 5. 发布内容缺文件

如果用户安装后提示找不到入口文件，通常是`files`、`.npmignore`或构建产物配置有问题。发布前使用：

```bash
npm pack --dry-run
```

确认`main`、`module`、`types`指向的文件都在最终发布列表中。

### 十、实践建议

日常项目中，可以按以下习惯使用`npm`和相关包管理器：

- 普通项目优先固定一种包管理器，并提交对应锁文件；
- 安装依赖时区分`dependencies`和`devDependencies`；
- 全局包只安装命令行工具，项目依赖尽量安装到项目本地；
- 国内网络环境下可以使用镜像源加速安装，但发布包前切回官方源；
- 发布前始终执行`npm pack --dry-run`检查发布内容；
- 每次发布都遵循语义化版本规则，避免随意使用`major`版本；
- 出现问题时优先发布新版本修复，谨慎使用`unpublish`。

对于个人工具库、小型组件库或团队内部通用模块，掌握`npm`发布流程之后，就可以把重复代码沉淀成标准依赖包。后续项目只需要通过包管理器安装和升级，而不必在多个仓库之间复制粘贴代码。
