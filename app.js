if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require("express");
const http = require("http");
const bandcamp = require('bandcamp-scraper');
const YoutubeStream = require('youtube-audio-stream');
const YoutubeSearcher = require( 'yt-search' )
const cors = require('cors');
const { promisify } = require('util');
const Fs = require('fs')
const socketIo = require("socket.io");

const getAlbumInfo = promisify(bandcamp.getAlbumInfo);
const getAlbumUrls = promisify(bandcamp.getAlbumUrls);
const bandcampSearch = promisify(bandcamp.search);

const app = express();
app.use(express.json())
app.use(cors());
app.use(express.static('public'));
const server = http.createServer(app);

const io = socketIo(server);

app.post('/bandcamp/search', function (req, res) {
    return bandcampSearch(req.body).then(
        response => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send(response)
        }
    )
    .catch(e => res.status(400).send(e.stack))
})

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
                 { videoId: req.body.id }
    YoutubeSearcher( opts, function ( err, r ) {
      if ( err ) return res.status(400).send(err.message)

      return res.status(200).send({"data": r})

    } )
});

app.get('/youtube/stream', (req, res) => {
    const requestUrl = `http://youtube.com/watch?v=${req.query.videoId}`
    try {
      YoutubeStream(requestUrl).pipe(res)
    } catch (exception) {
      res.status(500).send(exception)
    }
    process.on('unhandledRejection', error => {
      // Prints "unhandledRejection woops!"
      res.status(500).send(error)
    });
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

// create socket with client who ordered download
// io.on("connection", (socket) => {
//   console.log("New client connected");
//
//   socket.on("youtube/download", (videoId) => {
//       const YD = new YoutubeMp3Downloader({
//         "ffmpegPath": "ffmpeg",        // Where is the FFmpeg binary located?
//         "outputPath": __dirname + "/public/yt",    // Where should the downloaded and encoded files be stored?
//         "youtubeVideoQuality": "highest",       // What video quality should be used?
//         "queueParallelism": 2,                  // How many parallel downloads/encodes should be started?
//         "progressTimeout": 2000                 // How long should be the interval of the progress reports
//       });
//       console.log('Starting download of', videoId)
//       YD.on("finished", function(err, data) {
//           console.log('Finished downloading')
//           socket.emit('done', JSON.stringify(data));
//       });
//
//       YD.on("error", function(error) {
//           console.log('ERROR', error)
//           socket.emit('error', JSON.stringify(error));
//       });
//
//       YD.on("progress", function(progress) {
//           console.log('Progress', progress)
//           socket.emit('progress', JSON.stringify(progress));
//       });
//
//       process.on('uncaughtException', function (err) {
//           console.log('UNCAUGHT    EXCEPTION - keeping process alive:', err);
//       });
//
//       YD.download(videoId, videoId + '.mp3');
//   })
//   socket.on('disconnect', () => {
//     console.log('client disconnected');
//   });
//
// });

server.listen(process.env.PORT || 5000, () => console.log(`Example app listening at http://localhost:5000`))
