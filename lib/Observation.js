var Proto = require("./Proto");
var Observation = Proto.clone().newSlots({
	type: "ideal.Observation",
	observed: null,
	observer: null,
	prefix: null
}).setSlots({
	setNotificationName: function(notificationName)
	{
		this.setLastNotificationName(this._notificationName);
		this._notificationName = notificationName;

		this.observed().observationChanged(this);

		return this;
	}
});

module.exports = Observation;