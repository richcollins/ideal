"use strict";
ideal.HttpResponse = ideal.Proto.clone().newSlots({
	type: "ideal.HttpResponse",
	body: null,
	statusCode: null
}).setSlots({
	isSuccess: function()
	{
		var sc = this.statusCode();
		return sc >= 200 && sc < 300;
	}
});
