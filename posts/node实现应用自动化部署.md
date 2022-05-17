## 前言

前端开发者通常面临着较长的打包时间，每次代码修改都得走一次测试， 构建，部署，步骤虽不复杂但很繁琐，如果这一流程可以实现实现自动化，将大大提升工作效率，目前市面上也有很多实现方式，如 Jenkins，Travis，github actions，github webhook 等，不仅是前端项目，任意项目都可以进行自动化。

后面会简单介绍下CI/CD及几个自动化工具，并详细介绍webhook的使用和node脚本的实现，github actions yml 文件的编写。

### CI/CD

关于自动化常会听到 CI/CD 的用词，CI（Continuous Integration）持续集成，CD（Continuous Delivery）持续交付，有时也指持续部署（Continuous Deployment），它们三个的区别借鉴网络上的一张图表示：

<img src="https://orangesolo.cn/assets/image/51864e4d7c616dc3201625a85196b228.png" alt="" class="md-img" loading="lazy" width="627" height="138"/>

三种不同的自动化：

1. 当监测到开发者将代码合并后到主分支时，触发自动化测试，如果有一个测试用例失败就不能合并成功，持续集成可以理解为持续的将质量合格的代码集成到主分支，解决太多的分支相互冲突或者某分支大幅偏离主干的问题，目的在于提前发现错误。

2. 自动化测试通过的代码可以交给质量团队，以供评审/验证，如果验证有问题就需要修改重新走上一步骤，持续交付是持续集成的下一步，强调软件随时随时都是可交付的。

3. 代码经过相关人员验证后，可以部署到生产环境了，持续部署指自动的将代码部署到生产环境，提升运维效率。

CI/CD 既可能仅指持续集成和持续交付构成的关联环节，也可以指持续集成、持续交付和持续部署这三项构成的关联环节。有时“持续交付”也包含了持续部署流程。归根结底，我们没必要纠结于这些语义，只需记得 CI/CD 其实就是一个流程，用于实现应用开发中的高度持续自动化和持续监控。

### Jenkins

一款由Java编写的开源工具，可以实现自动化构建、测试及部署，如果已部署版本出现问题，可直接回滚到上一个版本。Jenkins 有构建版本的概念，太多的历史构建会导致jenkins速度变慢，服务器资源也会被占满，并且在使用的过程中也会安装一些插件，较消耗服务器资源。

Jenkins 在使用时需要配合 github webhook，当监测到发生 push 动作时向jenkins发送构建请求。

### Travis

Travis 也提供持续集成服务，它绑定 Github 上面的项目，只要有新的代码，就会自动抓取。然后提供一个运行环境，执行测试，完成构建，还能部署到服务器。需要注意的是，Travis CI 只支持 Github，不支持其他代码托管服务。每个支持CI的项目都必须有一个.travis.yml文件，用来配置运行环境与脚本，在push代码时，travis 读取 yml 中配置，判断当前是否是指定的分支，选择性的执行构建。

### github actions

持续集成由很多操作组成，比如抓取代码、运行测试、登录远程服务器，发布到第三方服务等等。GitHub 把这些操作就称为 actions，整个持续集成过程是多个actions 的组合，每个actions可以是一个独立的脚本，也可以是几行命令，在项目创建 .github/workflows/main.yml，github 会自动监测代码库的变化执行actions。

### github webhook

webhook 可以实现当开发者进行指定操作时，向指定服务器发送 http 请求，这意味着我们可以在接受请求后做任何事情。相较于Jenkins、Travis、github的actions，webhook灵活度更高。

## webhook 使用

### 配置

使用 webhook 必须进行配置，在 setting/webhooks，一个项目可配置多个 webhook

<img src="https://orangesolo.cn/assets/image/5e763900ab8865821e81396af827a7bf.png" alt="" class="md-img" loading="lazy" width="627" height="774"/>

### 请求详情

#### 请求头

```sh
Request URL: https://some.cn/webhook
Request method: POST
Accept: */*
content-type: application/json  # 配置的数据格式
User-Agent: GitHub-Hookshot/db1e1da
X-GitHub-Delivery: 40a05de2-cf85-11ec-9d5c-48f6b982b621 # 当前请求的标识
X-GitHub-Event: push
X-GitHub-Hook-ID: 1111111   # 本webhook id
X-GitHub-Hook-Installation-Target-ID: 22222
X-GitHub-Hook-Installation-Target-Type: repository
X-Hub-Signature: sha1=121212323221212212asas # 使用 sha1 算法对密钥加密
X-Hub-Signature-256: sha256=fdsafasdfafasdfa423412dsfafasft3453fsa # 使用 sha256 算法对密钥加密
```

如果需要进行用户校验，可使用相同算法对密钥加密后与X-Hub-Signature比较，一样的话说明密钥正确，可进行后续操作。

#### 请求数据体

```json
{
  "ref": "refs/heads/master", // 当前分支
  "before": "0000000000000000000000000000000000000000", // 前一次commit id
  "after": "73abb7a9d75f911cc42945dd1af50227d1833952", // 本次commit id
  "repository": { // 该仓库的一些细节
    "id": 111,
    "node_id": "SSSS",
    "name": "blog", // 仓库名
    "full_name": "wuliguaiguaia/blog",
    "private": false,
    "owner": { // 仓库所有者信息
      "name": "wuliguaiguaia",
      "email": "",
      "login": "wuliguaiguaia",
      "id": 111111111, 
      "node_id": "SSSS",
      ... 各种url，比如头像...
    },
    "html_url": "https://github.com/wuliguaiguaia/blog",
    "description": null,
    "fork": false,
    "url": "https://github.com/wuliguaiguaia/blog",
    ... 各种url
    "created_at": 1638854235,
    "updated_at": "2022-01-06T11:34:05Z",
    "pushed_at": 1652093175,
    ... 各种url
    "homepage": null,
    "size": 2344,
    "stargazers_count": 0,
    "watchers_count": 0,
    "language": "TypeScript",
    "has_issues": true,
    "has_projects": true,
    "has_downloads": true,
    "has_wiki": true,
    "has_pages": false,
    "forks_count": 0,
    "mirror_url": null,
    "archived": false,
    "disabled": false,
    "open_issues_count": 0,
    "license": null,
    "allow_forking": true,
    "is_template": false,
    "topics": [

    ],
    "visibility": "public",
    "forks": 0,
    "open_issues": 0,
    "watchers": 0,
    "default_branch": "master",
    "stargazers": 0,
    "master_branch": "master"
  },
  "pusher": { // 进行push事件的用户
    "name": "wuliguaiguaia",
    "email": "1111111111@qq.com"
  },
  "sender": { // 进行此次事件的用户详情，这里还是自己 
    "login": "wuliguaiguaia",
    "id": ,
    "node_id": "MDQ6VXNlcjMwMzA2OTQ3",
    "avatar_url": "https://avatars.githubusercontent.com/u/30306947?v=4",
    "gravatar_id": "",
    ... 各种url，和前面owner一样，也不嫌麻烦
  },
  "created": true,
  "deleted": false,
  "forced": false,
  "base_ref": "refs/heads/master", // 该仓库主分支
  "compare": "https://github.com/wuliguaiguaia/blog/compare/master",
  "commits": [

  ],
  "head_commit": { // 本次commit的一些信息
    "id": "73abb7a9d75f911cc42945dd1af50227d1833952", // 本次 commit id
    "tree_id": "34e6d1ad7e8a66cbd005031ce7ff5f1cac07acc9",
    "distinct": true,
    "message": "test", // commit 信息
    "timestamp": "2022-05-09T18:45:42+08:00",
    "url": "https://github.com/wuliguaiguaia/blog/commit/73abb7a9d75f911cc42945dd1af50227d1833952",
    "author": {
      "name": "",// git用户名
      "email": "",// git用户邮箱
      "username": "wuliguaiguaia" // 该仓库用户名
    },
    "committer": { // 不知道和author啥区别，反正我这没区别
      "name": "", 
      "email": "", 
      "username": "wuliguaiguaia" 
    },
    "added": [ // 本次修改增加的文件

    ],
    "removed": [ // 本次修改删除的文件

    ],
    "modified": [ // 本次修改涉及到的文件
      ".github/workflows/main.yml"
    ]
  }
}
```

主要分为三种：该仓库的详细信息，仓库owner的详细信息，本次commit相关的详细信息，开始时按需使用。

### 处理请求

可以使用任何服务端语言编写脚本，这里使用node实现:

#### 1 创建 http 服务器

限制只支持 post 和 /webhook 请求（当然也可以在已有服务上增加 /webhook 请求）

```js
const http = require('http')
const server = http.createServer((req, res) => {
  res.setHeader('content-type', 'application/json')
  if (req.method !== 'POST' || req.url !== '/webhook') {
    return res.end(result2String('请求未命中', 1))
  }

  const chunks = []
  req.on('data', chunk => {
    chunks.push(chunk)
  })
  req.on('end', () => {
    const buffers = Buffer.concat(chunks)
    const body = JSON.parse(buffers)
    console.log(body);
  })
});
server.listen('9999')

function result2String(str, errNo) {
  return JSON.stringify({ str, errNo })
}
```

#### 2 部署细节

项目部署时会涉及到 拉取代码、安装依赖、测试、构建、没问题的话就将打包后的代码放到服务器上，后端项目需要启动服务。这里涉及到有git操作，npm操作，文件夹操作等，一般是放在终端进行的，现在这些命令都需要在 node 执行。

node 提供了 child_process 模块，可以创建一个子进程，它提供四个方法：

1. spawn(), 启动一个子进程运行命令
2. exec()，启动一个子进程运行命令，和 spawn() 不同的是，它有一个回调可以知道子进程的状况
3. execFile()，启动一个子进程执行可执行文件
4. fork()，与spawn() 类似，不同的是他创建的子进程只需指定文件即可，并且它只支持js脚本

以执行 npm 为例：

```js
const cp = require('child_process')
cp.spawn('npm', ['install'], { stdio: 'inherit' });
cp.exec('npm install', (err, stdout, stderr) => {})
/*
 execFile 执行文件，将 npm install 写入 install.sh
 必须 chmod 777 install.sh，否则会有 spawn EACCES 错误
 必须使用绝对路径，否则会有 spawn ENOENT 错误
*/ 
cp.execFile(path.join(__dirname, 'install.sh'), (err, stdout, stderr) => {})
```

尽管有四种创建子进程的方法，但实际后三种都是spawn的封装，具有很多更加底层的属性可供使用，因此首选还是它。在部署项目时，我们可能有多条命令，因此直接都写到一个shell文件里

以一个前端项目为例：(sh/blog-admin.sh)

```sh
#!/bin/bash

WORK_PATH="/home/homework/webroot/static"

echo "------ 进入项目目录 ------"

cd $WORK_PATH

pwd

rm -rf blog-admin

echo "------ clone ------"

git clone git@github.com:wuliguaiguaia/blog-admin.git 2>&1

cd blog-admin

pwd

git checkout master

echo "------ install ------"

npm install  2>&1

echo "------ build ------"

npm run build

rm -rf /usr/share/nginx/html/blog-admin/*

cp -r dist/* /usr/share/nginx/html/blog-admin

echo "------ blog-admin 部署完成 ------"
```

使用 spawn 执行 shell

```js
const child = cp.spawn('sh', ['./sh/blog-admin.sh'])
const buffers = [];
child.stdout.on('data', buffer => {
  buffers.push(buffer);
});
child.stdout.on('end', () => {
  const log = Buffer.concat(buffers);
  console.log(log, '自动化拉取完毕');
  res.end(result2String('success', 0));
});
```

#### 3 增加权限控制

为了安全起见，我们进行权限上的校验，利用刚刚配置的密钥与请求header的x-hub-signature进行用户验证。

x-hub-signature 使用了sha1加密算法，在node里，我们可以利用<code>crypto</code>模块，创建一个 Hmac 对象，结合 sha1 加密算法，hmac算法是不可逆的，因此验证的过程就是通过比较两个加密后的字符串是否一样来确认身份

```js
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
req.on('end', () => {
  const buffers = Buffer.concat(chunks)
  const signature = req.headers['x-hub-signature'];
  if (signature.slice(5) !== sign(buffers, WEBHOOK_SECRET)) { // 比较
    return res.end(result2String('无权限', 2));
  }
  ... 执行shell
}

function sign(payload, secret) {
  const crypto = require('crypto')
  const body = JSON.stringify(payload)
  // 对比的是 x-hub-signature，所以必须是sha1算法
  const hmac = crypto.createHmac('sha1', secret)
  // github 加密的数据体，这里同样
  const up = hmac.update(body)
  // 使用 digest 方法生成加密内容(必须是hex格式)
  const signature = up.digest('hex')
  return signature
};
```

#### 4 增加条件控制

比如只支持配置了shell的项目才可自动化，只支持一个统一的分支，比如master，只支持push事件，虽然前面已经配置了仅在push时发送，但接口是可扩展的，webhook可能也会有修改，事先加上为好。

```js
req.on('end', () => {
  const buffers = Buffer.concat(chunks)
  const payload = JSON.parse(buffers);
  const { name } = payload.repository;
  console.log('^^^项目名', name);
  const allSh = fs.readdirSync('./sh').map(item => item.slice(0, -3)); // shell文件名为项目名
  if (!allSh.includes(name)) { // 如果不包含该项目
    return res.end(result2String('该项目不支持自动化', 2));
  }
  const branch = payload.ref;
  if (branch !== 'refs/heads/master') { // 这里指定所有项目只有 master 分支时可自动化
    return res.end(result2String('仅限 master 分支', 3));
  }

  const event = req.headers['x-github-event'];
  if (event !== 'push') {  // 这里指定只在push时
    return res.end(result2String('仅 push 可用', 4));
  }
  ... 权限验证
  ... 执行shell spawn('sh', [`./sh/${name}.sh`]); // 指定shell
})
```

#### 5 人为控制与超时处理

当前只支持github自动发起请求，如果有时候需要人为的触发某项目的重新构建及部署，比如服务端渲染的项目，页面的数据在打包的那一刻已经填充进去了，如果数据发生变化，按现在的情况只能进行一次无用的push才能触发重新打包部署。

这里扩展出 /webhook/manual 请求，可以**在另一个项目点击按钮发出**。

```js
const secret = process.env.WEBHOOK_SECRET
$http.webhook_manual({
  repository: {
    name: "blog"
  },
  secret: await encodePass(secret), // 对secret加密
}, {
  timeout: 600000, // 部署时间一般较长
})
```

加密使用 [bcrypt](https://www.npmjs.com/package/bcryptjs)：

```js
import * as bcrypt from 'bcryptjs'
import { saltOrRounds } from '../constants'
/* saltOrRounds: 生成salt的迭代次数 */

export const encodePass = (pass: any) => new Promise<string>((resolve, reject) => {
  bcrypt.genSalt(saltOrRounds, (err: any, salt: any) => {
    bcrypt.hash(pass, salt, (err: any, hash: string | PromiseLike<string>) => {
      if (err) {
        reject(false)
      }
      resolve(hash)
    })
  })
})
```

因此接口对应的一些逻辑也需要调整，看是自动的还是手动触发的，区分处理，并且secret的校验也需要修改，使用bcrypt的compare方法比较加密后是否相等

```js
const comparePass = (originPass, pass) => {
  const bcrypt = require('bcryptjs');
  return bcrypt.compareSync(originPass, pass);
};
```

还需要进行 nginx 超时配置，一般部署的时间会有好几分钟

```text
location ^~/webhook/ {
  proxy_read_timeout 600s; 页面等待服务器响应时间
}
```

#### 6 进程杀死

如果连续触发了两次部署，则需要杀死前一个，否则两个进程同时开始部署会有冲突，但是函数在执行时无法在外部中断，所以采用创建子进程，请求的处理细节在子进程中执行，一旦发现有重复部署的项目，就杀死正在运行的，重新创建进程。

前面说过node创建子进程有四种方式，这里选择 fork，因为fork会在父进程与子进程之间建立一个通信管道，用于进程之间的通信，我们在获取到请求 payload 的时候需要将其传给子进程，在子进程运行完成后需要将结果发送给主进程。

```js
const status = {} // 保存项目对应的子进程与res的引用
const server = http.createServer((req, res) => {
  const name = parseName(req.url)
  res.setHeader('content-type', 'application/json')
  ...一些判断
  let worker = status[name]?.worker // 先检查是否有正在运行中的
  if (worker) {
    // 如果有，就结束请求并杀死进程
    status[name].res.end(result2String('请求重复，正在取消本次部署', -1, name))
    killWorker(name) 
  }
  // 创建新的进程
  worker = createWorker(name, res)
  worker.on('message', ({ action, payload }) => {
    switch (action) {
      case 'end':
        res.end(payload)
        killWorker(name)
        break
    }
  })
  const chunks = []
  req.on('data', chunk => {
    chunks.push(chunk)
  })
  req.on('end', async () => {
    try {
      const buffers = Buffer.concat(chunks)
      const payload = JSON.parse(buffers)
      const { repository: { name }} = payload
      // 给子进程发送必要数据
       worker.send({
        name,
        url: req.url,
        headers: req.headers,
        action: 'load',
        payload
      })
    } catch (e) {
      logger.error(name, e)
    }
  })
})

function createWorker(name, res) {
  const n = cp.fork(path.join(__dirname, './src/worker.js'))
  status[name] = {
    worker: n,
    res: res
  }
  return n
}

function killWorker(name) {
  process.kill(status[name].worker.pid)
  status[name] = null
}
```

在子进程中接收并执行：

```js
process.on('message', async (m) => {
  const { name, action, payload, url, headers } = m
  const isManual = /^\/webhook\/manual\?.+?$/.test(url)
  switch (action) {
    case 'load': 
      // 条件校验与权限判断
      const errorString = conditionJudge(payload, headers, isManual) 
        || authJudge(payload, headers, isManual, name)
      if (errorString) {
        return process.send({ action: 'end', payload: errorString}) // 向主进程发送数据
      }
      // 执行脚本
      await executeScript(name)
      const result = result2String('success', 0, name)
      return process.send({ action: 'end', payload: result }) // 向主进程发送数据
    case 'exit':
      process.exit()
  }
})
```

#### 7 日志与通知

##### 封装日志

我们可以使用 pm2 启动，然后查看它默认的日志，但是这样所有项目的部署细节都在一个log文件里，如果有同时进行多个项目，log就会非常混乱，最好是每个项目都有自己的日志文件，这里封装自己的日志，定义日志格式，并将log都写入对应的日志文件里

```js
const fs = require('fs')
const path = require('path')
const dirPath = path.join(process.cwd(), '../logs/webhook') // 日志总文件夹
const filePaths = {}

const logger = {
  dirPath,
  create
}
global.logger = logger

function create() {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
  // 创建多个以项目名称命名的log文件
  const repos = fs.readdirSync(path.join(__dirname, './../sh')).map(item => item.slice(0, -3))
  repos.forEach(item => {
    const filePath = path.join(dirPath, `${item}.log`)
    filePaths[item] = filePath
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '')
    }
  })

  // 支持不同级别的日志
  const levels = ['info', 'error', 'warn']
  levels.forEach(level => {
    logger[level] = write.bind(logger, level)
  })
}

// 找到对应的日志文件并写入
function write(level, name, content) {
  const filePath = filePaths[name]
  const data = formatData(level, content)
  console.log(data);
  fs.writeFileSync(filePath, data, { flag: 'a+' })
}

// 格式化
function formatData(level, content) {
  const date = new Date()
  const convertDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.toTimeString().slice(0, 8)}.${date.getMilliseconds()}`
  return `[${convertDate}] [${level}] - ${content.toString()} \n`

}
```

使用:

```js
logger.create()
logger.info('blog', 'starting...')
logger.error('blog', '邮件发送失败')
```

就可以在 blog.log 下查看

<img src="https://orangesolo.cn/assets/image/f36ceb2ee4ae275c56e2df5e892a82af.png" alt="" class="md-img" loading="lazy" width="567" height="59"/>

当然目前的日志还是有一些优化空间大的，比如按时间和大小拆分，定时删除等，先跑上去再说。

##### 邮件通知

至此所有的部署结果都只能在服务器查看，成功与失败我们只能在服务器的日志里看，或者直接访问，还是太麻烦了，这里选择qq邮件通知

```js
const nodemailer = require('nodemailer')
const prefix = '[orange部署]'

const options = {
  from: `${prefix}<${process.env.EMAIL}>`, // 如 <[orange部署]>111111@qq.com
  to: process.env.EMAIL, // 自己发自己
}

const mailTransport = nodemailer.createTransport({
  service: 'qq',
  secure: true,
  auth: { // 授权
    user: process.env.EMAIL,
    // 需要进入邮箱设置启用 SMTP 后获取（设置->服务->开启服务）
    pass: process.env.EMAIL_TOKEN 
  }
})

const sendMail = (name, str) => {
  const message = {
    ...options,
    subject: `${prefix}: ${name} - ${str}`, // 邮件主题
    text: JSON.stringify({ // 邮件内容
      name,
      str,
      t: Date.now()
    }, null, 2)
  }

  return new Promise((resolve) => {
    mailTransport.sendMail(message, function (err, msg) {
      if (err) {
        console.log(err, msg);
        resolve(true)
        logger.error(name, '邮件发送失败');
      } else {
        resolve(false)
        logger.info(name, '邮件发送成功');
      }
    })
  })
}
```

使用:

```js
sendMail('blog', '启动部署')
```

就会收到一条如下邮件：

<img src="https://orangesolo.cn/assets/image/4b8ef3889b9f14839e9a594334dfc470.png" alt="" class="md-img" loading="lazy" width="375" height="345"/>

#### 完整代码

[github 地址](https://github.com/wuliguaiguaia/webhook)，会有些许改动

## github actions 实现

目前几个项目都是以webhook为基础部署的，意味着webhook这个项目是需要预先部署的，当需要更新时手动部署上去，当然也可以写个简单的shell跑一遍

这里尝试使用 github actions 进行该项目的部署，不仅可以释放人力，还可以看到具体的执行细节

```yml
# workflow： 一次持续集成的过程就是一个workflow
# workflow -> job -> step -> action，它们是层级关系

name: webhook 部署 # 当前workflow的名称

on: # workflow 触发条件

  push: # 比如push时触发

    branches: [ master ] # 指定分支，只有 test-actions 分支发生push事件才触发

jobs: # 一个 workflow 由一个或多个 jobs 构成，表示有多个任务

  build: # 任务名为build

    runs-on: ubuntu-latest # 指定运行所需要的虚拟机环境

    steps: # 每个 job 由多个 step 构成，一步步完成。

    # 每个 step 可以依次执行一个或多个命令（action）。 当前共有 4 个step

    - uses: actions/checkout@v3 # 从github拉取源码
    # uses：直接用别人封装好的action
    # https://github.com/marketplace/actions/checkout

    - name: install # 步骤名称
      run: npm install # 该步骤运行的命令或者 action

    - name: zip
      run:  zip -r -q webhook.zip *

    - name: deploy
      # 构建之后，需要把代码上传到服务器上，所以需要连接到ssh，并且做一个拷贝操作
      uses: cross-the-world/ssh-scp-ssh-pipelines@latest
      env:
        WELCOME: "ssh scp ssh pipelines"
        LASTSSH: "Doing something after copying"
      # https://github.com/marketplace/actions/ssh-scp-ssh-pipelines
      with:
        # 连接服务器需要的host、user、password
        host: ${{ secrets.USER_HOST }}
        user: ${{ secrets.USER_NAME }}
        pass: ${{ secrets.USER_PASS }}
        connect_timeout: 20s
        first_ssh:  |
          rm -rf /home/homework/nodeapp/webhook
        scp: |
          'webhook.zip' => /home/homework/nodeapp
        last_ssh: |
          cd /home/homework/nodeapp/
          unzip -d webhook webhook.zip
          cd webhook
          pm2 start process.json
```

当前只有一个job，job 里有添加了四个step，执行共分为8个步骤，可在项目的workflow里查看，

<img src="https://orangesolo.cn/assets/image/6cd298a03138f202f694874b39a31cc8.png" alt="" class="md-img" loading="lazy" width="577" height="378"/ >

对于其他项目，webhook 纯手动实现确实需要一些 node 基础，所以都可以尝试使用一下 github actions，和前面使用webhook的项目一样，使用actions的项目部署如果失败或取消也会有邮件通知，这个是 github 自动发的，将它们一起归组：

<img src="https://orangesolo.cn/assets/image/d775b81a9cb779ff9371fd963f49615b.png" alt="" class="md-img" loading="lazy" width="577" height="301"/>

如此，相对重要的项目部署情况也都会有及时的反馈。

## 总结

本文通过借助github提供的webhook和actions实现了应用的自动化部署，着重介绍了node脚本的实现，包括权限校验、创建子进程运行部署细节、增加了人为控制、封装日志等，每个项目的部署细节可在对应的日志文件里查看，邮件通知可及时获取部署结果，必要的时候可一键部署。当然也存在一些问题，比如日志文件过大，可优化进行拆分与定时删除；邮件通知的结果会影响最终响应输出，对于非必要的部署任务，最好还是异步进行，因为想在杀死进程前把邮件发出去，进行了 await，所以邮件发送的时间在整个部署时间范围内，如果失败了也会导致响应有问题，慢慢优化吧。。

相比较， github actions 就很简单，可能也没涉及到复杂的操作，如果部署重复了，可选择取消上次workflow，部署的细节都可以查看，但还是前面所说的，webhook发请求的方式相对灵活，有很大扩展空间，当然webhook也不是完美的，比如你如果不自己加日志的话可能就不知道本次到底是成功还是失败了，因为它有时不会准确的获取到响应结果。。。

<img src="https://orangesolo.cn/assets/image/27baf61f690a2dccbdc89e396e88d29c.png" alt="" class="md-img" loading="lazy" width="559" height="283"/>

正常是这样的：

<img src="https://orangesolo.cn/assets/image/449ecf6868fccc71acffaf215b15be75.png" alt="" class="md-img" loading="lazy" width="559" height="352"/>
 
（这两天几乎都是 timeout...，几乎都没有见过正常的Response 200了 ）


## 附录

[什么是 CI/CD ？](https://zhuanlan.zhihu.com/p/422815048)

[Github About webhooks](https://docs.github.com/cn/developers/webhooks-and-events/webhooks/about-webhooks)

[Github Actions](https://docs.github.com/cn/actions)

[持续集成服务 Travis CI 教程](http://www.ruanyifeng.com/blog/2017/12/travis_ci_tutorial.html)
