var firebase = require("firebase");

module.exports = {
	init: function(config){
		firebase.initializeApp(config);
	},
	addCommand: function(channel, command, response, timeout, userlevel){
		return firebase.database().ref('commands/'+channel+"/"+command).set({
			response: response,
			timeout: timeout,
			userlevel: userlevel
		});
	}
}