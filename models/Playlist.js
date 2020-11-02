const mongoose = require("mongoose");

const Playlist = mongoose.model(
  "Playlist",
  new mongoose.Schema({
    title: String,
    tracks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Track"
    }],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
},{
    timestamps: true
})
);

module.exports = Playlist;
