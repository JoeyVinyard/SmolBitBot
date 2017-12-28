var firebase = require("firebase");

module.exports = {
	init: function(config){
		firebase.initializeApp(config);
	},
	fetchChannel: function(channel){
		return firebase.database().ref('channels/'+channel).once("value");
	},
	fetchChannels: function(){
		return firebase.database().ref('channels').once("value");
	},
	fetchAllCommands: function(){
		return firebase.database().ref('commands').once("value");
	},
	fetchCommands: function(){
		return firebase.database().ref('commands').once("value");
	},
	fetchCommandsByChannel: function(channel){
		return firebase.database().ref('commands/'+channel).once("value");
	},
	addCommand: function(channel, command, response, timeout, userlevel){
		return firebase.database().ref('commands/'+channel+"/"+command).set({
			response: response,
			timeout: timeout,
			userlevel: userlevel
		});
	},
	deleteCommand: function(channel, command){
		return firebase.database().ref("commands/"+channel+"/"+command).remove();
	},
	updateChannel: function(channel, key, value){
		return firebase.database().ref("channels/"+channel+"/"+key).set(value);
	}
}