---
title: 通过HTTP模式解决Codex请求5次重连问题
typora-root-url: 通过HTTP模式解决Codex请求5次重连问题
date: 2026-07-04 13:08:54
categories:
    - 开发工具
tags:
    - Codex
    - 代理
    - HTTP
---

### 一、问题背景

之前遇到 Codex CLI 请求失败、连续重连 5 次的问题时，一个可行方案是开启代理客户端的 **TUN 模式**，让终端流量被代理客户端完整接管。

但 TUN 模式也有一个副作用：它会接管更底层的网络流量，有时会影响 Git、npm、SSH 或其他开发工具的网络行为。尤其是在 Windows 环境下，如果只想让 Codex 正常走代理，同时希望 Git 继续使用系统代理模式，TUN 模式就不一定是最方便的选择。

本文补充另一种解决方法：通过修改 Codex CLI 配置，新增一个不使用 WebSocket 的 HTTP provider，让 Codex 改走 HTTP 流式传输。

### 二、问题原因

Codex CLI 默认可能会使用 WebSocket，也就是 `wss://` 协议连接 OpenAI 服务。

在部分代理环境中，系统代理模式对 HTTP 和 HTTPS 请求支持比较稳定，但对 WebSocket 请求支持不完整，或者终端里的 WebSocket 流量没有被正确代理。此时就可能出现：

- 浏览器访问正常；
- Git 命令可以正常使用；
- 系统代理已经开启；
- 但 Codex CLI 仍然反复重连，最后提示请求 5 次失败。

如果直接开启 TUN 模式，Codex 的 WebSocket 流量通常可以被接管，所以问题会消失。但如果不希望使用 TUN 模式，可以让 Codex CLI 不再使用 WebSocket，而是切换到 HTTP 流式传输。

### 三、解决思路

核心思路是新增一个自定义 provider：

```text
openai-http
```

并在这个 provider 中显式关闭 WebSocket 支持：

```toml
supports_websockets = false
```

这样 Codex CLI 会使用 HTTP 方式请求 OpenAI。对于很多代理客户端来说，HTTP 请求更容易被系统代理模式正确处理，因此不需要再强制开启 TUN 模式。

### 四、修改 Codex 配置文件

Codex CLI 的用户配置文件位于：

```text
C:\Users\<username>\.codex\config.toml
```

其中 `<username>` 表示当前 Windows 登录用户名，需要替换为自己电脑上的实际用户目录名称。

打开该文件，在配置中加入以下内容：

```toml
model_provider = "openai-http"

[model_providers.openai-http]
name = "OpenAI (HTTP)"
requires_openai_auth = true
supports_websockets = false
```

如果文件中已经存在 `model_provider` 配置，需要把它改成：

```toml
model_provider = "openai-http"
```

如果文件中已经存在其他 `[model_providers.xxx]` 配置，不需要删除，只要新增上面的 `[model_providers.openai-http]` 即可。

### 五、配置说明

这段配置的含义如下：

| 配置项                           | 说明                                              |
| -------------------------------- | ------------------------------------------------- |
| `model_provider = "openai-http"` | 指定 Codex 默认使用名为 `openai-http` 的 provider |
| `[model_providers.openai-http]`  | 新增一个自定义模型 provider                       |
| `name = "OpenAI (HTTP)"`         | provider 在 Codex 中显示的名称                    |
| `requires_openai_auth = true`    | 继续使用 OpenAI 登录认证                          |
| `supports_websockets = false`    | 禁用 WebSocket，强制使用 HTTP 流式传输            |

关键配置是最后一行：

```toml
supports_websockets = false
```

它可以避免 Codex CLI 继续尝试通过 `wss://` 建立连接，从而绕开某些代理客户端对 WebSocket 支持不稳定的问题。

### 六、重启并验证

修改完成后，关闭当前 PowerShell、Windows Terminal 或 VS Code 终端，然后重新打开。

进入项目目录后运行：

```bash
codex
```

或者执行一次非交互命令测试：

```bash
codex exec "测试 Codex 是否可以正常响应"
```

如果配置生效，通常可以看到：

- Codex 不再连续出现 5 次重连失败；
- 不需要开启 TUN 模式也能正常请求；
- 系统代理模式下 Codex 可以稳定连接；
- Git、npm、SSH 等工具的网络行为不再被 TUN 模式影响。

### 七、适用场景

这个方案适合以下情况：

- Windows 上使用 Codex CLI；
- 系统代理模式下 Git 可以正常使用，但 Codex 会重连失败；
- 开启 TUN 模式后 Codex 正常，但 Git 或其他开发工具受到影响；
- 代理客户端对 HTTP 请求支持正常，但对 WebSocket 请求支持不稳定；
- 希望 Codex 和 Git 都在系统代理模式下稳定工作。

如果你的代理客户端开启 TUN 模式后一切正常，也可以继续使用 TUN 模式，不一定要改配置。这个 HTTP provider 方案更适合“不想开 TUN”或“开 TUN 后影响其他工具”的场景。

### 八、排查建议

如果修改后仍然失败，可以继续检查：

- `config.toml` 文件路径是否正确；
- TOML 语法是否有多余缩进、中文引号或重复配置；
- 当前 Codex 是否已经重新打开终端；
- OpenAI 登录状态是否正常；
- 系统代理是否已经开启；
- 当前代理节点是否可用；
- 防火墙或安全软件是否拦截了终端程序。

可以先查看 Codex 登录状态：

```bash
codex login status
```

如果认证异常，重新登录：

```bash
codex logout
codex login
```

### 九、结论

Codex 请求 5 次重连失败，不一定只能通过 TUN 模式解决。如果问题来自 WebSocket 连接没有被系统代理稳定处理，可以通过新增 `openai-http` provider，让 Codex CLI 改走 HTTP 流式传输。

最终配置如下：

```toml
model_provider = "openai-http"

[model_providers.openai-http]
name = "OpenAI (HTTP)"
requires_openai_auth = true
supports_websockets = false
```

这个方案的优点是：Codex 可以继续使用系统代理模式，Git 也能保持正常工作，不必为了 Codex 单独开启 TUN 模式。
