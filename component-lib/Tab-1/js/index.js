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

        var $nav = $(__('.nav li'))
        var $section = $(__('.section'))
        var prevIndex = -1
        var currentIndex = 0

        toggle()

        $nav.on('mouseenter', function() {
            var itemIndex = +$nav.index(this)
            if (itemIndex === +currentIndex) {
                return
            }

            prevIndex = currentIndex
            currentIndex = itemIndex
            toggle()
        })

        function toggle() {
            $nav[currentIndex].style.backgroundImage = 'url(' + $nav[currentIndex].getAttribute('data-hover') + ')'

            if (prevIndex > -1) {
                $nav[prevIndex].style.backgroundImage = 'url(' + $nav[prevIndex].getAttribute('data-normal') + ')'
            }

            var targetSection = $section[currentIndex]

            if (!targetSection.style.backgroundImage) {
                var dataBg = targetSection.getAttribute('data-bg')

                if (dataBg && dataBg !== 'about:blank') {
                    targetSection.style.backgroundImage = 'url(' + dataBg + ')'
                }
            }

            $section.hide()
            targetSection.style.display = 'block'
        }
    }
})
