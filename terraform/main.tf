terraform {
    required_providers {
      aws = {
        source = "hashicorp/aws"
        version = " >= 5.97.0"
      }
    }
}

module "api_gateway" {
  source = "./api_gateway"
}