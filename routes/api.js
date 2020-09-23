const express = require('express');
const cognitoExpress = require('../app')
authenticatedRouter = express.Router();

//Our middleware that authenticates all APIs under our 'authenticatedRoute' Router
authenticatedRouter.use(function(req, res, next) {
	//I'm passing in the access token in header under key accessToken
	let accessTokenFromClient = req.headers.accesstoken;
	//Fail if token not present in header.
	if (!accessTokenFromClient) return res.status(401).send("Access Token missing from header");
	cognitoExpress.validate(accessTokenFromClient, function(err, response) {
		//If API is not authenticated, Return 401 with error message.
		if (err) return res.status(401).send(JSON.stringify({"message": err}));
		//Else API has been authenticated. Proceed.
		res.locals.user = response;
		next();
	});
});


// Define Backtube CRUD operations
authenticatedRouter.get('/helloWorld', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send({"message": "ok"})
})

module.exports = authenticatedRouter;
