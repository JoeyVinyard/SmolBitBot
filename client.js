var http = require("http");
var express = require("express");
var app = express();
var bodyParser = require('body-parser')

exports.init = () => {
	app.use(express.static(__dirname + '/public'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true})); 

	app.get("/", (req, res) => {
		res.sendFile(__dirname + "/index.html");
	});

	app.post("/signup", (req, res) => {
		console.log(req.body);
		res.sendStatus(200);
	})

	http.createServer(app, (req, res) => {

	}).listen(3000, "localhost");
}