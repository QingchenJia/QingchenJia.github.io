---
title: SpringBoot项目配置https
typora-root-url: SpringBoot项目配置https
date: 2024-10-25 20:38:29
tags:
---
### 一、引言

进行密码学的课程设计时，任务要求需要利用`SSL`，建立基于用户与服务器之间的安全通信连接。而在一般的`SpringBoot`项目中，通常访问的是`http`开头的链接，所要做的就是将其变成`https`开头的安全协议。

### 二、实践

#### 1.使用keytool生成自签名证书

`keytool`是下载`JDK`时一并安装完成的密钥工具，在环境变量配置正常时，能够直接通过终端执行其命令。

执行该命令在当前目录下生成一个名为`CA.p12`的`PKCS12`格式密钥库文件，其中包含一个有效期为10年的自签名证书，使用`RSA`算法并设定密码为123456。

```shell
keytool -genkey -alias CA -storetype PKCS12 -keyalg RSA -keysize 2048 -keystore CA.p12 -storepass 123456 -validity 3650
# -genkey:生成一个密钥对（包括公钥和私钥）并创建一个自签名的证书
# -alias CA:指定此密钥对的别名为`CA`
# -storetype PKCS12:指定密钥库的类型为`PKCS12`，这是一个标准的加密文件格式，兼容性广泛
# -keyalg RSA:指定使用`RSA`算法生成密钥对
# -keysize 2048:设置密钥的长度为2048位
# -keystore CA.p12:指定将密钥库文件保存为`CA.p12`
# -storepass 123456:设置密钥库的密码为123456
# -validity 3650:设置证书的有效期为3650天（大约10年）
```

执行此命令显示`CA.p12`文件中包含的证书和密钥的详细信息。
``` shell
keytool -list -v -keystore CA.p12
```

#### 2.编辑SpringBoot项目配置

将`CA.p12`移动至项目中`src/main/resources`目录，并对`application.yml`进行如下配置。

```yml
server:
  ssl:
    enabled: true	# 启用SSL支持，使应用程序支持HTTPS访问
    key-store-type: PKCS12	# 指定密钥库类型
    key-store: classpath:CA.p12	# 指定密钥库文件位置
    key-store-password: 123456	# 密钥库的密码
```

#### 3.启动项目访问https链接

此时原`http`链接已无法正常访问，将其更改为`https`重新访问。浏览器会提醒，当前访问页面不安全，并建议我们访问安全站点，这是因为使用的是自签名证书，没有受到根证书的认证。无需理会，选择高级，仍然访问此链接即可正常使用。

### 三、写在最后

对于密码学的相关知识过于浅薄，因而只能选择最简单易懂的配置方式，能够达到目的即是好的。
