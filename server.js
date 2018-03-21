const simplify = require('./simplify.js');
const dbManager = require("./dbManager.js");

var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var app = express();

const passport = require('passport');  
const strategy = require('passport-local');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');  
const cryptoJs = require('crypto-js');
const crypto = require('crypto');

const serverSecret = crypto.createDiffieHellman(60).generateKeys('base64');
const passwordKey = crypto.createDiffieHellman(30).generateKeys('base64');
const authenticate = expressJwt({secret: serverSecret});

//access control for port for frontend
app.use(bodyParser.json(), function(req, res, next) {
	//allow multiple origins
	var allowedOrigins = ['http://localhost:8080', 'http://localhost:3000'];
	var origin = req.headers.origin;
  	if(allowedOrigins.indexOf(origin) > -1){
       res.header('Access-Control-Allow-Origin', origin);
  	}
    res.header("Access-Control-Allow-Credentials", 'true');
    res.header(	
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
 });

//Set up a server listener on port 8080
var server = app.listen(8080, function () {
  var port = server.address().port
  console.log("Node.js server running at localhost:%s", port)
})


//====================================================//
//					Authentication					  //
//====================================================//

// purpose: uses passport-local strategy to handle username/password authentication
passport.use(new strategy( 
  function(username, password, done) {
    // (1) replace the following with data retrieved from database
    // (2) ensure that password is not handled as plaintext

    //TODO: compare this encrypted password with password stored in db
    var encrypted = cryptoJs.AES.encrypt(password, passwordKey).toString();
  
    //igor demo version, use plain text password for now
    if(username === 'admin' && password === 'password'){ 
      done(null, { // stub call to a database; returning fixed info
        id: 42, fname: 'Tim', lname: 'Tsang', role: 'premium'
      });
    }
    else {
      done(null, false);
    }
  }
));

app.post('/authenticate', passport.authenticate(  
  'local', {
    session: false
  }), serializeUser, generateToken, returnToken);

// purpose: update or create user data in database and only return user.id
function serializeUser(req, res, next) {  
  db.updateOrCreate(req.user, function(err, user){
    if(err) {return next(err);}
      req.user = {
        id: user.id,
        fname: user.fname,
    	lname: user.lname,
        role: user.role
      };
      next();
  });
  next();
}

// purpose: generates a token based on provided user.id; token is set to expire based on expiresIn value
function generateToken(req, res, next) {  
  req.token = jwt.sign({
    id: req.user.id,
    fname: req.user.fname,
    lname: req.user.lname,
    role: req.user.role
  }, serverSecret, {
    expiresIn : 60*5	// set to expire in 5 minutes
  });
  next(); // pass on control to the next function
}

// purpose: return generated token to caller
function returnToken(req, res) {  
  res.status(200).json({
    user: req.user,
    token: req.token
  });
}

//dummy db
const db = {  
  updateOrCreate: function(user, cb){
    // db dummy, we just cb the user
    cb(null, user);
  }
};

//====================================================//
//					Features Endpoints				  //
//====================================================//

//Handle GET requests for base unsecured '/' path 
app.get('/', authenticate, (req, res) => {
	console.log("GET request received for /");
	res.status(200).json({"message": "Welcome to LilTim REST-based web service", "links": {"rel" : "authenticate", "href" : "http://localhost:8080/authenticate"}});
})

//Handle POST requests for '/result' path
app.post("/result", authenticate, (req, res) => {
	console.log("POST request received for /result");
	    try {
			  var currentExpression = JSON.stringify(req.body.expression).replace(/\"/g, "");
				var queryString = "SELECT * FROM dbo.Results WHERE InputExpression = '" + currentExpression + "'";
				dbManager.getDBData(req, res, queryString, currentExpression, 1);
		} catch (err) {
			res.status(400).json({error: "Invalid request for results!"});
		}
});

//Handle POST requests for '/postfix' path, only accessible by premium users
app.post("/postfix", authenticate, (req, res, next) => {
	passport.authenticate('local', (err, user) => {
		try {
			if (req.user.role === 'premium') {
				console.log("POST request received for /getPostfix");
		    try {
					var currentExpression = JSON.stringify(req.body.expression).replace(/\"/g, "");
					var queryString = "SELECT * FROM dbo.Results WHERE Postfix = '" + currentExpression + "'";
					dbManager.getDBData(req, res, queryString, currentExpression, 2);
				} catch (err) {
					res.status(400).json({error: "Invalid request for postfix!"});
				}
			} 
			else {
				return res.status(403).send({
	          	'status': 403,
	          	'message': 'You are not a premium user'
	        	});
			}
		} 
		catch (err) {
			return res.status(401).send({
	        'status': 401,
	        'message': 'An authentication error occurred.',
      		});	
		}		
	}) (req, res, next);
});