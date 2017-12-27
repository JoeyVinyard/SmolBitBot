var tmi = require("tmi.js");
var config = require("./config");

var options = {
	options: {
		debug: true
	},
	connection: {
		cluster: "aws",
		reconnect: true
	},
	identity: {
		username: "smolbitbot",
		password: config.oAuth
	},
	channels: ["nanopierogi"]
}

var client = new tmi.client(options);
client.connect();

// client.on("connected", function(address, port){
// 	client.say("nanopierogi", "I am here! Ping me!");
// })
// client.on("chat", function(channel, user, message, self){
// 	parseMessage(channel, user, message);
// })

// function parseMessage(channel, user, message){
// 	if(user.username == "smolbitbot")
// 		return;
// 	if(message == "ping"){
// 		client.say("nanopierogi", "pong");
// 	}
// }