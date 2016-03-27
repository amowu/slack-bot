
variable "region" {
  type = "string"
  default = "us-east-1"
}

provider "aws" {
  region = "${var.region}"
}

module "iam" {
  source = "./modules/iam"
}

module "api_gateway" {
  source = "./modules/api_gateway"
  region = "${var.region}"
  function = "arn:aws:lambda:us-east-1:647768359793:function:slack_google"
  role = "${module.iam.gatewayInvokeLambdaRoleARN}"
}

module "dynamodb" {
  source = "./modules/dynamodb"
}

module "cloudwatch" {
  source = "./modules/cloudwatch"
}

output "lambdaFunctionRoleARN" {
  value = "${module.iam.lambdaFunctionRoleARN}"
}
