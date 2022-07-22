模板编译就是将 template 编译成 render 函数，render 函数的返回就是常说的 virtual dom

### 编译时机

编译的时机是在初始化 mount 执行的，借上节代码：

```js
mount(vm, options) {
    let { el, template } = options;
    if (el) {
      template = document.querySelector(el).outerHTML; // 如果el存在，取其outerHTML
    }
    const { render } = compile(template); // 获取 render 函数，看这里 看这里
    vm._render = render;

    vm.$el = document.querySelector(el); // 初始化 $el
    vm.$el.innerHTML = ''

    const updateComponent = () => {
      const vnode = vm._render(); // 生成vnode
      vm._update(vm, vnode); // 视图渲染
    };

    vm._watcher = new Watcher(vm, updateComponent, true /* render watcher */);
  }
```

<code> compiler(template) </code> 返回了 render 函数，无论是组件初次渲染还是更新都是要重新执行 render() 返回最新 Vdom 的，然后才开始比较新旧 Vdom

### vue-template-compiler

那 render 函数长什么样呢？

vue2 把模板编译相关的代码都打包在 vue-template-compiler 包了，尝试用一下：

```js
const compiler = require('vue-template-compiler')
const template = `<div id="app">
    <h1 class="title">{{msg}}</h1>
    <input type="text" v-model.lazy="count">
    <button @click="changeCount">click me!</button>
  </div>`
const data = compiler.compile(template)
console.log(data);
```

输出：

```js
{
  ast: {
    type: 1,
    tag: 'div',
    attrsList: [{name: 'id', value: 'app'}],
    attrsMap: { id: 'app' },
    rawAttrsMap: {},
    parent: undefined,
    children: [ [Object], [Object], [Object], [Object], [Object] ],
    plain: false,
    attrs: [ [Object] ],
    static: false,
    staticRoot: false
  },
  render: `with(this){return _c('div',{attrs:{"id":"app"}},[_c('h1',{staticClass:"title"},[_v(_s(msg))]),_v(" "),_c('input',{directives:[{name:"model",rawName:"v-model.lazy",value:(count),expression:"count",modifiers:{"lazy":true}}],attrs:{"type":"text"},domProps:{"value":(count)},on:{"change":function($event){count=$event.target.value}}}),_v(" "),_c('button',{on:{"click":changeCount}},[_v("click me!")])])}`,
  staticRenderFns: [],
  errors: [],
  tips: []
}
```

返回的 render 是个用 with 包起来的字符串，那怎么执行字符串呢？我猜是 new Function()，就算不是。。。

<img src="https://orangesolo.cn/assets/image/7515de54f3ed5caa7029be957e9edb9b.png" alt="" class="md-img" loading="lazy" width="234" height="158"/>

render 格式化一下，长这样：

```js
with (this) {
  return _c('div',
    { attrs: { "id": "app" } },
    [
      _c('h1',
        { staticClass: "title" },
        [
          _v(_s(msg))]),
          _v(" "),
      _c('input',
        {
          directives: [
            {
              name: "model",
              rawName: "v-model.lazy",
              value: (count),
              expression: "count",
              modifiers: { "lazy": true }
            }
          ],
          attrs: { "type": "text" },
          domProps: { "value": (count) },
          on: { "change": function ($event) { count = $event.target.value } }
        }),
      _v(" "),
      _c('button',
        { on: { "click": changeCount } },
        [_v("click me!")]
      )
    ]
  )
}
```

可以看到 里面有  <code>_s(msg)</code> <code>changeCount</code> <code> (count)</code> 的字眼，那这样在用 new Function 包裹后这些变量怎么取值呢？

实际上还是 从 vm 里取的，因为 with 改变了变量的作用域，with(this) 最终在 Vue 构造函数里执行的，this 就是 Vue 实例

初始化时已经对 data，props，methods computed 。。 进行代理转发到this上了，this.changeCount 拿的就是 methods 的 changeCount。

还有 _c_v _s 等方法，也是从 Vue 实例上取，比如

```js
Vue.prototype._c = createVNode
Vue.prototype._v = createTextVNode
Vue.prototype._s = toString
```

createVNode，createTextVNode 是？

### VNode

VNode 是一个js对象，来描述节点属性，节点有多种类型，元素节点，文本节点，注释节点....   是对真实DOM的抽象，vue 自己定义 VNode 应该怎么描述节点，并通过自己的方式将 VNode 转化为真实DOM

假设定义下面这种方式来描述一个节点：

```js
export class VNode {
  constructor(tag, data, children, text, isStatic = false, elm) {
    this.tag = tag;
    /* 当前节点的一些数据信息，比如props、attrs等数据 */
    this.data = data;
    this.children = children;
    this.text = text;
    /* 当前虚拟节点对应的真实dom节点 */
    this.elm = elm;
    this.isStatic = isStatic
  }
}
```

列举创建 VNode的方式

```js
// Vue.prototype._c
export function createVNode(tag, data, children, isStatic, elm) {
  return new VNode(tag, data, children, '', isStatic, elm)
}

// Vue.prototype._v 
export function createTextVNode(val, isStatic) {
  return new VNode(undefined, undefined, undefined, String(val), isStatic);
}
```

render 函数里除了和操作节点有关的，还有一些工具函数如：

```js
// Vue.prototype._s
export function toString(val){
    return val == null
      ? ''
      : Array.isArray(val) || Object.prototype.toString.call(val) === '[object Object]'
        ? JSON.stringify(val, null, 2)
        : String(val)
}
```

完整的如：

```js
// src/core/instance/render-helpers/index.js
export function installRenderHelpers (target: any) {
  target._o = markOnce
  target._n = toNumber
  target._s = toString
  target._l = renderList
  target._t = renderSlot
  target._q = looseEqual
  target._i = looseIndexOf
  target._m = renderStatic
  target._f = resolveFilter
  target._k = checkKeyCodes
  target._b = bindObjectProps
  target._v = createTextVNode
  target._e = createEmptyVNode
  target._u = resolveScopedSlots
  target._g = bindObjectListeners
  target._d = bindDynamicKeys
  target._p = prependModifier
}
```

render函数执行后返回就是一个 大的VNode 实例，它的children里多个子 VNode，子里还有孙.... ，形似一个树。

有了以上基础就可以关注一下怎么生成 render 函数的

### render 函数生成

包含三个步骤：parse、optimize、generate

```js
export const compile = (template) => {
  const ast = parse(template);
  const astHaveStaicTag = optimize(ast);
  const code = generate(astHaveStaicTag);
  return {
    render: code.render
  };
};
```

1 parse：将template字符串解析为一个AST树

2 optimize：将AST进行静态标记，起到性能优化的效果

3 generate：将静态标记后的AST转化为render function字符串

#### parse

从字符串起始位置向后用正则逐步匹配标签，属性，文本内容等等，匹配的过程中将当前标签放入一个堆栈表示DOM层级；

简单模拟：

```js
const isFirstElement = /^\s*</;
const tagStart = /^<([a-z0-9]+)\s*([^>]*)\/?>/i;
const tagEnd = /^<\/([a-z0-9]+)>/i;
const text = /[^<>]+/;
const expr = /\{\{([\w\.]+)\}\}/g;
const forExpr = /(.*)\s+(?:in|of)\s+(.*)/;
const attrRE = /([^'"=\(\)]+)\s*(=\s*["']?([^"']+)["']?)?\/?/g;

const stack = [];
let root;
let currentParent;

export const parse = template => {
  let matches = [];
  let html = template.trim();
  if (isFirstElement.test(html)) { // 必须以元素开头
    while (html) {
      if (matches = html.match(tagStart)) {  // 标签头
        html = html.slice(matches[0].length);
        parseStartTag(matches);
      } else if (matches = html.match(tagEnd)) {  // 标签尾
        html = html.slice(matches[0].length);
        parseEndTag(matches);
      } else if (matches = html.match(text)) { // 文本
        html = html.slice(matches[0].length);
        parseText(matches);
      }
    }
  }
  return root;
};
```

标签头处理，主要是入栈和解析元素属性

```js
export const isUnaryTag = [
  'area', 'base', 'br', 'col', 'embed', 'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
];
const parseStartTag = (matches) => {
  const element = {
    type: 1,
    tag: matches[1],
    attrs: {},
    children: []
  };
  if (currentParent) { // 设置关系
    element.parent = currentParent;
    currentParent.children.push(element); 
  } else {
    root = element;
  }

  if (!isUnaryTag.includes(element.tag)) { // 自闭合标签不入栈
    currentParent = element;
    stack.push(element);  // 入栈
  }

  const attrStr = matches[2];
  if (attrStr) parseAttrs(element, attrStr.trim());
};
```

解析属性,  各种 v-，@ : xx 缩写，class 等

```js
const parseAttrs = (element, str) => {
  str.replace(attrRE, (match, $1, _, $3) => {
    match = match.trim().replace('/', '');
    if (match.includes('=')) {
      let [key, val] = [$1.trim(), $3.trim()];
      element.attrs[key] = val;
      if (key.startsWith('v-')) {
        key = key.slice(2).split(':'); //
        parseDirectives(element, key[0], key[1], val); // model.lazy, undefined,
      } else if (key.startsWith('@')) {
        parseDirectives(element, 'on', key.slice(1), val); // on, click.passive, change
      } else if (key.startsWith(':')) {
        parseDirectives(element, 'bind', key.slice(1), val); // bind, data.sync,
      } else if (elSpecialAttr.includes(key)) {
        if (key === 'class') {
          element.staticClass = val;
        } else {
          element[key] = val;
        }
      }
    } else {
      element.attrs[match] = true;
    }
  });
};
```

解析指令：

```js
// 需要直接绑定到element的属性
export const elSpecialAttr = ['key', 'class'];

const parseDirectivesUtils = {
  model (element, val, expr) {
    element.events.change = {
      value: `${expr}=$event.target.value`
    };
  },

  on (element, val, expr, modifiers) {
    const name = `${val}`;
    element.events[name] = {
      value: expr,
      modifiers
    };
  },

  bind (element, val, expr, modifiers) {
    if (elSpecialAttr.includes(val)) {
      element[val] = expr;
    }
    if (modifiers?.sync) {
      const name = `update:${val}`;
      element.events[name] = {
        value: `${expr}=$event`
      };
    }
  },

  if (element, _, expr) {
    element.if = expr;
    element.ifCondition = {
      exp: expr,
      block: element
    };
  },

  for (element, _, expr) {
    if (forExpr.exec(expr)) {
      element.forCondition = RegExp.$1;
      element.for = RegExp.$2;
      const [alias, iterator] = RegExp.$1.split(',');
      element.alias = alias.trim().replace('(', '');
      element.iterator = iterator?.trim().replace(')', '');
    }
  }

  // once。。。
};

export const noDireKeys = ['on', 'bind', 'class', 'style', 'for', 'if'];

const parseDirectives = (element, keyStr, argStr, expr) => {
  const [dire, ...dirModifiers] = keyStr.split('.');
  const [arg, ...argMofifiers] = argStr?.split('.') ?? [];
  const modifiers = [...dirModifiers, ...argMofifiers].reduce((res, item) => { 
    res[item] = true;
    return res;
  }, {});

  if (!element.directives) {
    element.directives = [];
  }
  if (!element.events) {
    element.events = {};
  }

  const direItem = {
    name: dire,
    value: expr,
    modifiers
  };

  if (Object.keys(parseDirectivesUtils).includes(dire)) {
    parseDirectivesUtils[dire](element, arg, expr, modifiers);
  }

  if (!noDireKeys.includes(dire)) {
    element.directives.push(direItem);
  }

  element.hasBindings = true; // 动态绑定
};
```

解析标签尾：

```js
const parseEndTag = (matches) => {
  const endTag = matches[1];
  for (let len = stack.length, i = len - 1; i >= 0; i--) {
    const element = stack[i];
    if (element.tag.toLowerCase() !== endTag.toLowerCase()) {
      stack.pop();  // 未正常闭合
    } else {
      currentParent = stack.pop().parent;
      return;
    }
  }
};
```

解析文本节点:

```js
const parseText = (matches) => {
  const textNode = {
    text: matches[0],
    type: 3,
    expression: ''
  };
  if (currentParent) {
    currentParent.children.push(textNode);
  }
  if (expr.test(matches[0])) {
    textNode.type = 2;
    textNode.expression = "'" + matches[0].replace(expr, (_, $1) => {
      return `'+_s(${$1})+'`;
    }) + "'";
  }
};
```

针对用例：

```js
<div id="app">
    <h1 class="title">{{msg}}</h1>
    <input type="text" v-model.lazy="count">
    <button @click="changeCount">click me!</button>
  </div>
```

解析后的结果为：

```js
{
attrs: {id: 'app'}
children: Array(7)
  0: {text: '\n    ', type: 3, expression: ''}
  1: {type: 1, tag: 'h1', attrs: {…}, children: Array(1), parent: {…}, …}
  2: {text: '\n    ', type: 3, expression: ''}
  3: {type: 1, tag: 'input', attrs: {…}, children: Array(0), parent: {…}, …}
  4: {text: '\n    ', type: 3, expression: ''}
  5: {type: 1, tag: 'button', attrs: {…}, children: Array(1), parent: {…}, …}
  6: {text: '\n  ', type: 3, expression: ''}
tag: "div"
type: 1
}
 ```

#### optimize

主要是根据type和v-if v-for等判断是否为静态节点，为其加上 isStatic 和 isStaticRoot 属性，这样在patch的过程中跳过有静态标记的 vnode的比对过程，也就不会更新视图

标记分为两步：

先遍历整体标记：

```js
const makeStatic = node => {
  node.static = isStatic(node);
  if (node.type === 1) {
    node.children.forEach(child => {
      makeStatic(child);
      if (!child.static) { // 如果某个child为false父元素则为false
        node.static = false;
      }
    });
  }
};
```

isStatic 通用判断：

```
const isStatic = (node) => {
  if (node.type === 2) { // 具有expression 的文本节点
    return false;
  }
  if (node.type === 3) { // 静态文本节点
    return true;
  }
  return !node.if // 没有 if for 或者绑定会导致节点变化的属性
        && !node.for
        && !node.hasBindings;
};
```

再进行 staticRoot 的标记：

```js
const makeRootStatic = node => {
  if (node.type === 1) {
    if (node.static && node.children.length && !( 
    // 静态的，有子节点，不能子节点只有一个而且第一个还是文本节点
      node.children.length === 1
            && node.children[0].type === 3
    )) {
      node.staticRoot = true; 
      return;
    } else {
      node.staticRoot = false;
    }
    node.children.forEach(child => {
      makeRootStatic(child);
    });
  }
};
```

optmize 的实现：

```js
const optimize = root => {
  if (!root) return;
  makeStatic(root);
  makeRootStatic(root);
  return root;
};
```

用例进行 static 标记：

```js
{
  attrs: { id: 'app' }
  children: Array(7)
    0: { text: '\n    ', type: 3, expression: '', static: true }
    1: {
      attrs: { class: 'title' }
      children: [{… }]
      parent: { type: 1, tag: 'div', attrs: {… }, children: Array(7), static: false, … 
     }
      static: false
      staticClass: "title"
      staticRoot: false
      tag: "h1"
      type: 1
    2: { text: '\n    ', type: 3, expression: '', static: true }
    3: { type: 1, tag: 'input', attrs: {… }, children: Array(0), parent: {… }, … }
    4: { text: '\n    ', type: 3, expression: '', static: true }
    5: { type: 1, tag: 'button', attrs: {… }, children: Array(1), parent: {… }, … }
    6: { text: '\n  ', type: 3, expression: '', static: true }
  static: false
  staticRoot: false
  tag: "div"
  type: 1
}
```

#### generate

生成 render function 的过程

```js
export class CodegenState {
  constructor () {
    this.staticRenderFns = [];
  }
}
export const generate = ast => {
  const state = new CodegenState();
  const code = ast ? genUtil.element(ast, state) : '_c("div")';
  return { // with 改变作用域
    render: new Function(`with(this){ return ${code}}`)
  };
};
```

genUtil 为生成过程中使用的工具

```js
const genUtil = {
  element(el, state) {
    if (el.staticRoot && !el.staticProcessed) { // 静态根节点
      return this.static(el, state);
    } else if (el.for && !el.forProcessed) { // for 在 if前
      return this.for(el, state);
    } else if (el.if && !el.ifProcessed) { // if
      return this.if(el, state);
    } else {
      const data = this._data(el, state);
      const children = this.children(el, state);
      return `_c('${el.tag}', ${data}, ${children},  ${el.static})`;
    }
  },

  static (el, state) {
    el.staticProcessed = true;
    state.staticRenderFns.push(`with(this){return ${this.element(el, state)}}`); 
    return `_m(${state.staticRenderFns.length - 1})`;   // renderStatic
  },

  for (el, state) {
    el.forProcessed = true;
    const { alias, iterator } = el;
    return `_l(${el.for}, function(${alias}, ${iterator}) {
            retrun ${this.element(el, state)};
        })`;
  },

  if (el, state) {
    el.ifProcessed = true;
    let code;
    const { exp, block } = el.ifCondition;
    if (exp) {
      code = `${exp} ? ${this.element(block, state)} : _e()`;
    } else {
      code = this.element(block, state);
    }
    return code;
  },

  children (el, state) {
    const { children } = el;
    if (children?.length) {
      return `[${children.map(c => this.vnode(c, state)).join(',')}]`;
    }
  },

  vnode (node, state) {
    if (node.type === 1) {
      return this.element(node, state);
    } else {
      return this.text(node);
    }
  },

  text (node) {
   const { type, text } = node;
   return `_v(${type === 2 ? node.expression : JSON.stringify(text)}, ${node.static})`; // JSON.stringify 防止意外
 },

  _data(el, state) {
    const { attrs, directives, events, key, staticClass } = el;
    let code = '';
    if (Object.keys(attrs).length) {
      let attrCode = ''; let domProps = '';
      Object.keys(attrs).forEach(name => {
        const val = attrs[name];
        if (name.startsWith(':')) {
          if (!elSpecialAttr.includes(name.slice(1))) {
            domProps += `${name.slice(1)}:${val}`;
          }
        } else if (name.includes('v-model')) {
          domProps += `value:(${val})`;
        } else if (!/v-|@/.test(name) && !elSpecialAttr.includes(name)) {
          attrCode += `${name}:"${val}",`;
        }
      });
      if (attrCode) {
        code += `attrs: {${attrCode}},`;
      }
      if (domProps) {
        code += `domProps: {${domProps}},`;
      }
    }

    if (directives?.length) {
      code += `directives:${JSON.stringify(directives)},`;
    }

    if (events) {
      let eventCode = '';
      Object.keys(events).forEach(name => {
        const event = events[name];
        const { value } = event;
        // 暂不判断 modifiers
        if (/^[a-z_$][\w]+$/i.test(value)) { // in methods
          eventCode += `${name}:${value},`;
        } else {
          eventCode += `${name}:function($event){${value}},`;
        }
      });
      code += eventCode ? `on:{${eventCode}},` : '';
    }

    if (key) {
      code += `key:${key}`;
    }

    if (staticClass) {
      code += `staticClass:"${staticClass}"`;
    }

    return `{${code}}`;
  }
  // component() {},

  // once() {}
};
```

用例生成的 render function:

```js
_c('div',
  { attrs: { id: "app", }, },
  [
    _v("\n    ", true),
    _c('h1',
      { staticClass: "title" },
      [
        _v("" + _s(msg) + "", false)
      ],
      false),
    _v("\n    ", true),
    _c('input',
      {
        attrs: { type: "text", },
        domProps: { value: (count) },
        directives: [{ "name": "model", "value": "count", "modifiers": { "lazy": true } }],
        on: { change: function ($event) { count = $event.target.value }, },
      },
      undefined,
      false),
    _v("\n    ", true),
    _c('button',
      { on: { click: changeCount, }, },
      [
        _v("click me!", true)
      ],
      false),
    _v("\n  ", true)
  ],
  false
)
```

### 总结

面向用例编程，只测试了这个用例能运行，其他的写了个大概，虽然有很多瑕疵，但大概轮廓就是如此了，先写到能跑通这个用例，其他可以慢慢增加。。

可以说写的是非常随便了哈哈哈哈

310545352

1603699380129

1603959200526
