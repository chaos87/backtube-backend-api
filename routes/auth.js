const express = require('express');
const cognitoRouter = express.Router();
global.fetch = require('node-fetch');
global.navigator = () => null;

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
   UserPoolId: "us-east-2_a7zHnPmVg",
   ClientId: "13jgajqggg04mq38g14iv6lba5"
};

const pool_region = "us-east-2";
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

cognitoRouter.post('/register', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var attributeList = [];

    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));
    try {
        userPool.signUp(name, password, attributeList, null, function (err, result) {
          if (err)
              callback(err);
          var cognitoUser = result.user;
          res.send(JSON.stringify(cognitoUser))
        })
    } catch (exception) {
        res.status(400).send(exception)
    }
})

cognitoRouter.post('/login', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var userName = req.body.name;
    var password = req.body.password;
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
         Username: userName,
         Password: password
     });
     var userData = {
         Username: userName,
         Pool: userPool
     }
     var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
     cognitoUser.authenticateUser(authenticationDetails, {
         onSuccess: function (result) {
            var accesstoken = result.getAccessToken()//.getJwtToken();
            res.send(JSON.stringify(accesstoken))

         },
         onFailure: (function (err) {
            res.status(401).send(err)
        })
    })
});

module.exports = cognitoRouter;
