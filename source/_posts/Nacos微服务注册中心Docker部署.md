---
title: Nacos微服务注册中心Docker部署
typora-root-url: Nacos微服务注册中心Docker部署
date: 2025-01-17 21:29:51
tags:
---
### 一、引言

使用`SpringCloud`框架进行分布式微服务项目开发时，必然离不开注册中心的环境搭建，其中`Alibaba`团队开发的`Nacos`作为国产化注册中心，已经完美集成到`SpringCloud`的规范下，成为了微服务项目的开发不二选择。

### 二、操作步骤

#### 1.安装Docker

##### 1）进入阿里云镜像网站

访问`docker-ce`镜像网页，根据提示依次操作即可完成`docker`的安装。

![](../Nacos微服务注册中心Docker部署/AliyunMirror.png)

##### 2）完成必要准备工作

安装必要的一些系统工具。

```bash
yum install -y yum-utils
```

添加软件源信息。

```bash
yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

##### 3）进行docker的安装

安装并开启`docker`服务。

```bash
yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
service docker start
```

##### 4）配置可用docker镜像源

创建`/etc/docker`目录。

```bash
mkdir -p /etc/docker
```

新建并编辑`daemon.json`文件，在文件中添加如下内容。

```json
{
 "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://noohub.ru",
    "https://huecker.io",
    "https://dockerhub.timeweb.cloud",
    "https://docker.rainbond.cc"
  ]
}
```

重启`docker`服务，使可用镜像源配置生效。

```bash
systemctl daemon-reload
systemctl restart docker
```

##### 5）设置开机自启动

```bash
systemctl enable docker
```

#### 2.使用Docker部署MySQL

##### 1）部署MySQL

执行如下命令，`docker`将自动从镜像仓库中拉去最新版本的`MySQL`镜像，并部署容器。

```bash
docker run --name mysql -e MYSQL_ROOT_PASSWORD=<your_password> -p 3306:3306 -d mysql
```

部署成功后的`MySQL`服务的`root`用户密码为`<your_password>`内容，容器中`3306`端口已映射至主机`3306`端口，可直接使用`Navicat`连接主机`IP`的`3306`端口操作`MySQL`数据库。

##### 2）设置MySQL容器开机自启动

```
docker update --restart=always mysql
```

#### 3.使用Docker部署Nacos

##### 1）上传Nacos环境配置文件

通过`FinalShell`拖拽方式将`custom.env`上传至`Linux`虚拟机中，`custom.env`内容如下。

```properties
PREFER_HOST_MODE=hostname
MODE=standalone	# 单机方式
SPRING_DATASOURCE_PLATFORM=mysql	# 数据库管理系统名称
MYSQL_SERVICE_HOST=192.168.19.130	# 虚拟机IP
MYSQL_SERVICE_DB_NAME=nacos	# 数据库名称
MYSQL_SERVICE_PORT=3306
MYSQL_SERVICE_USER=root	# 用户名
MYSQL_SERVICE_PASSWORD=jqc004118	# 密码
MYSQL_SERVICE_DB_PARAM=characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai
```

##### 2）导入Nacos数据库

访问`Nacos`的`GitHub`仓库，进入`Release`中找到对应版本，下载对应压缩包，解压后获取`SQL`文件。

![](../Nacos微服务注册中心Docker部署/NacosGitHubRelease.png)

通过`Navicat`连接至`MySQL`服务后，通过运行`SQL`文件操作，将`nacos`数据库文件一键导入。

##### 3）部署Nacos

执行`docker`命令，自动拉取并部署`nacos`容器，并且每次开机后会自启动。

```bash
docker run -d --name nacos --env-file ./custom.env -p 8848:8848 -p 9848:9848 -p 9849:9849 --restart=always nacos/nacos-server:<version_tag>
```

`<version_tag>`为对应拉取的镜像版本标记。

#### 4.访问Nacos网页端

打开浏览器访问`http:192.168.19.130:8848/nacos`，即可成功访问。

![](../Nacos微服务注册中心Docker部署/NacosPage-1.png)

账号密码均为`nacos`，登陆成功后可以检索全部服务。

![](../Nacos微服务注册中心Docker部署/NacosPage-2.png)

### 三、写在最后

通过`docker`部署`nacos`能够避免许多不必的环境适配操作，容器化的部署使得其便于管理，独立于宿主机器不受影响，极大的方便了开发者针对不同环境做出的部署行为。