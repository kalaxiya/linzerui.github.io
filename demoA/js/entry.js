var scriptDep = {"tracker":["FloatNav-1","Tab-1","Slide-1","Slide-2"],"entities":{"FloatNav-1":["OB9RT0__"],"Tab-1":["OL7GY61__","OR6N139__"],"Slide-1":["O2HDJ65__","O5S2U75__"],"Slide-2":["OIW4W93__"]}}

require(["FloatNav-1/js/index","Tab-1/js/index","Slide-1/js/index","Slide-2/js/index"], function() {
  var args = arguments
  var depCount = args.length
  var i = 0

  for (; i < depCount; i ++) {
    var idCollection = scriptDep.entities[scriptDep.tracker[i]]
    each(idCollection, function(id, index) {
      args[i](id)
    })
  }
})

function each(arr, fn) {
  for (var i = 0, len = arr.length; i < len; i ++) {
    fn(arr[i], i)
  }
}
