var http = require("http");
var express = require("express");
var app = express();

exports.init = () => {

	app.use(express.static(__dirname + '/public'));

	app.get("/", (req, res) => {
		res.sendFile(__dirname + "/index.html");
	});

	http.createServer(app, (req, res) => {
		var url = req.url;
	}).listen(3000, "localhost");
}