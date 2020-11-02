const mongoose = require("mongoose");

const Track = mongoose.model(
  "Track",
  new mongoose.Schema({
    key: String,
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
  })
);

module.exports = Track;
