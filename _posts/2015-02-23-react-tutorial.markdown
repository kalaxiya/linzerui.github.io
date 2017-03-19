---
layout: post
title: "[译] React官方教程"
date: 2015-02-23 14:54
categories: posts
tags: react
---
最近对 `React` 挺感兴趣，打算把官方的教程和文档翻译一遍。先来个教程，文档接着补上。

<!-- more -->

> 原文地址：http://facebook.github.io/react/docs/tutorial.html

我们下面要做的是一个简单但有用的评论框，它是Facebook实时评论的简化版本，你可以把它放进一个博客里面。

我们要实现的功能：

 - 一个展示所有评论的视图
 - 一个用来提交评论的表单
 - 一个为你提供自定义后端的钩子

这个评论框还有一些有意思的特点：

 - 实时评论：在评论被保存到服务器之前就将它显示在列表中，因此看起来非常快
 - 动态更新：其他用户的评论将会实时出现在视图列表中
 - Markdown语法：用户可以用Markdown来格式化他们的文本

## 想跳过教程直接看源码吗？

[到Github查看源码][2]

## 运行一个服务器

虽然在这个教程中没有必要，但我们稍后会添加发送请求到服务器的功能。如果你对此感到熟悉而且也想创建自己的服务器的话，你也可以这么做。对于只想学习有关React的人，你也无需担心服务器端部分，我们已经用几种语言写了简单的服务器 —— JavaScript（使用Node.js）、Python和Ruby，这些都可以在Github上获取到。你可以[查看源码][3]或[下载压缩包][4]。

## 开始

在这个教程中，我们将使用一些在CDN上面的JavaScript文件。打开你喜欢的编辑器然后新建一个HTML文档：

{% highlight html %}
<!-- index.html -->
<html>
    <head>
        <title>Hello React</title>
        <script src="http://fb.me/react-0.12.2.js"></script>
        <script src="http://fb.me/JSXTransformer-0.12.2.js"></script>
        <script src="http://code.jquery.com/jquery-1.10.0.min.js"></script>
    </head>
    <body>
        <div id="content"></div>
        <script type="text/jsx">
        // Your code here
        </script>
    </body>
</html>
{% endhighlight %}

接下来，我们将在这个script标签里面写我们的JavaScript代码。

> 注意：
> 我们在这里引入了jQuery是为了简化后面的ajax请求，jQuery并不是必需的。

## 你的第一个组件

React全是关于模块化、可组合的组件。对于我们的评论框来说，它有以下的组件结构：

{% highlight html %}
- CommentBox
    - CommentList
        - Comment
    - CommentForm
{% endhighlight %}

首先创建`CommentBox`组件，它仅仅是个简单的`<div>`：

{% highlight js %}
// tutorial1.js
var CommentBox = React.createClass({
    render: function() {
        return (
            <div className="commentBox">
            "Hello, world! I am a CommentBox."
            </div>
        );
    }
});
React.render(
    <CommentBox />,
    document.getElementById('content')
);
{% endhighlight %}

## JSX语法

我猜你首先注意到的是那个类似XML的语法。我们有一个简单的预编译器，用来将这个语法糖转化为下面的JavaScript：

{% highlight js %}
// tutorial1-raw.js
var CommentBox = React.createClass({displayName: 'CommentBox',
    render: function() {
        return (
            React.createElement('div', {className: "commentBox"},
            "Hello, world! I am a CommentBox."
            )
        );
    }
});
React.render(
    React.createElement(CommentBox, null),
    document.getElementById('content')
);
{% endhighlight %}

JSX是可选的，但我们认为它比单纯的JavaScript更好用。查看[JSX语法][5]了解更多。

## 发生了什么

我们传递了一个对象给`React.createClass()`来创建一个新的React组件，这个对象拥有一些方法。在这些方法里面最重要的是`render`，它返回了React组件最终将被渲染成的HTML的树结构。

这个`<div>`并非真实的DOM节点，它只是React`div`组件的实例，你可以把它想象成标记、或者React知道如何去处理的数据块。React是安全的，我们并不是在生成HTML字符串，这是出于XSS保护的考虑。

此外，并非一定要返回HTML，你也可以返回你（或其他人）创建的组件（树）。这使得React是可组合的：一个前端可维护的关键原则。

`React.render()`实例化一个组件，并将标记插入由第二个参数提供的真实的DOM元素里面。

##可组合的组件

让我们来创建`CommentList`和`CommentForm`，同样的，它们也是简单的`<div>`：

{% highlight js %}
// tutorial2.js
var CommentList = React.createClass({
    render: function() {
        return (
            <div className="commentList">
            Hello, world! I am a CommentList.
            </div>
        );
    }
});

var CommentForm = React.createClass({
    render: function() {
        return (
            <div className="commentForm">
            Hello, world! I am a CommentForm.
            </div>
        );
    }
});
{% endhighlight %}

下一步，让我们更新下`CommentBox`组件，以使用上面新创建的组件：

{% highlight js %}
// tutorial3.js
var CommentBox = React.createClass({
    render: function() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList />
                <CommentForm />
            </div>
        );
    }
});
{% endhighlight %}

留意下这里是如何混合HTML标签和我们创建的组件的。HTML标签也是常规的React组件，和你定义的那些一样。有一点不同的是，JSX编译器会自动将HTML标签用`React.createElement(tagName)`重写，与其他部分隔开，这是为了防止污染全局命名空间。

## 组件属性

接下来创建第四个组件`Comment`。我们想给它传递作者名字和评论内容以便在每个独立的评论中复用它。首先给`CommentList`添加一些评论：

{% highlight js %}
// tutorial4.js
var CommentList = React.createClass({
    render: function() {
        return (
            <div className="commentList">
                <Comment author="Pete Hunt">This is one comment</Comment>
                <Comment author="Jordan Walke">This is *another* comment</Comment>
            </div>
        );
    }
});
{% endhighlight %}

注意到我们已经从父组件`CommentList`传递了一些数据给子组件`Comment`。比如，我们传递了`Pete Hunt`（通过一个属性）和`This is one comment`（通过一个类似XML的子节点）给第一个`Comment`。从父组件到子组件传递的数据被称为`props`，即`properties`的缩写。

## 使用props

让我们继续`Comment`组件，通过使用`props`，我们就可以读取从`CommentList`传递给它的数据，同时渲染出一些标记：

{% highlight js %}
// tutorial5.js
var Comment = React.createClass({
    render: function() {
        return (
            <div className="comment">
                <h2 className="commentAuthor">
                    {this.props.author}
                </h2>
                {this.props.children}
            </div>
        );
    }
});
{% endhighlight %}

在JSX里，通过将一个JavaScritp表达式用花括号包裹起来（无论是作为一个属性还是子节点），你可以将文本或组件放到树中。我们通过访问`this.props`的`key`来获取传递给组件的命名属性，访问`this.props.children`来获取嵌套在组件里的元素。

## 添加Markdown

Markdown是一种格式化文本的简单方式。比如，通过用星号包裹来强调文本。

首先，在你的应用中添加第三方库Showdown。这是一个将Markdown语法转化为标准HTML的JavaScript库。我们在头部引入它：

{% highlight html %}
<!-- index.html -->
<head>
    <title>Hello React</title>
    <script src="http://fb.me/react-0.12.2.js"></script>
    <script src="http://fb.me/JSXTransformer-0.12.2.js"></script>
    <script src="http://code.jquery.com/jquery-1.10.0.min.js"></script>
    <script src="http://cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js"></script>
</head>
{% endhighlight %}

接下来，让我们将评论转化为Markdown并输出它：

{% highlight js %}
// tutorial6.js
var converter = new Showdown.converter();
var Comment = React.createClass({
    render: function() {
        return (
            <div className="comment">
                <h2 className="commentAuthor">
                {this.props.author}
                </h2>
                {converter.makeHtml(this.props.children.toString())}
            </div>
        );
    }
});
{% endhighlight %}

我们在这里所做的就是调用`Showdown`库。我们需要将`this.props.children`从React的包裹文本转换为`Showdown`可以识别的字符串，所以这里调用了`toString()`。

但有一个问题！渲染出来的评论在浏览器中看起来是这样的：`<p>This is <em>another</em> comment</p>`。我们想要的是那些标签能正确地转换为HTML。

出现这样的问题，是由于React为了防止你受到XSS攻击。有一个方法可以达到目的，不过React并不推荐你使用它：

{% highlight js %}
// tutorial6.js
var converter = new Showdown.converter();
var Comment = React.createClass({
    render: function() {
        var rawMarkup = converter.makeHtml(this.props.children.toString());
        return (
            <div className="comment">
                <h2 className="commentAuthor">
                {this.props.author}
                </h2>
                <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
            </div>
        );
    }
});
{% endhighlight %}

这是一个特殊的API，故意让人难以插入原始的HTML。但因为`Showdown`我们可以利用这个后门。

> 记住：只能在确保安全（比如这里的`Showdown`）的情况下使用它。

## 数据模型钩子

目前为止，我们是把评论直接插入源代码里面的。现在让我们把一些JSON数据渲染到评论列表里。从最终来看，这些数据来自于后端，但现在我们可以把它写进源码里：

{% highlight js %}
// tutorial8.js
var data = [
    {author: "Pete Hunt", text: "This is one comment"},
    {author: "Jordan Walke", text: "This is *another* comment"}
];
{% endhighlight %}

我们需要用一种模块化的方式，将这个数据传递给`CommentList`。修改`CommentBox`和`React.render()`，通过`props`把数据传递给`CommentList`：

{% highlight js %}
// tutorial9.js
var CommentBox = React.createClass({
    render: function() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.props.data} />
                <CommentForm />
            </div>
        );
    }
});

React.render(
    <CommentBox data={data} />,
    document.getElementById('content')
);
{% endhighlight %}

现在我们可以在`CommentList`里读取这些数据，并渲染它们：

{% highlight js %}
// tutorial10.js
var CommentList = React.createClass({
    render: function() {
        var commentNodes = this.props.data.map(function (comment) {
            return (
                <Comment author={comment.author}>
                    {comment.text}
                </Comment>
            );
        });
        return (
            <div className="commentList">
                {commentNodes}
            </div>
        );
    }
});
{% endhighlight %}

就是这样。

## 从服务端获取数据

让我们把硬编码的数据替换成来自服务端的数据。移除掉`data`，取而代之的是一个用来获取数据的URL：

{% highlight js %}
// tutorial11.js
React.render(
    <CommentBox url="comments.json" />,
    document.getElementById('content')
);
{% endhighlight %}

这个组件和它之前有所不同，它必须重新渲染，因为在后端返回请求之前，它不会有任何数据。

## 响应的state

到目前为止，每个组件都通过各自的`props`来渲染。`props`是不可变的：它们从父组件传递给子组件，被父组件所“拥有”。为了实现交互，我们给组件引入了可变的`state`。`this.state`是组件私有的，可以通过调用`this.setState()`来改变。当状态更新的时候，组件将会重新渲染。

`render()`这个方法被设计成`this.props`和`this.state`的功能。React保证了UI始终与输入保持一致。

从服务端取来数据时，我们将改变现有的评论数据。我们先给`CommentBox`添加一个存储评论数据的数组作为它的`state`：

{% highlight js %}
// tutorial12.js
var CommentBox = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    render: function() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data} />
                <CommentForm />
            </div>
        );
    }
});
{% endhighlight %}

`getInitialState()`在组件的生命周期里只执行一次，它设置了组件的初始状态。

## 更新状态

当组件第一次渲染的时候，我们想从服务端获取JSON来更新状态，以反映最新数据。在一个真实的应用中，这是一个动态的过程，但为了简化教程，我们在这里将使用一个静态的JSON文件：

{% highlight js %}
// tutorial13.json
[
    {"author": "Pete Hunt", "text": "This is one comment"},
    {"author": "Jordan Walke", "text": "This is *another* comment"}
]
{% endhighlight %}

我们使用jQuery来发起异步请求。

> 注意：由于这个应用涉及到AJAX，你需要用到服务器来开发应用。上面有提到，我们[在Github上][6]已经提供了几种你可以使用的服务器，它们提供了你在这个教程中需要用到的功能。

{% highlight js %}
// tutorial13.js
var CommentBox = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    render: function() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data} />
                <CommentForm />
            </div>
        );
    }
});
{% endhighlight %}

当一个组件被渲染的时候，这里的`componentDidMount`方法将由React自动调用。动态更新的关键是`this.setState()`的调用。我们将旧数据替换为从后端返回的新数据，UI自动更新。由于这种动态性，我们只需要一点点改变来使它实时更新。在这里我们使用简单的轮询，当然你也可以WebSockets或其他技术。

{% highlight js %}
// tutorial14.js
var CommentBox = React.createClass({
    loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data} />
                <CommentForm />
            </div>
        );
    }
});

React.render(
    <CommentBox url="comments.json" pollInterval={2000} />,
    document.getElementById('content')
);
{% endhighlight %}

我们所做的就是将AJAX请求转移到一个单独的方法里去，然后在组件第一次渲染以及之后每隔2秒去调用它。试着在浏览器里运行并改变`comments.json`，2秒后，你将会看到奇迹。

## 添加新的评论

现在是时候创建表单了。我们的`CommentForm`组件应该让用户输入他们的名字以及评论内容，并发送一个请求到服务器将评论保存起来。

{% highlight js %}
// tutorial15.js
var CommentForm = React.createClass({
    render: function() {
        return (
            <form className="commentForm">
                <input type="text" placeholder="Your name" />
                <input type="text" placeholder="Say something..." />
                <input type="submit" value="Post" />
            </form>
        );
    }
});
{% endhighlight %}

让我们给表单添加一点交互。当一个用户提交表单的时候，我们应该清空表单内容，向服务器发送请求，还有刷新评论列表。首先，我们来监听表单的提交事件并清空它：

{% highlight js %}
// tutorial16.js
var CommentForm = React.createClass({
    handleSubmit: function(e) {
        e.preventDefault();
        var author = this.refs.author.getDOMNode().value.trim();
        var text = this.refs.text.getDOMNode().value.trim();
        if (!text || !author) {
            return;
        }
        // TODO: send request to the server
        this.refs.author.getDOMNode().value = '';
        this.refs.text.getDOMNode().value = '';
    },
    render: function() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Your name" ref="author" />
                <input type="text" placeholder="Say something..." ref="text" />
                <input type="submit" value="Post" />
            </form>
        );
    }
});
{% endhighlight %}

## 事件

React使用驼峰命名来给组件添加事件监听。我们给表单添加了`onSubmit`监听，当表单被提交的时候，清空表单。在这里通过调用`preventDefault()`来阻止浏览器的默认行为。

## Refs

我们使用`ref`属性给子组件分配一个名字，并通过`this.refs`来引用该组件。在一个组件上调用`getDOMNode()`来获得对应的原生的浏览器DOM元素。

## 作为props的回调

当用户提交评论的时候，我们需要刷新评论列表来包含最新的评论。这个逻辑的实现应该放在`CommentBox`里，因为`CommentBox`拥有代表评论列表的状态（`state`）。

我们需要反过来从子组件向父组件传递数据，可以在父组件的`render`方法里面给子组件传递一个回调（`handleCommentSubmit`），将这个回调绑定到子组件的`onCommentSubmit`事件。当事件被触发的时候，回调将被执行。

{% highlight js %}
// tutorial17.js
var CommentBox = React.createClass({
    loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    handleCommentSubmit: function(comment) {
        // TODO: submit to the server and refresh the list
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data} />
                <CommentForm onCommentSubmit={this.handleCommentSubmit} />
            </div>
        );
    }
});
{% endhighlight %}

当用户提交表单的时候，在`CommentForm`里面执行回调：

{% highlight js %}
// tutorial18.js
var CommentForm = React.createClass({
    handleSubmit: function(e) {
        e.preventDefault();
        var author = this.refs.author.getDOMNode().value.trim();
        var text = this.refs.text.getDOMNode().value.trim();
        if (!text || !author) {
            return;
        }
        this.props.onCommentSubmit({author: author, text: text});
        this.refs.author.getDOMNode().value = '';
        this.refs.text.getDOMNode().value = '';
    },
    render: function() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Your name" ref="author" />
                <input type="text" placeholder="Say something..." ref="text" />
                <input type="submit" value="Post" />
            </form>
        );
    }
});
{% endhighlight %}

至此，我们需要做的就是向服务器提交数据并刷新评论列表：

{% highlight js %}
// tutorial19.js
var CommentBox = React.createClass({
    loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    handleCommentSubmit: function(comment) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data} />
                <CommentForm onCommentSubmit={this.handleCommentSubmit} />
            </div>
        );
    }
});
{% endhighlight %}

## 优化：实时更新

看起来我们的应用算是完成了。不过它看起来有点慢，因为必须要等到服务器返回请求的时候，你的评论才会出现在列表中。向服务器提交新评论之前，我们可以将它实时添加到评论列表中，这样我们的应用看起来就快多了。如下：

{% highlight js %}
// tutorial20.js
var CommentBox = React.createClass({
    loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    handleCommentSubmit: function(comment) {
        var comments = this.state.data;
        var newComments = comments.concat([comment]);
        this.setState({data: newComments});
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data} />
                <CommentForm onCommentSubmit={this.handleCommentSubmit} />
            </div>
        );
    }
});
{% endhighlight %}

收工。

  [1]: http://facebook.github.io/react/docs/tutorial.html
  [2]: https://github.com/reactjs/react-tutorial
  [3]: https://github.com/reactjs/react-tutorial/
  [4]: https://github.com/reactjs/react-tutorial/archive/master.zip
  [5]: http://facebook.github.io/react/docs/jsx-in-depth.html
  [6]: https://github.com/reactjs/react-tutorial/
