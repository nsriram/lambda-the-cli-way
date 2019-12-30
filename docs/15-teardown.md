# Teardown

This is the last section in the **'Lambda the CLI way'** series. As we progressed through various sections, we have
been deleting all the resources created in them (e.g., lambdas, s3 assets, kinesis queues etc.,)

At this point the 2 key resources that we have to remove are
1. IAM Role `lambda-cli-role`
2. IAM User `lambda-cli-user`

#### (1) Remove IAM Role
We will remove the attached role policies and then the IAM role.

```shell script
➜ aws iam detach-role-policy \
    --role-name lambda-cli-role \
    --policy-arn "arn:aws:iam::aws:policy/AWSLambdaFullAccess" \
    --profile default 

➜ aws iam detach-role-policy \
    --role-name lambda-cli-role \
    --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaKinesisExecutionRole" \ 
    --profile default

➜ aws iam delete-role \
    --role-name lambda-cli-role \
    --profile default
```

#### (2) Remove IAM User
We will remove the login profile, detach the policies, delete the access keys and will  
finally remove the IAM User `lambda-cli-user`.

```shell script
➜ aws iam detach-user-policy \
    --policy-arn "arn:aws:iam::aws:policy/AWSLambdaFullAccess" \
    --user-name lambda-cli-user

➜ aws iam detach-user-policy \
    --policy-arn "arn:aws:iam::aws:policy/AmazonKinesisFullAccess" \
    --user-name lambda-cli-user

➜ aws iam detach-user-policy \
    --policy-arn "arn:aws:iam::aws:policy/AmazonAPIGatewayAdministrator" \
    --user-name lambda-cli-user

➜ aws iam delete-login-profile \
    --user-name lambda-cli-user
```
> **Note**: For deleting the access key, you will need to refer to `~/.aws/credentials` file for `lambda-cli-user`.

```shell script
➜ aws iam delete-access-key \
    --user-name lambda-cli-user \
    --access-key-id ABCDEABCDEABCDEABCDEA \
    --profile default

➜ aws iam delete-user \
      --user-name lambda-cli-user \
      --profile default
```

🏁 **Congrats !** This completes the Lambda, the CLI Way series 🏁 
