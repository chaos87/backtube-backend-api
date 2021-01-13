const ThemeModel = require('../models/Theme');
const UserModel = require('../models/User');
const getUserId = require('../helpers/cognito');

const ThemeController = {
    find: async (req, res) => {
        let found = await ThemeModel.findById(req.params.id);
        res.json(found);
    },
    getRecent: async (req, res) => {
        const limit = req.query.limit ? req.query.limit : 20;
        let found = await ThemeModel.find({}).sort({'createdAt': -1})
            .limit(req.query.limit)
            .populate('playlists')
            .populate('creator', 'username avatar');
        res.json(found);
    },
    all: async (req, res) => {
        let allThemes = await ThemeModel.find().limit(100);
        res.json(allThemes);
    },
    create: async (req, res) => {
        let user = await getUserId(req.headers.accesstoken);
        const tracks = req.body.tracks;
        let newTheme = new ThemeModel({
            title: req.body.title,
            description: req.body.description,
            creator: user,
            tags: req.body.tags,
        });
        UserModel.findByIdAndUpdate(
            user,
            {$push: { themesCreated: newTheme }},
            {
                useFindAndModify: false
            },
        ).catch(err => {
            res.status(400).json({success: false, message: err.message})
        });
        newTheme.save()
            .then(data => {
                res.json(data);
            })
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });
    },
    update: async (req,res) => {
        let found = await ThemeModel.findById(req.params.id);
        //check token is authorized
        let user = await getUserId(req.headers.accesstoken);
        if (user !== found.creator){
            res.status(403).json({success: false, message: 'User not authorized.'})
            return;
        }
        found.title = req.body.title;
        found.description = req.body.description;
        found.tags = req.body.tags;
        found.save().then(data => {
            res.json(data);
        }).catch(err => {
            res.status(400).json({success: false, message: err.message})
        })
    },
    delete: async (req, res) => {
        //check token is authorized
        let user = await getUserId(req.headers.accesstoken);
        await UserModel.findByIdAndUpdate(
            user,
            {$pull: { themesCreated: req.params.id }},
            {
                useFindAndModify: false
            },
        ).catch(err => {
            res.status(400).json({success: false, message: err.message})
        });
        ThemeModel.findByIdAndDelete(req.params.id)
        .catch(err => {
            res.status(400).json({success: false, message: err.message})
        }).then(data => {
            res.json(data)
        })
    },
    getPlaylists: async (req, res) => {
        let found = await ThemeModel.findById(req.params.id).populate("playlists");
        res.json(found);
    }
}

module.exports = ThemeController;
