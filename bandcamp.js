var bandcamp = require('bandcamp-scraper');
const { Pool, Client } = require('pg')
const { promisify } = require('util');


var getAlbumInfo = promisify(bandcamp.getAlbumInfo);
var getAlbumUrls = promisify(bandcamp.getAlbumUrls);

const client = new Client({
  user: 'musicbrainz',
  host: 'localhost',
  database: 'musicbrainz',
  password: 'musicbrainz',
  port: 5432,
})
client.connect()

const text = `
    SELECT url.url,
           artist.name
    FROM artist
      JOIN l_artist_url ON artist.id = l_artist_url.entity0
      JOIN url ON url.id = l_artist_url.entity1
    WHERE url LIKE '%bandcamp.com%'
    ORDER BY url.url ASC
`

// promise
client
  .query(text)
  .then(res => getAlbumUrls([res.rows[0].url, res.rows[1].url]))
  .then(res => getAlbumInfo(res[0]))
  .then(res => {
    console.log('tracks', res.tracks)
  })
  .catch(e => console.error(e.stack))

// var params = {
//   query: 'Fugazi Red Medecine',
//   page: 1
// };
//
// bandcamp.search(params, function(error, searchResults) {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log(searchResults);
//   }
// });
