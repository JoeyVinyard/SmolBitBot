var tmi = require("tmi.js");

var db = require("./db");
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
var allowedLinkPosters = {}; //HashSet for permitted link posters
var commands = {};

console.log("Initializing firebase...");
db.init(config.fbConfig);
console.log("Done");

console.log("Initializing TMI...");
client.connect();
console.log("Done");

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
		chat(channel, "If I had mod, I would so delete that long ass message");
		//Purge user
		return;
	}
	if(settings.isLink.test(message) && !allowedLinkPosters[channel][user.username]){
		chat(channel, user["display-name"] + ", you are not allowed to post links without permission!");
		//Purge user
		return;
	}
	if(message.charAt(0) == '!'){
		var args = message.substring(1).toLowerCase().split(" ");
		var command = args[0];
		args.splice(0,1);
		switch(command){
			case "permit":
				var username = args[0];
				allowedLinkPosters[channel] = {};
				allowedLinkPosters[channel][username] = true; //Add user to hashset
				chat(channel, username + " is now permitted to post a link for " + settings.permitLinkTimeout + " seconds");
				setTimeout(removeFromPermitList, settings.getLinkTimeout(), username, channel); //Remove user from allowed posting list after timeout
				break;
			case "command":
				var arg = args[0];
				args.splice(0,1);
				switch(arg){
					case "add":
						addCommand(args, channel);
					break;
				}
				break;
		}
	}
}

function addCommand(args, channel){
	var command = args[0];
	var cooldown = 0;
	var userlevel = "all"

	if(command == null){
		chat("Error adding command, command not specified");
		return;
	}

	args.splice(0,1);
	
	if(args[0].startsWith("-cd=")){
		cooldown = parseInt(flagToValue(args[0]));
	}else if(args[0].startsWith("-ul=")){
		userlevel = flagToValue(args[0]);
	}

	args.splice(0,1);

	if(args[0].startsWith("-cd=")){
		cooldown = parseInt(flagToValue(args[0]));
	}else if(args[0].startsWith("-ul=")){
		userlevel = flagToValue(args[0]);
	}

	args.splice(0,1);
	var response = args.join(" ");
	db.addCommand(channel.substring(1), command, response, cooldown, userlevel).then(function(){
		chat(channel, "Command: '" + command + "' successfully added!");
	}).catch(function(){
		chat(channel, "Error adding command");
	})
}

function flagToValue(flag){
	return flag.substring(flag.indexOf('=')+1);
}

function chat(channel, message){
	client.say(channel, message);
}

function removeFromPermitList(username, channel){
	console.log(allowedLinkPosters);
	console.log(username, "is no longer permitted to post links");
	delete allowedLinkPosters[channel][username];
}