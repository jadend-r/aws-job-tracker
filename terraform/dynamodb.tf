resource "aws_dynamodb_table" "Applications" {
  name         = "Applications"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId" # Primary key
  range_key = "jobId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "jobId"
    type = "S"
  }
}
