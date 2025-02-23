---
title: SpringBoot集成Mybatis枚举类型转换
typora-root-url: SpringBoot集成Mybatis枚举类型转换
date: 2025-02-23 17:13:02
tags:
---
### 一、前言

数据库表中的列通常选择存储数字，而与数据库表对应的实体类中的相应字段，为避免出现魔法值的情况，通常使用枚举类型来替代。在进行数据持久化操作时，数据库表中的数字与实体类中的枚举类型之间必然会出现类型转换问题。

### 二、解决方案

以高校学生的学历类型为例，编写枚举类进行演示。其中包括`bachelor`、`master`和`college`三类，分别代表本科、硕士和博士，存入数据库中的值对应为了1、2和3。

```java
@Getter
public enum XueliType {
    BACHELOR(1, "本科"),
    MASTER(2, "硕士"),
    COLLEGE(3, "专科");

    private final int code;

    private final String desc;

    XueliType(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }
    
    @JsonCreator
    public static XueliType fromCode(int code) {
        for (XueliType xueliType : XueliType.values()) {
            if (xueliType.code == code) {
                return xueliType;
            }
        }
        throw new IllegalArgumentException("Invalid status code: " + code);
    }
}
```

使用`@JsonCreator`注解能够在`Controller`层接收前端参数时，根据`code`匹配枚举值并自动返回对应枚举值。

#### 1.方案一：使用MybatisPlus注解

原始的`Myabits`框架上并不能直接解决类型转换问题，在其基础上做了全面增强的`MybatisPlus`框架，支持通过注解的方式轻松解决。

使用`@EnumValve`注解，添加到枚举类型的字段上时，该字段将会作为存入数据库中的具体值。

```java
@Getter
public enum XueliType {
	/*...*/

	@EnumValve
    private final int code;

    private final String desc;

    /*...*/
}
```

此时，无论增删改查等数据库操作，凡是涉及`XueliType`字段的操作，`MybatisPlus`都将以`code`字段的值为依据进行处理。

#### 2.方案二：仅使用Mybatis框架

出于多种原因，存在部分开发环境下不允许使用MybatisPlus框架的情况。仅使用`Mybatis`框架则需要更多的步骤，但依然能完美解决。

##### 1）编写枚举类型处理器

在`Mybatis`框架内部提供了抽象类`BaseTypeHandler`，专门用于解决数据持久化操作时的类型转换操作。只需继承该类并实现其抽象方法，即可实现当前枚举类的类型转换操作。

```java
public class XueliTypeTypeHandler extends BaseTypeHandler<XueliType> {
    /**
     * 设置非空参数到PreparedStatement中
     * 此方法用于将XueliType对象中的code字段作为参数绑定到SQL语句中
     *
     * @param preparedStatement SQL预编译语句对象，用于执行SQL操作
     * @param i                 参数索引，指示参数在SQL语句中的位置
     * @param xueliType         XueliType对象，包含要绑定的code值
     * @param jdbcType          JDBC类型，此处未使用，但可能在方法签名中保留以适应框架要求
     * @throws SQLException 如果设置参数过程中发生错误，抛出此异常
     */
    @Override
    public void setNonNullParameter(PreparedStatement preparedStatement, int i, XueliType xueliType, JdbcType jdbcType) throws SQLException {
        // 将XueliType对象的code属性作为整型值绑定到PreparedStatement中的指定位置
        preparedStatement.setInt(i, xueliType.getCode());
    }

    /**
     * 从ResultSet中获取可空的结果，并将其转换为XueliType对象
     * 此方法主要用于数据库操作中，将查询结果中的某列转换为XueliType枚举类型
     *
     * @param resultSet 数据库查询结果对象，用于获取查询结果中的数据
     * @param s         查询结果中列的名称，用于指定需要转换的列
     * @return XueliType枚举类型的对象，表示从数据库中获取的学历类型如果查询结果中指定列的值为null或不在枚举范围内，则返回null
     * @throws SQLException 如果在处理数据库查询结果时发生错误
     */
    @Override
    public XueliType getNullableResult(ResultSet resultSet, String s) throws SQLException {
        // 从查询结果中根据列名获取学历类型的代码值
        int code = resultSet.getInt(s);
        // 根据代码值转换为对应的XueliType枚举类型对象
        return XueliType.fromCode(code);
    }

    /**
     * 从数据库结果集中获取可空的学历类型结果
     * 此方法主要用于处理数据库查询结果中的学历字段，将其转换为对应的枚举类型
     *
     * @param resultSet 数据库查询结果集，用于获取学历字段的值
     * @param i         结果集中学历字段的索引位置
     * @return 对应的学历类型枚举，如果结果集中相应位置的值为空或无效，则返回null
     * @throws SQLException 如果在访问数据库结果集时发生错误
     */
    @Override
    public XueliType getNullableResult(ResultSet resultSet, int i) throws SQLException {
        // 从结果集中根据索引获取学历代码
        int code = resultSet.getInt(i);
        // 根据学历代码返回对应的学历类型枚举
        return XueliType.fromCode(code);
    }

    /**
     * 从CallableStatement中获取可空结果并转换为XueliType对象
     * 此方法主要用于数据库操作中，当执行存储过程时，将结果集中的学历代码转换为对应的XueliType枚举对象
     *
     * @param callableStatement 执行存储过程后返回的CallableStatement对象，用于获取结果集中的数据
     * @param i                 结果集中列的索引，用于指定需要获取数据的列
     * @return XueliType对象，表示从数据库中获取的学历信息，如果结果集中对应位置没有数据，则返回null
     * @throws SQLException 如果在获取结果集中的数据时发生错误，抛出此异常
     */
    @Override
    public XueliType getNullableResult(CallableStatement callableStatement, int i) throws SQLException {
        // 从CallableStatement中获取指定索引位置的整数值，该整数值代表学历代码
        int code = callableStatement.getInt(i);
        // 使用获取的学历代码，通过XueliType枚举的fromCode方法，将代码转换为对应的XueliType对象并返回
        return XueliType.fromCode(code);
    }
}
```

##### 2）注册为Mybatis配置

由于是`SpringBoot`所集成的`Mybatis`框架，编写好的枚举类型处理器需要注册为`Bean`对象，并添加至`Mybaits`配置类中才能生效。

```java
@Configuration
public class MybatisConfig {
	/**
     * 创建并配置学历类型处理器 bean
     * <p>
     * 该方法无需参数
     *
     * @return 返回一个 XueliTypeTypeHandler 类的实例，用于处理特定的学历类型
     */
    @Bean
    public XueliTypeTypeHandler xueliTypeTypeHandler() {
        return new XueliTypeTypeHandler();
    }
}
```

现在就已经可以完成枚举类型与数据库字段的类型转换，正确执行数据持久化操作了。

### 三、写在最后

`Mybatis`是当前最流行的数据持久化操作框架之一，当面临实体类和数据库表中的字段类型转换时，无论是否使用`MybatisPlus`，都可以通过对应的方式进行处理，从而应对不同的开发需求。