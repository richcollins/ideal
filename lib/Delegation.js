var Proto = require("./Proto");
Proto.setSlots({
	toSlotDelegateMessages: function(slotName, messageMapping)
	{
		var self = this;
		Object.eachSlot(messageMapping, function(name, value){
			self[name] = function()
			{
				var delegate = this.perform(slotName);
				return delegate.performWithArgList(value, arguments);
			}
		});
		return this;
	},

	toSlotDelegateSlots: function(slotName, delegatedSlotNames)
	{
		this.toSlotDelegateMessages(slotName, delegatedSlotNames.reduce(function(messageMapping, delegatedSlotName){
			messageMapping[delegatedSlotName] = delegatedSlotName;
			messageMapping["set" + delegatedSlotName.capitalized()] = "set" + delegatedSlotName.capitalized();
			return messageMapping;
		}, {}));
		return this;
	},

	toSlotsDelegateSlots: function(mapping)
	{
		var self = this;
		Object.eachSlot(mapping, function(slotName, delegatedSlotNames){
			self.toSlotDelegateSlots(slotName, delegatedSlotNames);
		});
		return this;
	}
});