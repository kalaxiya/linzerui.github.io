---
layout: post
title: "配置webpack-dev-server"
date:   2015-04-29 22:22:51
categories: posts
tags: react
---
写`react`，听说`webpack`比`browserify`更配~不过用`webpack`打包`react`时，每次修改组件都要编译一次，然后手动刷新浏览器，这简直是种折磨。

现在，让`react-hot-loader`这样的神器来解救你吧：[http://gaearon.github.io/react-hot-loader/][1]

<!-- more -->

`react-hot-loader`是`webpack`的一个`loader`，它可以在你修改组件时，实时刷新页面，无需手动。**更重要的是，在这个过程中，`state`和`props`都维持不变。**想想真有点小激动。由于刚接触`webpack`，而且官方文档看起来好费力，结果为了让这个东西跑起来，折腾了一天。

这是我测试的目录结构：
![目录结构][2]

为了让`react-hot-loader`跑起来，需要安装的依赖有`path`，`webpack-dev-server`，当然还要把`webpack`和`react-hot-loader`装进来。

首先，看看`webpack.config.js`需要配置哪些东西：

{% highlight js %}
var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: [
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/only-dev-server',
        './js/main'
    ],
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'bundle.js',
        publicPath: '/build_/'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    resolve: {
        extensions: ['', '.js']
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loaders: ['react-hot', 'jsx-loader?harmony'],
            include: path.join(__dirname, 'js')
        }]
    }
};
{% endhighlight %}

注意到`entry`这里，指定了本地的地址是`http://localhost:3000`，后面将通过这个地址访问我们的应用。`./js/main`则是我的入口文件，路径是相于`webpack.config.js`的，可以对照上面我的目录结构。

`output`的`path`指定了编译后的文件存放路径是`build/`，可以对照上面我的目录结构。

`filename`指定编译后的文件名为`bundle.js`。

`publicPath`指定了通过`http://localhost:3000`访问时，`bundle.js`的路径，为`build_/`。**也就是说，我们需要在`index.html`文件中这样引入目标文件`<script src="build_/bundle.js"></script>`**

> 这里需要注意的是，`build_`这个目录实际上是不会生成的。可以看看我上面的目录结构，并不存在`build_`这个文件夹。也就是说，当我们最后想上线代码时，需要把`<script>`引用的地址修改为`build/bundle.js`。你也许会问：可以把`publicPath`指定为`build`吗（也就是和编译后的文件路径一样）？答案是可以的。这样也就无需更改`index.html`中引用的路径了。还有一点需要注意的，`react-hot-loader`在运行的过程中，虽然你能实时看到你作出的修改，但是`build/bundle.js`这个文件却不会实时更新，所以，当你要上线代码时，你还需要运行一遍`webpack`编译一次，这样`build/bundle.js`才是最新的。

我们还需要引入`HotModuleReplacementPlugin`这个插件，别忘了在`webpack.config.js`顶部`require('webpack')`。另外，`NoErrorsPlugin`这个插件是可选的，它的作用是，当编译报错时，不会刷新页面，但会在控制台中提示错误信息。

`resolve`让我们可以使用`require('react')`这样的方式代替`require('react.js')`，因为这里指定了`.js`后缀。

`module`指定我们需要的`loader`。我们需要告诉`webpack`使用`react-hot-loader`。在我的例子中，我还使用了`jsx-loader`，这是用来编译`jsx`的。我为了能使用`es6`的语法，带上了`?harmony`这个参数。这里的`include`指定了要应用`loader`的文件路径，在我的例子中是`js/`。

以上便是`webpack.config.js`的内容，但还没有结束。我们还需要一个服务器`WebpackDevServer`。这里有一个现成的：https://github.com/gaearon/react-hot-boilerplate/blob/master/server.js

其实在我的例子中，用的正是上面那个`server.js`，存放在根目录中，可以看看上面我的目录结构图。进行到这里，看起来像是结束了。于是我命令行切换到测试目录，`node server.js`走一个。报错……

接着就是一顿排查，查到最后才发现是我的`hosts`中`127.0.0.1 localhost`被注释掉了……把注释去掉，再运行一次，终于成功了。

打开`http://localhost:3000/`，试着修改组件，然后奇迹便发生了。

搞定了这个，接下来还要研究下`webpack`代码分割的功能。另外，还要试着将`gulp`加入工作流中。

  [1]: http://gaearon.github.io/react-hot-loader/
  [2]: /images/805213264.png
