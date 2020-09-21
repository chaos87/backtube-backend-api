if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require("express");
const CognitoExpress = require("cognito-express");
const cors = require('cors');
var bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//Initializing CognitoExpress constructor
const cognitoExpress = new CognitoExpress({
	region: "us-east-2",
	cognitoUserPoolId: "us-east-2_a7zHnPmVg",
	tokenUse: "access", //Possible Values: access | id
	tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
});

module.exports = cognitoExpress;

const youtubeRoutes = require('./routes/youtube');
const bandcampRoutes = require('./routes/bandcamp');
const authRoutes = require('./routes/auth');
const backtubeRoutes = require('./routes/api');

app.use('/youtube', youtubeRoutes);
app.use('/bandcamp', bandcampRoutes);
app.use('/auth', authRoutes);
app.use('/api', backtubeRoutes);

app.get('/health', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send({"message": "alive & kicking!"})
})

app.listen(process.env.PORT || 5000, () => console.log(`Example app listening at http://localhost:5000`))
