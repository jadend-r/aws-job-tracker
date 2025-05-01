terraform {
  backend "s3" {
    bucket         = "terraform-state-aws-job-tracker-prod"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    use_lockfile = true
  }
}