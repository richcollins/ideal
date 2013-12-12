var Proto = require("./Proto");
var Observation = require("./Observation");
var Notification = require("./Notification");

var Observable = Proto.clone().newSlots({
	type: "ideal.Observable",
	observations: [],
	observedSlots: []
}).setSlots({
	init: function()
	{
		this.setObservations([]);
		//this.initObservedSlots();
	},

	initObservedSlots: function()
	{
		var self = this;
		this.observedSlots().forEach(function(slotName){
			self.initObservedSlot(slotName);
		});
	},

	initObservedSlot: function(slotName)
	{
		var self = this;
		var v = self.perform(slotName);
		this.perform("set" + slotName.capitalized(), Object.perform(v, "clone"));
		this.mySlotChanged(slotName, v, v);
	},

	observedSlots: function()
	{
		if (!this.ownsSlot("_observedSlots"))
		{
			this.setObservedSlots(this._observedSlots.copy());
		}
		return this._observedSlots;
	},

	mySlotChanged: function(slotName, oldValue, newValue)
	{
		Proto.mySlotChanged.apply(this, arguments);

		if (this.observedSlots().contains(slotName))
		{
			this.sendNotification("slotChanged", Proto.clone().newSlots({
				slotName: slotName,
				oldValue: oldValue,
				newValue: newValue
			}));

			var prefix = "child";
			Object.perform(oldValue, "removeObserverWithPrefix", this, prefix);

			var observation = Object.perform(newValue, "addObserver", this);
			Object.perform(observation, "newSlot", "parentSlotName", slotName);
			Object.perform(observation, "setPrefix", prefix);
		}
	},

	childSlotChanged: function(msg)
	{
		var slotName = msg.observation().parentSlotName();
		var value = this.perform(slotName);

		this.mySlotChanged(slotName, value, value);
	},

	addObserver: function(observer) //returns an observation not self
	{
		var observation = Observation.clone().setObserved(this).setObserver(observer).setPrefix(this.type().split(".").last().uncapitalized());
		this.observations().append(observation);
		return observation;
	},

	removeObserver: function(observer)
	{
//console.log(this.type() + "." + this.uniqueId(), "removeObserver", observer.type() + "." + observer.uniqueId());
		this.setObservations(this.observations().filter(function(observation){
			return observation.observer() != observer;
		}));
		return this;
	},

	removeObserverWithPrefix: function(observer, prefix)
	{
		this.setObservations(this.observations().filter(function(observation){
			return((observation.observer() != observer) || (observation.prefix() != prefix));
		}));
		return this;
	},

	removeAllObservers: function()
	{
		this.observations().empty();
		return this;
	},

	newNotification: function(name)
	{
		return Notification.clone().setName(name).setSender(this);
	},

	sendNotification: function(name, data)
	{

		this.newNotification(name).setData(data || null).send();
		return this;
	},

	on: function(notificationName, callback)
	{
		this.addObserver(Proto.clone().setSlot(notificationName, function(msg){
			msg.sender().removeObserver(this);
			callback(msg);
		})).setPrefix(null);

		return this;
	},
	
	cancel: function()
	{
		this.removeAllObservers();
		return this;
	}
});

module.exports = Observable;