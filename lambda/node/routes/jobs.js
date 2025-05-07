const { defaultHeaders } = require("../lib/response.js");
const crypto = require("crypto");

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const ddb = DynamoDBDocumentClient.from(client);

const jobTableName = "Applications"

exports.getJobs = async (event) => {
  const userId = event.requestContext.authorizer.claims.sub;

  const getJobsCommand = new QueryCommand({
    TableName: jobTableName,
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: {
      ":uid": userId,
    },
  });

  try {
    const result = await ddb.send(getJobsCommand);

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify(result.Items),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ error: "Failed to get job applications" }),
    };
  }

}

exports.getJobById = async (event, id) => {
  const userId = event.requestContext.authorizer.claims.sub;

  const getJobByIdCommand = new GetCommand({
    TableName: jobTableName,
    Key: {
      userId: userId,
      jobId: id
    }
  });

  try {
    const result = await ddb.send(getJobByIdCommand);

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify(result.Items),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ error: "Failed to get job application" }),
    };
  }
};

exports.createJob = async (event) => {
  const userId = event.requestContext.authorizer.claims.sub;
  const newApp = JSON.parse(event.body || '{}');
  const jobId = crypto.randomUUID();

  const item = {
    userId,
    jobId,
    company: newApp.company,
    position: newApp.position,
    status: newApp.status,
    dateApplied: newApp.dateApplied || new Date().toISOString().split("T")[0],
  };

  try {
    await ddb.send(new PutCommand({
      TableName: jobTableName,
      Item: item,
    }));

    return {
      statusCode: 201,
      headers: defaultHeaders,
      body: JSON.stringify(item),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ error: "Failed to save job application" }),
    };
  }
};

exports.updateJob = async (event, id) => {
  const userId = event.requestContext.authorizer.claims.sub;
  const updates = JSON.parse(event.body || '{}');

  const updateExpressions = [];
  const expressionValues  = {};
  for (const key in updates) {
    updateExpressions.push(`${key} = :${key}`);
    expressionValues[`:${key}`] = updates[key];
  }

  const command = new UpdateCommand({
    TableName: jobTableName,
    Key: {
      userId: userId,
      jobId: id
    },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeValues: expressionValues,
    ReturnValues: "ALL_NEW",
  });

  try {
    await ddb.send(command)

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify({ message: "Update successful"})
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ error: "Failed to update job application"})
    }
  }
};

exports.deleteJob = async (event, id) => {
  const userId = event.requestContext.authorizer.claims.sub;
  
  const deleteJobByIdCommand = new DeleteCommand({
    TableName: jobTableName,
    Key: {
      userId: userId,
      jobId: id
    }
  });

  try {
    const result = await ddb.send(deleteJobByIdCommand);

    return {
      statusCode: 204,
      headers: defaultHeaders,
      body: JSON.stringify({ message: `Job ${id} successfully deleted` }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ error: "Failed to delete job application" }),
    };
  }
};
