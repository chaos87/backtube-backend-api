const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema({
    _id: { type: String, required : true },
    title: { type: String, required : true },
    artist: { type: String, required : true },
    album: String,
    thumbnail: String,
    source: { type: String, required : true },
    musicSrc: { type: String, required : true },
    duration: { type: Number, required : true },
    playlists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist"
    }],
},{
    timestamps: true,
     autoIndex: false,
})

trackSchema.index({title: 'text', artist: 'text', album: 'text'})

const Track = mongoose.model("Track", trackSchema);
Track.createIndexes();

module.exports = Track;
