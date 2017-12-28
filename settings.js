module.exports = {
	maxChatSize: 300,
	permitLinkTimeout: 10,

	getLinkTimeout: function(){
		return this.permitLinkTimeout*1000;
	}
}