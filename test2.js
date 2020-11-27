const ytdl = require('ytdl-core');

const getVideoInfo = async (videoId) => {
    let info = await ytdl.getBasicInfo(videoId);
    console.log(info)
}

getVideoInfo('QfukpHu_dUU')
