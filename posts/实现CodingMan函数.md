#### 题目

```
CodingMan('Jack').sleep(10).eat('dinner')
输出：
hello, I'm Jack
wait 10...
eat dinner

CodingMan('Jack').eat('orange').eat('apple')
输出：
hello, I'm Jack
eat orange
eat apple


CodingMan('Jack').sleepFirst(10).eat('dinner')
输出：
wait 10...
hello, I'm Jack
eat dinner
```

题目关键在于 sleep 与 sleepFirst 的实现，sleep 可以用 setTimeout 等实现，而 sleepFirst 不仅需要等待而且执行时机也靠前

面试时大概是脑子不太清醒 T T，理所当然得以为 sleepFirst 只会执行一次，且一定会在 CodingMan('Jack') 执行之后，几乎就是面向用例编程了，于是写下了这样愚蠢的代码：

```js
function CodingMan(text) {
    // 把 hello 先存起来，找时机执行
    return CodingMan;
}
CodingMan.sleep = (t) => {
    // 先消费 hello
    // 再 await
    return CodingMan;
};
CodingMan.sleepFirst = (t) => {
    // 先 await
    // 再消费 hello
    return CodingMan;
};
CodingMan.eat = (text) => {
    // 先消费 hello
    // 再打印eat
    return CodingMan;
};
```

问题：

1. hello 怎么存储，挂在 CodingMan 的话，那同时几个任务的情况不好办了
2. sleepFirst 多次被调用，或者在其他方法之后的情况

思路转换为存储任务队列，遇到 sleepFirst 则 unshift，因为这里没有一个类似于 run 最后执行的方法说明任务采集结束，所以只能利用<code>事件循环</code>，在下一个宏任务执行。

```js
function CodingMan(person) {
    let fnQueue = []; // 任务队列
    CodingMan.fnQueue = fnQueue;
    CodingMan.say(person);
    setTimeout(() => { // 下一个宏任务执行
        while (fnQueue.length) {
            const fn = fnQueue.shift();
            fn();
        }
    });
    return CodingMan;
}
CodingMan.say = (text) => {
    function fn() {
        console.log(`hello, I'm ${text}`);
    }
    CodingMan.fnQueue.push(fn);
    return CodingMan;
}
// ...
```

这里虽然实现了队列机制保证了顺序，但是如果同时多个 CodingMan 的话就不太好看了，
所以每个CodingMan 最好维护自己的那一份 fnQueue，有多种实现方式：

1 全局对象, 以 person为key 保存自己的 fnQueue

```js
let GlobalQueues = []
let key = '' // 当前在收集谁的任务
function CodingMan(person) {
  key = person
  GlobalQueues[key] = []
  CodingMan.say(person);
  setTimeout(() => { // 下一个宏任务执行
    // 遍历 GlobalQueues
  });
  return CodingMan;
}
CodingMan.say = (text) => {
  function fn() {
    console.log(`hello, I'm ${text}`);
  }
  GlobalQueues[key].push(fn);
  return CodingMan;
}
```

2 CodingMan 返回一个实例，每个实例保存自己的fnQueue

```js
function CodingMan(person) {
    return new Person(person);
}
class Person {
    constructor(person) {
        this.fnQueue = [];
        this.name = person;
        this.say(person);
        setTimeout(() => {
            while (this.fnQueue.length) {
                this.fnQueue.shift()();
            }
        });
    }
    say (text) {
        function fn() {
            console.log(`hello, I'm ${text}`);
        }
        this.fnQueue.push(fn.bind(this));
        return this;
    }
    sleep (t) {
        function fn() {
            console.log(`${this.name} wait ${t} ...`);
            let time = Date.now();
            while (Date.now() - time <= t * 1000) { }
        }
        this.fnQueue.push(fn.bind(this));
        return this;
    }
    sleepFirst(t) {
        function fn() {
            console.log(`${this.name} wait ${t} ...`);
            let time = Date.now();
            while (Date.now() - time <= t * 1000) { }
        }
        this.fnQueue.unshift(fn.bind(this));
        return this;
    }
    eat (text) {
        function fn() {
            console.log(`${this.name} eat ${text}`);
        }
        this.fnQueue.push(fn.bind(this));
        return this;
    }
}
```

执行:

```js
CodingMan('Jack').sleepFirst(3).eat('dinner');
CodingMan('Kite').sleep(2).eat('dinner');
```

输出:

```
Jack wait 3 ...
hello, I'm Jack
Jack eat dinner
hello, I'm Kite
Kite wait 2 ...
Kite eat dinner
```

顺序没有问题，总感觉哪里不对劲，既然 Jack sleep 了，可以理解为异步吧，此时应该立即输出 hello, I'm Kite 了，这里全部通过 <code> while (Date.now() - time <= t * 1000) { } </code> 阻塞了后续执行，如果需要严格异步来走的话，输出应该是:

```
Jack wait 3 ...
hello, I'm Kite
Kite wait 2 ...
Kite eat dinner
hello, I'm Jack
Jack eat dinner
```

异步就不能用 while 了，必须放在setTimeout内，因为是异步的，所以必须把后续的任务断开，当前任务执行完才能进行下一个，此时灵机一动，这不就和前几天看的洋葱模型相似吗，执行了 next 进如下一个任务！

```js
// 比如 sleep
    sleep (t) {
        function fn(next) {
            console.log(`${this.name} wait ${t} ...`);
            setTimeout(() => {
                next(); /// t秒后next
            }, t * 1000);
        }
        this.fnQueue.push(fn.bind(this));
        return this;
    }
```

那此时 setTimeout 里不能直接遍历执行了

```js
class Person {
    constructor(person) {
        this.fnQueue = [];
        this.name = person;
        this.say(person);
        setTimeout(() => {
            let fn = compose(this.fnQueue);
            fn();
        });
    }
// ...
}
```

重点在于 compose 的实现，修改任务执行时的next参树，将其指向下一个任务：

```js
function compose(fns) {
    return function () {
        return dispatch(0);
        function dispatch(i) {
            const fn = fns[i];
            if (!fn) { return; }
            return fn(dispatch.bind(null, i + 1));
        }
    };
}
```

此时执行时不会因为sleep的等待阻塞下一个 CodingMan 的执行。

#### 总结

1. 本题主要考察的是事件循环的理解，setTimeout 生成宏任务的使用
2. 链式调用
3. 题目解读，方法的执行顺序是不定的
4. 题目解读，所有CodingMan是顺序依次执行还是各自异步执行？
    如果是异步，如何中断任务的执行过程，并且保证正确的执行顺序

#### 完整代码

```js
function CodingMan(person) {
    return new Person(person);
}

function compose(fns) {
    return function () {
        return dispatch(0);
        function dispatch(i) {
            const fn = fns[i];
            if (!fn) { return; }
            return fn(dispatch.bind(null, i + 1));
        }
    };
}

class Person {
    constructor(person) {
        this.fnQueue = [];
        this.name = person;
        this.say(person);
        setTimeout(() => {
            let fn = compose(this.fnQueue);
            fn();
        });
    }
    say (text) {
        function fn(next) {
            console.log(`hello, I'm ${text}`);
            next();
        }
        this.fnQueue.push(fn.bind(this));
        return this;
    }
    sleep (t) {
        function fn(next) {
            console.log(`${this.name} wait ${t} ...`);
            setTimeout(() => {
                next();
            }, t * 1000);
        }
        this.fnQueue.push(fn.bind(this));
        return this;
    }
    sleepFirst(t) {
        function fn(next) {
            console.log(`${this.name} wait ${t} ...`);
            setTimeout(() => {
                next();
            }, t * 1000);
        }
        this.fnQueue.unshift(fn.bind(this));
        return this;
    }
    eat (text) {
        function fn(next) {
            console.log(`${this.name} eat ${text}`);
            next();
        }
        this.fnQueue.push(fn.bind(this));
        return this;
    }
}

CodingMan('Jack').sleepFirst(3).eat('dinner');
CodingMan('Kite').sleep(2).eat('dinner');

// console
Jack wait 3 ...
hello, I'm Kite
Kite wait 2 ...
Kite eat dinner
hello, I'm Jack
Jack eat dinner
```
