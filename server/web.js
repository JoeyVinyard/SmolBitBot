var http = require('http');
var url = require('url');

var twitch = require('./twitchAPI');

http.createServer(function (req, res) {
	res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
	var request = url.parse(req.url, true);
	if(request.pathname == '/oauth'){
		if(!request.query.token){
			console.log("No token provided");
			res.statusCode = 400;
			res.write("{}");
			res.end();
			return;
		}
		twitch.getOAuthToken(request.query.token).then((data) => {
			var token = {
				token: data.data.access_token
			}
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