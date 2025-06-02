import json
import pytest
import os
from unittest.mock import MagicMock
from ..main import handler
from ..services import jobs

@pytest.fixture
def mock_dynamo(monkeypatch):
    mock_table = MagicMock()
    monkeypatch.setattr(jobs, "get_table", lambda: mock_table)
    return mock_table

@pytest.fixture(autouse=True)
def set_env_vars():
    os.environ["JOBS_TABLE_NAME"] = "test-jobs-table"

@pytest.fixture
def event():
    return {
        "requestContext": {"authorizer": {"claims": {"sub": "test-user"}}},
        "body": json.dumps({"company": "OpenAI", "position": "Engineer", "status": "Applied"}),
        "pathParameters": {"id": "test-job-id"},
        "httpMethod": "GET",
        "resource": "/api/jobs"
    }

def test_get_jobs_success(mock_dynamo, event):
    event["httpMethod"] = "GET"
    mock_dynamo.query.return_value = {"Items": [{"userId": "test-user", "jobId": "123", "company": "OpenAI"}]}

    response = handler(event)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert len(body) == 1
    assert body[0]["company"] == "OpenAI"

def test_get_jobs_failure(mock_dynamo, event):
    event["httpMethod"] = "GET"
    mock_dynamo.query.side_effect = Exception("DynamoDB error!")

    response = handler(event)
    assert response["statusCode"] == 500
    body = json.loads(response["body"])
    assert "Failed to get job applications" in body["error"]

def test_get_job_by_id_success(mock_dynamo, event):
    event["resource"] = "/api/jobs/{id}"
    event["httpMethod"] = "GET"
    mock_dynamo.get_item.return_value = {"Item": {"userId": "test-user", "jobId": "test-job-id", "company": "OpenAI"}}

    response = handler(event)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["jobId"] == "test-job-id"

def test_create_job_success(mock_dynamo, event):
    event["resource"] = "/api/jobs"
    event["httpMethod"] = "POST"

    response = handler(event)
    assert response["statusCode"] == 201
    body = json.loads(response["body"])
    assert body["company"] == "OpenAI"
    assert body["position"] == "Engineer"

def test_update_job_success(mock_dynamo, event):
    event["resource"] = "/api/jobs/{id}"
    event["httpMethod"] = "PUT"
    event["body"] = json.dumps({"status": "Interview"})

    response = handler(event)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["message"] == "Update successful"

def test_delete_job_success(mock_dynamo, event):
    event["resource"] = "/api/jobs/{id}"
    event["httpMethod"] = "DELETE"

    response = handler(event)
    assert response["statusCode"] == 204

def test_update_job_status_invalid(mock_dynamo, event):
    event["resource"] = "/api/jobs/{id}/status"
    event["httpMethod"] = "PATCH"
    event["body"] = json.dumps({"status": "InvalidStatus"})

    response = handler(event)
    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert "Invalid status value" in body["error"]

def test_update_job_status_success(mock_dynamo, event):
    event["resource"] = "/api/jobs/{id}/status"
    event["httpMethod"] = "PATCH"
    event["body"] = json.dumps({"status": "Interview"})
    mock_dynamo.update_item.return_value = {"Attributes": {"status": "Interview"}}

    response = handler(event)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["status"] == "Interview"
