## 背景

### SPA

SPA（ single-page application ），页面在初始化时加载相应的 html、js、css，一旦加载完成，spa不会因为用户的操作而进行页面的重新加载或跳转，而是通过路由机制进行html内容的替换，而不需要重新加载整个页面，相对于服务器压力也更小一些。但是spa也存在一些问题，比如：

1. 为了保证所有页面的正常显示，需要将部分js，css统一加载，部分页面按需加载，相对来说初次加载耗时较多
2. spa页面内容都是由js动态渲染或替换的，搜索引擎的爬虫通常爬取的是静态页面，然后进行内容分析，不会执行js，不会通过ajax获取数据，所以spa在seo上有着天然的弱势。
3. 需要进行路由管理，因为单页应用所有内容都在一个页面上，不能直接使用浏览器的前进后退按钮，需要预先绑定组件创建路由对象并监听popstate或hashchange事件。

### 早期服务端渲染

为了解决这些问题，出现了服务端渲染的概念，简称SSR （server-side-render），但这并不是一个新的领域，早期页面就是在服务端完成的，服务端从数据库获取数据填充到html模板上返回给浏览器，浏览器接受到的是直接包含内容的页面。

类似于：

1 创建模板

```html
<!-- index.template.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  <h1>hello {{username}}</h1>
  <p>您的银行卡余额是 {{account}}</p>
</body>
</html
```

2 渲染页面

```js
const http = require('http');
const fs = require('fs');
const path = require('path');
const server = http.createServer();
server.on('request', (req, res) => {
    // 1  读取模板
    const filePath = path.join(__dirname, './index.template.html');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    // 2 获取数据
    const data = getData();
    // 3 将数据填充到编译后的模板里
    const compileHtml = compile(fileContent, data);
    // 4 返回带有内容的html
    res.end(compileHtml);
});
server.listen(3003, (e) => {
    console.log('服务运行在 localhost:3003');
});

function getData() {
    // 获取数据...
    return {
        username: 'alias',
        account: 10000000000000,
    };
}
function compile(fileContent, data) {
    // 模板编译, 或用其他模板引擎代替
    const string = fileContent.replace(/\{\{(\w+)\}\}/g, (_, words) => {
        return data[words];
    });
    return string;
}
```

浏览器最终拿到的是有内容的页面。这种开发模式的问题也挺明显的，后端承载的内容过多，不仅要关注服务层，还需要关注页面呈现，前端负责交互逻辑和发送ajax，页面数据呈现还是依赖于服务端，后面前后端分离解决了部分问题，使得后端更关注服务层，对前端暴露接口，页面呈现由前端控制，包括路由，简单鉴权，懒加载等优化用户体验.... ，有了更多工作内容。

回到现在，由vue 、react 创建的单页应用是与 ssr 相对的一种渲染模式：所有路由和页面都是在前端解析和渲染的，被叫做客户端渲染，简写csr（client-side-render），这种方式衍生出前面所提到的一些问题（SEO，首屏加载等），所以服务端渲染的概念又被拿了出来，实则旧瓶装新酒。

不过随着前端这些年的发展，已经足以解决spa所带来的的问题，如下： vue 和 react 两个框架提供的服务端渲染能力。

### vue 服务端渲染

vue 2.x 提供 vue-server-render，3.x 升级为@vue/server-renderer，以 3.x 为例：

```js
const { createSSRApp } = require('vue')
const { renderToString } = require('@vue/server-renderer')
const http = require('http')
const server = http.createServer()
server.on('request', async (req, res) => {
  // 1 创建应用实例
  const app = createSSRApp({
    data() {
      return {
        username: '',
        account: 0,
      }
    },
    template: `<div>
      <h1>hello {{username}}</h1>
      <p>您的银行卡余额是 {{account}}</p>
    </div>`,
    created() {
      // 获取数据
      const { username, account } = getData()
      this.username = username
      this.account = account
    }
  })

  // 2 编译成字符串
  const appContent = await renderToString(app)
  // 3 插入到html内
  const html = `
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Document</title>
    </head>
    <body>
      <div id="app">${appContent}</div>
    </body>
  </html>
  `
  // 4 返回带有内容的html
  res.end(html)
})

server.listen(3004, (e) => {
  console.log('服务运行在 localhost:3004');
});
```

依旧是模板编译这一套，核心使用了 @vue/server-renderer，这个库依赖 @vue/compiler-ssr。

可以简单看下，

1 createSSRApp内部调用createApp创建app实例

```js
export const createSSRApp = ((...args) => {
  const app = ensureHydrationRenderer().createApp(...args)
  const { mount } = app
  app.mount = (containerOrSelector: Element | ShadowRoot | string): any => {
    const container = normalizeContainer(containerOrSelector)
    if (container) {
      return mount(container, true, container instanceof SVGElement)
    }
  }
  return app
}) as CreateAppFunction<Element>
```

2

```js
export async function renderToString(
  input: App | VNode,
  context: SSRContext = {}
): Promise<string> {
  if (isVNode(input)) {
    return renderToString(createApp({ render: () => input }), context)
  }
  // 创建虚拟 DOM
  const vnode = createVNode(input._component, input._props)
  vnode.appContext = input._context
  input.provide(ssrContextKey, context)
  // renderComponentVNode 内部调用 @vue/compiler-core生成 buffer数组
  const buffer = await renderComponentVNode(vnode)
  await resolveTeleports(context)
  // 合并 buffer 数组 拼接成字符串返回给浏览器
  return unrollBuffer(buffer as SSRBuffer)
}
```

大概的流程是这样的，可不必拘泥与具体逻辑，想要表达的是得益于spa应用带来的虚拟DOM，模板编译等技术，spa应用带来的的问题也得到了解决，又一次证明虚拟dom与模板编译对于前端技术推进多么重要！

### 路由同构

上面示例是静态的，因为页面数据还无法改变，比如增加个按钮：

```js
   template: `<div>
      <h1>hello {{username}}</h1>
      <p>您的银行卡余额是 {{account}}</p>
 +  <button @click="handleClick">涨薪</button>
    </div>`,
    methods: {
 +    handleClick() {
 +       this.account += 1000
 +    }
    }
```

会发现点击按钮是没有效果的，说明目前的ssr只是渲染了个静态页面，没有数据响应的能力，因为这是客户端渲染的能力，只有js可以动态修改页面，这一点ssr是无法实现的。

因此引入一个新的概念，同构。

同构，就是一套代码在服务器运行一遍，再到浏览器运行一遍，服务端渲染完成初始页面，客户端渲染绑定事件。所以是在spa的基础上，利用服务端渲染直出首屏，解决spa应用渲染慢的问题。

准备一套同时要运行的代码 App.vue

```vue
<template>
  <div>
    <h1>hello {{ username }}</h1>
    <p>您的银行卡余额是 {{ account }}</p>
    <button @click="handleClick">涨薪</button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      username: "",
      account: 0,
    };
  },
  created() {
    const { username, account } = this.getData(); // 如上
    this.username = username;
    this.account = account;
  },
  methods: {
    handleClick() {
      this.account += 1000;
    },
  },
};
</script>
```

先在客户端运行 entry-client.js

```js
import { createSSRApp } from 'vue'
import App from './App.vue'
const app = createSSRApp(App)
app.mount('#app')
```

运行还需要编译 .vue 文件，webpack-client.js

```js
const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
module.exports = {
  mode: 'production',
  entry: './entry-client.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'build.js',
    publicPath: '/dist'
  },
  module: {
    rules: [{
      test: /\.vue$/,
      use: 'vue-loader'
    }]
  },
  plugins: [
    new VueLoaderPlugin(),
  ]
}
```

然后在服务端运行一遍 server-entry.js

需要说明的是这次需要将客户端渲染打包出来的文件引入进来并处理静态资源的请求

```js
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import http from 'http'
import path from 'path'
import fs from 'fs'
import appVue from './App.vue'
const server = http.createServer()
server.on('request', async (req, res) => {
  const url = req.url
  if (url === '/') {
    // 1 创建应用实例
    const app = createSSRApp(appVue)
    // 2 编译成字符串
    const appContent = await renderToString(app)
    console.log('---', appContent);
    // 3 插入到html内
    const html = `
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <script defer="defer" src="/dist/build.js"></script>
      </head>
      <body><div id="app">${appContent}</div></body>
    </html>`
    // 4 返回带有内容的html
    console.log(html);
    res.end(html)
  } else {
    const file = fs.readFileSync(path.resolve(process.cwd(), url.slice(1)), 'utf-8')
    res.end(file)
  }
})

server.listen(3004, (e) => {
  console.log('服务运行在 localhost:3004');
});
```

依然要进行 webpack 打包，webpack.server.js

```js
const baseConfig = require('./webpack.client')
const { merge } = require('webpack-merge')
module.exports = merge(baseConfig, {
  target: 'node',
  mode: 'production',
  entry: './entry-server.js',
  output: {
    path: __dirname,
    filename: 'server.bundle.js',
    libraryTarget: 'commonjs2'
  }
})
```

依次运行：

1. npx webpack --config webpack.client.js 打包客户端渲染文件
2. npx webpack --config webpack.server.js 打包服务端渲染文件
3. node server.bundle.js 启动静态服务器

可以看到的是返回的html 是带有数据的

<img src="https://orangesolo.cn/assets/image/image-1542690352884.png" alt="" class="md-img" loading="lazy" width="660" height="191"/>

并且可以响应事件

<img src="https://orangesolo.cn/assets/image/ssr-1-510753141959.gif" alt="" class="md-img" loading="lazy" width="288" height="155"/>

流程图如下：

### vue ssr 框架 nuxt

上面只是一个简陋的示例，实际中要复杂的多，我们希望能够尽可能少的配置，快速启动一个ssr项目，开箱即用，那么 nuxt 框架是目前最好的选择，作为框架，nuxt 为客户端/服务端 这种典型的应用架构模式提供了许多有用的特性，例如异步数据加载、中间件支持、布局支持等。

关于 [nuxt](https://www.nuxtjs.cn/guide)：
> 2016 年 10 月 25 日，[zeit.co](https://vercel.com/) 背后的团队对外发布了 Next.js，一个 React 的服务端渲染应用框架。几小时后，与 Next.js 异曲同工，一个基于 Vue.js 的服务端渲染应用框架应运而生，我们称之为：Nuxt.js。

因此，nuxt 与next是同一个技术团队 zeit(后改名为 vercel)，参考[ZEIT.co 是什么样一个组织?](https://www.zhihu.com/question/59278159/answer/813629215)

简言之，几乎每一个同事都有强大的背景，各个知名lib的贡献者，核心团队四个人平均年龄20岁，全员远程工作，追求极简主义。

目前(2022.2.15)下载的 nuxt 最新版 2.15.8，支持的是 vue 2.6.14，vue3的还在测试中，见[nuxt/framework](https://github.com/nuxt/framework)

### vite ssr

vite 是一个新推出的前端构建工具，基于原生 ES Module，开发环境通过 es module import 文件，生产环境使用 rollup打包。

与 webpack 相比，webpack是事先build到内存里，vite相当于拦截请求，发送到服务器的是原生的 import，服务器去做处理返回给浏览器，速度极快。

vite 也内置了[ssr 支持](https://cn.vitejs.dev/guide/ssr.html)，目前处于试验阶段。

### react 服务端渲染

和vue类似，react也提供renderToString方法用于将组件编译成字符串，上面vue示例是非常简单的，可以参照仿写，但如果需要状态管理的能力，react 可以参考 [这里](https://hulufei.gitbooks.io/react-tutorial/content/server-rendering.html)，vue的话本质上也是一样的，在服务端用初始store渲染一遍，再交接给客户端渲染一遍。

除了状态管理，还有路由，我们希望/home、/about、/list/1、/list/2 等服务端都可以返回渲染好的html（前面都是针对于首页ssr），就有些麻烦了

每个页面需要的数据不同，需要通过request.url判断应该拿那些数据，当然也可以通过配置来做，理论上都可以实现。

### react ssr 框架 next

从零构建一个 react ssr 应用同样需要考虑很多细节，推荐直接上手 next 框架，另外本博客也是使用 next构建的

### 服务端渲染存在的问题

#### 书写限制

1. 生命周期钩子限制
ssr 中唯一会被调用的是 beforeCreate 和 created，mounted等钩子在服务端是不会调用的

2. 特定于平台的 API 限制
就像是 global、http无法在浏览器运行一样，window 、document 是无法在node环境运行的

3. 外部库
某些可以直接运行在客户端的库，在服务端可能会因为前面两个原因无法使用

#### 服务器压力

服务端不仅需要处理数据，还需要承担一部分的渲染能力，所以会有一定的服务器压力

## next

### 约定大于配置

next 中存在一些约定，比如

1  pages 目录下的文件会被添加到路由系统里，在pages增加 test.tsx, 路由会默认映射到 /test, 如果是 /pages/test/test.tsx, 对应路由就是 /test/test

2 静态资源约定放在顶级/public目录下，默认会从 /public 映射到 /

```html
<img src="/vercel.svg" />
```

3 只能在/pages/api 下写接口服务

书写上有一定的约束，不是可配置的。

### 预渲染能力

默认情况下，next 会预渲染每一个页面，每个生成的html页面都引入与该页面所需的最少javascript，同时保证页面的可交互性。

next 中存在两种形式的预渲染：静态生成和服务端渲染。

#### 静态生成

静态生成： Static Generation（简称SSG），对于变动频率不高的页面，可以直接渲染成静态页面，就是在上线前构建工具生成一次，之后的每次请求都重用已生成的html

```html
export default function Home(props) {
  const { username, account, time } = props
  return (
    <div>
      <h1>hello {username}</h1>
      <p>您的银行卡余额是 {account}</p>
      <p>{time}</p>
    </div>
  )
}
```

静态生成主要使用 [getStaticProps](https://www.nextjs.cn/docs/basic-features/data-fetching#getstaticprops-static-generation) 方法实现

```js
export async function getStaticProps(context) {
  const { username, account } = getData()
  return {
    props: {
      username,
      account,
      time: Date.now()
    }
  }
}
```

返回的 props 是必须的，作为参数传入组件中；为了对比，我们加上 Date.now()

需要注意的是：静态生成有环境的区分：

- 开发环境下，每次请求都会运行 getStaticProps ，这是为了方便修改代码重新运行
- 生产环境下，getStaticProps 只会在build时运行一次，这样可以提供一份html供所有用户下载

体验生产环境，需要关掉 npm run dev，先运行 npm run build 打包，再执行 npm run start 启动服务器

可以发现，开发环境每次刷新，时间戳都是不一样的，而在生产环境，永远都是构建时候的时间

#### 服务端渲染

服务端渲染： Server-side Rendering（简称SSR），对数据实时性有要求的页面，可以使用服务器端渲染方式，页面每次请求都生成一份新的html

静态生成主要使用 getServerSideProps 方法实现

将上面的getStaticProps改成getServerSideProps，可以发现无论是开发环境还是生产环境时间戳都是不一样的

说明服务端渲染的方式每次都会重新获取数据，拿到的都是最新的数据

#### 使用注意

1 只能写在页面里，如pages下的某个tsx，只能从页面导出，但不能写在非页面里，如某个UI组件或封装的hooks等
因为 next约定pages对应路由，每个页面与该页面导出getStaticProps/getServerSideProps 相关联，是一种默认行为，在页面组件并没有显示的去调用 getStaticProps/getServerSideProps，由框架默认处理，在页面呈现之前获取所需的数据。

2 一个页面要么是 SSG 要么是 SSR，不能同时使用 getStaticProps 和 getServerSideProps，[捂脸]

```sh
Error: You can not use getStaticProps or getStaticPaths with getServerSideProps. To use SSG, please remove getServerSideProps
```

#### 增强 SSG

假设你有一个博客页面，只是偶尔会修改一下内容，那你可以在每次修改后重新 build 一下，仍旧可以享受静态生成的优势。
但这是基于你知道内容修改的情况下，如果其他人也可以修改，那就需要通过某种方式监听，比如接口通知触发自动化部署，为了保证不频繁性的build，还需要保证一定的频率触发，否则服务器压力是巨大的。

SSG 提供一种方式可以让页面在一定频率下进行更新，称为 Incremental Static Regeneration (ISR) ，在SSG的基础上更新页面，而无需重新构建整个网站

开启 ISR 的方式是在getStaticProps的返回值增加 revalidate 属性

```js
export async function getStaticProps() {
  const { username, account } = getData()
  return {
    props: {
      username,
      account,
      time: Date.now()
    },
    // 第一个请求后，10s后再请求重新生成页面
    revalidate: 10, 
  }
}
```

此时npm run build 生成初始页面，npm run start 后打开浏览器可以看到

<img src="https://orangesolo.cn/assets/image/image-140543866528.png" alt="" loading="lazy" class="md-img" width="615" height="395"/>

> [Cache-Control](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cache-Control)
   >
   > - s-maxage=\<seconds\>: 覆盖max-age或者Expires头，但是仅适用于共享缓存(比如各个代理)，私有缓存会忽略它
   > - stale-while-revalidate=\<seconds\>: 表明客户端愿意接受陈旧的响应，同时在后台异步检查新的响应。秒值指示客户愿意接受陈旧响应的时间长度

在页面停留10s内刷新页面不变，10s过后再次刷新，发现时间戳修改了！

启用了revalidate，初次请求到的是预渲染的页面，n秒后再次请求js会在后台触发重新生成页面，如果页面生成返回新页面，如果失败，保持不变，依旧是上次生成的页面。

<img src="https://orangesolo.cn/assets/image/image-1443522105399.png" alt="" loading="lazy" class="md-img" width="660" height="335"/>

#### 增强 SSR

因为 getServerSideProps 在每次请求的时候才能获取数据完成页面，所以速度要比 getStaticProps 慢，如果想要快一点，可以部分回退到客户端渲染，那些与SEO相关的数据使用 getServerSideProps，无关的数据在客户端使用诸如 axios 动态获取

#### 页面异常控制

无论是 getStaticProps 还是 getServerSideProps，返回值都有 notFound 和 redirect 属性，用于控制页面异常显示

##### 显式404

```js
export async function getServerSideProps() {
  const data = getData()
  if (!data) {
    return {
      notFound: true,
    }
  }
  // ...
}
```

##### 重定向

```js
export async function getServerSideProps() {
  const auth = getAuth()
  if (!auth) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
  // ...
}
```

有时候可能需要告诉客户端重定向情况，此时可以使用 statusCode，statusCode 只能是 301, 302, 303, 307, 308 其中一个，需要注意的是，需要删除 permanent属性，因为permanent默认是307 Temporary Redirect，和statusCode有冲突

### 动态路由

Next.js 支持具有动态路由的页面。例如，如果你创建了一个命名为 pages/users/[id].js 的文件，那么就可以通过 posts/1、posts/2 等类似的路径进行访问。

以 SSG 动态路由为例

```js
// pages/users/index.js  所有人员列表页
export default function Users({ users } ) {
  return (
    <div>
      {users.map(user => <div key={user.id}>
        <Link href={`/users/${user.id}`}>
          <a> {user.username} </a>
        </Link>
      </div>)}
    </div>
  );
};

export const getStaticProps = async () => {
  const users = await getUsers();
  return {
    props: {
      users
    }
  };
};
```

```js
// pages/users/[id].js 人员详情页
export default function User({ user }) {
  return (
    <div>
      {user.username}
      <br />
      {user.account}
      <br />
      <Link href='/users'>返回</Link>
    </div>
  )
}

export async function getStaticPaths() {
  const paths = await getAllIds()  /* 可动态获取，返回 ['/users/1', '/users/2'] */
  return {
    paths: [ 
      { params: { id: '1' } },
      { params: { id: '2' } }
    ],
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const user = await getUser(params)
  return { props: { user } }
}
```

SSG 动态路由可使用 getStaticPaths 异步函数，可以静态呈现 getStaticPaths 指定的所有路径，批量生成同类型的页面。

#### fallback 使用

1 fallback：false ，只有在构建时生成页面，且只针对 getStaticPaths 返回的路径，超出路径则404，因此如果你新增加了一名用户，直接访问是不可行的。就像上面代码 paths 只有 id 为1和2的，此时访问 /users/3 页面就会报错 404

2 fallback：true， 在构建时没有生成的路径不会导致404页面，会请求该页面“备用版本”，然后在后台运行getStaticProps预渲染。备用版本指的是需要在页面组件处理，如下

```js
import { useRouter } from 'next/router'
export default function User({ user }) {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Loading...</div>
  }
  return (
    <div>
      {user.username}
      <br />
      {user.account}
      <br />
      <Link href='/users'>返回</Link>
    </div>
  )
}
```

如果不处理则会报错，fallback：true 可以应用于页面较多时，部分页面构建时预渲染，部分页面请求时预渲染。

此时请求 /users/3 ，浏览器返回

<img src="https://orangesolo.cn/assets/image/image-339581017362.png" alt="" class="md-img" loading="lazy" width="382" height="112"/>

然后 请求数据再更新页面

<img src="https://orangesolo.cn/assets/image/image-512224651483.png" alt="" class="md-img" loading="lazy" width="530" height="218"/>

而请求 getStaticPaths 指定的页面, 如/users/1，是直接返回已生成的html

<img src="https://orangesolo.cn/assets/image/image-820763761876.png" alt="" class="md-img" loading="lazy" width="365" height="131"/>

3 fallback: 'blocking'，和 true 很像，新页面不会导致 404，不同的是 blocking 没有备用页面，请求新页面时会将浏览器挂起，后台生成html后返回，类似于 ssr

#### 与 revalidate 配合

1 生产环境下，无论是 'blocking' 还是 true，getStaticPaths 未指定的页面在第一次请求在后台生成后，会被添加到预渲染列表里，之后请求的都是已生成的页面，意味着 true 没有 loading 态了，blocking 没有等待时间了

默认情况下，第一次请求生成页面后，blocking / true 都不会再更新已生成的页面，但如果启用了 ISR（即增加revalidate属性），还是会在指定的时间后更新

2 如果 fallback：false，revalidate 是无效的，新页面直接 404

#### 注意

1 getStaticPaths 只能和 getStaticProps配合使用，不能和 getServerSideProps 一起使用

2 getServerSideProps 同样可以使用动态路由，只是没有SSG预先批量渲染的能力

### 页面分析

#### html + json

next 为每个页面静态生成html和json，无论是SSG和SSR，只是生成的时机有所不同。

**html 如:**

```
<html>
    <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width"/>
        <meta name="next-head-count" content="2"/>
        <link rel="preload" href="/_next/static/css/a2265cb7a0c708a7.css" as="style"/>
        <link rel="stylesheet" href="/_next/static/css/a2265cb7a0c708a7.css" data-n-g=""/>
        <noscript data-n-css=""></noscript>
        <!-- polyfillFiles -->
        <script defer="" nomodule="" src="/_next/static/chunks/polyfills-5cd94c89d3acac5f.js"></script>
        <!--   -->
        <script src="/_next/static/chunks/webpack-69bfa6990bb9e155.js" defer=""></script>
        <script src="/_next/static/chunks/framework-6e4ba497ae0c8a3f.js" defer=""></script>
        <script src="/_next/static/chunks/main-83803dd478f5b5bc.js" defer=""></script>
        <script src="/_next/static/chunks/pages/_app-73483fad2904193b.js" defer=""></script>
        <!-- 该页面所需 js -->
        <script src="/_next/static/chunks/pages/users/%5Bid%5D-dc83b756f9b806d1.js" defer=""></script>
        <!-- lowPriorityFiles -->
        <script src="/_next/static/NVp1g76ArQSS85zjw1gWB/_buildManifest.js" defer=""></script>
        <script src="/_next/static/NVp1g76ArQSS85zjw1gWB/_ssgManifest.js" defer=""></script>
        <script src="/_next/static/NVp1g76ArQSS85zjw1gWB/_middlewareManifest.js" defer=""></script>
    </head>
    <body>
        <!-- 预渲染出的页面内容 -->
        <div id="__next" data-reactroot="">
            <div>
                alias<br/>
                1000000000<br/>
                <a href="/users">返回</a>
            </div>
        </div>
        <!-- 当前页面组件接收到的 props 等 -->
        <script id="__NEXT_DATA__" type="application/json">
            {"props":{"pageProps":{"user":{"id":1,"username":"alias","account":1000000000,"time":1645094925711}},"__N_SSG":true},"page":"/users/[id]","query":{"id":"1"},"buildId":"NVp1g76ArQSS85zjw1gWB","isFallback":false,"gsp":true,"scriptLoader":[]}
        </script>
    </body>
</html>
```

对应到 .next 文件夹:

1. .next/static 包含webpack打包生成的公共js，css以及每个页面私有的js，css
2. .next/build-manifest.json 可以看到每个页面所关联的js和css，next打包拆分尽可能使每个页面与该页面所需的最少js相关联

**json 如:**

```json
{
  "pageProps": {
    "user": {
      "id": 1,
      "username": "alias",
      "account": 1000000000,
      "time": 1645094925711
    }
  },
  "__N_SSG": true
}
```

当前页面组件显示所需的props数据，由getServerSideProps/getStaticProps返回，切换页面时拿到该json进行页面内容的动态替换

#### SSG

假设有一个使用了 getStaticProps 用户列表页 /users 和一个使用了 getStaticPaths + getStaticProps 的用户详情页 /users/[id].js，如 <a href="#动态路由">动态路由</a>示例

会发现 SSG 类型页面(/users)在 npm run build 是就会执行 getStaticProps 拉取数据生成 html(.next/server/pages/users.html) 与对应 json (.next/server/pages/users.json)，之后用户请求的永远都是这一份html

如果是SSG动态路由页面(users/[id].js)，那么在 build 时也会同时生成 getStaticPaths 指定路径的页面及其json，(.next/server/pages/1.html、1.json、2.html、2.json...)

如果SSG动态路由页面里 getStaticPaths 使用fallback：true，那么 .next/server/pages 会新增一个 [id].html，内容为[id.js] 里router.isfallback 的返回，这个就是前面所说的备用页面，请求未生成的页面返回的都会先返回这个页面，再在后台执行 getStaticProps 返回 x.json 替换页面内容。

#### 预加载

打包后立即请求 /users, 会发现在后台接连请求了 1.json 和 2.json，此时访问id为1的用户，不会再请求 1.json 而是立即进行内容的替换。 **next会读取页面link标签，进行页面的预加载**

如果/users页增加一个id是3的用户，getStaticPaths 依旧只返回id为1和2的路径，并且使用了 fallback:ture,，那么此时 build 依然不会有 3.html, 3.json，此时请求 /users 会发现多出了 3.json, 且在.next/server/pages/users 新增 3.html, 3.json ，此后访问 /users/3 返回的都是完整的页面内容，因为预加载已经生成了html
  
此时修改用户列表页，增加 revalidate: 10,则会发现 10s 再次请求已生成的 users.html 被修改了

以上说明 **`.next/server/pages` 作为页面缓存池，静态生成的页面和数据都保存在这里，包含 ISR 更新后的页面**

#### 再看 SSR

假设有一页面路径为 /test-ssr

```js
export async function getServerSideProps() {
  const time = Date.now()
  while (Date.now() - time < 3000) {} /* 假设获取数据需要3s */
  const { username, account } = getData()
  return {
    props: {
      username,
      account,
      time: Date.now()
    },
  }
}
```

会发现两个现象：

1. npm run build 在构建时没有生成 .next/server/pages/test-ssr.html
2. 浏览器请求时3s内挂起，3s后返回带有内容的完整页面.

说明浏览器请求时next在后台执行 getServerSideProps，拿到数据后将拼凑好的 html 返回给浏览器。

此时已生成的 SSR html 并不会存储在 .next/server/pages，每次请求都会重新生成，所以需要实时数据的页面可以用 getServerSideProps

#### npm run build

<img src="https://orangesolo.cn/assets/image/image-638409781613.png" alt="" class="md-img" loading="lazy" width="636" height="307"/>

### 获取数据的渠道

#### 文件系统 / 数据库 sdk

getStaticProps/getServerSideProps 只会在服务端运行，不会在浏览器执行，当然也不会被包含在浏览器的js中，这意味着可以直接在getStaticProps/getServerSideProps使用node API，比如操作文件系统或者操作数据库。

需要注意的是，使用文件系统时，使用 process.cwd()而不是__dirname获取路径，因为next打包后源文件路径会变化。

```js
export async function getStaticProps() {
  const markdownDir = path.join(process.cwd(), 'posts');
  const fileNames = fs.readdirSync(markdownDir);
  const allPostsData = fileNames.map(fileName => {
    const fullPath = path.join(markdownDir, fileName);
    const id = fileName.replace(/\.md$/g, '');
    const text = fs.readFileSync(fullPath, 'utf-8');
    const { data: { title, date }, content } = matter(text);
    return {
      id, title, date
    };
  });
  return {
    props: {
      allPostsData
    }
  }
}
```

可以在 [next-code-elimination](https://next-code-elimination.vercel.app/) 上测试，会发现客户端用不上的代码都被剔除了

<img src="https://orangesolo.cn/assets/image/image-1631853929004.png" alt="" loading="lazy" class="md-img" width="660" height="271"/>

#### 外部API

当然你可以使用外部服务接口，比如使用 axios 或 fetch 获取数据

```js
export async function getStaticProps() {
  const allPostsData = await axios.get('https://xxx.cn/api/posts')
  return {
    props: {
      allPostsData
    }
  }
}
````

#### 内部API

next 支持无服务器，因为 next 本身支持创建接口，/pages/api下的任何文件都会映射为接口。

```js
// pages/api/posts.js
export default (req, res) => {
  const data =  getData() /* 从数据库获取数据 */
  res.status(200).json(data)
}
```

此时可以访问 <http://localhost:3001/api/posts> 查看数据。注意不要在 getStaticProps 或 getStaticProps中调用内部接口，虽然这是可行的，因为 getStaticProps 或 getStaticProps 本来就可以直接操作数据库，不需要再去请求，内部接口用于客户端需要动态修改页面或提交数据时使用，供客户端使用。更多查看[API 路由](https://www.nextjs.cn/docs/api-routes/introduction)

## 总结

1 关于 Next

- 对于静态、变动较少或是可控制的页面使用 SSG，build时直接生成html
- 对于结构一样的页面，如博客文章，可使用 SSG + 动态路由 + fallback：true，对访问量靠前的页面静态化，其余请求时渲染，当然只要触发了一次渲染就会存下来后续复用
- 如果想在这上面适当保证页面数据更新，可以使用ISR，即使有大量的用户访问网站，大多数的请求也不需要服务器渲染，因为最多几秒钟才做一次重新渲染；
- 如果页面数据频繁更新，数据不定 ，那就使用 SSR，就是速度稍慢一点，但利于SEO
- 尽可能的使用 LInk 标签跳转，而不是给元素绑定点击事件，因为 Link 配置的页面会进行预加载

2 关于服务端渲染

每个技术架构的出现都是为了解决一些特定的问题，但是它们的出现也必然会带来新的问题。

从一开始的 SSR 到前后端分离，出现了 SPA页面，暴露出SEO与加载问题后，SSR概念再度出现。

## 附录

[next 中文文档](https://www.nextjs.cn/docs/getting-started)

[Incremental Static Regeneration](https://vercel.com/docs/concepts/next.js/incremental-static-regeneration)

[如何搭建一个高可用的服务端渲染工程](https://mp.weixin.qq.com/s?__biz=MzAxOTY5MDMxNA==&mid=2455760048&idx=1&sn=141917823352a1566799784f67d6b58c&chksm=8c686a95bb1fe383115f8e8207eeff32d7ccb72ff409ecbc7492b894326915579e8fa763a21b&scene=27#wechat_redirect)

[vue3 ssr](https://time.geekbang.org/column/article/476719)

[为什么单页面(SPA)网站无法被seo？](https://www.zhihu.com/question/416192007)
