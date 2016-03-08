
output "lambdaFunctionRoleARN" {
  value = "${aws_iam_role.slackBotRole.arn}"
}
