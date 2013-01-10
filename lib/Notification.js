(function(){
	"use strict";
	if (typeof(module) != "undefined")
	{
		var ideal = module.parent.exports;
	}
	
	ideal.Notification = ideal.Proto.clone().newSlots({
		type: "ideal.Notification",
		name: null,
		sender: null,
		data: null,
		observation: null
	}).setSlots({
		send: function()
		{
			var name = this.name();
			var self = this;
			this.sender().observations().copy().forEach(function(observation){
				var messageName = observation.prefix() ? observation.prefix() + name.capitalized() : name;
				//console.log(messageName, observation.observer());
				observation.observer().perform(messageName, self.clone().setObservation(observation));
			});
			return this;
		}
	})
})();