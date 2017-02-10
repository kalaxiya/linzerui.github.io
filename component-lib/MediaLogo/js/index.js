define(['jquery', 'common/utils'], function($, utils) {
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
        var dataParam = $root.attr('data-param')
        var dataLogo = $root.attr('data-logo').replace(/\s/g, '')

        var param = utils.getParams()[dataParam] || ''
        if (!param) {
            $root.hide()
            return
        }

        var matched = dataLogo.match(new RegExp('name\\|' + param + ',.+?(?=~~)'))
        var link
        var image

        if (matched) {
            link = matched[0].match(/link\|.+?(?=,)/)[0].split('|')[1]
            image = matched[0].match(/image\|.+?$/)[0].split('|')[1]

            $root.attr('href', link)
            $root.css('visibility', 'visible')
            $root.find('img').attr('src', image)

            return
        }

        $root.hide()
    }
})
