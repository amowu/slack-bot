
## Apex boilerplate

 Boilerplate using [Terraform](https://www.terraform.io).

## Bootstrapping the environment

Assuming your AWS credentials are ready to go, first cd into the env's dir:

```
$ cd terraform/envs/stage
```

Next create an S3 bucket in your AWS account, this is where state will be stored. Once a bucket is created, configure Terraform to use it:

```
$ terraform remote config \
  -backend=s3 \
  -backend-config="bucket=mybucketname" \
  -backend-config="key=terraform/state/stage"
```

Get the modules (not sure why TF needs this for local modules):

```
$ terraform get
```

Run plan and you should see:

```
$ terraform plan
...
+ module.iam
    2 resource(s)
```

Finally run apply to make the changes:

```
$ terraform apply
...
Apply complete! Resources: 2 added, 0 changed, 0 destroyed.

Outputs:

  lambda_function_role_id = arn:aws:iam::<account>:role/lambda_function
```

The `lambda_function_role_id` is what you can use as the "role" in project.json. Once defined you can then run `apex deploy` and try it out with `apex invoke uppercase < request.json`. See the Apex wiki or `apex wiki` for more help.

Some day Apex may have tighter integration with Terraform which would get rid of this step.

## Badges

![](https://img.shields.io/badge/license-MIT-blue.svg)

---

> [tjholowaychuk.com](http://tjholowaychuk.com) &nbsp;&middot;&nbsp;
> GitHub [@tj](https://github.com/tj) &nbsp;&middot;&nbsp;
> Twitter [@tjholowaychuk](https://twitter.com/tjholowaychuk)
