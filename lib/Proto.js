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
	
	var Proto_constructor = new Function;
	
	var Object_clone = function(obj)
	{
		Proto_constructor.prototype = obj;
		return new Proto_constructor;
	}
	
	ideal.Object_clone = Object_clone;

	ideal.Object_shallowCopy = function(obj)
	{
		return ideal.Object_shallowCopyTo(obj, {});
	}
	
	ideal.Object_shallowCopyTo = function(fromObj, toObj)
	{
		ideal.Object_eachSlot(fromObj, function(name){
			toObj[name] = fromObj[name];
		});
		
		return toObj;
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

	ideal.Proto.setSlots = function(slots)
	{
		var self = this;
		ideal.Object_eachSlot(slots, function(name, initialValue){
			self.setSlot(name, initialValue);
		});
		return this;
	}
	
	var uniqueIdCounter = 0;

	var Object_hasProto = (Object.prototype.__proto__ !== undefined);
	
	ideal.Proto.setSlots({
		clone: function()
		{
			var obj = Object_clone(this);
			if (!Object_hasProto)
			{
				obj.__proto__ = this;
			}
			obj._uniqueId = ++ uniqueIdCounter;
			obj.init();

			return obj;
		},
		
		withSets: function(sets)
		{
			return this.clone().performSets(sets);
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
				this[privateName] = newValue;
				//return this.updateSlot(name, newValue);
				return this;
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
				//this.mySlotChanged(name, oldValue, newValue);
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
		
		performSet: function(name, value)
		{
			return this.perform("set" + name.capitalized(), value);
		},
		
		performSets: function(slots)
		{
			var self = this;
			ideal.Object_eachSlot(slots, function(name, value){
				self.perform("set" + name.capitalized(), value);
			});

			return this;
		}
	});

	ideal.Proto.toString = function()
	{
		return this.type() + "." + this.uniqueId();
	}

	ideal.Proto.newSlot("type", "ideal.Proto");
})();