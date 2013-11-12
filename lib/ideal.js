[
	"Proto",
	"Object",
	"Array",
	"Number",
	"String",
	"Map",
	"Function",
	
	"Delegation",
	"Notification",
	"Observable",
	"Observation",
	"Serialization",
	"Deserialization"
].forEach(function(name){
	require(__dirname + "/" + name + ".js");
});