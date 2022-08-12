### WWW(World Wide Web 万维网)

在网页出来之前，人们是通过邮件交流互相传递信息，使用FTP下载文件附件，根本没有互联网，更没有html，css，www 组织是如何做到只要输入网址就能浏览网页的？用了这么多年浏览器，这真是一个令人匪夷所思的事件!！！那我们来看看到底是谁做了哪些神奇的事情，才让我们有机会处于这样一个信息时代。

在 1990年左右，Tim Berners-Lee 发明了第一个页面 ，第一个服务器，第一个浏览器，这是一个简单而完美的系统，合称万维网，至此以后便打开了一个新的世界，WWW可以让web客户端（常用浏览器）通过互联网访问web服务器上的页面（Html，Hypertext Markup Language 超文本标记语言），这是一个由许多互相链接的超文本组成的系统，这个系统中，每个有用的事物称为“资源”，并且有一个全局统一资源标识符（URI：Uniform Resource Identifier）标识，这些资源通过超文本传输协议（Http，Hypertext Transfer Protocol)传送给用户，而用户通过点击链接来获得资源，浏览页面或下载文件。

在这里，万维网不等同于互联网，万维网只是互联网所能提供的服务其中之一，是靠着互联网运行的一项服务。

以上提到WWW核心三个概念：

1. URI，俗称网址，能让你访问一个页面
2. HTTP，两个电脑之间传输内容的协议，让你能下载这个页面
3. HTML，超级文本，主要用来做页面跳转, 让你能看懂这个页面。

### URL 与 URI

URI（Uniform Resource Identifier），统一资源标识符，就是方便找到资源，分为 URL 和 URN。

URL(Uniform Resource Locator), 统一资源定位符，就是给我们一个地址作为网址。

那问题来了，URN是什么玩意？？Uniform Resource Name，统一资源名称，为每个资源取一个ISBN编号，是唯一确定的编号，如果要是用它，我们得知道这个编号啊，那么当然URL首选。

URL的常见组成如下:

<img src="https://orangesolo.cn/assets/image/e87734cebcf567e1fcf70de33c87000e.png" alt="" class="md-img" loading="lazy"/>

### DNS（Domain Name System域名系统）

一般我们输入网址查找资源，但浏览器并不只是通过网址拿到资源，而是预先拿到资源对应的服务器IP地址，可网址上没有IP，但浏览器可以通过域名拿到IP，这项服务便是DNS，浏览器会先将网址发给DNS服务器，DNS经过域名解析后返回给浏览器一个IP，然后浏览器拿到这个IP去找对应的服务器进行连接下载资源。

为什么不直接使用IP呢？？？

原来因为IP太难记了，所以产生了域名这一种字符型标识，一个字符串，它比IP地址更容易记忆，域名可以理解为IP地址的简称，需要注意的是，一个域名可以对应多个IP，即有多个服务器，可以尝试通过命令行来找到百度的IP : nslookup baidu.com , 输出 Address: 220.181.38.148，百度有很多台服务器，所以每个人输出的地址都不一样，DNS会返回离你最近的服务器IP。

### 服务器和浏览器沟通

Server + Client + http 系统：

1. 浏览器 （Client ）负责发起请求
2. 服务器（Server）在 80 端口接收请求
3. 服务器负责返回内容（响应）
4. 浏览器负责下载响应内容

HTTP 的作用就是指导浏览器和服务器如何进行沟通，响应成功和失败应该怎么返回，沟通的结果怎么表示

更专业一点来说，http负责规定请求报文上该怎么写，响应报文该怎么写，当访问一个网页时，浏览器会向网页所在服务器发出请求，当浏览器接收并显示网页前，此网页所在的服务器会返回一个包含HTTP状态码的信息头给浏览器，浏览器从报文中找到对应资源，同理，服务器也会先拿到http信息头，然后再做对应的事情。

服务器有很多接口，每个接口有固定的用法。

<img src="https://orangesolo.cn/assets/image/29d04f97851406f5a45cf88ef4754877.png" alt="" class="md-img"/>

### curl 命令 与 请求和响应

curl 用于转到一个URL

-s（slient）: 安静一点，不显示进度或者错误信息

-v（verbose）:详细的，繁琐的，显示请求和响应，以 “>”开头的为请求信息，"<"开头的为响应信息，“*”开头的为注释内容，

-d <data>: 向服务器发送的数据

-H（header)"senyi:XXX" 添加一个请求头

-X <command> 指定请求方法，默认get，想要POST 则为 -X POST

示例：curl https.www.baidu.com > baidu.html 将百度首页代码拷贝到bai.html文件

### 请求的格式

```
1 动词 路径 协议/版本
2 Key1: value1
2 Key2: value2
2 Key3: value3
2 Content-Type: application/x-www-form-urlencoded
2 Host: www.baidu.com
2 User-Agent: curl/7.54.0
3 
4 要上传的数据
```

请求最多包含四部分，最少包含三部分。（也就是说第四部分可以为空）

第三部分永远都是一个回车（\n）用于区分第二部分和第四部分，第四部分可能是密码

动词有 GET POST PUT PATCH DELETE HEADOPTIONS 等

put 整体更新，patch 局部更新

这里的路径包括查询参数，但不包括锚点

如果没有写路径，那么路径默认为 /

第 2 部分中的 Content-Type 标注了第 4 部分的格式

使用google查看请求内容:

f12 > network > 打开任意get请求，查看Request Headers ，点击view source查看源代码!

用户登录发送请求：选择preserve log保留所有请求

请求和响应的四部分中 前三个在headers里面，第四部分在response里面

### 响应的格式

```
1 协议/版本号 状态码 状态解释
2 Key1: value1
2 Key2: value2
2 Content-Length: 17931
2 Content-Type: text/html 第四部分的格式
3
4 要下载的内容
```

即使是同一个请求，用GET 请求和 POST 请求对应的响应可以一样，也可以不一样

响应的第四部分可以很长很长很长

第 2 部分中的 Content-Type 标注了第 4 部分的格式

第 2 部分中的 Content-Type 遵循 MIME 规范

### HTTP状态码

状态码是服务器对浏览器说的话

具体如下：

```
1xx（响应信息）
101 switch protocol ：切换协议，服务器根据客户端的请求切换协议

2XX（响应成功）
200 ok :服务器已经成功处理请求
201 created ：该请求已成功，并因此创建了一个新的资源。这通常是在PUT请求之后发送的响应。（用户新建或修改数据成功）
202 accept ：一个请求已经进入后台，但还未响应
204 no content : 服务器成功处理了请求，但不需要返回任何实体内容（用户删除成功）
206 Partial Content：服务器成功处理了部分GET请求，类似于迅雷这种HTTP下载工具都是使用此类响应实现断点续传，或者将一个大文档分解为多个下载段同时下载。

3XX（重定向）
301 move permanently：永久重定向
302 Moved Temporarily：临时重定向，该资源原本确实存在，但已经被临时改变了位置
304 no modified：网页上次请求没有更新，使用缓存,节省带宽和开销
307 临时重定向，与302重定向有所区别的地方在于，收到307响应码后，客户端应保持请求方法不变向新的地址发出请求

4XX（客户端请求出错）
400 bad request ： 服务器不理解请求的语法
401 unauthorized : 用户没有权限（用户名，密码输入错误）
403 forbidden : 用户得到授权（401相反），但是访问被禁止
404 not found : 服务器找不到请求的网页
405 Method not Allowed：请求行中指定的方法不能访问相应的资源
408 request timeout : 请求超时,客户端没有在服务器预备等待的时间内完成一个请求的发送。

5XX（服务器发生内部错误）
500 interval server error : 服务器遇到未知错误，无法处理请求
501 not implemented :此请求方法不被服务器支持且无法被处理,只有GET和HEAD是要求服务器支持的
502 Bad gateway：作为网关或者代理工作的服务器尝试执行请求时，从上游服务器接收到无效的响应。
503 service unavailable : 服务器目前无法使用（超载或停机维护）
505 http version not support :服务器不支持请求的HTTP协议的版本，无法完成处理
```

970823203

1539176051099

1549176021357
