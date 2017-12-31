var axios = require("axios");
var config = require("./config");

var axiosClient = axios.create({
	baseURL: "https://api.twitch.tv/helix/",
	headers: {'Client-id': config.clientId}
})

module.exports = {
	getCurrentGame: function(id){
		return this.getStream(id).then((stream) => {
			return axiosClient.get("games?id="+stream.game_id).then((res) => {
				return res.data.data[0].name;
			});
		});
	},
	getStream: function(id){
		return axiosClient.get("streams?user_id="+id).then((res) => {
			return res.data.data[0];
		});
	},
	getUserId: function(channel){
		return axiosClient.get("users?login="+channel).then((res) => {
			return res.data.data[0].id;
		});
	}
}

