### 为什么会有Promise

js是单线程，一次只能执行一个任务，如果有多个任务就要排队，一个任务完成以后继续下一个任务，但是发送请求获取数据是需要时间的，在结果出来之前是无法进行其他操作的，这显然是不合理的。

为了使js支持异步，浏览器和node都是基于事件驱动的架构，本质是主循环加事件触发的方式运行程序，使得js在等待的这段时间去做其他的事情，等有了结果后在某次事件循环里处理。

传统的异步写法是【回调函数和事件】的结构

```js
let ajax = (url, success, fail) => {
  let xhr = new XMLHttpRequest();
  xhr.open('get', url);
  xhr.onreadystatechange = _ => { // 事件
    if(xhr.readyState !== 4) return;
    if(xhr.status >= 200 && xhr.status < 400) {
       success(xhr.response) // 回调
    } else {
       fail(new Error(xhr.statusText))
    }
  }
} 

ajax('/data.json', function(response){}, function(error){})
```

但是使用回调函数很容易陷入回调地狱，这会造成代码层次复杂可读性差难以维护的问题，因此ES6原生提供Promise对象统一了江湖上的一些解决方法，将其列入规范，使得异步的操作「近乎」同步化。（但promise并不能从根本上解决回调，acync/await 是解决回调的终极方案）

### 任意异步操作封装为promise

我们可以将任意的异步操作都封装为promise，只需要在原来回调的地方更改promise的状态，然后通过then函数执行成功回调或者失败回调

```js
let dynamicFunc = cb => {
  setTimeout(cb, 1000);
}
let cb = () => {  console.log('一段时间后执行');}
dynamicFunc(cb);

// 修改后
let dynamicFunc = () => {
   return new Promise(resolve => {
      setTimeout(_=> {
        resolve(); // 更改状态
      }, 1000);
   })  
}
let cb =_ => {  console.log('一段时间后执行');}
dynamicFunc().then(cb);
```

promise A+规范中说明了一个函数或者对象想成为promise的细节

### 认识Promise

MDN 对 Promise 这样定义：Promise 对象用于表示一个异步操作的最终状态（完成或失败），以及该异步操作的结果值。

这里需要对【状态】【结果值】划重点，看看Promise到底是如何表示状态和结果值：

【状态】Promise将异步请求到获得结果的过程分为三种状态：Pending（进行中），Fulfilled（成功），Rejected（失败）

【结果值】异步操作的结果在Promise内部是以回调参数的形式存在的，通过成功回调和失败回调层层传递。

Promise类似于一个容器，保存着未来要发生的事情，解决回调嵌套的方法是将未来要发生的事情按顺序保存起来，每件事情都会对上一步做的事情进行容错处理，第一件事做完（无论失败还是成功），都会接着去做第二件事，再去做第三件事... 直到结束，这里便涉及到【任务队列】，就是有很多事情顺序排列。

基于以上概念，下面来开始一步步分析...

### 手写Promise

Promise的基本用法如下：

```js
let promise = new Promise((resolve, reject) => {
   if(异步操作成功) { resolve(value);}
   else { reject(error); }
})
```

可以看到，Promise接受一个函数作为参数，该函数有两个参数 resolve reject

在写代码之前，先定义一个判断函数和状态常量，后面会用到

```js
// 判断变量否为function
const isFunction = variable => typeof variable === 'function'

const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'
```

定义一个MyPromise类，接受handle作为参数，并进行类型判断，还需要两个变量来保存【状态】和【结果值】，以便追踪或更改promise进度

```js
class MyPromise{
   constructor(handle){
      if(!isFunction(handle)){
         throw new Error('MyPromise must accept a function as a parameter')
      }
      this._status = PENDING;
      this._value = undefined;

      try {
         handle(this._resolve.bind(this), this._reject.bind(this))
      } catch (err) { // catch捕获非promise错误
         this._reject(err)
      }
   }
}
```

对 try catch的分析：Promise是一个承诺，无论出现那种异常都必须给调用者一个交代，即使是调用者出错，比如下面浏览器会报出一个语法错误，但是不会退出进程，继续catch可以打印出错误，再继续then还会执行

<img src="https://orangesolo.cn/assets/image/9a8fa5374744bb62a07c1043d9e57908.png" alt="" class="md-img" loading="lazy"/>

这就是因为Promise内部都是使用try catch来捕获错误的，try catch可以捕获到同步和异步错误，发生错误时，catch 会将错误反馈给 reject

> 由于 Promise 内部的错误不会影响到 Promise 外部的代码，这种情况我们就通常称为 “吃掉错误”。

promise 中的错误如果不处理会一步步向下传递，所以一般推荐promise链的结尾加一个catch函数

再看前面的myPromise, 可以发现 handle执行时的代码: _resolve_reject，这两个在Promise内部作为私有方法（实际上 promise 并没有对外暴露具体_resolve 执行方法）

1. _resolve将Promise的【状态】修改为Fulfilled，并根据参数重置Promise的【结果值】
2. _reject将Promise的【状态】修改为Rejected，并根据参数重置Promise的【结果值】

```js
_resolve(val) {
     if (this._status !== PENDING) return
     this._status = FULFILLED 
     this._value = val
}
_reject(err) {
    if (this._status !== PENDING) return
    this._status = REJECTED
    this._value = err
}
```

现在便可以修改【状态】和拿到【结果值】，但我们是要对拿到的数据进行处理并对对外传递，这时就要用到then，then做了两件事：

1. 新建一个promise并返回

then每次都会返回一个新的promise，保证了链式调用，同时也证明了规范中 Promise 的状态一经更改就不可再变，新的promise会继续从 pending 开始更新到相应的【状态】，返回对应点的【结果值】

2. 根据状态判断加入队列还是立即执行

同步代码会直接调用onFulfilled或者onRejected立即执行

但是异步需要等待返回结果，它会处于pending的状态，此时就需要push到任务队列
任务队列分为成功回调队列和失败回调队列：

- 成功的回调（then的第一个函数）放在 _fulfilledQueues
- 失败的回调（then的第二个函数）放在 _rejectedQueues

```js
constructor(handle) {
    if (!isFunction(handle)) {
        throw new Error('MyPromise must accept a function as a parameter')
    }

    this._status = PENDING;
    this._value = undefined;
    // 成功回调
    this._fulfilledQueues = [];
    // 失败回调
    this._rejectedQueues = [];
    try {
        handle(this._resolve.bind(this), this._reject.bind(this))
    } catch (err) { // catch捕获非promise错误
        this._reject(err)
    }
}
then(onFulfilled, onRejected) {
    let { _status, _value } = this;
    return new MyPromise(() => {
        switch (_status) {
            case 'PENDING': // push到队列
                this._fulfilledQueues.push(onFulfilled);
                this._rejectedQueues.push(onRejected);
                break;
            case 'FULFILLED': // 立即执行
                onFulfilled(_value);
                break;
            case 'REJECTED': // 立即执行
                onRejected(_value);
                break;
        }
    })
}
```

因此当 resolve 被同步调用时，紧跟着的then会立即执行

<img src="https://orangesolo.cn/assets/image/3806a14bdca2c136dba07848c1bca3d4.png" alt="" class="md-img" loading="lazy"/>

如果是异步代码，状态不会立即变更，调用then会将回调 push到 _fulfilledQueues_rejectedQueues，它们会在 _resolve 或_reject 里被执行，直到【任务队列】为空

```js
_resolve(val) {
  if (this._status !== PENDING) return
  setTimeout(()=> { // 异步执行
    this._status = FULFILLED
    this._value = val

    const runFulfilled = (value) => {
        let cb;
        while (cb = this._fulfilledQueues.shift()) {
            cb(value)
        }
    }
    runFulfilled(val);
  })
}

_reject(err) {
 if (this._status !== PENDING) return
 setTimeout(()=> { // 异步执行
    this._status = REJECTED
    this._value = err

    const runRejected = (value) => {
        let cb;
        while (cb = this._rejectedQueues.shift()) {
            cb(value)
        }
    }
    runRejected(err)
  })
}
```

使用 setTimeout 模拟微任务执行时机

再来看下目前 then 存在的问题：

1、链式调用不完整，只有第一次then可用，then返回的新的promise【状态】还无法更改，一直是pending

2、 Promise规范里then的参数可选，所以会有onRejected不存在的情况 比如下面的代码，所以需要引导【结果值】向下传递，像下面这样：

<img src="https://orangesolo.cn/assets/image/97755e2cd0adc54f9a86315e71bda037.png" alt="" class="md-img" loading="lazy"/>

3、【结果值】仍是promise的情况

<img src="https://orangesolo.cn/assets/image/410ef8e6fb89990b9c83496f168d98e7.png" alt="" class="md-img" loading="lazy"/>

下面对then进行补充，分别封装then内部执行回调并向下传递处理结果的成功方法和失败方法

```js
then(onFulfilled, onRejected) {
    let { _status, _value } = this;
    return new MyPromise((onFulfilledNext, onRejectedNext) => {
        let fulfilled = value => {
            try {
                if (!isFunction(onFulfilled)) {
                    onFulfilledNext(value); // 当前没有处理回调，把结果直接扔给下一个then并立即执行 -->解决问题1，2
                } else {
                    let res = onFulfilled(value); // 执行then里传递的成功回调
                    if (res instanceof MyPromise) { // 回调结果是promise
                        res.then(onFulfilledNext, onRejectedNext) // 直接调用then -->解决问题3
                    } else {
                        onFulfilledNext(res);  // ---> 所有流程正常，该有的回调都有，正常向下传递并立即执行, -->解决问题1
                    }
                }
            } catch (err) {
                // 所有可能的情况都考虑在内，但依然执行出错，此时交给下一个错误处理函数并立即执行  -->解决问题1
                onRejectedNext(err)
            }
        }
          
        // 与 fulfilled 同理
        let rejected = error => {
            try {
                if (!isFunction(onRejected)) {
                    onRejectedNext(error) 
                } else {
                    let res = onRejected(error);
                    if (res instanceof MyPromise) {
                        res.then(onFulfilledNext, onRejectedNext);
                    } else {
                        onFulfilledNext(res);
                    }
                }
            } catch (err) {
                onRejectedNext(err);
            }
        }

        switch (_status) {
            case PENDING:
                this._fulfilledQueues.push(fulfilled);
                this._rejectedQueues.push(rejected);
                break;
            case FULFILLED:
                fulfilled(_value);
                break;
            case REJECTED:
                rejected(_value);
                break;
        }
    })
}
```

因此 _fulfilledQueues_rejectedQueues 保存的其实是 ’包装‘ 后的函数，这个函数判断目前then是否有成功回调，没有就把结果传给下一个回调，有的话就将结果值传给当前then的成功回调，如果返回的是promise，调用then，并传递 onFulfilledNext onFulfilledNext，否则将本次结果直接向下传递。

包装后的回调在执行时，也控制着本次promise的状态

但还有返回的依旧是 promise 的情况：

<img src="https://orangesolo.cn/assets/image/8fba67f3ded835451fcc1848a91268b7.png" alt="" class="md-img" loading="lazy"/>

所以现在需要做的是，在resolve里加一层判断，如果参数是 Promise类型就需要特殊处理

```js
_resolve(val) {        
  if (this._status !== PENDING) return
  setTimeout(()=> { // 异步执行
    const runFulfilled = (value) => {
        let cb;
        while (cb = this._fulfilledQueues.shift()) {
            cb(value)
        }
    }
    const runRejected = (error) => {
        let cb;
        while (cb = this._rejectedQueues.shift()) {
            cb(error)
        }
    }

    if (val instanceof MyPromise) {
        // 等待返回值并将状态与结果传递给当前promise，无论是成功还是失败
        val.then(res => { 
            this._value = res;
            this._status = FULFILLED;
            runFulfilled(res);
        }, err => {
            this._value = err;
            this._status = REJECTED;
            runRejected(err);
        })
    } else { // 只要返回非promise，都将状态变为成功
        this._value = val
        this._status = FULFILLED
        runFulfilled(val);

    }  
  })  
}
```

至此最重要的then就结束了，下面看一下catch，它是then的语法糖，

```js
catch(onRejected){
    // 继续return，保证链式调用
    return this.then(undefined, onRejected)
}
```

#### 静态方法的实现

1、 Promise.resolve(), Promise.reject()

```js
static resolve(value) {
    // 1 参数是一个 Promise 实例,不做任何修改、原封不动地返回这个实例
    if (value instanceof Promise) {
        return value;
    }
    // 2 参数是一个thenable对象,将这个对象转为 Promise 对象，然后就立即执行thenable对象的then方法。
    if (value?.then) {
        return new Promise((resolve, reject) => {
            value.then(resolve, reject);
        });
    }
    // 3 参数不是具有then方法的对象，或根本就不是对象
    // 4 不带有任何参数
    return new Promise((resolve) => {
        resolve(value);
    });
}
```

Promise.reject()，类似于Promise.resolve() ，但不同点在于它会原封不动将参数作为reject的error

```js
static reject(err) {
    return new MyPromise((_, reject) => reject(err))
}
```

2、Promise.all()

```js
static all(list) {
    // 将多个Promise实例包装成一个
    return new MyPromise((resolve, reject) => {
        let count = 0,
            values = [];
        list.forEach(promise => {
            // 需要注意的是 如果非Promise实例需要调用Promise.resolve进行包装
            this.resolve(promise).then(res => {
                values.push(res);
                count++;
            }, err => {
                reject(err) // 有一个reject则直接退出
            })
        });
        if (count === list.length) {
            resolve(values)
        }
    })
}
```

可以使用catch来捕获错误，但如果某个promise被reject了，而他自身带有catch来捕获错误的话，Promise.all的catch就会被搁置

3、Promise.race()

```js
static race(list) {
    return new MyPromise((resolve, reject) => {
        list.forEach(promise => {
            // 返回率先改变状态的Promise，通过 resolve / reject 直接修改promise的状态
            this.resolve(promise).then(value => resolve(value), err => reject(err))
        })
    })
}
```

4、Promise.Prototype.finally()

接受普通函数作为参数，无论怎样都会执行，没有参数，不返回任何数据，其余代码该干嘛干嘛

```js
finally(cb) {
    return this.then(
        value => MyPromise.resolve(cb()).then(() => value),
        reason => MyPromise.resolve(cb()).then(() => { throw reason })
    )
}
```

Promise简易版本实现就到这了

### promise 错误捕获

1、 未被捕获的 promise 错误将在浏览器出现 Uncaught (in promise)  错误提示：

<img src="https://orangesolo.cn/assets/image/d9393d479f292d1df4322bb802396563.png" alt="" class="md-img" loading="lazy"/>

在node中会有 UnhandledPromiseRejection 错误提示：

<img src="https://orangesolo.cn/assets/image/89eab20a9c4733690c9cccb584eb8bd7.png" alt="" class="md-img" loading="lazy"/>

**Promise 中的异常不能被 try-catch 和 window.onerror 捕获** ，浏览器和node都可以通过监听 unhandledrejection  事件来达到目的

```js
// 浏览器
window.addEventListener('unhandledrejection', function (e) {
    e.preventDefault();
    console.log('捕获到 promise 错误了');
    console.log('错误的原因是', e.reason);
    console.log('Promise 对象是', e.promise);
    return true;
});

// node
process.on('unhandledRejection', (e) => {
  console.log(e)
})
```

2. 建议在代码可控制在的情况都进行catch，并且使用 catch 方法而不是then的第二个参数，promise.then().catch(), 这样catch还可以捕获到then里面出现的错误

### 微任务

#### 微任务由来

JavaScript 中之所以要引入微任务，主要是由于主线程执行消息队列中宏任务的时间颗粒度太粗了，无法胜任一些对精度和实时性要求较高的场景，微任务可以在实时性和效率之间做一个有效的权衡。另外使用微任务，可以改变我们现在的异步编程模型，使得我们可以使用同步形式的代码来编写异步调用。

#### promise 中的微任务

Promise 中只有涉及到状态变更后才需要被执行的回调才算是微任务，比如说 then、 catch 、finally ，其他所有的代码执行都是宏任务（同步执行）
then 里的回调只要执行成功就会自动resolve，将下一个then的成功回调放进微任务

### 附录

[promise A+规范](https://promisesaplus.com/)

[阮一峰Promise详解](https://es6.ruanyifeng.com/#docs/promise)

[Promise 你真的用明白了么？](https://juejin.cn/post/6869573288478113799)

880470100

1566138400714

1603700524263
