if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require("express");
const bandcamp = require('bandcamp-scraper');
const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const YoutubeSearcher = require( 'yt-search' )
const cors = require('cors');
const { promisify } = require('util');
const Fs = require('fs')

const getAlbumInfo = promisify(bandcamp.getAlbumInfo);
const getAlbumUrls = promisify(bandcamp.getAlbumUrls);

const app = express();
app.use(express.json())
app.use(cors());
app.use(express.static('public'));

app.post('/bandcamp/albums', function (req, res) {
    return getAlbumUrls(req.body.url).then(
        response => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send(response)
        }
    )
    .catch(e => res.status(400).send(e.stack))
})

app.post('/bandcamp/songs', function (req, res) {
    return getAlbumInfo(req.body.url).then(
        response => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send(response)
        }
    )
    .catch(e => res.status(400).send(e.stack))
  })

app.post('/youtube/download', (req, res) => {
    // create Youtube downloader instance
    const YD = new YoutubeMp3Downloader({
        "ffmpegPath": "ffmpeg",        // Where is the FFmpeg binary located?
        "outputPath": __dirname + "/public/yt",    // Where should the downloaded and encoded files be stored?
        "youtubeVideoQuality": "highest",       // What video quality should be used?
        "queueParallelism": 2,                  // How many parallel downloads/encodes should be started?
        "progressTimeout": 2000                 // How long should be the interval of the progress reports
    });
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('Start downloading')
    YD.download(req.body.videoId, req.body.videoId + '.mp3');

    YD.on("finished", function(err, data) {
        console.log('Finished downloading')
        res.status(200).write(JSON.stringify(data));
        res.end();
    });

    YD.on("error", function(error) {
        console.log('ERROR', error)
        res.status(400).send({"message": 'Something went wrong:' + error})
    });

    YD.on("progress", function(progress) {
        res.status(202).write(JSON.stringify(progress));
    });
});

app.post('/youtube/search', (req, res) => {
    YoutubeSearcher( req.body.query, function ( err, r ) {
      if ( err ) return res.status(400).send(err.message)
      const videos = r.videos
      const playlists = r.playlists || r.lists

      return res.status(200).send({"data": req.body.type == 'playlist' ?
                                    playlists : req.body.type == 'video' ?
                                    videos : r})

    } )
});
app.post('/youtube/searchById', (req, res) => {
    const opts = req.body.type == 'playlist'? {listId: req.body.id} :
                 {videoId: req.body.id}
    YoutubeSearcher( opts, function ( err, r ) {
      if ( err ) return res.status(400).send(err.message)

      return res.status(200).send({"data": r})

    } )
});

app.post('/cleanup', (req, res) => {
    // Check api key
    if ( 'key' in req.body && req.body.key == "gLCZU4KfPBmxMNQm") {
        console.log('Start cleanup')
        // current date
        let curDate = new Date();
        // min date
        let minDate = curDate.setHours( curDate.getHours() - req.body.lag )
        Fs.readdir(__dirname + "/public/yt", (err,files) => {
             files.forEach(file => {
                 const { birthtime } = Fs.statSync(__dirname + "/public/yt/" + file);
                 if (birthtime < minDate) {
                    try {
                      Fs.unlinkSync(__dirname + "/public/yt/" + file)
                      //file removed
                      console.log("removed file:", file)
                    } catch(err) {
                      console.error(err)
                    }
                 }
             });
             console.log('Finished cleanup')
             return res.status(200).send({"message": "Cleanup done"})
         });
    } else {
        return res.status(401).send({"message": "You are not authorized to perform this action."})
    }
});

app.listen(process.env.PORT || 5000, () => console.log(`Example app listening at http://localhost:5000`))

module.exports = app
