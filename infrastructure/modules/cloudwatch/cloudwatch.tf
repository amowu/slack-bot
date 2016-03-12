
resource "aws_cloudwatch_event_rule" "SlackJobsBotScheduledEventRole" {
  name = "SlackJobsBotScheduledEventRole"
  schedule_expression = "rate(1 hour)"
}

resource "aws_cloudwatch_event_rule" "SlackEarthquakeBotScheduledEventRole" {
  name = "SlackEarthquakeBotScheduledEventRole"
  schedule_expression = "rate(5 minutes)"
}
