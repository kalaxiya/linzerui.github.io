define(['jquery'], function($) {
    return function(rootId) {
        function __(selector) {
            if (!rootId) {
                return selector
            }

            if (selector.indexOf('.') < 0 && selector.indexOf('#') < 0) {
                return $.map(selector.split(' '), function(clsOrId) {
                    return rootId + clsOrId
                }).join(' ')
            }

            return selector.replace(/(\.|#)/g, function(matched, p1) {
                return p1 + rootId
            })
        }

        // 你的代码

        var $root = $(__('.root'))
        var $nav = $(__('.navigator li'))
        var $figures = $(__('.figure li'))
        var $text = $(__('.text li'))
        var currentCls = __('current')
        var currentIndex = 0
        var size = $nav.length
        var timer = null

        $root.on('mouseover', function() {
            timer && clearInterval(timer)
        }).on('mouseout', function() {
            timer = setInterval(next, 3000)
        })

        $nav.on('mouseenter', function(e) {
            currentIndex = $nav.index(this)
            change()
        })

        timer = setInterval(next, 3000)

        function next() {
            currentIndex ++

            if (currentIndex >= size) {
                currentIndex = 0
            }

            change()
        }

        function change() {
            $nav.removeClass(currentCls).eq(currentIndex).addClass(currentCls)
            $figures.removeClass(currentCls).eq(currentIndex).addClass(currentCls)
            $text.removeClass(currentCls).eq(currentIndex).addClass(currentCls)
        }
    }
})
