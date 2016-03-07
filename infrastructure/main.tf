
provider "aws" {
  region = "us-east-1"
}

module "dynamodb" {
  source = "./modules/dynamodb"
}

module "iam" {
  source = "./modules/iam"
  dynamoDBTableARN = "${module.dynamodb.dynamoDBTableARN}"
}

output "lambdaFunctionRoleARN" {
  value = "${module.iam.lambdaFunctionRoleARN}"
}
