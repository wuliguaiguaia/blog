### 背景

作为一款 web 端文本编辑器，除了基sd ds础的编辑功能，内容的存储也是极其重要的，一旦保存失败将无法恢复，web 端完全依赖网络和服务器状态，如果断网或者服务器出现异常保存失败，损失无法预计，为了保障可靠性，可以想到的方法是出现异常后保存在浏览器上，有网上时进行恢复。

浏览器提供的存储方式有多种，比如常用的localStorage，sessionStorage，cookie，不过它们都有很明显的问题，对比起来：

| | 容量|清除方式|
|---|---|---|
|cookie|< 4kb|设置过期时间|
|sessionStorage|单个域名5M左右（各家浏览器不同）|关闭浏览器/标签页会清除|
|localstorage|单个域名5M左右（各家浏览器不同）| 手动清除|

有容量限制，内容太多可能会被截断或无法保存，cookie 当然就不考虑了， 容量太小而且会被携带到服务器，sessionStorage 也不考虑，标签页的关闭也就丢失了，localStorage 容量可以覆盖大多场景，但依旧是有限制的。

IndexedDB 是浏览器提供的本地数据库，容量比 localStorage 大得多，一般不少于 250MB，甚至没有上限，当然也是取决于硬件的，还可以增加索引，像文档类的系统可以用来做离线存储。

### IndexedDB

作为 web端数据库，IndexedDB 支持 网页脚本创建，除了容量大还有以下特点：

1. 非关系型数据库，内部使用键值对存储，类似于redis
2. 支持异步，防止大量数据的读写，拖慢网页
3. 支持事务，只要有一步失败，整个事务就会取消
4. 受同源限制，无法跨域读取
5. 支持二进制存储，比如ArrayBuffer对象和 Blob对象

#### 基础使用

完整的概念及API 学习详见 [IndexedDB API](https://wangdoc.com/javascript/bom/indexeddb.html)

#### 注意事项

##### 版本问题

IndexedDB 有版本的概念，对于数据库结构的修改，比如增加删除表或者是索引的增加删除修改都需要进行版本升级，也就是修改 IndexedDB.open(databaseName, version) 时传入的 version，如果 version 大于实际版本号，就会触发数据库升级事件 upgradeneeded

```js
var request = indexedDB.open('docCache', 1);
var db;
request.onupgradeneeded = function (e) {
  console.log('Upgrading...');
  // 只有这里才能修改表和索引
}
request.onsuccess = function (e) {
  console.log('Success!');
  db = request.result;
  // e.target.result === request.result
}
```

创建和修改数据库结构都会先触发 upgradeneeded 事件，然后才触发 success 事件，拿到已经打开的数据库对象 IDBDatabase

同时版本升级后也会触发 IDBDatabase 的 versionchange 事件

##### 存储限制

容量大但并不是没有限制，浏览器的最大存储空间是动态的，取决于的硬盘大小，全局限制为可用磁盘空间的 50％，当可用磁盘空间已满时，配额管理器将根据 LRU 策略开始清除数据——最近>最少使用的源将首先被删除，然后是下一个，直到浏览器不再超过限制。

因此存在一定的使用风险，这需要开发者能够定时清理不用的数据，并且只将其作为预防风险的兜底方案。

#### 使用场景

IndexedDB 适宜存储数量较大具有一定结构的数据，方便使用主键和索引，例如web端编辑器利用它来做离线存储

或者IO频繁但实时性要求不高的网站做应用缓存，定时上传。

#### 简单封装

为了方便使用对常用操作进行简单封装

##### DBUtil 工具

```js
export const DBUtil = {
  // 打开数据库及一系列事件的监听
  open(name: string, version: number, {
    upgrade, success, error, blocked,
  }: IOStringAny) {
    return new Promise((resolve: (value: IDBDatabase) => void, reject) => {
      const request = window.indexedDB.open(name, version)
      request.onupgradeneeded = () => {
        upgrade?.(request)
        console.log('onupgradeneeded')
      }

      request.onsuccess = () => {
        success?.(request)
        resolve(request.result)
        console.log('success')
      }

      request.onerror = (event) => {
        error?.(event)
        reject()
      }

      request.onblocked = (event) => {
        blocked?.(event)
        reject()
      }
    })
  },

  // 删除数据库
  remove(name: string, { success, error }: IOStringAny) {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.deleteDatabase(name)
      request.onsuccess = (event) => {
        success?.(event)
        resolve(true)
      }

      request.onerror = (event) => {
        error?.(event)
        reject()
      }
    })
  },

  // 更新数据库
  upgradeDB(request: IDBOpenDBRequest, config: IDBCacheConfig[]) {
    const { transaction, result } = request
    if (transaction) this.updateStore(result, transaction, config)
  },

  // 更新表
  updateStore(db: IDBDatabase, transaction: IDBTransaction, config: IDBCacheConfig[]) {
    const curNames: string[] = []
    const { objectStoreNames } = db

    // 增加
    config.forEach((item: IDBCacheConfig) => {
      const { name, options } = item
      curNames.push(name)
      let store = null
      if (!objectStoreNames.contains(name)) {
        store = this.createStore(db, name, options)
      }
      store = transaction.objectStore(name)
      this.updateIndex(store, item.indexes)
    })

    // 删除
    Array.from(objectStoreNames).forEach((name: string) => {
      if (!curNames.includes(name)) {
        this.deleteStore(db, name)
      }
    })
  },

  createStore(db: IDBDatabase, name: string, options: IDBObjectStoreParameters) {
    return db.createObjectStore(name, options)
  },

  deleteStore(db: IDBDatabase, name: string) {
    return db.deleteObjectStore(name)
  },

  // 更新索引
  updateIndex(store: IDBObjectStore, indexes: IDBIndexConfig[]) {
    const names: string[] = []
    const { indexNames } = store

    // 增加
    indexes.forEach((config: IDBIndexConfig) => {
      const { name, attr, options } = config
      names.push(name)
      if (!indexNames.contains(name)) {
        this.createIndex(store, { name, attr, options })
      }
    })
    // 删除
    Array.from(indexNames).forEach((name: string) => {
      if (!names.includes(name)) {
        this.deleteIndex(store, name)
      }
    })
  },
  createIndex(store: IDBObjectStore, { name, attr, options }: IDBIndexConfig) {
    store.createIndex(name, attr, options)
  },

  deleteIndex(store: IDBObjectStore, name: string) {
    store.deleteIndex(name)
  },

  // 创建事务
  createTransaction(db: IDBDatabase, storeNames: string[],
    method?: IDBTransactionMode | undefined) {
    // 默认 readonly
    return db.transaction(storeNames, method)
  },
}
```

##### DBStore 类

包含表相关的操作：

```js
import { IOStringAny} from '../../interface/index'
export class DBStore {
  store: IDBObjectStore

  constructor(name: string, transaction: IDBTransaction) {
    this.store = transaction.objectStore(name)
  }

  addData({ data, success, error }: IOStringAny) {
    return new Promise((resolve, reject) => {
      const request = this.store.add(data)
      request.onsuccess = (event: Event) => {
        success?.(event)
        resolve(true)
      }
      request.onerror = (event: Event) => {
        error?.(event)
        reject()
      }
    })
  }

  putData({ data, success, error }: IOStringAny) {
    return new Promise((resolve, reject) => {
      const request = this.store.put(data)
      request.onsuccess = (event: Event) => {
        success?.(event)
        resolve(true)
      }
      request.onerror = (event: Event) => {
        error?.(event)
        reject()
      }
    })
  }

  getData({
    id, index, success, error,
  }: IOStringAny) {
    return new Promise((resolve: (res: any) => void, reject) => {
      const { store } = this
      let request: IDBRequest<any>
      if (index) {
        request = store.index(index).get(Number(id))
      } else {
        request = store.get(Number(id))
      }
      request.onsuccess = (event) => {
        success?.(event)
        const target = event.target as IDBRequest
        resolve(target.result)
      }
      request.onerror = (event: Event) => {
        error?.(event)
        reject(event)
      }
    })
  }

  deleteData({ id, success, error }: IOStringAny) {
    return new Promise((resolve, reject) => {
      const request = this.store.delete(Number(id))
      request.onsuccess = (event: Event) => {
        success?.(event)
        resolve(true)
      }
      request.onerror = (event: Event) => {
        error?.(event)
        reject()
      }
    })
  }
  // ...
}
```

##### 增加业务 API

尝试利用以上增加业务相关API更快捷操作

```js
export const DBConfig = {
  name: 'orangeblog',
  version: 1, // 默认为1，修改表和索引需要手动修改
}

export const DBCacheConfig: IDBCacheConfig[] = [
  { // 表名
    name: 'ArticleCache',
    options: {
      keyPath: 'id',
    },
    // 索引
    indexes: [
      {
        name: 'byArticleId',
        attr: 'id',
        options: {
          unique: true,
        },
      },
      {
        name: 'byUpdatedAt',
        attr: 'updateTime',
        options: {
          unique: false,
        },
      },
    ],
    // 每次数据库升级时，超时的15天的删除
    overtime: 1296000,
  },
]

export const openDB = () => DBUtil.open(
  DBConfig.name,
  DBConfig.version,
  {
    upgrade(request: IDBOpenDBRequest) {
      DBUtil.upgradeDB(request, DBCacheConfig)
    },
    success() {
      console.log('打开数据库')
    },
    error() {
      console.log('打开数据库报错')
    },
    blocked() {
      console.log('上次的数据库未关闭')
    },
  },
)

export const setLocalData = (store: DBStore, data: any) => store.addData({
  data: { ...data, updatedAt: Date.now() },
  success() {
    console.log('数据写入成功')
  },
  error() {
    console.log('数据写入失败')
  },
})

export const getLocalData = (store: DBStore, { id, index }:IOStringAny) => store.getData({
  id,
  index,
  success() {
    console.log('数据读取成功')
  },
  error() {
    console.log('数据读取失败')
  },
})

// 以及其他场景...

```

##### 快捷使用

```js
openDB().then((db: IDBDatabase) => {
  let transction = DBUtil.createTransaction(db, ['ArticleCache'], 'readwrite')
  let sotre = new DBStore('ArticleCache', transction)
  getLocalData(sotre, { id, index: 'byArticleId' }).then((res) => {
    console.log(res)
  })
})
```

### 网络监测

离线缓存往往涉及到网络监测，有多种方式：

1. 监听 offline online 事件，但偶尔看到有说判断失败的情况，目前在 chrome 未发现问题，谨慎使用
2. 使用 navigation.onLine 获取网络状态，存在兼容问题
3. 定时发起 ajax 请求，可设定连续n次失败断定网络或服务器异常，考虑了网络抖动情况

#### 预防非网络性的数据丢失

比如未保存数据进行页面刷新，关闭，前进后退操作，可使用 beforeunload 拦截标签页前进后退，刷新，关闭，进行强提示。

要显示确认对话框，事件处理程序需要在事件上调用preventDefault()。

但是请注意，并非所有浏览器都支持此方法，而有些浏览器需要事件处理程序实现两个遗留方法中的一个作为代替：

- 将字符串分配给事件的returnValue属性
- 从事件处理程序返回一个字符串。

```js
useEffect(() => {
  const handleBeforeUnload = (e: any) => {
    e.preventDefault()
    /* 弹出提示框 */
    const isChange = backupData !== content // 是否有变化
    if (isChange) {
      // 有网 或者 无网络但未保存成功
      if (!offline || (offline && saveStatus !== SaveStatus.end)) { 
        message.warning('当前数据未保存，页面关闭或刷新将导致数据丢失!')
        // 页面重载弹出框优先级最高，其他弹窗都会在取消重载页面后才生效
        e.returnValue = ''
        return ''
      }
    }
    return false
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}, [backupData, content, offline, saveStatus])
```

需注意的是使用 usEeffect 时删除监听器再监听，否则同时会有多个监听器一起工作。

### 总结

总结个毛哇，这篇文章好水哈哈哈哈，属实有些过度封装了，这里就记个反例吧，那最后请读者看个美女吧！

<img max-width="500" src="http://5b0988e595225.cdn.sohucs.com/images/20200127/a8200eafe16b46ffaaf22dc8158ebce1.jpeg">
<img max-width="500" src="http://5b0988e595225.cdn.sohucs.com/images/20200127/3c1b24f4aec1458184ac81b77a1ec563.jpeg">
<img max-width="500" src="http://5b0988e595225.cdn.sohucs.com/images/20200127/5fb16309eadf4231a25cad4af5039f24.jpeg">

啊啊啊啊 我的曼丽啊 意难平 T^T

### 附录

[IndexedDB API](https://wangdoc.com/javascript/bom/indexeddb.html)

[IndexedDB 浏览器存储限制和清理标准](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API/Browser_storage_limits_and_eviction_criteria)

430195572

1608186171799

1608439081799
