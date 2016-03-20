
provider "aws" {
  region = "us-east-1"
}

module "dynamodb" {
  source = "./modules/dynamodb"
}

module "iam" {
  source = "./modules/iam"
}

module "cloudwatch" {
  source = "./modules/cloudwatch"
}

output "lambdaFunctionRoleARN" {
  value = "${module.iam.lambdaFunctionRoleARN}"
}
