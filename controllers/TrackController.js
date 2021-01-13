const TrackModel = require('../models/Track');

const TrackController = {
    find: async (req, res) => {
        let found = await TrackModel.findById(req.params.id);
        res.json(found);
    },
    all: async (req, res) => {
        let allTracks = await TrackModel.find().limit(100);
        res.json(allTracks);
    },
    create: async (req, res) => {
        let newTrack = new TrackModel(req.body);
        let savedTrack = await newTrack.save();
        res.json(savedTrack);
    },
    delete: async (req, res) => {
        TrackModel.findByIdAndDelete(req.params.id)
        .catch(err => {
            res.status(400).json({success: false, message: err.message})
        }).then(data => {
            res.json(data)
        })
    },
    getPlaylists: async (req, res) => {
        let found = await TrackModel.findById(req.params.id).populate("playlists");
        res.json(found);
    }
}

module.exports = TrackController;
