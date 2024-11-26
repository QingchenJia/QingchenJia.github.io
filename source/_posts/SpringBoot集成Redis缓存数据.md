---
title: SpringBoot集成Redis缓存数据
typora-root-url: SpringBoot集成Redis缓存数据
date: 2024-11-26 19:49:56
tags:
---
### 一、引言

`Redis`是目前使用最为广泛的非关系型数据库，常用于`Web`项目中缓存数据。在访问量非常高的项目中，用户每与系统进行交互都将伴随后端对数据库的操作，通常其中最多的操作类型为查询，大量的访问数据库可能会导致数据库不堪重负。因此，使用`Redis`来缓存查询结果数据成了一个良好的解决方案，在首次查询时将查询结果缓存至`Redis`数据库中，下次查询同样的数据即从缓存中提取数据并返回。当数据库中的原始数据发生改变时，清楚`Redis`缓存，以保证数据同步。

### 二、步骤

#### 1.安装Redis数据库

由于`Redis`官方团队仅针对`Linux`系统进行了开发，受限于设备而不得不使用`Windows`操作系统可以选择下载由`Microsoft Archive`团队开发的`Windows`版本，项目访问地址为`https://github.com/microsoftarchive/redis`。

![](../SpringBoot集成Redis缓存数据/Redis-Windows.png)

下载项目`Release`发布中合适版本后，解压文件内容如下。双击运行`redis-server.exe`文件即可启动`Redis`服务，启动前请注意`6379`端口的占用情况。然后可通过运行`redis-cli.exe`即`Redis`客户端程序，进行数据库操作。

![](../SpringBoot集成Redis缓存数据/Redis-path.png)

#### 2.导入相关依赖

根据`SpringBoot`版本的不同，在`Maven`依赖中已对`Redis`这种常用依赖做好了依赖适配，因此在具体`pom.xml`文件中无需填写对应`version`。

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-redis</artifactId>
  <version>3.3.5</version>
</dependency>
```

#### 3.GUI工具使用

推荐一款界面风格简洁，交互使用流畅的`Redis`数据库`GUI`工具——`AnotherRedisDesktopManager`。从名字能够看出，已经存在一款名为`RedisDesktopManager`的同类工具，务必注意名称，不要找错工具。

项目的访问地址为`https://github.com/qishibo/AnotherRedisDesktopManager`，仍然通过`Release`发布下载安装包，一路默认选择即可快速完成安装。

![](../SpringBoot集成Redis缓存数据/AnotherRedisDesktopManager.png)

#### 4.编写项目配置文件

`Redis`服务端安装在`Windows`本机上，主机配置`127.0.0.1`或`localhost`，端口默认为`6379`。

```yml
spring:
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      password:
```

#### 5.书写测试代码

`RedisTemplate`类的对象由`Spring`框架进行`Bean`管理，在项目启动执行的过程中，自动注入。

```java
@SpringBootTest
class ApplicationTests {
    @Autowired
    private RedisTemplate redisTemplate;

    @Test
    void testRedisUse() {
    	redisTemplate.opsForValue().set("name", "eric");
        System.out.println(value.get("name"));
    }
}
```

#### 6.自定义RedisTemplate对象

使用`SpringBoot`框架默认提供的`RedisTemplate`对象`Bean`时，在存储`key`时会将字符串序列化，使得`Redis`中存储的`key`前面多上一串难以阅读的序列化字符，妨碍对缓存数据的查看，同时影响数据库中key的模糊匹配。

因此，需要自定义`RedisTemplate`对象`Bean`来解决，设置`key`的序列化方式为字符串序列化，这样以字符串作为`key`存入`Redis`数据库过程中进行序列化后，将不会出现难以理解的序列化字符前缀。

```java
@Configuration
public class RedisConfig {
    /**
     * 配置RedisTemplate以支持Spring应用中的Redis操作
     * 此方法主要负责初始化RedisTemplate，并设置其连接工厂和序列化方式
     *
     * @param redisCommandFactory Redis连接工厂，用于创建与Redis服务器的连接
     * @return 配置完成的RedisTemplate实例，可用于执行Redis操作
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisCommandFactory) {
        // 创建RedisTemplate实例
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();

        // 设置Redis连接工厂
        redisTemplate.setConnectionFactory(redisCommandFactory);

        // 设置键的序列化方式为字符串序列化
        redisTemplate.setKeySerializer(RedisSerializer.string());
        // 设置哈希键的序列化方式为字符串序列化
        redisTemplate.setHashKeySerializer(RedisSerializer.string());

        // 返回配置完成的RedisTemplate实例
        return redisTemplate;
    }
}
```

### 三、写在最后

使用`Redis`来进行缓存数据的存取已经成了大多数项目的公认选择，除了缓存数据库中的查询数据以外，手机短信验证码的定时过期也可以通过`Redis`来实现。此外，适合自己的GUI工具也能够帮助开发者更有效的进行开发和学习。