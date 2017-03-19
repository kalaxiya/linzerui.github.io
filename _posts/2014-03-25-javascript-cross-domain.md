---
layout: post
title:  "javascript跨域总结"
date:   2014-03-25 20:48:28
categories: posts
tags: cross-domain
---
作为前端，工作中免不了会碰到跨域的问题。在我目前的业务工作中，最常用的是 `jsonp`。对于其他的跨域方式虽然有所了解，但大多没在实际业务中使用过，导致对于其背后的实现原理不甚清晰。这个时候，就需要一个总结了。

<!-- more -->

之所以会有跨域问题 ，是因为 **同源策略(same-origin policy)** 的存在。这里就不赘述同源策略为何物，以及为什么它的存在是必要的。详情可以参考 MDN 的[这篇文档][same-origin policy]。

常见的几种跨域方式有：

- document.domain
- jsonp
- location.hash
- window.name
- HTML5 postMessage
- CORS(cross-orgin resource sharing)
- flash

---

## document.domain

假设现在有以下两个页面，它们之间想要进行通讯：

    http://x.a.com/a.html
    http://y.a.com/b.html

使用 `document.domain` 相当简单，只需要在这两个页面的 `js` 中，加上这样的一行代码：

{% highlight javascript %}
// 注意，是两个页面都需要加上这样的代码
document.domain = 'a.com'
{% endhighlight %}

于是，在 `a.html` 中，就可以顺利与 `b.html` 进行通信了：

{% highlight html %}
<!-- a.html -->

<iframe src="http://y.a.com/b.html"></iframe>
{% endhighlight %}

这大概是最简单，同时也是局限性最大的方法了……它有什么局限性呢？

1. 主域名必须相同。上面的两个页面，主域名都是 `a.com`。
2. 有安全性。如果其中一个页面被攻击了，另一个页面有可能被牵涉到。
3. 想象在页面引入多个 `iframe`，你必须同时设置这些页面的 `domain`，显得繁琐。

---

## jsonp

`jsonp` 全称是 **JSON with Padding** 。这种跨域方法的核心是动态创建 `script` 标签并利用 `script` 标签可以跨域的能力。

名字叫 `jsonp`， 显然我们的目的是跨域获取json数据。

假设我们的目标数据在 `http://b.com/b.js`，应用页面是 `http://a.com/a.html`。

目标数据的内容如下，是标准的 `json`：

{% highlight javascript %}
// b.js

{
  "name": "apple",
  "target": "test"
}
{% endhighlight %}

在应用页面 `a.html` 中，我们动态创建一个 `script` 标签，并请求数据：

{% highlight html %}
<!-- a.html -->
<script>
var script = document.createElement('script')
script.src = 'http://b.com/b.js'
document.body.appendChild(script)
</script>
{% endhighlight %}

然而，如果仅仅这样做的话，页面将不出意外地……报错。

我们知道 `script` 标签在加载完资源之后，会立即执行其中的代码。回头看看 `b.js` 中的内容，它是合法的 `javascript` 代码没错，然而却不能直接运行。

我们将 `b.js` 中的内容加以修改，变成这样：

{% highlight javascript %}
// b.js

jsonpCallback({
  "name": "apple",
  "target": "test"
})
{% endhighlight %}

是的，将它变成一个函数调用。如此一来，它便是合法的、同时也是可直接运行的 `javascript` 代码了。但是，这个时候我们还少一个东西：这个回调函数 `jsonpCallback` 从哪里来？

由于请求到的数据是在客户端执行的，这就要求客户端存在一个函数 `jsonpCallback`。实际应用中，这个函数名通常不会是 hard code ，这显然不合理。一种可取的方案是，将回调函数的名称作为参数传递，后端拿到对应的参数值（即函数名），将 `json` 数据包裹成函数调用的形式，返回给前端。

---

## location.hash

`location.hash` 这个东西大家应该不陌生。它对应着页面 `url` 中的 `#` 以及 `#` 后面的一串内容。

作为栗子：

{% highlight javascript %}
// 假设当前页面 url 是 http://a.com/index.html#what_is_this

// #what_is_this
console.log(location.hash)
{% endhighlight %}

所以……这货也能拿来跨域？！

很遗憾，是的……

在说具体的实现步骤之前，关于 `location.hash` 还有以下几点：

1. 改变页面的 `hash` 不会触发页面的刷新，但是会保存浏览器的历史记录（即是，你可以通过浏览器的前进、后退按钮，回到前一个、后一个页面状态）。
2. 现代浏览器（IE8+）中，`hash` 的改变，会在 `window` 上触发 `hashchange` 事件。

这个方法的核心是利用 `hash` 来传值。

依然假设我们有两个页面，它们要进行通讯：

    http://x.a.com/a.html
    http://y.a.com/b.html

按以下步骤走：

1. 在 `a.html` 页面中，创建一个 `iframe` 指向 `b.html`，同时利用 `hash` 传递一些需要的数据。
2. 在 `b.html` 页面中，通过 `location.hash` 取到请求数据，然后通过一番计算，将响应数据塞到 `a.html` 页面的 `hash` 中。
3. 在 `a.html` 页面中，通过 `window.onhashchange` 事件监听，取得响应数据。

举个栗子——

`a.html` 页面中的 `js` 代码：
{% highlight javascript %}
// js in a.html

var iframe = document.createElement('iframe')
iframe.style.display = 'none'
// 注意这里的 hash
iframe.src = 'http://y.a.com/b.html#i_want_something'
document.body.appendChild(iframe)

// 监听 hash 的变化
window.addEventListener('hashchange', function(e) {
    // here_it_is
    console.log(location.href.substring(1))
}, false)
{% endhighlight %}

下面是 `b.html` 页面的 `js` 代码：
{% highlight javascript %}
// js in b.html

switch (location.hash) {
    case '#i_want_something':
        doIt()
        break

    case '#else':
        // something else
        break
}

function doIt() {
    try {
        parent.location.hash = 'here_it_is'
    } catch() {
        // 由于 ie、chrome 的安全机制，无法直接修改 parent.location.hash
        // 所以要利用 a.com 域下的一个文件
        var iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        // 注意该文件在 a.com 域下
        iframe.src = 'http://a.com/c.html#here_it_is'    

        document.body.appendChild(iframe)
    }
}
{% endhighlight %}

最后，看看 `c.html` 到底是什么：

{% highlight javascript %}
// js in c.html

// 由于 c.html 和 a.html 同域，下面的修改可以顺利进行
parent.parent.location.hash = self.location.hash.substring(1)
{% endhighlight %}

……以上，便是这种略显魔性的方法。

它的缺点同样很明显：

1. 数据直接暴露在 `url` 中。如果是敏感数据，建议改用他法。
2. 数据的类型和容量有限。

---

## window.name

这里有一篇文章，讲得不错：[window.name实现的跨域数据传输][window.name]

`Dojo` 便是使用了这个方法实现的跨域，[看这篇文章][dojo]。

下面引用文章里的一段话：

> name is a property of the global/window object in the browser environment, and the value of the name property remains the same as new pages are navigated for the frame. By loading a resource in an iframe where the target page will set the name property for its frame, this name property value can be retrieved to access the information sent by the web service. The name property is only accessible for frames that are in the same domain.

这段话解释了利用 `window.name` 实现跨域的核心原理。大致意思是：

> `name` 是浏览器中 `window` 对象的一个属性，这个属性值在加载新页面之后，仍然保持一致。通过在 `iframe` 中加载一个页面，并且该页面设置了它的 `name` 属性，那么就可以通过取得 `name` 的值来间接获得服务端发送的信息。要注意的是，`name` 属性只能在同域之间才能获取。

啰嗦一大堆，还是看点代码吧。

继续假设，我们的主页面 `a.com/a.html` 想要与页面 `b.com/b.html` 进行通信。

先看看 `b.html`：

{% highlight html %}
<!-- b.html -->

<script>
// 这就是 a.html 想要获得的数据，设置为 name 的值
window.name = 'this is what you want ...'
</script>
{% endhighlight %}

然后，看看我们的主页面：

{% highlight html %}
<!-- a.html -->

<script>
var loaded = false
var iframe = document.createElement('iframe')

function callback() {
    if (loaded) {
        var data = iframe.contentWindow.name
        // this is what you want ...
        console.log(data)

        // 销毁，保证安全
        iframe.contentWindow.document.write('')
        iframe.contentWindow.close()
        document.body.removeChild(iframe)

    } else {
        loaded = true
        // 重定向与主页面同域的代理页面，这样才能与它交互，取得 name 值
        iframe.contentWindow.location.href = 'http://a.com/c.html'
    }
}

// 一开始，指向 b.html
iframe.src = 'http://b.com/b.html'
iframe.addEventListener('load', callback, false)

document.body.appendChild(iframe)
</script>
{% endhighlight %}

主要思路便是如此。看起来，和 `location.hash` 有异曲同工的感觉。然而，利用 `window.name` 更安全，且数据容量更不易受到限制（一般为2M）。

---

## HTML5 postMessage

以上几种，都是为了应对同源策略不得已而为之的非标准方法。那有没有 **标准** 的方法呢？

答案是 **[postMessage][postMessage]** 。

文档总是枯燥的，还是看代码更容易理解点。

最后再一次假设我们有两个页面。`a.html` 和 `b.html`。

我希望 `a.html` 对 `b.html` 说 `hi`，然后 `b.html` 回应 `hello`。

{% highlight html %}
<!-- a.html -->

<script>
var iframe = document.createElement('iframe')
iframe.src = 'b.html'

iframe.addEventListener('load', function() {
    // 向 b.html 发出问候
    // 第一个参数为传递的数据内容，第二个参数指定允许接收信息的目标域，设置为 '*' 表示不限制
    iframe.contentWindow.postMessage('hi', '*')
}, false)

// 监听事件
window.addEventListener('message', function(e) {
    // 来自 b.html 的回应
    console.log(e.data)  // hello
})

document.body.appendChild(iframe)
</script>
{% endhighlight %}

再看看 b.html：

{% highlight html %}
<!-- b.html -->

<script>
window.addEventListener('message', function(e) {
    // 判断消息的来源
    if (e.origin === 'http://a.com') {
        // 作出回应
        // e.source 指向消息来源 window。但由于不同域，此处并不能直接操作它的内容
        e.source.postMessage('hello', '*')
    }
})
</script>
{% endhighlight %}

嗯，所以说，HTML5 大法好啊。虽然对于 IE，只支持 IE8+，不过相信随着时代的发展，这些问题都将不再是问题。

---

## CORS

`cross-orgin resource sharing` 即 跨域资源共享。这货可以扒的内容还是挺多的，待续……

---

## 参考链接

- [window.name实现的跨域数据传输][window.name]
- [window.name Transport][dojo]
- [JavaScript跨域总结与解决办法][cnblogs]










[same-origin policy]: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
[window.name]: http://www.cnblogs.com/rainman/archive/2011/02/21/1960044.html
[dojo]: https://www.sitepen.com/blog/2008/07/22/windowname-transport/
[postMessage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
[cnblogs]: http://www.cnblogs.com/rainman/archive/2011/02/20/1959325.html
