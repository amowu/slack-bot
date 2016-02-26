output "lambda_function_arn" {
  value = "${aws_iam_role.lambda_function.arn}"
}
