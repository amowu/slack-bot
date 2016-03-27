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

### Earthquake Bot

coming soon...

![slack_earthquake](https://cloud.githubusercontent.com/assets/559351/13821950/c9bffd80-ebde-11e5-8792-058ee814aae1.png)

### Google Bot

1. get Google Graph Knowledge API (WIP)
2. add a Slack Slash Commands (WIP)
3. function.json.example -> function.json (WIP)
4. coming soon...

### Jobs Bot

1. put item to Jobs table (WIP)
2. setup scheduled event source for Lambda function (WIP)
3. duplicate function.json.example and rename to function.json, copy and paste your Slack channel webhook URL to function.json (WIP)
4. coming soon...

![slack_jobs](https://cloud.githubusercontent.com/assets/559351/13821931/b100fcb8-ebde-11e5-9b3f-63b672d27764.png)

### Movie Bot

coming soon...

### Translate Bot

coming soon...
