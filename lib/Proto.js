if (typeof(module) != "undefined")
{
	var ideal = module.parent.exports;
}
else
{
	ideal = {};
}

(function(){
	"use strict";

	String.prototype.capitalized = function()
	{
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	};
	
	ideal.Proto_constructor = new Function;
	
	ideal.Object_clone = function(obj)
	{
		var constructor = ideal.Proto_constructor;
		constructor.prototype = obj;
		return new constructor;
	}

	ideal.Object_shallowCopy = function(obj)
	{
		return ideal.Object_shallowCopyTo(obj, {});
	}
	
	ideal.Object_shallowCopyTo = function(fromObj, toObj)
	{
		ideal.Object_eachSlot(fromObj, function(name){
			toObj[name] = fromObj[name];
		});
	}

	ideal.Object_eachSlot = function(obj, fn)
	{
		Object.getOwnPropertyNames(obj).forEach(function(name){
			fn(name, obj[name]);
		});
	}
	
	ideal.Object_lookupPath = function(obj, path)
	{
		path = path.split(".");
		var pc;
		while (obj && (pc = path.shift()))
		{
			obj = obj[pc];
		}
		return obj;
	}
	
	ideal.Object_perform = function(obj, name)
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

	ideal.Proto = new Object;

	ideal.Proto.setSlot = function(name, value)
	{
		this[name] = value;

		return this;
	};

	ideal.Proto.uniqueIdCounter = 0;

	ideal.Proto.setSlots = function(slots)
	{
		var self = this;
		ideal.Object_eachSlot(slots, function(name, initialValue){
			self.setSlot(name, initialValue);
		});
		return this;
	}

	ideal.Proto.setSlots({
		clone: function()
		{
			var obj = ideal.Object_clone(this);
			obj._proto = this;
			obj._uniqueId = ++ ideal.Proto.uniqueIdCounter;
			obj._applySuperMap = {};
			obj.init();

			return obj;
		},
		
		withSets: function(sets)
		{
			return this.clone().performSets(sets);
		},
		
		_applySuperMap: {},

		applySuper: function(messageName, args)
		{
			var applySuperMap = this._applySuperMap;
			lookupProto = applySuperMap[messageName] || this;

			if (!lookupProto._proto)
			{
				return undefined;
			}

			var proto = lookupProto._proto;

			var myFn = lookupProto[messageName];
			while(proto && (myFn == proto[messageName]))
			{
				proto = proto._proto;
			}

			var fn = proto[messageName];
			if (proto && fn && typeof(fn) == "function")
			{
				applySuperMap[messageName] = proto;
				try
				{
					return proto[messageName].apply(this, args); 
				}
				catch (e)
				{
					throw e;
				}
				finally
				{
					delete applySuperMap[messageName];
				}
			}
		},
		
		withSlots: function(slots)
		{
			return this.clone().setSlots(slots);
		},
		
		init: function(){},

		uniqueId: function()
		{
			return this._uniqueId;
		},

		proto: function()
		{
			return this._proto;
		},
		
		toString: function()
		{
			return this._type;
		},

		setSlotsIfAbsent: function(slots)
		{
			var self = this;
			ideal.Object_eachSlot(slots, function(name, value){
				if (!self[name])
				{
					self.setSlot(name, value);
				}
			});
			return this;
		},

		newSlot: function(name, initialValue)
		{
			if(typeof(name) != "string") throw "name must be a string";

			if(initialValue === undefined) { initialValue = null };

			var privateName = "_" + name;
			this[privateName] = initialValue;
			this[name] = function()
			{
				return this[privateName];
			}

			this["set" + name.capitalized()] = function(newValue)
			{
				return this.updateSlot(name, newValue);
			}
			return this;
		},
		
		updateSlot: function(name, newValue)
		{
			var privateName = "_" + name;
			
			var oldValue = this[privateName];
			if (oldValue != newValue)
			{
				this[privateName] = newValue;
				this.mySlotChanged(name, oldValue, newValue);
			}
			
			return this;
		},
		
		mySlotChanged: function(slotName, oldValue, newValue)
		{
			this.perform(slotName + "SlotChanged", oldValue, newValue);
		},
		
		ownsSlot: function(name)
		{
			return this.hasOwnProperty(name);
		},

		aliasSlot: function(slotName, aliasName)
		{
			this[aliasName] = this[slotName];
			this["set" + aliasName.capitalized()] = this["set" + slotName.capitalized()];
			return this;
		},

		argsAsArray: function(args)
		{
			return Array.prototype.slice.call(args);
		},

		newSlots: function(slots)
		{
			var self = this;
			ideal.Object_eachSlot(slots, function(slotName, initialValue){
				self.newSlot(slotName, initialValue);
			});
			
			return this;
		},

		canPerform: function(message)
		{
			return this[message] && typeof(this[message]) == "function";
		},

		performWithArgList: function(message, argList)
		{
			return this[message].apply(this, argList);
		},

		perform: function(message)
		{
			if (this[message] && this[message].apply)
			{
				return this[message].apply(this, this.argsAsArray(arguments).slice(1));
			}
			else
			{
				return this;
			}
		},

		setterNameForSlot: function(name)
		{
			return "set" + name.capitalized();
		},
		
		
		performSets: function(slots)
		{
			var self = this;
			ideal.Object_eachSlot(slots, function(name, value){
				self.perform("set" + name.capitalized(), value);
			});

			return this;
		},
		
		descendsFrom: function(proto)
		{
			if (!proto || !this._proto)
			{
				return false;
			}
			else if (this._proto == proto)
			{
				return true;
			}
			else
			{
				return this._proto.descendsFrom(proto);
			}
		}
	});

	ideal.Proto.toString = function()
	{
		return this.type() + "." + this.uniqueId();
	}

	ideal.Proto.newSlot("type", "ideal.Proto");
})();