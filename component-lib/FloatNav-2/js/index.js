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
        var $window = $(window)
        var $bodyHtml = $('html, body')
        var $nav = $(__('.root li'))

        var positionArr = $.map($nav, function(dom) {
            return dom.getAttribute('data-position')
        })

        var scrollTimer = null

        var div = document.createElement('div')
        if (!('transform' in div.style) && !('webkitTransform' in div.style)) {
            $(__('.root'))[0].style.marginTop = -(40 * ($nav.length + 1) / 2) + 'px'
        }

        $(document)
        .on('click', __('.root li'), function(e) {
            e.preventDefault()

            var $this = $(this)

            var position = parseInt($this.attr('data-position'))
            if (isNaN(position)) {
                position = 0
            }

            $bodyHtml.animate({
                scrollTop: position
            }, 400)
        })
        .on('click', __('.top'), function(e) {
            e.preventDefault()

            $bodyHtml.animate({
                scrollTop: 0
            }, 400)
        })

        $window.on('scroll', function() {
            if (scrollTimer) {
                clearInterval(scrollTimer)
            }

            scrollTimer = setInterval(function() {
                var scrollTop = $window.scrollTop()

                var index = 0
                for (var i = 0, len = positionArr.length; i < len; i ++) {
                    if (positionArr[i] <= scrollTop) {
                        index = i
                    }
                }

                $nav.removeClass(__('active')).eq(index).addClass(__('active'))
            }, 100)
        })

        $window.trigger('scroll')
    }
})
