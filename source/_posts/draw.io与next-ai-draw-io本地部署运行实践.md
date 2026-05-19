---
title: draw.io与next-ai-draw-io本地部署运行实践
typora-root-url: draw.io与next-ai-draw-io本地部署运行实践
date: 2026-05-18 15:20:39
categories:
    - 开发工具
tags:
    - draw.io
    - next-ai-draw-io
    - AI工具
---

### 一、引言

在开发、部署和沟通方案时，图示往往比大段文字更直观。常见的系统架构图、接口调用流程图、数据库ER图、网络拓扑图、CI/CD流水线图、业务流程图，都可以用`draw.io`完成。

`draw.io`本身足够灵活，但问题也很明显：节点、连线、布局、样式都要手动调整。对于开发者来说，很多图并不难理解，真正耗时的是把脑子里的结构一点点拖拽到画布上。

[`next-ai-draw-io`](https://github.com/DayuanJiang/next-ai-draw-io)的思路正好切中这个痛点：在`draw.io`画布旁边集成AI对话，让模型根据自然语言生成和修改`draw.io`图表。它生成的不是一张静态图片，而是可继续编辑的`draw.io`图表，因此很适合开发文档、技术方案和团队评审。

本文会先介绍`draw.io`的基本使用场景，再围绕`next-ai-draw-io`讲解本地源码运行、`Docker`运行、模型配置、私有化`draw.io`嵌入以及实际使用方法。

### 二、draw.io是什么

`draw.io`也常以`diagrams.net`的名字出现，它是一款通用的图表和白板绘制工具。官方提供在线版本、桌面版本和容器化部署方式，也可以把图表保存为本地文件。

常见使用入口有三种：

| 方式 | 入口 | 适合场景 |
| --- | --- | --- |
| 在线版 | `https://app.diagrams.net` | 临时绘图、无需安装、快速导出 |
| 桌面版 | `https://get.diagrams.net` | 离线绘图、本地文件管理 |
| Docker版 | `jgraph/drawio`镜像 | 内网部署、团队统一访问、减少外部依赖 |

开发者常用`draw.io`绘制以下内容：

- 系统架构图：描述前端、后端、网关、数据库、缓存、消息队列等组件关系；
- 部署拓扑图：描述服务器、容器、端口、域名、负载均衡和存储；
- 流程图：描述登录、支付、审批、消息投递等业务流程；
- 时序图：描述多个服务之间的调用顺序；
- ER图：描述数据表、字段和实体关系；
- 运维图：描述网络、安全组、监控、日志和备份链路。

`draw.io`文件通常以`.drawio`保存，本质上是结构化的XML数据。这个特性也让AI生成图表成为可能：只要模型能够生成符合`draw.io`格式的XML，就可以把图表重新渲染到画布中，并且后续仍然可以继续编辑。

### 三、next-ai-draw-io是什么

`next-ai-draw-io`是一个基于`Next.js`的AI图表生成工具。它把AI对话、`draw.io`画布和图表历史记录整合到一个Web应用中，用户可以通过自然语言创建、修改和增强图表。

它主要解决这几个问题：

1. 降低起图成本  
   只需要描述“我要画一个什么图”，AI就可以先生成第一版图表。

2. 支持持续修改  
   初版图不满意时，可以继续让AI“增加Redis缓存层”“把同步调用改成消息队列”“将部署方式改成Docker Compose”。

3. 输出可编辑文件  
   生成结果可以继续在`draw.io`中手动调整，而不是只能拿到一张不可编辑图片。

4. 支持多模型提供商  
   项目支持`OpenAI`、`Anthropic`、`Google Gemini`、`DeepSeek`、`SiliconFlow`、`OpenRouter`、`Ollama`、`Qwen`、`Kimi`等多种模型或兼容接口。

5. 支持图片、PDF和文本输入  
   可以上传已有图表截图、文档或文本内容，让AI从材料中提取结构并生成图示。

简单来说，`draw.io`负责专业绘图和后续编辑，`next-ai-draw-io`负责把“文字描述”转换成“可编辑图表草稿”。

### 四、环境准备

本地运行前建议准备以下环境：

| 环境 | 说明 |
| --- | --- |
| Git | 用于拉取项目源码 |
| Node.js | 建议使用`Node.js 20`或更高版本 |
| npm | 项目默认使用`npm install`安装依赖 |
| Docker | 可选，用于容器方式运行 |
| Docker Compose | 可选，用于同时运行`draw.io`和`next-ai-draw-io` |
| AI模型API Key | 至少准备一个可用模型提供商的API Key |

检查基础环境：

```bash
git --version
node -v
npm -v
docker version
docker compose version
```

如果只是源码方式运行，可以不安装`Docker`。如果希望后续使用容器部署，建议提前安装好`Docker Engine`和`Docker Compose`插件。

### 五、源码方式本地运行

#### 1.拉取项目源码

```bash
git clone https://github.com/DayuanJiang/next-ai-draw-io.git
cd next-ai-draw-io
```

#### 2.安装依赖

```bash
npm install
```

如果国内网络安装依赖较慢，可以临时切换`npm`镜像源：

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

依赖安装完成后，如果希望恢复官方源，可以执行：

```bash
npm config set registry https://registry.npmjs.org
```

#### 3.创建环境变量文件

项目提供了环境变量示例文件，可以复制为本地配置文件：

```bash
cp env.example .env.local
```

Windows PowerShell中可以使用：

```powershell
Copy-Item env.example .env.local
```

`.env.local`中至少需要配置一个模型提供商。下面以`OpenAI`为例：

```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

如果使用兼容`OpenAI`接口的代理或中转服务，可以额外配置：

```env
OPENAI_BASE_URL=https://your-openai-compatible-endpoint/v1
```

国内用户也可以选择`DeepSeek`：

```env
AI_PROVIDER=deepseek
AI_MODEL=deepseek-chat
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

如果使用`SiliconFlow`：

```env
AI_PROVIDER=siliconflow
AI_MODEL=deepseek-ai/DeepSeek-V3
SILICONFLOW_API_KEY=sk-xxxxxxxxxxxxxxxx
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
```

如果使用`Qwen`：

```env
AI_PROVIDER=qwen
AI_MODEL=qwen-plus
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxx
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

图表生成对模型能力要求比较高，因为模型需要生成结构化的`draw.io XML`。如果图表内容复杂，优先选择推理、长文本和结构化输出能力更强的模型。对于本地`Ollama`模型，除非机器性能较强并且模型能力足够，否则生成复杂图表的稳定性通常不如云端大模型。

#### 4.启动开发服务

```bash
npm run dev
```

项目开发服务默认运行在：

```text
http://localhost:6002
```

打开浏览器访问该地址，就可以看到`next-ai-draw-io`页面。左侧通常是AI对话区域，右侧是`draw.io`画布预览区域。

#### 5.生产构建和启动

如果希望以生产模式运行，可以执行：

```bash
npm run build
npm run start
```

项目的`start`脚本默认监听：

```text
http://localhost:6001
```

源码方式适合开发、调试和二次修改。如果只是想快速体验，后文的`Docker`方式更直接。

### 六、Docker方式运行

#### 1.使用预构建镜像快速运行

项目提供了`GHCR`镜像，可以直接通过`docker run`启动：

```bash
docker run -d \
    --name next-ai-draw-io \
    --restart unless-stopped \
    -p 3000:3000 \
    -e AI_PROVIDER=openai \
    -e AI_MODEL=gpt-4o \
    -e OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx \
    ghcr.io/dayuanjiang/next-ai-draw-io:latest
```

启动后访问：

```text
http://localhost:3000
```

查看容器状态和日志：

```bash
docker ps
docker logs -f --tail=200 next-ai-draw-io
```

停止并删除容器：

```bash
docker stop next-ai-draw-io
docker rm next-ai-draw-io
```

#### 2.使用.env文件管理配置

命令行中直接写API Key不便于维护，也容易泄露到命令历史中。更推荐使用`.env`文件。

创建`.env`：

```bash
cat > .env <<'EOF'
AI_PROVIDER=deepseek
AI_MODEL=deepseek-chat
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
EOF
```

通过`--env-file`启动容器：

```bash
docker run -d \
    --name next-ai-draw-io \
    --restart unless-stopped \
    -p 3000:3000 \
    --env-file .env \
    ghcr.io/dayuanjiang/next-ai-draw-io:latest
```

`.env`文件中包含密钥，不能提交到Git仓库，也不要上传到公开网盘或聊天窗口。

#### 3.同时部署draw.io服务

默认情况下，`next-ai-draw-io`会使用`https://embed.diagrams.net`作为嵌入式`draw.io`画布。如果服务器网络无法访问该地址，或者希望尽量内网化，可以自己运行`draw.io`容器。

单独运行官方`draw.io`容器：

```bash
docker run -d \
    --name drawio \
    --restart unless-stopped \
    -p 8080:8080 \
    -p 8443:8443 \
    jgraph/drawio:latest
```

访问：

```text
http://localhost:8080/?offline=1&https=0
```

其中`offline=1`会禁用云存储能力，更适合只使用本地文件的场景。

#### 4.使用Docker Compose构建离线部署版本

如果希望`next-ai-draw-io`使用自托管`draw.io`，需要在构建阶段设置`NEXT_PUBLIC_DRAWIO_BASE_URL`。这个变量是前端构建变量，修改后必须重新构建镜像。

在项目根目录创建`.env`：

```env
AI_PROVIDER=deepseek
AI_MODEL=deepseek-chat
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

创建`compose.yml`：

```yaml
services:
  drawio:
    image: jgraph/drawio:latest
    container_name: drawio
    restart: unless-stopped
    ports:
      - "8080:8080"

  next-ai-draw-io:
    build:
      context: .
      args:
        - NEXT_PUBLIC_DRAWIO_BASE_URL=http://localhost:8080
    container_name: next-ai-draw-io
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - drawio
```

启动服务：

```bash
docker compose up -d --build
docker compose ps
```

访问：

```text
http://localhost:3000
```

如果部署在远程服务器上，`NEXT_PUBLIC_DRAWIO_BASE_URL`不能写成`http://drawio:8080`。原因是这个地址最终会被浏览器访问，浏览器无法解析`Docker Compose`内部服务名。应写成浏览器能访问到的地址，例如：

```yaml
args:
  - NEXT_PUBLIC_DRAWIO_BASE_URL=http://服务器IP:8080
```

如果使用域名和反向代理，也可以写成：

```yaml
args:
  - NEXT_PUBLIC_DRAWIO_BASE_URL=https://drawio.example.com
```

修改该地址后，需要重新构建：

```bash
docker compose up -d --build
```

### 七、AI模型配置建议

#### 1.单模型配置

最简单的方式是在`.env.local`或`.env`中配置一个模型提供商和一个模型。

```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

如果只配置了一个提供商的API Key，项目可以自动检测提供商。但为了减少误判，建议仍然显式写上`AI_PROVIDER`和`AI_MODEL`。

#### 2.多个模型配置

如果是团队内部部署，可以使用`ai-models.json`提供多模型配置。这样使用者不需要在浏览器端填写自己的API Key，而是直接选择管理员配置好的模型。

创建`ai-models.json`：

```json
{
  "providers": [
    {
      "name": "OpenAI Production",
      "provider": "openai",
      "models": ["gpt-4o", "gpt-4o-mini"],
      "default": true
    },
    {
      "name": "DeepSeek",
      "provider": "deepseek",
      "models": ["deepseek-chat"],
      "apiKeyEnv": "DEEPSEEK_API_KEY",
      "baseUrlEnv": "DEEPSEEK_BASE_URL"
    }
  ]
}
```

然后在环境变量中指定配置文件路径：

```env
AI_MODELS_CONFIG_PATH=/app/ai-models.json
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

`Docker`运行时挂载该文件：

```bash
docker run -d \
    --name next-ai-draw-io \
    --restart unless-stopped \
    -p 3000:3000 \
    --env-file .env \
    -v $(pwd)/ai-models.json:/app/ai-models.json:ro \
    ghcr.io/dayuanjiang/next-ai-draw-io:latest
```

Windows PowerShell中可以将`$(pwd)`替换为当前目录变量：

```powershell
docker run -d `
    --name next-ai-draw-io `
    --restart unless-stopped `
    -p 3000:3000 `
    --env-file .env `
    -v ${PWD}\ai-models.json:/app/ai-models.json:ro `
    ghcr.io/dayuanjiang/next-ai-draw-io:latest
```

#### 3.温度参数

图表生成更关注结构稳定和格式正确，通常不需要太高随机性。可以设置：

```env
TEMPERATURE=0
```

部分推理模型不支持温度参数，遇到相关报错时可以删除该变量，让模型使用默认设置。

### 八、基本使用方法

#### 1.从自然语言生成图表

启动服务并打开页面后，可以直接在对话框输入需求。例如：

```text
画一个Spring Boot微服务系统架构图，包含前端Vue、Nginx网关、用户服务、订单服务、商品服务、MySQL、Redis、RabbitMQ和Nacos。要求区分访问层、业务服务层和基础设施层。
```

AI会生成一版`draw.io`图表，并在画布中展示。此时建议先看结构是否正确，而不是马上纠结样式。

如果结构没问题，可以继续补充：

```text
把服务之间的同步HTTP调用用实线表示，把RabbitMQ异步消息调用用虚线表示，并在连线上标注调用含义。
```

如果布局不清晰，可以继续要求：

```text
重新整理布局，让访问链路从左到右排列，基础设施组件放在底部，减少交叉连线。
```

#### 2.基于已有图表继续修改

`next-ai-draw-io`适合多轮迭代，不必追求一次生成完美图表。比较稳定的流程是：

1. 第一轮只描述图表类型和核心组件；
2. 第二轮补充连线关系和分层；
3. 第三轮调整布局、颜色和标注；
4. 最后在`draw.io`中手动微调细节。

例如先生成部署图：

```text
生成一个Docker Compose部署拓扑图，包含Nginx、Spring Boot API、MySQL、Redis和RabbitMQ，每个服务显示容器名、宿主机端口和容器端口。
```

再让AI补充数据卷：

```text
在图中增加宿主机挂载目录，MySQL挂载到/opt/docker/mysql/data，Redis挂载到/opt/docker/redis/data，RabbitMQ挂载到/opt/docker/rabbitmq/data。
```

#### 3.上传图片或文档生成图表

如果已有手绘草图、截图或文档，可以上传给`next-ai-draw-io`，让AI先识别内容再生成图表。适合这几类场景：

- 把白板照片转换成可编辑架构图；
- 把接口文档转换成流程图；
- 把部署说明转换成拓扑图；
- 把已有图片图表转换成`draw.io`草稿。

上传图片时，建议在提示词里说明目标：

```text
请参考这张截图，重新生成一个可编辑的draw.io架构图。保留主要组件和连线关系，但使用更整齐的左右布局。
```

上传文档时，建议明确要提取的对象：

```text
请从这份部署文档中提取服务、端口、数据库和缓存关系，生成一张部署架构图。
```

#### 4.导出和二次编辑

生成图表后，可以按实际需要导出：

- `.drawio`：保留完整编辑能力，适合后续继续修改；
- `.svg`：适合插入网页、Markdown文档或技术博客；
- `.png`：适合放入PPT、飞书、企业微信和普通文档；
- `.pdf`：适合正式方案文档或评审材料。

如果团队已经习惯使用`draw.io Desktop`，可以先在`next-ai-draw-io`中生成初稿，再导出`.drawio`文件，用桌面版继续精修。

### 九、提示词写法

#### 1.说明图表类型

不要只说“画一张系统图”，最好明确图表类型：

```text
请画一张微服务系统架构图。
```

```text
请画一张用户登录流程图。
```

```text
请画一张订单服务的数据库ER图。
```

图表类型越明确，AI越容易选择正确的布局和图形元素。

#### 2.列出核心组件

把必须出现的组件直接列出来：

```text
图中必须包含：Web前端、Nginx、API网关、用户服务、订单服务、库存服务、MySQL、Redis、RabbitMQ、Prometheus、Grafana。
```

如果有分层要求，也要一起说明：

```text
请按访问层、网关层、业务服务层、数据层、监控层分组。
```

#### 3.说明连线含义

连线是技术图表的核心，不要只让AI“自由发挥”：

```text
用户请求从浏览器进入Nginx，再转发到API网关。API网关调用用户服务、订单服务和库存服务。订单服务写入MySQL，并通过RabbitMQ发送库存扣减消息。库存服务消费消息后更新库存。
```

也可以指定线型：

```text
同步HTTP调用使用实线，异步消息使用虚线，监控采集链路使用点线。
```

#### 4.限制复杂度

一次塞太多信息，图表很容易混乱。可以加上限制条件：

```text
只画核心链路，不要画异常分支。
```

```text
每个分组最多显示5个节点，复杂内容用注释框说明。
```

```text
优先保证结构清晰，不要使用过多颜色。
```

#### 5.让AI按步骤修改

修改图表时，不要一次要求“全部优化”。更稳妥的方式是分步：

```text
第一步，只调整节点布局，不要修改节点名称和连线。
```

```text
第二步，给每条连线增加协议或数据流向说明。
```

```text
第三步，统一颜色：访问层蓝色，业务层绿色，数据层橙色，监控层紫色。
```

这种方式更容易得到可控结果。

### 十、MCP方式扩展使用

`next-ai-draw-io`还提供了`MCP Server`，可以让支持`MCP`的AI客户端直接生成和编辑`draw.io`图表。对于经常使用`Claude Desktop`、`Cursor`、`VS Code`或`Claude Code CLI`的开发者，这是一种更贴近编码工作流的方式。

通用`MCP`配置示例：

```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

`Claude Code CLI`可以使用：

```bash
claude mcp add drawio -- npx @next-ai-drawio/mcp-server@latest
```

配置完成后，可以在AI客户端中直接提出需求：

```text
Create a flowchart showing user authentication with login, MFA, and session management.
```

图表会在浏览器中实时预览，并且可以导出为`.drawio`文件。这个能力适合把“写文档”和“生成图表”合并到同一个AI工作流里。

### 十一、常见问题

#### 1.页面可以打开，但画布区域空白

优先检查浏览器是否能访问`embed.diagrams.net`。如果网络环境无法访问，可以改用自托管`draw.io`容器，并在构建时设置`NEXT_PUBLIC_DRAWIO_BASE_URL`。

需要注意：`NEXT_PUBLIC_DRAWIO_BASE_URL`是构建期变量，不是普通运行时变量。改完以后必须重新执行：

```bash
docker compose up -d --build
```

#### 2.Docker Compose中写了drawio服务名但浏览器访问失败

不要把`NEXT_PUBLIC_DRAWIO_BASE_URL`写成：

```text
http://drawio:8080
```

这个地址只在`Docker`内部网络中可用，用户浏览器无法解析。应该改成浏览器能访问的地址：

```text
http://localhost:8080
http://服务器IP:8080
https://drawio.example.com
```

#### 3.AI没有响应或提示模型错误

依次检查：

```bash
docker logs -f --tail=200 next-ai-draw-io
```

重点确认以下内容：

- API Key是否正确；
- `AI_PROVIDER`和`AI_MODEL`是否匹配；
- 是否需要配置`BASE_URL`；
- 当前模型是否支持较长结构化输出；
- 账号是否有余额或调用权限；
- 服务器能否访问模型接口。

#### 4.生成的图表结构混乱

这通常不是部署问题，而是提示词过于宽泛。可以尝试：

- 先生成核心组件，再逐步补充细节；
- 明确图表类型、分层、组件和连线含义；
- 限制节点数量；
- 要求“保持现有节点不变，只调整布局”；
- 换用能力更强的模型。

#### 5.本地Ollama在Docker中访问失败

如果`next-ai-draw-io`运行在容器中，容器内的`localhost`指向容器自己，不是宿主机。Linux环境可以考虑使用宿主机IP，或者启动容器时添加：

```bash
--add-host=host.docker.internal:host-gateway
```

然后配置：

```env
AI_PROVIDER=ollama
AI_MODEL=qwen3:32b
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

具体模型名称以本机`ollama list`输出为准。

#### 6.端口被占用

源码开发模式默认使用`6002`端口，生产启动脚本默认使用`6001`端口，Docker示例使用`3000`端口。如果端口被占用，可以先查看占用进程：

```bash
lsof -i :3000
lsof -i :6002
```

Windows PowerShell中可以使用：

```powershell
netstat -ano | findstr :3000
```

然后更换端口映射，例如：

```bash
docker run -d \
    --name next-ai-draw-io \
    -p 13000:3000 \
    --env-file .env \
    ghcr.io/dayuanjiang/next-ai-draw-io:latest
```

访问地址变为：

```text
http://localhost:13000
```

### 十二、使用建议

`next-ai-draw-io`最适合生成“第一版可编辑图表”。实际工作中可以按下面的流程使用：

1. 先用文字描述图表类型、组件和关系；
2. 让AI生成第一版`draw.io`图；
3. 通过多轮对话调整分层、连线和布局；
4. 导出`.drawio`文件；
5. 在`draw.io`中手动修正细节；
6. 导出`SVG`或`PNG`插入文档、博客或PPT。

对于正式技术方案，仍然需要人工检查图中的服务名称、端口、调用方向、数据流和权限边界。AI可以显著提高起图效率，但不能替代架构设计和技术评审。

### 十三、总结

`draw.io`是一款成熟的通用图表工具，优点是自由度高、格式开放、导出方便，缺点是手动绘制效率有限。`next-ai-draw-io`通过把AI对话和`draw.io`画布结合起来，让开发者可以用自然语言生成可编辑图表初稿。

如果只是体验，推荐先使用源码方式运行：

```bash
git clone https://github.com/DayuanJiang/next-ai-draw-io.git
cd next-ai-draw-io
npm install
cp env.example .env.local
npm run dev
```

如果希望快速部署，推荐使用`Docker`镜像：

```bash
docker run -d \
    --name next-ai-draw-io \
    -p 3000:3000 \
    --env-file .env \
    ghcr.io/dayuanjiang/next-ai-draw-io:latest
```

如果希望内网化或避免依赖`embed.diagrams.net`，则通过`Docker Compose`同时部署`jgraph/drawio`，并在构建阶段设置`NEXT_PUBLIC_DRAWIO_BASE_URL`。

最终目标不是完全让AI替代画图，而是把最耗时的“从零开始摆节点、拉线、分层”交给AI，让开发者把精力放在结构判断和方案表达上。

### 十四、参考资料

- [next-ai-draw-io GitHub仓库](https://github.com/DayuanJiang/next-ai-draw-io)
- [next-ai-draw-io Docker运行文档](https://github.com/DayuanJiang/next-ai-draw-io/blob/main/docs/en/docker.md)
- [next-ai-draw-io AI Provider配置文档](https://github.com/DayuanJiang/next-ai-draw-io/blob/main/docs/en/ai-providers.md)
- [next-ai-draw-io MCP Server说明](https://github.com/DayuanJiang/next-ai-draw-io/blob/main/packages/mcp-server/README.md)
- [draw.io GitHub仓库](https://github.com/jgraph/drawio)
- [draw.io Docker镜像说明](https://github.com/jgraph/docker-drawio)
- [draw.io官方Docker部署文章](https://www.drawio.com/blog/diagrams-docker-app)
