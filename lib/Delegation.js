(function(){
	"use strict";
	if (typeof(module) != "undefined")
	{
		var ideal = module.parent.exports;
	}
	ideal.Proto.setSlots({
		toSlotDelegateMessages: function(slotName, messageMapping)
		{
			var self = this;
			ideal.Object_eachSlot(messageMapping, function(name, value){
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
				messageMapping["set" + delegatedSlotName.capitalized()] = "set" + delegatedSlotName.capitalized(); //TODO fix this
				return messageMapping;
			}, {}));
			return this;
		},

		toSlotsDelegateSlots: function(mapping)
		{
			var self = this;
			ideal.Object_eachSlot(mapping, function(slotName, delegatedSlotNames){
				self.toSlotDelegateSlots(slotName, delegatedSlotNames);
			});
			return this;
		}
	});
})();