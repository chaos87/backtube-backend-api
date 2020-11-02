const AWS = require('aws-sdk');
const pool_region = "us-east-2";

async function getUserId(token) {
    AWS.config.update({ region: pool_region, 'accessKeyId': process.env.AWS_ACCESS_KEY_ID, 'secretAccessKey': process.env.AWS_SECRET_ACCESS_KEY });
    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    var params = {
        AccessToken: token
    }
    let result = await cognitoidentityserviceprovider.getUser(params).promise();
    return result.UserAttributes.filter(obj => {
              return obj.Name === 'sub'
          })[0].Value;
}

module.exports = getUserId;
