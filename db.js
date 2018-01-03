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
	fetchCommandsByChannel: function(channel){
		return firebase.database().ref('commands/'+channel).once("value");
	},
	fetchAllQuotes: function(){
		return firebase.database().ref('quotes').once("value");
	},
	fetchQuotesByChannel: function(channel){
		console.log("fetching quotes", channel);
		return firebase.database().ref('quotes/'+channel).once("value");
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
	},
	addQuote: function(channel, quote, game, username){
		var date = new Date();
		var quoteObj = {
			q: quote,
			g: game,
			d: (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getYear(),
			u: username
		}
		return firebase.database().ref("quotes/"+channel).push(quoteObj);
	},
	addRegular: function(channel, user){
		return firebase.database().ref("regulars/"+channel+"/"+user).set(true);
	},
	removeRegular: function(channel, user){
		return firebase.database().ref("regulars/"+channel+"/"+user).remove();
	},
	fetchRegulars: function(){
		return firebase.database().ref("regulars").once("value");
	}
}