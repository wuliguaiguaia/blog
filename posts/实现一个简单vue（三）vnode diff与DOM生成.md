### vnode diff 时机

vue 响应式是观察者模式，对应到代码就是有众多 Watcher 的实例，当被观察者变化 watcher 执行 update，如果 watcher 是一个组件级watcher时就需要触发视图更新，视图更新就是 新旧 vnode 进行比对，拿到差异更新需要 dom

```js
class Vue {
  ...
  mount(vm, options) {
    ...
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

  // 比较 vnode
  __patch__(oldVnode, vnode) {
    console.log('oldVnode', oldVnode);
    console.log('vnode', vnode);
    return patch(oldVnode, vnode, this.$el, this)
  }
}
```

<img src="https://orangesolo.cn/assets/image/09ce584ac3ba6cc39069c084e3985230.png" alt="" class="md-img" width="628" height="372"/>

### 跨平台

在比较 vnode 的过程中，有差异可以直接操作 vnode 的 elm 属性，就是实际的dom，对其增加删除或者是修改。正因为 vnode是一个js对象，vue具有跨平台的能力，在具体操作元素的时候增加一个适配层

```js
export function createNodeOps(platform) {
  switch (platform) {
    case 'web':
      return WebNodeOps;
    case 'weex':
      return WeexNodeOps
  }
}
```

不同平台操作元素的方式不同:

```js
const WebNodeOps = {
  createElement(tagName) {
    return document.createElement(tagName)
  },
  insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode)
  },
  appendChild(parentNode, newNode) {
    parentNode.appendChild(newNode)
  },
  removeChild(node, child) {
    node.removeChild(child)
  },
  parentNode(node) {
    return node.parentNode
  },
  nextSibling(node) {
    return node.nextSibling
  },
  tagName(node) {
    return node.tagName
  },
  setTextContent(node, text) {
    node.textContent = text
  },
  createTextNode(text) {
    return document.createTextNode(text)
  },
  setValue(elm, value) {
    elm.value = value
  }
  // ...
}


const WeexNodeOps = {
  createElement(tagName) {
  },
  insertBefore(parentNode, newNode, referenceNode) { }
  // ...
}
```

### dom util

在操作dom时往往有一些公共方法可以提取

批量增加一些节点：

```js
export function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, vm) {
  for (; startIdx <= endIdx; ++startIdx) {
    const vnode = vnodes[startIdx]
    const elm = createElm(vnode, parentElm, refElm, vm);
    vnode.elm = elm
    if (vnode.children?.length) {
      addVnodes(elm, null, vnode.children, 0, vnode.children.length - 1, vm)
    }
  }
}

```

 创建一个节点：元素节点或文本节点：

```js
export function createElm(vnode, parentElm, refElm, vm) {
  if (vnode.tag) {
    return insert(parentElm, nodeOps.createElement(vnode.tag), vnode, refElm, vm);
  } else {
    return insert(parentElm, nodeOps.createTextNode(vnode.text), vnode, refElm, vm);
  }
}
```

插入一个节点，这里为了方便连带着部分属性一起处理了（并不严谨哈）：

```js
export function insert(parent, el, vnode, ref, vm) {
  console.log('---');
   if (parent) {
    if (ref) {
      if (ref.parentNode === parent) {
        nodeOps.insertBefore(parent, el, ref);
      }
    } else {
       nodeOps.appendChild(parent, el)
    }
  }

  if (vnode.tag && vnode.data) {
    const {
      data: {
        directives,
        on,
        domProps
      },
    } = vnode

    if (on) {
      Object.keys(on).forEach(key => {
        el.addEventListener(key, on[key].bind(vm))
      })
    }
    if (directives) {
      directives.forEach(({ name, value, modifiers }) => {
        el.value = domProps.value
      })
    }

    if (vnode.data.attrs) {
      const {
        staticClass, id, type
      } = vnode.data.attrs
      if (staticClass) el.class = staticClass
      if (id) el.id = id
      if (type) el.type = type
    }
  }
  return el
}
```

删除或批量删除一些节点

```js
export function removeNode(el) {
  const parent = nodeOps.parentNode(el);
  if (parent) {
    nodeOps.removeChild(parent, el);
  }
}

export function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx]
    if (ch) {
      removeNode(ch.elm);
    }
  }
}
```

等等。。。

### 比较

新旧节点进行比较一定会涉及到两棵树的遍历，树的遍历分为深度遍历和广度遍历，考虑到频繁触发更新及计算的复杂度，采用广度遍历，一层一层的对比

<img src="https://orangesolo.cn/assets/image/382242d251f3726f4f20a30e68359729.png" alt="" class="md-img" loading="lazy" width="628" height="214"/>

模拟简写：

```js
export function patch(oldVnode, vnode, parentElm, vm ) {
  if (!oldVnode) { // 初次渲染
    addVnodes(parentElm, null, [vnode], 0, 0, vm)
  } else if (!vnode) { // 销毁
    removeVnodes(parentElm, [oldVnode], 0, 0);
  } else {   // 更新
    if (sameVnode(oldVnode, vnode)) { // 对比是不是同一个节点
      patchVnode(oldVnode, vnode, vm);
    } else { // 不同节点删除旧的，增加新的
      removeVnodes(parentElm, [oldVnode], 0, 0);
      addVnodes(parentElm, null, [vnode], 0, 0, vm);
    }
  }
  return vnode.elm
}
```

#### 同一节点？

对比是不是同一个节点，更大程度的利用页面上已有的 dom

```js
function sameVnode(a,b) {
  return (
    a.key === b.key &&
    a.tag === b.tag &&
    a.isComment === b.isComment &&
    (!!a.data) === (!!b.data) &&
    sameInputType(a, b)
  )
}

function sameInputType(a, b) {
  if (a.tag !== 'input') return true
  let i
  const typeA = (i = a.data) && (i = i.attrs) && i.type
  const typeB = (i = b.data) && (i = i.attrs) && i.type
  return typeA === typeB
}
```

#### 是同一节点

```js
export function patchVnode(oldVnode, vnode, vm) {
  if (oldVnode === vnode) {
    return;
  }

  // 如果是静态节点且key相等，更新 新的 vnode 的elm即可
  if (vnode.isStatic && oldVnode.isStatic && vnode.key === oldVnode.key) {
    vnode.elm = oldVnode.elm;
    vnode.componentInstance = oldVnode.componentInstance;
    return;
  }

  // 既然是同一节点，旧节点的 elm 复制给新的
  const elm = vnode.elm = oldVnode.elm;
  const oldCh = oldVnode.children;
  const ch = vnode.children;

  // 文本节点直接修改
  if (vnode.text) {
    nodeOps.setTextContent(elm, vnode.text);
  } else {
    if (oldCh && ch && (oldCh !== ch)) {  // 如果都有子节点，更新children
      updateChildren(elm, oldCh, ch, vm);
    } else if (ch) {  // 如果新vnode有子节点
      if (oldVnode.text) nodeOps.setTextContent(elm, ''); // 先删除旧文本节点
      addVnodes(elm, null, ch, 0, ch.length - 1, vm); // 再重新添加所有新的子节点
    } else if (oldCh) { // 如果旧vnode有子节点直接删除
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    } else if (oldVnode.text) { // 如果旧节点是文本节点就删除了
      nodeOps.setTextContent(elm, '')
    } else if (oldVnode.tag === 'input') {  // 其他情况比如如果是 input 修改 value，这里简化先这样写了
      nodeOps.setValue(elm, vnode.data.domProps.value)
    }
  }
}
```

#### 比较 children

是最麻烦的一部分，新旧节点都有 children，可能存在删除，增加，或者修改，或者原先顺序被打乱的情况

```js
function updateChildren(parentElm, oldCh, newCh, vm) {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIdx, idxInOld, elmToMove, refElm;

  // 新旧节点都从 startIdx、 endIndex 向中间靠拢
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVnode) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (!oldEndVnode) {
      oldEndVnode = oldCh[--oldEndIdx];
      // 以下是 oldStartIdx、newStartIdx、oldEndIdx 以及 newEndIdx 两两比对
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      // 头部是同一节点直接比对
      patchVnode(oldStartVnode, newStartVnode, vm);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      // 尾部是同一节点直接比对
      patchVnode(oldEndVnode, newEndVnode, vm);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // 旧头 和 新尾是同一节点，顺序调换了，那元素就要向后插入
      patchVnode(oldStartVnode, newEndVnode, vm);
      nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // 新头 和 旧尾是同一节点，那元素就要向前插入
      patchVnode(oldEndVnode, newStartVnode, vm);
      nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      // 以上都不符合，就要开始搜索
      // 拿到 key 与 index 的映射
      if (!oldKeyToIdx) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      idxInOld = newStartVnode.key ? oldKeyToIdx[newStartVnode.key] : null;
      // 新节点没有key，就直接创建
      if (!idxInOld) {
        createElm(newStartVnode, parentElm, null, vm);
        newStartVnode = newCh[++newStartIdx];
      } else {
        let elmToMove = oldCh[idxInOld];
        if (sameVnode(elmToMove, newStartVnode)) {
          // 直接拿出来比较，把原先的置空，将元素向前插入
          patchVnode(elmToMove, newStartVnode);
          oldCh[idxInOld] = undefined;
          nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          // 没有key相同的节点，直接创建
          createElm(newStartVnode, parentElm, null, vm);
          newStartVnode = newCh[++newStartIdx];
        }
      }
    }
  }

  if (oldStartIdx > oldEndIdx) { // 老节点比对完了，新节点往中间插入
    refElm = (newCh[newEndIdx + 1]) ? newCh[newEndIdx + 1].elm : null;
    addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, vm);
  } else if (newStartIdx > newEndIdx) { // 新节点比对完了，删除老节点
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
  }
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
    let i, key
    const map = {}
    for (i = beginIdx; i <= endIdx; ++i) {
        key = children[i].key
        if (isDef(key)) map[key] = i
    }
    return map
}
```

### 整体测试

测试用例：

```html
<div id="app">
    <h1 class="title">{{msg}}</h1>
    <h2>count: {{count}}</h2>
    <input type="text" v-model.lazy="count">
    <button @click="changeCount">click me!</button>
</div>
```

```js
const vm = new Vue({
  el: '#app',
  data: {
    msg: 'hello world!',
    count: 0
  },
  methods: {
    changeCount () {
      console.log(this, 'oooo')
      this.count++;
    }
  }
});
```

<img src="https://orangesolo.cn/assets/image/965e4497cc6c651ee8dbaacafad595de.gif" alt="" class="md-img"  style="border: 1px solid #e3e3e3" loading="lazy" width="247" height="163" />

vnode：

<img src="https://orangesolo.cn/assets/image/c5eaa3dfad39c4291d2074cf559e7c87.png" alt="" class="md-img"  loading="lazy" width="628" height="534"/>

render函数：

<img src="https://orangesolo.cn/assets/image/a4a7d5d10c7f1f40e812904644e06bf2.png" alt="" class="md-img"  loading="lazy" width="628" height="55"/>

### 总结

代码参考 [数据状态更新时的差异 diff 及 patch 机制](https://juejin.cn/book/6844733705089449991/section/6844733705232056328)，并有部分修改

vdom diff 的目的是最大程度的利用已生成的节点，减少dom的操作次数，原理是逐层遍历和在指针在移动的过程中更新 dom

350255676

1603951084129

1604051080519
