var axios = require("axios");
var config = require("./config");

var helixClient = axios.create({
	baseURL: "https://api.twitch.tv/helix/",
	headers: {'Client-id': config.clientId}
});
var krakenClient = axios.create({
	baseURL: "https://api.twitch.tv/kraken/",
	headers: {'Client-id': config.clientId}
})
var tmiClient = axios.create({
	baseURL: "https://tmi.twitch.tv/group/user/"
})

module.exports = {
	getCurrentGame: function(id){
		return this.getStream(id).then((stream) => {
			return helixClient.get("games?id="+stream.game_id).then((res) => {
				return res.data.data[0].name;
			});
		});
	},
	getStream: function(id){
		return helixClient.get("streams?user_id="+id).then((res) => {
			return res.data.data[0];
		});
	},
	getStreams: function(channels){
		return helixClient.get("streams?user_login="+channels.join("&user_login=")).then((res) => {
			return res.data.data;
		});
	},
	getUserIds: function(channels){
		return helixClient.get("users?login="+channels.join("&login=")).then((res) => {
			return res.data.data;
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
	},
	getOAuthToken: function(token){
		return krakenClient.post("oauth2/token", {
			client_id: config.clientId,
			client_secret: config.secret,
			code: token,
			grant_type:"authorization_code",
			redirect_uri:"http://localhost:4200/connected"
		});
	}
}

