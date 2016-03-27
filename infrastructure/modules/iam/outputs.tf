
output "lambdaFunctionRoleARN" {
  value = "${aws_iam_role.slackBotRole.arn}"
}

output "gatewayInvokeLambdaRoleARN" {
  value = "${aws_iam_role.gatewayInvokeLambdaRole.arn}"
}
