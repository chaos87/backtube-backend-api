const express = require('express');
const ytdl = require('ytdl-core')
const FFmpeg = require('fluent-ffmpeg')
const { PassThrough } = require('stream')
const fs = require('fs')

youtubeRouter = express.Router();

youtubeRouter.get('/stream', (req, res) => {
        const requestUrl = `http://youtube.com/watch?v=${req.query.videoId}`
        res.setHeader('Access-Control-Allow-Origin', '*');
        opt = {
            audioFormat: 'mp3',
            quality: 'lowestaudio'
        }
        const video = ytdl(requestUrl, opt)
        const { file, audioFormat } = opt
        let stream = file ? fs.createWriteStream(file) : new PassThrough()
        const ffmpeg = new FFmpeg(video)
        process.nextTick(() => {
          const output = ffmpeg.format(audioFormat).pipe(stream)
          ffmpeg.on('error', error => {
              stream.emit('error', error)
              video.end()
              res.status(500).send(error.message);
          })
        //   output.on('error', error => {
        //     video.end()
        //     stream.emit('error', error)
        //     reject(stream)
        //   })
        })

        stream.video = video
        stream.ffmpeg = ffmpeg
        stream.pipe(res)
    });

module.exports = youtubeRouter;
