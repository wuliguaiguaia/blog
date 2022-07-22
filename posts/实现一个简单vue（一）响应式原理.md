##### 响应式原理

vue  的 响应式实现实际就是 代理拦截 + 观察者模式

代理拦截：通过 Object.defineProperty 设置 get set，当数据被调用时进行依赖收集，当数据被修改时触发 set

观察者模式：观察者如 watch computed 或者是组件级 watcher，这些watcher都各自保存着自己要观察的对象，如 data 或者 props 的数据，在组件初始化被调用放在了watcher的观察列表里，同时为了方便，这些数据也都保存着相关的观察者们

在 vue 里，被观察者是一个 Dep 的类，subs 保存了所有观察者们，观察者是一个 Watcher 类，deps 保存所有要观察的对象

当被观察者 data 或者 props 在某些时候被修改了，就会触发代理时所设置的set，set 的作用就是去通知当前数据，其实就是被包装后的 Dep 实例，触发Dep实例之前保存的所有watcher的update方法

update 方法对于watch，那就是执行watch函数，computed就是触发设置的get，组件级watcher就是重新触发diff渲染更新，当然要执行的具体的这些 update，也是在一开始进行初始化 Watcher类时设置的

<img src="https://orangesolo.cn/assets/image/497c1b28e797900020501dc86d987270.png" alt="" class="md-img" loading="lazy" width="796" height="474"/>

对应到源码的整个流程就是；

1、new Vue 后调用原型上的 _init，initState 时 initData 里会对 data 进行observe，先为 data 实例化一个 Observer，然后为 data 添加一个独立的Dep实例，并设置getter和setter，这里如果 data内某属性值为引用类型，或者引用类型内某属性值仍为引用类型，会递归再走一遍 observe。

2、组件 mount 时会为vm实例化一个Watcher，然后进行 render vm，这里会获取某些数据，此时会进行依赖收集，先将这个数据的 Dep 实例添加到vm watcher的deps里，表示这个观察者有一个订阅者了，然后将这个watcher添加到这个数据的subs里，表示这个被观察者终于有一个观察者了

3、此时用户交互触发了 method 进行了数据变更，比如修改某个data属性，这个data属性的Dep实例（被观察者）就会通知它的subs（也就是所有的观察者）执行update，如果这个 watcher 是个vm，就会先执行queueWatcher，在nextTick里进行更新视图（updateComponent）

4、当然在init 阶段里

props 的数据会进行 defineReactive，和data流程一样

computed 里的数据的会直接实例化一个Watcher，属性本身的get和set在初始化被重写（defineComputed），在get的时候它的getter先被调用，Dep.target 被置为computedWatcher，他的依赖属性的getter后被调用，结果是为computedWatcher 的deps添加这个依赖的Dep实例（订阅者），为他的依赖的Dep实例的subs增加当前 computedWatcher（观察者）

watch 里的数据会调用 vm.$watch 间接为其实例化 Watcher，与上类似

5、这些watcher 都会push到所在vm的_watchers属性下，在destroy钩子下遍历deps移除所有的观察者

##### 简版实现

模拟简化代码如：（参考源码）

```js
class Vue {
  constructor(options) {
    if (!options) return;
    this._init(options);
  }

  _init(options) {
    const vm = this;
    this.$options = options;
    this.initState(vm);
    vm._watchers = []; // 存储当前vm下的所有watcher
    this.mount(vm, options); // 实例挂载
  }

  initState(vm) {
    const { data, methods, watch, computed } = this.$options;
    if (data) this.initData(vm, data);
    if (methods) this.initMethods(vm, methods);
    if (watch) this.initWatch(vm, watch);
    if (computed) this.initComputed(vm, computed);
  }

  initData(vm, data) {
    vm.$data = data;
    proxy(vm, '$data', data); // 将this.xxx 转发到this.$data.xxx 下
    observe(data); // 进行响应式
  }

  initMethods(vm, methods) {  //  将所有的 methods 代理到 this 上
    Object.keys(methods).forEach(key => {
      Object.defineProperty(vm, key, {
        get() {
          return methods[key];
        }
      });
    });
  }

  initWatch(vm, watch) { }

  initComputed(vm, computed) { }

  mount(vm, options) {
    let { el, template } = options;
    if (el) {
      template = document.querySelector(el).outerHTML; // 如果el存在，取其outerHTML
    }

    const { render } = compile(template); // 获取 render 函数
    vm._render = render;

    vm.$el = document.querySelector(el); // 初始化 $el
    vm.$el.innerHTML = ''

    const updateComponent = () => {
      const vnode = vm._render(); // 生成vnode
      vm._update(vm, vnode); // 视图渲染
    };

    vm._watcher = new Watcher(vm, updateComponent, true /* render watcher */);
  }

  _update(vm, vnode) {
    const preVnode = vm._vnode
    vm._vnode = vnode
    vnode.elm = this.$el
    if (!preVnode) { // 初次渲染
      vm.$el = vm.__patch__(null, vnode)
    } else { // 更新后的渲染
      vm.$el = vm.__patch__(preVnode,vnode)
    }
  }

  __patch__(oldVnode, vnode) {
    return patch(oldVnode, vnode, this.$el, this)
  }
}
```

proxy 转发

```js
export const proxy = (vm, source, data) => {
  Object.keys(data).forEach(key => {
    Object.defineProperty(vm, key, {
      get () {
        return vm[source][key];
      },
      set(newVal) {
        vm[source][key] = newVal;
      }
    });
  });
};
```

整个实现代理的流程：

```js
export const observe = (data) => {
  if (!data || typeof data !== 'object') return;
  let ob;
  // 通过是否有 __ob__ 属性判断是否已经响应式过
  if (data.hasOwnProperty('__ob__') && data.__ob__ instanceof Observer) {
    ob = data.__ob__; // 已经响应式过了，返回__ob__
  } else {
    ob = new Observer(data);
  }

  return ob;
};

class Observer {
  constructor (data) {
    this.dep = new Dep(data); // 数组会用

    // ob 不可枚举
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false,
      configurable: true,
      writable: true
    });

    if (Array.isArray(data)) {
      data.__proto__ = arrayMethods; // 直接修改了数组的__proto__?
      this.observeArray(data);
    } else {
      this.walk(data); // 开始监听
    }
  }

  walk (data) {
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key]);
    });
  }

  observeArray (data) {
    Object.keys(data).forEach(key => {
      observe(data[key]);
    });
  }
}

export const defineReactive = (obj, key, value) => {
  const dep = new Dep(key); // 每个响应式数据都有一个dep实例，用来收集watcher

  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && !property.configurable) return;

  value = value ?? obj[key];

  const childOb = observe(value); // 递归观察
  Object.defineProperty(obj, key, {
    enumerable: true, // 可枚举
    configurable: true, // 可修改和删除
    get () {
      if (Dep.target) { // 当前 watcher 实例，全局只有一个
        dep.depend(); // 数据获取时增加观察者
        if (childOb) {
          // 预留
        }
      }
      return value;
    },
    set (newValue) { // 嵌套函数 this 会丢失
      if (newValue === value) {
        return;
      }
      observe(newValue); // 如果新值仍是对象
      value = newValue;
      /* 在set的时候触发notify来通知所有的Watcher对象更新视图 */
      dep.notify();
    }
  });
};
```

被观察者 Dep 类：

```js
let uid = 0;

export class Dep {
  constructor (key) {
    this.id = uid++;
    // 用来存储 watcher 对象
    this.subs = [];
    this.key = key; // 以便知道是哪个数据订阅的，如果有同名属性不严格准确
  }

  depend (watcher) {
    if (Dep.target) {
      Dep.target.addDep(this); // 为当前观察者增加订阅者,
      // 在watcher.addDep内进行是否重复添加的判断后会调用addSub
    }
  }

  addSub (watcher) {
    this.subs.push(watcher);
  }

  notify () {
    const subs = this.subs.slice(); // 不深复制会怎样
    subs.forEach(watcher => {
      watcher.update();
    });
  }
}

Dep.target = null; // 初始化Dep.target
```

因为 Object.defineProperty 有操作数组的限制，对常用方法会进行重写：

```js
const proto = Array.prototype;
const patchMethods = [
  'pop',
  'push',
  'unshift',
  'shift',
  'splice',
  'sort',
  'reverse'
];

export const arrayMethods = Object.create(proto);

patchMethods.forEach(method => {
  const original = proto[method];
  Object.defineProperty(arrayMethods, method, {
    value: function (...args) {
      const result = original.apply(this, args);
      const ob = this.__ob__;
      let inserted;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          inserted = args.slice(2);
          break;
      }
      if (inserted) {
        ob.observeArray(inserted);
      }
      ob.dep.notify();  // 通知
      return result;
    },
    enumerable: false,
    writable: true,
    configurable: true
  });
});
```

在初始时 watch 和 computd 都会被处理成 Wacther 实例， 并且在mount时，会生成一个组件级别的 watcher，watcher 的实现如：

```js
import { Dep } from '../dep';
import { queueWatcher } from './syncUpdate';

let uid = 0;

export class Watcher {
  constructor (vm, cb, isRenderWatcher) {
    this.id = uid++;
    if (isRenderWatcher) {
      vm._watcher = this;
    }
    vm._watchers.push(this);
    this.cb = cb;
    this.deps = [];
    this.depsId = [];

    Dep.target = this;
    this.cb(); // 这里首次触发模板编译 并 收集依赖
    Dep.target = null; // 该watcher收集依赖使命结束
  }

  addDep (dep) {
    if (!this.depsId.includes(dep.id)) {
      // 防止重复
      this.depsId.push(dep.id);
      this.deps.push(dep);
      dep.addSub(this); // 为当前watcher增加订阅者
    }
  }

  update () {
    queueWatcher(this);
  }

  run () {
    this.cb();
  }
}
```

##### 批量异步更新

至此基础的响应式已经实现了，需要注意的是，组件级 watcher 每次执行都会触发 dom diff ，再更新视图，如果短时间有较大量级的watcher需要update，那就会频繁操作 dom会有一定的性能问题，因此 vue 有批量异步更新的设定。

批量：将短时间的多次操作合并成一个

异步：利用诸如 setTimeout 或者 Promise.resolve().then API 将操作延迟

具体的实现就是将所有 watcher 缓冲到一个queue里，在下一次事件循环里执行

Watcher 类的 update 方法就是干这事的：

先缓冲：

```js
let has = {};
const queue = [];
let isWaiting = false;
export const queueWatcher = (watcher) => {
  if (!has[watcher.id]) { // 通过 id 保证同一个watcher在一个时间段只能执行一次
    has[watcher.id] = true;
    queue.push(watcher);
  }

  if (!isWaiting) {
    isWaiting = true;
    nextTick(flushSchedulerQueue);
  }
};
```

确定要执行的东西：

```js
function flushSchedulerQueue () {
  queue.forEach(watcher => {
    has[watcher.id] = null;
    watcher.run();
  });

  has = {};
  queue.length = 0;
  isWaiting = false;
}
```

在什么时候执行：

```js
const cbs = [];
let pending = false;

export const nextTick = (cb) => {
  cbs.push(cb);
  if (!pending) {
    pending = true;
    Promise.resolve().then(() => {
      // 优先使用Promise.resolve，MutationObserver次之，setImmediate再次之，setTimeout最次之
      // 这里就直接使用 promise了
      pending = false;
      const curCbs = cbs.slice();
      cbs.length = 0; // 清空
      curCbs.forEach((fn) => {
        fn();
      });
    });
  }
};
```

##### 总结

基本上就是这些，记住 代理拦截 + 观察者模式 + 批量异步更新就行啦

1603699380129

1603959200526
