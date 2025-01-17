---
title: SpringBoot项目整合Mybatis-Plus的分页查询
typora-root-url: SpringBoot项目整合Mybatis-Plus的分页查询
date: 2024-11-16 17:57:39
tags:
---
### 一、引言

在基于`SpringBoot`框架进行`Web`项目的后端开发时，关于数据层通常离不开`Mybatis`框架，它能够通过注解或`xml`配置文件的方式，帮助开发者完成与数据库的交互，相较于传统的`JDBC`模式，提升了极大的效率。然而依然存在大量简单`SQL`语句需要手写的的问题，不得不浪费时间在单表的基础操作上。针对于此，`Mybatis-Plus`就成了不二之选，不仅兼容`Mybatis`的基础方法，还对简单`SQL`进行了封装，并提供了分页查询，公共字段自动插入，逻辑删除等进阶操作。

### 二、过程

#### 1.引入相关Maven依赖

以`SpringBoot:3.3.5`版本为例，省略了基本依赖，分别引入`JDBC`和`Mybatis-Plus`与`SpringBoot`框架整合的依赖。

```xml
<dependency>
	<groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

<dependency>
	<groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
    <version>3.5.5</version>
</dependency>
```

值得注意的是，当`SpringBoot`使用3以上版本时，`artfactId`应选择`mybatis-plus-spring-boot3-starter`，否则会出现项目无法正常启动的错误。这是因为，如选择`mybatis-plus-boot-starter`，其子依赖中的`mybatis-spring`依赖版本过低，与当前`SpringBoot`版本已无法适配，从而导致整个项目无法启动。

#### 2.配置Mybatis-Plus数据源

在`application.yml`中进行如下配置，与整合`Mybatis`基本一致。

```yml
datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    url: jdbc:mysql://127.0.0.1:3306/${db_name}?${config}
    username: ${username}
    password: ${password}
```

#### 3.创建数据库表及对应实体类

新建`employee`表，各列名采用下划线命名法，其中`id`为主键，对`username`添加唯一索引，并对操作用户及时间做记录。

```sql
create table employee
(
    id          bigint        not null comment '主键'
        primary key,
    name        varchar(32)   not null comment '姓名',
    username    varchar(32)   not null comment '用户名',
    password    varchar(64)   not null comment '密码',
    phone       varchar(11)   not null comment '手机号',
    sex         varchar(2)    not null comment '性别',
    id_number   varchar(18)   not null comment '身份证号',
    status      int default 1 not null comment '状态 0:禁用，1:正常',
    create_time datetime      not null comment '创建时间',
    update_time datetime      not null comment '更新时间',
    create_user bigint        not null comment '创建人',
    update_user bigint        not null comment '修改人',
    constraint idx_username
        unique (username)
)
    comment '员工信息' collate = utf8mb3_bin;
```

对应新建`employee`实体类，与数据库表中的列项一一对应，并使用驼峰命名法。`serialVersionUID`作为序列化标识符，保证对象的序列化与反序列化的正常一致。

```java
public class Employee implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String username;
    private String name;
    private String password;
    private String phone;
    private String sex;
    private String idNumber;
    private Integer status;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableField(fill = FieldFill.INSERT)
    private Long createUser;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateUser;
}
```

在`application.yml`开启如下配置，使得项目内实体类与数据库表进行驼峰命名与下划线命名的一一映射。

```yml
mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
```

除了配置文件以外，还可以在类名上使用`@Table("${tb_name}")`注解将当前实体类

#### 4.创建MVC三层架构

新建`EmployeeMapper`接口，并继承`BaseMapper<?>`，添加`@Mapper`注解，由`SpringBoot`框架通过反向代理的方式管理其实现类。

```java
@Mapper
public interface EmployeeMapper extends BaseMapper<Employee> {
}
```

新建`EmployeeService`接口，并继承`IService<?>`。

```java
public interface EmployeeService extends IService<Employee> {
}
```

新建`EmployeeMapperImpl`接口，并继承`ServiceImpl<?,?>`，并实现`EmployeeService`接口，通过`@Service`注册为`Bean`由`SpringBoot`框架进行管理。

```java
@Service
public class EmployeeServiceImpl extends ServiceImpl<EmployeeMapper, Employee> implements EmployeeService {
}
```

新建`EmployeeMapperImpl`接口，通过`@RestController`注册为`Bean`由`SpringBoot`框架进行管理并且能够向前端浏览器返回响应数据，使用`@RequestMapping("/employee")`注解配置资源访问路径。

```java
@RestController
@RequestMapping("/employee")
public class EmployeeController {
}
```

#### 5.创建Mybatis-Plus拦截器

拦截器的目的在于，当调用`Mybatis-Plus`的`API`中分页查询方法向数据源发送`SQL`语句时，将`SQL`语句进行拦截，先查询表中元组数量以确定页数，然后在查询语句末根据页号和页大小追加`limit`子句。

```java
@Configuration
public class MybatisPlusConfig {
    /**
     * 配置Mybatis-Plus拦截器
     * <p>
     * 该方法通过@Bean注解声明了一个Bean，类型为MybatisPlusInterceptor
     * 其主要作用是向Mybatis-Plus中添加内置的分页拦截器，以便在执行查询时自动进行分页处理
     *
     * @return MybatisPlusInterceptor 返回配置好的Mybatis-Plus拦截器实例
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        // 创建MybatisPlusInterceptor实例
        MybatisPlusInterceptor mybatisPlusInterceptor = new MybatisPlusInterceptor();
        // 向拦截器中添加分页内置拦截器
        mybatisPlusInterceptor.addInnerInterceptor(new PaginationInnerInterceptor());
        // 返回配置好的拦截器实例
        return mybatisPlusInterceptor;
    }
}
```

#### 6.分页查询示例代码

此处模拟一个真实的分页查询业务，通过员工的姓名进行分页查询，均将查询结果按照更新时间进行倒序排列。若姓名不存在，则进行正常分页查询；若姓名存在，则通过模糊匹配，进行分页查询。

```java
public Page selectPage(Page pageInfo, String name) {
	// 创建Lambda查询包装器，用于构造查询条件
    LambdaQueryWrapper<Employee> queryWrapper = new LambdaQueryWrapper<>();

    // 如果姓名参数不为空也不为空字符串，则添加模糊查询条件
    // 这里使用StringUtil.notNullNorEmpty判断name是否为空或空字符串
    // 如果满足条件，则按照Employee类中的getName方法进行模糊查询
	queryWrapper.like(StringUtil.notNullNorEmpty(name), Employee::getName, name)
			.orderByDesc(Employee::getUpdateTime);  // 添加按照更新时间降序排序的条件

    // 执行分页查询，传入分页信息和查询条件
	page(pageInfo, queryWrapper);

	// 返回填充了查询结果的分页信息对象
	return pageInfo;
}
```

执行`page(pageInfo, queryWrapper)`方法后，`pageInfo`对象被自动赋值，无需返回一个新的`Page`类对象，通过`pageInfo.getRecords()`即可获取查询数据结果。

### 三、写在最后

通过分页查询能够减小数据库执行查询语句的负担，减少数据从数据库到后端再到前端页面的响应时间。同时采用分页的数据渲染形式，能够避免页面过长，需要频繁使用滑动条来定位数据元组，保证当前页数据能够一览无遗。
