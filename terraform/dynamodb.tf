resource "aws_dynamodb_table" "Applications" {
  name         = "Applications"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "jobId" # Primary key

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "jobId"
    type = "S"
  }
}
