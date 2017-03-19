---
layout: post
title:  "[译] FLUX概述"
date:   2015-05-03 14:56:51
categories: posts
tags: react
---
> 原文地址：https://facebook.github.io/flux/docs/overview.html

`Flux`是Facebook用来构建web客户端应用的架构。它利用单向数据流完善了`React`组合式的页面组件。比起一个框架，`Flux`更像是一种模式，你可以直接使用它，这很容易上手。

<!-- more -->

通过`Flux`实现的应用有三个主要部分：`dispatcher`，`stores`和`views`（即`React`组件）。这可不要和`Model-View-Controller`搞混了。`Controllers`控制器也存在于`Flux`应用中，不过你应该称它们为**控制器视图**`（controller-view）`。这些控制器视图一般位于应用的顶层，它们从`stores`取回数据，然后将数据往下传递给后代。此外，`action creators`（`dispatcher`的辅助方法）提供了语义化的API来描述应用中可能会发生的所有改变。你可以把`action creators`理解成`Flux`更新周期中的第四部分。

`Flux`通过单向数据流来避开`MVC`这种模式。当一个用户与`React`视图交互时，视图会通过一个核心的`dispatcher`向那些存储着应用数据和业务逻辑的`stores`传播一个`action`，以此来更新有关的视图。这种模式与`React`的声明式编程风格配合得非常好，它允许`stores`无需指明视图在不同的状态之间要怎么过渡，只要`send updates`即可。

我们最先的出发点是为了更好地解决获取数据（`derived data`）的问题。比如，我们想要一个显示未读消息条数的视图，还有另一个视图显示所有消息，其中高亮突出那些未读的。这个问题通过`MVC`来管理的话有些困难——需要更新已读和未读两个`model`。这些依赖关系和级联更新通常发生在一个大型的`MVC`应用中，从而导致数据流的混乱和不可预测的结果。

`stores`让更新的控制权颠倒过来了：`stores`获取到更新数据之后，自己来协调处理这些数据，而不是依赖于外部的某些程序通过固定的方式来更新它的数据。任何外部的东西都无法了解`stores`内部是如何管理数据的，这非常有助于清晰的关注点分离（`separation of concerns`）。     

`stores`并没有直接的`setter methods`，要将新数据获取到它们各自的内部，只有一种方法，即通过它们注册到`dispatcher`的回调。

## 架构和数据流

在一个`Flux`应用中，数据的流动是单向的：

![unidirectional data flow in Flux][1]

**单向数据流**是`Flux`模式的核心，上面这张图，对于**写`Flux`的人来说应该时刻铭记在心**。其中，`dispatcher`，`stores`和`views` 是有着明确输入和输入、互相独立的节点。而`actions`只是简单的对象，一个`action`包含了新数据和一个标识这个`action`类型的属性。

为了响应用户交互，`views`也可能会引起一个新的`action`的传播：

![data flow in Flux with data originating from user interactions][2]

`dispatcher`作为一个中枢，所有数据流都会经过它。首先，`action creator`为`dispatcher`提供了`actions`，这些`actions`通常来自用户与界面的交互。接着，`dispatcher`会调用`stores`在它身上注册的回调，从而将`actions`分发给所有的`store`。在这些回调里面，`stores`对那些与它们自身状态有关的`actions`作出响应。然后，`stores`会发出一个`change`事件通知`controller-views`数据层发生了变化。`controller-views`监听着这些事件，并在事件处理函数中从`stores`取回数据。最后，`controller-views`调用它们自身的`setState()`，以此触发它们及组件树上所有后代的重新渲染（`re-rendering`）。

![varying transports between each step of the Flux data flow][3]

这种结构使我们能通过**函数式编程**这种思想来更加容易地理解我们的应用——或者更具体点说，**数据流编程**或**基于流的编程**，应用中所有的数据都是单向流动的，不存在双向绑定。应用的状态（`state`）**仅保存**在`stores`中，从而让应用的不同部分高度解耦。当`stores`之间发生依赖关系时，它们将保持严格的等级制度，由`dispatcher`来管理它们的同步更新。

我们发现双向数据绑定会造成级联更新，改变一个对象会造成别一个对象的改变，这也可能会引发更多的更新。当应用逐渐变大的时候，这种级联更新让我们很难预测一个用户交互会触发什么样的结果。当系统仅能通过单一的方式改变数据时，这个系统作为一个整体，将变得更有可预测性。

让我们与`Flux`的各个部分来个零距离接触。从`dispatcher`开始比较合适。

## Dispatcher

在一个`Flux`应用中，`dispatcher`是管理所有数据流的中枢。本质上，它只是一个注册`stores`回调函数的地方，没有自己的思想——它只是一种用来将`actions`分发给`stores`的简单机制。每一个`store`会在这里注册一个回调，然后，当`action creator`为`dispatcher`提供了一个新`action`时，所有`store`都会通过这些回调接收到这个新`action`。

当应用变复杂时，`dispatcher`变得更加重要。它可以按照特定顺序来执行回调，以此来管理`stores`之间的依赖关系。通过它，我们可以声明一个`store`等到其他的`store`更新之后，再相应地更新自身。

## Stores

`stores`包含了应用的数据（状态）和逻辑。它们的角色类似于传统`MVC`模式中的`model`，但它们管理很多对象的状态，不同于`ORM`模型那样只是一个单一的数据记录，也不同于`Backbone`中的集合。不仅仅管理着`ORM`风格的对象集合，在一个应用中，`stores`还为特定的部分（**`particular domain`**）管理着相应的应用状态（`state`）。

比如，Facebook的`Lookback Video Editor`使用`TimeStore`来保存回放的时间位置和回放的状态，使用`ImageStore`来保存图片的集合。在`TodoMVC`例子中，`TodoStore`则用来管理一个`todo`条目的集合。一个`store`同时展现出一个**`models`的集合**和**一个逻辑单例**的特点。

上面有提及，一个`store`在`dispatcher`那里注册一个回调，这个回调会接收一个`action`作为参数。在`store`的回调里，一个基于`action` 类型的`switch`语句被用来处理`action`，并为`store`内部的方法提供一些挂钩。于是，通过`dispatcher`，一个`action`可以触发`store`的状态更新。`stores`更新之后，它们会传播一个事件，宣布它们的状态已经更新了，然后`views`便可以查询到新的状态从而更新自身。

## Views和Controller-Views

`React`为视图层提供了可组合、可自由重新渲染的视图组件。在嵌套的视图层次结构的顶部，有一种视图用来监听那些与其相关的`stores`发出的事件。我们称这种视图为“控制器视图”，它起到了粘合剂的作用——将数据从`stores`中取回并往下传递给后代。在我们的应用中，往往会有这样的控制器视图管理着某些重要的部分。

当控制器视图从`stores`那里接收到事件时，它首先通过`stores`公共的`getter`方法请求获取它所需要的新数据，接着会调用它自身的`setState()`或`forceUpdate()`来触发它以及所有后代的`render()`方法的执行（即重新渲染）。

我们通常将`stores`的整个状态数据作为一个单一的对象往下传递，让不同的后代可以各取所需。这样做的好处是，除了让控制器视图保持在层级的顶部，后代视图尽可能保持功能的简单，还可以减少我们需要管理的属性（`props`）的数量。

有时，我们需要在更深的层次结构上添加额外的控制器视图，以此让组件保持简单。这有时会帮助我们更好地将特定数据域和层次结构的某部分封装在一起。但是要注意的是，这么做也为数据流引入了新的、存在潜在冲突的入口，因此会干扰单向数据流。在决定是否这么做之前，需要进行衡量，获得更简单的组件的同时也伴随着更复杂的数据流。 多个不同的控制器视图更新会造成`React`渲染方法的多次调用，这也会导致不可预测的结果，无形中增加了调试的难度。

## Actions

`dispatcher`暴露了一个方法，允许我们触发一个包含一些数据的`dispatch`到`stores`，我们称之一个`action`。`action`的创建被包含在一个语义化的、将`action`发送给`dispatcher`的辅助方法中。例如，在一个`todo`应用中我们可能想要改变一个`todo`条目的文本。我们可以在`TodoActions`模块中通过签名类似`updateText(todoId, newText)`的函数来创建一个`action`。这个函数可以在视图层的事件处理中被调用，所以我们可以通过它来响应一个用户交互。这个函数同时也会给`action`添加一个类型（`type`），以便`stores`接收到这个`action`的时候可以准确地响应。在我们这个例子中，这个类型的名字类似于`TODO_UPDATE_TEXT`。

`actions`也可能来自于其他地方，像服务端。这可以发生在数据初始化时，或者服务端返回一个错误码，或者当服务端已经更新时。

## 进一步说说Dispatcher

上面提到，`dispatcher`同样可以管理`stores`之间的依赖。这个功能可以通过`Dispatcher`类内部的`waitFor()`方法来实现。在简单的应用中我们不需要使用这个方法。但当应用变得更大、更复杂时，这个方法将是必不可少的。

在`TodoStore`中注册的回调里，我们可以明确等待其他的依赖先更新：

{% highlight js %}
case 'TODO_CREATE':
    Dispatcher.waitFor([
        PrependedTextStore.dispatchToken,
        YetAnotherStore.dispatchToken
    ]);

TodoStore.create(PrependedTextStore.getText() + ' ' + action.text);
break;    
{% endhighlight %}

`waitFor()`接受一个数组参数，该数组包含了调度标识（`dispatch token`）。因此，调用了`waitFor()`的`store`可以依赖其他`store`的状态来告诉自己应该如果更新自身。

一个调度标识是在给`Dispatcher`注册回调时，由`register()`返回的：

{% highlight js %}
PrependedTextStore.dispatchToken = Dispatcher.register(function (payload) {
    // ...
});
{% endhighlight %}

完。

  [0]: https://facebook.github.io/flux/docs/overview.html
  [1]: /images/4255025159.png
  [2]: /images/4228912871.png
  [3]: /images/1280007486.png
