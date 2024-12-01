---
title: SpringBoot中实体类Json格式序列化问题
typora-root-url: SpringBoot中实体类Json格式序列化问题
date: 2024-12-01 14:27:24
tags:
---
### 一、引言

在使用`SpringBoot`开发项目时，通常需要将数据以`JSON`格式传递到前端。如果数据库表的主键类型是`BigInt`，对应`Java`实体类的主键类型为`Long`，且主键值是通过雪花算法生成的，可能会在前端展示时出现精度丢失问题。这是因为`Java`的`Long`类型在前端的`JavaScript`中会被解析为`Number`类型，而`Number`类型精度最高为`15`位，超过这个长度时会导致精度丢失。

此外，诸如`LocalDateTime`、`LocalDate`、`LocalTime`等表示时间的类，在不进行任何配置直接进行`JSON`格式的序列化时，会转换成对应的标准时间表示的字符串，对于通过前端进行操作的用户而言这样的表示方式并不友好，因此也需要对上述描述时间的类进行合理的序列化格式配置。

### 二、方案一

#### 1.自定义ObjectMapper子类

自定义`JacksonObjectMapper`类继承`ObjectMapper`类，注册`Long`、`BigInteger`类型的序列化器，将其序列化为`String`类型，同时为`LocalDateTime`、`LocalDate`、`LocalTime`分别注册序列化和反序列化器，分别使用常用时间表示格式。

```java
public class JacksonObjectMapper extends ObjectMapper {
    public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
    public static final String DEFAULT_DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String DEFAULT_TIME_FORMAT = "HH:mm:ss";

    public JacksonObjectMapper() {
        super();
        // 忽略未知属性
        this.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        // 自定义模块
        SimpleModule simpleModule = new SimpleModule()
                .addSerializer(BigInteger.class, ToStringSerializer.instance) // BigInteger 序列化为字符串
                .addSerializer(Long.class, ToStringSerializer.instance)       // Long 序列化为字符串
                .addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_FORMAT)))
                .addSerializer(LocalDate.class, new LocalDateSerializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_FORMAT)))
                .addSerializer(LocalTime.class, new LocalTimeSerializer(DateTimeFormatter.ofPattern(DEFAULT_TIME_FORMAT)))
                .addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_FORMAT)))
                .addDeserializer(LocalDate.class, new LocalDateDeserializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_FORMAT)))
                .addDeserializer(LocalTime.class, new LocalTimeDeserializer(DateTimeFormatter.ofPattern(DEFAULT_TIME_FORMAT)));

        this.registerModule(simpleModule);
    }
}
```

#### 2.配置项目全局生效

在`SpringBoot`项目的配置类中注册自定义的`JacksonObjectMapper`，新建消息转换器实例对象，将`JacksonObjectMapper`实例化添加到消息转换器实例中，最后将消息转换器示例添加到列表首位以优先实现该配置。

```java
@Configuration
public class WebMvcConfig extends WebMvcConfigurationSupport {
    /**
     * 扩展消息转换器列表
     * <p>
     * 该方法用于向Spring的HTTP消息转换器列表中添加自定义的消息转换器
     * 通过覆盖此方法，可以定义如何处理HTTP请求和响应的数据序列化和反序列化
     *
     * @param converters 消息转换器列表，可以添加、修改或移除其中的转换器
     */
    @Override
    protected void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        // 创建一个MappingJackson2HttpMessageConverter实例，用于处理JSON数据的转换
        MappingJackson2HttpMessageConverter messageConverter = new MappingJackson2HttpMessageConverter();

        // 设置自定义的ObjectMapper，以实现特定的序列化和反序列化逻辑
        messageConverter.setObjectMapper(new JacksonObjectMapper());

        // 将自定义的消息转换器添加到列表的最前面，确保它优先被使用
        converters.addFirst(messageConverter);
    }
}
```

### 三、方案二

以`Employee`实体类为例，其中`Long`类型的`id`为主键，对其加上`@JsonFormat(shape = JsonFormat.Shape.STRING)`注解，可使得实例化对象序列化为`JSON`格式时，`Long`类型自动转换为`String`类型。对于类型为`LocalDateTime`的`createTime`和`updateTime`，加上`@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")`注解可使得序列化过程中，自动转换为`pattern`格式的字符串。

```java
@Data
public class Employee implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;

    private String username;

    private String name;

    private String password;

    private String phone;

    private String sex;

    private String idNumber;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;

    @TableField(fill = FieldFill.INSERT)
    private Long createUser;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateUser;
}
```

### 四、写在最后

采用全局配置能够简单高效的将格式化规则应用于整个项目，但需要书写本身不熟悉的配置类，容易因API的语法调用错误导致大量的时间浪费。使用注解的方式可以灵活的处理需要进行配置的成员变量，但当实体类数量庞大时，需要频繁添加同样的注解，造成大量重复性的工作，可以考虑将通用的属性例如`id`、`createTime`、`updateTime`抽象到基类中，所有实体类均继承该基类。