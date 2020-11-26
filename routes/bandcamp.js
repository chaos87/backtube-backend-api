const express = require('express');
// const bandcamp = require('bandcamp-scraper');
const bandcamp = require('../tmp/bandcamp');
const bandcampStream = require('../tmp/bandcamp/stream');
const { promisify } = require('util');

const getAlbumInfo = promisify(bandcamp.getAlbumInfo);
const getAlbumUrls = promisify(bandcamp.getAlbumUrls);
const bandcampSearch = promisify(bandcamp.search);

bandcampRouter = express.Router();

bandcampRouter.post('/search', function (req, res) {
    return bandcampSearch(req.body).then(
        response => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send(response)
        }
    )
    .catch(e => res.status(400).send(e.stack))
})

bandcampRouter.post('/albums', function (req, res) {
    return getAlbumUrls(req.body.url).then(
        response => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send(response)
        }
    )
    .catch(e => res.status(400).send(e.stack))
})

bandcampRouter.post('/songs', function (req, res) {
    return getAlbumInfo(req.body.url).then(
        response => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send(response)
        }
    )
    .catch(e => res.status(400).send(e.stack))
  })

bandcampRouter.get('/stream', function (req, res) {
  bandcampStream.getTrack(req.query.url).then(function(stream) {
      stream.pipe(res)
  }).catch(function(err) {
      res.status(500).send(err.message)
  });
})


 module.exports = bandcampRouter;
