### 缓存分类

缓存分为两种：强缓存和协商缓存

#### 强缓存

不会向服务器发送请求，直接从缓存中读取资源，在chrome控制台的Network选项中可以看到该请求返回200的状态码，并且size显示from disk cache或from memory cache两种（灰色表示缓存）。

<img src="https://orangesolo.cn/assets/image/5a107780646c853eda8214bdfa00b758.png" alt="" class="md-img" loading="lazy"/>

可以看到加载时间都是几毫秒。

#### 协商缓存

向服务器发送请求，服务器会根据这个请求的request header的一些参数来判断是否命中协商缓存，如果命中，则返回304状态码并带上新的response header通知浏览器从缓存中读取资源；

共同点：都是从客户端缓存中读取资源；
区别是强缓存不会发请求，协商缓存会发请求。

### 相关Header

#### （一）强缓存

Expires ：response header里的过期时间，浏览器再次加载资源时，如果在这个过期时间内，则命中强缓存。

Cache-Control:当值设为max-age=300时，则代表在这个请求正确返回时间（浏览器也会记录下来）的5分钟内再次加载资源，就会命中强缓存。

区别：

- Expires 是http1.0的产物，Cache-Control是http1.1的产物
- 两者同时存在的话，Cache-Control优先级高于Expires
- Expires其实是过时的产物，现阶段它的存在只是一种兼容性的写法

#### （二）协商缓存

##### ETag和If-None-Match

Etag是上一次加载资源时，服务器返回的response header，是对该资源的一种唯一标识

只要资源有变化，Etag就会重新生成

浏览器在下一次加载资源向服务器发送请求时，会将上一次返回的Etag值放到request header里的If-None-Match里

服务器接受到If-None-Match的值后，会拿来跟该资源文件的Etag值做比较，如果相同，则表示资源文件没有发生改变，命中协商缓存。

##### Last-Modified和If-Modified-Since

Last-Modified是该资源文件最后一次更改时间,服务器会在response header里返回

同时浏览器会将这个值保存起来，下一次发送请求时，放到request header里的If-Modified-Since里

服务器在接收到后也会做对比，如果相同则命中协商缓存

- 在精确度上，Etag要优于Last-Modified，Last-Modified的时间单位是秒，如果某个文件在1秒内改变了多次，那么他们的Last-Modified其实并没有体现出来修改，但是Etag每次都会改变确保了精度
- 在性能上，Etag要逊于Last-Modified，毕竟Last-Modified只需要记录时间，而Etag需要服务器通过算法来计算出一个hash值。
- 在优先级上，服务器校验优先考虑Etag。

所以，两者互补。

强缓存 VS 协商缓存：最好是配合在一起用，争取最大化的减少请求，利用缓存，节约流量。

#### 浏览器缓存过程

浏览器第一次加载资源，服务器返回200，浏览器将资源文件从服务器上请求下载下来，并把response header及该请求的返回时间(要与Cache-Control和Expires对比)一并缓存；

下一次加载资源时，先比较当前时间和上一次返回200时的时间差，如果没有超过Cache-Control设置的max-age，则没有过期，命中强缓存，不发请求直接从本地缓存读取该文件（如果浏览器不支持HTTP1.1，则用Expires判断是否过期）；

如果时间过期，服务器则查看header里的If-None-Match和If-Modified-Since ；

服务器优先根据Etag的值判断被请求的文件有没有做修改，Etag值一致则没有修改，命中协商缓存，返回304；如果不一致则有改动，直接返回新的资源文件带上新的Etag值并返回 200；

如果服务器收到的请求没有Etag值，则将If-Modified-Since和被请求文件的最后修改时间做比对，一致则命中协商缓存，返回304；不一致则返回新的last-modified和文件并返回 200；

使用协商缓存主要是为了进一步降低数据传输量，如果数据没有变，就不必要再传一遍。

### 用户行为对浏览器缓存的控制

#### 地址栏访问

链接跳转是正常用户行为，将会触发浏览器缓存机制【浏览器发起请求，按照正常流程，本地检查是否过期，或者服务器检查新鲜度，最后返回内容】

#### 刷新按钮/ F5刷新

浏览器会设置max-age=0，跳过强缓存判断，会进行协商缓存判断【浏览器直接对本地的缓存文件过期，但是会带上If-Modifed-Since，If-None-Match（如果上一次response header 里有Last-Modified, Etag）这就意味着服务器会对文件检查新鲜度，返回结果可能是304，也有可能是200.】

#### 刷新按钮（硬性重新加载）

跳过强缓存和协商缓存，直接从服务器拉取资源。【浏览器不仅会对本地文件过期，而且不会带上If-Modifed-Since，If-None-Match，相当于之前从来没有请求过，返回结果是200.】

对于该 [链接](https://leetcode.cn/problems/permutation-sequence/)

第一次访问（通过地址栏）

<img src="https://orangesolo.cn/assets/image/a208c6eb8094f63b4ed2d525689912f3.png" alt="" class="md-img" loading="lazy"/>

返回 etag 和 last-modified

第二次访问 （刷新按钮）

<img src="https://orangesolo.cn/assets/image/e3989248734d6caefab59598dfc2a6ec.png" alt="" class="md-img" loading="lazy"/>

请求头包含 if-modified-since 和 if-none-match，命中协商缓存，返回 304

第三次访问（刷新按钮 ：硬性重新加载）

<img src="https://orangesolo.cn/assets/image/d8559125b4c77179969d26ab6fee98ba.png" alt="" class="md-img" loading="lazy"/>

请求头不包含之前缓存的  if-modified-since 和 if-none-match，返回 200，请求过程与初次请求一样

### 如何不缓存

对于spa应用，前端资源上到 cdn 之后，对于 js css 资源一般都会有hash对应唯一的资源，可html是可变的，不能使用缓存。

#### Cache-Control

- no-cache: 虽然字面意义是“不要缓存”。但它实际上的机制是，仍然对资源使用缓存，但每一次在使用缓存之前必须向服务器对缓存资源进行验证。
- no-store: 不使用任何缓存

```txt
知乎首页机制：
cache-control: private, must-revalidate, no-cache, no-store, max-age=0

github 首页机制：
cache-control: max-age=0, private, must-revalidate
```

如果是 http1.0 Expires设为当前时间之前

#### 前端配置

1 在引用js、css文件的url后边加上 ?+Math.random() 或者是可控的情况下加上版本号

```js
<script type=“text/javascript” src=“/js/test.js?v=1”></script>
```

2 设置html页面不让浏览器缓存的方法

```html
<meta http-equiv="Cache-Control" content="no-cache" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

Pragma: 禁止浏览器从本地计算机的缓存中访问页面内容。

### 浏览器资源缓存位置

资源缓存的位置一共有 3 种，按优先级从高到低分别是：Service Worker 、Memory Cache、Disk Cache

1 Service Worker：Service Worker 运行在 JavaScript 主线程之外，虽然由于脱离了浏览器窗体无法直接访问 DOM，但是它可以完成离线缓存、消息推送、网络代理等功能。它可以让我们自由控制缓存哪些文件、如何匹配缓存、如何读取缓存，并且缓存是持续性的。当 Service Worker 没有命中缓存的时候，需要去调用 fetch 函数获取数据。也就是说，如果没有在 Service Worker 命中缓存，会根据缓存查找优先级去查找数据。但是不管是从 Memory Cache 中还是从网络请求中获取的数据，浏览器都会显示是从 Service Worker 中获取的内容（前提是网页注册了 service worker）。

2 **Memory Cache：**Memory Cache 就是内存缓存，它的效率最快，**但是内存缓存虽然读取高效，可是缓存持续性很短，会随着进程的释放而释放。**一旦我们关闭 Tab 页面，内存中的缓存也就被释放了。

3 **Disk Cache：**Disk Cache 也就是存储在硬盘中的缓存，读取速度慢点，但是什么都能存储到磁盘中，比之 Memory Cache **胜在容量和存储时效性上**。在所有浏览器缓存中，Disk Cache 覆盖面基本是最大的。它会根据 HTTP Header 中的字段判断哪些资源需要缓存，哪些资源可以不请求直接使用，哪些资源已经过期需要重新请求。并且即使在跨站点的情况下，相同地址的资源一旦被硬盘缓存下来，就不会再次去请求数据。

HTTP2 后增加了 **Push Cache**，当以上三种缓存都没有命中时，它才会被使用。**并且缓存时间也很短暂，只在会话（Session）中存在，一旦会话结束就被释放，是缓存的最后一道防线。**

其具有以下特点：

- 不同的页面只要共享了同一个 HTTP2 连接，那么它们就可以共享同一个 Push Cache
- Push Cache 中的缓存只能被使用一次
- 浏览器可以拒绝接受已经存在的资源推送
- 可以给其他域名推送资源

<img src="https://orangesolo.cn/assets/image/f6dd554268e87b1d67addabfde96e0c8.png" alt="" class="md-img" loading="lazy"/>

在命中强缓存的情况下，进程会从内存读取资源(字体，图片，脚本)，从磁盘里读取css部分js

930452230

1552176528901

1602175230156
