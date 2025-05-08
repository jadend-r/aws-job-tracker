# api_gateway_main.tf
# This file defines the root api resource /api, a Cognito authorizer, Api Gateway lambda permission, and API deployment

resource "aws_api_gateway_rest_api" "api" {
  name = "JobTrackerAPI"
}

# /api
resource "aws_api_gateway_resource" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "api"
}

# Auth via Cognito
resource "aws_api_gateway_authorizer" "cognito" {
  name            = "job-tracker-auth"
  rest_api_id     = aws_api_gateway_rest_api.api.id
  identity_source = "method.request.header.Authorization"
  type            = "COGNITO_USER_POOLS"
  provider_arns   = [aws_cognito_user_pool.main.arn]
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gateway_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.job_tracker_lambda.function_name
  principal     = "apigateway.amazonaws.com"
}

# Deployment
resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  triggers = {
    redeployment = sha1(jsonencode({
      jobs_methods             = sort([for m in aws_api_gateway_method.jobs_methods : m.id])
      jobs_integrations        = sort([for i in aws_api_gateway_integration.jobs_methods : i.id])
      jobs_id_methods          = sort([for m in aws_api_gateway_method.jobs_id_methods : m.id])
      jobs_id_integrations     = sort([for i in aws_api_gateway_integration.jobs_id_methods : i.id])
      patch_status_method      = aws_api_gateway_method.patch_status.id
      patch_status_integration = aws_api_gateway_integration.patch_status.id
      cors_jobs                = module.cors_jobs.resource_id
      cors_jobs_id             = module.cors_jobs_id.resource_id
      cors_jobs_id_status      = module.cors_jobs_id_status.resource_id
    }))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.deployment.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = "prod"
}

# Output full base URL
output "full_api_url" {
  value = "https://${aws_api_gateway_rest_api.api.id}.execute-api.us-east-1.amazonaws.com/prod/api/jobs"
}
