# BackTube

[BackTube](https://backtube.app) is a streaming app for music lovers who can create and follow playlists of their favorite songs from Youtube or Bandcamp.

There are 4 different repositories:
- [UI](https://github.com/chaos87/backtube-ui)
- Backend API (this repository)
- [Stream API](https://github.com/chaos87/backtube-stream-api)
- [Youtube Music Search API](https://github.com/chaos87/backtube-ytmusic-api)

## Installation

Use the package manager [npm](https://www.npmjs.com/get-npm) to install the UI.

```bash
npm install
```

## Usage

```bash
npm start
```

Example of API call using cURL

```bash
curl \
  -H 'Content-Type: application/json' \
  -H 'accessToken': <YOUR ACCESS TOKEN>
  -X POST \
  -d '{"searchString": "nirvana"}' \
  http://localhost:5000/api/playlist/search/
```

## Endpoints

- [POST] /public/playlists/recent: Retrieve most recent playlists updated on BackTube (No Authentication needed)
- [POST] /auth/register: Register a user (No Authentication needed)
- [POST] /auth/login: Login (No Authentication needed)
- [POST] /auth/confirm: Confirm user registration (No Authentication needed)
- [POST] /auth/sendConfirmCode: Send confirm registration code to user provided email (No Authentication needed)
- [POST] /auth/refresh: Refresh user session (Authentication needed)
- [PUT] /auth/user: Change username (Authentication needed) (Deprecated soon)
- [PUT] /api/profile/<id>: Update user profile (Authentication needed)
- [GET] /api/profile/<id>: Get user profile (Authentication needed)
- [GET] /api/profile/<id>/playlists: Get user profile with playlists (Authentication needed)
- [GET] /api/profile/<id>/playlistsNoTracks: Get user profile with playlists Id and Title (Authentication needed)
- [GET] /api/playlist: Retrieve all playlists (max = 100) (Authentication needed)
- [POST] /api/playlist: Create a playlist (Authentication needed)
- [PUT] /api/playlist: Update a playlist (Authentication needed)
- [DELETE] /api/playlist: Delete a playlist (Authentication needed)
- [GET] /api/playlist/<id>: Retrieve a playlist and its tracks (Authentication needed)
- [PUT] /api/playlist/<id>/addFollower: Follow playlist (Authentication needed)
- [PUT] /api/playlist/<id>/removeFollower: Unfollow playlist (Authentication needed)
- [POST] /api/playlist/search: Fulltext search for playlists (indexed on playlist title, track title/artist/album) (Authentication needed)
- [GET] /api/track/<id>: Retrieve a specific track (Authentication needed)
- [GET] /api/track: Retrieve all tracks (max = 100) (Authentication needed)
- [GET] /api/track/<id>/playlists: Retrieve all playlists having this track (Authentication needed)

## Live server

Currently deployed on Heroku https://api-backtube.herokuapp.com

## Dependencies

- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [amazon-cognito-identity-js](https://github.com/aws-amplify/amplify-js/tree/master/packages/amazon-cognito-identity-js)
- [cognito express](https://github.com/ghdna/cognito-express)

## Contributing
Please open an issue prior to submitting a pull request, so that we can discuss whether it makes sense to be implemented or not.
Feature ideas or bug reports are more than welcome!

## License
[MIT](https://choosealicense.com/licenses/mit/)
