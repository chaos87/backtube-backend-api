const express = require('express');
backtubeRouter = express.Router();


const PlaylistController = require('../controllers/PlaylistController.js');
const ThemeController = require('../controllers/ThemeController.js');
const UserController = require('../controllers/UserController.js');
// profile
authenticatedRouter.get('/profile/:id', UserController.find);
// playlist
backtubeRouter.get('/playlists/recent', PlaylistController.getRecent);
backtubeRouter.get('/playlist/:id', PlaylistController.getTracksCreator);

backtubeRouter.get('/themes/recent', ThemeController.getRecent);
backtubeRouter.get('/theme/:id', ThemeController.getPlaylists);


module.exports = backtubeRouter;
