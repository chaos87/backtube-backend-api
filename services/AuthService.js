global.fetch = require('node-fetch');
global.navigator = () => null;

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
   UserPoolId: "us-east-2_a7zHnPmVg",
   ClientId: "13jgajqggg04mq38g14iv6lba5"
};


const pool_region = "us-east-2";
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

exports.Register = function (body, callback) {
   var name = body.name;
   var email = body.email;
   var password = body.password;
   var attributeList = [];

   attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));
   userPool.signUp(name, password, attributeList, null, function (err, result) {
     if (err)
         callback(err);
     var cognitoUser = result.user;
     callback(null, cognitoUser);
   })
}

exports.Login = function (body, callback) {
   var userName = body.name;
   var password = body.password;
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
           callback(null, accesstoken);
        },
        onFailure: (function (err) {
           callback(err);
       })
   })
};
