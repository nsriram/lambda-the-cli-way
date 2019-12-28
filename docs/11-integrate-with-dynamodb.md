# Integrate with DynamoDB
This section will provide a walk through on integration between the AWS Lambda and DynamoDb

### DynamoDB
AWS DynamoDB is a fully managed NoSQL Database that provided high performance and is scalable. Similar to other services
like Kinesis, S3 etc., DynamoDB also reduces the administrative overhead for teams and lets them focus on building applications.
#### A quick overview of DynamoDB
Similar to any database system Tables, Items, Attributes, Primary Keys and Indexes form the core concepts for DynamoDB.
Scalar types _(number, string, binary, Boolean, and null)_ are the supported types in DynamoDB.  DynamoDB also supports 
Lists, Maps & Sets that can be persisted in JSON format. Unlike SQL, table definitions for creating them are provided
in the form of JSON. Data is managed (insert, update, delete) as well in the form of JSON.  
Data is stored in DynamoDB in the form of Partitions. Partitions are create dynamically to handle scalability. 
AWS DynamoDB has a lot more features built-in to address large scale system needs. 

#### Integration Example
AWS Lambda can interact with DynamoDB in 2 ways.
> 1. Synchronous - Like any application accessing NoSQL database, AWS Lambda functions can access DynamoDB to 
query, store, retrieve data from its tables.
> 2. Event Source Mapping - AWS Lambda can listen to events from DynamoDB and process them. For this, 'event streaming' 
can be enabled in DynamoDB tables & an event source mapping similar to our earlier integrations like S3, Kinesis can be 
setup.

Our example will focus on the second type, listening to DynamoDB Stream Event and logging them on the console. 
We can view the logs using AWS CloudWatch logs.
 

#### (1) DynamoDB Setup
In this section we will create a DynamoDb table and enable streams.

#### (1.1) Create DynamoDB table with streaming enabled
The table created will store Orders. We will have 2 attributes - Id and Amount. 

- The Id column will be od HASH key type _(used for partitioning by DynamoDB)_ and Amount will be a RANGE
- We will keep the provisioned throughput to a low value of 1, for both READ and WRITE
- The streaming of events will be enabled while creating the table. The events will only send the KEYS.

```
➜ export AWS_PROFILE=lambda-cli-user
➜ aws dynamodb create-table --table-name Orders \
  --attribute-definitions \
  AttributeName=Id,AttributeType=N \
  AttributeName=Amount,AttributeType=N \
  --key-schema AttributeName=Id,KeyType=HASH AttributeName=Amount,KeyType=RANGE\
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
  --stream-specification StreamEnabled=true,StreamViewType=KEYS_ONLY \
  --profile "$AWS_PROFILE"
```
> Output : 

```
{
    "TableDescription": {
        "AttributeDefinitions": [
            { "AttributeName": "Amount","AttributeType": "N" },
            { "AttributeName": "Id", "AttributeType": "N" }
        ],
        "TableName": "Orders",
        "KeySchema": [
            { "AttributeName": "Id", "KeyType": "HASH" },
            { "AttributeName": "Amount", "KeyType": "RANGE" }
        ],
        "TableStatus": "CREATING",
        "CreationDateTime": 1555566666.11,
        "ProvisionedThroughput": {
            "NumberOfDecreasesToday": 0, 
            "ReadCapacityUnits": 1,
            "WriteCapacityUnits": 1
        },
        "TableSizeBytes": 0,
        "ItemCount": 0,
        "TableArn": "arn:aws:dynamodb:us-east-1:919191919191:table/Orders",
        "TableId": "a1b2c3d4-5678-901e-123f-45g678901hij",
        "StreamSpecification": {
            "StreamEnabled": true,
            "StreamViewType": "KEYS_ONLY"
        },
        "LatestStreamLabel": "2019-12-28T16:03:22.940",
        "LatestStreamArn": "arn:aws:dynamodb:us-east-1:919191919191:table/Orders/stream/2019-01-01T00:00:00.000"
    }
}
```

##### (1.2) Set Stream ARN
The value of `LatestStreamArn` from the table creation response will be used for event source mapping later. 
Let's export it.

```
➜ export DYNAMODB_STREAM_ARN="arn:aws:dynamodb:us-east-1:919191919191:table/Orders/stream/2019-01-01T00:00:00.000"
```

#### (2) Build and deploy the lambda, to log DynamoDB events
We will build a simple lambda that will process DynamoDB stream events and log them. 

##### (2.1) Sample DynamoDB Stream Event
DynamoDB Stream records read by Lambda, have the format mentioned below. Since we enabled only `KEYS_ONLY` as 
StreamViewType, the `Records.dynamodb.Keys` will only have the `Keys`. The dynamoDBEventLogger will log these keys.

```
{
  "Records": [
    {
      "eventID":"123a34bcdefgh56ij7890k12l34567",
      "eventName":"INSERT",
      "eventVersion":"1.0",
      "eventSource":"aws:dynamodb",
      "awsRegion":"us-east-1",
      "dynamodb":{
        "ApproximateCreationDateTime": 1555555511,
        "Keys":{
          "Amount":{
            "N":"1000"
          },
          "Id":{
            "N":"1"
          },
        },
        "SequenceNumber":"123456789012345678901",
        "SizeBytes":12,
        "StreamViewType":"KEYS_ONLY"
      },
      "eventSourceARN":"arn:aws:dynamodb:us-east-1:919191919191:table/Orders/stream/2019-01-01T00:00:00.000"
    }  
  ]
}
```
##### (2.2) Create the lambda
*Note:*
> The lambda will look for the data in key `record.dynamodb.Keys`. 

```
➜ mkdir dynamodb-event-logger-lambda
➜ cd dynamodb-event-logger-lambda
➜ echo "exports.handler =  async (event, context, callback) => {
  event.Records.forEach(record => console.log(record.dynamodb.Keys));
};" > dynamoDBEventLogger.js
```

##### (2.3) Bundle & Deploy the lambda

```
➜  export LAMBDA_ROLE_ARN=arn:aws:iam::919191919191:role/lambda-cli-role
➜  export AWS_REGION=us-east-1
➜  zip -r /tmp/dynamoDBEventLogger.js.zip dynamoDBEventLogger.js
➜  aws lambda create-function \
       --region "$AWS_REGION" \
       --function-name dynamoDBEventLogger \
       --handler 'dynamoDBEventLogger.handler' \
       --runtime nodejs10.x \
       --role "$LAMBDA_ROLE_ARN" \
       --zip-file 'fileb:///tmp/dynamoDBEventLogger.js.zip' \
       --profile "$AWS_PROFILE"
``` 
> Output: 

```
{
    "FunctionName": "dynamoDBEventLogger",
    "FunctionArn": "arn:aws:lambda:us-east-1:919191919191:function:dynamoDBEventLogger",
    "Runtime": "nodejs10.x",
    "Role": "arn:aws:iam::919191919191:role/lambda-cli-role",
    "Handler": "dynamoDBEventLogger.handler",
    "CodeSize": 304,
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

#### (3) Map DynamoDB to Lambda using event-source-mapping
We will create an event source mapping between `dynamoDBEventLogger` lambda and the DynamoDB Streams for `Orders` table.
```
➜  aws lambda create-event-source-mapping \
  --function-name dynamoDBEventLogger \
  --batch-size 1 \
  --starting-position LATEST \
  --event-source "$DYNAMODB_STREAM_ARN" \
  --profile "$AWS_PROFILE"
```
> Output: 
```
{
    "UUID": "abcde123-f78g-90h1-2i34-j5kl56789012",
    "BatchSize": 1,
    "MaximumBatchingWindowInSeconds": 0,
    "EventSourceArn": "arn:aws:dynamodb:us-east-1:919191919191:table/Orders/stream/2019-01-01T00:00:00.000",
    "FunctionArn": "arn:aws:lambda:us-east-1:919191919191:function:dynamoDBEventLogger",
    "LastModified": 1555556666.000,
    "LastProcessingResult": "No records processed",
    "State": "Creating",
    "StateTransitionReason": "User action"
}
```

#### (4) Put an Item in DynamoDB Table
We will trigger the lambda by putting an item in the Order table. This will fire an event to the lambda via 
the dynamodb stream and the event source mapping done.
 
##### (4.1) Put Item
```
➜  echo '{
     "Id": {"N": "1.0"},
     "Amount": {"N": "1000.0"}
 }' > newOrder.json

➜  aws dynamodb put-item --table-name Orders \
  --item file://newOrder.json \
  --profile "$AWS_PROFILE"
```
##### (4.2) View Lambda Log for dynamoDBEventLogger
Get the log group name, log stream name for dynamoDBEventLogger. 
The latest `LOG_STREAM_NAME` will have the execution details.
> Note: The LOG_STREAM_NAME has `$` symbol and needs to be escaped with backslash.

```
➜  export LOG_GROUP_NAME="/aws/lambda/dynamoDBEventLogger"
➜  aws logs describe-log-streams --log-group-name "$LOG_GROUP_NAME" --profile "$AWS_PROFILE"
➜  export LOG_STREAM_NAME="2019/12/13/[\$LATEST]aBcDEeFG1H2IjKlM3nOPQrS4Tuv5W6xYZaB"
➜  aws logs get-log-events --log-group-name "$LOG_GROUP_NAME" --log-stream-name "$LOG_STREAM_NAME"
```

Above commands with proper values should display the message "Hello, Lambda CLI World" in CloudWatch logs.

```
{
    "timestamp": 1234567890123,
    "message": "2019-12-13T00:00:00.000Z\11111111-aaaa-bbbb-cccc-1234567890\tINFO\tHello, Lambda CLI World\n",
    "ingestionTime": 1234567890123
}
```

#### (5) Teardown
Lets remove the DynamoDB table as it will not be used further.

```
➜  aws dynamodb delete-table --table-name "Orders" --profile "$AWS_PROFILE"
```

🏁 **Congrats !** You learnt a key integration of AWS Lambda with DynamoDB 🏁

**Next**: [Integrate with APIGateway](12-integrate-with-api-gateway.md) 
