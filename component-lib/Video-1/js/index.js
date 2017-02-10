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
        var maskNode = document.createElement('div')
        var videoNode = document.createElement('div')
        var closeNode = document.createElement('a')
        var codeNode = document.createElement('div')

        maskNode.className = __('mask')
        videoNode.className = __('video')
        codeNode.className = __('code')
        closeNode.href = 'javascript:;'
        closeNode.className = __('close')

        videoNode.appendChild(closeNode)
        videoNode.appendChild(codeNode)

        document.body.appendChild(maskNode)
        document.body.appendChild(videoNode)

        $(__('.play')).on('click', function(e) {
            e.preventDefault()

            var $this = $(this)

            var videoSrc = $this.attr('data-src')
            var videoWidth = parseInt($this.attr('data-width'))
            var videoHeight = parseInt($this.attr('data-height'))

            if (
                !videoSrc ||
                !/^http:/.test(videoSrc) ||
                !/\.flv$/.test(videoSrc) ||
                isNaN(videoWidth) ||
                isNaN(videoHeight)
            ) {
                return
            }

            codeNode.innerHTML = '<embed width="100%" height="100%" title="视频鉴赏" wmode="transparent" src="http://ptres.37.com/swf/flvplayer.swf" allowfullscreen="true" flashvars="vcastr_file=' + videoSrc + '&ampIsAutoPlay=1" quality="high" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash">'

            videoNode.style.margin = -videoHeight / 2 + 'px' + ' 0 0 ' + -videoWidth / 2 + 'px'
            codeNode.style.width = videoWidth + 'px'
            codeNode.style.height = videoHeight + 'px'

            maskNode.style.display = 'block'
            videoNode.style.display = 'block'
        })

        $(__('.close')).on('click', function(e) {
            e.preventDefault()

            maskNode.style.display = 'none'
            videoNode.style.display = 'none'
            codeNode.innerHTML = ''
        })
    }
})
