# Hello World - Your First Lambda

This section explains how to deploy and invoke a lambda function. Examples here will use Node JS as the runtime. 
AWS Lambda supports other runtimes (Python, Ruby, Java, Go lang, .net) also. The document here
[AWS Lambda Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) list them in detail.

#### (1) Create lambda function
Following command will create a simple nodejs AWS Lambda function handler.

```
➜  echo "exports.handler =  async (event) => {
  const payload = {
    date: new Date(),
    message: 'Hello Lambda CLI World'
  };
  return JSON.stringify(payload);
};" > helloLambdaCLIWorld.js
```

Note:
- A `handler` module should be exported by the lambda js file.
- The `handler` function is async and takes an `event` object. The `event` object contains the request data sent by the caller. 
- The function returns a JSON with current timestamp and _Hello Lambda CLI World_ message.

#### (2) Compress the lambda source file
Packaging the .js file containing the lambda, is done via compression. Following step will compress the lambda js file. 

```
➜  zip -r /tmp/helloLambdaCLIWorld.js.zip helloLambdaCLIWorld.js
```

#### (3) Create an IAM Role for Lambda execution
For executing the lambda, it should be associated with a basic IAM Role, `AWSLambdaBasicExecutionRole`. IAM Roles
need policy document. Next sections will create a policy document and an IAM role.

##### (3.1) Create policy document file
```
➜  echo '{
   "Version": "2012-10-17",
   "Statement": [
   {
     "Effect": "Allow",
     "Principal": {
        "Service": "lambda.amazonaws.com"
     },
   "Action": "sts:AssumeRole"
   }
 ]
}' > lambdaAssumeRolePolicyDocument.json
```
 
##### (3.2) Create IAM Role attaching the policy document
Here, we create the `lambda-cli-role` and attach the policy document above. 
 
> Note: Create the IAM Role and attaching policy using your default root account. Note the `--profile default`. 

```
➜  aws iam create-role --role-name lambda-cli-role \
  --assume-role-policy-document file://lambdaAssumeRolePolicyDocument.json --profile default                     
```
> output
```
{
    "Role": {
        "Path": "/",
        "RoleName": "lambda-cli-role",
        "RoleId": "ABCDEFGHIJABCD9ZYXWV",
        "Arn": "arn:aws:iam::919191919191:role/lambda-cli-role",
        "CreateDate": "2019-01-01T12:00:00Z",
        "AssumeRolePolicyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "lambda.amazonaws.com"
                    },
                    "Action": "sts:AssumeRole"
                }
            ]
        }
    }
}
```
`Arn` key in the response is the 'Amazon Resource Name'. The role we created `lambda-cli-role` can be referred
as ARN `arn:aws:iam::919191919191:role/lambda-cli-role`.
```
➜  export LAMBDA_ROLE_ARN=arn:aws:iam::919191919191:role/lambda-cli-role 
```
##### (3.3) Attach role policies
We also will attach the following permissions. This is to enable the lambdas for integrating with other AWS services, 
in coming sections.

1. `AWSLambdaFullAccess`
2. `AWSLambdaKinesisExecutionRole`

```
➜  aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AWSLambdaFullAccess \
  --role-name lambda-cli-role --profile default

➜  aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaKinesisExecutionRole \
  --role-name lambda-cli-role --profile default
```

#### (4) Deploy the lambda
The compressed lambda file is deployed using CLI to the region configured in the profile. We will use the compressed 
lambda file, the role ARN for the IAM created, the `lambda-cli-user` profile 
> Note : We will directly upload the lambda function and will not use S3.

```
➜  export AWS_REGION=us-east-1
➜  export AWS_PROFILE=lambda-cli-user
➜  aws lambda create-function \
       --region "$AWS_REGION" \
       --function-name helloLambdaCLIWorld \
       --handler 'helloLambdaCLIWorld.handler' \
       --runtime nodejs10.x \
       --role "$LAMBDA_ROLE_ARN" \
       --zip-file 'fileb:///tmp/helloLambdaCLIWorld.js.zip' \
       --profile "$AWS_PROFILE"
``` 

> output

```
{
    "FunctionName": "helloLambdaCLIWorld",
    "FunctionArn": "arn:aws:lambda:us-east-1:919191919191:function:helloLambdaCLIWorld",
    "Runtime": "nodejs10.x",
    "Role": "arn:aws:iam::919191919191:role/lambda-cli-role",
    "Handler": "helloLambdaCLIWorld.handler",
    "CodeSize": 339,
    "Description": "",
    "Timeout": 3,
    "MemorySize": 128,
    "LastModified": "2019-01-01T12:00:00.370+0000",
    "CodeSha256": "aBcDEeFG1H2IjKlM3nOPQrS4Tuv5W6xYZaB+7CdEf8g=",
    "Version": "$LATEST",
    "TracingConfig": {
        "Mode": "PassThrough"
    },
    "RevisionId": "a123b456-789c-0123-4def-g5hij6k789l0"
}
```

#### (5) Invoke the lambda

```
➜  aws lambda invoke --function-name helloLambdaCLIWorld --log-type Tail --payload '{}' outputfile.txt --profile "$AWS_PROFILE"
➜  cat outputfile.txt
```

You should see the following output of executing the lambda function.
> output
```
"{\"date\":\"2019-01-01T12:00:00.000Z\",\"message\":\"Hello Lambda CLI World\"}"
```

🏁 **Congrats !** You deployed your first AWS Lambda function and invoked it successfully. 🏁

**Next**: [Packaging With Dependencies](04-view-lambda-logs.md)
