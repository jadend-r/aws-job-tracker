from .services.jobs import (
    get_jobs,
    get_job_by_id,
    create_job,
    update_job,
    delete_job,
    update_job_status
)
from .lib.response import default_headers

def handler(event):
    http_method = event.get("httpMethod")
    resource = event.get("resource")
    path_parameters = event.get("pathParameters") or {}

    # /api/jobs
    if resource == "/api/jobs" and http_method == "GET":
        return get_jobs(event)

    if resource == "/api/jobs" and http_method == "POST":
        return create_job(event)

    # /api/jobs/{id}
    if resource == "/api/jobs/{id}" and http_method == "GET":
        return get_job_by_id(event, path_parameters.get("id"))

    if resource == "/api/jobs/{id}" and http_method == "PUT":
        return update_job(event, path_parameters.get("id"))

    if resource == "/api/jobs/{id}" and http_method == "DELETE":
        return delete_job(event, path_parameters.get("id"))

    # /api/jobs/{id}/status
    if resource == "/api/jobs/{id}/status" and http_method == "PATCH":
        return update_job_status(event, path_parameters.get("id"))

    # 404 fallback
    return {
        "statusCode": 404,
        "headers": default_headers,
        "body": '{"error": "Route not found"}'
    }
