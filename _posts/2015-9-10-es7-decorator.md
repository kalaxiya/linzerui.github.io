---
layout: post
title:  "ES7 decorator 初探"
date:   2015-9-10 20:48:28
categories: posts
tags: ES7
---
`decorator`(装饰器) 是 `ES2016` 也就是 `ES7` 草案里的。这货之前一直看得云里雾里的，现在将一些基本了解写下来。`decorator` 也并不是 `ES` 首创的概念，至少在 `Python` 中也有。在 `Python` 中，`decorator` 提供了一种便利的高阶函数语法。<!-- more -->

> A Python decorator is a function that takes another function, extending the behavior of the latter function without explicitly modifying it.

简单来说，在 `Python` 中，一个装饰器是一个函数，它接收另一个函数作为参数，同时在功能上对后者进行了扩展，且这个过程并没有直接修改原来的函数。

而 `ES7` 中的装饰器，同样也是对目标进行扩展，或者功能上的修改。被装饰的目标可以是一个 `class` 或者一个属性。

---

## 装饰一个属性

与 `Python` 类似地，在 `JavaScript` 中，装饰器首先是一个函数。

当应用在一个属性上面时，装饰器接收以下 3 个参数：

1. 属性所在的对象
2. 属性名
3. 属性描述符(property descriptor)

看一个简单的例子。

{% highlight javascript %}
class Foo {
    sayHello() {
        console.log('hello')
    }
}
{% endhighlight %}

我们知道 `sayHello` 这个属性最终存在于 `Foo.prototype` 上面，被这个类的所有实例所共享。换句话说，可以用以下代码描述这个过程：

{% highlight javascript %}
Object.defineProperty(Foo.prototype, 'sayHello', {
    value: specifiedFunction,
    enumerable: false,
    configurable: true,
    writeable: true
})
{% endhighlight %}

假设我们想让这个属性变为“只读”状态，首先来定义一个 `readonly` 函数：

{% highlight javascript %}
function readonly(target, key, descriptor) {
    descriptor.writeable = false
    return descriptor
}
{% endhighlight %}

然后应用在属性上面：

{% highlight javascript %}
class Foo {
    @readonly
    sayHello() {}
}
{% endhighlight %}

当然，你还可以这样：

{% highlight javascript %}
class Foo {
    @isReadOnly(true)
    sayHello() {}

    @isReadOnly(false)
    log() {}
}

function isReadOnly(flag) {
    return function(target, key, descriptor) {
        descriptor.writeable = !flag
        return descriptor
    }
}
{% endhighlight %}

只要保证 `@` 后面是一个函数就可以。

就是这么简单。注意到函数接收到的参数类型，与 `Object.defineProperty` 接收的参数类型是一样的。那这两者的优先级别是怎样的呢？引擎会先调用装饰器，得到属性描述符，最后再将属性设置到对象上面。可以用以下代码解释这个过程：

{% highlight javascript %}
// 默认的属性描述符
let descriptor = {
    value: specifiedFunction,
    enumerable: false,
    configurable: true,
    writeable: true
}

descriptor = readonly(Foo.prototype, 'sayHello', descriptor) || descriptor
Object.defineProperty(Foo.prototype, 'sayHello', descriptor)
{% endhighlight %}

## 装饰一个 class

将装饰器应用在一个类上面时，它接收到的参数是这个类本身。

{% highlight javascript %}
@makeTrue
class Foo {}

function makeTrue(target) {
    return target.flag = true
}

console.log(Foo.flag) // true
{% endhighlight %}

---

装饰器在某些情况下非常有用。假设多个类之间要共享某些功能，或者在某种情况，需要对一个类进行扩展修改，但又不想去修改类本身，那在这些情况下，装饰器将非常有用。

---

## 参考链接

* [Exploring ES2016 Decorators][link]

[link]: https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.gt7fk1n4y
