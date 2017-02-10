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

    }
})
