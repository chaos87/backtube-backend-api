const UserModel = require('../models/User');
const getUserId = require('../helpers/cognito');

const UserController = {
    find: async (req, res) => {
        let found = await UserModel.findById(req.params.id);
        res.json(found);
    },
    all: async (req, res) => {
        let allUsers = await UserModel.find();
        res.json(allUsers);
    },
    create: async (req, res) => {
        let newUser = new UserModel(req.body);
        newUser.save()
            .then(data => {
                res.json(data);
            })
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });
    },
    update: async (req, res) => {
        let found = await UserModel.findById(req.params.id);
        //check token is authorized
        let user = await getUserId(req.headers.accesstoken);
        if (user === undefined || user !== found._id){
            res.status(403).json({success: false, message: 'User not authorized.'})
            return;
        }
        found.username = req.body.username;
        found.avatar = req.body.avatar;
        found.save()
            .then(data => {
                res.json(data);
            })
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });
    },
    getOwnedPlaylists: async (req, res) => {
        let found = await UserModel.findById(req.params.id)
        .populate({
            path: "playlistsOwned",
            populate: [{ path: 'tracks' }, {path: 'creator'}]
        });
        res.json(found);
    },
    getFollowedPlaylists: async (req, res) => {
        let found = await UserModel.findById(req.params.id)
        .populate({
            path: "playlistsFollowed",
            populate: [{ path: 'tracks' }, {path: 'creator'}]
        })
        res.json(found);
    },
    getPlaylists: async (req,res) => {
        let found = await UserModel.findById(req.params.id)
        .populate({
            path: "playlistsFollowed",
            populate: [{ path: 'tracks' }, {path: 'creator'}]
        })
        .populate('creator')
        .populate({
            path: "playlistsOwned",
            populate: [{ path: 'tracks' }, {path: 'creator'}],
            options: { sort: { 'createdAt': -1 } }
        });
        res.json(found);
    },
    getPlaylistsIdAndTitle: async (req,res) => {
        let found = await UserModel.findById(req.params.id)
        .populate("playlistsOwned", "_id title")
        res.json(found);
    },
}

module.exports = UserController;
