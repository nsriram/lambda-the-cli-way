# Managing Lambda Functions
This section explains various other operations associated with lambda.

#### (1) Lambda Alias
Lambdas can have aliases. The precondition is to have a lambda with valid version. 
##### (1.1) Create Alias 
Lets create an alias for `helloLambdaCLIWorld`.

```shell script
➜ aws lambda create-alias --function-name helloLambdaCLIWorld \
    --profile "$AWS_PROFILE" \
    --function-version "1" \
    --name "cliLambda"
```
> output : Notice the alias has an ARN of its own.
```json
{
  "AliasArn": "arn:aws:lambda:us-east-1:919191919191:function:helloLambdaCLIWorld:cliLambda",
  "Name": "cliLambda",
  "FunctionVersion": "1",
  "Description": "",
  "RevisionId": "a123b456-789c-0123-4def-g5hij6k789l0"
}
```
##### (1.2) List Aliases
The aliases for a lambda can be listed as below.

```shell script
➜ aws lambda list-aliases --function-name helloLambdaCLIWorld --profile "$AWS_PROFILE"
```  
> output : Notice the alias has an ARN of its own.

```json
{"Aliases": [{ 
  "AliasArn": "arn:aws:lambda:us-east-1:919191919191:function:helloLambdaCLIWorld:cliLambda",
  "Name": "cliLambda",
  "FunctionVersion": "1",
  "Description": "",
  "RevisionId": "123b9999-a1bb-3456-9a3b-777r2220a222"
}]}
```
##### (1.3) Update Alias
The alias can be updated to a different version of the lambda.
```shell script
➜ aws lambda update-alias --name cliLambda \
    --function-name helloLambdaCLIWorld \
    --profile "$AWS_PROFILE" \
    --function-version 2
```
> output : Notice the alias has an ARN of its own.
```json
{
  "AliasArn": "arn:aws:lambda:us-east-1:919191919191:function:helloLambdaCLIWorld:cliLambda",
  "Name": "cliLambda",
  "FunctionVersion": "2",
  "Description": "",
  "RevisionId": "a123b456-789c-0123-4def-g5hij6k789l0"
}
```
##### (1.4) Delete Alias
Following will delete the aliases that we created in last few steps.
```
➜ aws lambda delete-alias --function-name  helloLambdaCLIWorld --name cliLambda
```

#### (2) Lambda Account level information
Account level information like function count, code size etc., can be obtained as below.
```shell script
➜ aws lambda get-account-settings --profile "$AWS_PROFILE"
```
> output : Notice the ConcurrentExecutions and UnreservedConcurrentExecutions. This is our next topic.
```json
{
    "AccountLimit": {
        "TotalCodeSize": 60556036800,
        "CodeSizeUnzipped": 162144000,
        "CodeSizeZipped": 32426600,
        "ConcurrentExecutions": 1000,
        "UnreservedConcurrentExecutions": 1000
    },
    "AccountUsage": {
        "TotalCodeSize": 14122429,
        "FunctionCount": 28
    }
}
```

#### (3) Concurrent Executions
Concurrency is the number of instances in execution for a given lambda, at any given time. Concurrency 
limits are region specific.

##### (3.1) Reserve concurrency limit for lambda
Following command will reserve concurrency limit for a given function
```
➜  aws lambda put-function-concurrency \
    --function-name helloLambdaCLIWorld \
    --reserved-concurrent-executions 100 \
    --profile "$AWS_PROFILE"
```
> output : 
```
{ "ReservedConcurrentExecutions": 100 }
```
Now, if you look at UnreservedConcurrentExecutions in account settings, it would have reduced by 100 to 900.
```
➜  aws lambda get-account-settings --profile "$AWS_PROFILE"
{ 
  "AccountLimit": {
    "TotalCodeSize": 60556036800,
    "CodeSizeUnzipped": 162144000,
    "CodeSizeZipped": 32426600,
    "ConcurrentExecutions": 1000,
    "UnreservedConcurrentExecutions": 900 
  }, 
  "AccountUsage": {
    "TotalCodeSize": 14122429,
    "FunctionCount": 28
  }
}
```
##### (3.2) concurrency limit can be freed for lambda
```
➜  aws lambda delete-function-concurrency --function-name helloLambdaCLIWorld --profile "$AWS_PROFILE"
```
This will bring the UnreservedConcurrentExecutions back to 1000.  

#### (4) Delete a lambda
Lambda can be deleted as below. We will delete the formatCurrencyLambda created in (4).

```
➜  aws lambda delete-function --function-name helloLambdaCLIWorld --profile "$AWS_PROFILE"
``` 

🏁 **Congrats !** You learnt the basic functions for managing AWS Lambda. 🏁

**Next**: [Integrate with S3](09-integrate-with-s3.md)