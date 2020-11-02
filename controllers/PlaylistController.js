const PlaylistModel = require('../models/Playlist');
const TrackModel = require('../models/Track');
const getUserId = require('../helpers/cognito');

const PlaylistController = {
    find: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id);
        res.json(found);
    },
    all: async (req, res) => {
        let allPlaylists = await PlaylistModel.find();
        res.json(allPlaylists);
    },
    create: async (req, res) => {
        let newPlaylist = new PlaylistModel({
            title: req.body.title,
            creator: req.body.creator,
            tracks: trackIds
        });
        const tracks = req.body.tracks;
        let trackIds = [];
        tracks.map(track => {
            // check track exists, if yes retrieve _id
            // else create the track and retrieve _id
            TrackModel.findOneAndUpdate(
                {key: track.key},
                track,
                {"$push": { playlists: newPlaylist } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )
            .then(res => {
                trackIds.push(res._id)
            })
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });

        });
        newPlaylist.save()
            .then(data => {
                res.json(data);
            })
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });
    },
    update: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id)
        //check token is authorized
        let user = getUserId(req.headers.accesstoken);
        if (user !== found.creator){
            res.status(403).json({success: false, message: 'User not authorized.'})
            return;
        }
        const tracks = req.body.tracks;
        let trackIds = [];
        tracks.map(track => {
            // check track exists, if yes retrieve _id
            // else create the track and retrieve _id
            TrackModel.findOneAndUpdate(
                {key: track.key},
                track,
                {"$push": { playlists: req.params.id} },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )
            .then(res => {
                trackIds.push(res._id)
            })
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });

        })
        found.title = req.body.title;
        found.tracks = trackIds;
        found.save().then(data => {
            res.json(data);
        }).catch(err => {
            res.status(400).json({success: false, message: err.message})
        })

    },
    delete: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id)
        //check token is authorized
        let user = getUserId(req.headers.accesstoken);
        if (user !== found.creator){
            res.status(403).json({success: false, message: 'User not authorized.'})
            return;
        }
        PlaylistModel.findByIdAndDelete(req.params.id)
        .catch(err => {
            res.status(400).json({success: false, message: err.message})
        }).then(data => {
            res.json(data)
        })
    },
    getCreator: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id).populate("creator");
        res.json(found);
    },
    getFollowers: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id).populate("followers");
        res.json(found);
    },
    getTracks: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id).populate("tracks");
        res.json(found);
    },
    addFollower: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id);
        //check token is authorized
        let user = getUserId(req.headers.accesstoken);
        if (user !== found.creator){
            res.status(403).json({success: false, message: 'User not authorized.'})
            return;
        }
        found.followers.push(req.body.userId);
        found.save().then(data => {
            res.json(data);
        }).catch(err => {
            res.status(400).json({success: false, message: err.message})
        })
    }
}

module.exports = PlaylistController;
