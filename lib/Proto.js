String.prototype.capitalized = function()
{
	return this.replace(/\b[a-z]/g, function(match){
		return match.toUpperCase();
	});
};

var Proto = new Object;

Proto.setSlot = function(name, value)
{
	this[name] = value;

	return this;
};

Proto.setSlots = function(slots)
{
	var self = this;
	Object.eachSlot(slots, function(name, initialValue){
		self.setSlot(name, initialValue);
	});
	return this;
}

var uniqueIdCounter = 0;

var Object_hasProto = (Object.prototype.__proto__ !== undefined);
var Object_clone = Object.clone;

Proto.setSlots({
    extend: function() {
        var obj = Object_clone(this);
        if (!Object_hasProto) {
            obj.__proto__ = this;
        }
        obj._uniqueId = ++ uniqueIdCounter;
        return obj;
    },
    
    subclass: function() {
        console.warn("subclass is deprecated in favor of extend");
        return this.extend.call(this);
    },
  
	clone: function()
	{
		var obj = this.extend();
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
		Object.eachSlot(slots, function(name, value){
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

		this["addTo" + name.capitalized()] = function(amount)
		{
			this[privateName] = (this[privateName] || 0) + amount;
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
		Object.eachSlot(slots, function(slotName, initialValue){
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
		Object.eachSlot(slots, function(name, value){
			self.perform("set" + name.capitalized(), value);
		});

		return this;
	},

	performGets: function(slots)
	{
		var self = this;
		var object = {};
		slots.forEach(function(slot) {
			object[slot] = self.perform(slot);
		});

		return object;
	}
});

Proto.toString = function()
{
	return this.type() + "." + this.uniqueId();
}

Proto.newSlot("type", "ideal.Proto");

module.exports = Proto;
