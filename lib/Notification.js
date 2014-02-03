var Proto = require("./Proto");
var Notification = Proto.clone().newSlots({
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
			observation.observer().perform(messageName, self.clone().setObservation(observation));
		});
		return this;
	}
})

module.exports = Notification;