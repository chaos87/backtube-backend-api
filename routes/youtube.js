const express = require('express');
const YoutubeStream = require('../ytstream');

youtubeRouter = express.Router();

let currentYTprovider = 'pythonanywhere'
const YTproviders = {
    'pythonanywhere': 'https://chaos87.pythonanywhere.com',
    'heroku': 'https://chaos87.herokuapp.com'
}

// youtubeRouter.post('/search', (req, res) => {
//     baseURL = YTproviders.currentYTprovider
//
// });

youtubeRouter.get('/stream', (req, res) => {
    const requestUrl = `http://youtube.com/watch?v=${req.query.videoId}`
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      YoutubeStream(requestUrl).pipe(res)
    } catch (exception) {
      res.status(500).send(exception)
    }
    // process.on('unhandledRejection', error => {
    //   // Prints "unhandledRejection woops!"
    //   res.status(500).send(error)
    // });
});


module.exports = youtubeRouter;
