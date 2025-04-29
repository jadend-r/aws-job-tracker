resource "aws_dynamodb_table" "Applications" {
    name = "Applications"
    billing_mode = "PAY_PER_REQUEST"
    hash_key = "JobId" # Primary key

    attribute {
        name = "JobId"
        type = "S"
    }
}