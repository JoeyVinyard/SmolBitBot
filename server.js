var tmi = require("tmi.js");
var urlRegex = require('url-regex');

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
	channels: []
}

var client = new tmi.client(options);
var allowedLinkPosters = {}; //HashSet for permitted link posters
var commands = {};
var connectedChannels = {};

console.log("Initializing firebase...");
db.init(config.fbConfig);
console.log("Done");

console.log("Initializing TMI...");
client.connect();
console.log("Done");

client.on("connected", function(address, port){
	console.log("Successfully conntected to Twitch IRC");
	db.fetchChannels().then((channels) => {
		connectedChannels = channels.val();
		channels.forEach((ch) => {
			client.join(ch.key);
			allowedLinkPosters[ch.key] = {};
		});
	}).catch((err) => {
		console.log("Unable to fetch channels", err);
	})
	db.fetchAllCommands().then((cmds) => {
		console.log(cmds.val());
		commands = cmds.val();
		if(commands == null)
			commands = {};
	}).catch((err) => {
		console.log("~Error~", err);
	});
})
client.on("chat", function(channel, user, message, self){
	channel = channel.substring(1);
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
	if(urlRegex({strict: false}).test(message) && !canPostLink(channel, user)){
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
				// if(!user.isMod)
				// 	return;
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
					case undefined:
						//List commands
						break;
					case "add":
						addCommand(args, channel);
					break;
				}
				break;
			default:
				if(!commandExists(channel, command))
					return;
				var cmd = commands[channel][command];
				if(!!cmd.usable || cmd.timeout == 0 || cmd.usable == null){
					chat(channel, cmd.response);
					if(cmd.timeout != 0){
						cmd.usable=false;
						setTimeout(function(){
							try{
								commands[channel][command].usable=true;
							}catch(err){}
						}, cmd.timeout*1000);
					}
				}
			break;
		}
	}
}

function addCommand(args, channel){
	var command = args[0];
	var cooldown = 0;
	var userlevel = "all"
	var response;

	if(command == null){
		chat("Error adding command, command not specified");
		return;
	}

	args.splice(0,1);

	if(args[0].startsWith("-cd=")){
		cooldown = parseInt(flagToValue(args[0]));
		args.splice(0,1);
		if(args[0].startsWith("-ul=")){
			userlevel = flagToValue(args[0]);
			args.splice(0,1);
		}else{
			response = args.join(" ");
		}
	}else if(args[0].startsWith("-ul=")){
		userlevel = flagToValue(args[0]);
		args.splice(0,1);
		if(args[0].startsWith("-cd=")){
			cooldown = flagToValue(args[0]);
			args.splice(0,1);
		}else{
			response = args.join(" ");
		}
	}
	if(!response){
		response = args.join(" ");
	}

	if(commands[channel]==null){
		commands[channel] = {};
	}

	if(commandExists(channel, command)){
		chat(channel, "Error, command already exists");
		return;
	}

	db.addCommand(channel, command, response, cooldown, userlevel).then(function(){
		chat(channel, "Command: '" + command + "' successfully added!");
		db.fetchCommandsByChannel(channel).then((cmds) => {
			commands[channel] = cmds.val();
		})
	}).catch(function(err){
		chat(channel, "Error adding command");
	})
}

function commandExists(channel, command){
	if(commands == null || commands[channel] == null)
		return false;
	return !!commands[channel][command];
}

function flagToValue(flag){
	return flag.substring(flag.indexOf('=')+1);
}

function chat(channel, message){
	client.say(channel, message);
}

function removeFromPermitList(username, channel){
	console.log(username, "is no longer permitted to post links");
	delete allowedLinkPosters[channel][username];
}

function getUserPermLevel(channel, user){
	if(isOwner(user)){
		// console.log("owner");
		return 5;
	}
	else if(isTwitchStaff(user)){
		// console.log("staff");
		return 4;
	}
	else if(isMod(user)){
		// console.log("mod");
		return 3;
	}
	else if(isSub(user)){
		// console.log("sub");
		return 2;
	}
	else if(isRegular(channel, user)){
		// console.log("regular");
		return 1;
	}
		// console.log("nobody");
	return 0;
}

function canPostLink(channel, user){
	var perm = getUserPermLevel(channel, user) >= getChannelPerm(channel, "linkPosting");
	return (perm || !allowedLinkPosters[channel][user.username]);
}

function getChannelPerm(channel, perm){
	return connectedChannels[channel][perm];
}

function isOwner(user){
	try{
		return !!user.badges.broadcaster;
	}catch(err){
		return false;
	}
}

function isTwitchStaff(user){
	return (user["user-type"] == "admin"||user["user-type"] == "global_mod"||user["user-type"] == "staff");
}

function isMod(user){
	return !!user.mod;
}

function isSub(user){
	return !!user.subscriber;
}

function isRegular(channel, user){
	return false;//Implement later
}