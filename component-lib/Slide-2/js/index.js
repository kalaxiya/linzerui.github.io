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

        var $imageList = $(__('.images li'))
        var $dot = $(__('.dot span'))

        var count = $imageList.length

        var currentIndex = 0
        var prevIndex = count - 1

        var locked = false
        var timer = null

        if (count < 2) {
            return
        }

        $(document)
        .on('click', __('.prev'), function(e) {
            e.preventDefault()
            !locked && prev()
        })
        .on('click', __('.next'), function(e) {
            e.preventDefault()
            !locked && next()
        })

        $(__('.root')).on('mouseenter', function(e) {
            if (timer) {
                clearInterval(timer)
                timer = null
            }
        }).on('mouseleave', function(e) {
            if (!timer) {
                timer = setInterval(next, 3 * 1000)
            }
        })

        timer = setInterval(next, 3 * 1000)

        function prev() {
            prevIndex = currentIndex
            currentIndex --

            if (currentIndex < 0) {
                currentIndex = count - 1
            }

            toggle('prev')
        }

        function next() {
            prevIndex = currentIndex
            currentIndex ++

            if (currentIndex === count) {
                currentIndex = 0
            }

            toggle('next')
        }

        //
        var toRightCls = __('prev to-right')
        var toLeftCls = __('prev to-left')
        var fromRightCls = __('active from-right')
        var fromLeftCls = __('active from-left')

        function toggle(dir) {
            locked = true
            setTimeout(function() {
                locked = false
            }, 800)

            $imageList.removeClass()
            $dot.removeClass().eq(currentIndex).addClass(__('active'))

            $imageList.eq(prevIndex)
                .addClass(dir === 'prev' ? toRightCls : toLeftCls)

            $imageList.eq(currentIndex)
                .addClass(dir === 'prev' ? fromLeftCls : fromRightCls)
        }
    }
})
