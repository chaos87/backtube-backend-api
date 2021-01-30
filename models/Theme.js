const mongoose = require("mongoose");

const themeSchema = new mongoose.Schema({
    title: String,
    description: String,
    thumbnail: String,
    playlists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist"
    }],
    tags: [String],
    creator: {
        type: String,
        ref: "User"
    },
  },{
    timestamps: true,
    autoIndex: false,
});

themeSchema.index({title: 'text', description: 'text', tags: 'text'})

const Theme = mongoose.model("Theme", themeSchema);
Theme.createIndexes();

module.exports = Theme;
