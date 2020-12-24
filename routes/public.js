const express = require('express');
backtubeRouter = express.Router();


const PlaylistController = require('../controllers/PlaylistController.js');

// profile
// playlist
backtubeRouter.get('/playlists/recent', PlaylistController.getRecent);
backtubeRouter.get('/playlist/:id', PlaylistController.getTracksCreator);


module.exports = backtubeRouter;
