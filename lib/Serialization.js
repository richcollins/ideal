(function(){
	"use strict";
	if (typeof(module) != "undefined")
	{
		var ideal = module.parent.exports;
	}
	
	ideal.Serialization = ideal.Proto.clone().newSlots({
		type: "ideal.Serialization",
		rootObject: null,
		objects: [],
		map: {}
	}).setSlots({
		keyForObject: function(object)
		{                          
			var objects = this.objects();
			var map = this.map();
			var key = objects.indexOf(object);
			if (key == -1)
			{
				objects.append(object);
				key = objects.size() - 1;

				if ((object !== null) && (object !== undefined) && object.asSerializedMap)
				{
					var serializedMap = object.asSerializedMap(this);
				}
				else
				{
					var serializedMap = this.objectAsSerializedMap(object);
				}

				serializedMap.key = key;
				map[key] = serializedMap;

				return key;
			}
			else
			{
				return key;
			}
		},

		objectAsSerializedMap: function(object)
		{
			var map = {
				deserializer: "ideal.Deserialization",
				data: {},
				slots: {}
			};

			if (object === null)
			{
				map.data = null;
			}
			else if (object === undefined)
			{
				console.warn("serializing undefined as null");
				map.data = null;
			}
			else if (object === true)
			{
				map.data = true;
			}
			else if (object === false)
			{
				map.data = false;
			}
			else
			{
				var slots = map.slots;
				var self = this;
				ideal.Object_eachSlot(object, function(name, obj){
					var k = self.keyForObject(obj);
					if (k !== null)
					{
						slots[name] = k;
					}

				});
			}
			return map;
		},

		setRootObject: function(rootObject)
		{
			this._rootObject = rootObject;
			this.setObjects([]);
			this.setMap({});
			this.keyForObject(rootObject);
			return this;
		},

		toJson: function()
		{
			return JSON.stringify(this.map());
		}
	});

	ideal.Proto.newSlots({
		serializedSlots: []
	}).setSlots({
		serializedSlots: function() //instead of patching init
		{
			if (!this.ownsSlot("_serializedSlots"))
			{
				this._serializedSlots = this._serializedSlots.copy(); //avoid mySlotChanged message
			}

			return this._serializedSlots;
		},

		addSerializedSlots: function(slotNames)
		{
			this.serializedSlots().appendItems(slotNames);
			return this;
		},

		asSerialized: function()
		{
			return ideal.Serialization.setRootObject(this).toJson();
		},

		willSerialize: function(){},
		didSerialize: function(){},

		asSerializedMap: function(serialization)
		{
			var slots = {};
			var self = this;

			this.willSerialize();
			this.serializedSlots().forEach(function(slotName){
				var obj = self.perform(slotName);
				var k = serialization.keyForObject(obj);
				if (k)
				{
					slots[slotName] = k;
				}
			});
			this.didSerialize();

			return {
				deserializer: this.type(),
				data: null,
				slots: slots
			};
		}
	});

	Array.prototype.asSerializedMap = function(serialization)
	{
		return {
			deserializer: "Array",
			data: this.map(function(item){
				var k = serialization.keyForObject(item);
				if (k)
				{
					return k;
				}
				else
				{
					return null;
				}
			}).filter(function(v){ return v !== null }),
			slots: {}
		};
	};

	Date.prototype.asSerializedMap = function(serialization)
	{
		return {
			deserializer: "Date",
			data: this.getTime(),
			slots: {}
		};
	}

	Number.prototype.asSerializedMap = function(serialization)
	{
		return {
			deserializer: "Number",
			data: this,
			slots: {}
		};
	}

	String.prototype.asSerializedMap = function(serialization)
	{
		return {
			deserializer: "String",
			data: this,
			slots: {}
		};
	}
})();