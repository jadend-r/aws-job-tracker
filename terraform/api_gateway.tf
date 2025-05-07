# API Gateway
resource "aws_api_gateway_rest_api" "api" {
  name = "JobTrackerAPI"
}

# /api
resource "aws_api_gateway_resource" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "api"
}

# /api/{proxy+}
resource "aws_api_gateway_resource" "api_proxy" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "{proxy+}"
}

locals {
  protected_methods = ["GET", "POST", "PUT", "DELETE"]
}

# [GET, POST, PUT, DELETE] methods for /api/{proxy+}
resource "aws_api_gateway_method" "proxy_methods" {
  for_each     = toset(local.protected_methods)
  rest_api_id  = aws_api_gateway_rest_api.api.id
  resource_id  = aws_api_gateway_resource.api_proxy.id
  http_method  = each.key
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# [GET, POST, PUT, DELETE] /api/* -> Lambda integration
resource "aws_api_gateway_integration" "proxy_methods_integration" {
  for_each                = aws_api_gateway_method.proxy_methods
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.api_proxy.id
  http_method             = each.key
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.job_tracker_lambda.invoke_arn
}

# Add unauthenticated OPTIONS method to /api/{proxy+} for CORS preflight
resource "aws_api_gateway_method" "api_proxy_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.api_proxy.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Mock response for OPTIONS method
resource "aws_api_gateway_integration" "api_proxy_options_integration" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.api_proxy.id
  http_method             = aws_api_gateway_method.api_proxy_options_method.http_method
  type                    = "MOCK"
  integration_http_method = "POST"
  passthrough_behavior    = "NEVER"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Add CORS headers to mock response
resource "aws_api_gateway_integration_response" "api_proxy_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.api_proxy.id
  http_method = aws_api_gateway_integration.api_proxy_options_integration.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'https://dcli3b34ssmw2.cloudfront.net'" #TODO: use env var
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
  }

  response_templates = {
    "application/json" = ""
  }
}

# Allow headers to be returned in response
resource "aws_api_gateway_method_response" "api_proxy_options_method_response" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.api_proxy.id
  http_method = aws_api_gateway_integration_response.api_proxy_options_integration_response.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}


# Root path (/) should not be protected
resource "aws_api_gateway_method" "root_any" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_rest_api.api.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "root_lambda" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_rest_api.api.root_resource_id
  http_method             = aws_api_gateway_method.root_any.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.job_tracker_lambda.invoke_arn
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
      root_integration     = aws_api_gateway_integration.root_lambda.id
      root_method          = aws_api_gateway_method.root_any.id
      proxy_methods        = sort([for m in aws_api_gateway_method.proxy_methods : m.id])
      proxy_integrations   = sort([for i in aws_api_gateway_integration.proxy_methods_integration : i.id])
      options_method       = aws_api_gateway_method.api_proxy_options_method.id
      options_integration  = aws_api_gateway_integration.api_proxy_options_integration.id
      options_response     = aws_api_gateway_integration_response.api_proxy_options_integration_response.id
      options_method_resp  = aws_api_gateway_method_response.api_proxy_options_method_response.id
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
