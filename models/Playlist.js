const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
  title: String,
  review: String,
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
  }],
  tags: [String],
  private: {
    type: Boolean,
    default: false
  },
  themes: [{
      type: String,
      ref: "Theme"
  }],
},{
  timestamps: true,
  autoIndex: false,
})

playlistSchema.index({title: 'text', tags: 'text'})

const Playlist = mongoose.model("Playlist", playlistSchema);
Playlist.createIndexes();

module.exports = Playlist;
