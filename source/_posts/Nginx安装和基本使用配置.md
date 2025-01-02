---
title: Nginx安装和基本使用配置
typora-root-url: Nginx安装和基本使用配置
date: 2025-01-02 13:47:28
tags:
---
### 一、引言

`Nginx`是一个高性能的`HTTP`和反向代理`web`服务器，基于它能够帮助软件开发者进行前后端分离开发，然后利用反向代理的方式将配置应用，而且能够实现负载均衡，保证应用服务的健康运行。

### 二、操作步骤

#### 1.Linux系统安装Nginx

常用的`Nginx`的安装方式有两种，一种是利用`Linux`系统的软件包安装命令进行安装，简单方便且不易出错，另一种是通过源码包进行安装，虽然繁琐但是服务性能更好。

这里以源码包安装为例进行演示。

##### 1）下载Nginx的源码包

通过访问[`Nginx`在`GitHub`上的仓库地址](https://github.com/nginx/nginx)，选择右上角处`Release`跳转对应网页。

![](../Nginx安装和基本使用配置/Nginx-GitHub.png)

下划至底部可下载文件部分，选择`Source Code`进行下载，格式选择`tar.gz`。

![](../Nginx安装和基本使用配置/Nginx-GitHub-Release.png)

##### 2）上传源码包至Linux系统

将下载好的源码包文件`nginx-release-1.27.3.tar.gz`通过`FinalShell`拖拽的方式上传至`CentOS7.6`系统中，习惯是传至目录`/usr/local/nginx`。

若目录不存在，可自行创建对应目录。

```bash
mkdir /usr/local/nginx
```

##### 3）安装所需依赖库

针对`Nginx`软件，对应需要安装`gcc`、`pcre`、`zlib`和`openssl`等环境。

```bash
yum -y install gcc gcc-c++	# nginx 编译时依赖 gcc 环境
yum -y install pcre pcre-devel	# 让 nginx 支持重写功能
yum -y install zlib zlib-devel	# zlib 库提供了很多压缩和解压缩的方式，nginx 使用 zlib 对 http 包内容进行 gzip 压缩
yum -y install openssl openssl-devel	# 安全套接字层密码库，用于通信加密
```

##### 4）解压Nginx源码包

进入`/usr/local/nginx`，解压源码包文件`nginx-release-1.27.3.tar.gz`。

```bash
cd /usr/local/nginx
tar -zxvf nginx-release-1.27.3.tar.gz
```

##### 5）检查平台安装环境

完成解压缩后，进入解压后的文件夹`nginx-release-1.27.3`，检查平台安装环境。

```bash
./auto/configure --prefix=/usr/local/nginx	# --prefix=/usr/local/nginx  是 nginx 编译安装的目录（推荐），安装完后会在此目录下生成相关文件
```

如果前面的依赖库都安装成功后，执行`./auto/configure --prefix=/usr/local/nginx`命令会显示一些环境信息。如果出现错误，一般是依赖库没有安装完成，可按照错误提示信息进行所缺的依赖库安装。

##### 6）编译源码并安装软件

```bash
make && make install	# 编译 安装
```

##### 7）查看安装结果

回到`/usr/local/nginx`目录，查看当前目录中的文件。

```bash
ll -h
```

若出现`conf`、`html`、`log`、`sbin`等目录即表示安装成功。

#### 2.启动Nginx服务

##### 1）配置全局环境变量

`Nginx`服务在未配置环境变量时，只能通过进入`/usr/local/nginx/sbin`目录中，执行二进制文件进行启动。

```bash
cd /usr/local/nginx/sbin
./nginx
```

不能使用简便的快捷命令进行启动，必须进入文件目录执行二进制文件或使用绝对路径执行文件，对操作带来极大不便。

使用`vim`打开`/etc/profile`文件，将`/usr/local/nginx/sbin`添加到环境变量`PATH`中，然后重新加载。

```bash
vim /etc/profile
```

在文件末尾插入下述内容，其中`:$PATH`代表在原先环境变量的基础上，拼接上了冒号之前的部分，保证了原环境变量依然有效。

```
PATH=/usr/local/nginx/sbin:$PATH
```

重新加载文件。

```bash
source /etc/profile
```

##### 2）检查配置文件正确性

在启动`Nginx`服务前，可以通过`-t`来检查其配置文件是否有配置错误。

```bash
nginx -t
```

##### 3）正式启动服务

配置完全局环境变量后，可以直接使用`Nginx`及其包含参数的一系列命令。

```bash
nginx
```

启动成功后，默认监听端口为80，通过在浏览器上直接访问`Linux`系统主机`IP`，即可查看`Nginx`的默认`web`服务页面。

若长时间加载不成功或访问失败，是因为`Linux`系统默认开启了防火墙，关闭即可访问。

```bash
systemctl stop firewalld
```

成功访问后显示如下页面。

![](../Nginx安装和基本使用配置/Nginx-Web-Index-html.jpg)

##### 4）关闭服务和重新加载服务

```bash
nginx -s stop	# 关闭服务
nginx -s reload	# 重新加载服务，一般为配置文件修改以后执行
```

#### 3.Nginx配置文件详解

##### 1）配置文件整体浏览

进入`/usr/loacl/nginx/conf`目录中，通过`cat`命令查看`nginx.conf`文件的具体内容。

```bash
cd /usr/local/nginx/conf
cat nginx.cong
```

`nginx.conf`文件过滤注释配置部分后文件内容如下，默认`Nginx`服务只加载启动了如下配置。

```text
worker_processes  1;	# Nginx 在启动时会创建 1 个工作进程

events {
    worker_connections  1024;	# 每个工作进程允许的最大并发连接数是 1024
}

http {
    include       mime.types;	# 根据请求的文件类型，设置正确的 Content-Type 响应头
    default_type  application/octet-stream;	# 设置默认的 MIME 类型为 application/octet-stream（二进制文件）
    sendfile        on;	# 启用 sendfile 选项，允许直接通过内核发送文件
    keepalive_timeout  65;	# 设置 HTTP 长连接的超时时间为 65 秒
    
    server {
        listen       80;
        server_name  localhost;
        
        location / {
            root   html;
            index  index.html index.htm;	# 指定默认的主页文件为 index.html 或 index.htm
        }
}
```

##### 2）反向代理配置

客户端向`Nginx`服务器发送请求，部署`Nginx`的服务器将`localhost:80`接收到的请求，转发到`taget_url`由它进行处理响应返回值，经由`Nginx`服务转发回请求的客户端。

```text
server {
    listen       80;
    server_name  localhost;
        
    location / {
        proxy_pass	target_url	# 反向代理配置，转发请求到指定服务
    }
}
```

##### 3）负载均衡配置

常用的负载均衡策略有轮询、`weight`、`ip_hash`、`least_conn`、`url_hash`和`fair`等策略方式，能够针对实际服务访问情况，有策略的处理分配服务访问，使得服务器集群中的每台服务器负载大致相同且能够正常承受。

客户端向`Nginx`服务器发送请求，部署`Nginx`的服务器将`localhost:80`接收到的请求，通过负载均衡策略算法（默认策略为轮询方式）选择转发到`taget_server_urls`其中一台服务器，由它进行处理响应返回值，经由`Nginx`服务转发回请求的客户端。

```text
upstream target_server_urls {	# 目标服务器集群，数量不一，此处以 3 台为例
	server url1;
	server url2;
	server url3;
}

server {
    listen       80;
    server_name  localhost;
        
    location / {
        proxy_pass	target_server_urls	# 反向代理配置，转发请求到指定服务
    }
}
```

### 三、写在最后

前后端分离开发现已是主流开发方式，利用`Nginx`的反向代理方式，将分离的前后端应用关联起来，并且能够实现负载均衡，无疑是当前`Web`软件开发中不可或缺的一部分，无论前后端人员都有必要了解其特性。