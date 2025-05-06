# Create Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "job-tracker-user-pool"

  username_attributes = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length = 8
    require_numbers = true
    require_uppercase = true
    require_lowercase = true
    require_symbols = false
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
}

# App client (for frontend use)
resource "aws_cognito_user_pool_client" "frontend_app" {
  name         = "job-tracker-frontend"
  user_pool_id = aws_cognito_user_pool.main.id
  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]

  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true

  callback_urls = ["https://dcli3b34ssmw2.cloudfront.net/login-redirect"] #TODO: make env var
  logout_urls   = ["https://dcli3b34ssmw2.cloudfront.net"]
  supported_identity_providers = ["COGNITO"]
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "job-tracker-app-${random_string.suffix.result}"
  user_pool_id = aws_cognito_user_pool.main.id
}

resource "random_string" "suffix" {
  length  = 6
  upper   = false
  special = false
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_app_client_id" {
  value = aws_cognito_user_pool_client.frontend_app.id
}

output "cognito_login_url" {
  value = "https://${aws_cognito_user_pool_domain.main.domain}.auth.us-east-1.amazoncognito.com/login?response_type=token&client_id=${aws_cognito_user_pool_client.frontend_app.id}&redirect_uri=https://dcli3b34ssmw2.cloudfront.net/login-redirect"
}
