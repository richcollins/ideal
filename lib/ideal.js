[
	"Proto",
	"Array",
	"Number",
	"String",
	"Map",
	
	"Delegation",
	"Notification",
	"Observable",
	"Observation",
	"Serialization",
	"Deserialization"
].forEach(function(name){
	require(__dirname + "/" + name + ".js");
});