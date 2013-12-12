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
//console.log(this.sender().type() + "." + this.sender().uniqueId(), name, this.sender().observations().map(function(o){ return o.type() + "." + o.uniqueId() }).join(", "));
		this.sender().observations().copy().forEach(function(observation){
			var messageName = observation.prefix() ? observation.prefix() + name.capitalized() : name;
			//console.log(messageName, observation.observer());
			observation.observer().perform(messageName, self.clone().setObservation(observation));
		});
		return this;
	}
})

module.exports = Notification;