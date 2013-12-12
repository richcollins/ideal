var Proto = require("../Proto");
var Cookie = Proto.clone().newSlots({
	type: "ideal.Cookie",
	name: null,
	value: null,
	expirationDate: null,
	path: "/"
}).setSlots({
	cookieMap: function()
	{
		var map = {};
		
		document.cookie.split("; ").forEach(function(pair){
			var name = pair.before("=");
			var value = pair.after("=");
			map[name] = Cookie.clone().setName(name).setValue(unescape(value));
		});
		
		return map;
	},
	
	at: function(name)
	{
		return this.cookieMap()[name];
	},
	
	remove: function()
	{
		return this.setValue("").setExpirationDate(new Date(0)).save();
	},
	
	renewOneYear: function()
	{
		return this.setExpirationDate(new Date(new Date().getTime() + (1).years())).save();
	},
	
	toString: function()
	{
		var expires = this.expirationDate() ? this.expirationDate().toGMTString() : "";
		return this.name() + "=" + escape(this.value()) + "; expires=" + expires + "; path=" + this.path();
	},
	
	save: function()
	{
		document.cookie = this.toString();
		
		return this;
	}
});

module.exports = Cookie;