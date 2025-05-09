# jobs_api_gateway.tf
# This file defines explicit resources for /api/jobs and related paths

# ------------------
# /api/jobs
resource "aws_api_gateway_resource" "jobs" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "jobs"
}

# /api/jobs/{id}
resource "aws_api_gateway_resource" "jobs_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.jobs.id
  path_part   = "{id}"
}

# /api/jobs/{id}/status
resource "aws_api_gateway_resource" "jobs_id_status" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.jobs_id.id
  path_part   = "status"
}

# ------------------
# /api/jobs METHODS
locals {
  jobs_methods = {
    GET    = { resource = aws_api_gateway_resource.jobs.id }
    POST   = { resource = aws_api_gateway_resource.jobs.id }
  }
}

resource "aws_api_gateway_method" "jobs_methods" {
  for_each     = local.jobs_methods
  rest_api_id  = aws_api_gateway_rest_api.api.id
  resource_id  = each.value.resource
  http_method  = each.key
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "jobs_methods" {
  for_each                = local.jobs_methods
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = each.value.resource
  http_method             = each.key
  integration_http_method = "POST"
  passthrough_behavior    = "NEVER"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.job_tracker_lambda.invoke_arn
}

# ------------------
# /api/jobs/{id} METHODS
locals {
  jobs_id_methods = {
    GET    = { resource = aws_api_gateway_resource.jobs_id.id },
    PUT    = { resource = aws_api_gateway_resource.jobs_id.id },
    DELETE = { resource = aws_api_gateway_resource.jobs_id.id }
  }
}

resource "aws_api_gateway_method" "jobs_id_methods" {
  for_each     = local.jobs_id_methods
  rest_api_id  = aws_api_gateway_rest_api.api.id
  resource_id  = each.value.resource
  http_method  = each.key
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "jobs_id_methods" {
  for_each                = local.jobs_id_methods
  for_each                = local.jobs_id_methods
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = each.value.resource
  http_method             = each.key
  integration_http_method = "POST"
  passthrough_behavior    = "NEVER"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.job_tracker_lambda.invoke_arn
}

# ------------------
# /api/jobs/{id}/status PATCH
resource "aws_api_gateway_method" "patch_status" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.jobs_id_status.id
  http_method   = "PATCH"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "patch_status" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.jobs_id_status.id
  http_method             = aws_api_gateway_method.patch_status.http_method
  integration_http_method = "POST"
  passthrough_behavior    = "NEVER"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.job_tracker_lambda.invoke_arn
}

# -----------------
# CORS for job resources

# /api/jobs
module "cors_jobs" {
  source        = "./modules/api_gateway_cors"
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.jobs.id
  allowed_methods = "GET,POST,OPTIONS"
}

# /api/jobs/{id}
module "cors_jobs_id" {
  source        = "./modules/api_gateway_cors"
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.jobs_id.id
  allowed_methods = "GET,PUT,DELETE,OPTIONS"
}

 # /api/jobs/{id}/status
module "cors_jobs_id_status" {
  source        = "./modules/api_gateway_cors"
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.jobs_id_status.id
  allowed_methods = "PATCH,OPTIONS"
}
