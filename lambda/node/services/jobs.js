const { defaultHeaders } = require("../lib/response.js");
const crypto = require("crypto");

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const ddb = DynamoDBDocumentClient.from(client);

const jobTableName = process.env.JOBS_TABLE_NAME;

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
    const allJobs = result.Items || [];
    const jobsNoUid = allJobs.map(({userId, ...rest}) => rest);

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify(jobsNoUid),
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

  const newJob = {
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
      Item: newJob,
    }));

    const { userId, ...newJobNoUid } = newJob;

    return {
      statusCode: 201,
      headers: defaultHeaders,
      body: JSON.stringify(newJobNoUid),
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
  const expressionNames = {};
  for (const key in updates) {
    updateExpressions.push(`#${key} = :${key}`);
    expressionValues[`:${key}`] = updates[key];
    expressionNames[`#${key}`] = key
  }

  const command = new UpdateCommand({
    TableName: jobTableName,
    Key: {
      userId: userId,
      jobId: id
    },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeValues: expressionValues,
    ExpressionAttributeNames: expressionNames,
    ReturnValues: "ALL_NEW",
  });

  try {
    await ddb.send(command);

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

exports.updateJobStatus = async (event, id) => {
  const userId = event.requestContext.authorizer.claims.sub;
  const { status } = JSON.parse(event.body || {});

  const allowedStatuses = ['Applied', 'Interview', 'Offer', 'Rejected'];
  if (!allowedStatuses.includes(status)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid status value' }),
    };
  }

  const command = new UpdateCommand({
    TableName:jobTableName,
    Key: {
      userId: userId,
      jobId: jobId,
    },
    UpdateExpression: "SET #s = :newStatus",
    ExpressionAttributeNames: {
      "#s": "status",
    },
    ExpressionAttributeValues: {
      ":newStatus": newStatus,
    },
    ReturnValues: "ALL_NEW"
  });

  try {
    const result = await ddb.send(command);

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify(result.Attr)
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ error: "Failed to update job application"})
    }
  }

}