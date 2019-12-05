# Integrate with S3

### Overview
AWS S3 (Simple Storage Service) is an object storage service that is highly scalable, available. Objects of varying 
size can be stored in buckets. AWS Lambda can be integrated with S3 to listen to events around the object lifecycle.
The list of events supported by S3 are available here [S3 Event Types](https://docs.aws.amazon.com/AmazonS3/latest/dev/NotificationHowTo.html#supported-notification-event-types).

There are many realtime use-cases where S3 object lifecycle events will need further processing, starting from 
> uploading an image to s3 should be followed by the creation of its thumbnail,    
> uploading an document to s3 should be followed by its indexing    
> deletion of a document should notify some related individual etc.,

This section will walk-through 'Lambda - S3' integration using a simple example of creating a metadata *file*, 
when an object is uploaded.

#### (1) Create an S3 bucket
#### (2) Enable publishing events for object creation
#### (3) Build a lambda for listening to S3 events and publishing to S3 back 
#### (4) Deploy the lambda
#### (5) Upload object to S3
#### (6) Check for metadata file

🏁 **Congrats !** You learnt a lot of basic functions to manage your Lambda. 🏁
**Next**: [Integrate with Kinesis](09-integrate-with-kinesis.md) 
