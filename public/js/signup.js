$(document).ready( function () {
	$('#twitchLogin').click(() => {
		$.ajax({
			type: "GET",
			url: "https://api.twitch.tv/kraken/oauth2/authorize"
				+"?client_id=759wjzryhy4vklirns0jtw6b6fxk41"
				+"&redirect_uri=http://localhost:3000"
				+"&response_type=code"
				+"&scope=user:read:email"
		 });
	});
});