var tmi = require("tmi.js");
var urlRegex = require('url-regex');

var webClient = require("./client");
var config = require("./config");
var db = require("./db");
var settings = require("./settings");
var twitchAPI = require("./twitchAPI");

var tmiOptions = {
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

var client = new tmi.client(tmiOptions);
var allowedLinkPosters = {}; //HashSet for permitted link posters
var commands = {};
var connectedChannels = {};
var quotes = {};
var regulars = {};

console.log("Initializing web client...");
webClient.init();
console.log("Finished\n");

console.log("Initializing firebase...");
db.init(config.fbConfig);
console.log("Finished\n");

console.log("Initializing TMI...");
// client.connect();
console.log("Finished\n");

client.on("connected", function(address, port){
	console.log("Successfully conntected to Twitch IRC");
	db.fetchChannels().then((channels) => {
		connectedChannels = channels.val();
		twitchAPI.getUserIds(Object.keys(channels.val())).then((users) => {
			users.forEach((user) => {
				client.join(user.login);
				allowedLinkPosters[user.login] = {};
				connectedChannels[user.login].id = user.id;
				setInterval(updateViewTimes, 1*60*1000, user.login);
			});
		});
		refreshStreams();
	}).catch((err) => {
		console.log("Unable to fetch channels", err);
	});
	//Fetch commands
	db.fetchAllCommands().then((cmds) => {
		commands = cmds.val();
		if(commands == null)
			commands = {};
	}).catch((err) => {
		console.log("~Error~", err);
	});
	//Fetch quotes
	db.fetchAllQuotes().then((qs) => {
		quotes=qs.val();
		if(quotes == null)
			quotes = {};
	}).catch((err) => {
		console.log("Error fetching all quotes");
	});
	//Fetch regular users
	db.fetchRegulars().then((regs) => {
		regulars = regs.val();
	}).catch((err) => {
		console.log("Error fetching regulars", err);
	});
	setInterval(refreshStreams, 5000*60);
});

client.on("subscription", function (channel, username, method, message, userstate) {
	chat(channel, username + ", has subscribed!");
});

client.on("resub", function (channel, username, months, message, userstate, methods) {
    chat(channel, username + ", has resubbed for " + months + " months!");
});

client.on("chat", function(channel, user, message, self){
	channel = channel.substring(1);
	if(self)//Ignore if the bot sent this message
		return;
	parseMessage(channel, user, message);
})

function parseMessage(channel, user, message){
	if(message.length > connectedChannels[channel].maxChars){
		chat(channel, user["display-name"] + ", that message is way too long! [" + connectedChannels[channel].maxChars + "]");
		client.timeout(channel, user.username, 1, "Wall of text spam");
		return;
	}
	if(urlRegex({strict: false}).test(message) && !canPostLink(channel, user)){
		chat(channel, user["display-name"] + ", you are not allowed to post links without permission!");
		client.timeout(channel, user.username, 1, "You are not allowed to post links");
		return;
	}
	if(message.charAt(0) == '!'){
		var args = message.substring(1).split(" ");
		var command = args[0];
		args.splice(0,1);
		switch(command.toLowerCase()){
			case "command":
				var arg = args[0];
				args.splice(0,1);
				switch(arg){
					case undefined:
						var list = "Commands: "
						Object.keys(commands[channel]).forEach((cmd) => {
							list+= cmd + ", "
						});
						list = list.substring(0,list.length-2);
						chat(channel, list);
						break;
					case "add":
						addCommand(args, channel);
					break;
					case "delete":
						deleteCommand(args, channel);
					break;
				}
				break;
			case "maxchars":
				if(!canEditChannel(channel, user))
					return;
				var numChars = args[0];
				if(numChars == null){
					chat(channel, "Usage: !maxChars <num>");
					return;
				}
				db.updateChannel(channel, "maxChars", parseInt(numChars)).then(() => {
					chat(channel, "Successfuly updated maximum number of characters allowed["+numChars+"]");
				}).then(() => {
					connectedChannels[channel].maxChars = numChars;
				}).catch((err) => {
					//@TODO: Probably make this a whisper or something
					chat(channel, "Something went wrong on the backend, try again homie");
				});
				break;
			case "permit":
				// if(!user.isMod)
				// 	return;
				var username = args[0];
				allowedLinkPosters[channel] = {};
				allowedLinkPosters[channel][username] = true; //Add user to hashset
				chat(channel, username + " is now permitted to post a link for " + settings.permitLinkTimeout + " seconds");
				setTimeout(removeFromPermitList, settings.getLinkTimeout(), username, channel); //Remove user from allowed posting list after timeout
				break;
			case "quote":
				var arg = args[0];
				args.splice(0,1);
				switch(arg){
					case undefined:
						printRandomQuote(channel);
					break;
					case "add":
						addQuote(channel, args.join(" "), user.username);
					break;
				}
				break;
			case "regular":
				if(getUserPermLevel(channel, user) < getPermLevel("mod")) //Maybe make this change based on channel
					return;
				var arg = args[0];
				args.splice(0,1);
				switch(arg){
					case "add":
						addRegular(channel, args[0]);
					break;
					case "delete":
						removeRegular(channel, args[0]);
					break;
					case undefined:
						chat(channel, "Usage: !regular <add/delete> <user>");
					break;
					default:
						chat(channel, "Usage: !regular <add/delete> <user>");
					break;
				}
				break;
			break;
			case "viewtime":
				getViewTime(channel, (args[0] || user.username)).then((viewtime) => {
					chat(channel, (args[0] || user["display-name"]) + " has been watching for: " + prettyTime(viewtime));
				})
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

	for(var i = 0; i < 2 && args[0].startsWith("-"); i++){
		console.log(args);
		if(args[0].startsWith("-cd=")){
			cooldown = parseInt(flagToValue(args[0]));
			args.splice(0,1);
		}
		else if(args[0].startsWith("-ul=")){
			userlevel = flagToValue(args[0]);
			args.splice(0,1);
		}
	}
	response = args.join(" ");

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

function deleteCommand(args, channel){
	var command = args[0];
	if(command == null){
		chat(channel, "Error, command does not exist");
		return;
	}
	db.deleteCommand(channel, command).then(() => {
		chat(channel, "Command: '" + command + "' successfully removed");
		db.fetchCommandsByChannel(channel).then((cmds) => {
			commands[channel] = cmds.val();
		});
	});
}

function commandExists(channel, command){
	if(commands == null || commands[channel] == null)
		return false;
	return !!commands[channel][command];
}

function flagToValue(flag){
	return flag.substring(flag.indexOf('=')+1);
}

function addQuote(channel, quote, username){
	var id = connectedChannels[channel].id;
	twitchAPI.getCurrentGame(id).then((game) => {
		db.addQuote(channel, quote, game, username).then(() => {
			chat(channel, "Quote added!");
			db.fetchQuotesByChannel(channel).then((qs) => {
				quotes[channel] = qs.val();
			});
		});		
	}).catch((err) => {
		console.log(channel, "is not live!");
		db.addQuote(channel, quote, null, username).then(() => {
			chat(channel, "Quote added!");
			db.fetchQuotesByChannel(channel).then((qs) => {
				quotes[channel] = qs.val();
			});
		});
	})
}

function printRandomQuote(channel){
	var qts = quotes[channel];
	var keys = Object.keys(qts);
	if(keys.length == 0){
		chat(channel, "There are no quotes yet!");
	}
	var qt = qts[keys[Math.floor(Math.random() * keys.length)]];
	var message = "\"" + qt.q + "\" - " + connectedChannels[channel].displayName;
	if(!!qt.g)
		message += ", while playing: " + qt.g
	message += "-" + qt.d;
	chat(channel, message);
}

function addRegular(channel, user){
	if(!user){
		chat(channel, "Usage: !regular add <user>");
	}
	db.addRegular(channel, user).then(() => {
		chat(channel, "User: " + user + ", has been added to the regular list");
		if(regulars[channel] == null)
			regulars[channel] = {};
		regulars[channel][user] = true;
	});
}

function removeRegular(channel, user){
	if(!user){
		chat(channel, "Usage: !regular remove <user>");
	}
	db.removeRegular(channel, user).then(() => {
		chat(channel, "User: " + user + ", has been removed from the regular list");
	});
}

function chat(channel, message){
	client.say(channel, message);
}

function removeFromPermitList(username, channel){
	delete allowedLinkPosters[channel][username];
}

function getViewers(channel){
	return twitchAPI.getViewers(channel);
}

function updateViewTimes(channel){
	getViewers(channel).then((viewers) => {
		db.updateViewTime(channel, viewers);
	}).catch((err) => {
		console.log(err);
	})
}

function getViewTime(channel, user){
	return db.getViewTime(channel, user);
}

function prettyTime(time){
	var days = Math.floor(time/(60*24));
	var hours = Math.floor(time/60)%24;
	var minutes = time%60;
	console.log(days, hours, minutes);
	var prettyMessage = "";
	if(days)
		prettyMessage += days + " days, ";
	if(hours)
		prettyMessage += hours + " hours, ";
	if(days || hours)
		prettyMessage += "and "
	prettyMessage += minutes + " minutes!";
	return prettyMessage;
}

function refreshStreams(){
	twitchAPI.getStreams(Object.keys(connectedChannels)).then((streams) => {
		console.log(streams);
	});
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

function getPermLevel(permName){
	switch(permName){
		case "owner":
			return 5;
		case "staff":
			return 4;
		case "mod":
			return 3;
		case "sub":
			return 2;
		case "reg":
			return 1;
		case "all":
			return 0;
		default:
			return 0;
	}
}

function canEditChannel(channel, user){
	return getUserPermLevel(channel, user) >= getChannelPerm(channel, "channelEdit");
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