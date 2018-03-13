const simplify = require('./simplify.js');

var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var app = express();
app.use(bodyParser.json(), function(req, res, next) {
    res.header("Access-Control-Allow-Origin", 'http://localhost:3000');
    res.header("Access-Control-Allow-Credentials", 'true');
    res.header(	
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
 });

//Set up a server listener on port 8080
var server = app.listen(8080, function () {
  var port = server.address().port
  console.log("Node.js server running at localhost:%s", port)
})

//Handle GET requests for base '/' path
app.get('/', (req, res) => {
	console.log("GET requiest received for /");
	res.status(200).json({"message": "Welcome to LilTim REST-based web service"});
})

//Handle POST requests for '/result' path
app.post("/result", (req, res) => {
	console.log("POST request received for /result");

//use simplify module to produce simplification results
fs.readFile(__dirname + "/results.json", 'utf8', (err, data) => {
	if (err && err.code == "ENOENT") {
  	console.error("Invalid filename provided");
  	return;
	}

    try {
    	let simplified;
		var currentExpression = JSON.stringify(req.body.expression).replace(/\"/g, "");
    	var expressions = JSON.parse(data);

		if (expressions[currentExpression]) {
			simplified = expressions[currentExpression];
		} else {
			simplified = simplify.simplify(currentExpression);
			expressions[currentExpression] = simplified;
			fs.writeFileSync(__dirname + "/results.json", JSON.stringify(expressions));
		}

		res.send(simplified);

	} catch (err) {
		res.status(400).json({error: "Invalid request for results!"});
	}
})});

//Handle POST requests for '/postfix' path
app.post("/postfix", (req, res) => {
	console.log("POST request received for /getPostfix");
	fs.readFile(__dirname + "/postfix.json", 'utf8', (err, data) => {
		if (err && err.code == "ENOENT") {
      	console.error("Invalid filename provided");
      	return;
    	}

    try {
    	let postfix;
		var currentExpression = JSON.stringify(req.body.expression).replace(/\"/g, "");
    	var expressions = JSON.parse(data);

		if (expressions[currentExpression]) {
			postfix = expressions[currentExpression];
		} else {
			postfix = simplify.getPostfix(currentExpression);
			expressions[currentExpression] = postfix;
			fs.writeFileSync(__dirname + "/postfix.json", JSON.stringify(expressions));
		}

		res.send(postfix);

	} catch (err) {
		res.status(400).json({error: "Invalid request for postfix!"});
	}
})});

//Handle GET requests for '/history' path, download simplified result history as json file
app.get('/history', (req, res) => {
	console.log("GET request received for simplify history");
	var historyFile = __dirname + '/results.json';
	if (fs.existsSync(historyFile)) {
    	res.download(historyFile);
	}
})
