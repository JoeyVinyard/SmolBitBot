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
		username: config.username,
		password: config.oAuth
	},
	channels: [config.channel]
}

var client = new tmi.client(options);
client.connect();

client.on("connected", function(address, port){
	// client.say("nanopierogi", "I am here! Ping me!");
})
client.on("chat", function(channel, user, message, self){
	if(self)//Ignore if the bot sent this message
		return;
	parseMessage(channel, user, message);
})

function parseMessage(channel, user, message){
	if(message.charAt(0) == '!'){
		var args = message.substring(1).toLowerCase().split(" ");
		var command = args[0];
		if(command=="ping"){
			client.say(config.channel, "pong");
		}
	}
}