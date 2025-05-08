resource "aws_lambda_function" "job_tracker_lambda" {
  filename      = "../lambda/node/job_tracker_lambda.zip"
  function_name = "job-tracker-handler"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_exec_role.arn

  environment {
    variables = {
      JOBS_TABLE_NAME = aws_dynamodb_table.Applications.name
    }
  }

  source_code_hash = filebase64sha256("../lambda/node/job_tracker_lambda.zip")
}
