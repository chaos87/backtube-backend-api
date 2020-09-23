global.fetch = require('node-fetch');
global.navigator = () => null;

const baseURL = 'https://noisedge.herokuapp.com';

const makeBandcampSearchApiCall = async searchInput => {
  const searchUrl = baseURL + `/bandcamp/search`;
  let response = await fetch(searchUrl, {method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({"query": searchInput})}
      ).then(res => {
          return res.json();
      }).catch(error => {
          return error
      });
  const tmpArtistAlbums = await searchBCartistAlbums(baseURL, response.filter(x => x.type === "artist").map(x => x.url));
  const artistAlbums = tmpArtistAlbums.flat().filter(x => !x.includes('?action=download'));
  const nearlyAllAlbums = artistAlbums.concat(response.filter(x => x.type === "album").map(x => x.url));
  console.log(nearlyAllAlbums.filter(x => x.includes('/track/')))
  const trackAlbums = await searchBCtrack4Album(baseURL, nearlyAllAlbums.filter(x => x.includes('/track/')));
  const allAlbumsDuplicated = nearlyAllAlbums.filter(x => !x.includes('/track/')).concat(trackAlbums.filter(x => x));
  const allAlbums = [...new Set(allAlbumsDuplicated)];
  const results = await searchBCalbumDetails(baseURL, allAlbums);
  return {
          albums: results.filter(x => x).filter(x => x.tracks.length > 0)
      };
};

const searchBCalbumDetails = (baseURL, url) => {
  const fetches = [];
  for (let i = 0; i < url.length; i++) {
    fetches.push(
      fetch(baseURL + '/bandcamp/songs', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({"url": url[i]})
      })
      .then(res => {return res.json(); })
      .then(res => {
          const result = {
              "url": res["url"],
              "artist": res["artist"],
              "album": res["title"],
              "cover": res["imageUrl"],
              "tracks": res["raw"]["trackinfo"].filter(x => x.file),
          }
          return result
      })
      .catch(err => {return console.log(err);})
    );
  }
 return Promise.all(fetches)
}

const searchBCtrack4Album = (baseURL, url) => {
  const fetches = [];
  for (let i = 0; i < url.length; i++) {
    fetches.push(
      fetch(baseURL + '/bandcamp/songs', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({"url": url[i]})
      })
      .then(res => {
          return res.json();
      })
      .then(res => {
          return res["raw"]["packages"] ? res["raw"]["packages"][0]["album_url"] : null
      })
      .catch(err => {return console.log(err);})
    );
  }
 return Promise.all(fetches)
}

const searchBCartistAlbums = async (baseURL, artists) => {
  const fetches = [];
  for (let i = 0; i < artists.length; i++) {
    fetches.push(
      fetch(baseURL + '/bandcamp/albums', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({"url": artists[i]})
      })
      .then(res => {return res.json(); })
      .catch(err => {return console.log(err);})
    );
  }
 return Promise.all(fetches)
}

makeBandcampSearchApiCall('primal scream');
