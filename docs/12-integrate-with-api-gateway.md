# Integrate with API Gateway
This section will provide a walk through on integration between AWS Lambda and Amazon API gateway. Lambda functions 
can be exposed as APIs using API Gateway  

### Amazon API Gateway
Amazon API Gateway is another managed service from AWS, that helps developers in exposing their applications as APIs. It
also takes away the considerable operational overhead of managing API related functionality like traffic management,
monitoring, securing APIs, throttling and more.  Three types of APIs can be exposed via API Gateways -
1. HTTP APIs
2. REST APIs
3. Websocket APIs   
> Our example will focus around API Gateway's REST API to expose a Lambda function.

#### Integration Example
We will integrate the API Gateway's REST API to backend AWS Lambda function. When the API Gateway's REST API 
is accessed as URL (using `curl`), lambda will be invoked by API Gateway and the response from Lambda _(current time)_
will be returned to the user. 

#### (1) Amazon API Gateway Setup
We will setup a REST API, with a GET HTTP Method returning a JSON. In the next steps, currentTimeLambda will be configured 
behind this gateway setup.
  
##### (1.1) Create REST API
```
➜ export AWS_PROFILE=lambda-cli-user 
➜ export AWS_REGION=us-east-1
➜ aws apigateway create-rest-api \
  --name "TimeGateway" \
  --description "API gateway for Time related functions" \
  --region "$AWS_REGION" \
  --profile "$AWS_PROFILE" 
```
> Output:
```
{
    "id": "a1bc2de3fg",
    "name": "TimeGateway",
    "description": "API gateway for Time related functions",
    "createdDate": 1555555555,
    "apiKeySource": "HEADER",
    "endpointConfiguration": {
        "types": [
            "EDGE"
        ]
    }
}
```

The `id` field in the output is the REST Api ID. Lets export the ID.
```
➜ export REST_API_ID=a1bc2de3fg
```
##### (1.2) Create Resource
Lets create a resource with name 'Time', in the TimeGateway.

##### (1.3) Add HTTP GET Method to Resource
Adding a GET method to the REST Api is a 2-step process. First we need the root path id and then we need to add GET. 
Following will get the Path ID for root path (`/`).

```
➜ aws apigateway get-resources \ 
  --rest-api-id $REST_API_ID \
  --profile "$AWS_PROFILE"
```

> Output:

```
{"items": [{
  "id": "abcde12fg3",
  "path": "/"
}]}

```

Let's add a HTTP GET method to the root path.

```
➜ export RESOURCE_ID=abcde12fg3
➜ aws apigateway put-method \
  --rest-api-id $REST_API_ID \
  --resource-id $RESOURCE_ID \
  --http-method GET \
  --authorization-type NONE \
  --region "$AWS_REGION" \
  --profile "$AWS_PROFILE"
```
> Output:
```
{
  "httpMethod": "GET",
  "authorizationType": "NONE",
  "apiKeyRequired": false
}
```
 
##### (1.4) Add HTTP GET Method Response to Resource
We will configure the response type for the GET HttpMethod we created in previous step. 

```
➜ aws apigateway put-method-response \
  --rest-api-id "$REST_API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method GET \
  --status-code 200 \
  --response-models application/json=Empty \
  --region "$AWS_REGION" \
  --profile "$AWS_PROFILE"
```
> Output: 
```
{
    "statusCode": "200",
    "responseModels": {
        "application/json": "Empty"
    }
}
```

#### (2) Build and deploy the current time lambda
We will create a simple lambda function to return current time.
```
➜ mkdir current-time-lambda
➜ cd current-time-lambda
➜ echo "exports.handler =  async (event) => {
  const payload = {
    date: new Date()
  };
  return JSON.stringify(payload);
};" > currentTimeLambda.js
```
Let's deploy the lambda.

```
➜ export LAMBDA_ROLE_ARN=arn:aws:iam::919191919191:role/lambda-cli-role
➜ zip -r /tmp/currentTimeLambda.js.zip currentTimeLambda.js
➜ aws lambda create-function \
       --function-name currentTimeLambda \
       --handler 'currentTimeLambda.handler' \
       --runtime nodejs10.x \
       --role "$LAMBDA_ROLE_ARN" \
       --zip-file 'fileb:///tmp/currentTimeLambda.js.zip' \
       --region "$AWS_REGION" \
       --profile "$AWS_PROFILE"
```
> Output: 

```
{
    "FunctionName": "currentTimeLambda",
    "FunctionArn": "arn:aws:lambda:us-east-1:919191919191:function:currentTimeLambda",
    "Runtime": "nodejs10.x",
    "Role": "arn:aws:iam::919191919191:role/lambda-cli-role",
    "Handler": "currentTimeLambda.handler",
    "CodeSize": 330,
    "Description": "",
    "Timeout": 3,
    "MemorySize": 128,
    "LastModified": "2019-01-01T00:00:00.000+0000",
    "CodeSha256": "aBcDEeFG1H2IjKlM3nOPQrS4Tuv5W6xYZaB+7CdEf8g=",
    "Version": "$LATEST",
    "TracingConfig": {
        "Mode": "PassThrough"
    },
    "RevisionId": "123b9999-a1bb-1234-9a3b-777r2220a111"
}
```
Let's export the Lambda function ARN.
```
➜ export FUNCTION_ARN="arn:aws:lambda:us-east-1:919191919191:function:currentTimeLambda"
```

#### (3) Integrate HTTP GET Method to Current Time Lambda
We have created the REST API and the Current Time Lambda. Now, we will integrate them.

##### (3.1) HTTP GET Method Integration with Lambda
We will need the Function ARN from Lambda adn REST API Id, Resource ID from Gateway to configure the put integration.
```
➜ aws apigateway put-integration \
    --rest-api-id $REST_API_ID \
    --resource-id $RESOURCE_ID \
    --http-method GET \
    --type AWS \
    --integration-http-method POST \
    --uri arn:aws:apigateway:"$AWS_REGION":lambda:path/2015-03-31/functions/"$FUNCTION_ARN"/invocations \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE"
```
> *Note*: In above command, its important to have `--integration-http-method` as POST as, API gateway communicated 
 with Lambda using POST (event if the public API is GET). This is an expected behavior for API Gateway.
> Output: 
```
{
    "type": "AWS",
    "httpMethod": "GET",
    "uri": arn:aws:apigateway:"$AWS_REGION":lambda:path/2015-03-31/functions/"$FUNCTION_ARN"/invocations,
    "passthroughBehavior": "WHEN_NO_MATCH",
    "timeoutInMillis": 29000,
    "cacheNamespace": "abcde12fg3",
    "cacheKeyParameters": []
}
```

##### (3.2) HTTP GET Method Integration Response
The response type for the Put integration is configured next.

```
➜ aws apigateway put-integration-response \
    --rest-api-id $REST_API_ID \
    --resource-id $RESOURCE_ID \
    --http-method GET \
    --status-code 200 \
    --response-templates application/json="" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE"
```
> Output:
```
{
    "statusCode": "200",
    "responseTemplates": {
        "application/json": null
    }
}
```

#### (4) Add Permission to invoke Lambda from API Gateway
Permission needs to be set to invoke the Lambda from API Gateway. This is similar to the S3 invocation of lambda we did 
earlier.

```
➜ aws lambda add-permission \
    --function-name currentTimeLambda \
    --statement-id currentTimeLambda-permission \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:us-east-1:919191919191:$REST_API_ID/*/GET/" \
    --profile "$AWS_PROFILE"
``` 
>Output:
```
{
    "Statement": "{
      \"Sid\":\"currentTimeLambda-permission\",
      \"Effect\":\"Allow\",
      \"Principal\":{\"Service\":\"apigateway.amazonaws.com\"},
      \"Action\":\"lambda:InvokeFunction\",
      \"Resource\":\"arn:aws:lambda:us-east-1:919191919191:function:currentTimeLambda\",
      \"Condition\":{
          \"ArnLike\":{\"AWS:SourceArn\":\"arn:aws:execute-api:us-east-1:919191919191:abcd12efgh/*/GET/\"}
      }
    }"
}
```

#### (6) Create a stage
Create a stage with name 'prod' and deploy the API 

```
➜ aws apigateway create-deployment --rest-api-id $REST_API_ID --stage-name prod
```
> Output:
```
{
    "id": "a1b2cd",
    "createdDate": 1555555555
}
```
We will need the value of Deployment ID from above output.
```
➜ export DEPLOYMENT_ID="a1b2cd"
```
#### (6) Invoke GET API
Now, lets invoke the lambda using the API gateway public URL. We should the JSON response of current time.

```
➜ curl https://$REST_API_ID.execute-api.$AWS_REGION.amazonaws.com/prod
```
> Output:
```
{"time":"2019-01-01T00:00:00.000Z"}
```

#### (7) Teardown
Lets remove the API gateway resources, permission provided to lambda and currentTimeLambda.

```
// Remove currentTimeLambda permission
➜ aws lambda remove-permission --function-name currentTimeLambda \
    --statement-id currentTimeLambda-permission \
    --profile "$AWS_PROFILE"

// Remove prod stage deployment
➜ aws apigateway delete-stage --stage-name prod \
    --rest-api-id $REST_API_ID \
    --profile "$AWS_PROFILE"
➜ aws apigateway delete-deployment --rest-api-id $REST_API_ID \
    --deployment-id $DEPLOYMENT_ID \
    --profile "$AWS_PROFILE"

// Remove GET Method Integration, Response
➜ aws apigateway delete-integration-response --rest-api-id $REST_API_ID \
    --resource-id $RESOURCE_ID \
    --http-method GET \
    --status-code 200 \
    --profile "$AWS_PROFILE"
➜ aws apigateway delete-integration --rest-api-id $REST_API_ID \
    --resource-id $RESOURCE_ID \
    --http-method GET \
    --profile "$AWS_PROFILE"

// Remove GET Method, and Response
➜ aws apigateway delete-method-response --rest-api-id $REST_API_ID \
    --resource-id $RESOURCE_ID \
    --http-method GET \
    --status-code 200 \
    --profile "$AWS_PROFILE"
➜ aws apigateway delete-method --rest-api-id $REST_API_ID \
    --http-method GET \
    --resource-id $RESOURCE_ID \
    --profile "$AWS_PROFILE"

// Remove REST API
➜ aws apigateway delete-rest-api --rest-api-id $REST_API_ID \
    --profile "$AWS_PROFILE"

// Remove Lambda
➜ aws lambda delete-function \
    --function-name currentTimeLambda \
    --profile "$AWS_PROFILE"
```

🏁 **Congrats !** You learnt a key integration between AWS Lambda and Amazon API gateway 🏁

**Next**: [Serverless Application Model (SAM)](13-sam-cli.md) 
