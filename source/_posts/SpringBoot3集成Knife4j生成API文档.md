---
title: SpringBoot3集成Knife4j生成API文档
typora-root-url: SpringBoot3集成Knife4j生成API文档
date: 2024-11-25 18:51:57
tags:
---
### 一、引言

`Knife4j`是基于`Swagger`的`API`测试文档生成框架，能够扫描`SpringMVC`框架下的`Controller`包中的类文件，并根据`API`接口生成对应的文档，支持在线调试和离线导出，极大的简化了前后端分离开发时，后端工作人员的调试和文档编写工作。

### 二、操作步骤

#### 1.Knife4j依赖导入

视`SpringBoot`版本而定，所需要导入的`Knife4j`依赖版本应随之变化。下表给出了不同的`SpringBoot`版本所对应的不同的`Knife4j`的依赖版本，具体详情可见`Knife4j`官方文档中[关于`SpringBoot`版本兼容性部分](https://doc.xiaominfo.com/docs/quick-start/start-knife4j-version#2spring-boot%E7%89%88%E6%9C%AC%E5%85%BC%E5%AE%B9%E6%80%A7)。
| Spring Boot版本 | Knife4j Swagger2规范  | Knife4j OpenAPI3规范 |
| :---------------: | :---------------------: | :--------------------: |
| 1.5.x~2.0.0     | <Knife4j 2.0.0        | >=Knife4j 4.0.0      |
| 2.0~2.2         | Knife4j 2.0.0 ~ 2.0.6 | >=Knife4j 4.0.0      |
| 2.2.x~2.4.0     | Knife4j 2.0.6 ~ 2.0.9 | >=Knife4j 4.0.0      |
| 2.4.0~2.7.x     | >=Knife4j 4.0.0       | >=Knife4j 4.0.0      |
| >= 3.0          | >=Knife4j 4.0.0       | >=Knife4j 4.0.0      |

以`SpringBoot3.3.5`版本为例，在导入依赖时应选择`4.0.0`及以上版本。

```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
    <version>4.4.0</version>
</dependency>
```

#### 2.配置文件编写

编写`Knife4j`基础配置，在`springdoc.group-configs.packages-to-scan`配置项下对应填写`Controller`层类的包名。

```yml
# springdoc-openapi项目配置
springdoc:
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: alpha
  api-docs:
    path: /v3/api-docs
  group-configs:
    - group: 'default'
      paths-to-match: '/**'
      packages-to-scan: ${package}
# knife4j的增强配置，不需要增强可以不配
knife4j:
  enable: true
  setting:
    language: zh_cn
```

#### 3.新建Knife4j配置类

配置文件中不支持的配置项可以通过配置类的方式以代码实现，在这个类中配置了文档的标题、版本、描述以及作者的信息。

```java
@Configuration
public class Knife4jConfig {
    /**
     * 配置自定义的OpenAPI信息
     * <p>
     * 此方法用于生成和配置应用程序的API文档信息，包括标题、版本、描述和联系人信息
     * 它使用Spring框架的@Bean注解来定义一个Bean，这样Spring就可以自动管理这个OpenAPI实例
     *
     * @return OpenAPI 实例，包含应用的API文档信息
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("ReggieTakeOut")
                .version("1.0")
                .description("ReggieTakeOut项目-API接口文档")
                .contact(new Contact()
                        .name("Qingchen Jia")
                        .url("https://github.com/QingchenJia"))
        );
    }
}
```

#### 4.资源路径映射

`API`文档对应的静态资源文件路径在导入依赖的jar包中，因此直接访问资源无法成功，需要进行静态资源的路径映射。

```java
@Configuration
public class WebMvcConfig extends WebMvcConfigurationSupport {
    /**
     * 重新映射静态资源路径
     *
     * @param registry 资源处理器注册表，用于注册资源处理器
     */
    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
		// 映射Swagger UI的文档请求
        registry.addResourceHandler("doc.html")
                .addResourceLocations("classpath:/META-INF/resources/");
        // 映射webjars资源请求
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");
        // 映射favicon.ico请求
        registry.addResourceHandler("/favicon.ico")
                .addResourceLocations("classpath:/META-INF/resources/");
    }
}    
```

#### 5.访问API文档Url

至此已经完成了基本的导入配置，启动项目后可以通过`http://IP:port/doc.html`进入根据当前项目对应生成的`API`接口文档。

### 三、其他问题

#### 1.拦截器问题

如果项目配置有登录拦截器，将会对`Knife4j`相关资源路径进行拦截并判断是否登录，对于`API`文档自然是离线访问，因此需要在登录拦截器中排除相关资源路径。

```java
@Configuration
public class WebMvcConfig extends WebMvcConfigurationSupport {
    @Autowired
    private LoginCheckInterceptor loginCheckInterceptor;

    /**
     * 添加拦截器配置
     * <p>
     * 该方法用于向应用程序添加拦截器，以在请求处理之前或之后执行特定逻辑
     * 在本例中，我们添加了一个登录检查拦截器，以确保只有经过身份验证的用户才能访问受保护的资源
     *
     * @param registry 拦截器注册表，用于添加和配置拦截器
     */
    @Override
    protected void addInterceptors(InterceptorRegistry registry) {
        // 注册登录检查拦截器，并应用到几乎所有路径
        // 但排除了一些特定路径，如登录和注销路径，以及前端和后端的静态资源路径
        registry.addInterceptor(loginCheckInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                		// 此处省略业务代码的资源路径开放
                        // Swagger UI相关路径
                        "/doc.html",
                        "/webjars/**",
                        "/v3/api-docs/**",
                        "/swagger-ui.html",
                        "/favicon.ico"
                );
    }
}
```

#### 2.JSON序列化问题

为确保`LocalDateTime`、`LocalDate`、`LocalTime`类的自定义格式序列化，自定义`JacksonObjectMapper`类对全局的序列化和反序列化规则进行了相应的配置。这就导致了在进行访问API接口文档时，其返回值出现了`JSON`格式的序列化错误，需要对`JacksonObjectMapper`在消息转换器中的位置顺序进行调整。

初始代码为`converters.addFirst(converters.size(), messageConverter);`，阅读[`Knife4j`文档请求异常](https://blog.csdn.net/nofaliure/article/details/135481301?spm=1001.2014.3001.5506)贴子，其给出的解决方法是将这行代码修改为`converters.add(converters.size() - 1, messageConverter);`。

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
        converters.add(converters.size() - 1, messageConverter);
    }
}      
```

### 四、写在最后

`Knife4j`是一个集`Swagger2`和`OpenAPI3` 为一体的增强解决方案，能够帮助开发者快速聚合使用`OpenAPI`规范。结合`Knife4j`不仅能够帮助新项目快速生成`API`接口文档，协助开发调试，同时还能在维护旧项目时为其生成新的更实时的文档，提高维护效率。