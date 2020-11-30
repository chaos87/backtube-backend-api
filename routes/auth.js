const express = require('express');
const cognitoRouter = express.Router();
const AWS = require('aws-sdk');
const moment = require('moment');
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
const UserModel = require('../models/User');

cognitoRouter.post('/register', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const name = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const attributeList = [];

    // verify email does not exist
    const params = {
      UserPoolId: poolData.UserPoolId,
      AttributesToGet: [
        'email',
      ],
    };

    AWS.config.update({ region: pool_region, 'accessKeyId': process.env.AWS_ACCESS_KEY_ID, 'secretAccessKey': process.env.AWS_SECRET_ACCESS_KEY });
    const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    cognitoidentityserviceprovider.listUsers(params, (err, data) => {
        if (err) {
            return res.status(400).json({"error": err.message});
        }
        else {
            const emailList = data.Users.map(a => a.Attributes[0].Value)
            if (emailList.includes(email)) {
                return res.status(400).json({"error": "User already exists"});
            }

            // dynamodb config
            const docClient = new AWS.DynamoDB.DocumentClient();

            attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));
            attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "preferred_username", Value: name }));
            try {
                userPool.signUp(name, password, attributeList, null, function (err, result) {
                    if (err) {
                      return res.status(400).json({"error": err.message});
                    }
                    // save to mongodb
                    let newUser = new UserModel({
                        username: req.body.username,
                    });
                    newUser._id = result.userSub;
                    newUser.save().then(data => {
                        res.json(result)
                    })
                })
            } catch (err) {
                res.status(400).json({"error": err.message})
            }
        }
    })
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

cognitoRouter.put('/user', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var userName = req.body.username;
    var accessToken = req.body.accessToken;
    var params = {
      AccessToken: accessToken, /* required */
      UserAttributes: [ /* required */
        {
          Name: 'preferred_username', /* required */
          Value: userName
        },
        /* more items */
      ]
    };
    AWS.config.update({ region: pool_region, 'accessKeyId': process.env.AWS_ACCESS_KEY_ID, 'secretAccessKey': process.env.AWS_SECRET_ACCESS_KEY });
    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    cognitoidentityserviceprovider.updateUserAttributes(params,
      function (err, result) {
          if (err) {
            console.log(err)
            return res.status(400).json({"error": err.message});
          }
          res.json(result)
    });
});

module.exports = cognitoRouter;
