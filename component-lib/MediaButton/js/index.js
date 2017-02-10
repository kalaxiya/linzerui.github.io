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
        var dataMediaLinks = $root.attr('data-links').replace(/\s/g, '')

        var param = utils.getParams()[dataParam] || ''
        if (!param) {
            $root.hide()
            return
        }

        var matched = dataMediaLinks.match(new RegExp('name\\|' + param + ',.+?(?=~~)'))
        var link

        if (matched) {
            link = matched[0].match(/link\|.+?$/)[0].split('|')[1]
            $root.attr('href', link)

            return
        }

        $root.hide()
    }
})
