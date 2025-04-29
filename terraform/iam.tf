resource "aws_iam_role" "lambda_exec_role" {
    name = "job-tracker-lambda-role"

    assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

# Allow lambda to log (cloudwatch)
resource "aws_iam_role_policy_attachment" "lambda_logging" {
role   = aws_iam_role.lambda_exec_role.name
policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Allow lambda to talk to dynamo
resource "aws_iam_policy" "dynamo_policy" {
  name = "lambda-dynamodb-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["dynamodb:*"]
      Resource = [aws_dynamodb_table.Applications.arn]
    }]
  })
}


resource "aws_iam_role_policy_attachment" "lambda_dynamo_attach" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.dynamo_policy.arn
}