# Version Lambda

This section explains how to version the lambda code. We will use the `helloLambdaCLIWorld.js` lambda to version from (3).

#### (1) Publish Version for helloLambdaCLIWorld
Lets version the `helloLambdaCLIWorld` lambda.

```
aws lambda publish-version \
       --function-name helloLambdaCLIWorld \
       --profile "$AWS_PROFILE"
```  
> output : Notice the version number "1" at the end of FunctionArn.
 
```
{
    "FunctionName": "helloLambdaCLIWorld",
    "FunctionArn": "arn:aws:lambda:us-east-1:919191919191:function:helloLambdaCLIWorld:1",
    "Runtime": "nodejs10.x",
    "Role": "arn:aws:iam::919191919191:role/lambda-cli-role",
    "Handler": "helloLambdaCLIWorld.handler",
    "CodeSize": 334,
    "Description": "",
    "Timeout": 3,
    "MemorySize": 128,
    "LastModified": "2019-11-18T16:15:54.586+0000",
    "CodeSha256": "aBcDEeFG1H2IjKlM3nOPQrS4Tuv5W6xYZaB+7CdEf8g=",
    "Version": "1",
    "TracingConfig": {
        "Mode": "PassThrough"
    },
    "RevisionId": "123b9999-a1bb-1234-9a3b-777r2220a111"
}
```

#### Change helloLambdaCLIWorld.js
Following command will create a nodejs AWS Lambda function responding 'Hello Lambda CLI World (v2)'.

```
➜  echo "exports.handler =  async (event) => {
  const payload = {
    date: new Date(),
    message: 'Hello Lambda CLI World (v2)'
  };
  return JSON.stringify(payload);
};" > helloLambdaCLIWorld.js
```

#### (2) Compress the lambda source file 
```
➜  zip -r /tmp/helloLambdaCLIWorld.js.zip helloLambdaCLIWorld.js
```

#### (3) Deploy the lambda with a new version
We will use `update-function-code` instead of create-function to update the source code of HelloCLIWorldLambda.

```
➜  export AWS_REGION=us-east-1
➜  export AWS_PROFILE=lambda-cli-user
➜  aws lambda update-function-code \
       --function-name helloLambdaCLIWorld \
       --zip-file 'fileb:///tmp/helloLambdaCLIWorld.js.zip' \
       --profile "$AWS_PROFILE"
``` 

#### (4) Version the updated Lambda
We will update the version of the lambda to `v2`

```
aws lambda publish-version \
       --function-name helloLambdaCLIWorld \
       --profile "$AWS_PROFILE"
``` 

#### (5) List all versions for the function
We can list both versions of the helloLambdaCLIWorld as below.

```
aws lambda list-versions-by-function --function-name helloLambdaCLIWorld --profile "$AWS_PROFILE"
```

#### (6) Invoke specific versions

We can invoke both version 1 and version 2 as below.

```
# Invoke version 1
➜  aws lambda invoke --function-name helloLambdaCLIWorld --profile "$AWS_PROFILE" --qualifier 1 --log-type Tail --payload '{}' outputfile.txt

# Invoke version 2
➜  aws lambda invoke --function-name helloLambdaCLIWorld --profile "$AWS_PROFILE" --qualifier 2 --log-type Tail --payload '{}' outputfile.txt

```

The output will be as below, accordingly (`cat output.txt`).

```
//v1
"{\"date\":\"2019-11-18T16:35:58.554Z\",\"message\":\"Hello Lambda CLI World\"}"%

//v2
"{\"date\":\"2019-11-18T16:36:11.588Z\",\"message\":\"Hello Lambda CLI World (v2)\"}"%

``` 

🏁 **Congrats !** You versioned your Lambda functions, listed them and invoked specific versions successfully. 🏁

**Next**: [Managing Your Lambda](08-managing-lambda.md)