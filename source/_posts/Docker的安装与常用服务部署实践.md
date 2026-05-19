---
title: Docker的安装与常用服务部署实践
typora-root-url: Docker的安装与常用服务部署实践
date: 2026-05-17 20:43:51
categories:
    - 服务部署
tags:
    - Docker
    - Linux
    - 容器部署
---

### 一、引言

`Docker`是目前最常用的容器化部署工具之一。它可以将应用程序及其运行环境打包为镜像，再通过容器的方式在不同服务器上快速运行，从而降低环境差异带来的部署成本。

本文只讨论`Docker`在`Linux`发行版操作系统中的安装和使用，不涉及`Docker Desktop`、`Windows Server`或`macOS`环境。文章内容以服务器部署实践为主，覆盖`Docker Engine`安装、国内镜像源配置、常用命令，以及`Nginx`、`MySQL`、`Redis`、`RabbitMQ`等常用服务的容器部署。

### 二、安装前准备

#### 1.查看系统信息

在安装`Docker`前，建议先确认当前系统发行版、内核版本和CPU架构。

```bash
cat /etc/os-release
uname -r
uname -m
```

常见服务器系统如`Ubuntu`、`Debian`、`CentOS`、`Rocky Linux`、`AlmaLinux`、`RHEL`、`Fedora`等都可以安装`Docker Engine`。如果是生产环境，建议优先选择仍处于维护周期内的系统版本。

#### 2.卸载旧版本组件

如果服务器之前通过系统默认仓库安装过旧版本`Docker`或兼容组件，可能会与官方`Docker CE`包冲突，安装前可以先清理。

`Ubuntu`、`Debian`等`Debian`系系统执行：

```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
    sudo apt-get remove -y $pkg
done
```

`CentOS`、`RHEL`、`Rocky Linux`、`AlmaLinux`、`Fedora`等`RedHat`系系统执行：

```bash
sudo dnf remove -y docker \
    docker-client \
    docker-client-latest \
    docker-common \
    docker-latest \
    docker-latest-logrotate \
    docker-logrotate \
    docker-engine \
    podman \
    runc
```

上述命令只会删除软件包，不会主动删除`/var/lib/docker`中的镜像、容器和数据卷。如果服务器上已有重要容器数据，不要直接删除该目录。

### 三、安装Docker Engine

#### 1.使用官方软件仓库安装

生产环境推荐使用软件仓库方式安装，后续升级和维护更清晰。

##### 1）Ubuntu/Debian安装

安装基础依赖并添加`Docker`官方`GPG`密钥。

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings

. /etc/os-release
sudo curl -fsSL https://download.docker.com/linux/${ID}/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

添加`Docker`软件源。

```bash
sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/${ID}
Suites: ${UBUNTU_CODENAME:-$VERSION_CODENAME}
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

安装`Docker Engine`、命令行工具、`containerd`、`Buildx`和`Docker Compose`插件。

```bash
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

如果使用的是`Linux Mint`、`Deepin`等衍生系统，`${ID}`可能不是`ubuntu`或`debian`，此时需要根据上游系统手动调整软件源地址和版本代号。

##### 2）RedHat系系统安装

安装仓库管理工具。

```bash
sudo dnf -y install dnf-plugins-core
```

根据发行版选择一个仓库地址进行添加。

```bash
# CentOS
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# RHEL
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo

# Fedora
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
```

三条命令不要全部执行，应按当前系统选择其中一条。对于`Rocky Linux`、`AlmaLinux`等兼容发行版，如果官方源适配不顺利，可以优先使用后文介绍的`LinuxMirrors`脚本方式安装。

安装`Docker`相关软件包并启动服务。

```bash
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
```

#### 2.验证安装结果

安装完成后查看版本信息。

```bash
docker version
docker compose version
```

执行官方测试镜像。

```bash
sudo docker run --rm hello-world
```

如果输出欢迎信息，说明`Docker Engine`可以正常拉取镜像并运行容器。

#### 3.配置普通用户执行Docker命令

默认情况下，普通用户执行`docker`命令可能需要加`sudo`。如果希望当前用户直接使用`docker`命令，可以将用户加入`docker`用户组。

```bash
sudo groupadd docker || true
sudo usermod -aG docker $USER
newgrp docker
```

然后重新验证：

```bash
docker run --rm hello-world
```

需要注意的是，`docker`用户组拥有较高权限。生产服务器上是否允许普通用户直接操作`Docker`，应结合服务器权限管理要求来决定。

### 四、国内镜像源配置

#### 1.区分Docker CE软件源和镜像加速器

配置国内源时，容易混淆两个概念：

- `Docker CE`软件源：用于安装和升级`docker-ce`、`docker-ce-cli`、`containerd.io`等软件包；
- `Docker Registry`镜像加速器：用于加速`docker pull`拉取镜像的过程。

如果已经安装好了`Docker`，但拉取镜像很慢或失败，通常只需要配置`Docker Registry`镜像加速器。如果连`Docker`软件包都安装失败，则需要同时考虑系统软件源和`Docker CE`软件源。

#### 2.使用LinuxMirrors脚本安装和换源

[`SuperManito/LinuxMirrors`](https://github.com/SuperManito/LinuxMirrors)是一个开源的`GNU/Linux`换源脚本项目，同时提供`Docker`安装与换源脚本。它支持多种`Linux`发行版，适合国内网络环境下快速安装`Docker`或更换镜像加速器。

安装`Docker Engine`并在交互过程中选择软件源和镜像仓库：

```bash
bash <(curl -sSL https://linuxmirrors.cn/docker.sh)
```

如果服务器已经安装过`Docker`，只想更换镜像加速器，可以使用`--only-registry`参数：

```bash
bash <(curl -sSL https://linuxmirrors.cn/docker.sh) --only-registry
```

也可以直接指定镜像仓库地址，多个地址之间使用英文逗号分隔：

```bash
bash <(curl -sSL https://linuxmirrors.cn/docker.sh) \
    --only-registry \
    --source-registry "docker.1ms.run,docker.1panel.live,docker.m.daocloud.io"
```

如果需要直接使用`GitHub`仓库中的脚本，也可以执行：

```bash
bash <(curl -sSL https://raw.githubusercontent.com/SuperManito/LinuxMirrors/main/DockerInstallation.sh) --only-registry
```

使用一键脚本前，建议先阅读项目说明和脚本内容，确认脚本行为符合当前服务器环境要求。对于生产环境，更建议在测试服务器验证后再应用到正式服务器。

#### 3.手动配置镜像加速器

如果不想使用脚本，也可以直接编辑`/etc/docker/daemon.json`配置镜像加速器和日志轮转。

```bash
sudo mkdir -p /etc/docker

sudo tee /etc/docker/daemon.json >/dev/null <<'EOF'
{
    "registry-mirrors": [
        "https://docker.1ms.run",
        "https://docker.1panel.live",
        "https://docker.m.daocloud.io"
    ],
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "100m",
        "max-file": "3"
    }
}
EOF
```

重新加载并重启`Docker`服务。

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

查看是否生效。

```bash
docker info
```

在输出结果中查看`Registry Mirrors`部分，确认镜像加速器地址已经写入配置。

### 五、Docker常用命令

#### 1.镜像相关命令

```bash
docker pull nginx:stable-alpine
docker images
docker rmi nginx:stable-alpine
```

`docker pull`用于拉取镜像，`docker images`用于查看本地镜像，`docker rmi`用于删除不再需要的镜像。

#### 2.容器相关命令

```bash
docker ps
docker ps -a
docker stop 容器名或容器ID
docker start 容器名或容器ID
docker restart 容器名或容器ID
docker rm 容器名或容器ID
```

`docker ps`只查看正在运行的容器，`docker ps -a`会查看全部容器。

#### 3.日志和进入容器

```bash
docker logs -f --tail=200 容器名或容器ID
docker exec -it 容器名或容器ID bash
docker exec -it 容器名或容器ID sh
```

如果镜像基于`Alpine Linux`构建，容器内通常没有`bash`，需要使用`sh`进入。

#### 4.网络和数据卷

```bash
docker network ls
docker network create service-net

docker volume ls
docker volume create mysql-data
```

部署多个服务时，建议创建自定义网络，让容器之间通过容器名访问，避免全部依赖宿主机端口。

### 六、常用服务部署实践

以下示例统一将容器数据放在`/opt/docker`目录下，便于备份和迁移。执行前先创建公共网络。

```bash
docker network create service-net
sudo mkdir -p /opt/docker
```

#### 1.部署Nginx

创建测试页面。

```bash
sudo mkdir -p /opt/docker/nginx/html

sudo tee /opt/docker/nginx/html/index.html >/dev/null <<'EOF'
<h1>Hello Docker Nginx</h1>
EOF
```

启动`Nginx`容器。

```bash
docker run -d \
    --name nginx \
    --restart unless-stopped \
    --network service-net \
    -p 80:80 \
    -v /opt/docker/nginx/html:/usr/share/nginx/html:ro \
    nginx:stable-alpine
```

查看容器状态。

```bash
docker ps
curl http://127.0.0.1
```

如果云服务器访问不通，需要同时检查安全组、防火墙和宿主机端口占用情况。

#### 2.部署MySQL

创建数据目录和配置目录。

```bash
sudo mkdir -p /opt/docker/mysql/data /opt/docker/mysql/conf /opt/docker/mysql/logs
```

添加基础配置。

```bash
sudo tee /opt/docker/mysql/conf/my.cnf >/dev/null <<'EOF'
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
default-time-zone=+08:00
EOF
```

启动`MySQL 8`容器。

```bash
docker run -d \
    --name mysql8 \
    --restart unless-stopped \
    --network service-net \
    -p 3306:3306 \
    -e MYSQL_ROOT_PASSWORD=ChangeMe_123456 \
    -e TZ=Asia/Shanghai \
    -v /opt/docker/mysql/data:/var/lib/mysql \
    -v /opt/docker/mysql/conf:/etc/mysql/conf.d \
    -v /opt/docker/mysql/logs:/var/log/mysql \
    mysql:8.0
```

进入数据库。

```bash
docker exec -it mysql8 mysql -uroot -p
```

正式部署时应修改默认密码，并限制`3306`端口的公网访问范围。

#### 3.部署Redis

创建配置和数据目录。

```bash
sudo mkdir -p /opt/docker/redis/conf /opt/docker/redis/data
```

编写`Redis`配置文件。

```bash
sudo tee /opt/docker/redis/conf/redis.conf >/dev/null <<'EOF'
bind 0.0.0.0
protected-mode yes
port 6379
requirepass ChangeMe_redis_123
appendonly yes
EOF
```

启动`Redis`容器。

```bash
docker run -d \
    --name redis7 \
    --restart unless-stopped \
    --network service-net \
    -p 6379:6379 \
    -v /opt/docker/redis/data:/data \
    -v /opt/docker/redis/conf/redis.conf:/usr/local/etc/redis/redis.conf:ro \
    redis:7-alpine \
    redis-server /usr/local/etc/redis/redis.conf
```

连接测试。

```bash
docker exec -it redis7 redis-cli -a ChangeMe_redis_123 ping
```

输出`PONG`即表示服务正常。

#### 4.部署RabbitMQ

创建数据目录。

```bash
sudo mkdir -p /opt/docker/rabbitmq/data
```

启动带管理后台的`RabbitMQ`容器。

```bash
docker run -d \
    --name rabbitmq \
    --hostname rabbitmq \
    --restart unless-stopped \
    --network service-net \
    -p 5672:5672 \
    -p 15672:15672 \
    -e RABBITMQ_DEFAULT_USER=rabbitmq \
    -e RABBITMQ_DEFAULT_PASS=ChangeMe_rabbitmq_123 \
    -v /opt/docker/rabbitmq/data:/var/lib/rabbitmq \
    rabbitmq:3-management
```

访问管理后台：

```text
http://服务器IP:15672
```

默认示例账号为`rabbitmq`，密码为`ChangeMe_rabbitmq_123`。正式环境不要继续使用示例密码。

#### 5.使用Docker Compose管理多个服务

单个服务可以使用`docker run`部署，多个服务更适合使用`Docker Compose`管理。下面以`MySQL`和`Redis`为例。

```bash
sudo mkdir -p /opt/docker/compose-demo
cd /opt/docker/compose-demo
```

编写`compose.yml`。

```bash
sudo tee compose.yml >/dev/null <<'EOF'
services:
  mysql:
    image: mysql:8.0
    container_name: compose-mysql8
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ChangeMe_123456
      TZ: Asia/Shanghai
    ports:
      - "3306:3306"
    volumes:
      - ./mysql/data:/var/lib/mysql
      - ./mysql/conf:/etc/mysql/conf.d

  redis:
    image: redis:7-alpine
    container_name: compose-redis7
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ChangeMe_redis_123
    ports:
      - "6379:6379"
    volumes:
      - ./redis/data:/data

networks:
  default:
    name: compose-demo-net
EOF
```

启动服务。

```bash
docker compose up -d
docker compose ps
```

停止服务。

```bash
docker compose down
```

如果希望删除容器时同时删除数据卷，需要额外加`-v`参数，但生产环境不要随意执行。

```bash
docker compose down -v
```

### 七、维护与排错

#### 1.查看服务状态

```bash
systemctl status docker
docker ps -a
docker logs -f --tail=200 容器名
```

如果容器启动后立即退出，优先查看`docker logs`输出，一般可以直接定位配置文件错误、端口冲突或权限问题。

#### 2.更新镜像和容器

`docker run`方式部署的容器需要先拉取新镜像，再删除旧容器并按原参数重新启动。

```bash
docker pull redis:7-alpine
docker stop redis7
docker rm redis7
```

然后重新执行原来的`docker run`命令。

如果使用`Docker Compose`部署，则可以执行：

```bash
docker compose pull
docker compose up -d
```

#### 3.备份服务数据

对于数据库类服务，优先使用数据库自身的备份工具。例如备份`MySQL`全部数据库：

```bash
sudo mkdir -p /opt/docker/backup
docker exec mysql8 sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --all-databases' > /opt/docker/backup/mysql-all.sql
```

对于普通文件数据，可以基于挂载目录进行归档。

```bash
tar -czf /opt/docker/backup/redis-data.tar.gz -C /opt/docker/redis/data .
```

备份前最好先确认服务写入状态，避免在高并发写入时得到不完整数据。

#### 4.清理无用资源

查看磁盘占用：

```bash
docker system df
```

清理未使用的镜像、停止的容器和构建缓存：

```bash
docker system prune
```

如果确认连未使用的数据卷也可以清理，再执行：

```bash
docker system prune --volumes
```

数据卷可能保存数据库、上传文件等业务数据，不要在不了解影响的情况下执行带`--volumes`的清理命令。

#### 5.常见问题

##### 1）提示permission denied

如果普通用户执行`docker ps`提示没有权限，说明当前用户还没有正确加入`docker`用户组，重新执行用户组配置并重新登录即可。

```bash
sudo usermod -aG docker $USER
newgrp docker
```

##### 2）镜像拉取失败

先检查网络和镜像名是否正确，再检查`daemon.json`中的`registry-mirrors`是否生效。

```bash
docker info
docker pull nginx:stable-alpine
```

国内服务器可以优先使用`LinuxMirrors`的`--only-registry`方式重新配置镜像加速器。

##### 3）端口无法访问

依次检查容器端口映射、宿主机监听、防火墙和云服务器安全组。

```bash
docker ps
ss -tunlp | grep 端口号
sudo firewall-cmd --list-ports
```

如果使用`ufw`或`firewalld`管理防火墙，需要注意`Docker`会修改底层网络规则。生产环境应统一规划端口开放策略，不要只依赖容器启动命令中的`-p`参数。

### 八、总结

在`Linux`服务器中使用`Docker`部署服务，核心流程可以总结为：

1. 先安装并验证`Docker Engine`和`Docker Compose`插件；
2. 根据网络环境配置`Docker Registry`镜像加速器；
3. 使用`docker run`部署单个服务，使用`Docker Compose`管理多个服务；
4. 将业务数据挂载到宿主机固定目录，便于备份、迁移和排错；
5. 定期检查日志、磁盘占用、镜像版本和端口暴露范围。

对于个人开发和测试服务器，可以使用`LinuxMirrors`快速完成安装与换源；对于生产环境，建议先在测试机验证脚本行为，明确数据目录、端口、安全组和备份策略后再上线。

### 九、参考资料

- [Docker Engine官方安装文档](https://docs.docker.com/engine/install/)
- [Docker Engine Linux安装后配置](https://docs.docker.com/engine/install/linux-postinstall/)
- [Docker Compose Plugin安装文档](https://docs.docker.com/compose/install/linux/)
- [SuperManito/LinuxMirrors GitHub仓库](https://github.com/SuperManito/LinuxMirrors)
- [LinuxMirrors Docker安装与换源脚本说明](https://linuxmirrors.cn/other/)
