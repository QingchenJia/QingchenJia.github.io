---
title: JWT令牌实现登录状态认证
typora-root-url: JWT令牌实现登录状态认证
date: 2025-03-03 23:08:17
tags:
---

### 一、引言

`Web`应用软件开发过程中，不可忽视也是最重要的一点，就是保存用户的登录状态。传统的`Session`方式，主要依赖于服务器的会话信息存储。随着后端服务的扩展，单台服务器性能不足以支撑。多实例服务器的部署，则会导致用户登录状态无法在多个服务器实例中同步。为解决此问题，提出了`JWT`令牌的方式。用户登陆成功以后，根据必要信息生成`token`值返回前端，此后每一次`http`请求均携带此`token`，后端即可解析`token`得到用户的登陆状态。

### 二、操作步骤

#### 1.导入JWT依赖项

`SpringBoot`框架下项目的第三方工具包均通过`Maven`进行管理，通过导入`Maven`依赖的方式即可使用`JWT`令牌。`JWT`令牌技术适用于整个`Web`应用软件，并不只局限于`Java`语言，针对`Java`语言应选择`JJWT`依赖进行导入。

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
</dependency>

<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <scope>runtime</scope>
</dependency>

<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId> <!-- or jjwt-gson if Gson is preferred -->
    <scope>runtime</scope>
</dependency>
```

此三项依赖缺一不可，其中依赖版本可由父模块`pom.xml`文件进行依赖管理。

#### 2.自定义token生成方法

该字符串为生成的`JWS`示例，`JWS`即为被签名的`JWT`。`JWS`被`.`分割为三个部分：其中左部为`Header`，包含签名算法和令牌类型等信息；中部为`Payload`，包含实际数据；右部为`Signature`，是对头部和载荷的签名，用于验证消息完整性和真实性。

```text
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKb2UifQ.1KP0SsvENi7Uz1oQc07aXTL7kpQG5jBNIybqr60AlD4
```

在生成`token`的方法中，应为`JWT`构造器提供完整的`Header`、`Payload`和`Signature`三个参数，同时为符合业务真实性，还应设置`token`过期时间。例如存储用户信息需要`id`和`username`两个字段。

```java
public class JwtUtil {
    public static final SecretKey secretKey = Keys.hmacShaKeyFor("abcdefghijklmnopqrstuvwxyzabcdef".getBytes(StandardCharsets.UTF_8));

    /**
     * 创建一个JWT令牌
     *
     * @param id       用户ID，用于令牌中的claims部分
     * @param username 用户名，用于令牌中的claims部分
     * @return 生成的JWT令牌字符串
     */
    public static String createToken(Long id, String username) {
        // 使用Jwts.builder()创建JWT令牌构建器
        return Jwts.builder()
                // 设置令牌的主题为"LOGIN_USER"
                .setSubject("LOGIN_USER")
                // 设置令牌的过期时间为当前时间加上60分钟
                .setExpiration(new Date(System.currentTimeMillis() + 60 * 60 * 1000L))
                // 添加自定义claims，包含用户ID和用户名
                .addClaims(Map.of("id", id, "username", username))
                // 使用HS256算法和秘密密钥对令牌进行签名
                .signWith(secretKey, SignatureAlgorithm.HS256)
                // 将令牌构建为紧凑的字符串形式并返回
                .compact();
    }
}    
```

`Header`通常不需要手动填充，`JWT`库会默认设置常见的字段，如`alg`和`typ`。`Payload`部分需由手动填充，`subject`和`claim`等字段均属于`Payload`部分。`Signature`可自定义密钥`key`和签名算法，通常密钥`key`应和签名算法匹配。

#### 3.自定义token解析方法

```java
public class JwtUtil {
    public static final SecretKey secretKey = Keys.hmacShaKeyFor("abcdefghijklmnopqrstuvwxyzabcdef".getBytes(StandardCharsets.UTF_8));

    /**
     * 解析JWT token并返回其中的claims信息
     *
     * @param token 待解析的JWT token字符串
     * @return 解析后的Claims对象，包含token中的各种信息
     * @throws JwtException 当token为空或无效时抛出异常
     */
    public static Claims parseToken(String token) {
        // 检查token是否为空，如果为空则抛出异常，表示用户未登录或token未提供
        if (token == null) {
            throw new RuntimeException();
        }

        // 创建JwtParser对象，用于解析JWT token
        JwtParser jwtParser = Jwts.parserBuilder()
            	.setSigningKey(secretKey)
            	.build();

        Claims claims;
        try {
            // 尝试解析token中的claims信息
            claims = jwtParser.parseClaimsJws(token).getBody();
        } catch (ExpiredJwtException e) {
            // 如果token已过期，捕获异常并抛出
            throw e;
        } catch (JwtException e) {
            // 如果token无效或解析失败，捕获异常并抛出
            throw e;
        }

        // 返回解析后的claims信息
        return claims;
    }
}    
```

获取`token`并解析时，若`token`已过期则抛出过期异常，其余所有异常均抛出`token`无效异常。将解析成功的`Claims`参数返回，由用户登录拦截器接收并读取登录用户的信息。

#### 4.存储线程变量

定义包含`id`和`username`两字段的`POJO`，实例化登录用户的必要信息。

```java
@Data
@AllArgsConstructor
public class LoginUser {
    private Long id;

    private String username;
}
```

使用`SpringBoot`框架的项目中，从前端发起的每一次`http`请求，都会开辟一条独立的线程进行运行。将登录用户的必要信息，存入线程变量，能够保证一次`http`请求的线程内的用户信息的安全。

```java
public class LoginUserHolder {
    public static ThreadLocal<LoginUser> threadLocal = new ThreadLocal<>();

    public static void setLoginUser(LoginUser loginUser) {
        threadLocal.set(loginUser);
    }

    public static LoginUser getLoginUser() {
        return threadLocal.get();
    }

    public static void remove() {
        threadLocal.remove();
    }
}
```

#### 5.配置登录拦截器

登录相关之外的所有资源接口，其访问请求处理之前均须通过拦截器进行处理。从请求头中读取`token`后进行解析，从解析结果中获取当前登陆用户的`id`和`username`信息，并存入线程变量以待后续业务使用。

```java
@Component
public class AuthenticationInterceptor implements HandlerInterceptor {
    /**
     * 在请求处理之前进行拦截处理
     *
     * @param request  请求对象，用于获取请求头中的token信息
     * @param response 响应对象，可用于处理拦截后的响应
     * @param handler  处理器，可以用于判断拦截器链中的下一个处理器
     * @return boolean 恒久化为true，表示请求通过拦截器继续执行
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 从请求头中获取token信息
        String token = request.getHeader("access-token");

        // 解析token并获取claims信息
        Claims claims = JwtUtil.parseToken(token);
        // 从claims中获取用户ID和用户名
        Long id = claims.get("id", Long.class);
        String username = claims.get("username", String.class);
        // 设置当前登录用户信息
        LoginUserHolder.setLoginUser(new LoginUser(id, username));

        // 表示请求通过拦截器继续执行
        return true;
    }

    /**
     * 在请求完成后清除登录用户信息
     * <p>
     * 本方法是拦截器中的一个回调方法，它在请求处理完成后被调用
     * 它的主要作用是清除可能存储在会话或请求范围内的登录用户信息，以避免内存泄漏或信息污染
     *
     * @param request  请求对象，代表当前的HTTP请求
     * @param response 响应对象，代表当前的HTTP响应
     * @param handler  处理当前请求的处理器对象
     * @param ex       请求处理过程中抛出的异常，如果没有异常，则为null
     *                 <p>
     *                 注意：本方法的实现仅清除登录用户信息，并不处理异常情况
     */
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        LoginUserHolder.remove();
    }
}
```

当一次`http`访问请求处理完毕后，从线程变量中移除登录用户的信息，防止资源占用导致服务性能下降。

### 三、写在最后

`JWT`令牌技术良好的解决了`Session`会话在多服务器实例部署下，无法实现`Session`信息同步的问题。同时，其负载有效数据的相关API较之`Session`操作更加简单易读。所提供的多种签名算法，也能够在一定程度上保证`JWT`令牌的安全性，防止其被恶意篡改所导致的安全问题。
