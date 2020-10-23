const express = require('express');
const cognitoExpress = require('../app')
const AWS = require('aws-sdk');
const moment = require('moment');
authenticatedRouter = express.Router();

// Configure aws with your accessKeyId and your secretAccessKey
AWS.config.update({
  region: 'us-east-2', // Put your aws region here
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey
})


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


const S3_BUCKET = 'backtube'
// Now lets export this function so we can call it from somewhere else
authenticatedRouter.post('/uploadAvatar', (req,res) => {
	const s3 = new AWS.S3();  // Create a new instance of S3
	const fileName = req.body.fileName;
	const fileType = req.body.fileType;
	// Set up the payload of what we are sending to the S3 api
	const s3Params = {
		Bucket: S3_BUCKET,
		Key: fileName,
		Expires: 500,
		ContentType: fileType,
		ACL: 'public-read'
	};
	// Make a request to the S3 API to get a signed URL which we can use to upload our file
	s3.getSignedUrl('putObject', s3Params, (err, data) => {
	    if(err){
	      console.log(err);
	      res.json({success: false, error: err})
	    }
	    // Data payload of what we are sending back, the url of the signedRequest and a URL where we can access the content after its saved.
		const returnData = {
			signedRequest: data,
			url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
		};
	    // Send it all back
	    res.json(returnData);
	});
})

authenticatedRouter.put('/profile', (req,res) => {
	const currentDateTime = moment().format('YYYY-MM-DDTHH:mm:ss');
	const updateAvatar = 'avatar' in req.body ? ", avatar = :a" : "";
	const UpdateExpression = "set updatedAt = :d, username = :u" + updateAvatar;
	const ExpressionAttributeValues = {
		":u": req.body.username,
		":d": currentDateTime
	}
	if (updateAvatar) {
		ExpressionAttributeValues[":a"] = req.body.avatar;
	}

	const params = {
		TableName: "user-playlist",
		Key: {
			"PK": "USER#" + req.body.userSub,
			"SK": "USER#" + req.body.userSub,
		},
		UpdateExpression: UpdateExpression,
	    ExpressionAttributeValues: ExpressionAttributeValues,
	    ReturnValues:"UPDATED_NEW"
	};
	console.log("Updating user in user-playlist table...");
	const docClient = new AWS.DynamoDB.DocumentClient();
	docClient.update(params, function(err, data) {
		if (err) {
			console.log(err)
			return res.status(400).json({"error": err.message});
		} else {
			res.json(data)
		}
	});
})

authenticatedRouter.get('/profile', (req,res) => {
	const params = {
		TableName: "user-playlist",
		Key: {
			"PK": "USER#" + req.query.userSub,
			"SK": "USER#" + req.query.userSub,
		}
	};
	const docClient = new AWS.DynamoDB.DocumentClient();
	docClient.get(params, function(err, data) {
		if (err) {
			console.log(err)
			return res.status(400).json({"error": err.message});
		} else {
			res.json(data.Item)
		}
	});
})

// Define Backtube CRUD operations
authenticatedRouter.get('/helloWorld', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send({"message": "ok"})
})

module.exports = authenticatedRouter;
