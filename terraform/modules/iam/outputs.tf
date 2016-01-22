
output "lambda_function_id" {
  value = "${aws_iam_role.lambda_function.arn}"
}