# Api
resource "aws_api_gateway_rest_api" "api" {
  name = "JobTrackerAPI"
}

# /applications resource
resource "aws_api_gateway_resource" "applications" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "applications"
}

# GET for /applications
resource "aws_api_gateway_method" "get" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.applications.id
  http_method   = "GET"
  authorization = "NONE"
}

# Set gateway to integrate with job tracker lambda as a proxy
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.applications.id
  http_method             = aws_api_gateway_method.get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.job_tracker_lambda.invoke_arn
}

# Allow gateway to invoke lambda
resource "aws_lambda_permission" "api_gateway_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.job_tracker_lambda.function_name
  principal     = "apigateway.amazonaws.com"
}

# Create Deployment
resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_integration.lambda_integration))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Create Stage (prod)
resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.deployment.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = "prod"
}

output "full_api_url" {
  value = "https://${aws_api_gateway_rest_api.api.id}.execute-api.us-east-1.amazonaws.com/prod/applications"
}
