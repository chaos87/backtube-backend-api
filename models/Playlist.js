const mongoose = require("mongoose");

const Playlist = mongoose.model(
  "Playlist",
  new mongoose.Schema({
    title: String,
    tracks: [{
        type: String,
        ref: "Track"
    }],
    creator: {
        type: String,
        ref: "User"
    },
    followers: [{
        type: String,
        ref: "User"
    }]
},{
    timestamps: true
})
);

module.exports = Playlist;
