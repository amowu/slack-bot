
output "dynamoDBTableARN" {
  value = "${aws_dynamodb_table.jobsDynamoDBTable.arn}"
}
