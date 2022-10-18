## 背景

React-Hooks 是 React 团队在组件开发实践中，逐渐认知到的一个改进点，这背后其实涉及对**类组件**和**函数组件**两种组件形式的思考和侧重

### 类组件

基于 ES6 class 写法，继承 React.Component 得到的组件

```js
class Test extends React.Component {   
  constructor(props) {     
    super(props)     
    this.state = { count: 0 }     
    this.change = this.change.bind(this)   
  }   
  componentDidMount() {     
    console.log('mount');   
  }   
  change(){     
    this.setState({count: this.state.count+1})   
  }
  render() {
    return <div>{this.state.count}       
      <button onClick={this.change}>click</button>     
    </div>   
  } 
}
```

可以看到，类组件中内置了很多现成的东西，比如生命周期，我们按照提供的规则去写就能够得到一个可以使用的组件

但React.Component提供的东西太过繁杂，往往难以理解，并且书写的代码逻辑是分散在各个地方，不利于拆分和复用。并且组件常常在 componentDidMount 和 componentDidUpdate 中获取数据，但是，同一个 componentDidMount 中可能也包含很多其它的逻辑，如设置事件监听，而之后需在 componentWillUnmount 中清除。

相互关联且需要对照修改的代码被进行了拆分，而完全不相关的代码却在同一个方法中组合在一起。如此很容易产生 bug，并且导致逻辑不一致。

### 函数组件

就是以函数形态存在的组件，因为一开始并没有 hook，所以函数组件无法定义和维护state，被称为无状态组件

```js
function Test(props) {   
  const { value } = props   
  return <div className="wrapper">     
    <span>get some value: {value}</span>   
  </div> 
}
```

在 hook 出现之前，类组件要明显强于函数组件，函数组件最大的问题是无法维护内部状态

react hooks 的出现，可以让我们在不编写 class 的情况下使用 state 以及其他的 React 特性，补齐函数相对于类组件而言缺失的功能。

没有太多书写的限制，不强制按照生命周期划分逻辑，不需要理解 this，将复杂组件中相互关联的部分拆分成更小的函数达到复用的目的。

### 再看 vue

类组件和函数组件之间，是面向对象和函数式编程这两套不同的设计思想之间的差异，react 16.8 新增 hook 大力推进 函数组件的使用，vue3 新增 composition API 取代 options API 的写法，options API 实际上还是面向对象的思路，composition API 也叫 组合API

看一张大圣老师画的图

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1523275/1665762178157-14c684fe-28d7-4a11-8f6c-66e228c75ca7.png#clientId=ub73f3317-3ab2-4&crop=0&crop=0&crop=1&crop=1&from=paste&id=u772d47a4&margin=%5Bobject%20Object%5D&name=image.png&originHeight=871&originWidth=696&originalType=url&ratio=1&rotation=0&showTitle=false&size=99216&status=done&style=none&taskId=uc41fcb90-e8db-428b-a271-25cc3b1f771&title=)

**options API 对比 react 类组件：**

1、组件数据：vue data 类似于 this.state，数据必须在这里统一初始化

2、功能方法：vue 则限制在 methods里，react 将所有方法分散在 class 里

3、生命周期：vue 和 react 都是通过特定的方法名调用

**vue options API 与 react 类组件遇到的问题很相似：**

1、逻辑不好拆分达到复用，和组件强关联

2、不相关的代码组合在一起，相关的代码反而聚合在一起

3、需要注意 this指向

**为了解决部分问题，vue 和 react 都有一些解决方法：**

vue：引入 mixin extends 等但毫无疑问增加了使用和维护成本还带来了数据流向不清晰的问题

react：引入 providers，consumers，高阶组件，render props 等其他抽象层组成的组件最终形成了“嵌套地狱”，同时也存在数据流向的问题

但这说明了一个更深层次的问题：Vue 和 React 都需要为共享状态逻辑提供更好的原生途径。

**结果是：**

1、vue3 引入 Composition API 与 \<script setup>

2、react16.8 引入 hook

关于 Composition API：实质就是抛弃了 options 的写法，不再是一个对象，而是将一些逻辑组合在一起，其实就是函数组件

关于 \<script setup>：vue3 兼容 options API 的写法，并提供了 setup 属性，可以把组合在一起的逻辑写在这里，但如果把 setup 作为 script 标签的属性就可以完全抛弃 options API

从类组件和 options API 从一开始引入到出现种种问题，再到逐步引入了一些新的更为复杂的概念，再到官方推旧出新引入新的设计中可以看到，在组件设计上，尤其是业务组件逐渐复杂的情况下，函数式编程要完胜与面向对象的写法。

## hook 一览

hook 大致分为几种：

1、组件状态处理相关： useState、useReducer、useContext

2、处理副作用：useEffect、useLayoutEffect

3、性能优化相关：useMemo、useCallback

4、DOM 相关：useRef

5、redux 相关：useSelector、useDispatch、useStore

6、用户自定义 hook 或者是 某些库自带的 hook等

### useState

在函数组件保存数据的主要方法，等同于类组件的 this.state 与 this.setState

```js
function Test() {   
  const [count, setCount] = React.useState(0)
  const change = () => setCount(count + 1)   
  return <div>
    {count}
    <button onClick={change}>click</button>   
  </div> 
}
```

接受初始值，返回一个 state，以及更新 state 的函数。

```js
const [count, setCount] = React.useState(() => {   
  let data = 0   // 一些计算 
  data =  getData()   
  return data 
})
```

初始值可以是一个函数

需要注意的是 返回的是数组，可以思考下为什么是数组，而不是对象？

如果是对象的话就得考虑属性名的问题

```js
const { state, setState } = React.useState({}) 

const { state: count, setState: setCount } = React.useState(0)
```

如果使用了多次 setState，就要进行重命名，是非常麻烦的！

### useEffect

类组件中通常在生命周期中执行副作用，useEffect 的作用是补充函数组件无法正确执行副作用的问题

你之前可能已经在 React 组件中执行过数据获取、订阅或者手动修改过 DOM。我们统一把这些操作称为“副作用”，或者简称为“作用”。

比如获取数据的例子：

```js
function Test() {
  const [count, setCount] = React.useState(0)
  const [text, setText] = React.useState('')
  const change = () => setCount(count + 1)
  fetch("http://127.0.0.1:5504/react-test/index.html").then(async res => {
    let txt = await res.text()
    setText(txt)   
  })
  return <div>
    {count}
    <button onClick={change}>click</button>
    {text}
  </div> 
}
```

接口获取文件内容并setText ，并在页面渲染出来，看起来没什么问题，但是当点击按钮的时候请求了两次 html，因为每次数据由变化，都会重新执行 Test

此时我们需要 useEffect

```js
function Test() {
  const [count, setCount] = React.useState(0)
  const [text, setText] = React.useState('')
  const change = () => setCount(count + 1)
  React.useEffect(() => {
    fetch("http://127.0.0.1:5504/react-test/index.html").then(async res => {
      let txt = await res.text()
      setText(txt)})
    }, [])
    return <div>
      {count}
      <button onClick={change}>click</button>
      {text}
    </div> 
}
```

useEffect 接受两个参数：

- 参数1 被监听的参数发生变化时执行回调函数
- 参数2 被监听参数

当监听参数发生变化时就会执行回调，这里空数组只会在初次渲染时执行，等同于 componentDIdMount

useEffect 在使用时善用参数1函数的返回和参数2 的值可以代替大部分生命周期

- 1 componentDidMount 如上面实例，参数为空数组，表示不依赖任何数据，只在初次渲染后触发
- 2 同时代替 componentDIdMount 和 componentDidUpdate， 有多种场景

```js
// 没有指定依赖
React.useEffect(() => {
  console.log('任意state发生变化都会触发, 包括初始化, componentDIdMount + componentDidUpdate')
})

// 指定一个依赖
React.useEffect(() => {
  console.log("只有当n发生变化才会触发，包括初始化，componentDIdMount + componentDidUpdate")
}, [n])

// 指定多个依赖
React.useEffect(() => {
  console.log("只有当 n 或 x 发生变化才会触发，包括初始化，componentDIdMount + componentDidUpdate")
}, [n, x])

// 指定依赖，回调有返回新的函数
React.useEffect(() => {
  function change n() {}
  SomeAction.subscribe(change, n) // 重新订阅 n
  return () => {
     SomeAction.unSubscribe(change, n) // 取消订阅 n
  }
}, [n]) // 假设 n 和监听器或者定时器等有关联，n 变化后需要重新订阅，或者是重启定时器之类的情况
// 这种情况会在useEffect 执行之前先执行【参数1返回的函数】，也就是先取消订阅n，然后再执行函数组件里的第一个useEffect
```

- 3 代替 componentWillUnmount，可配合 react-router 测试

```js
React.useEffect(() => {
  console.log('空数组，仅第一次执行，componentDIdMount')
  const onResize = (e) => {}
  window.addEventListener('resize', onResize)
  return ()=>{
    window.removeEventListener('resize', onResize)
    console.log('会在组件卸载调用, componentWillUnmount');
  }
}, [])
```

初始渲染添加监听器，卸载时取消，达到将相关的代码放在一起

### useMemo

解决函数组件的性能问题，比如子组件重复执行问题，每次渲染都进行高开销的计算

```js
function Sub(props) {
  console.log("Sub render");
  // 子组件依赖的只有number，理想情况下只希望number变化时触发子组件重新渲染
  // 但实际是在输入框内的值发生变化，子组件也会重新渲染
  // 如果子组件的逻辑较复杂，就是无意义的大量计算，浪费资源
  let { number, onClick } = props
  return (
    <button onClick={onClick}>{number}</button>
  )
}

function Test() {
  let [value, setValue] = React.useState('')
  let [number, setNumber] = React.useState(0)
  const addClick = () => setNumber(number + 1)
  return <>
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
    <Sub number={number} onClick={addClick} />
  </>
}
```

class 解决此问题可以使用 shouldCompnentUpdate(nextProps, nextState) 生命周期，在组件更新之前，判断当前组件是否受某个state或者prop更改的影响

除了生命周期，我们没有办法通过组件更新前条件来决定组件是否更新

而在函数组件中，也不再区分mount和update两个状态，这意味着函数组件的**每一次调用都会执行内部的所有逻辑**，就带来了非常大的性能损耗。

useMemo和useCallback都是解决上述性能问题的

useMemo：memory，记住计算后的值，只有当依赖发生变化，才会重新计算

```js
function Test() {
  let [value, setValue] = React.useState('')
  let [number, setNumber] = React.useState(0)
  const addClick = () => setNumber(number + 1)
  
  const MemoSub = React.useMemo(
    () => <Sub data={number} onClick={addClick} />,
    [number] // 只有 number 变化才重新计算 MemoSub
  )
  return <>
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
    {MemoSub}
  </>
}
```

### useCallback

useCallback(fn, deps) 相当于 useMemo(() => fn, deps)，useMemo 返回一个值，可能是表示组件的对象，useCallback 返回一个函数

举一个反例

```js
const set = new Set(); // 确保不重复

function Test() {
  const [count, setCount] = React.useState(1);
  const [val, setVal] = React.useState('');

  const callback = () => count
  set.add(callback);

  // 点击按钮 和 输入框修改内容都会触发 set.size 的修改，说明每次 callback 是不同的
  const changeCount = () => setCount(count + 1)
  const changeValue = event => setVal(event.target.value)
  return <div>
    <h4>{count}</h4>
    <h4>{set.size}</h4>
    <div>
      <button onClick={changeCount}>+</button>
      <input value={val} onChange={changeValue} />
    </div>
  </div>;
}
```

使用 useCallback 进行修改，将 count作为依赖

```js
const callback = React.useCallback(() => count, [count]);
// 此时只有点击按钮修改了count才会导致 set.size 的修改
```

更为实际的应用场景比如 子组件依赖父组件传递的函数，改函数变化时子组件需要做对应的处理

```js
function Child({ callback }) {
  console.log('child');
  const [count, setCount] = React.useState(() => callback());
  React.useEffect(() => {
    console.log('child effect');
    setCount(callback());
  }, [callback]);
  return <div>
    child count: {count}
  </div>
}

function Test() {
  const [count, setCount] = React.useState(1);
  const [val, setVal] = React.useState('');

  const callback = React.useCallback(() => count * 2, [count]); // 使用了 callback 不会重新声明函数

  set.add(callback);
  const MemoChild = React.useMemo(
    () => <Child callback={callback} />,
    []
  )
 
  const changeCount = () => setCount(count + 1)
  const changeValue = event => setVal(event.target.value)
  return <div>
    <h4>count: {count}</h4>
    <h4>set.size: {set.size}</h4>
    <div>
      <button onClick={changeCount}>+</button>
      <input value={val} onChange={changeValue} />
    </div>
    <hr />
    {MemoChild}
  </div>
}
```

当然你可能会想传入子组件的函数什么时候会变呢? 比如有切换使用算法的场景，某些时候子组件用的是算法a，某些时候用算法b，通过点击切换按钮传递给子组件的算法就会变化

所有依赖本地状态或props来创建函数，需要使用到缓存函数的地方，都是useCallback的应用场景

### useRef

useRef 和 createRef 类似，也可以用来保存DOM节点引用

```js
function Test() {
  /* 保存 DOM */
  const inputEl = React.useRef()
  const onClick = () => {
    console.log(inputEl); // 对象类型，只有一个 current 属性指向指定DOM
    inputEl.current.value = 'hahahhahahhahh'
  }

  return <div>
    <input ref={inputEl} />
    <button onClick={onClick}>click me！！！</button>
    <br />
  </div>
}
```

但是useRef还是有一点不同，就是可以用来保存任何值，比如

```js
function Test() {
  const textRef = React.useRef()
  const [text, setText] = React.useState()
  React.useEffect(() => {
    // 每次修改输入框更新 textRef
    textRef.current = text
    console.log(textRef);
  }, [text])
  
  return <div>
       <input value={text} onChange={ (e) => setText(e.target.value)}/>
  </div>
}
```

useRef 和 自建的{current: xx} 的区别：useRef 每次重新渲染时返回的是同一个对象，而 {current: xx} 的对象每次都会伴随组件的更新而变化

### useContext

优化了函数组件使用 context 的能力，并进行了写法上的统一。

context 类似于 vue provide 的概念，针对于只属于某个组件树的“全局”变量，可跨组件级传递实现共享

useContext(MyContext) 的写法相当于 class 组件中的 static contextType = MyContext 或者 \<MyContext.Consumer> 的写法

类组件：

```js
const ThemeContext = React.createContext('light') 
class App extends React.Component {
  render() {
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar theme="dark" />
      </ThemeContext.Provider>
    )
  }
}

function Toolbar(props) {
  return (
    // 中间的组件再也不必指明往下传递 theme 了。
    <div>
      <Button />
    </div>
  )
}
class Button extends React.Component {
  // 指定 contextType 读取当前的 themecontext。
  // React 会往上找到最近的 theme Provider，然后使用它的值。
  // 在这个例子中，当前的 theme 值为 “dark”。
  static contextType = ThemeContext
  render() {
    return <button>{this.context}</button>
  }
}
```

函数组件：

```js
function Button() {
  const theme = React.useContext(ThemeContext)
  return <button>{ theme }</button>
}

// 或使用consumer
function Button() {
  return <ThemeContext.Consumer>
    {
      theme => <button>{theme}</button>
    }
    </ThemeContext.Consumer>
}
```

### useReducer

reducer 类似于状态机，有不同的状态，并且有修改状态的方法，useReducer 可以增强函数组件中 reducer 的使用：

```js
function Test() {
  const [count, dispatch] = React.useReducer((state, action) => {
    switch (action) {
      case 'add':
        return state + 1
      case 'sub':
        return state - 1
      default:
        return state
    }
  }, 0)
  return (
    <div>
      count: {count}
      <button onClick={() => dispatch('add')}>add</button>
      <button onClick={() => dispatch('sub')}>sub</button>
    </div>
  )
}

```

### 模拟 redux

前面提到 useContext 可以将状态全局化，进行统一管理、useReducer 传入方法和全局状态可以对全局状态进行修改，达到控制业务逻辑的目的，两者结合，可以实现在函数组件模拟 redux 的能力

```js
const ColorContext = React.createContext() // 全局状态
const UPDATE_COLOR = 'update_color'

const reducer = (state, action) => {
  switch (action.type) {
    case UPDATE_COLOR:
      return { ...state, color: action.color }
    default:
      return state
  }
}

function Color(props) {
  const [state, dispatch] = React.useReducer(reducer, { color: 'blue' }) // 传入初始值
  return <ColorContext.Provider value={{state, dispatch}}>  状态传递，类似于 Provider store={store}
    {props.children}
  </ColorContext.Provider>
}

/* 入口 */
function Test() {
  return <Color>
    <Text />
    <Buttons />
  </Color>
}

/* 子组件1 */
function Text() {
  // 使用全局数据
  const { state: { color } } = React.useContext(ColorContext)
  return \<div style={{ color: color }}>text text text</div>
}

/* 子组件2 */
function Buttons() {
  // 使用全局数据
  const { dispatch } = React.useContext(ColorContext)
  return <div>
    <button onClick={() => { dispatch({ type: UPDATE_COLOR, color: 'green' }) }}> green </button>
    <button onClick={() => { dispatch({ type: UPDATE_COLOR, color: 'red' }) }}> red </button>
  </div>
}
```

虽然hook可以模拟 redux，但不推荐使用这么做，因为每次context的某一个值变化，都会造成即使没使用这个值的组件重新渲染，所以简直只在小型应用使用，中大型最好还是使用比较健全的 redux

### 代替 connect

随着react hooks越来越火，react-redux也紧随其后发布了7.1，增加了 useSelector、 useDispatch 、useStore 以支持函数式组件更扁平式的写法

useSelector：从 redux 提取 state

```js
const { showDirekey, keys } = useSelector((state) => state.virtualKeyboard)
```

useDispatch：返回对 redux diaptch 的引用

```js
const dispatch = useDispatch() dispatch({ type: 'changeKey', data: { keys: 'S'}})
```

useStore： 获取 store 实例

```js
function TestUseStore() {
  const store = useStore()
  const { count } = store.getState().count
  console.log('usestore', count);
  return <div> // 因为如果store state改变，这个不会自动更新，建议永远使用 useSelector 钩子
    useStore count: {count}
  </div>
}
```

该钩子使用场景：替换 store 的 reducers、单元测试，大多数情况最好使用 useSelector

### hook 书写限制

1、不能在循环、条件或者嵌套函数中使用 hook，具体原因见下面原理

2、不能在类组件使用 hook

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1523275/1665762178128-78732a7f-054c-4764-86d2-bf63a1f8b476.png#clientId=ub73f3317-3ab2-4&crop=0&crop=0&crop=1&crop=1&from=paste&id=u1a0b7fe5&margin=%5Bobject%20Object%5D&name=image.png&originHeight=88&originWidth=670&originalType=url&ratio=1&rotation=0&showTitle=false&size=32257&status=done&style=none&taskId=u7365eff7-7d26-4388-a965-8c505b54287&title=)<br />编辑切换为居中<br />

3、回调函数不可以使用异步!!!!!!

useEffect 使用异步的后果

### hook 的问题

hooks 中没有getSnapshotBeforeUpdate，getDerivedStateFromError 和 componentDidCatch 生命周期的等价写法

getSnapshotBeforeUpdate: 在最近一次渲染输出（提交到 DOM 节点）之前调用, 它使得组件能在发生更改之前从 DOM 中捕获一些信息（例如，滚动位置）。

getDerivedStateFromError: 此生命周期会在后代组件抛出错误后被调用。 它将抛出的错误作为参数，并返回一个值以更新 state

发生错误时：getDerivedStateFromError ， componentDidCatch

## hook 原理

我们可以从几个问题来出发：

1 为什么每次渲染都能拿到最新的状态，状态是怎么保存的？

2 为什么不能在条件、嵌套函数里使用 hook？

3 为什么多次 setState 只有一次生效 ？

源码过于复杂，我们先看一个简化版的useState 和 useEffect

### 模拟 useState

```js
let data
function useState(init) {
  data = data || init
  const setState = (newData) => {
    data = newData
    render()
  }
  return [data, setState]
}

// 使用
function Test() {
  let [number, setNumber] = useState(0)
  const onClick = () => {
    setNumber(number + 1)
  }
  return <div>
    number: {number}
    <br />
    <button onClick={onClick} >点击</button>
  </div>
}
function render() {
  ReactDOM.render(
    <Test></Test>,
    document.querySelector('#root')
  )
}
```

这种只能保存一个数据，如果是多个数据如何保存呢，这里使用数组来模拟

```js
const state = []
let index = 0
// 按index顺序存储
function useState(init) {
  let curIndex = index
  state[curIndex] = state[curIndex] || init
  function setState(newDate) {
    state[curIndex] = newDate
    update()
  }
  index++
  return [state[curIndex], setState]
}

// 使用
function Test() {
  let [number, setNumber] = useState(0)
  let [name, setName] = useState('q')
  
  console.log(number, name);

  const onClick = () => setNumber(number + 1)
  const onClickName = () => setName(name + 'w')

  return (
    <div>
      {number} <button onClick={onClick}>number</button>
      {name} <button onClick={onClickName}>name</button>
    </div>
  )
}


function update() {
  render()
}

function render() {
  ReactDOM.render(
    <Test></Test>,
    document.querySelector('#root')
  )
  index = 0
}
render()
```

### 模拟 useEffect

```js
let index = 0
let alldeps = []
let unMountCbs = []
function useEffect(cb, arr) {
  if (!alldeps[index]) { // 1、空，每次都执行
    let unMountCb = cb() // 保存组件销毁回调
    unMountCb && !unMountCbs.includes(unMountCb) && unMountCbs.push(unMountCb)
    alldeps[index] = arr
    index++
    return
  }
  let originArr = alldeps[index]
  let hasChange =  arr.some((item, i) => originArr[i] !== item) // 看是否有变化
  if (hasChange) {
    cb()
    alldeps[index] = arr
  }
  index++
}
```

到此我们可以得到结论：

state 和 effect 的依赖是顺序存储的，所以不能在条件中使用hook，完全是因为hook的实现导致的

当然源码中不是数组，我们来具体看一下

### 再看源码

packages/react/src/ReactHooks.js

```js
export function useState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  // debugger
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current;
  return ((dispatcher: any): Dispatcher);
}
```

packages/react/src/ReactCurrentDispatcher.js 返回当前使用的 dispatcher

```js
// 当前使用的 dispatcher
const ReactCurrentDispatcher = {
  /**
   * @internal
   * @type {ReactComponent}
   */
  current: (null: null | Dispatcher),
};
```

这里 null， 说明他在执行的过程中被赋值为某个对象，而这个对象上有一个 useState，我们可以在 packages/react-reconciler/src/ReactFiberHooks.js 找到

```js
// 当前 fiber
let currentlyRenderingFiber: Fiber = (null: any); 
// hooks是作为一个链表被存储在fiber的memoizedState字段
// 当前hook列表是属于当前fiber的
let currentHook: Hook | null = null;
// workInProgressHook 是一个新的列表，会被添加到currentlyRenderingFiber
let workInProgressHook: Hook | null = null;
export function renderWithHooks<Props, SecondArg>(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: (p: Props, arg: SecondArg) => any,
  props: Props,
  secondArg: SecondArg,
  nextRenderLanes: Lanes,
): any {
  /* 在每个函数组件调用之前， 其中当前fiber及其hooks队列中的【第一个hook节点将被存储在全局变量中】。这样，
  只要我们调用一个hook函数（useXXX()），就会知道要在哪个上下文中运行。 */
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;

  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  workInProgress.lanes = NoLanes;

  // 设置 current dispatch
  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount // mount 阶段
      : HooksDispatcherOnUpdate; // update 阶段

  let children = Component(props, secondArg);
  // 检查渲染阶段
  if (didScheduleRenderPhaseUpdateDuringThisPass) {
    let numberOfReRenders: number = 0;
    do {
      ...
      ReactCurrentDispatcher.current = __DEV__
        ? HooksDispatcherOnRerenderInDEV
        : HooksDispatcherOnRerender; // rerender 阶段

      children = Component(props, secondArg);
    } while (didScheduleRenderPhaseUpdateDuringThisPass);
  }
  ...
  return children;
}
```

可以看看 ReactDOM 调用 render 方法后整个执行栈

<img src="https://orangesolo.cn/assets/image/c620938fd48de8d82007400a760af221.png" alt="" class="md-img"/>


回来再看 renderWithHook，它区分了不同阶段的dispatcher

<img src="https://orangesolo.cn/assets/image/efd2514e3a9ffc1baa269710c0448a9b.png" alt="" class="md-img"/>

每个阶段使用 不同的 hook:

<img src="https://orangesolo.cn/assets/image/ef684797966d7cee479d12c8ea803074.png" alt="" class="md-img"/>

对于 useState，mount 阶段 使用 mountState，update 阶段使用updateState，rerender阶段使用 rerenderState，所以我们使用的 useState 并不是一成不变的，而是会赋予不同的方法

我们细看一下 mountState：

```js
function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  // 获取当前的Hook节点，同时添加到Hook链表中
  const hook = mountWorkInProgressHook();
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  hook.memoizedState = hook.baseState = initialState;
  // 声明一个链表来存放更新
  const queue: UpdateQueue<S, BasicStateAction<S>> = {
    pending: null,
    interleaved: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: (initialState: any),
  };
  hook.queue = queue;
  // 返回一个dispatch方法用来修改状态，并将此次更新添加update链表中
  const dispatch: Dispatch<
    BasicStateAction<S>,
  > = (queue.dispatch = (dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    queue,
    ): any));
   // 返回当前状态和修改状态的方法 
  return [hook.memoizedState, dispatch];
}

function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  if (workInProgressHook === null) { // hook 链表初始化
    // 当前workInProgressHook链表为空的话，
    // 将当前Hook作为第一个Hook
    // fiber节点的 memoizedState 属性指向第一个hook
    // workInProgressHook 表示当前活动中的 hook
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // 否则将当前Hook添加到Hook链表的末尾
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
```

可以看到，React 对Hooks的定义是链表，上一个Hooks的next指向下一个Hook

mount 阶段的 hook 都会调用 mountWorkInProgressHook() 形成当前 fiber 的 hook 链表

<!-- 图示 链表结构 -->

hook 类型定义：

```js
export type Hook = {|
  memoizedState: any,
  baseState: any,
  baseQueue: Update<any, any> | null,
  queue: any, // 如果是 state hook，触发setState时保存更新，链表结构，
  // 链表节点是 Update 类型，如下 dispatchSetState 表示
  next: Hook | null, // 指向下一个Hook
|};
```

修改状态的方法调用了dispatchsetState，进入update阶段：

```js
function dispatchSetState<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A, // 调用 state 传入的值，
  // 如果是 setState(state + 1), state初始为0时，这里action保存的是1
) {
  const lane = requestUpdateLane(fiber);
  const update: Update<S, A> = {
    lane,
    action,
    hasEagerState: false,
    eagerState: null,
    next: (null: any),
  };
  if (isRenderPhaseUpdate(fiber)) {
    enqueueRenderPhaseUpdate(queue, update);
  } else {
    enqueueUpdate(fiber, queue, update, lane);
  }
  ...
}
```

这里调用 enqueueUpdate 进行将本次更新对象加入 queue，还是一个链表

```js
function enqueueUpdate<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  update: Update<S, A>,
  lane: Lane,
) {
  const pending = queue.pending;
  if (pending === null) { // 初始化更新链表
    update.next = update; // 循环链表结构
  } else {
    // 否则向前插入
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;
}
```

如有以下代码：

```js
setCount(2)
setCount(3)
setCount(4)
```

那个 queue 链表就是：

<!-- 图 -->

更新了数据后触发函数组件重新执行，此时 dispatcher 为 updateDispatcher，useState 使用 updateState：

```js
function updateState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  return updateReducer(basicStateReducer, (initialState: any));
}
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  // 说明调用 setState 可以传入一个函数 
  return typeof action === 'function' ? action(state) : action;
}
```

updataReducer 里就是遍历该hook 的 queue.pending，然后返回更新后的state 和 mount阶段存储的dispatch函数

```js
function updateReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: I => S,
): [S, Dispatch<A>] {
  ...
  // 拿到链表头；去除额外逻辑，暂时理解其为 queue.pending
  let update = first; 
  do {  
    ...
    const action = update.action;
    newState = reducer(newState, action); // 执行
    update = update.next;
  } while (update !== null && update !== first); // 遍历循环链表
  ...
  if (!is(newState, hook.memoizedState)) { // 引用不同时 标记一个更新任务
    markWorkInProgressReceivedUpdate();
  }
  ...
  const dispatch: Dispatch<A> = (queue.dispatch: any);
  // 返回最新的状态和修改状态的方法
  return [hook.memoizedState, dispatch];
}
```

因此，mount 阶段初始化了 fiber 的 hook 链表，当触发后 setState 时生成一个更新链表，然后在 update 阶段把更新链表拿出来执行一遍。

<!-- 图 -->

现在我们回答 **多次 setState 只有一次生效？**的问题

```js
function Test() {   
  const [count, setCount] = useState(0)   
  const change = () => {     
    setCount(count + 1)     
    setCount(count + 1)     
    setCount(count + 1)  
  }
  return <div>{count} <button onClick={change}>click</button>   </div> 
}
```

结果是最终只加一，开始是0，第一次调用 setCount，执行 newState = reducer(newState, action)，newState 初始为0，action是1，不是 function 类型，newState 置为1，第二次调用 setCount，action 依旧是1，第三次还是1，所以最终 count 为1，因此只是执行了三次把count变为1的逻辑

如果代码修改为

```js
setCount((count) => {
  return count+1
})     
setCount((count) => {
  return count+1
})     
setCount((count) => {
  return count+1
})     
```

因为action是一个function，所以每次会把更改后的newState传入，函数返回为 newState的新值！

## 自定义 hook

### 1 获取上一轮的 props 或 state

类组件可以通过 getSnapshotBeforeUpdate(prevProps, prevState) 和 componentDidUpdate(prevProps, prevState) 拿到上次的 props state

函数组件可以使用 useRef 和 useEffect 模拟：

```js
function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => { // 发生变化时修改
    ref.current = value;
  }, [value]);
  return ref.current;
```

关于 useRef，官网有特别提到：

请记住，当 ref 对象内容发生变化时，useRef并不会通知你。变更.current属性不会引发组件重新渲染。

所以在 effect 里更新了 current, 组件并没有重新渲染，达到获取上一个值的效果<br />可以抽取这个逻辑为一个自定义hook：

### 2 获取鼠标位置

原理同 获取鼠标大小

```js
function useMouse() {
  const [position, setPosition] = React.useState({
    x: 0,
    y: 0
  })

  const update = function (e) {
    setPosition({
      x: e.pageX,
      y: e.pageY
    })
  }

  React.useEffect(() => {
    document.addEventListener('mousemove', update)
    return () => {
      document.removeEventListener('mousemove', update)
    }
  }, [])
  return position
}

// 使用： 
const {x, y} = useMouse()
```

### 3 封装 localStorage

自定义 hook 让localStorage的使用更简洁一点：

```js
function useStorage(name, initval) {
  const [value, setValue] = React.useState(localStorage.getItem(name) || initval)
  React.useEffect(() => {
    localStorage.setItem(name, value) // setValue 后自动更新 storage
  }, [value])
  return [value, setValue]
}
```

使用：

```js
function Test() {
  let [value, setValue] = useStorage('test', 12) // 初始化 test: 12
  return <div>
    {value}
    <button onClick={() => {setValue(555)}}>click</button> // 点击后 修改为 555
  </div>
}
```

基于上面的例子，可以设想一下还有哪些场景可以自定义hook呢？

## react hook 与 vue3 use

前面说过 react hook 和 vue3 composition API 解决的问题是一样的，实际上 vue3 + use 的写法和自定义use的写法和 react hook 简直是一模一样的，用 vue3实现 useWinSize 和 useMouse

useWinSize：

```js
export default function useWinSize() {
  let [width, height] = [ref(window.innerWidth), ref(window.innerHeight)]

  function update() {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', update)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return { width, height }
}```

useMouse:

```js
export default function useMouse() {
  let [x, y] = [ref(0), ref(0)]
  function update(e) {
    x.value = e.pageX
    y.value = e.pageY
  }
  onMounted(() => {
    document.addEventListener('mousemove', update)
  })
  onUnmounted(() => {
    document.removeEventListener('mousemove', update)
  })
  return { x, y }
}
```

使用：（一时间分不清是在写vue还是react）

```js
let {x,y}=useMouse() 
let {width,height}= useWinSize()
```

对比：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/1523275/1665762179995-251b2ba0-1f59-4399-995f-2cf0e4fafa8b.png#clientId=ub73f3317-3ab2-4&crop=0&crop=0&crop=1&crop=1&from=paste&id=u73acbcc6&margin=%5Bobject%20Object%5D&name=image.png&originHeight=547&originWidth=1440&originalType=url&ratio=1&rotation=0&showTitle=false&size=239889&status=done&style=none&taskId=u1a0208dc-7ca3-44fa-9e8d-7c19d9d2985&title=)<br />编辑切换为居中<br />添加图片注释，不超过 140 字（可选）<br />

这两个框架越来越像了!

## 总结

从 react 和 vue 两个框架升级的结果看，函数式编程让组件开发更趋于扁平化，更利于理解，使用函数式编程则可以跳过生命周期 与 对 this 等概念的理解，对于可复用的逻辑更好的拆分，对于类组件函数组件往往有更小的粒度划分，当然hook目前还不能完全取代class，但还是应该以开放的眼光去看待。每一个框架或程序设计都会过时，但所沉淀下来的思想才是我们更应该关注的。

我们做的众多的升级和优化也无非是想要更好的渲染性能（如虚拟DOM）、更专注逻辑（如响应式）、更易理解，更好的可读性，更易抽取复用提升效率（如函数组件）。

## 附录

[更多关于对 hooks 的疑问](https://zh-hans.reactjs.org/docs/hooks-faq.html)

[react 源码调试搭建环境](https://zhuanlan.zhihu.com/p/336933386)

[React Hooks源码解析](https://juejin.cn/post/6844904080758800392)

930215695

1636460102450

1646461102036
