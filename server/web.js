const express = require('express')
const app = express()
var twitch = require('./twitchAPI');

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

app.get('/oauth', (req, res) => {
	if(!req.query.token){
		res.status(400).send("No token");
		return;
	}
	twitch.getOAuthToken(req.query.token).then((data) => {
			var token = {
				token: data.data.access_token
			}
			res.status(200).send(JSON.stringify(token));
		}).catch((err) => {
			console.error(err);
		})
})

app.listen(3000, () => {
	console.log("Listening on",process.env.PORT || 3000)
})