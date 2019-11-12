# IAM Account Setup (for tutorial purpose)

### AWS IAM Profile
It is an AWS best practice to create individual IAM Users for specific activities. 
Through IAM, user permissions can be restricted to the required AWS resources and actions. 
For this tutorial series, we will create a separate IAM User, `lambda-cli-user`.

Following sections will walk through the steps required to create `lambda-cli-user` and assigning specific permissions. 
This will enable `lambda-cli-user` to perform operations specific to AWS Lambda.  

> Note: It is assumed that you have the admin AWS user configured for performing CLI activities, related to IAM.

####(1) Create IAM  user
```
➜  export AWS_IAM_USER=lambda-cli-user
➜  aws iam create-user --user-name ${AWS_IAM_USER}
```
> output
```
{
    "User": {
        "Path": "/",
        "UserName": "lambda-cli-user",
        "UserId": "ABCDEABCDEABCDEABCDEA",
        "Arn": "arn:aws:iam::919191919191:user/lambda-cli-user",
        "CreateDate": "2019-01-01T12:00:00Z"
    }
}
```

####(2) Create login profile 
Create a login profile and set the password. This will enable the CLI access for th IAM user.
This command specifies that the user need not reset their password after creation. 

- Please change the password to your convenience. _(Min 8 characters, 1 uppercase, 1 special character, 1 )_
e.g., `My\$ecretpassw0rd`. You need to escape special characters on console.
- It is not recommended to set password in plain text on console. You can use password managers or 
source a simple shell script to set the `AWS_IAM_PASSWORD` environment variable.

```
➜  export AWS_IAM_PASSWORD=My\$ecretlambdapr0file (or)
➜  export AWS_IAM_PASSWORD=<your_own_password>
➜  aws iam create-login-profile --user-name ${AWS_IAM_USER} --password ${AWS_IAM_PASSWORD} --no-password-reset-required
```
> output
```
{
    "LoginProfile": {
        "UserName": "lambda-cli-user",
        "CreateDate": "2019-01-01T12:00:10Z",
        "PasswordResetRequired": false
    }
}
```

####(3) Create access key and secret key
Create active access key and secret key combination for the IAM user. It is advised to keep a note of 
the Access Key and Secret key returned in response.

```
➜  aws iam create-access-key --user-name ${AWS_IAM_USER}
```
> Output
```
{
    "AccessKey": {
        "UserName": "lambda-cli-test-user",
        "AccessKeyId": "ABCDEABCDEABCDEABCDEA",
        "Status": "Active",
        "SecretAccessKey": "AbcdEF1ghijK+lMNOPQ2+Rs3ST4uvwXyzaBcde5f",
        "CreateDate": "2019-01-01T12:00:20Z"
    }
}
```


####(4) Grant AWS Lambda permissions to IAM user
We will attach the `AWSLambdaFullAccess` policy to the `lambda-cli-user` user. This policy grants 
a lot more permissions, beyond permissions for executing basic lambda functions. 
We will need those permissions for the upcoming integration tasks with S3, DynamoDB, Kinesis etc., 
The document here from AWS, [Identity-based IAM Policies for AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/access-control-identity-based.html) 
outlines in detail different permission combinations associated with AWS Lambda. 

```
➜  aws iam attach-user-policy --user-name ${AWS_IAM_USER} --policy-arn arn:aws:iam::aws:policy/AWSLambdaFullAccess
```

This command has no output _(you can try running this with `--debug` on CLI as well, but there is no output)_. 
To ensure the role got attached to the user, you can list the user's attached policies as below.

```
➜  aws iam list-attached-user-policies --user-name lambda-cli-user
{
    "AttachedPolicies": [
        {
            "PolicyName": "AWSLambdaFullAccess",
            "PolicyArn": "arn:aws:iam::aws:policy/AWSLambdaFullAccess"
        }
    ]
}
``` 

####(5) Add IAM user configuration to CLI config
- Add the following entry to `~/.aws/credentials` _(replace the values with the values you got from Step 3 above)_
```
[default]
aws_access_key_id = ABCDEABCDEABCDEABCDEA
aws_secret_access_key = AbcdEF1ghijK+lMNOPQ2+Rs3ST4uvwXyzaBcde5f
```

- Add the following entry to `~/.aws/config` _(replace the values with the values you got from Step 3 above)_
> Note: Here the profile name configured is `lambda-cli-user` and the region is `us-east-1`.  

```
[profile lambda-cli-user]
region = us-east-1
```

####(6) List AWS Lambda functions using IAM User
At this point you should be able to use the IAM user for performing AWS Lambda related operations. 
We will set the AWS_PROFILE to `lambda-cli-user` and user `aws lambda` cli.

```
➜  export AWS_PROFILE=lambda-cli-user
➜  aws lambda list-functions --profile lambda-cli-user
``` 

You should see an output listing empty list of functions, or the ones your IAM user has access to. 


🏁 **Congrats !** You got your AWS IAM User created and granted the user permissions to use AWS Lambda. 🏁

**Next**: [Hello World - Your First Lambda](03-hello-world-your-first-lambda.md)