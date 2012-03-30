(function(){
	"use strict";
	if (typeof(module) != "undefined")
	{
		var ideal = module.parent.exports;
	}
	
	ideal.Observable = ideal.Proto.clone().newSlots({
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
			this.perform("set" + slotName.capitalized(), ideal.Object_perform(v, "clone"));
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
			ideal.Proto.mySlotChanged.apply(this, arguments);

			if (this.observedSlots().contains(slotName))
			{
				this.sendNotification("slotChanged", ideal.Proto.clone().newSlots({
					slotName: slotName,
					oldValue: oldValue,
					newValue: newValue
				}));

				var prefix = "child";
				ideal.Object_perform(oldValue, "removeObserverWithPrefix", this, prefix);

				var observation = ideal.Object_perform(newValue, "addObserver", this);
				ideal.Object_perform(observation, "newSlot", "parentSlotName", slotName);
				ideal.Object_perform(observation, "setPrefix", prefix);
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
			var observation = ideal.Observation.clone().setObserved(this).setObserver(observer).setPrefix(this.type().split(".").last().uncapitalized());
			this.observations().append(observation);
			return observation;
		},

		removeObserver: function(observer)
		{
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
			return ideal.Notification.clone().setName(name).setSender(this);
		},

		sendNotification: function(name, data)
		{

			this.newNotification(name).setData(data || null).send();
			return this;
		},

		on: function(notificationName, callback)
		{
			this.addObserver(ideal.Proto.clone().setSlot(notificationName, callback)).setPrefix(null);

			return this;
		}
	});
})();