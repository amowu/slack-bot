
module "iam" {
  source = "./modules/iam"
}

output "lambdaFunctionRoleARN" {
  value = "${module.iam.lambdaFunctionRoleARN}"
}
