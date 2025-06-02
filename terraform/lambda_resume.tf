# Lambda for handling resume uploads

resource "aws_lambda_function" "resume_lambda" {
  filename         = "../lambda/python/resumes/resume_lambda.zip"
  function_name    = "resume-handler"
  handler          = "main.handler"
  runtime          = "python3.11"
  role             = aws_iam_role.resume_lambda_exec_role.arn

  environment {
    variables = {
      RESUME_BUCKET = aws_s3_bucket.resume_bucket.bucket
    }
  }

  source_code_hash = filebase64sha256("../lambda/python/resumes/resume_lambda.zip")
}

resource "aws_s3_bucket" "resume_bucket" {
  bucket = "aws-job-tracker-prod-resumes"
}

resource "aws_s3_bucket_public_access_block" "resume_bucket_block" {
  bucket = aws_s3_bucket.resume_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# IAM Role for resume Lambda
resource "aws_iam_role" "resume_lambda_exec_role" {
  name = "resume-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Logging policy
resource "aws_iam_role_policy_attachment" "resume_lambda_logging" {
  role       = aws_iam_role.resume_lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# S3 access policy
resource "aws_iam_policy" "resume_s3_policy" {
  name = "resume-lambda-s3-policy"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = ["s3:GetObject", "s3:PutObject"],
        Resource = ["${aws_s3_bucket.resume_bucket.arn}/*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "resume_s3_attach" {
  role       = aws_iam_role.resume_lambda_exec_role.name
  policy_arn = aws_iam_policy.resume_s3_policy.arn
}

# API Gateway resource: /api/resumes
resource "aws_api_gateway_resource" "resumes" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "resumes"
}

# POST /api/resumes/upload
resource "aws_api_gateway_resource" "resumes_upload" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.resumes.id
  path_part   = "upload"
}

resource "aws_api_gateway_method" "resumes_upload" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.resumes_upload.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "resumes_upload" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.resumes_upload.id
  http_method             = aws_api_gateway_method.resumes_upload.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.resume_lambda.invoke_arn
  passthrough_behavior    = "WHEN_NO_MATCH"
}

# GET /api/resumes/preview
resource "aws_api_gateway_resource" "resumes_preview" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.resumes.id
  path_part   = "preview"
}

resource "aws_api_gateway_method" "resumes_preview" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.resumes_preview.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "resumes_preview" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.resumes_preview.id
  http_method             = aws_api_gateway_method.resumes_preview.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.resume_lambda.invoke_arn
  passthrough_behavior    = "WHEN_NO_MATCH"
}

# Lambda permission for API Gateway to invoke resume Lambda
resource "aws_lambda_permission" "resume_api_gateway_permission" {
  statement_id  = "AllowAPIGatewayInvokeResume"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.resume_lambda.function_name
  principal     = "apigateway.amazonaws.com"
}
