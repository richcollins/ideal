(function(){
	"use strict";
	if (typeof(module) != "undefined")
	{
		var ideal = module.parent.exports;
	}
	
	Function.prototype.forwardErrors = function(fn) {
	  var self = this;
	  return function() {
	    var e = arguments[0];
	    if (e) {
	      self(e);
	    } else {
	      fn.apply(null, Array.prototype.slice.call(arguments, 1));
	    }
	  }
	}
})();