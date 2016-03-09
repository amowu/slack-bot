# Slack Bot

My Slack Bot collection with serverless infrastructure.

## Requirement

- [Node.js](https://nodejs.org) v4.x.x
- [Apex](http://apex.run) - a serverless infrastructure built on AWS Lambda.
- [Terraform](https://www.terraform.io) (optional) - a common configuration to launch infrastructure.
- [aws-cli](https://aws.amazon.com/cli/) (optional)

## Installation

```sh
$ git clone https://github.com/amowu/slack-bot.git
$ cd slack-bot
```

```sh
$ npm install
```

Setup AWS infrastructure with Terraform (optional):

```sh
$ apex plan
$ apex apply
...
Apply complete! Resources: 4 added, 0 changed, 0 destroyed.

Outputs:

  lambdaFunctionRoleARN = arn:aws:iam::<account>:role/lambda_function
```

Copy and paste `lambdaFunctionRoleARN` to `role` field in `project.json`.

```sh
$ apex deploy
```

## Usage

### Jobs Bot

1. put item to Jobs table (WIT)
2. setup scheduled event source for Lambda function (WIT)
3. duplicate function.json.example and rename to function.json, copy and paste your Slack channel webhook URL to function.json (WIT)
4. coming soon...
