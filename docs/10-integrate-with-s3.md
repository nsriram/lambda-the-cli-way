# Integrate with S3
This section explains how integration can be achieved between the 2 AWS services - Lambda and S3.

### Events and Async Systems
Events can be produced by various AWS services (e.g., S3) for certain actions. Events allow systems to be designed 
for asynchronous architectures. Asynchronous architectures allow systems to scale better and events are used as a
medium of connecting various AWS Services.

> Note: Certain AWS Services (ELB, API Gateway, Lex, Alexa etc.,) can also invoke AWS Lambda synchronously. 

### AWS S3
AWS S3 (Simple Storage Service) is an object storage service that is highly scalable, available. Objects of varying 
size can be stored in buckets. AWS Lambda can be integrated with S3, and S3 can invoke lambda with events 
around the s3-object lifecycle. The list of S3 event types supported available here - [S3 Event Types](https://docs.aws.amazon.com/AmazonS3/latest/dev/NotificationHowTo.html#supported-notification-event-types). 
There are many realtime use-cases where S3 object lifecycle events will need further processing, 
starting from 
* uploading an image to s3 should be followed by the creation of its thumbnail,    
* uploading a document to s3 should be followed by its indexing    
* deletion of a document should notify some related individual 
* more examples .,

#### Integration Example
The lambda function for this example will upload a metadata *file* after processing the S3 object create event. The 
metadata file contain information about the object that was uploaded.   

#### (1) Create an S3 bucket
One of the constraints of S3 is, bucket names have to be universally unique. Hence, giving a universally unique name
to the bucket is important.

> Note : Earlier, when we created the IAM user, we granted the user privileges to create a bucket. 
> Since, we are using the same profile and IAM role (`lambda-cli-role`), the bucket creation should be possible. 
 
```
➜  export AWS_PROFILE=lambda-cli-user
➜  export BUCKET_NAME=lambda-cli-way-bucket-101
➜  aws s3 mb s3://$BUCKET_NAME --profile $AWS_PROFILE
➜  aws s3 ls 
```

The last command above should list the new bucket created. 

#### (2) Build a lambda for listening to S3 events and publishing to S3 back.

We will build a simple lambda that will listen to events from the S3 bucket created above, when new objects are uploaded.
On receiving the events, the lambda will upload a metadata file with details of the object like, key, size, etag and time of 
creation.

##### (2.1) AWS SDK Dependency

The lambda has a dependency on aws-sdk. Hence, we have to bundle the dependency as we did 
in [Packaging With Dependencies](06-packaging-lambda-with-dependencies.md).
```shell script
➜ mkdir s3-event-listener-lambda
➜ cd s3-event-listener-lambda
➜ npm init -y
➜ npm install aws-sdk
```

##### (2.2) Create Lambda function

Below snippet displays the lambda parsing the object and creating a new s3 object with the metadata. The lambda 
does the following

* `event` parameter is parsed to retrieve the object details. The S3 Event message structure can be referred here - 
[S3Event Message Structure](https://docs.aws.amazon.com/AmazonS3/latest/dev/notification-content-structure.html)
* We use the `aws-sdk` for javascript, to upload the object to the same bucket.
* Since we are uploading the object and its metadata to the same bucket, the events for the metadata file upload
will also be sent back to the lambda. These are ignored.
* Create the file in `s3-event-listener-lambda` folder.

> Note: The code below is escaped for `echo` command. If you are trying to copy paste, you can use the code 
> from [s3ObjectListener.js](../samples/09/s3-event-listener-lambda/s3ObjectListenerLambda.js) folder.

```shell script
➜  echo "const AWS = require('aws-sdk');
         const s3 = new AWS.S3();
         
         exports.handler = (event, context, callback) => {
           const uploadedObject = event.Records[0].s3.object;
           const objectKey = uploadedObject.key;
           if (\!objectKey.includes('metadata.txt')) {
             const metadata = {
               objectKey,
               objectSize: uploadedObject.size,
               objectETag: uploadedObject.eTag,
               objectCreationTime: event.Records[0].eventTime,
             };
             const bucketName = event.Records[0].s3.bucket.name;
             const metadataObjectKey = \`\${uploadedObject.key}-metadata.txt\`;
             const s3Params = {
               Bucket: bucketName,
               Key: metadataObjectKey,
               Body: JSON.stringify(metadata),
               ServerSideEncryption: 'AES256',
               ContentType: 'text/plain'
             };
             s3.putObject(s3Params).promise()
               .then((data) => {
                 console.log('Metadata uploaded');
                 console.log(data);
               }).catch((err) => {
               console.log('Error occured uploading');
               console.log(err);
             });
             callback(null, \`\${metadataObjectKey} uploaded successfully.\`);
           }
           callback(null, \`\${objectKey} ignored.\`);
         };
" > s3ObjectListenerLambda.js
```

#### (3) Bundle & Deploy the lambda

Bundle the `s3ObjectListenerLambda.js` with the `node_modules`. The `lambda-cli-role` IAM Role we created in  
[Hello World - Your First Lambda](04-hello-world-your-first-lambda.md) will be used here for S3 Access from Lambda.
 
> Note : This bundle `s3ObjectListenerLambda.js.zip` could be approximately 6-7MB in size. 
> This is larger in size, compared to accounting.js example we saw earlier.  

```shell script
➜  zip -r /tmp/s3ObjectListenerLambda.js.zip node_modules s3ObjectListenerLambda.js
➜  export LAMBDA_ROLE_ARN=arn:aws:iam::919191919191:role/lambda-cli-role
➜  export AWS_REGION=us-east-1
➜  export AWS_PROFILE=lambda-cli-user
➜  aws lambda create-function \
     --region "$AWS_REGION" \
     --function-name s3ObjectListenerLambda \
     --handler 's3ObjectListenerLambda.handler' \
     --runtime nodejs10.x \
     --role "$LAMBDA_ROLE_ARN" \
     --zip-file 'fileb:///tmp/s3ObjectListenerLambda.js.zip' \
     --profile "$AWS_PROFILE"
```
> Output : Successful creation of Lambda should receive a response similar to the one below.  
```json
{
    "FunctionName": "s3ObjectListenerLambda",
    "FunctionArn": "arn:aws:lambda:us-east-1:919191919191:function:s3ObjectListenerLambda",
    "Runtime": "nodejs10.x",
    "Role": "arn:aws:iam::919191919191:role/lambda-cli-role",
    "Handler": "s3ObjectListenerLambda.handler",
    "CodeSize": 6719835,
    "Description": "",
    "Timeout": 3,
    "MemorySize": 128,
    "LastModified": "2019-12-10T16:47:08.927+0000",
    "CodeSha256": "aBcDEeFG1H2IjKlM3nOPQrS4Tuv5W6xYZaB+7CdEf8g=",
    "Version": "$LATEST",
    "TracingConfig": {
        "Mode": "PassThrough"
    },
    "RevisionId": "a123b456-789c-0123-4def-g5hij6k789l0"
}
```
#### (4) Enable publishing events for object creation

##### (4.1) Define S3 Put Object Notification config file
Add Lambda invocation permission to S3 bucket, to invoke the lambda when objects are uploaded. 
```shell script
➜ aws lambda add-permission \
  --function-name s3ObjectListenerLambda \
  --statement-id lambda-cli-way-bucket-invoke \
  --action "lambda:InvokeFunction" \
  --principal s3.amazonaws.com \
  --source-arn arn:aws:s3:::$BUCKET_NAME \
  --profile "$AWS_PROFILE"
```
> output : 

```json
{
  "Statement": "{
    \"Sid\":\"lambda-cli-way-bucket-invoke\",
    \"Effect\":\"Allow\",
    \"Principal\":{\"Service\":\"s3.amazonaws.com\"},
    \"Action\":\"lambda:InvokeFunction\",
    \"Resource\":\"arn:aws:lambda:us-east-1:919191919191:function:s3ObjectListenerLambda\",
    \"Condition\":{
      \"ArnLike\":{\"AWS:SourceArn\":\"arn:aws:s3:::lambda-cli-way-bucket-101\"}
    }
  }"
}
```

##### (4.2) Define S3 Put Object Notification config file
Next step is to enable the S3 bucket to publish events, when objects are uploaded to it. We will create a notification 
json file to upload.

```shell script
➜ echo '{
  "LambdaFunctionConfigurations": [{
     "Id": "lambda-cli-s3-notification-id",
     "LambdaFunctionArn": "arn:aws:lambda:us-east-1:919191919191:function:s3ObjectListenerLambda",
     "Events": ["s3:ObjectCreated:*"]
  }]
}' > lambda-cli-s3-notification.json
```

##### (4.3) Create Put Bucket Notification Configuration for the bucket created earlier
Here we will use the 
`aws s3api` command of AWS CLI and create a `put-bucket-notification-configuration`.

```shell script
➜  aws s3api put-bucket-notification-configuration \
  --bucket $BUCKET_NAME \
  --notification-configuration file://lambda-cli-s3-notification.json \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION"
```
A quick recap of the steps, completed so far.
1. Create s3 bucket
2. Create a lambda to listen for s3 object put events _(bundled with aws js sdk)_
3. Add Lambda invocation permission to S3 bucket
4. Create Put Bucket Notification Configuration for the bucket

#### (5) Upload object to S3
We will create an object in S3 and see if the Lambda executes and creates a metadata file.

```shell script
➜  echo "hello Lambda CLI world" > helloworld.txt
➜  aws s3api put-object --bucket $BUCKET_NAME --key helloworld.txt --body helloworld.txt --profile "$AWS_PROFILE"
```
> output: Will be an etag of the uploaded object

```json
{
    "ETag": "\"a12b3cd45e67f890g1234567hij8901k\""
}
```
#### (6) Check for metadata file
Listing the object in the bucket will display the `helloworld.txt` file and also `helloworld.txt-metadata.txt` file.

```shell script
aws s3api list-objects --bucket  $BUCKET_NAME --profile $AWS_PROFILE
```
> output: Will list helloworld.txt and helloworld.txt-metadata.txt file

```json
{
    "Contents": [
        {
            "Key": "helloworld.txt",
            "LastModified": "2019-12-11T15:53:39.000Z",
            "ETag": "\"12abc3de4f567g89h1ab1234567c89d0\"",
            "Size": 23,
            "StorageClass": "STANDARD",
            "Owner": {
                "DisplayName": "wayneenterprises",
                "ID": "a12b3c4d5678ef90123456a12b3c4d5678ef90123456a12b3c4d5678ef90123456"
            }
        },
        {
            "Key": "helloworld.txt-metadata.txt",
            "LastModified": "2019-12-11T15:53:42.000Z",
            "ETag": "\"12abc3de4f567g89h1ab1234567c89d0\"",
            "Size": 142,
            "StorageClass": "STANDARD",
            "Owner": {
                "DisplayName": "wayneenterprises",
                "ID": "a12b3c4d5678ef90123456a12b3c4d5678ef90123456a12b3c4d5678ef90123456"
            }
        }
    ]
}
```

#### (7) Teardown
Lets remove the s3 objects, s3 bucket and AWS Lambda `s3ObjectListenerLambda`.

```shell script
➜ aws s3api delete-object --key helloworld.txt-metadata.txt --bucket "$BUCKET_NAME" --profile "$AWS_PROFILE"
➜ aws s3api delete-object --key helloworld.txt --bucket "$BUCKET_NAME" --profile "$AWS_PROFILE"
➜ aws s3api delete-bucket --bucket "$BUCKET_NAME" --profile "$AWS_PROFILE"
➜ aws lambda delete-function --function-name s3ObjectListenerLambda --profile "$AWS_PROFILE"
```


🏁 **Congrats !** You learnt a key integration between AWS Lambda and S3. 🏁

**Next**: [Integrate with Kinesis](11-integrate-with-kinesis.md) 
