const yts = require( 'yt-search' )

const opts = { videoId: 'hhF2a03i65Y' }

yts( opts, function ( err, r ) {
  if ( err ) return "ERROR"

  return console.log(r);

} )
