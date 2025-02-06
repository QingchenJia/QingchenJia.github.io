---
title: RabbitMQ安装和进阶使用
typora-root-url: RabbitMQ安装和进阶使用
date: 2025-02-06 13:53:53
tags:
---
### 一、引言

针对分布式微服务项目中，为实现各个微服务模块功能的高内聚，避免非必要功能的耦合，应采取异步调用的方式实现其他功能。因此，消息队列成为首选技术，对于并发量一般的项目，`RabbitMQ`能够优秀胜任其工作。

### 二、操作步骤

#### 1.Docker部署RabbitMQ容器

##### 1）拉取RabbitMQ镜像文件

访问`docker`官方仓库，检索`RabbitMQ`镜像文件，查看所需版本`Tag`。

![](../RabbitMQ安装和进阶使用/RabbitMQ-DockerImage.png)

执行镜像拉取命令，默认为拉取最新版本`Tag`。

```bash
docker pull rabbitmq
```

##### 2）部署RabbitMQ容器

成功拉取镜像文件后，通过执行运行命令将镜像部署为容器。

```bash
docker run -e RABBITMQ_DEFAULT_USER=rabbitmq -e RABBITMQ_DEFAULT_PASS=rabbitmq -v rabbitmq:/plugins --name rabbitmq -p 15672:15672 -p 5672:5672 -d rabbitmq
```

`RABBITMQ_DEFAULT_USER`和`RABBITMQ_DEFAULT_PASS`对应`RabbitMQ`控制台的账号与密码。

##### 3）访问控制台

通过浏览器访问`http192.168.19.130:15672`即可进入`RabbitMQ`控制台，成功登陆后进入管理界面。

![](../RabbitMQ安装和进阶使用/RabbitMQ-WebPage.png)

进入`Admin`菜单栏可创建新用户，针对不同项目可对应创建不同用户与虚拟机。其他用户对各自的虚拟机具有足够的开发权限，可对通过`Exchanges`和`Queues`菜单栏针对消息交换机和消息队列进行业务配置。

#### 2.与Spring及其子框架集成

##### 1）引入AMQP依赖

基于`RabbitMQ`采用`AMQP`协议的特性，`Spring`提供了`SpringAMQP`作为消息收发的模板工具。通过`Maven`导入相关依赖即可快速使用。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

依赖版本`version`由`SpringBoot`框架进行管理并自动适配。

##### 2）资源文件Application.yml配置

设置`Spring`应用程序与`RabbitMQ`服务器的连接参数。

```yml
spring:
  rabbitmq:
    host: 192.168.19.130
    port: 5672
    virtual-host: /
    username: rabbitmq
    password: rabbitmq
```

#### 3.基本消息队列处理

##### 1）仅队列消息转发

一般消息队列处理模式为向指定消息交换机发送消息，消息交换机根据其路由断言，将消息转发至指定消息队列，再由消息队列发送消息。此处仅演示最简单的无交换机仅队列消息转发。

通过测试用例代码向`RabbitMQ`服务器发送消息，`SpringAMQP`自动注入`RabbitTmplate`的`Bean`对象，由它来完成消息的发送。

```java
@SpringBootTest
@Slf4j
public class PublisherApplicationTests {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Test
    void testPublishOnlyQueue() {
        String queue = "only_queue";
        rabbitTemplate.convertAndSend(queue, message);
    }
}    
```

声明消费者及其监听的消息队列，通过`@RabbitListener`注解声明当前消费者监听的消息队列为`only_queue`。消费者类应使用`@Component`注解注册为`Spring`管理的`Bean`对象。

```java
@Component
@Slf4j
public class RabbitMqListener {
    @RabbitListener(queues = "work_queue")
    public void listenOnlyQueue(String msg) {
        System.out.println("消费者收到消息：" + msg);
    }
}    
```

##### 2）fanout模式消息转发

`fanout`模式为广播转发，当`fanout`类型消息交换机接受消息后，会将消息转发至所有与其绑定的消息队列。

将消息发送至`amq.fanout`消息交换机，再由`RabbitMQ`服务器自行转发消息。

```java
@SpringBootTest
@Slf4j
public class PublisherApplicationTests {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Test
    void testPublishFanoutQueue() {
        String exchange = "amq.fanout";
        String message = "Hello, RabbitMQ!";
        rabbitTemplate.convertAndSend(exchange, null, message);
    }
} 
```

声明与`amq.fanout`消息交换机所绑定的两个消息队列，`RabbitMQ`服务器将会向两个消息队列均发送消息。

```java
@Component
@Slf4j
public class RabbitMqListener {
    @RabbitListener(queues = "amq.fanout.queue1")
    public void listenFanoutQueue1(String msg) {
        log.info("消费者(1)收到消息：" + msg);
    }

    @RabbitListener(queues = "amq.fanout.queue2")
    public void listenFanoutQueue2(String msg) {
        log.info("消费者(2)收到消息：" + msg);
    }
} 
```

##### 3）direct模式消息转发

`direct`模式为指向模式，当`direct`类型消息交换机接受消息后，会根据路由绑定`key`将消息转发至对应与其绑定的消息队列。

将消息发送至`amq.direct`消息交换机，再由`RabbitMQ`服务器自行转发消息。

```java
@SpringBootTest
@Slf4j
public class PublisherApplicationTests {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Test
    void testPublishDirectQueue() {
        String exchange = "amq.direct";
        String routingKey = "direct";

        Map<String, Object> message = Map.of("language", "Java", "framework", "Spring");

        rabbitTemplate.convertAndSend(exchange, routingKey, message);
    }
}    
```

由于转发的消息类型为`Map`，转发方法的底层消息转换器会将其序列化为不可读字段，因此可以将消息转换器自定义为`Json`格式转换器。

```xml
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
</dependency>
```

```java
@Configuration
@Slf4j
public class RabbitmqConfig {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @PostConstruct
    public void initRabbitTemplate() {
        // 创建并配置消息转换器
        // 设置RabbitTemplate的消息转换器为Jackson2JsonMessageConverter
        Jackson2JsonMessageConverter jackson2JsonMessageConverter = new Jackson2JsonMessageConverter();

        // 应用自定义的消息转换器
        rabbitTemplate.setMessageConverter(jackson2JsonMessageConverter);
    }
}    
```

声明与`amq.direct`消息交换机所绑定的消息队列，消息交换机`amq.direct`与消息队列`amq.direct.queue`通过`direct`作为路由绑定`key`进行绑定，`RabbitMQ`服务器将会根据路由绑定`key`向消息队列发送消息。

```java
@Component
@Slf4j
public class RabbitMqListener {
    @RabbitListener(bindings = @QueueBinding(value = @Queue("amq.direct.queue", durable = "true"),
            exchange = @Exchange("amq.direct"),
            key = "direct"))
    public void listenDirectQueue(Map<?, ?> msg) {
        log.info("消费者收到消息：" + msg);
    }
} 
```

通过`@RabbitListener`注解的`bindings`参数配置可以通过代码实现消息交换机与消息队列的绑定，无需通过`RabbitMQ`控制台进行手动操作。

##### 4）topic模式消息转发

`topic`模式为话题模式，对比`direct`模式单个绑定，可理解为一组相似的消息队列绑定。借助通配符来实现多个相似绑定，`#`匹配一个或多个词，`*`仅匹配一个词。其实现形式与`direct`模式消息转发类似。

#### 4.进阶消息队列处理

##### 1）消费者确认及失败重复机制

当消费者监听得到消息并实现消费逻辑后，应向`RabbitMQ`服务器发送反馈回执。

最优解决方式为`SpringAMQP`利用`AOP`对消息处理逻辑进行环绕增强，当业务正常执行时则自动返回`ack`。当业务出现异常时，根据异常判断返回不同结果。如果是业务异常，会自动返回`nack`。如果是消息处理或校验异常，自动返回`reject`。

```yml
spring:
  rabbitmq:
    listener:
      simple:
        acknowledge-mode: auto
```

将`acknowledge-mode`模式设置为`auto`，即可实现自动处理。

此时若消息被消费失败，则会无限回到消息队列重复投递给消费者，造成死循环。需要对失败消息的重新投递次数做一定限制，以避免此极端情况的发生。

```yml
spring:
  rabbitmq:
    listener:
      simple:
        retry:
          enabled: true # 开启消费者失败重试
          initial-interval: 1000 # 初始的失败等待时长为1秒
          multiplier: 1 # 失败的等待时长倍数，下次等待时长 = multiplier * last-interval
          max-attempts: 3 # 最大重试次数
          stateless: true # true无状态；false有状态。如果业务中包含事务，这里改为false
```

当执行消费逻辑失败后，等待一秒后再次投递消息，最多重复三次即放弃此次消息。此消息将被废弃，无法寻回。

针对多次重试仍然失败的消息，较好的处理方式是，通过配置类中自定义Bean的方式，声明一组处理失败消息的消息交换机和消息队列。当消费失败，重复尝试三次仍然失败之后，失败消息将被投递至该组消息交换机和消息队列。

```java
@Configuration
@Slf4j
public class RabbitmqConfig {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    /**
     * 创建一个用于错误处理的DirectExchange
     * <p>
     * 此方法定义了一个名为errorExchange的Bean，该Bean代表了一个RabbitMQ中的Direct类型交换机
     * 该交换机用于路由错误相关的消息，其特点是：
     * 1. 名称为"error.exchange"
     * 2. 启用了持久化(true)，确保在RabbitMQ重启后，交换机信息不会丢失
     * 3. 关闭了自动删除(false)，意味着当所有相关队列解绑后，该交换机会自动删除
     *
     * @return DirectExchange 返回配置好的DirectExchange实例，用于错误消息的路由
     */
    @Bean
    public DirectExchange errorExchange() {
        return new DirectExchange("error.exchange", true, false);
    }

    /**
     * 声明一个错误处理队列
     * <p>
     * 此方法定义了一个名为error.queue的队列，该队列被标记为持久化且非排他性，不会在使用后自动删除
     * 主要用于接收在消息处理过程中出现错误的消息，便于后续的错误处理和消息重新发送
     *
     * @return 返回一个声明好的错误处理队列实例
     */
    @Bean
    public Queue errorQueue() {
        return new Queue("error.queue", true, false, false);
    }

    /**
     * 创建一个错误消息的绑定
     * 将错误队列绑定到错误交换机，使用固定的路由键"error"
     *
     * @param errorExchange 错误交换机，类型为DirectExchange
     * @param errorQueue    错误队列，类型为Queue
     * @return 返回一个绑定，类型为Binding
     */
    @Bean
    public Binding errorBinding(DirectExchange errorExchange, Queue errorQueue) {
        // 使用BindingBuilder创建绑定，将errorQueue绑定到errorExchange，并指定路由键为"error"
        return BindingBuilder.bind(errorQueue)
                .to(errorExchange)
                .with("error");
    }

    /**
     * 配置一个消息恢复器Bean
     * 该消息恢复器用于在消息处理失败时，重新发布消息到指定的交换机和路由键
     * 主要目的是为了处理消息的异常情况，确保消息不会丢失，并且可以重新尝试处理
     *
     * @param rabbitTemplate RabbitMQ的模板对象，用于消息的发送和接收
     * @return 返回一个消息恢复器实例，用于处理消息的异常情况
     */
    @Bean
    public MessageRecoverer messageRecoverer(RabbitTemplate rabbitTemplate) {
        return new RepublishMessageRecoverer(rabbitTemplate, "error.exchange", "error");
    }
}  
```

##### 2）发送延迟消息

特殊业务环境下，需要向`RabbitMQ`中发送延迟消息。传统的延迟消息需要借助死信交换机，实现起来相对麻烦。`RabbitMQ`提供了一个延迟消息插件`DelayExchange`来实现相同的效果，能够大幅度减少消息交换机和消息队列的多余配置。

![](../RabbitMQ安装和进阶使用/DelayMessage-Plugin.png)

访问`DelayExchange`插件的仓库，通过`Release`下载插件文件。

```bash
docker volume ps
docker volume inspect mq-plugins
```

查看`RabbitMQ`容器的文件挂载路径，将插件文件上传至该目录，再进入容器启用该插件即可实现简化延迟消息发送的功能。

```bash
docker exec -it rabbitmq rabbitmq-plugins enable rabbitmq_delayed_message_exchange
```

声明延迟消息消费者，将延迟消息交换机`delay.exchange`与延迟消息队列`delay.queue`通过`delay`作为路由绑定`key`进行绑定。

```java
@Component
@Slf4j
public class RabbitMqListener {
    @RabbitListener(bindings = @QueueBinding(value = @Queue("delay.queue"),
            exchange = @Exchange(value = "delay.exchange", delayed = "true"),
            key = "delay"))
    public void listenDelayQueue(String msg) {
        log.info("消费者<delay.queue>收到消息：" + msg);
    }
} 
```

向延迟消息交换机`delay.exchange`指定路由绑定`key`为`delay`发送延时`10s`的消息`delay`。

```java
@SpringBootTest
@Slf4j
public class PublisherApplicationTests {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Test
    void testPublishDelayQueue() {
        rabbitTemplate.convertAndSend("delay.exchange", "delay", "delay", new MessagePostProcessor() {
            @Override
            public Message postProcessMessage(Message message) throws AmqpException {
                message.getMessageProperties().setDelay(1000 * 10);
                return message;
            }
        });
    }
} 
```

例如网购下单三十分钟之后未支付即自动取消订单，就使用了延迟消息发送功能。当下单成功后即发送一个延时消息，等待指定时间之后，再判断订单是否成功支付。由此可见，发送延迟消息此功能在实际业务中应用的广泛性。

### 三、写在最后

通过`RabbitMQ`实现分布式微服务之间的异步调用，具有耦合度更低、性能更好、业务拓展性强、故障隔离以避免级联失败等诸多优点，但同时依然存在完全依赖于`Broker`的可靠性、安全性和性能，架构复杂，后期维护和调试麻烦等缺陷。总的来说，依然是利大于弊，其优点自不必说，部分缺点是可以通过良好的软件开发模式和习惯不同程度的缓解的。
