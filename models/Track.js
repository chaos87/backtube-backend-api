const mongoose = require("mongoose");

const Track = mongoose.model(
  "Track",
  new mongoose.Schema({
    _id: { type: String, required : true },
    title: String,
    artist: String,
    album: String,
    cover: String,
    source: String,
    duration: Number,
    playlists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist"
    }],
},{
    timestamps: true,
})
);

module.exports = Track;
