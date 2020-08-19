const yts = require( 'yt-search' )

yts( 'superman theme', function ( err, r ) {
  if ( err ) throw err

  const videos = r.videos
  videos.forEach( function ( v ) {
    const views = String( v.views ).padStart( 10, ' ' )
    console.log( `${ views } | ${ v.title } (${ v.timestamp }) | ${ v.author.name }` )
  } )
} )

// promises also supported
// const r = await yts( 'superman theme' )
