var Proto_constructor = new Function;

Object.clone = function(obj)
{
	Proto_constructor.prototype = obj;
	return new Proto_constructor;
},

Object.shallowCopy = function(obj)
{
	return Object.shallowCopyTo(obj, {});
},

Object.shallowCopyTo = function(fromObj, toObj)
{
	Object.eachSlot(fromObj, function(name){
		toObj[name] = fromObj[name];
	});

	return toObj;
},

Object.eachSlot = function(obj, fn)
{
	Object.getOwnPropertyNames(obj).forEach(function(name){
		fn(name, obj[name]);
	});
},

Object.lookupPath = function(obj, path)
{
	path = path.split(".");
	var pc;
	while (obj && (pc = path.shift()))
	{
		obj = obj[pc];
	}
	return obj;
},

Object.perform = function(obj, name)
{
	if (obj !== undefined && obj !== null && obj[name] && typeof(obj[name]) == 'function')
	{
		var args = Array.prototype.slice.call(arguments).slice(2);
		return obj[name].apply(obj, args);
	}
	else
	{
		return obj;
	}
}

//backwards compatibility
module.exports = {
  Object_clone: Object.clone,
  Object_shallowCopy: Object.shallowCopy,
  Object_shallowCopyTo: Object.shallowCopyTo,
  Object_eachSlot: Object.eachSlot,
  Object_lookupPath: Object.lookupPath,
  Object_perform: Object.perform
}