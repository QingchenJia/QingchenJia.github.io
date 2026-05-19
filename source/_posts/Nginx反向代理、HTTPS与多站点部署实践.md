---
title: Nginx反向代理、HTTPS与多站点部署实践
typora-root-url: Nginx反向代理、HTTPS与多站点部署实践
date: 2026-05-19 12:20:05
categories:
    - 服务部署
tags:
    - Nginx
    - HTTPS
    - 反向代理
    - 多站点部署
---

### 一、引言

`Nginx`除了可以直接作为静态资源服务器使用以外，更常见的使用场景是作为反向代理网关部署在服务器入口处。用户访问公网域名时，请求先到达`Nginx`，再由`Nginx`根据域名、路径或端口转发到后端应用、前端静态站点、管理后台或其他内部服务。

在实际部署中，单台服务器上往往不只运行一个站点。例如个人博客、后台管理系统、接口服务、文档站点、监控面板可能都部署在同一台服务器上，只是分别绑定不同域名或子域名。此时就需要结合`server_name`、`location`、`proxy_pass`、`SSL`证书和多站点配置来统一管理访问入口。

本文以`Linux`服务器中的`Nginx`部署为背景，重点记录以下内容：

1. `Nginx`配置文件的推荐组织方式；
2. 使用`Nginx`代理后端服务；
3. 前端静态资源和后端接口同域部署；
4. 多个域名或子域名共用一台服务器；
5. 使用`Certbot`申请和自动续期`HTTPS`证书；
6. 常见部署问题和排查方式。

如果只是学习`Nginx`的安装和基础命令，可以先阅读前面的基础文章；本文更偏向生产部署实践。

### 二、部署前准备

#### 1.准备服务器环境

开始配置前，需要先确认服务器已经具备以下条件：

- 已安装`Nginx`；
- 域名已经完成解析，`A`记录或`AAAA`记录指向当前服务器；
- 云服务器安全组已经放行`80`和`443`端口；
- 系统防火墙已经放行`HTTP`和`HTTPS`访问；
- 后端应用已经在服务器本地端口正常运行。

查看`Nginx`版本：

```bash
nginx -v
```

检查配置文件是否正确：

```bash
sudo nginx -t
```

重新加载配置：

```bash
sudo systemctl reload nginx
```

如果不是通过`systemd`管理`Nginx`，也可以使用：

```bash
sudo nginx -s reload
```

#### 2.确认配置文件位置

不同安装方式下，`Nginx`配置文件位置可能略有差异。常见路径如下：

```text
/etc/nginx/nginx.conf
/etc/nginx/conf.d/*.conf
/etc/nginx/sites-available/
/etc/nginx/sites-enabled/
```

其中：

- `nginx.conf`是主配置文件；
- `conf.d`目录通常用于存放独立站点配置；
- `sites-available`和`sites-enabled`常见于`Debian`、`Ubuntu`发行版；
- 官方`Nginx`仓库安装的版本一般默认使用`conf.d/*.conf`。

为了降低不同发行版之间的差异，本文统一采用`/etc/nginx/conf.d/`目录存放站点配置。只要主配置文件的`http`块中包含下面这行配置即可：

```nginx
include /etc/nginx/conf.d/*.conf;
```

修改主配置文件前建议先备份：

```bash
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak
```

#### 3.准备示例服务

本文假设服务器上有如下服务：

```text
前端静态站点：/var/www/example-web
后端接口服务：http://127.0.0.1:8080
管理后台服务：http://127.0.0.1:3000
博客静态站点：/var/www/blog
```

示例域名规划如下：

```text
example.com        对外主站
api.example.com    接口服务
admin.example.com  管理后台
blog.example.com   博客站点
```

实际使用时，将文中的域名、端口和目录替换成自己的即可。

### 三、反向代理基础配置

#### 1.最小反向代理示例

假设后端应用运行在服务器本地`8080`端口，希望用户访问`api.example.com`时转发到该应用，可以创建配置文件：

```bash
sudo vim /etc/nginx/conf.d/api.example.com.conf
```

写入如下内容：

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

检查并重新加载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

此时访问：

```text
http://api.example.com
```

请求会先进入`Nginx`，然后由`Nginx`转发到`http://127.0.0.1:8080`。

#### 2.常用代理请求头说明

反向代理时建议保留真实请求信息，常用请求头如下：

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

含义如下：

- `Host`：保留用户访问的原始域名；
- `X-Real-IP`：记录客户端真实`IP`；
- `X-Forwarded-For`：记录代理链路中的客户端`IP`列表；
- `X-Forwarded-Proto`：记录用户访问时使用的是`http`还是`https`。

后端应用如果需要生成回调地址、判断安全协议、记录访问日志，通常会依赖这些请求头。

#### 3.代理接口路径

如果希望主站域名同时承载前端页面和后端接口，可以将`/api/`路径转发到后端服务：

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    root /var/www/example-web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

这里需要注意`proxy_pass`末尾的斜杠。

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080/;
}
```

这种写法会将`/api/user/list`转发为后端的`/user/list`。

如果写成：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080;
}
```

则会将`/api/user/list`原样转发为后端的`/api/user/list`。

在前后端联调时，接口路径不一致的问题很常见，优先检查`location`和`proxy_pass`后面是否带有斜杠。

### 四、前端静态站点部署

#### 1.部署普通静态站点

假设前端项目已经构建完成，产物位于`/var/www/example-web`：

```bash
sudo mkdir -p /var/www/example-web
sudo chown -R nginx:nginx /var/www/example-web
```

如果系统中运行`Nginx`的用户不是`nginx`，可通过以下命令查看：

```bash
ps -ef | grep nginx
```

常见用户可能是`nginx`、`www-data`或`nobody`。

站点配置如下：

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    root /var/www/example-web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    access_log /var/log/nginx/example.access.log;
    error_log /var/log/nginx/example.error.log;
}
```

其中`try_files $uri $uri/ /index.html;`适合`Vue Router`、`React Router`等前端路由模式。用户刷新`/user/profile`这类前端路由地址时，`Nginx`会回退到`index.html`，再由前端应用接管路由。

#### 2.部署纯文件站点

如果部署的是普通文档、图片或下载文件，不需要前端路由回退，可以写得更简单：

```nginx
server {
    listen 80;
    server_name static.example.com;

    root /var/www/static;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

这种配置不会把不存在的路径回退到`index.html`，更适合文件下载站、文档站点或传统静态页面。

### 五、多站点部署

#### 1.一个域名一个配置文件

多站点部署时，建议一个域名对应一个配置文件，便于维护和排错。例如：

```text
/etc/nginx/conf.d/example.com.conf
/etc/nginx/conf.d/api.example.com.conf
/etc/nginx/conf.d/admin.example.com.conf
/etc/nginx/conf.d/blog.example.com.conf
```

每个文件中单独声明`server`块：

```nginx
server {
    listen 80;
    server_name blog.example.com;

    root /var/www/blog;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

`Nginx`会根据用户请求中的`Host`头与`server_name`进行匹配，然后选择对应的`server`块处理请求。

#### 2.配置默认站点

当用户通过服务器`IP`访问，或者某个未配置的域名解析到了当前服务器时，`Nginx`会使用默认`server`处理请求。为了避免未知域名误命中业务站点，可以添加默认配置：

```nginx
server {
    listen 80 default_server;
    server_name _;

    return 444;
}
```

`444`是`Nginx`的特殊状态码，表示直接关闭连接，不向客户端返回响应内容。如果不希望使用该状态码，也可以返回普通的`404`：

```nginx
return 404;
```

#### 3.配置www跳转

如果希望统一使用裸域名`example.com`，可以将`www.example.com`跳转到主域名：

```nginx
server {
    listen 80;
    server_name www.example.com;

    return 301 http://example.com$request_uri;
}

server {
    listen 80;
    server_name example.com;

    root /var/www/example-web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

配置`HTTPS`后，跳转地址应改为：

```nginx
return 301 https://example.com$request_uri;
```

#### 4.同一服务绑定多个域名

如果多个域名访问的是同一个站点，可以在一个`server_name`中写多个域名：

```nginx
server {
    listen 80;
    server_name example.com www.example.com example.cn www.example.cn;

    root /var/www/example-web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

需要注意的是，后续申请`HTTPS`证书时，也要把这些域名都包含进去，否则未包含的域名会出现证书不匹配问题。

### 六、HTTPS证书配置

#### 1.申请证书前的检查项

使用`Let’s Encrypt`证书前，需要确认以下事项：

1. 域名已经正确解析到服务器；
2. 服务器`80`端口可以被公网访问；
3. `Nginx`中已经存在对应域名的`server_name`配置；
4. 云服务器安全组和系统防火墙已经放行`80`和`443`端口；
5. 当前服务器时间准确。

防火墙放行示例：

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# CentOS/Rocky Linux/AlmaLinux
sudo firewall-cmd --add-service=http --permanent
sudo firewall-cmd --add-service=https --permanent
sudo firewall-cmd --reload
```

#### 2.安装Certbot

`Certbot`是`Let’s Encrypt`官方推荐的证书申请和续期工具之一。不同发行版安装方式略有区别，以下给出常见方式。

`Ubuntu`、`Debian`可以使用：

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

`CentOS`、`Rocky Linux`、`AlmaLinux`等`RedHat`系发行版可以使用：

```bash
sudo dnf install -y certbot python3-certbot-nginx
```

如果系统软件源中的`Certbot`版本过旧，可以参考`Certbot`官方文档使用`snap`或`pip`方式安装。

#### 3.自动修改Nginx配置并申请证书

对于普通站点，可以直接使用`--nginx`插件申请证书，并让`Certbot`自动修改`Nginx`配置：

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

根据提示输入邮箱、同意协议，并选择是否将`HTTP`自动重定向到`HTTPS`。

执行成功后，`Certbot`会生成证书文件，常见路径如下：

```text
/etc/letsencrypt/live/example.com/fullchain.pem
/etc/letsencrypt/live/example.com/privkey.pem
```

其中：

- `fullchain.pem`是证书链文件；
- `privkey.pem`是私钥文件；
- 私钥文件权限敏感，不要复制到公开目录，也不要提交到代码仓库。

#### 4.手动编写HTTPS配置

如果希望手动维护`Nginx`配置，可以使用如下结构：

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    return 301 https://example.com$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    root /var/www/example-web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

`Nginx 1.25.1`之后推荐使用：

```nginx
listen 443 ssl;
http2 on;
```

较旧版本如果不支持`http2 on;`，可以改用传统写法：

```nginx
listen 443 ssl http2;
```

修改完成后执行：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### 5.配置HSTS

确认站点已经稳定支持`HTTPS`后，可以启用`HSTS`响应头：

```nginx
add_header Strict-Transport-Security "max-age=31536000" always;
```

如果确定所有子域名都支持`HTTPS`，再考虑使用：

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

`HSTS`会让浏览器在一段时间内强制使用`HTTPS`访问站点。生产环境开启前要确认所有相关域名都已经正确配置证书，否则可能导致用户无法通过浏览器访问。

### 七、反向代理进阶配置

#### 1.配置WebSocket代理

如果后端服务使用`WebSocket`，需要额外处理协议升级请求。可以在`/etc/nginx/conf.d/00-map.conf`中添加：

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
```

然后在站点配置中写入：

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name ws.example.com;

    ssl_certificate /etc/letsencrypt/live/ws.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ws.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

如果缺少`Upgrade`和`Connection`相关配置，页面普通请求可能正常，但实时通信、终端连接、消息推送等功能会异常。

#### 2.配置负载均衡

当同一个后端服务部署了多个实例时，可以使用`upstream`进行负载均衡：

```nginx
upstream app_backend {
    server 127.0.0.1:8081;
    server 127.0.0.1:8082;
    server 127.0.0.1:8083;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://app_backend;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

默认策略是轮询。也可以根据需要为实例设置权重：

```nginx
upstream app_backend {
    server 127.0.0.1:8081 weight=3;
    server 127.0.0.1:8082 weight=1;
}
```

#### 3.配置上传大小限制

如果接口涉及文件上传，默认请求体大小可能不够，需要在`server`或`location`中配置：

```nginx
client_max_body_size 100m;
```

例如：

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name upload.example.com;

    client_max_body_size 100m;

    ssl_certificate /etc/letsencrypt/live/upload.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/upload.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
```

如果上传大文件仍然失败，还需要同步检查后端应用自身的上传限制，例如`Spring Boot`中的`spring.servlet.multipart.max-file-size`和`max-request-size`。

#### 4.配置代理超时时间

对于耗时较长的接口，可以适当调整代理超时时间：

```nginx
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

示例：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080/;

    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

不建议盲目把超时时间调得过长。接口长期无响应时，优先检查后端慢查询、外部服务调用、线程池和数据库连接池。

### 八、证书续期与日常维护

#### 1.检查自动续期

`Let’s Encrypt`证书有效期较短，部署完成后一定要确认自动续期是否可用。可以先执行试运行：

```bash
sudo certbot renew --dry-run
```

如果输出成功，说明续期流程基本可用。

查看系统定时任务：

```bash
systemctl list-timers | grep certbot
```

不同安装方式下，自动续期可能由`systemd timer`、`cron`或`snap`定时任务管理。

#### 2.续期后重新加载Nginx

一般情况下，使用`certbot --nginx`申请的证书会自动处理续期后的配置加载。如果使用手动证书路径，可以添加部署钩子：

```bash
sudo certbot renew --deploy-hook "systemctl reload nginx"
```

也可以编辑续期配置文件：

```text
/etc/letsencrypt/renewal/example.com.conf
```

在其中配置续期后的操作。修改前建议先备份。

#### 3.查看站点证书信息

可以使用浏览器查看证书，也可以使用命令行检查：

```bash
openssl s_client -connect example.com:443 -servername example.com </dev/null
```

查看证书有效期：

```bash
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | openssl x509 -noout -dates
```

如果提示证书域名不匹配，优先检查：

- 当前访问域名是否包含在证书中；
- `server_name`是否写错；
- 是否访问到了默认`server`；
- 多个`443`配置中是否有相同域名冲突；
- 是否重新加载了`Nginx`。

### 九、常见问题排查

#### 1.访问域名仍然打开默认页面

优先检查域名解析和`server_name`：

```bash
dig example.com
curl -I http://example.com
sudo nginx -T | grep -n "server_name"
```

如果`Nginx`没有匹配到正确的`server_name`，会落到默认站点。此时需要检查：

- 配置文件是否放在`Nginx`会加载的目录下；
- `server_name`是否漏写或拼写错误；
- 修改后是否执行了`nginx -t`和`reload`；
- 是否存在多个重复的`server_name`配置。

#### 2.502 Bad Gateway

`502`通常表示`Nginx`无法正常连接后端服务。排查顺序如下：

```bash
curl http://127.0.0.1:8080
ss -tunlp | grep 8080
sudo tail -f /var/log/nginx/error.log
```

常见原因包括：

- 后端服务没有启动；
- 后端监听端口写错；
- 后端只监听了容器内部或其他网卡；
- `proxy_pass`地址写错；
- 防火墙或容器网络阻断；
- 后端服务启动很慢或已经崩溃。

如果后端运行在`Docker`容器中，需要确认端口映射或容器网络是否正确。

#### 3.413 Request Entity Too Large

上传文件时报`413`，说明请求体超过`Nginx`限制。可以在站点配置中增加：

```nginx
client_max_body_size 100m;
```

然后重新加载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

如果仍然失败，继续检查后端框架、网关、对象存储代理等组件的上传限制。

#### 4.HTTPS证书申请失败

证书申请失败时，优先检查`80`端口和域名解析：

```bash
curl -I http://example.com
sudo ss -tunlp | grep ':80'
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

常见原因包括：

- 域名没有解析到当前服务器；
- 云服务器安全组没有放行`80`端口；
- 系统防火墙阻止访问；
- `Nginx`配置错误，导致验证文件无法访问；
- 同一域名短时间内申请次数过多，触发频率限制。

如果服务器不能直接暴露`80`端口，可以考虑使用`DNS`验证方式申请证书。

#### 5.页面刷新后404

前端单页应用刷新后`404`，通常是因为没有配置路由回退：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

如果是普通静态文件站点，不应该使用该回退方式，否则不存在的文件也会返回`index.html`，影响排错。

### 十、推荐配置模板

下面给出一个较完整的前后端同域部署模板，适合大多数个人项目和中小型后台系统。

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    return 301 https://example.com$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    root /var/www/example-web;
    index index.html;

    access_log /var/log/nginx/example.access.log;
    error_log /var/log/nginx/example.error.log;

    client_max_body_size 100m;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

部署完成后执行：

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I https://example.com
curl -I https://example.com/api/
```

### 十一、总结

`Nginx`多站点部署的核心思路可以概括为：

1. 使用不同`server_name`区分域名和子域名；
2. 使用不同`location`区分静态资源、接口路径和特殊代理路径；
3. 使用`proxy_pass`将请求转发到内部服务；
4. 使用`Certbot`或其他证书工具完成`HTTPS`证书申请和续期；
5. 每次修改配置后先执行`nginx -t`，确认无误后再重新加载服务；
6. 通过访问日志、错误日志、`curl`、`ss`等工具定位部署问题。

对于个人项目，一台服务器加多个子域名已经可以覆盖博客、接口、后台、文档站点和监控服务等常见场景。对于生产环境，则需要进一步关注访问日志切割、证书续期监控、安全响应头、限流、防火墙策略、备份回滚和后端服务高可用。

### 十二、参考资料

- [NGINX反向代理官方文档](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy)
- [NGINX SSL Termination官方文档](https://docs.nginx.com/nginx/admin-guide/security-controls/terminating-ssl-http/)
- [Nginx Server Names官方文档](https://nginx.org/en/docs/http/server_names.html)
- [Nginx Linux Packages官方文档](https://nginx.org/en/linux_packages.html)
- [Nginx Beginner's Guide官方文档](https://nginx.org/en/docs/beginners_guide.html)
- [Certbot官方使用说明](https://certbot.eff.org/instructions?ws=nginx)
