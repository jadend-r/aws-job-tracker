import os
import boto3
import json
import uuid
from datetime import datetime
from boto3.dynamodb.conditions import Key
from ..lib.response import default_headers

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")

def get_table():
    return dynamodb.Table(os.environ["JOBS_TABLE_NAME"])

def get_jobs(event):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

    try:
        table = get_table()
        response = table.query(KeyConditionExpression=Key("userId").eq(user_id))
        items = response.get("Items", [])
        jobs_no_uid = [{k: v for k, v in item.items() if k != "userId"} for item in items]

        return {"statusCode": 200, "headers": default_headers, "body": json.dumps(jobs_no_uid)}
    except Exception as e:
        print(e)
        return {"statusCode": 500, "headers": default_headers, "body": json.dumps({"error": "Failed to get job applications"})}


def get_job_by_id(event, job_id):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

    try:
        table = get_table()
        result = table.get_item(Key={"userId": user_id, "jobId": job_id})
        return {"statusCode": 200, "headers": default_headers, "body": json.dumps(result.get("Item"))}
    except Exception as e:
        print(e)
        return {"statusCode": 500, "headers": default_headers, "body": json.dumps({"error": "Failed to get job application"})}


def create_job(event):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    body = json.loads(event.get("body", "{}"))

    job_id = str(uuid.uuid4())
    new_job = {
        "userId": user_id,
        "jobId": job_id,
        "company": body.get("company"),
        "position": body.get("position"),
        "status": body.get("status"),
        "dateApplied": body.get("dateApplied") or datetime.utcnow().strftime("%Y-%m-%d"),
    }

    try:
        table = get_table()
        table.put_item(Item=new_job)
        job_no_uid = {k: v for k, v in new_job.items() if k != "userId"}

        return {"statusCode": 201, "headers": default_headers, "body": json.dumps(job_no_uid)}
    except Exception as e:
        print(e)
        return {"statusCode": 500, "headers": default_headers, "body": json.dumps({"error": "Failed to save job application"})}


def update_job(event, job_id):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    updates = json.loads(event.get("body", "{}"))

    update_expressions = []
    expression_values = {}
    expression_names = {}

    for key, value in updates.items():
        update_expressions.append(f"#{key} = :{key}")
        expression_values[f":{key}"] = value
        expression_names[f"#{key}"] = key

    try:
        table = get_table()
        table.update_item(
            Key={"userId": user_id, "jobId": job_id},
            UpdateExpression="SET " + ", ".join(update_expressions),
            ExpressionAttributeValues=expression_values,
            ExpressionAttributeNames=expression_names,
            ReturnValues="ALL_NEW",
        )

        return {"statusCode": 200, "headers": default_headers, "body": json.dumps({"message": "Update successful"})}
    except Exception as e:
        print(e)
        return {"statusCode": 500, "headers": default_headers, "body": json.dumps({"error": "Failed to update job application"})}


def delete_job(event, job_id):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

    try:
        table = get_table()
        table.delete_item(Key={"userId": user_id, "jobId": job_id})

        return {"statusCode": 204, "headers": default_headers, "body": json.dumps({"message": f"Job {job_id} successfully deleted"})}
    except Exception as e:
        print(e)
        return {"statusCode": 500, "headers": default_headers, "body": json.dumps({"error": "Failed to delete job application"})}


def update_job_status(event, job_id):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    status = json.loads(event.get("body", "{}"))['status']

    allowed_statuses = ["Applied", "Interview", "Offer", "Rejected"]
    if status not in allowed_statuses:
        return {"statusCode": 400, "headers": default_headers, "body": json.dumps({"error": "Invalid status value"})}

    try:
        table = get_table()
        result = table.update_item(
            Key={"userId": user_id, "jobId": job_id},
            UpdateExpression="SET #s = :newStatus",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":newStatus": status},
            ReturnValues="ALL_NEW",
        )

        return {"statusCode": 200, "headers": default_headers, "body": json.dumps(result.get("Attributes"))}
    except Exception as e:
        print(e)
        return {"statusCode": 500, "headers": default_headers, "body": json.dumps({"error": "Failed to update job application"})}
