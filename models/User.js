const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    _id: { type: String, required : true },
    username: String,
    avatar: String,
    playlistsOwned: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist"
    }],
    playlistsFollowed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist"
    }],
    themesCreated: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Theme"
    }]
  },{
    timestamps: true,
})
);

module.exports = User;
