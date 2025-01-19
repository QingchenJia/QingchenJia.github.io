---
title: OpenFeign实现微服务远程调用
typora-root-url: OpenFeign实现微服务远程调用
date: 2025-01-19 14:50:15
tags:
---
### 一、引言

针对`SpringBoot`单体项目中的不同服务层业务交互，通过注入对应的服务层接口即可实现。单体项目经过拆分成为分布式微服务项目后，不同的服务分处不同模块，无法实现服务层接口的注入。`OpenFeign`对此问题，给出了良好的解决方案，使用`OpenFeign`向`SpringCloud`项目中目标微服务模块发送远程请求，由目标微服务模块完成对应逻辑，即可达到与单体项目服务层业务交互同样的结果。

### 二、操作步骤

#### 1.注册微服务

##### 1）启动Nacos服务注册中心

进入`Linux`虚拟机，通过`docker`命令启动部署好的`nacos`容器。

```bash
docker start nacos
```

关闭防火墙，避免无法访问`nacos`服务地址。

```bash
systemctl stop firewalld
```

##### 2）配置SpringCloud微服务模块

分别以商品微服务`item-service`和购物车微服务`cart-service`为例，进行`application.yml`启动配置。

```yml
spring:
  application:
    name: item-service	# 商品微服务id
  cloud:
    nacos:
      server-addr: 192.168.19.130:8848	# Nacos服务注册中心uri
```

```yml
spring:
  application:
    name: cart-service	# 购物车微服务id
  cloud:
    nacos:
      server-addr: 192.168.19.130:8848	# Nacos服务注册中心uri
```

`Nacos`服务注册中心通过名称来区分不同的微服务。

##### 3）引入Nacos服务注册依赖

导入`Nacos`的依赖，再配合配置文件中的`Nacos`服务地址，即可在微服务模块启动时，自动注册到`Nacos`服务注册中心。

```xml
<!-- Alibaba-Nacos -->
<dependency>
	<groupId>com.alibaba.cloud</groupId>
	<artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

#### 2.新建远程API调用模块

由于不同的微服务之间可能存在多种各不相同的远程调用，而且某一微服务模块的开发程序员，对所需要进行远程调用的目标微服务模块代码结构并不熟悉。因此，选择新建一个远程API调用模块来管理远程调用，而不是在每个微服务模块中均编写远程调用接口。

##### 1）创建模块层级结构目录

远程`API`调用模块大致简单分为如下三个软件包。其中`client`包下存放对目标微服务的远程调用接口，`config`包下存放基础配置类，`DTO`包下存放远程调用接口所需要的参数和返回值类型。

```text
├─client
├─config
└─DTO
```

##### 2）设置模块名称

自定义命名模块名称，便于其他微服务模块导入本模块的依赖。

```xml
<groupId>edu.qingchenjia</groupId>	<!-- 组织名称任意 -->
<artifactId>hm-api</artifactId>	<!-- 工件名称任意 -->
```

##### 3）导入相关Maven依赖

分别导入`openfeign`实现微服务远程调用，`loadbalancer`实现负载均衡，`feign-okhttp`使用okhttp代理远程请求。

```xml
<dependencies>
    <!-- OpenFeign -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    <!-- loadbalancer -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-loadbalancer</artifactId>
    </dependency>
    <!-- feign-okhttp -->
    <dependency>
        <groupId>io.github.openfeign</groupId>
        <artifactId>feign-okhttp</artifactId>
    </dependency>
</dependencies>
```

##### 4）配置远程调用日志级别

当某一微服务模块进行远程调用时，远程调用对应的逻辑执行在目标微服务处，因此，当前微服务运行日志中不会包含远程调用的日志。可以通过自定义`OpenFeign`的日志输出级别配置类更改日志输出级别，其中默认级别为`none`。

```java
public class DefaultFeignConfig {
    /**
     * 配置Feign客户端的日志记录级别
     * <p>
     * 此方法定义了一个Spring的@Bean注解，用于配置Feign客户端的日志级别
     * 选择Logger.Level.FULL作为日志级别，意味着将记录所有调用细节，这对于调试和跟踪API调用非常有用
     *
     * @return Logger.Level 返回配置的日志记录级别，此处为FULL
     */
    @Bean
    public Logger.Level feignLogLevel() {
        return Logger.Level.FULL;
    }
}
```

尽管是配置类，但无需加上`@Configuration`注解，开启此配置，只需在对应微服务启动类开启`OpenFeign`的注解上加上此参数即可。

#### 3.完成远程调用

##### 1）引入远程API调用模块的依赖

在微服务模块中引入远程`API`调用模块的依赖，刷新`Maven`依赖配置之后，即可正确调用远程`API`调用模块中的接口。

```xml
<!--api-->
<dependency>
	<groupId>edu.qingchenjia</groupId>
	<artifactId>hm-api</artifactId>
	<version>1.0.0</version>
</dependency>
```

##### 2）分析微服务间远程调用逻辑

购物车微服务中实现查询购物车业务时，需要针对购物车中的商品信息进行实时查询，需要对商品微服务进行调用。

实质上，`SpringBoot`单体项目中的服务层业务交互调用，调用的是其他服务层接口。而`SpringCloud`分布式微服务项目中的远程API调用，调用的是远程`API`调用模块中的`client`层接口，进而向目标微服务的`controller`层发起请求，由`controller`层调用执行服务层逻辑。

```text
SpringBoot单体项目:
	当前Service-->目标Service
SpringCloud分布式微服务项目：
	当前Service-->API模块Client-->目标Controller-->目标Service
```

定位原单体项目中，购物车服务层业务中对商品进行查询的位置。

```java
@Service
@RequiredArgsConstructor
public class CartServiceImpl extends ServiceImpl<CartMapper, Cart> implements ICartService {
    private final IItemService itemService;

    private void handleCartItems(List<CartVO> vos) {
        // 1.获取商品id
        Set<Long> itemIds = vos.stream().map(CartVO::getItemId).collect(Collectors.toSet());
        // 2.查询商品
        List<ItemDTO> items = itemService.queryItemByIds(itemIds);	// 购物车服务层对商品服务接口的调用
        if (CollUtils.isEmpty(items)) {
            return;
        }
        // 3.转为 id 到 item的map
        Map<Long, ItemDTO> itemMap = items.stream().collect(Collectors.toMap(ItemDTO::getId, Function.identity()));
        // 4.写入vo
        for (CartVO v : vos) {
            ItemDTO item = itemMap.get(v.getItemId());
            if (item == null) {
                continue;
            }
            v.setNewPrice(item.getPrice());
            v.setStatus(item.getStatus());
            v.setStock(item.getStock());
        }
    }
}
```

拆分成微服务项目之后，购物车微服务为实现此业务，向商品微服务发送远程调用时，应向执行`itemService.queryItemByIds(itemIds)`逻辑的`controller`层中`API`接口发送`http`请求。

```java
@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
public class ItemController {
    private final IItemService itemService;

    @GetMapping
    public List<ItemDTO> queryItemByIds(@RequestParam("ids") List<Long> ids) {
        return itemService.queryItemByIds(ids);
    }
}
```

商品微服务模块中，`ItemController`中`queryItemByIds`方法恰好执行了该逻辑。因此，购物车微服务向部署商品微服务的`item-service-uri/items`路径携带`itemIds`作为参数，发送`http`的`GET`请求，即可完成交互业务。

##### 3）实现远程调用接口

由此分析可得，`ItemClient`应实现`http`访问`item-service-uri/items`的`GET`请求接口。

```java
@FeignClient("item-service")
public interface ItemClient {
    @GetMapping("/items")
    List<ItemDTO> queryItemByIds(@RequestParam("ids") Collection<Long> ids);
}
```

##### 4）更新服务层业务代码

购物车微服务中服务层业务代码应对应更新。注入`ItemClient`接口，由`Spring`自动装配其实现类。执行其方法`queryItemByIds`方法时，将由`OpenFeign`从注册中心中获取商品微服务`item-service`的`uri`地址，并向`/items`资源路径携带`itemIds`参数发送`GET`类型的`http`请求，获取正确的返回值。

```java
@Service
@RequiredArgsConstructor
public class CartServiceImpl extends ServiceImpl<CartMapper, Cart> implements ICartService {
    private final ItemClient itemClient;

    private void handleCartItems(List<CartVO> vos) {
        // 1.获取商品id
        Set<Long> itemIds = vos.stream().map(CartVO::getItemId).collect(Collectors.toSet());
        // 2.查询商品
        List<ItemDTO> items = itemClient.queryItemByIds(itemIds);	// 远程调用商品微服务接口
        if (CollUtils.isEmpty(items)) {
            return;
        }
        // 3.转为 id 到 item的map
        Map<Long, ItemDTO> itemMap = items.stream().collect(Collectors.toMap(ItemDTO::getId, Function.identity()));
        // 4.写入vo
        for (CartVO v : vos) {
            ItemDTO item = itemMap.get(v.getItemId());
            if (item == null) {
                continue;
            }
            v.setNewPrice(item.getPrice());
            v.setStatus(item.getStatus());
            v.setStock(item.getStock());
        }
    }
}
```

##### 5）启动类开启OpenFeign功能

```java
@SpringBootApplication
@MapperScan("com.hmall.cart.mapper")
@EnableFeignClients(clients = ItemClient.class, defaultConfiguration = DefaultFeignConfig.class)
public class CartApplication {
    public static void main(String[] args) {
        SpringApplication.run(CartApplication.class, args);
    }
}
```

此时，重新启动商品微服务`item-service`和购物车微服务`cart-service`即可实现远程调用。

### 三、写在最后

从单体项目向分布式微服务项目的转变中，原先随意的服务层接口调用，由于微服务模块拆分的缘故，不得不规范化为远程`API`服务调用。`OpenFeign`极大的帮助简化了远程`API`调用的实现，使得开发者能够使用熟悉的`SpringMVC`注解进行快速开发实现相同的功能，加速了开发效率。创建独立的远程`API`调用模块，可以规范项目结构，避免不熟悉目标微服务代码结构而造成错误。