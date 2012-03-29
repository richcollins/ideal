(function(){
	"use strict";
	if (typeof(module) != "undefined")
	{
		var ideal = module.parent.exports;
	}
	
	ideal.Deserialization = ideal.Proto.clone().newSlots({
		type: "ideal.Deserialization",
		serializedString: null,
		serializedMap: null,
		deserializedMap: null
	}).setSlots({
		rootObject: function()
		{
			this.setSerializedMap(JSON.parse(this.serializedString()));

			var deserializedMap = {};
			this.setDeserializedMap(deserializedMap);

			this.deserialize(0);
			return deserializedMap[0];
		},

		deserialize: function(key)
		{
			var deserializedMap = this.deserializedMap();
			var object = deserializedMap[key];
			if (object === undefined)
			{
				var objectMap = this.serializedMap()[key];
				if (!objectMap.deserializer)
				{
					console.log(objectMap);
				}
				var deserializer = ideal.Object_lookupPath(window, objectMap.deserializer);
				deserializer.deserializeMapUsing(objectMap, this);
				return this.deserialize(key);
			}
			else
			{
				return object;
			}
		},

		atPutObject: function(key, obj)
		{
			this.deserializedMap()[key] = obj;
			return this;
		},

		deserializeMapUsing: function(objectMap, deserialization)
		{
			var obj = objectMap.data;
			deserialization.atPutObject(objectMap.key, obj);
			ideal.Object_eachSlot(objectMap.slots, function(slotName, objectKey){
				obj[slotName] = deserialization.deserialize(objectKey);
			});
		}
	});

	ideal.Proto.setSlots({
		deserializeMapUsing: function(objectMap, deserialization)
		{
			var obj = this.clone();
			deserialization.atPutObject(objectMap.key, obj);

			ideal.Object_eachSlot(objectMap.slots, function(slotName, objectKey){
				var setter = "set" + slotName.capitalized(); 
				if (obj.canPerform(setter))
				{
					obj.perform(setter, deserialization.deserialize(objectKey));
				}
				else
				{
					obj.newSlot(slotName, deserialization.deserialize(objectKey)); //in case the proto didn't have a type.  bad idea?
				}
			});

			obj.perform("didDeserialize");
		}
	});

	String.prototype.asDeserialized = function()
	{
		return ideal.Deserialization.setSerializedString(this).rootObject();
	}

	Array.deserializeMapUsing = function(objectMap, deserialization)
	{
		var obj = [];
		deserialization.atPutObject(objectMap.key, obj);
		objectMap.data.forEach(function(key){
			obj.push(deserialization.deserialize(key));
		});
	}

	Date.deserializeMapUsing = function(objectMap, deserialization)
	{
		deserialization.atPutObject(objectMap.key, new Date(objectMap.data));
	}

	Number.deserializeMapUsing = function(objectMap, deserialization)
	{
		deserialization.atPutObject(objectMap.key, objectMap.data);
	}

	String.deserializeMapUsing = function(objectMap, deserialization)
	{
		deserialization.atPutObject(objectMap.key, objectMap.data);
	}
})();