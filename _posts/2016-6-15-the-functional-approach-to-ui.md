---
layout: post
title:  "[译] 函数式的UI"
date:   2016-6-15 20:48:28
categories: posts
tags: translation
---

> 原文地址：http://engineering.blogfoster.com/the-functional-approach-to-ui/

“状态”是一个系统在特定时间点上所对应的一个表现。传统上，我们使用一些可变的状态存储来处理“状态”的问题，比如 `SQL` 和 `NoSQL` 数据库。

<!-- more -->

在这些传统的方案中，每一次更新都会销毁前一个状态的数据，对于1分钟前、1小时前甚至5年前所存储的内容，无迹可循。

## 事件和不可变性(immutability)

有没有一种替代方案，可以弥补这样的缺点呢？

最古老的职业之一（会计）已经给出了答案。对于会计来说，修改余额的唯一途径就是添加一条“借”或“贷”的记录。

假设一个会计不小心添加了一条 `$100` 的“借”记录，而他不需要，也不能删除这个记录。相反地，他只要添加多一条 `$100` 的“记”记录，就可以将余额恢复到前一个状态。

这个行为原则是“事件源”(Event Sourcing)架构风格的基础。在这种架构中，有一个初始状态以及一系列的事件，每一个事件都表示对状态的改变。在这个过程中，每一个事件都会被存储下来，而且不能被删除或修改，而状态则衍生自这些事件。这两者都是不可变的(immutable)。

系统整体的状态可以这样来描述：

{% highlight javascript %}
Snext = F(S, event)
{% endhighlight %}

为了得到给定时间点的系统状态，我们需要一个初始值，并且对发生过的事件进行回放(replay)。

## UI是关于状态的函数

“命令式”在当下占了主导地位(dominant)，前端应用也不例外。我们在客户端使用 `MVC/MVVM` 模式，从服务端获取数据，对其进行命令式的修改并保存回服务端。

在这种情况下，UI的状态被四处分发，没有一个集中的地方来存储。简直是模型的状态(states in models)、DOM 的状态以及一系统副作用(side effects)的混合。

如果我们能有一个集中的地方用来存储状态，并且把整个应用的UI看成是关于它的一个函数，会如何呢？

{% highlight javascript %}
UI = F(S)
{% endhighlight %}

也就是说，UI 是一个关于状态的函数。

`React` 这个库可以让我们以这样的方式来看待 UI 。它将 UI 表示为具有层次结构的组件树，每一个组件是一个函数，接收一些属性并返回一个标记。整个UI就是由这样的函数组合而成的。

但应该如何处理“状态”才能让我们避免在命令式UI中碰到的那些问题呢？

## 可预测的状态

[Dan Abramov][dan]，在他著名的[“时间旅行调试”][time]这个演讲中，将处理状态的“事件源”(Event Sourcing)原则带到了客户端中，解决了最大的一个痛点。

在[Redux][redux]中，状态表示为：

{% highlight javascript %}
Snext = R(S, action)
{% endhighlight %}

与 UI 部分结合起来就是：

{% highlight javascript %}
UI = F(S)
UI = F(R(state, action))
{% endhighlight %}

F 是指 `React` 的组件函数，R 是指 `reducer` —— 一个根据 `action` 来改变当前状态的函数。

在 `Redux` 架构中，我们有一个 `store` 来保存着整个应用的状态，并且通过分发(dispatch) `action` 来对外提供修改状态的接口。一个 `action` 包含着它的类型以及一些额外的数据，`reducer` 根据它来产生下一个状态。

`action` 仅仅是一些纯对象，可以被打印出来，被序列化，被存储，或者在调试的时候被回放(replay)。

## React 结合 Redux

尽管 `Redux` 被强调它不是专门为 `React` 而设计的，但这两者却可以完美地结合。

`React` 让你可以将 UI 当作一个关于状态的函数来看待，而 `Redux` 则为你提供可预测的状态管理。`React-Redux` 将 `React` 组件与 `Redux` 的状态连接起来，每次状态一改变，组件取得新状态并触发了 UI 的重新渲染。

换句话说，每一次状态改变，整个 UI 都会重新渲染。得益于 `virtual DOM` 算法，比起其他框架而言，重新渲染并不会带来巨大性能问题。

单向数据流使得处理复杂的界面问题变得更简单了。我也因此在没有多少 `React` 经验的情况下入了 `Redux` 的坑，我认为“状态管理”这个问题一旦解决，`React` 也就不是什么问题了。

[1]: http://engineering.blogfoster.com/the-functional-approach-to-ui/
[dan]: https://github.com/gaearon
[time]: https://www.youtube.com/watch?v=xsSnOQynTHs
[redux]: http://redux.js.org/
