const PlaylistModel = require('../models/Playlist');
const TrackModel = require('../models/Track');
const ThemeModel = require('../models/Theme');
const UserModel = require('../models/User');
const getUserId = require('../helpers/cognito');
const mongoose = require('mongoose');

const PlaylistController = {
    find: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id);
        res.json(found);
    },
    getRecent: async (req, res) => {
        const limit = req.query.limit ? req.query.limit : 20;
        let found = await PlaylistModel.find({private: false}).sort({'createdAt': -1})
            .limit(limit)
            .populate('tracks')
            .populate('themes')
            .populate('creator', 'username avatar');
        res.json(found.filter(el => el.tracks.length > 2));
    },
    all: async (req, res) => {
        let allPlaylists = await PlaylistModel.find().limit(100);
        res.json(allPlaylists);
    },
    create: async (req, res) => {
        let user = await getUserId(req.headers.accesstoken);
        const tracks = req.body.tracks;
        const themes = req.body.private ? [] : req.body.themes;
        let newPlaylist = new PlaylistModel({
            title: req.body.title,
            review: req.body.review,
            creator: user,
            tags: req.body.tags,
            tracks: tracks.map(track => track._id),
            themes: themes.map(theme => theme._id),
            private: req.body.private,
        });
        tracks.map(track => {
            // check track exists, if yes retrieve _id
            // else create the track and retrieve _id
            TrackModel.findByIdAndUpdate(
                track._id,
                Object.assign(track, {$push: { playlists: newPlaylist }}),
                {
                    upsert: true, new: true, setDefaultsOnInsert: true,
                    useFindAndModify: false
                },
            )
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });
        });
        themes.map(theme => {
            // check track exists, if yes retrieve _id
            // else create the track and retrieve _id
            ThemeModel.findByIdAndUpdate(
                theme._id,
                Object.assign(theme, {$push: { playlists: newPlaylist }}),
                {
                    upsert: true, new: true, setDefaultsOnInsert: true,
                    useFindAndModify: false
                },
            )
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });
        });
        UserModel.findByIdAndUpdate(
            user,
            {$push: { playlistsOwned: newPlaylist }},
            {
                useFindAndModify: false
            },
        ).catch(err => {
            res.status(400).json({success: false, message: err.message})
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
            .populate('tracks')
            .populate('themes');
        //check token is authorized
        let user = await getUserId(req.headers.accesstoken);
        if (user !== found.creator){
            res.status(403).json({success: false, message: 'User not authorized.'})
            return;
        }
        const tracks = req.body.tracks;
        const themes = req.body.private ? [] : req.body.themes;
        const removedTracks = await found.tracks.filter(e => !tracks.map(track => track._id).includes(e._id))
        const removedThemes = await found.themes.filter(e => !themes.map(theme => theme._id).includes(e._id))
        await removedTracks.map(track => {
            // remove playlistID from track if track has been removed
            TrackModel.findByIdAndUpdate(
                track._id,
                {$pull: { playlists: req.params.id}},
                {
                    useFindAndModify: false
                },
            )
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });
        })
        found.tracks = tracks.map(track => track._id);
        tracks.map(track => {
            // check track exists, if yes retrieve _id
            // else create the track and retrieve _id
            TrackModel.findByIdAndUpdate(
                track._id,
                Object.assign(track, {$addToSet: { playlists: req.params.id}}),
                {
                    upsert: true, new: true, setDefaultsOnInsert: true,
                    useFindAndModify: false
                },
            )
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });

        })
        await removedThemes.map(theme => {
            // remove playlistID from theme if theme has been removed
            ThemeModel.findByIdAndUpdate(
                theme._id,
                {$pull: { playlists: req.params.id}},
                {
                    useFindAndModify: false
                },
            )
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });
        })
        found.themes = themes.map(theme => theme._id);
        themes.map(theme => {
            // check theme exists, if yes retrieve _id
            // else create the theme and retrieve _id
            ThemeModel.findByIdAndUpdate(
                theme._id,
                {$addToSet: { playlists: req.params.id}},
                {
                    useFindAndModify: false
                },
            )
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });
        })
        found.title = req.body.title;
        found.review = req.body.review;
        found.private = req.body.private;
        found.tags = req.body.tags;
        found.save().then(data => {
            res.json(data);
        }).catch(err => {
            res.status(400).json({success: false, message: err.message})
        })
    },
    delete: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id)
        //check token is authorized
        let user = await getUserId(req.headers.accesstoken);
        if (user !== found.creator){
            res.status(403).json({success: false, message: 'User not authorized.'})
            return;
        }
        await found.tracks.map(track => {
            TrackModel.findByIdAndUpdate(
                track,
                {$pull: { playlists: req.params.id}},
                {
                    safe: true,
                    useFindAndModify: false
                },
            ).then(data => {
                if (data.playlists.length === 1 && data.playlists[0].toString() === req.params.id) {
                    console.log('DELETE', data.title)
                    TrackModel.findByIdAndDelete(data._id).catch(err => {
                        res.status(400).json({success: false, message: err.message})
                    });
                }
            })
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });
        });
        await found.themes.map(theme => {
            ThemeModel.findByIdAndUpdate(
                theme,
                {$pull: { playlists: req.params.id}},
                {
                    safe: true,
                    useFindAndModify: false
                },
            )
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });
        });
        await UserModel.findByIdAndUpdate(
            user,
            {$pull: { playlistsOwned: req.params.id }},
            {
                useFindAndModify: false
            },
        ).catch(err => {
            res.status(400).json({success: false, message: err.message})
        });
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
    getTracksCreator: async (req, res) => {
        //check is user passed token
        let user = ''
        if ('accesstoken' in req.headers) {
            user = await getUserId(req.headers.accesstoken)
            .catch(err => {console.log(err.message)});
        }
        PlaylistModel.findById(req.params.id)
        .populate("tracks")
        .populate("creator")
        .populate({ path: 'themes', select: '_id title'})
        .then(result => {
            if (!result.private || (result.private && result.creator._id === user)) {
                res.json(result)
            }
            else {
                res.json({})
            }
        })
        .catch(err => {
            res.status(400).json({success: false, message: err.message})
        })
    },
    addFollower: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id);
        //check token is authorized
        let user = await getUserId(req.headers.accesstoken);
        // get User
        let userObj = await UserModel.findById(user)
        if (!found.followers.includes(user)) {
            found.followers.push(user);
        }

        if (!userObj.playlistsFollowed.includes(found._id)) {
            userObj.playlistsFollowed.push(found._id);
        }
        await found.save().catch(err => {
            res.status(400).json({success: false, message: err.message})
        })
        userObj.save().then(data => {
            res.json(data);
        }).catch(err => {
            res.status(400).json({success: false, message: err.message})
        })
    },
    removeFollower: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id);
        //check token is authorized
        let user = await getUserId(req.headers.accesstoken);
        // get User
        let userObj = await UserModel.findById(user)
        if (found.followers.includes(user)) {
            found.followers.pull(user);
        }
        if (userObj.playlistsFollowed.includes(found._id)) {
            userObj.playlistsFollowed.pull(found._id);
        }
        await found.save().catch(err => {
            res.status(400).json({success: false, message: err.message})
        })
        userObj.save().then(data => {
            res.json(data);
        }).catch(err => {
            res.status(400).json({success: false, message: err.message})
        })
    },
    search: async (req, res) => {
        let playlistResultFromPlaylist = await PlaylistModel.find({$text: {$search: req.body.searchString}})
            .populate('tracks')
            .populate('themes')
            .populate('creator');
        let playlistResultFromTrack = await TrackModel.find({$text: {$search: req.body.searchString}}).populate({
            path: "playlists",
            populate: [{ path: 'tracks' },{ path: 'creator', select: 'username avatar'}]
        })

        let playlistResultFromTrackOnlyPlaylists = await playlistResultFromTrack.map(el => el.playlists).flat().filter(el => !el.private)
        playlistResultFromTrackOnlyPlaylists = await playlistResultFromTrackOnlyPlaylists.filter((v,i,a)=>a.findIndex(t=>(t._id.toString() === v._id.toString()))===i)
        let finalResults = await Array(playlistResultFromTrackOnlyPlaylists, playlistResultFromPlaylist.filter(el => !el.private)).flat();
        let finalResultsDeduped = await finalResults.filter((v,i,a)=>a.findIndex(t=>(t._id.toString() === v._id.toString()))===i);
        res.json(finalResultsDeduped)
    }
}

module.exports = PlaylistController;
