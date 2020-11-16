const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
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
  timestamps: true,
  autoIndex: false,
})

playlistSchema.index({title: 'text'})

const Playlist = mongoose.model("Playlist", playlistSchema);
Playlist.createIndexes();

module.exports = Playlist;
