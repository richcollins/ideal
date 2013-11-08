(function(){
	"use strict";
	if (typeof(module) != "undefined")
	{
		var ideal = module.parent.exports;
	}
	
	Object.shallowCopy = ideal.Object_shallowCopy;
	Object.lookupPath = ideal.Object_lookupPath;
})();