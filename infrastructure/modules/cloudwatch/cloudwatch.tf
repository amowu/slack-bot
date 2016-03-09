
resource "aws_cloudwatch_event_rule" "SlackBotScheduledEventRole" {
  name = "SlackBotScheduledEventRole"
  schedule_expression = "rate(1 hour)"
}
