var tmi = require("tmi.js");
var config = require("./config");
var settings = require("./settings");

var options = {
	options: {
		debug: true
	},
	connection: {
		reconnect: true
	},
	identity: {
		username: config.username,
		password: config.oAuth
	},
	channels: [settings.channel]
}

var client = new tmi.client(options);
client.connect();

var allowedLinkPosters = {}; //HashSet for permitted link posters

client.on("connected", function(address, port){
	// client.say("nanopierogi", "I am here! Ping me!");
})
client.on("chat", function(channel, user, message, self){
	if(self)//Ignore if the bot sent this message
		return;
	parseMessage(channel, user, message);
})

function parseMessage(channel, user, message){
	if(message.length > settings.maxChatSize){
		chat("If I had mod, I would so delete that long ass message");
		return;
	}
	if(settings.isLink.test(message) && !allowedLinkPosters[user.username]){
		chat(user["display-name"] + ", you are not allowed to post links without permission!");
		return;
	}
	if(message.charAt(0) == '!'){
		var args = message.substring(1).toLowerCase().split(" ");
		var command = args[0];
		if(command=="ping"){
			client.say(settings.channel, "pong");
		}else if(command=="permit"){
			var username = args[1];
			allowedLinkPosters[username] = true; //Add user to hashset
			chat(username + " is now permitted to post a link for " + settings.permitLinkTimeout + " seconds");
			setTimeout(removeFromPermitList, settings.getLinkTimeout(), username); //Remove user from allowed posting list after timeout
		}
	}
}

function chat(message){
	client.say(settings.channel, message);
}

function removeFromPermitList(username){
	console.log(username, "is no longer permitted to post links");
	delete allowedLinkPosters[username];
}