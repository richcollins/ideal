//backwards compatibility
var o = require("./Object");
Object.shallowCopyTo(module.exports, o);
var Proto = require("./Proto");
require("./Array");
require("./Number");
require("./String");
var Map = require("./Map");
require("./Function");
require("./Delegation");
var Notification = require("./Notification");
var Observable = require("./Observable");
var Observation = require("./Observation");
var Serialization = require("./Serialization");
var Deserialization = require("./Deserialization");

module.exports = {
  Proto: Proto,
  Map: Map,
  map: Map.__map,
  Notification: Notification,
  Observable: Observable,
  Observation: Observation,
  Serialization: Serialization,
  Deserialization: Deserialization
}