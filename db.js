var firebase = require("firebase");

module.exports = {
	init: function(config){
		firebase.initializeApp(config);
	},
	fetchChannels: function(){
		return firebase.database().ref('channels').once("value");
	},
	fetchAllCommands: function(){
		return firebase.database().ref('commands').once("value");
	},
	fetchCommands: function(channel){
		return firebase.database().ref('commands/'+channel).once("value");
	},
	addCommand: function(channel, command, response, timeout, userlevel){
		return firebase.database().ref('commands/'+channel+"/"+command).set({
			response: response,
			timeout: timeout,
			userlevel: userlevel
		});
	}
}