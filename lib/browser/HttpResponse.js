var Proto = require("../Proto");
var HttpResponse = Proto.clone().newSlots({
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
module.exports = HttpResponse;