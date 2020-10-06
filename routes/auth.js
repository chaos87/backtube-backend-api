const express = require('express');
const cognitoRouter = express.Router();
global.fetch = require('node-fetch');
global.navigator = () => null;

const COGNITO_APP_ID = "13jgajqggg04mq38g14iv6lba5";

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
   UserPoolId: "us-east-2_a7zHnPmVg",
   ClientId: COGNITO_APP_ID
};

const pool_region = "us-east-2";
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

cognitoRouter.post('/register', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var name = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var attributeList = [];

    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));
    try {
        userPool.signUp(name, password, attributeList, null, function (err, result) {
            if (err) {
              return res.status(400).json({"error": err.message});
            }
            res.json(result)
        })
    } catch (err) {
        res.status(400).json({"error": err.message})
    }
})

cognitoRouter.post('/login', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var userName = req.body.username;
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
            res.json(result)
         },
         onFailure: (function (err) {
            res.status(401).json({"error": err.message})
        })
    })
});

cognitoRouter.post('/refresh', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var refreshToken = req.body.refreshToken;
    var userName = req.body.username;
    var userData = {
        Username: userName,
        Pool: userPool
    }
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    var token = new AmazonCognitoIdentity.CognitoRefreshToken({RefreshToken: refreshToken});
    cognitoUser.refreshSession(token,
      function (err, result) {
          if (err) {
            return res.status(400).json({"error": err.message});
          }
          res.json(result)
    });
});

cognitoRouter.post('/confirm', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var code = req.body.code;
    var userName = req.body.username;
    var userData = {
        Username: userName,
        Pool: userPool
    }
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmRegistration(code, true,
      function (err, result) {
          if (err) {
            return res.status(400).json({"error": err.message});
          }
          res.json(result)
    });
});

cognitoRouter.post('/sendConfirmCode', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var userName = req.body.username;
    var userData = {
        Username: userName,
        Pool: userPool
    }
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.resendConfirmationCode(
      function (err, result) {
          if (err) {
            return res.status(400).json({"error": err.message});
          }
          res.json(result)
    });
});

module.exports = cognitoRouter;
