
variable "region" {
  type = "string"
  default = "us-east-1"
}

variable "function" {
  type = "string"
}

variable "role" {
  type = "string"
}

resource "aws_api_gateway_rest_api" "SlackBotAPI" {
  name = "SlackBotAPI"
}

resource "aws_api_gateway_resource" "SlackBotAPIRootResource" {
  rest_api_id = "${aws_api_gateway_rest_api.SlackBotAPI.id}"
  parent_id = "${aws_api_gateway_rest_api.SlackBotAPI.root_resource_id}"
  path_part = "slashCommands"
}

resource "aws_api_gateway_method" "SlackBotAPIRootMethod" {
  rest_api_id = "${aws_api_gateway_rest_api.SlackBotAPI.id}"
  resource_id = "${aws_api_gateway_resource.SlackBotAPIRootResource.id}"
  http_method = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "200" {
  rest_api_id = "${aws_api_gateway_rest_api.SlackBotAPI.id}"
  resource_id = "${aws_api_gateway_resource.SlackBotAPIRootResource.id}"
  http_method = "${aws_api_gateway_method.SlackBotAPIRootMethod.http_method}"
  status_code = "200"
  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "SlackBotAPIRootIntegrationResponse" {
  rest_api_id = "${aws_api_gateway_rest_api.SlackBotAPI.id}"
  resource_id = "${aws_api_gateway_resource.SlackBotAPIRootResource.id}"
  http_method = "${aws_api_gateway_method.SlackBotAPIRootMethod.http_method}"
  status_code = "${aws_api_gateway_method_response.200.status_code}"
}

resource "aws_api_gateway_integration" "SlackBotAPIRootIntegration" {
  rest_api_id = "${aws_api_gateway_rest_api.SlackBotAPI.id}"
  resource_id = "${aws_api_gateway_resource.SlackBotAPIRootResource.id}"
  http_method = "${aws_api_gateway_method.SlackBotAPIRootMethod.http_method}"
  type = "AWS"
  integration_http_method = "POST"
  credentials = "${var.role}"
  uri = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${var.function}/invocations"
}

resource "aws_api_gateway_deployment" "SlackBotAPIRootDeployment" {
  depends_on = ["aws_api_gateway_integration.SlackBotAPIRootIntegration"]
  rest_api_id = "${aws_api_gateway_rest_api.SlackBotAPI.id}"
  stage_name = "dev"
}
