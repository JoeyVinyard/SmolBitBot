var axios = require("axios");
var config = require("./config");

var twitchClient = axios.create({
	baseURL: "https://api.twitch.tv/helix/",
	headers: {'Client-id': config.clientId}
});
var tmiClient = axios.create({
	baseURL: "https://tmi.twitch.tv/group/user/"
})

module.exports = {
	getCurrentGame: function(id){
		return this.getStream(id).then((stream) => {
			return twitchClient.get("games?id="+stream.game_id).then((res) => {
				return res.data.data[0].name;
			});
		});
	},
	getStream: function(id){
		return twitchClient.get("streams?user_id="+id).then((res) => {
			return res.data.data[0];
		});
	},
	getUserId: function(channel){
		return twitchClient.get("users?login="+channel).then((res) => {
			return res.data.data[0].id;
		});
	},
	getViewers: function(channel){
		return tmiClient.get(channel+"/chatters").then((res) => {
			var chatters = [];
			Object.values(res.data.chatters).forEach((list) => {
				chatters = chatters.concat(list);
			});
			return chatters;
		})
	}
}

