# S3 bucket to host frontend
resource "aws_s3_bucket" "frontend" {
  bucket = "aws-job-tracker-frontend-prod" 
  force_destroy = true              # Destroys bucket even if non-empty
}

# Enable static website hosting
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Allow public access to S3 bucket objects
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 bucket policy to allow public reads
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid = "PublicReadGetObject",
        Effect = "Allow",
        Principal = "*",
        Action = "s3:GetObject",
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

output "website_url" {
  value = aws_s3_bucket_website_configuration.frontend.website_endpoint
}
