const express = require('express');
const cognitoExpress = require('../app')
const AWS = require('aws-sdk');
const moment = require('moment');
authenticatedRouter = express.Router();

const UserController = require('../controllers/UserController.js');
const TrackController = require('../controllers/TrackController.js');
const PlaylistController = require('../controllers/PlaylistController.js');

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
// profile
authenticatedRouter.put('/profile/:id', UserController.update);
authenticatedRouter.get('/profile/:id', UserController.find);
authenticatedRouter.get('/profile/:id/playlists', UserController.getPlaylists);
authenticatedRouter.get('/profile/:id/playlistsNoTracks', UserController.getPlaylistsIdAndTitle);
// playlist
authenticatedRouter.get('/playlist', PlaylistController.all);
authenticatedRouter.post('/playlist', PlaylistController.create);
authenticatedRouter.put('/playlist/:id', PlaylistController.update);
authenticatedRouter.delete('/playlist/:id', PlaylistController.delete);
authenticatedRouter.get('/playlist/:id', PlaylistController.getTracks);
authenticatedRouter.put('/playlist/:id/addFollower', PlaylistController.addFollower);
authenticatedRouter.put('/playlist/:id/removeFollower', PlaylistController.removeFollower);
authenticatedRouter.post('/playlist/search', PlaylistController.search);
// track
authenticatedRouter.get('/track/:id', TrackController.find);
authenticatedRouter.get('/track', TrackController.all);
authenticatedRouter.get('/track/:id/playlists', TrackController.getPlaylists);

// Define Backtube CRUD operations
authenticatedRouter.get('/helloWorld', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send({"message": "ok"})
})

module.exports = authenticatedRouter;
