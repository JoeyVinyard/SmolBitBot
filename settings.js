module.exports = {
	channel: "nanopierogi",
	maxChatSize: 300,
	permitLinkTimeout: 10,
	isLink: RegExp("^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$"),

	getLinkTimeout: function(){
		return this.permitLinkTimeout*1000;
	}
}