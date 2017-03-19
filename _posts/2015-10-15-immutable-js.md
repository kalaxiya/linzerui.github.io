---
layout: post
title:  "immutable.js使用小结"
date:   2015-10-15 20:48:28
categories: posts
tags: immutable
---
最近在项目中使用了 `immutable.js` 作为数据层的方案。它总是作为 `react` 的性能优化方案被人提起。事实上，它是独立的一个库，并不依赖于 `react` 或者其他第三方库。<!-- more -->它的作者是 `FB` 的 [Lee Byron][lee's twitter]，他也是 [GraphQL][graphql] 项目的主要贡献者之一。

最后做完一个项目之后，我最大的一个体会是，抛开 `immutable data` 在 `react` 性能优化中的优势不说，仅仅是它提供的一系列强大的数据操作 API，就让我献出膝盖了……嗯，所以下面也会总结几个我最常用到的 API，毕竟它的[文档][doc]写得非常的晦涩，以此纪念几个月前我啃那文档时的痛苦时光……

---

## 为 javascript 带来不可变数据

`immutable data` 即 **不可变数据** ，它是函数式编程里不可或缺的重要角色。虽然我们可以在 `javascript` 中模拟一些函数式用法，但说到底，`javascript` 并不是函数式语言。不可变数据如此重要，以致有人已经在讨论将其加入标准的可能性。那不可变数据到底是什么？

我们先看看 `javascript` 中的对象：

{% highlight javascript %}
var a = { name: 1 }
var b = a
b.name = 2
// 2
console.log(a.name)
{% endhighlight %}

是的，`javascript` 中的对象是引用类型的。这有它的好处，比如节省内存（虽然内存越来越不值钱了😢）。但在实际开发中，我们往往发现，可变的数据带来的坏处远远大于好处。由于是引用类型的，修改数据的时候都变得小心翼翼，不知道会引起什么连锁反应。

而不可变数据，一旦创建，它便不可改变。可以这样理解它：对不可变数据 A 作一个更改，你将得到一个新的更改过的数据 B，同时，B 和 A 共享着没有发生改变的那部分数据。看代码：

{% highlight javascript %}
import Immutable from 'immutable'

var a = Immutable.fromJS({
    name: 1
})
var b = a.set('name', 2)

// { name: 1 }
console.log(a.toJS())
// { name: 2 }
console.log(b.toJS())
{% endhighlight %}

`a` 一旦创建之后，对它的任何修改都返回一个新的 `immutable data`，而不会影响到 `a` 本身。

当然了，这个例子，用原生的 `javascript` 也可以实现：

{% highlight javascript %}
var a = {
    name: 1
}

var b = {
    ...a,
    name: 2
}

// { name: 1 }
console.log(a)
// { name: 2 }
console.log(b)
{% endhighlight %}

好像看起来，还更简单……其实不然。这里用了 es6 的语法 `...a`，其实相当于 `var b = Object.assign({}, a, { name: 2 })`，本质只是浅度复制。这意味着，如果你的数据是嵌套很深的结构，你复制的仅仅是引用。解决的办法是，对数据进行深历遍历复制。但这样做显然有两个缺点：1、很慢；2、很麻烦。

`immutable.js` 实现的数据不可变，表面上看起来，好像也给人一种很慢的感觉。我们看看引用自官方文档的一段话：

> These data structures are highly efficient on modern JavaScript VMs by using structural sharing via hash maps tries and vector tries as popularized by Clojure and Scala, minimizing the need to copy or cache data.

它使用了 `Clojure` 和 `Scale` （这两者都是函数式语言）中常见的 `hash map tries` 以及 `vector tries` 来保证它的效率，避免了不必要的数据复制或数据缓存。其内部的数据结构实现原理，想深入了解的话，可以参考这个[Persistent data structure][wiki]。

---

## 与 react 的结合

`react` 的出现，让人们重新关注起了函数式编程。我们可以这样来看待 `react` 组件：**组件是一个纯函数(pure function)，它接收一些数据作为参数(props)，返回一段 `HTML`(返回的其实是代表着一段 `HTML` 的 `virtual DOM` )** 。

我们注意到了 **纯函数** 这样的一个概念。你可以这样简单理解它：**对于纯函数来说，只要输入（调用函数的参数）不变，即输出（函数的调用结果）何持不变**。看两个例子：

{% highlight javascript %}
// pure
function pure(a, b) {
    return a + b
}

// side effect
function notPure(a, b) {
    return a + b + Math.random()
}
{% endhighlight %}

很显然的，第一个函数是个纯函数。第二个则不然，因为它有副作用(side effect)，每次调用的结果都不同。

前面提到，可以将 `react` 组件看成一个纯函数。我们将这个概念抽象成这样：

{% highlight javascript %}
HTML = fComponent(props)
{% endhighlight %}

我们知道，调用组件的 `setState`，总是会触发 `re-render`，哪怕你的 `state` 实际上并没有改变。

{% highlight javascript %}
class Demo extends React.Component {
    constructor() {
        super()
        this.state = {
            name: 'test'
        }
    }

    onChange = () => {
        // 这会触发组件的 `re-render`
        this.setState({
            name: 'test'
        })
    }

    render() {
       ...
    }
}
{% endhighlight %}

我们当然期望可以避免这些不必要的 `re-render`。所幸 `react` 提供的一个组件生命周期方法 `shouldComponentUpdate` 可以让我们控制组件的 `re-render` 逻辑，可以在其中对组件前、后两次接收到的数据进行比较，如果数据一致，则跳过组件的重渲染阶段。

然而事件真的这么简单吗？考虑下面的代码：

{% highlight javascript %}
var stateA = {
    name: 'immutable',
    obj: {
        a: 1
    }
}

var stateB = {
    name: 'immutable',
    obj: {
        a: 1
    }
}
{% endhighlight %}

上面这两个数据内容一致，对它们的每个属性进行比较，以期跳过 `re-render`，但结果是 `stateA.obj !== stateB.obj` 。当然，这种结果并不出乎我们的意料，毕竟这是 `javascript` 对象正常的行为。看起来，似乎需要进行深度遍历比较(deep compare)……

跟前面提到的一样，无论是深度拷贝数据，或是深度对比数据，执行起来的效率都会很慢。这个时候，主角 `immutable.js` 登场了。它是一个独立的库，但你会发现它跟 `react` 简直是绝配。

{% highlight javascript %}
import { fromJS, is } from 'immutable'

const stateA = fromJS({
    name: 'immutable',
    obj: {
        a: 1，
        b: {
            c: 0
        }
    }
})

const stateB = fromJS({
    name: 'immutable',
    obj: {
        a: 1,
        b: {
            c: 0
        }
    }
})

// 两个独立的不可变数据
assert(stateA !== stateB)
// 但内容一致，Immutable.is
assert(is(stateA, stateB) === true)

// 共享没发生变化的数据
const stateC = stateA.set('name', 'changed name')

assert(is(stateA, stateC) === false)
// 直接对比引用！
assert(stateA.get('obj') === stateC.get('obj'))
{% endhighlight %}

注意最后一行，`assert(stateA.get('obj') === stateC.get('obj'))`。虽然 `obj` 对象里面还嵌套着另一个对象属性，但我们在这里可以直接使用 `===` 进行比较。No more deep compare !

**直接使用 `===` 进行比较的好处是显而易见的，不需要深度遍历比较，大大降低了 `shouldComponentUpdate` 的优化成本** 。这就是为什么推荐在 `react` 中使用 `immutable data` 的原因。

然而，`immutable data` 这么好用但不代表你一定需要它。假设你的应用复杂度不高，组件层级也不深，数据也没有那么庞大，那往往并不需要特意去作 `shouldComponentUpdate` 的优化，`react` 本身已经足够快了。还是那句话，**在没有出现明显的性能问题之前，可以不作优化**。这让我想起前段时间看到的一句话，大意是这样的：

> 如果一个操作完成的时间少于 `1ms`，当你终于努力将它的效率提升 `10` 倍之后，它依然只是少于 `1ms`。

这当然不是教我们不需要优化我们的代码。我个人的理解是，**在实际开发中，要考虑优化成本与优化效益之间的关系**。

`react` 通常很快。“通常”的意思是，不需要特意去优化，它的 `virtual dom` 算法就可以给你不错的性能。但就我个人体会而言，其实“快”并不是 `react` 最大的亮点。它将函数式理念带到了前端开发之中，让我们可以从一个全新的角度重新审视你的UI：

{% highlight javascript %}
// 组件具有组合性，于是，可以把整个页面当作一个大组件
UI = f(state)
{% endhighlight %}

UI不再是零零散散、七拼八凑起来的一个东西了，它成为了一个可计算的值。加上 `react` 提倡的单向数据流，保证了数据（状态）与页面的一致性，以及对数据变更的可预测性。

---

## 常用 API

`immutable.js` 提供了多种不可变数据类型：`Map`、`List`、`Set`等。这些数据类型均属于 `Iterable` 类（可迭代）。这意味着你可以在这多种数据类型上使用迭代方法如 `map` 和 `filter` 等等。本来这些方法很强大，却被局限于在 `Array` 上使用。

下面是我在实际项目中使用频率最高的一些 `API`，使用 `es6` 来作示范。完整的文档[点这里][doc]。

- 转换到不可变数据

{% highlight javascript %}
import { fromJS, Map, List } from 'immutable'

// 创建一个不可变对象
const emptyMap = Map()
const notEmptyMap = Map({ name: 'map' })

// Map 并不会深度转换一个对象
// 这里的 `test` 是一个不可变数据，但是 `a` 的属性值依然是普通的 `javascript` 对象
// 深度转换需要使用下面的 `fromJS`
const test = Map({ a: { b: 1 } } )

// 创建一个不可变数组
const emptyList = List()
const notEmptyList = List([0, 1])

// 将一个复杂、嵌套的数据换转
const demo = fromJS({
    a: 1,
    b: ['x', 'y'],
    c: {
        m: {
            name: 'test',
            list: [0, 1, 2]
        },
        n: 'hey'
    }
})
{% endhighlight %}

- 转换为原生 `javascript` 数据

{% highlight javascript %}
import { fromJS, Map } from 'immutable'

// fromJS 的逆操作是 toJS
const immutableData = fromJS({
    a: 0,
    b: {
        list: ['a', 'b']
    }
})

const jsData = immutableData.toJS()

const immutableMap = Map({ a: 1 })
const jsMap = immutableMap.toJS()
{% endhighlight %}

- 取值

{% highlight javascript %}
import { fromJS, Map, List } from 'immutable'

// 直接取值
// get(key: K, notSetValue?: V): V

const a = Map({ name: 'test', title: 'immutable' })

a.get('name') // 'test'
a.get('name2') // undefined
a.get('name3', 'default') // 'default'， 提供的第二个参数，会在查询的 `key` 不存在时，当作返回值

const b = List([50, 100])

b.get(0) // 50
b.get(1) // 100
b.get(2) // undefined

// 取到嵌套在深处的值
// getIn(searchKeyPath: Array<any>, notSetValue?: any)

const c = fromJS({
    a: {
        b: {
            deepKey: 'deepValue'
        },
        c: ['x', 'y', 'z']
    }
})

c.getIn(['a', 'b', 'deepKey']) // 'deepValue'
c.getIn(['a', 'c', 1]) // 'y'
c.getIn(['a', 'd'], 'nothing') // 'nothing'
{% endhighlight %}

- 写值

{% highlight javascript %}
import { fromJS, List, Map } from 'immutable'

// set(key: K, value: V)
const a = Map()
const b = a.set('name', 'test')
b.get('name') // 'test'

const c = List()
const d = c.set(2, 'test')
d.get(2) // 'test'

// 给嵌套的属性赋值
// setIn(keyPath: Array<any>, value: any)
const x = fromJS({
    a: 'a',
    b: {
        m: 1,
        n: ['x', 'y']
    }
})

const y = x.setIn(['b', 'm'], 2)
y.getIn(['b', 'm']) // 2

const z = x.setIn(['b', 'n', 1], 'yy')
z.getIn(['b', 'n', 1]) // yy
{% endhighlight %}

- 删除属性

{% highlight javascript %}
import { fromJS, Map } from 'immutable'

// delete(key: K)
const a = Map({ x: 1, y: 2 })
const b = a.delete('x')

// { y: 2 }
console.log(b.toJS())

// 删除嵌套在深处的属性
// deleteIn(keyPath: Array<any>)
const x = fromJS({
    a: 0,
    b: {
        m: 'hello'
    }
})
const y = x.deleteIn(['b', 'm'])
// { a: 0, b: {} }
console.log(y.toJS())
{% endhighlight %}

- 更常用的更新数据方法

{% highlight javascript %}
import { fromJS, Map } from 'immutable'

// update()，它可以接收1、2、3个参数

// 第 1 种情况，只有一个参数，参数为一个函数(updater)，这个函数会接收数据本身作为参数
// 函数的返回值，即为更新过后的值
const a = Map({x: 1, y: 2})
const b = a.update(data => {
    // 这里的 `data` 其实就是数据 `a` 本身
    // 在这里作一切你想要的操作，最后记得 return 回去一个值
    return data
        .delete('x') // 删掉了属性 `x`
        .set('y', 3) // 修改了属性 `y`
        .set('z', 4) // 还添加了一个新属性
})
// { y: 3, z: 4 }
console.log(b.toJS())

// 第 2 种情况，2 个参数
// 第一个参数指定要更新的 `key`，第二个参数同样是一个函数(updater)，这个函数会接收对应 `key` 的值作为参数
// 函数的返回值，作为这个 `key` 新的值
const a = Map({x: 1, y: 2})
const b = a.update('x', data => {
    // 这里的 `data` 为属性 `x` 的值：1
    // 在这里作一切你想要的操作，最后记得 return 回去一个值
    return data + 1
})
// { x: 2, y: 2 }
console.log(b.toJS())

// 第 3 种，3 个参数
// 第 1 个参数指定要更新的 `key`，
// 第 2 个参数提供了一个默认值，如果指定的 `key` 不存在，就使用这个值
// 第 3 个参数同样是一个函数(updater)，这个函数会接收对应 `key` 的值作为参数，如果 `key` 不存在，就接收第 2 个参数指定的值
// 函数的返回值，作为这个 `key` 新的值
const a = Map({x: 1, y: 2})
const b = a.update('z', Map(), data => {
    // 这里的 `data` 为 Map()，因为 `z` 这个 `key` 并不存在
    // 如果不指定第二个参数，那 `data` 将会是 undefined
    // 在 undefined 上调用 `set` 方法显然会出错，所以这里提供一个默认值就很有必要了
    return data.set('a', 1)
})
// { x: 1, y: 2, z: { a: 1 } }
console.log(b.toJS())

/**
 * 你应该也猜到了，类似 `set` 和 `setIn`，`get` 和 `getIn`，
 * 对应的，还有一个 `updateIn`
 * 它的第 1 个参数指定了 `key` 的路径，必须为数组
 */
const a = fromJS({
    x: 1,
    y: 2,
    z: {
        list: [
            { a: 0, b: 1 }
        ]
    }
})
const b = a.updateIn(['z', 'list', 0, 'b'], data => {
    // `data` 为 1
    return data * 2
})
// b.toJS() 的结果为：
{
    x: 1,
    y: 2,
    z: {
        list: [
            { a: 0, b: 2 }
        ]
    }
}
{% endhighlight %}

- 强大的遍历方法

{% highlight javascript %}
import { Map } from 'immutable'

const a = Map({
    a: 1,
    b: 2,
    c: 'test'
})

const b = a.map((val, key) => {
    return '-' + value
})

// b.toJS() 的结果为
{
    a: '-1',
    b: '-2',
    c: '-test'
}

const c = a.filter(val => {
    return typeof value === 'number'
})

// c.toJS() 的结果为
{
    a: 1,
    b: 2
}
{% endhighlight %}

以上仅仅是 `immutable.js` 众多 `API` 中的一部分。它的 `API` 虽多，但设计得很巧妙，也非常语义化，接受起来并不难。更可贵的是它提供的一系列遍历方法往往可以降低我们解决一些问题的复杂度。




[lee's twitter]: https://twitter.com/leeb
[graphql]: https://github.com/graphql/graphql-js
[doc]: http://facebook.github.io/immutable-js/docs/
[wiki]: https://en.wikipedia.org/wiki/Persistent_data_structure
