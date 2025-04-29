const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const table = process.env.TABLE_NAME;

exports.handler = async (event) => {
  const params = {
    TableName: table
  };
  
  const data = await dynamo.scan(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify("AWS is cool!")
  };
};
