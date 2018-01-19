var http = require('http');
var url = require('url');

var twitch = require('./twitchAPI');

http.createServer(function (req, res) {
	var request = url.parse(req.url, true);
	if(request.pathname == '/oauth'){
		twitch.getOAuthToken(request.query.token).then((data) => {
			var token = {
				token: data.data.access_token
			}
			res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
			res.statusCode = 200;
			res.write(JSON.stringify(token));
			res.end();
		}).catch((err) => {
			console.error(err);
		})
	}
}).listen(process.env.PORT || 3000, () => {
	console.log("listening on 3000");
});